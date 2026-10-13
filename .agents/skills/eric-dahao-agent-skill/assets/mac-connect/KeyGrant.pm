package KeyGrant;
use strict;
use warnings;
use Fcntl qw(:DEFAULT :flock :mode);
use JSON::PP;
use MIME::Base64 qw(decode_base64 encode_base64);
use Digest::SHA qw(sha256_hex);

sub fail { die "DAHAO_$_[0]\n" }
sub ipv4 {
    my ($v) = @_;
    return 0 unless defined($v) && $v =~ /\A(?:[0-9]{1,3}\.){3}[0-9]{1,3}\z/;
    my @n = split /\./, $v;
    return 0 if grep { $_ > 255 || (length($_)>1 && /^0/) } @n;
    return ($n[0]==10 || ($n[0]==192 && $n[1]==168) || ($n[0]==172 && $n[1]>=16 && $n[1]<=31));
}
sub validate {
    my ($r) = @_;
    fail('REQUEST') unless ref($r) eq 'HASH';
    my @wanted = sort qw(schema request_id target_account target_ipv4 controller_ipv4 host_fingerprint public_key created_epoch accept_until_epoch duration_seconds);
    fail('REQUEST_FIELDS') unless join(',',sort keys %$r) eq join(',',@wanted);
    fail('REQUEST_VERSION') unless $r->{schema} == 1 && $r->{duration_seconds} == 3600;
    for my $k (@wanted) { fail('REQUEST_VALUE') if ref($r->{$k}) || !defined($r->{$k}); }
    fail('REQUEST_ID') unless $r->{request_id} =~ /\A[a-f0-9]{32}\z/;
    fail('ACCOUNT') unless $r->{target_account} =~ /\A[a-z_][a-z0-9_-]{0,31}\z/;
    fail('ADDRESS') unless ipv4($r->{target_ipv4}) && ipv4($r->{controller_ipv4}) && $r->{target_ipv4} ne $r->{controller_ipv4};
    fail('FINGERPRINT') unless $r->{host_fingerprint} =~ /\ASHA256:[A-Za-z0-9+\/]{43}\z/;
    fail('PUBLIC_KEY') unless $r->{public_key} =~ /\Assh-ed25519 ([A-Za-z0-9+\/]{68})\z/;
    my $b64 = $1;
    my $raw = decode_base64($b64);
    fail('PUBLIC_KEY_FORMAT') unless length($raw)==51 && substr($raw,0,19) eq pack('N',11).'ssh-ed25519'.pack('N',32) && encode_base64($raw,'') eq $b64;
    for my $k (qw(created_epoch accept_until_epoch)) { fail('TIME') unless $r->{$k} =~ /\A[0-9]{10}\z/; }
    fail('TIME_RANGE') unless $r->{accept_until_epoch} > $r->{created_epoch} && $r->{accept_until_epoch}-$r->{created_epoch} <= 86400;
    return $r;
}
sub utc {
    my @t = gmtime($_[0]);
    return sprintf('%04d%02d%02d%02d%02d%02dZ',$t[5]+1900,$t[4]+1,@t[3,2,1,0]);
}
sub grant_line {
    my ($r,$expiry) = @_;
    return 'restrict,from="'.$r->{controller_ipv4}.'",expiry-time="'.utc($expiry).'" '.$r->{public_key}.' dahao-'.$r->{request_id};
}
sub insert_bytes {
    my ($before,$line,$key) = @_;
    fail('KEY_ALREADY_PRESENT') if index($before,$key)>=0;
    # The leading newline is ours; removal of the full block restores exact bytes.
    return $before."\n".$line."\n";
}
sub remove_bytes {
    my ($before,$line) = @_;
    my $block = "\n".$line."\n";
    my $at = index($before,$block);
    return ($before,0) if $at<0;
    fail('MULTIPLE_GRANTS') if index($before,$block,$at+length($block))>=0;
    # A later key must not be joined onto an original unterminated last line.
    my $separator = $at>0 && substr($before,$at-1,1) ne "\n" && $at+length($block)<length($before) ? "\n" : '';
    substr($before,$at,length($block),$separator);
    return ($before,1);
}
sub read_handle {
    my ($fh) = @_;
    seek($fh,0,0) or fail('SEEK');
    my $s = '';
    while (1) {
        my $n = sysread($fh,my $chunk,16384);
        fail('READ') unless defined $n;
        last unless $n;
        $s .= $chunk;
        fail('FILE_TOO_LARGE') if length($s)>1048576;
    }
    return $s;
}
sub checked_stat {
    my ($path,$kind,$uid) = @_;
    my @s = lstat($path);
    fail('PATH_MISSING') unless @s;
    fail('UNSAFE_LINK') if S_ISLNK($s[2]);
    fail('UNSAFE_TYPE') unless $kind eq 'dir' ? S_ISDIR($s[2]) : S_ISREG($s[2]);
    fail('OWNER') unless $s[4]==$uid;
    fail('UNSAFE_MODE') if $s[2]&0022;
    fail('HARD_LINK') if $kind eq 'file' && $s[3]!=1;
    return @s;
}
sub safe_file {
    my ($path,$write,$create,$uid) = @_;
    my $flags = ($write ? O_RDWR : O_RDONLY) | O_NOFOLLOW;
    $flags |= O_CREAT | O_EXCL if $create;
    sysopen(my $fh,$path,$flags,0600) or fail('OPEN');
    binmode $fh;
    flock($fh,($write ? LOCK_EX : LOCK_SH)|LOCK_NB) or fail('BUSY');
    my @p = checked_stat($path,'file',$uid);
    my @f = stat($fh);
    fail('PATH_CHANGED') unless @f && $p[0]==$f[0] && $p[1]==$f[1];
    return $fh;
}
sub unchanged_path {
    my ($fh,$path,$uid) = @_;
    my @p = checked_stat($path,'file',$uid);
    my @f = stat($fh);
    fail('PATH_CHANGED') unless @f && $p[0]==$f[0] && $p[1]==$f[1];
}
sub write_all {
    my ($fh,$data) = @_;
    my $at = 0;
    while ($at < length $data) {
        my $n = syswrite($fh,$data,length($data)-$at,$at);
        fail('WRITE') unless defined($n) && $n>0;
        $at += $n;
    }
}
sub replace_locked {
    my ($fh,$path,$before,$after,$uid) = @_;
    unchanged_path($fh,$path,$uid);
    fail('CONCURRENT_CHANGE') unless read_handle($fh) eq $before;
    my $ok=eval {
        seek($fh,0,0) or fail('SEEK');
        write_all($fh,$after);
        truncate($fh,length($after)) or fail('TRUNCATE');
        fail('VERIFY_WRITE') unless read_handle($fh) eq $after;
        1;
    };
    if (!$ok) {
        my $restored=eval {
            unchanged_path($fh,$path,$uid);
            seek($fh,0,0) or fail('SEEK');
            write_all($fh,$before);
            truncate($fh,length($before)) or fail('TRUNCATE');
            fail('VERIFY_WRITE') unless read_handle($fh) eq $before;
            1;
        };
        fail($restored ? 'WRITE_ROLLED_BACK' : 'WRITE_RECOVERY_REQUIRED');
    }
}
sub append_locked {
    my ($fh,$path,$before,$after,$uid) = @_;
    unchanged_path($fh,$path,$uid);
    fail('CONCURRENT_CHANGE') unless read_handle($fh) eq $before;
    fail('NOT_APPEND') unless substr($after,0,length($before)) eq $before;
    seek($fh,0,2) or fail('SEEK');
    write_all($fh,substr($after,length($before)));
    fail('VERIFY_WRITE') unless read_handle($fh) eq $after;
}
sub receipt_bytes {
    return JSON::PP->new->canonical->encode($_[0])."\n";
}
sub parse_receipt {
    my ($bytes,$r) = @_;
    my $v = eval { JSON::PP->new->decode($bytes) };
    fail('RECEIPT') unless ref($v) eq 'HASH';
    fail('RECEIPT') unless join(',',sort keys %$v) eq join(',',sort qw(schema request_id state expiry_epoch line));
    fail('RECEIPT') unless $v->{schema}==1 && $v->{request_id} eq $r->{request_id} && $v->{state}=~/\A(?:prepared|granted|revoked)\z/;
    fail('RECEIPT') unless $v->{expiry_epoch}=~/\A[0-9]{10}\z/ && $v->{expiry_epoch}>$r->{created_epoch} && $v->{expiry_epoch}<=$r->{accept_until_epoch}+3600;
    fail('RECEIPT') unless $v->{line} eq grant_line($r,$v->{expiry_epoch});
    return $v;
}
1;
