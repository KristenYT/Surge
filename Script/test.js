let args = getArgs(); // 從 Surge 傳入參數

!(async () => {
  let tasks = [
    {
      csrfToken: args.csrfToken1 || 'csrfToken1',
      cookie: args.cookie1 || 'cookie1',
      name: args.name1 || 'name1'
    },
    {
      csrfToken: args.csrfToken2 || 'csrfToken2',
      cookie: args.cookie2 || 'cookie2',
      name: args.name2 || 'name2'
    }
  ];

  for (let task of tasks) {
    await sign(task);
  }

  $done(); // Surge結束指令
})().catch((e) => console.log(e));

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

    $httpClient.post(options, (err, resp, body) => {
      if (err) {
        console.log(`Error signing in for ${task.name}:`, err);
      } else {
        try {
          const { code, message } = JSON.parse(body);
          const result = code === 0 ? '簽到成功' : `簽到失敗：${message}`;
          console.log(`[${task.name}] ➟ ${result}`);
        } catch (e) {
          console.log(`Error parsing response for ${task.name}:`, e);
        }
      }
      resolve();
    });
  });
}

function getArgs() {
  return Object.fromEntries(
    $argument
      .split("&")
      .map((item) => item.split("="))
      .map(([k, v]) => [k, decodeURIComponent(v)])
  );
}
