/*

脚本参考 @Helge_0x00 ,＠githubdulong
修改日期：2024.08.30
Surge配置参考注释
 
 ----------------------------------------
 
[Panel]
策略面板 = script-name=解鎖檢測,update-interval=7200

[Script]
解鎖檢測 = type=generic,timeout=30,script-path=https://raw.githubusercontent.com/githubdulong/Script/master/Stream-All.js,script-update-interval=0,argument=title=解锁检测&icon=headphones.circle&color=#FF2121

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
const SUPPORTED_LOCATIONS = ["🏴‍☠️T1”,“❌XX”,“🇦🇱AL”,“🇩🇿DZ”,“🇦🇩AD”,“🇦🇴AO”,“🇦🇬AG”,“🇦🇷AR”,“🇦🇲AM”,“🇦🇺AU”,“🇦🇹AT”,“🇦🇿AZ”,“🇧🇸BS”,“🇧🇩BD”,“🇧🇧BB”,“🇧🇪BE”,“🇧🇿BZ”,“🇧🇯BJ”,“🇧🇹BT”,“🇧🇦BA”,“🇧🇼BW”,“🇧🇷BR”,“🇧🇬BG”,“🇧🇫BF”,“🇨🇻CV”,“🇨🇦CA”,“🇨🇱CL”,“🇨🇴CO”,“🇰🇲KM”,“🇨🇷CR”,“🇭🇷HR”,“🇨🇾CY”,“🇩🇰DK”,“🇩🇯DJ”,“🇩🇲DM”,“🇩🇴DO”,“🇪🇨EC”,“🇸🇻SV”,“🇪🇪EE”,“🇫🇯FJ”,“🇫🇮FI”,“🇫🇷FR”,“🇬🇦GA”,“🇬🇲GM”,“🇬🇪GE”,“🇩🇪DE”,“🇬🇭GH”,“🇬🇷GR”,“🇬🇩GD”,“🇬🇹GT”,“🇬🇳GN”,“🇬🇼GW”,“🇬🇾GY”,“🇭🇹HT”,“🇭🇳HN”,“🇭🇺HU”,“🇮🇸IS”,“🇮🇳IN”,“🇮🇩ID”,“🇮🇶IQ”,“🇮🇪IE”,“🇮🇱IL”,“🇮🇹IT”,“🇯🇲JM”,“🇯🇵JP”,“🇯🇴JO”,“🇰🇿KZ”,“🇰🇪KE”,“🇰🇮KI”,“🇰🇼KW”,“🇰🇬KG”,“🇱🇻LV”,“🇱🇧LB”,“🇱🇸LS”,“🇱🇷LR”,“🇱🇮LI”,“🇱🇹LT”,“🇱🇺LU”,“🇲🇬MG”,“🇲🇼MW”,“🇲🇾MY”,“🇲🇻MV”,“🇲🇱ML”,“🇲🇹MT”,“🇲🇭MH”,“🇲🇷MR”,“🇲🇺MU”,“🇲🇽MX”,“🇲🇨MC”,“🇲🇳MN”,“🇲🇪ME”,“🇲🇦MA”,“🇲🇿MZ”,“🇲🇲MM”,“🇳🇦NA”,“🇳🇷NR”,“🇳🇵NP”,“🇳🇱NL”,“🇳🇿NZ”,“🇳🇮NI”,“🇳🇪NE”,“🇳🇬NG”,“🇲🇰MK”,“🇳🇴NO”,“🇴🇲OM”,“🇵🇰PK”,“🇵🇼PW”,“🇵🇦PA”,“🇵🇬PG”,“🇵🇪PE”,“🇵🇭PH”,“🇵🇱PL”,“🇵🇹PT”,“🇶🇦QA”,“🇷🇴RO”,“🇷🇼RW”,“🇰🇳KN”,“🇱🇨LC”,“🇻🇨VC”,“🇼🇸WS”,“🇸🇲SM”,“🇸🇹ST”,“🇸🇳SN”,“🇷🇸RS”,“🇸🇨SC”,“🇸🇱SL”,“🇸🇬SG”,“🇸🇰SK”,“🇸🇮SI”,“🇸🇧SB”,“🇿🇦ZA”,“🇪🇸ES”,“🇱🇰LK”,“🇸🇷SR”,“🇸🇪SE”,“🇨🇭CH”,“🇹🇭TH”,“🇹🇬TG”,“🇹🇴TO”,“🇹🇹TT”,“🇹🇳TN”,“🇹🇷TR”,“🇹🇻TV”,“🇺🇬UG”,“🇦🇪AE”,“🇺🇸US”,“🇺🇾UY”,“🇻🇺VU”,“🇿🇲ZM”,“🇧🇴BO”,“🇧🇳BN”,“🇨🇬CG”,“🇨🇿CZ”,“🇻🇦VA”,“🇫🇲FM”,“🇲🇩MD”,“🇵🇸PS”,“🇰🇷KR”,“🇹🇼TW”,“🇹🇿TZ”,“🇹🇱TL”,“🇬🇧GB”];
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

  let [{ region, status }] = await Promise.all([testDisneyPlus()]);
  let youtubeResult = await check_youtube_premium();
  let netflixResult = await check_netflix();

  let disney_result = formatDisneyPlusResult(status, region);
  let content = `${youtubeResult} ${netflixResult} ${disney_result}`;
  
  let traceData = await getTraceData();
  let gptSupportStatus = SUPPORTED_LOCATIONS.includes(traceData.loc) ? "ChatGPT: \u2611" : "ChatGPT: \u2612";

  content += ` ${gptSupportStatus}${traceData.loc}`;

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
      return `Disney+: 即將登陸~ ${region.toUpperCase()} |`;
    case STATUS_AVAILABLE:
      return `Disney+: \u2611${region.toUpperCase()} |`;
    case STATUS_NOT_AVAILABLE:
      return `Disney+: \u2612 |`;
    case STATUS_TIMEOUT:
      return `Disney+: N/A |`;
    default:
      return `Disney+: 错误 |`;
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
        youtube_check_result += '\u2612 |';
      } else {
        youtube_check_result += "\u2611" + code.toUpperCase() + ' |';
      }
    })
    .catch(() => {
      youtube_check_result += 'N/A |';
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
        netflix_check_result += '\u2612';
        return;
      }
      netflix_check_result += 'N/A';
    });

  return netflix_check_result;
}

async function testDisneyPlus() {
  try {
    let { region, cnbl } = await Promise.race([testHomePage(), timeout(7000)]);
    console.log(`homepage: region=${region}, cnbl=${cnbl}`);
    let { countryCode, inSupportedLocation } = await Promise.race([getLocationInfo(), timeout(7000)]);
    console.log(`getLocationInfo: countryCode=${countryCode}, inSupportedLocation=${inSupportedLocation}`);

    region = countryCode ?? region;
    console.log("region:" + region);
    // 即將登陸
    if (inSupportedLocation === false || inSupportedLocation === 'false') {
      return { region, status: STATUS_COMING };
    } else {
      // 支持解鎖
      return { region, status: STATUS_AVAILABLE };
    }

  } catch (error) {
    console.log("error:" + error);

    // 不支持解鎖
    if (error === 'Not Available') {
      console.log("不支持");
      return { status: STATUS_NOT_AVAILABLE };
    }

    // 檢測超時
    if (error === 'Timeout') {
      return { status: STATUS_TIMEOUT };
    }

    return { status: STATUS_ERROR };
  }
}

function getLocationInfo() {
  return new Promise((resolve, reject) => {
    let opts = {
      url: 'https://disney.api.edge.bamgrid.com/graph/v1/device/graphql',
      headers: {
        'Accept-Language': 'en',
        Authorization: 'ZGlzbmV5JmJyb3dzZXImMS4wLjA.Cu56AgSfBTDag5NiRA81oLHkDZfu5L3CKadnefEAY84',
        'Content-Type': 'application/json',
        'User-Agent': UA,
      },
      body: JSON.stringify({
        query: 'mutation registerDevice($input: RegisterDeviceInput!) { registerDevice(registerDevice: $input) { grant { grantType assertion } } }',
        variables: {
          input: {
            applicationRuntime: 'chrome',
            attributes: {
              browserName: 'chrome',
              browserVersion: '94.0.4606',
              manufacturer: 'apple',
              model: null,
              operatingSystem: 'macintosh',
              operatingSystemVersion: '10.15.7',
              osDeviceIds: [],
            },
            deviceFamily: 'browser',
            deviceLanguage: 'en',
            deviceProfile: 'macosx',
          },
        },
      }),
    };

    $httpClient.post(opts, function (error, response, data) {
      if (error) {
        reject('Error');
        return;
      }

      if (response.status !== 200) {
        console.log('getLocationInfo: ' + data);
        reject('Not Available');
        return;
      }

      data = JSON.parse(data);
      if (data?.errors) {
        console.log('getLocationInfo: ' + data);
        reject('Not Available');
        return;
      }

      let {
        token: { accessToken },
        session: {
          inSupportedLocation,
          location: { countryCode },
        },
      } = data?.extensions?.sdk;
      resolve({ inSupportedLocation, countryCode, accessToken });
    });
  });
}

function testHomePage() {
  return new Promise((resolve, reject) => {
    let opts = {
      url: 'https://www.disneyplus.com/',
      headers: {
        'Accept-Language': 'en',
        'User-Agent': UA,
      },
    };

    $httpClient.get(opts, function (error, response, data) {
      if (error) {
        reject('Error');
        return;
      }
      if (response.status !== 200 || data.indexOf('Sorry, Disney+ is not available in your region.') !== -1) {
        reject('Not Available');
        return;
      }

      let match = data.match(/Region: ([A-Za-z]{2})[\s\S]*?CNBL: ([12])/);
      if (!match) {
        resolve({ region: '', cnbl: '' });
        return;
      }

      let region = match[1];
      let cnbl = match[2];
      resolve({ region, cnbl });
    });
  });
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
