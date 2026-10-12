using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.Globalization;
using System.IO;
using System.Net;
using System.Runtime.InteropServices;
using System.Security.AccessControl;
using System.Security.Cryptography;
using System.Security.Principal;
using System.Text;
using System.Text.RegularExpressions;
using System.Web.Script.Serialization;
using System.Windows.Forms;

namespace Dahao.Authorization
{
    internal sealed class Request
    {
        internal string Id, Target, TargetAddress, ControllerAddress, PublicKey, HostFingerprint;
        internal static Request Load(string file)
        {
            Safe.Regular(file);
            if (new FileInfo(file).Length > 12000) throw new InvalidOperationException("请求文件过大");
            Dictionary<string, object> d = new JavaScriptSerializer().Deserialize<Dictionary<string, object>>(File.ReadAllText(file, Encoding.UTF8));
            string[] keys = { "schema", "id", "target", "target_address", "controller_address", "public_key", "host_fingerprint" };
            if (d.Count != keys.Length) throw new InvalidOperationException("请求字段不符");
            foreach (string k in keys) if (!d.ContainsKey(k)) throw new InvalidOperationException("请求字段不符");
            if (Convert.ToInt32(d["schema"]) != 1) throw new InvalidOperationException("请求版本不符");
            Request r = new Request { Id = (string)d["id"], Target = (string)d["target"], TargetAddress = (string)d["target_address"], ControllerAddress = (string)d["controller_address"], PublicKey = (string)d["public_key"], HostFingerprint = (string)d["host_fingerprint"] };
            if (!Regex.IsMatch(r.Id, "^[a-f0-9]{24}$") || !Regex.IsMatch(r.Target, @"^[\p{L}0-9_. -]+\\[\p{L}0-9_. -]+$")) throw new InvalidOperationException("请求身份格式不符");
            CheckAddress(r.TargetAddress); CheckAddress(r.ControllerAddress);
            string[] publicParts = r.PublicKey.Split(' ');
            if (publicParts.Length != 2) throw new InvalidOperationException("只能接收一把 ED25519 公钥");
            Dahao.Connect.Inspect.PublicFingerprint(r.PublicKey);
            if (!Regex.IsMatch(r.HostFingerprint, "^SHA256:[A-Za-z0-9+/]{43}$")) throw new InvalidOperationException("目标校验码格式不符");
            return r;
        }
        private static void CheckAddress(string text)
        {
            IPAddress ip;
            if (!IPAddress.TryParse(text, out ip) || ip.ToString() != text || !Dahao.Connect.Inspect.PrivateV4(ip.GetAddressBytes())) throw new InvalidOperationException("仅支持明确的局域网 IPv4");
        }
        internal string Marker { get { return "dahao-" + Id; } }
    }

    internal static class Safe
    {
        [StructLayout(LayoutKind.Sequential)]
        private struct FileInformation
        {
            public uint Attributes, CreationLow, CreationHigh, AccessLow, AccessHigh, WriteLow, WriteHigh;
            public uint Volume, SizeHigh, SizeLow, Links, IndexHigh, IndexLow;
        }
        [DllImport("kernel32.dll", SetLastError=true)]
        private static extern bool GetFileInformationByHandle(Microsoft.Win32.SafeHandles.SafeFileHandle handle, out FileInformation info);
        internal static void SingleLink(FileStream stream)
        {
            FileInformation info;
            if(!GetFileInformationByHandle(stream.SafeFileHandle,out info)||info.Links!=1)throw new InvalidOperationException("无法确认授权文件唯一，未作修改");
        }
        internal static readonly SecurityIdentifier Admin = new SecurityIdentifier(WellKnownSidType.BuiltinAdministratorsSid, null);
        internal static readonly SecurityIdentifier SystemUser = new SecurityIdentifier(WellKnownSidType.LocalSystemSid, null);
        internal static bool Elevated { get { using (WindowsIdentity who = WindowsIdentity.GetCurrent()) return new WindowsPrincipal(who).IsInRole(WindowsBuiltInRole.Administrator); } }
        internal static void Regular(string path)
        {
            for (string p = Path.GetFullPath(path); !String.IsNullOrEmpty(p); p = Path.GetDirectoryName(p))
                if (File.Exists(p) || Directory.Exists(p))
                    if ((File.GetAttributes(p) & FileAttributes.ReparsePoint) != 0) throw new InvalidOperationException("为避免改错文件，不处理符号链接或目录联接");
        }
        internal static string Digest(string path)
        {
            using (SHA256 sha = SHA256.Create()) return BitConverter.ToString(sha.ComputeHash(File.ReadAllBytes(path))).Replace("-", "").ToLowerInvariant();
        }
        internal static string KeyFile
        {
            get { return Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData), "ssh", "administrators_authorized_keys"); }
        }
        internal static void ValidateTarget(Request r, bool keyCheck)
        {
            using (WindowsIdentity who = WindowsIdentity.GetCurrent())
            {
                if (!String.Equals(who.Name, r.Target, StringComparison.OrdinalIgnoreCase)) throw new InvalidOperationException("这不是请求中的目标账户；未作修改");
                bool member = false;
                foreach (IdentityReference group in who.Groups) if (group.Value == Admin.Value) member = true;
                if (!member) throw new InvalidOperationException("本预览只适用于已确认的 Windows 本地管理员账户；未作修改");
            }
            if (keyCheck)
            {
                string pub = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData), "ssh", "ssh_host_ed25519_key.pub");
                if (Dahao.Connect.Inspect.ReadPublicFingerprint(pub) != r.HostFingerprint) throw new InvalidOperationException("目标公钥已变化；请重新核验，未作修改");
            }
        }
        internal static void ValidateAcl(string file)
        {
            FileSecurity acl = File.GetAccessControl(file);
            foreach (FileSystemAccessRule rule in acl.GetAccessRules(true, true, typeof(SecurityIdentifier)))
                if (rule.AccessControlType == AccessControlType.Allow && rule.IdentityReference.Value != Admin.Value && rule.IdentityReference.Value != SystemUser.Value)
                    throw new InvalidOperationException("已有 SSH 授权文件的权限超出管理员和 SYSTEM；请交回此状态，不自动改权限");
        }
        internal static FileSecurity NewAcl()
        {
            FileSecurity acl = new FileSecurity(); acl.SetAccessRuleProtection(true, false); acl.SetOwner(Admin);
            acl.AddAccessRule(new FileSystemAccessRule(Admin, FileSystemRights.FullControl, AccessControlType.Allow));
            acl.AddAccessRule(new FileSystemAccessRule(SystemUser, FileSystemRights.FullControl, AccessControlType.Allow));
            return acl;
        }
        internal static string Guard(string target, DateTime expires)
        {
            // A shared administrators key file must NOT authorize other admin accounts.
            // Native key options restrict source and forwarding; this forced command
            // additionally binds the account and accepts one encoded command only.
            string stamp = expires.ToString("yyyy-MM-ddTHH:mm:ssZ", CultureInfo.InvariantCulture);
            return "$ErrorActionPreference='Stop';[Console]::OutputEncoding=New-Object System.Text.UTF8Encoding($false);" +
                "if([Security.Principal.WindowsIdentity]::GetCurrent().Name -ine '" + target.Replace("'", "''") + "'){exit 23};" +
                "if([DateTime]::UtcNow -ge [DateTime]::Parse('" + stamp + "').ToUniversalTime()){exit 24};" +
                "$s=[Console]::ReadLine();if($null -eq $s -or $s.Length -gt 131072 -or $s -notmatch '^DAHAO1 [A-Za-z0-9+/=]+$'){exit 25};" +
                "$b=[Convert]::FromBase64String($s.Substring(7));if(($b.Length%2)-ne 0){exit 26};" +
                "$c=[Text.Encoding]::Unicode.GetString($b);& ([ScriptBlock]::Create($c))";
        }
        internal static string Line(Request r, DateTime expires)
        {
            string command = "powershell.exe -NoLogo -NoProfile -NonInteractive -EncodedCommand " + Convert.ToBase64String(Encoding.Unicode.GetBytes(Guard(r.Target, expires)));
            return "restrict,from=\"" + r.ControllerAddress + "\",expiry-time=\"" + expires.ToString("yyyyMMddHHmmss'Z'", CultureInfo.InvariantCulture) + "\",command=\"" + command + "\" " + r.PublicKey + " " + r.Marker;
        }
        internal static bool OwnLine(string line, Request r)
        {
            return line.TrimEnd('\r').EndsWith(" " + r.PublicKey + " " + r.Marker, StringComparison.Ordinal);
        }
        internal static string RemoveOwn(string content, Request r)
        {
            StringBuilder remaining = new StringBuilder();
            MatchCollection lines = Regex.Matches(content, @"[^\n]*\n|[^\n]+$");
            foreach (Match line in lines) if (!OwnLine(line.Value.TrimEnd('\n'), r)) remaining.Append(line.Value);
            return remaining.ToString();
        }
        internal static string Apply(Request r, bool revoke)
        {
            if (!Elevated) throw new InvalidOperationException("需要 Windows 的管理员确认；未作修改");
            ValidateTarget(r, !revoke);
            string path = KeyFile; Regular(path);
            if (!Directory.Exists(Path.GetDirectoryName(path))) throw new InvalidOperationException("未找到现有 SSH 文件夹；不会安装或开启 SSH");
            bool existed = File.Exists(path);
            if (!existed && revoke) return "本次授权已不存在，无需更改。";
            if (existed && !revoke) ValidateAcl(path);
            using (FileStream stream = existed ? new FileStream(path, FileMode.Open, FileAccess.ReadWrite, FileShare.Read | FileShare.Delete) : new FileStream(path, FileMode.CreateNew, FileSystemRights.ReadData | FileSystemRights.WriteData | FileSystemRights.ReadPermissions, FileShare.Read | FileShare.Delete, 4096, FileOptions.None, NewAcl()))
            {
                SingleLink(stream);
                if (stream.Length > 262144) throw new InvalidOperationException("已有授权文件过大，未作修改");
                byte[] old = new byte[(int)stream.Length]; int read = 0;
                while (read < old.Length) { int n = stream.Read(old, read, old.Length - read); if (n == 0) throw new IOException(); read += n; }
                string before = new UTF8Encoding(false, true).GetString(old);
                bool present = false;
                foreach (string line in before.Split('\n')) if (OwnLine(line, r)) present = true;
                if (!revoke && present) return "本次授权条目已存在，不会延长有效期。若已到期，请先撤销，再确认新授权。";
                if (revoke)
                {
                    if (!present) return "本次授权已不存在；其他授权保持原样。";
                    // Atomic replacement retains unrelated bytes and the original ACL.
                    byte[] after = new UTF8Encoding(false).GetBytes(RemoveOwn(before, r));
                    AtomicReplace(path, after);
                    return "已撤销本次公钥授权。新的登录将被拒绝；已开始的命令不会因此自动终止。";
                }
                DateTime expires = DateTime.UtcNow.AddMinutes(60);
                string extra = (old.Length > 0 && old[old.Length - 1] != 10 ? "\n" : "") + Line(r, expires) + "\n";
                byte[] append = Encoding.UTF8.GetBytes(extra);
                try { stream.Position = old.Length; stream.Write(append, 0, append.Length); stream.Flush(true); }
                catch { stream.SetLength(old.Length); stream.Flush(true); throw; }
                return "搭好临时授权已创建。\r\n到期时间：" + expires.ToLocalTime().ToString("yyyy-MM-dd HH:mm:ss zzz") + "\r\n仅允许界面中的控制电脑和账户。未安装 OpenClaw；请告诉 Agent“临时授权已创建”。\r\n完工后可点“撤销本次授权”。";
            }
        }
        internal static void AtomicReplace(string path, byte[] content)
        {
            string temp = path + ".dahao-temp-" + Guid.NewGuid().ToString("N");
            try
            {
                using(FileStream output=new FileStream(temp,FileMode.CreateNew,FileSystemRights.WriteData,FileShare.None,4096,FileOptions.None,File.GetAccessControl(path)))
                {output.Write(content,0,content.Length);output.Flush(true);}
                File.Replace(temp,path,null);
            }
            finally {if(File.Exists(temp))File.Delete(temp);}
        }
    }

    internal sealed class AuthorizeForm : Form
    {
        private Request request;
        private readonly string file;
        private readonly string requestHash;
        private readonly Label result = new Label();
        private readonly CheckBox agree = new CheckBox();
        private readonly Button grant = new Button();
        internal AuthorizeForm(Request r, string path)
        {
            request = r; file = path; requestHash = Safe.Digest(path);
            Text = "搭好 · 临时接入授权"; ClientSize = new Size(770, 655); MinimumSize = Size;
            StartPosition = FormStartPosition.CenterScreen; Font = new Font("Microsoft YaHei UI", 10);
            BackColor = Color.FromArgb(255,248,243); ForeColor = Color.FromArgb(101,43,70);
            Label title = new Label { Text="只有 PIN，也可以继续。",Font=new Font(Font.FontFamily,23,FontStyle.Bold),Bounds=new Rectangle(28,22,710,49)};Controls.Add(title);
            TextBox detail = new TextBox { Multiline=true,ReadOnly=true,ScrollBars=ScrollBars.Vertical,BackColor=Color.White,ForeColor=ForeColor,Bounds=new Rectangle(28,86,710,328),Text =
                "这将允许指定的本机 Agent 以你的账户执行命令，完成环境检查、OpenClaw 安装和验证。当前账户是管理员，权限较高。\r\n\r\n"+
                "目标账户："+r.Target+"\r\n目标地址："+r.TargetAddress+"\r\n允许的控制电脑："+r.ControllerAddress+"\r\n有效期：点击授权后 60 分钟，过期拒绝新登录。\r\n\r\n"+
                "具体改动：在现有 SSH 授权文件新增一条本次公钥；限制来源地址、目标账户和有效期，禁止端口/密钥转发及交互终端。已有条目保留。\r\n"+
                "文件："+Safe.KeyFile+"\r\n\r\n不会修改 PIN/密码、开启服务、关闭防火墙或复制私钥。不是隔离沙箱；到期或撤销不会自动终止已开始的命令。完工后请撤销。"};Controls.Add(detail);
            agree.Text="我认识本次协助者，同意上面的临时接入范围";agree.Bounds=new Rectangle(28,425,710,33);Controls.Add(agree);
            grant.Text="允许本次接入（60 分钟）";grant.Bounds=new Rectangle(28,468,275,44);grant.Enabled=false;grant.Click+=delegate{ Act(false); };Controls.Add(grant);
            Button revoke=new Button {Text="撤销本次授权",Bounds=new Rectangle(318,468,205,44)};revoke.Click+=delegate{ Act(true); };Controls.Add(revoke);
            agree.CheckedChanged+=delegate{grant.Enabled=agree.Checked;};
            result.Bounds=new Rectangle(28,527,710,77);result.Text="只有点击授权才会改动。Windows 可能请求管理员确认；被安全保护拦截时停止，不关闭保护。";Controls.Add(result);
            Controls.Add(new Label {Text="未签名开发预览 · 授权包包含私有连接资料，仅用于本次目标，不上传 GitHub。",Bounds=new Rectangle(28,610,710,28),Font=new Font(Font.FontFamily,9)});
        }
        private void Act(bool revoke)
        {
            if (!revoke && !agree.Checked) return;
            try
            {
                if (Safe.Digest(file)!=requestHash) throw new InvalidOperationException("请求文件发生变化，请重新核对；未作修改");
                if (!Safe.Elevated)
                {
                    ProcessStartInfo info=new ProcessStartInfo(Application.ExecutablePath,"--apply "+(revoke?"revoke":"grant")+" "+requestHash);
                    info.UseShellExecute=true;info.Verb="runas";
                    using(Process child=Process.Start(info)){child.WaitForExit(); result.Text=child.ExitCode==0?"操作已完成。详细结果见管理员窗口；请把状态告诉 Agent。":"未完成；查看管理员窗口中的具体状态。";}
                }
                else {result.Text=Safe.Apply(request,revoke);}
            }
            catch (System.ComponentModel.Win32Exception){result.Text="Windows 授权未完成；没有自动绕过或关闭保护。";}
            catch(Exception e){result.Text=e is InvalidOperationException?e.Message:"本次操作未完成。不要关闭保护或覆盖文件，请把这个状态交回协助者。";}
        }
    }

    internal static class Program
    {
        [STAThread]
        private static int Main(string[] args)
        {
            try
            {
                if(args.Length==1&&args[0]=="--self-test") return SelfTest();
                string file=Path.Combine(AppDomain.CurrentDomain.BaseDirectory,"request.json");
                Request r=Request.Load(file);Safe.ValidateTarget(r,false);
                Application.EnableVisualStyles();Application.SetCompatibleTextRenderingDefault(false);
                if(args.Length==3&&args[0]=="--apply"&&(args[1]=="grant"||args[1]=="revoke"))
                {
                    if(Safe.Digest(file)!=args[2])throw new InvalidOperationException("请求文件变化，未作修改");
                    string result=Safe.Apply(r,args[1]=="revoke");MessageBox.Show(result,"搭好 · 授权结果",MessageBoxButtons.OK,MessageBoxIcon.Information);return 0;
                }
                if(args.Length!=0)return 2;
                Application.Run(new AuthorizeForm(r,file));return 0;
            }
            catch(Exception e){if(args.Length==1&&args[0]=="--self-test")return 1;MessageBox.Show(e is InvalidOperationException?e.Message:"无法完成操作，未自动更改服务或安全保护。请把状态交回协助者。","搭好 · 未完成",MessageBoxButtons.OK,MessageBoxIcon.Information);return 1;}
        }
        private static int SelfTest()
        {
            Request r=new Request {Id=new string('a',24),Target="SYNTHETIC-PC\\sample",ControllerAddress="CONTROLLER_IP",PublicKey="ssh-ed25519 SYNTHETIC_PUBLIC_KEY"};
            string line=Safe.Line(r,DateTime.UtcNow.AddMinutes(10));
            if(!line.StartsWith("restrict,from=")||!line.Contains("expiry-time=")||!line.Contains("command=\"powershell.exe")||line.Length>8000)return 10;
            string original="# existing\r\nssh-ed25519 OTHER_PUBLIC_KEY keep\r\n";
            if(Safe.RemoveOwn(original+line+"\n",r)!=original)return 11;
            if(Safe.RemoveOwn(line+"\r\n"+original+line+"\n",r)!=original)return 12;
            if(Safe.RemoveOwn(original,r)!=original)return 13;
            string guard=Safe.Guard("SYNTHETIC-PC\\sample",DateTime.UtcNow.AddMinutes(10));
            ProcessStartInfo pi=new ProcessStartInfo(Path.Combine(Environment.SystemDirectory,"WindowsPowerShell/v1.0/powershell.exe"),"-NoLogo -NoProfile -NonInteractive -EncodedCommand "+Convert.ToBase64String(Encoding.Unicode.GetBytes(guard)));
            pi.UseShellExecute=false;pi.CreateNoWindow=true;pi.RedirectStandardOutput=true;pi.RedirectStandardError=true;
            using(Process p=Process.Start(pi)){if(!p.WaitForExit(15000)||p.ExitCode!=23)return 14;}
            using(WindowsIdentity who=WindowsIdentity.GetCurrent())guard=Safe.Guard(who.Name,DateTime.UtcNow.AddMinutes(-1));
            pi.Arguments="-NoLogo -NoProfile -NonInteractive -EncodedCommand "+Convert.ToBase64String(Encoding.Unicode.GetBytes(guard));
            using(Process p=Process.Start(pi)){if(!p.WaitForExit(15000)||p.ExitCode!=24)return 15;}
            string temp=Path.Combine(Path.GetTempPath(),"dahao-auth-test-"+Guid.NewGuid().ToString("N")+".txt");
            try
            {
                File.WriteAllText(temp,original,Encoding.UTF8);
                using(FileStream held=new FileStream(temp,FileMode.Open,FileAccess.ReadWrite,FileShare.Read|FileShare.Delete))
                    Safe.AtomicReplace(temp,Encoding.UTF8.GetBytes(original+"# isolated test\n"));
                if(File.ReadAllText(temp,Encoding.UTF8)!=original+"# isolated test\n")return 16;
            }
            finally {if(File.Exists(temp))File.Delete(temp);}
            return 0;
        }
    }
}
