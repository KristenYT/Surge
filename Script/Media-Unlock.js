/*
腳本參考.修改自 @CyWr110 , @githubdulong , @Saga
修改日期：2024.10.18
 ----------------------------------------
 */
const REQUEST_HEADERS = { 
    'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36',
    'Accept-Language': 'en',
}

// 即將登陸
const STATUS_COMING = 2
// 支持解鎖
const STATUS_AVAILABLE = 1
// 不支持解鎖
const STATUS_NOT_AVAILABLE = 0
// 檢測超時
const STATUS_TIMEOUT = -1
// 檢測異常
const STATUS_ERROR = -2

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36'

let args = getArgs();

;(async () => {
    let now = new Date();
    let hour = now.getHours();
    let minutes = now.getMinutes();
    hour = hour > 9 ? hour : "0" + hour;
    minutes = minutes > 9 ? minutes : "0" + minutes;

    // 根據傳入的參數設置面板標題和圖標
    let panel_result = {
        title: `${args.title} | ${hour}:${minutes}` || `解鎖檢測 | ${hour}:${minutes}`,
        content: '',
        icon: args.icon || 'play.tv.fill',
        'icon-color': args.color || '#FF2D55',
    };


    
    // 同時檢測多個服務
    let [{ region, status }] = await Promise.all([testDisneyPlus()])
    await Promise.all([check_chatgpt(), check_youtube_premium(), check_netflix()])
        .then((result) => {
        let disney_result = ''
        if (status == STATUS_COMING) {
            disney_result = 'Disney\u2009➟ \u2009≈ ' + region
        } else if (status == STATUS_AVAILABLE){
            disney_result = 'Disney\u2009➟ \u2611\u2009' + region
        } else if (status == STATUS_NOT_AVAILABLE) {
            disney_result = 'Disney\u2009➟ \u2612'
        } else if (status == STATUS_TIMEOUT) {
            disney_result = 'Disney\u2009➟ N/A'
        } else {
            disney_result = 'Disney\u2009➟ N/A';
        }
        result.push(disney_result)

        // 將結果整合成面板內容
        let youtube_netflix = [result[1], result[2]].join('\t|  ')
        let chatgpt_disney = [result[0], result[3]].join('\t|  ')
        
        // 更新面板內容
        panel_result['content'] = youtube_netflix + '\n' + chatgpt_disney
    })
    .finally(() => {
        $done(panel_result)
    })
})()


// 參數處理函數
function getArgs() {
    return Object.fromEntries(
        $argument.split("&").map(item => item.split("=")).map(([k, v]) => [k, decodeURIComponent(v)])
    );
}



// 檢測 ChatGPT
async function check_chatgpt() {
    const log = (message) => console.log(message);

    // 使用簡單的內存緩存
    const cache = {};

    // 從 CDN 提取地區代碼
    let getRegionCode = () => {
        return new Promise((resolve, reject) => {
            let option = {
                url: 'http://chat.openai.com/cdn-cgi/trace',
                headers: REQUEST_HEADERS,
            };

            // 發起請求
            $httpClient.get(option, function(error, response, data) {
                if (error != null || response.status !== 200) {
                    reject('Error');
                    return;
                }

                // 解析回應數據
                let lines = data.split("\n");
                let cf = lines.reduce((acc, line) => {
                    let [key, value] = line.split("=");
                    acc[key] = value;
                    return acc;
                }, {});

                // 提取地區代碼
                let country_code = cf.loc;
                let restricted_countries = ['HK', 'RU', 'CN', 'KP', 'CU', 'IR', 'SY'];  // 限制地區

                // 檢測該地區是否受限
                if (restricted_countries.includes(country_code)) {
                    resolve('Not Available');
                } else {
                    resolve(country_code.toUpperCase());
                }
            });
        });
    };

    async function fetchDataWithTimeout(url, headers, timeout = 5000) { // 默認超時 5 秒
        if (cache[url]) return cache[url];

        return Promise.race([
            new Promise((resolve, reject) => {
                $httpClient.get({ url, headers }, (error, response, data) => {
                    if (error) {
                        reject(`ChatGPT: 檢測失敗 (網絡連接問題 - ${url})`);
                    } else {
                        cache[url] = data;
                        resolve(data);
                    }
                });
            }),
            new Promise((_, reject) => setTimeout(() => reject('請求超時'), timeout))
        ]);
    }

    try {
        // 獲取地區代碼
        const region_code = await getRegionCode();

        // 發送其他 API 請求
        const [cookieResponse, vpnResponse] = await Promise.all([
            fetchDataWithTimeout('https://api.openai.com/compliance/cookie_requirements', {
                'authority': 'api.openai.com',
                'accept': '*/*',
                'authorization': 'Bearer null',
                'content-type': 'application/json',
            }),
            fetchDataWithTimeout('https://ios.chat.openai.com/', {
                'authority': 'ios.chat.openai.com',
                'accept': '*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            })
        ]);

        const isCountryUnsupported = cookieResponse.toLowerCase().includes('unsupported_country');

        if (isCountryUnsupported || region_code === 'Not Available') {
            return `ChatGPT➟ \u2612    `;
        }

        const isVpnRestricted = vpnResponse.toLowerCase().includes('vpn');

        let check_result = `ChatGPT➟ `;
        check_result += !isVpnRestricted ? `\u2611\u2009${region_code}` : `⚠\u2009${region_code}`;

        return check_result;
    } catch (error) {
        return `ChatGPT➟  N/A    `;
    }
}

// 檢測 YouTube Premium
async function check_youtube_premium() {
    let inner_check = () => {
        return new Promise((resolve, reject) => {
            let option = {
                url: 'https://www.youtube.com/premium',
                headers: REQUEST_HEADERS,
            }
            $httpClient.get(option, function (error, response, data) {
                if (error != null || response.status !== 200) {
                    reject('Error')
                    return
                }

                if (data.indexOf('Premium is not available in your country') !== -1) {
                    resolve('Not Available')
                    return
                }

                let region = ''
                let re = new RegExp('"countryCode":"(.*?)"', 'gm')
                let result = re.exec(data)
                if (result != null && result.length === 2) {
                    region = result[1].toUpperCase()
                } else if (data.indexOf('www.google.cn') !== -1) {
                    region = 'CN'
                } else {
                    region = 'US'
                }
                resolve(region) 
            })
        })
    }

    let youtube_check_result = 'YouTube ➟ '

    await inner_check()
        .then((code) => {
        if (code === 'Not Available') {
            youtube_check_result += '\u2612     \u2009'
        } else {
            youtube_check_result += '\u2611\u2009' + code
        }
    })
        .catch((error) => {
        youtube_check_result += '\u2009N/A '
    })

    return youtube_check_result
}

// 檢測 Netflix
async function check_netflix() {
    let inner_check = (filmId) => {
        return new Promise((resolve, reject) => {
            let option = {
                url: 'https://www.netflix.com/title/' + filmId,
                headers: REQUEST_HEADERS,
            }
            $httpClient.get(option, function (error, response, data) {
                if (error != null) {
                    reject('Error')
                    return
                }

                if (response.status === 403) {
                    reject('Not Available')
                    return
                }

                if (response.status === 404) {
                    resolve('Not Found')
                    return
                }

                if (response.status === 200) {
                    let url = response.headers['x-originating-url']
                    let region = url.split('/')[3]
                    region = region.split('-')[0]
                    if (region == 'title') {
                        region = 'US'
                    }
                    if (region != null) {
                        region = region.toUpperCase()
                    }
                    resolve(region) 
                    return
                }

                reject('Error')
            })
        })
    }

    let netflix_check_result = 'Netflix ➟ '

    await inner_check(81280792)
        .then((code) => {
        if (code === 'Not Found') {
            return inner_check(80018499)
        }
        netflix_check_result += '\u2611\u2009' + code
        return Promise.reject('BreakSignal')
    })
        .then((code) => {
        if (code === 'Not Found') {
            return Promise.reject('Not Available')
        }

        netflix_check_result += '⚠\u2009' + code
        return Promise.reject('BreakSignal')
    })
        .catch((error) => {
        if (error === 'BreakSignal') {
            return
        }
        if (error === 'Not Available') {
            netflix_check_result += '\u2612'
            return
        }
        netflix_check_result += 'N/A'
    })

    return netflix_check_result
}

// 檢測 Disney+
async function testDisneyPlus() {
    try {
        let {region, cnbl} = await Promise.race([testHomePage(), timeout(7000)])

        let { countryCode, inSupportedLocation } = await Promise.race([getLocationInfo(), timeout(7000)])

        region = countryCode ?? region

        if (region != null) {
            region = region.toUpperCase()
        }

        // 即將登陸
        if (inSupportedLocation === false || inSupportedLocation === 'false') {
            return {region, status: STATUS_COMING}
        } else {
            return {region, status: STATUS_AVAILABLE}
        }

    } catch (error) {
        if (error === 'Not Available') {
            return {status: STATUS_NOT_AVAILABLE}
        }

        if (error === 'Timeout') {
            return {status: STATUS_TIMEOUT}
        }

        return {status: STATUS_ERROR}
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
        }

        $httpClient.post(opts, function (error, response, data) {
            if (error) {
                reject('Error')
                return
            }

            if (response.status !== 200) {
                reject('Not Available')
                return
            }

            data = JSON.parse(data)
            if(data?.errors){
                reject('Not Available')
                return
            }

            let {
                token: {accessToken},
                session: {
                    inSupportedLocation,
                    location: {countryCode},
                },
            } = data?.extensions?.sdk
            resolve({inSupportedLocation, countryCode, accessToken})
        })
    })
}

function testHomePage() {
    return new Promise((resolve, reject) => {
        let opts = {
            url: 'https://www.disneyplus.com/',
            headers: {
                'Accept-Language': 'en',
                'User-Agent': UA,
            },
        }

        $httpClient.get(opts, function (error, response, data) {
            if (error) {
                reject('Error')
                return
            }
            if (response.status !== 200 || data.indexOf('Sorry, Disney+ is not available in your region.') !== -1) {
                reject('Not Available')
                return
            }

            let match = data.match(/Region: ([A-Za-z]{2})[\s\S]*?CNBL: ([12])/)
            if (!match) {
                resolve({region: '', cnbl: ''})
                return
            }

            let region = match[1]
            let cnbl = match[2]
            resolve({region, cnbl})
        })
    })
}

function timeout(delay = 5000) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject('Timeout')
        }, delay)
    })
}

function getIcon(code, icons) {
    if (code != null && code.length === 2){
        for (let i = 0; i < icons.length; i++) {
            if (icons[i][0] === code) {
                return icons[i][1] + code
            }
        }
    }
    return code
}
