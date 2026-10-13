#!/usr/bin/perl
use strict;
use warnings;
use FindBin;
use lib $FindBin::Bin;
use KeyGrant;
use JSON::PP;
use Digest::SHA qw(sha256_hex);
use Fcntl qw(:DEFAULT :mode);

sub fail { KeyGrant::fail($_[0]) }
sub capture {
    my @args = @_;
    open(my $fh,'-|',@args) or fail('COMMAND');
    local $/;
    my $s = <$fh> // '';
    close($fh) or fail('COMMAND');
    fail('COMMAND_SIZE') if length($s)>16384;
    return $s;
}
sub no_write_acl {
    my ($path) = @_;
    my $s = capture('/bin/ls','-lde',$path);
    # Default macOS home ACL may deny deletion. Never remove or rewrite ACLs.
    for my $line (split /\n/,$s) {
        fail('WRITE_ACL') if $line =~ /^\s*\d+:/ && $line =~ /\ballow\b/ && $line =~ /\b(?:write|append|delete|delete_child|add_file|add_subdirectory|writeattr|writeextattr|writesecurity|chown)\b/;
    }
}
sub validate_parent_chain {
    my ($home,$uid) = @_;
    my $p='';
    for my $part (split /\//,$home) {
        next unless length $part;
        $p.='/'.$part;
        my @s=lstat($p);
        fail('HOME_PATH') unless @s && S_ISDIR($s[2]) && !S_ISLNK($s[2]) && ($s[4]==0 || $s[4]==$uid) && !($s[2]&0022);
        no_write_acl($p);
    }
}
sub main {
    my ($mode,$request,$expected_hash)=@ARGV;
    fail('ARGS') unless @ARGV==3 && $mode =~ /\A(?:inspect|grant|revoke)\z/ && $expected_hash =~ /\A[a-f0-9]{64}\z/;
    fail('PLATFORM') unless $^O eq 'darwin';
    fail('ROOT') unless $< != 0 && $< == $>;
    my @pw=getpwuid($<);
    my ($account,$home)=@pw[0,7];
    fail('HOME_PATH') unless defined($home) && $home =~ m{\A/Users/[^\x00-\x1f]+\z};
    my @rs=lstat($request);
    fail('REQUEST_FILE') unless @rs && S_ISREG($rs[2]) && !S_ISLNK($rs[2]) && $rs[3]==1 && !($rs[2]&0022) && $rs[7]<16384;
    sysopen(my $rf,$request,O_RDONLY|O_NOFOLLOW) or fail('REQUEST_FILE');
    my @rfs=stat($rf);
    fail('REQUEST_CHANGED') unless $rfs[0]==$rs[0] && $rfs[1]==$rs[1];
    my $raw=KeyGrant::read_handle($rf); close $rf;
    fail('REQUEST_HASH') unless sha256_hex($raw) eq $expected_hash;
    my $r=eval { JSON::PP->new->decode($raw) }; fail('REQUEST_JSON') if $@;
    KeyGrant::validate($r);
    fail('WRONG_ACCOUNT') unless $account eq $r->{target_account};
    my $host='/etc/ssh/ssh_host_ed25519_key.pub';
    my @hs=lstat($host);
    fail('HOST_KEY_FILE') unless @hs && S_ISREG($hs[2]) && !S_ISLNK($hs[2]) && $hs[4]==0 && !($hs[2]&0022);
    my $fp=capture('/usr/bin/ssh-keygen','-E','sha256','-lf',$host);
    fail('HOST_FINGERPRINT') unless $fp =~ /^256\s+(SHA256:[A-Za-z0-9+\/]{43})\s+.*\(ED25519\)\s*$/ && $1 eq $r->{host_fingerprint};
    if ($mode eq 'grant') {
        my $ifaces=capture('/sbin/ifconfig');
        fail('WRONG_IP') unless $ifaces =~ /\binet\s+\Q$r->{target_ipv4}\E\s/;
    }
    validate_parent_chain($home,$<);
    KeyGrant::checked_stat($home,'dir',$<);
    chdir($home) or fail('HOME_PATH');
    my @dot=lstat('.ssh');
    if (@dot) {
        KeyGrant::checked_stat('.ssh','dir',$<); no_write_acl('.ssh');
    } elsif ($mode eq 'grant') {
        mkdir('.ssh',0700) or fail('CREATE_SSH_DIR');
        KeyGrant::checked_stat('.ssh','dir',$<);
    } else {
        return {status=>'not_granted',account=>$account,controller=>$r->{controller_ipv4},target=>$r->{target_ipv4}};
    }
    chdir('.ssh') or fail('SSH_DIR');
    KeyGrant::checked_stat('.','dir',$<);
    my $receipt='dahao-'.$r->{request_id}.'.receipt.json';
    my $auth='authorized_keys';
    my @a=lstat($auth);
    if (@a) { KeyGrant::checked_stat($auth,'file',$<); no_write_acl($auth); }
    my @rr=lstat($receipt);
    if (@rr) { KeyGrant::checked_stat($receipt,'file',$<); no_write_acl($receipt); }
    my ($recfh,$rec,$recraw);
    if (@rr) {
        $recfh=KeyGrant::safe_file($receipt,$mode ne 'inspect',0,$<);
        $recraw=KeyGrant::read_handle($recfh);
        $rec=KeyGrant::parse_receipt($recraw,$r);
    }
    if ($mode eq 'inspect') {
        my $now=time;
        fail('REQUEST_EXPIRED') if !$rec && ($now<$r->{created_epoch}-300 || $now>$r->{accept_until_epoch});
        return {status=>$rec ? $rec->{state} : 'not_granted',account=>$account,controller=>$r->{controller_ipv4},target=>$r->{target_ipv4},expiry=>$rec ? KeyGrant::utc($rec->{expiry_epoch}) : undef};
    }
    if ($mode eq 'grant') {
        my $now=time;
        fail('REQUEST_EXPIRED') if $now<$r->{created_epoch}-300 || $now>$r->{accept_until_epoch};
        fail('ALREADY_USED') if $rec && $rec->{state} eq 'revoked';
        fail('ACCESS_EXPIRED') if $rec && $now >= $rec->{expiry_epoch};
        # Reserve this request once. A repeated click never extends its duration.
        if (!$rec) {
            $recfh=KeyGrant::safe_file($receipt,1,1,$<);
            $rec={schema=>1,request_id=>$r->{request_id},state=>'prepared',expiry_epoch=>$now+3600,line=>KeyGrant::grant_line($r,$now+3600)};
            $recraw=KeyGrant::receipt_bytes($rec);
            KeyGrant::write_all($recfh,$recraw);
        }
        my $af=KeyGrant::safe_file($auth,1,!@a,$<);
        my $before=KeyGrant::read_handle($af);
        my (undef,$present)=KeyGrant::remove_bytes($before,$rec->{line});
        fail('REMOVED_ACCESS') if !$present && $rec->{state} eq 'granted';
        if (!$present) {
            my $after=KeyGrant::insert_bytes($before,$rec->{line},$r->{public_key});
            KeyGrant::append_locked($af,$auth,$before,$after,$<);
        }
        close $af;
        $rec->{state}='granted';
        KeyGrant::replace_locked($recfh,$receipt,$recraw,KeyGrant::receipt_bytes($rec),$<);
        close $recfh;
        return {status=>'granted',expiry=>KeyGrant::utc($rec->{expiry_epoch}),minutes=>int(($rec->{expiry_epoch}-time)/60)};
    }
    return {status=>'not_granted'} unless $rec;
    if (@a) {
        my $af=KeyGrant::safe_file($auth,1,0,$<);
        my $before=KeyGrant::read_handle($af);
        my ($after,$removed)=KeyGrant::remove_bytes($before,$rec->{line});
        fail('MODIFIED_GRANT') if !$removed && index($before,$r->{public_key})>=0;
        KeyGrant::replace_locked($af,$auth,$before,$after,$<) if $removed;
        close $af;
        fail('OTHER_GRANT_PRESENT') if index($after,$r->{public_key})>=0;
    }
    $rec->{state}='revoked';
    KeyGrant::replace_locked($recfh,$receipt,$recraw,KeyGrant::receipt_bytes($rec),$<);
    close $recfh;
    return {status=>'revoked'};
}
my $result=eval { main() };
if ($@) {
    my $code=$@ =~ /DAHAO_([A-Z_]+)/ ? $1 : 'INTERNAL';
    print JSON::PP->new->canonical->encode({status=>'blocked',code=>$code});
    exit 0;
}
print JSON::PP->new->canonical->encode($result);
