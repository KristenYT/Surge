/*
脚本参考 @Helge_0x00 ,＠githubdulong
修改日期：2024.08.30
Surge配置参考注释
----------------------------------------
[Panel]
策略面板 = script-name=解鎖檢測,update-interval=7200
[Script]
解鎖檢測 = type=generic,timeout=120,script-path=https://raw.githubusercontent.com/KristenYT/Surge/main/Others/Media-Unlock.js,script-update-interval=0,argument=title=解锁检测&icon=headphones.circle&color=#FF2121
----------------------------------------
支持使用腳本使用 argument 參數自定義配置，如：argument=title=解鎖檢測&icon=headphones.circle&color=#FF2121，具體參數如下所示，
* title: 面板標題
* icon: SFSymbols 圖標
* color：圖標顏色
*/

const STATUS_COMING = 2;
const STATUS_AVAILABLE = 1;
const STATUS_NOT_AVAILABLE = 0;
const STATUS_TIMEOUT = -1;
const STATUS_ERROR = -2;
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36';
const REQUEST_HEADERS = {
  'User-Agent': UA,
  'Accept-Language': 'en',
};
const SUPPORTED_LOCATIONS = ["T1","XX","AL","DZ","AD","AO","AG","AR","AM","AU","AT","AZ","BS","BD","BB","BE","BZ","BJ","BT","BA","BW","BR","BG","BF","CV","CA","CL","CO","KM","CR","HR","CY","DK","DJ","DM","DO","EC","SV","EE","FJ","FI","FR","GA","GM","GE","DE","GH","GR","GD","GT","GN","GW","GY","HT","HN","HU","IS","IN","ID","IQ","IE","IL","IT","JM","JP","JO","KZ","KE","KI","KW","KG","LV","LB","LS","LR","LI","LT","LU","MG","MW","MY","MV","ML","MT","MH","MR","MU","MX","MC","MN","ME","MA","MZ","MM","NA","NR","NP","NL","NZ","NI","NE","NG","MK","NO","OM","PK","PW","PA","PG","PE","PH","PL","PT","QA","RO","RW","KN","LC","VC","WS","SM","ST","SN","RS","SC","SL","SG","SK","SI","SB","ZA","ES","LK","SR","SE","CH","TH","TG","TO","TT","TN","TR","TV","UG","AE","US","UY","VU","ZM","BO","BN","CG","CZ","VA","FM","MD","PS","KR","TW","TZ","TL","GB"];
const WARP_FEATURES = ["plus", "on"];

let args = getArgs();

(async () => {
  let now = new Date();
  let hour = now.getHours();
  let minutes = now.getMinutes();
  hour = hour > 9 ? hour : "0" + hour;
  minutes = minutes > 9 ? minutes : "0" + minutes;

  let panel_result = {
    title: `${args.title} | ${hour}:${minutes}` || `解鎖檢測 | ${hour}:${minutes}`,
    content: '',
    icon: args.icon || "eye.slash.circle.fill",
    "icon-color": args.color || "#ffb621",
  };

  // Parallelize API calls to improve speed
  let [disney, netflix, youtube, traceData] = await Promise.all([
    testDisneyPlus(),
    check_netflix(),
    check_youtube_premium(),
    getTraceData()
  ]);

  let disney_result = formatDisneyPlusResult(disney.status, disney.region);
  let gptSupportStatus = SUPPORTED_LOCATIONS.includes(traceData.loc) ? "ChatGPT: \u2611" : "ChatGPT: \u2612";

  let content = `${youtube} ${netflix}\n${gptSupportStatus}${traceData.loc.padEnd(3)}${disney_result} `;
  
  let log = `${hour}:${minutes}.${now.getMilliseconds()} 解鎖檢測完成：${content}`;
  console.log(log);

  panel_result['content'] = content;

  $done(panel_result);
})();

function getArgs() {
  return Object.fromEntries(
    $argument
      .split("&")
      .map((item) => item.split("="))
      .map(([k, v]) => [k, decodeURIComponent(v)])
  );
}

function formatDisneyPlusResult(status, region) {
  switch (status) {
    case STATUS_COMING:
      return `| Disney: 即將登陸~ ${region.toUpperCase()} `;
    case STATUS_AVAILABLE:
      return `| Disney: \u2611${region.toUpperCase()} `;
    case STATUS_NOT_AVAILABLE:
      return `| Disney: \u2612${region.toUpperCase()} `; // 顯示國家代碼
    case STATUS_TIMEOUT:
      return `| Disney: N/A   `;
    default:
      return `| Disney: 錯誤   `;
  }
}

async function check_youtube_premium() {
  let inner_check = () => {
    return new Promise((resolve, reject) => {
      let option = {
        url: 'https://www.youtube.com/premium',
        headers: REQUEST_HEADERS,
      };
      $httpClient.get(option, function (error, response, data) {
        if (error || response.status !== 200) {
          reject('Error');
          return;
        }

        if (data.indexOf('Premium is not available in your country') !== -1) {
          resolve('Not Available');
          return;
        }

        let region = '';
        let re = new RegExp('"countryCode":"(.*?)"', 'gm');
        let result = re.exec(data);
        if (result && result.length === 2) {
          region = result[1];
        } else if (data.indexOf('www.google.cn') !== -1) {
          region = 'CN';
        } else {
          region = 'US';
        }
        resolve(region);
      });
    });
  };

  let youtube_check_result = 'YouTube: ';

  await inner_check()
    .then((code) => {
      if (code === 'Not Available') {
        youtube_check_result += '\u2612' + traceData.loc.toUpperCase()+ '  |';
      } else {
        youtube_check_result += "\u2611" + code.toUpperCase()+ '  |';
      }
    })
    .catch(() => {
      youtube_check_result += 'N/A   |';
    });

  return youtube_check_result;
}

async function check_netflix() {
  let inner_check = (filmId) => {
    return new Promise((resolve, reject) => {
      let option = {
        url: 'https://www.netflix.com/title/' + filmId,
        headers: REQUEST_HEADERS,
      };
      $httpClient.get(option, function (error, response, data) {
        if (error) {
          reject('Error');
          return;
        }

        if (response.status === 403) {
          reject('Not Available');
          return;
        }

        if (response.status === 404) {
          resolve('Not Found');
          return;
        }

        if (response.status === 200) {
          let url = response.headers['x-originating-url'];
          let region = url.split('/')[3];
          region = region.split('-')[0];
          if (region === 'title') {
            region = 'US';
          }
          resolve(region);
          return;
        }

        reject('Error');
      });
    });
  };

  let netflix_check_result = 'Netflix: ';

  await inner_check(81280792)
    .then((code) => {
      if (code === 'Not Found') {
        return inner_check(80018499);
      }
      netflix_check_result += '\u2611' + code.toUpperCase() ;
      return Promise.reject('BreakSignal');
    })
    .then((code) => {
      if (code === 'Not Found') {
        return Promise.reject('Not Available');
      }

      netflix_check_result += '⚠' + code.toUpperCase() ;
      return Promise.reject('BreakSignal');
    })
    .catch((error) => {
      if (error === 'BreakSignal') {
        return;
      }
      if (error === 'Not Available') {
        netflix_check_result += '\u2612' + traceData.loc.toUpperCase() ;
        return;
      }
      netflix_check_result += 'N/A ';
    });

  return netflix_check_result;
}

async function testDisneyPlus() {
  try {
    // 尝试并行检测主页和位置信息，并处理可能的超时
    let { region, cnbl } = await Promise.race([testHomePage(), timeout(7000)]);
    console.log(`Homepage check: region=${region}, cnbl=${cnbl}`);
    
    let { countryCode, inSupportedLocation } = await Promise.race([getLocationInfo(), timeout(7000)]);
    console.log(`Location check: countryCode=${countryCode}, inSupportedLocation=${inSupportedLocation}`);

    // 如果成功获取到国家代码则使用，否则使用首页返回的region
    region = countryCode || region;

    // 判斷解鎖狀態
    if (!region) {
      // 如果無法獲取地區，視為不支持解鎖
      return { region: "N/A", status: STATUS_NOT_AVAILABLE };
    } else if (inSupportedLocation === false || inSupportedLocation === 'false') {
      // 如果不在支持的地區，顯示即將登錄
      return { region, status: STATUS_COMING };
    } else {
      // 支持解鎖
      return { region, status: STATUS_AVAILABLE };
    }

  } catch (error) {
    console.log("Error in Disney+ detection:", error);

    // 处理不同类型的错误
    if (error === 'Not Available') {
      return { status: STATUS_NOT_AVAILABLE };
    }

    if (error === 'Timeout') {
      return { status: STATUS_TIMEOUT };
    }

    return { status: STATUS_ERROR }; // 捕捉其他所有錯誤
  }
}

function timeout(delay = 5000) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject('Timeout');
    }, delay);
  });
}

async function getTraceData() {
  return new Promise((resolve, reject) => {
    $httpClient.get("http://chat.openai.com/cdn-cgi/trace", function(error, response, data) {
      if (error) {
        reject(error);
        return;
      }
      let lines = data.split("\n");
      let cf = lines.reduce((acc, line) => {
        let [key, value] = line.split("=");
        acc[key] = value;
        return acc;
      }, {});
      resolve(cf);
    });
  });
}