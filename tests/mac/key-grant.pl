use strict;
use warnings;
use FindBin;
use lib $ENV{DAHAO_MAC_SOURCE};
use KeyGrant;
use Test::More;
use MIME::Base64 qw(encode_base64);
use File::Temp qw(tempdir);
use Fcntl qw(:DEFAULT);

my $wire=pack('N',11).'ssh-ed25519'.pack('N',32).('x'x32);
my $r={schema=>1,request_id=>'ab'x16,target_account=>'test_user',target_ipv4=>join('.',192,168,99,21),controller_ipv4=>join('.',192,168,99,22),host_fingerprint=>'SHA256:'.('a'x43),public_key=>'ssh-ed25519 '.encode_base64($wire,''),created_epoch=>1791867600,accept_until_epoch=>1791954000,duration_seconds=>3600};
ok(KeyGrant::validate($r),'valid bounded synthetic request');
for my $case (
    ['target_account','user;echo bad'], ['controller_ipv4',join('.',192,168,99,22).',10.*'],
    ['target_ipv4','192.268.0.1'], ['public_key','ssh-rsa fake'],
    ['duration_seconds',7200], ['request_id',('../x'x8)],
    ['accept_until_epoch',1891954000], ['host_fingerprint',"SHA256:\n".('a'x43)],
    ['created_epoch','tomorrow'], ['schema',2]) {
    my %x=(%$r,$case->[0]=>$case->[1]);
    ok(!eval { KeyGrant::validate(\%x); 1 },'reject '.$case->[0]);
}
my %extra=(%$r,command=>'whoami');
ok(!eval { KeyGrant::validate(\%extra); 1 },'reject arbitrary request fields');
is(KeyGrant::utc(0),'19700101000000Z','UTC format');
my $line=KeyGrant::grant_line($r,1791871200);
like($line,qr/^restrict,from="192\.168\.99\.22",expiry-time="\d{14}Z" ssh-ed25519 /,'source, expiry, restrictions');
for my $before ('',"# existing\nssh-other FAKE comment\n",'no newline',"#\x00\xff\r\n",("#comment\n"x100)) {
    my $after=KeyGrant::insert_bytes($before,$line,$r->{public_key});
    my ($restored,$n)=KeyGrant::remove_bytes($after,$line);
    is($restored,$before,'remove restores exact existing bytes');
    is($n,1,'one own grant removed');
    my ($unchanged,$none)=KeyGrant::remove_bytes($before,$line);
    is($unchanged,$before,'absent grant preserves bytes');
    is($none,0,'absent count');
}
ok(!eval { KeyGrant::insert_bytes('existing '.$r->{public_key},$line,$r->{public_key}); 1 },'reject duplicate key');
ok(!eval { KeyGrant::remove_bytes("\n$line\n\n$line\n",$line); 1 },'reject ambiguous repeated grant');
my ($keep)=KeyGrant::remove_bytes("before\n$line\nother later key\n",$line);
is($keep,"before\nother later key\n",'later key remains a separate line after original unterminated line');
# Real append always adds its own leading newline, even when existing bytes end in one.
my $a=KeyGrant::insert_bytes("before\n",$line,$r->{public_key})."other later key\n";
my ($b)=KeyGrant::remove_bytes($a,$line);
is($b,"before\nother later key\n",'later keys retained');
my $receipt={schema=>1,request_id=>$r->{request_id},state=>'granted',expiry_epoch=>1791871200,line=>$line};
is(KeyGrant::parse_receipt(KeyGrant::receipt_bytes($receipt),$r)->{line},$line,'receipt binding');
my %badrec=(%$receipt,line=>$line.' changed');
ok(!eval { KeyGrant::parse_receipt(KeyGrant::receipt_bytes(\%badrec),$r); 1 },'tampered receipt rejected');
my $tmp=tempdir('dahao-test-XXXXXX',TMPDIR=>1,CLEANUP=>1);
my $file="$tmp/bytes";
sysopen(my $fh,$file,O_RDWR|O_CREAT|O_EXCL,0600) or die 'test_file';
binmode $fh;
KeyGrant::write_all($fh,"original\x00\xff\n");
is(KeyGrant::read_handle($fh),"original\x00\xff\n",'binary file read/write');
close $fh;
done_testing();
