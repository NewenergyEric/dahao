using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Net.NetworkInformation;
using System.Net.Sockets;
using System.Security.Cryptography;
using System.Security.Principal;
using System.ServiceProcess;
using System.Text;
using System.Windows.Forms;

// Offline, as-invoker target handoff. No network clients, process launchers,
// service mutations, private-key reads, automatic uploads or background agent.
namespace Dahao.Connect
{
    internal sealed class Snapshot
    {
        internal string Computer = "未取得";
        internal string Account = "未取得";
        internal string Addresses = "未找到正在使用的 Wi-Fi IPv4";
        internal string Service = "未检查";
        internal string Fingerprint = "未检查";
        internal bool KeyAvailable;
        internal string CapturedAt = DateTimeOffset.Now.ToString("yyyy-MM-dd HH:mm zzz");

        internal string Report(bool confirmed)
        {
            if (!confirmed) throw new InvalidOperationException("target_confirmation_required");
            return String.Join(Environment.NewLine, new string[] {
                "搭好连接信息 v1 · Windows · 用户已确认这是目标电脑",
                "电脑名称：" + Computer, "登录账户：" + Account,
                "Wi-Fi IPv4：" + Addresses, "SSH 服务：" + Service,
                "安全校验码（ED25519 公钥 SHA256）：" + Fingerprint,
                "读取时间：" + CapturedAt,
                "请仅用于本次目标核验；尚未认证、连接或安装。"
            });
        }
    }

    internal static class Inspect
    {
        internal static bool PrivateV4(byte[] b)
        {
            return b.Length == 4 && (b[0] == 10 || (b[0] == 172 && b[1] >= 16 && b[1] <= 31) || (b[0] == 192 && b[1] == 168));
        }

        internal static string PublicFingerprint(string text)
        {
            if (String.IsNullOrWhiteSpace(text) || text.Length > 4096)
                throw new FormatException("invalid_public_key");
            string[] fields = text.Trim().Split((char[])null, StringSplitOptions.RemoveEmptyEntries);
            if (fields.Length < 2 || fields[0] != "ssh-ed25519")
                throw new FormatException("unexpected_public_key_type");
            byte[] blob = Convert.FromBase64String(fields[1]);
            byte[] header = new byte[] { 0, 0, 0, 11, 115, 115, 104, 45, 101, 100, 50, 53, 53, 49, 57, 0, 0, 0, 32 };
            if (blob.Length != 51) throw new FormatException("invalid_ed25519_length");
            for (int i = 0; i < header.Length; i++)
                if (blob[i] != header[i]) throw new FormatException("invalid_ed25519_wire_format");
            using (SHA256 sha = SHA256.Create())
                return "SHA256:" + Convert.ToBase64String(sha.ComputeHash(blob)).TrimEnd('=');
        }

        internal static string ReadPublicFingerprint(string path)
        {
            if (Path.GetFileName(path) != "ssh_host_ed25519_key.pub")
                throw new IOException("unexpected_public_key_path");
            // Do not follow links to any other file, including a private key.
            for (string p = Path.GetFullPath(path); !String.IsNullOrEmpty(p); p = Path.GetDirectoryName(p))
                if ((File.GetAttributes(p) & FileAttributes.ReparsePoint) != 0)
                    throw new IOException("linked_public_key_refused");
            using (FileStream stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read))
            {
                if (stream.Length > 4096) throw new IOException("public_key_too_large");
                using (StreamReader reader = new StreamReader(stream, Encoding.ASCII, false))
                    return PublicFingerprint(reader.ReadToEnd());
            }
        }

        internal static Snapshot Local()
        {
            Snapshot value = new Snapshot();
            value.Computer = Environment.MachineName;
            using (WindowsIdentity identity = WindowsIdentity.GetCurrent()) value.Account = identity.Name;
            try
            {
                List<string> ips = new List<string>();
                foreach (NetworkInterface adapter in NetworkInterface.GetAllNetworkInterfaces())
                {
                    if (adapter.OperationalStatus != OperationalStatus.Up || adapter.NetworkInterfaceType != NetworkInterfaceType.Wireless80211) continue;
                    foreach (UnicastIPAddressInformation addr in adapter.GetIPProperties().UnicastAddresses)
                        if (addr.Address.AddressFamily == AddressFamily.InterNetwork && PrivateV4(addr.Address.GetAddressBytes()) && !ips.Contains(addr.Address.ToString()))
                            ips.Add(addr.Address.ToString());
                }
                if (ips.Count > 0) value.Addresses = String.Join(" / ", ips.ToArray());
            }
            catch { value.Addresses = "暂时无法读取 Wi-Fi 信息，请告诉协助者这一状态"; }
            try
            {
                using (ServiceController service = new ServiceController("sshd"))
                    value.Service = service.Status == ServiceControllerStatus.Running ? "正在运行（未修改）" : "已安装，当前状态 " + service.Status + "（未修改）";
            }
            catch { value.Service = "未查到服务，或当前账户无权查询（未修改）"; }
            try
            {
                string publicPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData), "ssh", "ssh_host_ed25519_key.pub");
                value.Fingerprint = ReadPublicFingerprint(publicPath);
                value.KeyAvailable = true;
            }
            catch (UnauthorizedAccessException) { value.Fingerprint = "当前账户没有读取公钥的权限；先把这段状态交给协助者"; }
            catch (FileNotFoundException) { value.Fingerprint = "没有找到默认主机公钥；先把这段状态交给协助者"; }
            catch (DirectoryNotFoundException) { value.Fingerprint = "没有找到默认主机公钥；先把这段状态交给协助者"; }
            catch { value.Fingerprint = "无法安全读取默认公钥；先把这段状态交给协助者"; }
            return value;
        }

        internal static Snapshot Demo()
        {
            return new Snapshot { Computer = "DEMO-PC", Account = "DEMO-PC\\demo-user", Addresses = "203.0.113.25（示例）",
                Service = "正在运行（示例）", Fingerprint = "演示占位 · 真实运行时由本机公钥计算", KeyAvailable = true,
                CapturedAt = "示例时间 · 不包含真实电脑信息" };
        }
    }

    internal sealed class ConnectForm : Form
    {
        private readonly Snapshot snapshot;
        internal readonly CheckBox Confirm = new CheckBox();
        internal readonly Button Copy = new Button();
        internal readonly Button Save = new Button();
        private readonly TextBox report = new TextBox();
        private readonly Label notice = new Label();
        private readonly Color ink = Color.FromArgb(101, 43, 70);
        private readonly Color paper = Color.FromArgb(255, 248, 243);

        internal ConnectForm(Snapshot value, bool demo)
        {
            snapshot = value;
            Text = "搭好 · 连接小助手" + (demo ? " · 演示" : "");
            ClientSize = new Size(740, 670);
            MinimumSize = new Size(620, 650);
            StartPosition = FormStartPosition.CenterScreen;
            BackColor = paper; ForeColor = ink;
            Font = new Font("Microsoft YaHei UI", 10F);
            AutoScaleMode = AutoScaleMode.Dpi;
            Padding = new Padding(28, 22, 28, 20);

            TableLayoutPanel layout = new TableLayoutPanel();
            layout.Dock = DockStyle.Fill; layout.ColumnCount = 1; layout.RowCount = 9;
            layout.RowStyles.Add(new RowStyle(SizeType.Absolute, 52));
            layout.RowStyles.Add(new RowStyle(SizeType.Absolute, 54));
            layout.RowStyles.Add(new RowStyle(SizeType.Absolute, 75));
            layout.RowStyles.Add(new RowStyle(SizeType.Absolute, 33));
            layout.RowStyles.Add(new RowStyle(SizeType.Percent, 100));
            layout.RowStyles.Add(new RowStyle(SizeType.Absolute, 43));
            layout.RowStyles.Add(new RowStyle(SizeType.Absolute, 51));
            layout.RowStyles.Add(new RowStyle(SizeType.Absolute, 36));
            layout.RowStyles.Add(new RowStyle(SizeType.Absolute, 37));
            Controls.Add(layout);

            Label title = LabelOf("搭好，先认对这台电脑。", 23, true);
            layout.Controls.Add(title, 0, 0);
            layout.Controls.Add(LabelOf("请在要安装助手的 Windows 上打开。确认下面信息后复制，\n交回本机 Agent；不用输入命令，也不用发送密码。", 10, false), 0, 1);
            Label safety = LabelOf("只做检查，不改系统。\n仅查看电脑名、登录账户、Wi-Fi 地址、SSH 状态和公钥校验码。\n没有自动上传；不读取密码、私钥、聊天或订阅。", 10, false);
            safety.BackColor = Color.FromArgb(245, 220, 228); safety.Padding = new Padding(12, 8, 6, 0);
            layout.Controls.Add(safety, 0, 2);
            layout.Controls.Add(LabelOf("将要分享的信息（只有下面这些）", 10, true), 0, 3);
            report.Multiline = true; report.ReadOnly = true; report.ScrollBars = ScrollBars.Vertical;
            report.Dock = DockStyle.Fill; report.BackColor = Color.White; report.ForeColor = ink;
            report.Font = new Font("Microsoft YaHei UI", 9.5F); report.BorderStyle = BorderStyle.FixedSingle;
            report.Text = snapshot.Report(true).Replace("用户已确认这是目标电脑", "等待你确认目标");
            report.AccessibleName = "待分享的连接信息，只读";
            layout.Controls.Add(report, 0, 4);
            Confirm.Text = "我确认：这是准备安装 AI 助手的目标电脑";
            Confirm.Dock = DockStyle.Fill; Confirm.AutoSize = true; Confirm.Checked = false;
            Confirm.CheckedChanged += delegate {
                Copy.Enabled = Confirm.Checked; Save.Enabled = Confirm.Checked;
                report.Text = snapshot.Report(true).Replace("用户已确认这是目标电脑", Confirm.Checked ? "用户已确认这是目标电脑" : "等待你确认目标");
            };
            layout.Controls.Add(Confirm, 0, 5);

            FlowLayoutPanel buttons = new FlowLayoutPanel(); buttons.Dock = DockStyle.Fill;
            StyleButton(Copy, "复制连接信息", true); StyleButton(Save, "保存为文本…", false);
            Copy.Enabled = false; Save.Enabled = false;
            Copy.Click += delegate { CopyReport(); };
            Save.Click += delegate { SaveReport(); };
            buttons.Controls.Add(Copy); buttons.Controls.Add(Save);
            layout.Controls.Add(buttons, 0, 6);
            notice.Dock = DockStyle.Fill; notice.Text = value.KeyAvailable ? "校验码用来防止连错电脑，由 Agent 比对；它不是密码。" : "缺少校验码也可以先交回状态；不要跳过身份核验。";
            notice.Font = new Font(Font.FontFamily, 9F);
            layout.Controls.Add(notice, 0, 7);
            Label footer = LabelOf("连接信息属于私人信息，仅交给本次协助者。关闭后本程序即退出。\n0.1.0 预览 · 未签名 · 不授予远程访问权限", 8.5F, false);
            layout.Controls.Add(footer, 0, 8);
            ActiveControl = Confirm;
        }

        private Label LabelOf(string text, float size, bool bold)
        {
            Label label = new Label(); label.Text = text; label.Dock = DockStyle.Fill;
            label.Font = new Font("Microsoft YaHei UI", size, bold ? FontStyle.Bold : FontStyle.Regular);
            label.TextAlign = ContentAlignment.MiddleLeft; return label;
        }
        private void StyleButton(Button button, string text, bool primary)
        {
            button.Text = text; button.Size = new Size(164, 40); button.Margin = new Padding(0, 3, 12, 0);
            button.FlatStyle = FlatStyle.Flat; button.BackColor = primary ? ink : paper;
            button.ForeColor = primary ? paper : ink; button.UseVisualStyleBackColor = false;
        }
        private void CopyReport()
        {
            if (!Confirm.Checked) return;
            try { Clipboard.SetText(snapshot.Report(true), TextDataFormat.UnicodeText); notice.Text = "已复制。仅粘贴给本次协助你的 Agent，不发公开群或 GitHub。"; }
            catch { notice.Text = "剪贴板暂时不可用，请用“保存为文本”。"; }
        }
        private void SaveReport()
        {
            if (!Confirm.Checked) return;
            using (SaveFileDialog dialog = new SaveFileDialog())
            {
                dialog.Title = "保存连接信息 · 仅交给本次协助者";
                dialog.Filter = "文本文件 (*.txt)|*.txt"; dialog.FileName = "dahao-connection-info.txt";
                dialog.OverwritePrompt = true; dialog.AddExtension = true; dialog.RestoreDirectory = true;
                if (dialog.ShowDialog(this) != DialogResult.OK) return;
                try { File.WriteAllText(dialog.FileName, snapshot.Report(true), new UTF8Encoding(true)); notice.Text = "已保存。只分享这个文件；用完后可删除。"; }
                catch { notice.Text = "无法保存，请换到你有写入权限的文件夹。"; }
            }
        }
    }

    internal static class Program
    {
        [STAThread]
        private static int Main(string[] args)
        {
            Application.EnableVisualStyles(); Application.SetCompatibleTextRenderingDefault(false);
            try
            {
                if (args.Length == 1 && args[0] == "--self-test") return SelfTest();
                if (args.Length == 2 && args[0] == "--demo-image")
                {
                    using (ConnectForm form = new ConnectForm(Inspect.Demo(), true))
                    using (Bitmap bitmap = new Bitmap(form.Width, form.Height))
                    {
                        form.ShowInTaskbar = false; form.StartPosition = FormStartPosition.Manual;
                        form.Location = new Point(-10000, -10000); form.Opacity = 0;
                        form.Show(); form.PerformLayout(); Application.DoEvents();
                        form.DrawToBitmap(bitmap, new Rectangle(Point.Empty, bitmap.Size));
                        bitmap.Save(args[1], System.Drawing.Imaging.ImageFormat.Png);
                    }
                    return 0;
                }
                if (args.Length == 2 && args[0] == "--inspect-private")
                {
                    // Maintainer-only local verification; never used in a published report.
                    using (FileStream output = new FileStream(args[1], FileMode.CreateNew, FileAccess.Write))
                    using (StreamWriter writer = new StreamWriter(output, new UTF8Encoding(true)))
                        writer.Write(Inspect.Local().Report(true).Replace("用户已确认这是目标电脑", "维护者本机检查，非目标确认"));
                    return 0;
                }
                if (args.Length != 0) return 2;
                Application.Run(new ConnectForm(Inspect.Local(), false)); return 0;
            }
            catch
            {
                if (args.Length == 0) MessageBox.Show("本次未能完成检查，没有安装或修改系统。请关闭后将这一状态告诉协助者。", "搭好 · 检查未完成", MessageBoxButtons.OK, MessageBoxIcon.Information);
                return 1;
            }
        }

        private static int SelfTest()
        {
            // Synthetic ED25519 wire-format fixture; never a private key.
            byte[] blob = new byte[51];
            byte[] prefix = new byte[] { 0, 0, 0, 11, 115, 115, 104, 45, 101, 100, 50, 53, 53, 49, 57, 0, 0, 0, 32 };
            Array.Copy(prefix, blob, prefix.Length);
            for (int i = 19; i < blob.Length; i++) blob[i] = (byte)(i - 19);
            string key = "ssh-ed25519 " + Convert.ToBase64String(blob) + " synthetic-only";
            string expected = "SHA256:ZkAslGjFiUHdGf/WUL8rQvkib4PTvQatUV0OUQSncCA";
            if (Inspect.PublicFingerprint(key) != expected) return 10;
            foreach (string malformed in new string[] { "", "ssh-rsa AAAA", "ssh-ed25519 ?", "ssh-ed25519 AAAA", "not-a-public-key" })
            {
                bool rejected = false;
                try { Inspect.PublicFingerprint(malformed); } catch (FormatException) { rejected = true; }
                if (!rejected) return 11;
            }
            blob[3] = 12;
            try { Inspect.PublicFingerprint("ssh-ed25519 " + Convert.ToBase64String(blob)); return 12; } catch (FormatException) { }
            if (!Inspect.PrivateV4(new byte[] { 10, 0, 0, 2 }) || Inspect.PrivateV4(new byte[] { 203, 0, 113, 25 }) || Inspect.PrivateV4(new byte[16])) return 13;
            try { Inspect.Demo().Report(false); return 14; } catch (InvalidOperationException) { }
            using (ConnectForm form = new ConnectForm(Inspect.Demo(), true))
            {
                if (form.Copy.Enabled || form.Save.Enabled) return 15;
                form.Confirm.Checked = true;
                if (!form.Copy.Enabled || !form.Save.Enabled) return 16;
                form.Confirm.Checked = false;
                if (form.Copy.Enabled || form.Save.Enabled) return 17;
            }
            return 0;
        }
    }
}
