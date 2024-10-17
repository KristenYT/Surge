/*
脚本引用 https://github.com/chavyleung/scripts/blob/master/follow/follow.js
*/
const $ = new Env('Follow每日签到');
$.desc = [];

const csrfToken = $argument.token;
const cookie = $argument.cookie;

!(async () => {
  await sign();
})()
  .catch((e) => $.logErr(e))
  .finally(() => $.done());

function sign() {
  return new Promise((resolve) => {
    const options = {
      url: 'https://api.follow.is/wallets/transactions/claim_daily',
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.38(0x1800262c) NetType/4G Language/zh_CN',
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Connection': 'keep-alive',
        'Cookie': cookie,
      },
      body: JSON.stringify({ csrfToken }),
    };
    $.post(options, async (err, resp, body) => {
      try {
        console.log(body);
        const { code, message } = JSON.parse(body);
        if (code !== 0) {
          $.msg($.name, `签到失败: ${message}`);
        } else {
          $.msg($.name, `签到成功`);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    });
  });
}

function Env(name) {
  // Surge 兼容代码
  this.name = name;
  this.msg = (title, subtitle, message) => $notification.post(title, subtitle, message);
  this.log = (msg) => console.log(msg);
  this.getdata = (key) => $persistentStore.read(key);
  this.setdata = (val, key) => $persistentStore.write(val, key);
  this.get = (options, callback) => $httpClient.get(options, callback);
  this.post = (options, callback) => $httpClient.post(options, callback);
  this.done = (val = {}) => $done(val);
  this.logErr = (err) => console.log(`❗️${this.name}, 错误!`, err);
}
