const $ = new Env('Follow簽到');
$.desc = [];

// 透過 Surge 模塊更改參數
const tasks = [
  {
    csrfToken: $.getdata('csrfToken1') || 'csrfToken1',
    cookie: $.getdata('cookie1') || 'cookie1',
    name: $.getdata('name1') || 'name1'
  },
  {
    csrfToken: $.getdata('csrfToken2') || 'csrfToken2',
    cookie: $.getdata('cookie2') || 'cookie2',
    name: $.getdata('name2') || 'name2'
  }
];

// 設定固定的方框長度
const boxLength = 14;

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

        const nameLength = task.name.length;
        const paddingTotal = boxLength - 2 - nameLength;
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

