const fs = require("node:fs");
const path = require("node:path");
const dns = require("node:dns");
const { CloudClient, FileTokenStore } = require("cloud189-sdk");

dns.setDefaultResultOrder("ipv4first");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function splitValues(value) {
  return String(value || "")
    .split("&")
    .map((item) => item.trim())
    .filter(Boolean);
}

function maskAccount(value) {
  if (!value) return "未配置";
  if (value.length <= 7) {
    return `${value.slice(0, 3)}***`;
  }
  return `${value.slice(0, 3)}****${value.slice(-4)}`;
}

function safeFileName(value) {
  return String(value).replace(/[^a-zA-Z0-9_.-]/g, "_");
}

function formatError(error) {
  const body = error?.response?.body;
  if (body) {
    return `${error.message || "请求失败"}: ${String(body).replace(/\s+/g, " ").slice(0, 300)}`;
  }
  return String(error?.message || error).replace(/\s+/g, " ");
}

async function main() {
  const usernames = splitValues(process.env.TYYP_USERNAME);
  const passwords = splitValues(process.env.TYYP_PSW);
  const ssons = splitValues(process.env.TYYP_SSON);
  const lines = [
    "# 天翼云盘签到记录",
    "",
    `**最后更新:** ${new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}`,
    "",
    "## 签到详情",
    "",
  ];

  if (!usernames.length) {
    lines.push("未配置 `TYYP_USERNAME`。");
  }

  let successful = 0;
  for (let index = 0; index < usernames.length; index += 1) {
    const username = usernames[index];
    const password = passwords[index] || passwords[0] || "";
    const sson = ssons[index] || ssons[0] || "";
    lines.push(`### 账户${index + 1} (${maskAccount(username)})`, "");

    try {
      if (!sson && !password) {
        throw new Error("没有可用的密码或 SSON Cookie");
      }

      const makeOptions = () => {
        const options = {
          token: new FileTokenStore(
            path.join(".token", `${safeFileName(username)}.json`),
          ),
        };
        if (sson) {
          options.ssonCookie = sson;
        } else {
          options.username = username;
          options.password = password;
        }
        return options;
      };

      let result;
      let lastError;
      for (let attempt = 1; attempt <= 8; attempt += 1) {
        try {
          const client = new CloudClient(makeOptions());
          await client.getSession();
          result = await client.userSign();
          break;
        } catch (error) {
          lastError = error;
          console.error(
            `账户${index + 1} 第${attempt}次连接失败: ${formatError(error)}`,
          );
          if (attempt < 3) {
            await sleep(30000);
          }
        }
      }
      if (!result) {
        throw lastError;
      }
      const bonus = Number(result.netdiskBonus || 0);
      if (result.isSign) {
        lines.push(`- 签到结果：今天已经签到过，获得 ${bonus}M 空间`);
      } else {
        lines.push(`- 签到结果：签到成功，获得 ${bonus}M 空间`);
      }
      successful += 1;
    } catch (error) {
      lines.push(`- 签到失败：${formatError(error)}`);
    }
    lines.push("");
  }

  lines.push("---", "", `成功账户：${successful}/${usernames.length}`, "");
  const output = lines.join("\n");
  fs.writeFileSync("index.md", output, "utf8");
  console.log(output);
}

main().catch((error) => {
  console.error(formatError(error));
  fs.writeFileSync(
    "index.md",
    `# 天翼云盘签到记录\n\n签到程序异常：${formatError(error)}\n`,
    "utf8",
  );
  process.exitCode = 0;
});
