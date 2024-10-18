const $ = new Env('Follow簽到');
$.desc = [];

// CSRF Tokens 和 Cookies
const tasks = [
  {
    csrfToken: 'csrfToken1',
    cookie: 'cookie1',
    name: 'name1'
  },
  {
    csrfToken: 'csrfToken2',
    cookie: 'cookie2',
    name: 'name2'
  }
];

// 設定固定的方框長度
const boxLength = 12; // 例如 [     YT     ] 總長度是14

!(async () => {
  for (let task of tasks) {
    await sign(task);
  }
})()
  .catch((e) => $.logErr(e))
  .finally(() => $.done());

function sign(task) {
  return new Promise((resolve) => {
    const options = {
      url: 'https://api.follow.is/wallets/transactions/claim_daily',
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.38(0x1800262c) NetType/4G Language/zh_CN',
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Connection': 'keep-alive',
        'Referer': 'https://api.follow.is/',
        'Cookie': task.cookie,
      },
      body: JSON.stringify({ csrfToken: task.csrfToken }),
    };

    $.post(options, async (err, resp, body) => {
      try {
        console.log(body);
        const { code, message } = JSON.parse(body);

        // 將帳號名稱置中，並用空格填充到設定的 boxLength 長度
        const nameLength = task.name.length;
        const paddingTotal = boxLength - 2 - nameLength; // 2 是為了考慮左右的方括號
        const paddingLeft = Math.floor(paddingTotal / 2);
        const paddingRight = paddingTotal - paddingLeft;

        const paddedName = `[${' '.repeat(paddingLeft)}${task.name}${' '.repeat(paddingRight)}]`;

        if (code !== 0) {
          $.desc.push(`${paddedName} ➟ 簽到失敗：${message}`);
        } else {
          $.desc.push(`${paddedName} ➟ 簽到成功`);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        // 在所有簽到結束後只發送一次通知
        if (tasks.indexOf(task) === tasks.length - 1) {
          $.msg($.name, '', $.desc.join('\n'));
        }
        resolve();
      }
    });
  });
}

function Env(name) {
  this.name = name;
  this.msg = (title, subtitle, message) => $notification.post(title, subtitle, message);
  this.log = (msg) => console.log(msg);
  this.getdata = (key) => $persistentStore.read(key);
  this.setdata = (val, key) => $persistentStore.write(val, key);
  this.get = (options, callback) => $httpClient.get(options, callback);
  this.post = (options, callback) => $httpClient.post(options, callback);
  this.done = (val = {}) => $done(val);
  this.logErr = (err) => console.log(`❗️${this.name}, 錯誤!`, err);
}
