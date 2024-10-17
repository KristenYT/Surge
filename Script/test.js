/*
脚本引用 https://github.com/chavyleung/scripts/blob/master/follow/follow.js
*/
const $ = new Env('Follow每日签到');
$.desc = [];

const csrfToken = '007264b1f68b5341f4ab19d58979095f6173a2a64862bf1a308a807d05064949%7C190f057e9dcb57bec754a2b30559eee3b077e165d15e692a170ccb06b3ef2740';
const cookie = 'authjs.session-token=da64358f-6496-4ff4-8c11-340cc0094e1c';

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
    'Referer': 'https://api.follow.is/',
    'Cookie': cookie,
    // 'Authorization': 'Bearer YOUR_ACCESS_TOKEN' // 如需授權，取消註釋並填寫
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
