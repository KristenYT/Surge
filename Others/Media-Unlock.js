const REQUEST_HEADERS = { 
    'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36',
    'Accept-Language': 'en',
}

// 即将登陆
const STATUS_COMING = 2
// 支持解锁
const STATUS_AVAILABLE = 1
// 不支持解锁
const STATUS_NOT_AVAILABLE = 0
// 检测超时
const STATUS_TIMEOUT = -1
// 检测异常
const STATUS_ERROR = -2

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36'

;(async () => {
    let panel_result = {
        title: '流媒体解锁检测',
        content: '',
        icon: 'play.tv.fill',
        'icon-color': '#FF2D55',
    }
    
    // 同时检测多个服务
    let [{ region, status }] = await Promise.all([testDisneyPlus()])
    await Promise.all([check_chatgpt(), check_youtube_premium(), check_netflix()])
        .then((result) => {
        let disney_result = ''
        if (status == STATUS_COMING) {
            disney_result = 'Disney+: 即将登陆~ ' + region
        } else if (status == STATUS_AVAILABLE){
            disney_result = 'Disney+: 已解锁，区域: ' + region
        } else if (status == STATUS_NOT_AVAILABLE) {
            disney_result = 'Disney+: 未支持 🚫'
        } else if (status == STATUS_TIMEOUT) {
            disney_result = 'Disney+: 检测超时 🚦'
        }
        result.push(disney_result)

        // 将结果整合成面板内容
        let content = result.join('\n')
        panel_result['content'] = content
    })
    .finally(() => {
        $done(panel_result)
    })
})()

// 检测 ChatGPT
async function check_chatgpt() {
    let inner_check = () => {
        return new Promise((resolve, reject) => {
            let option = {
                url: 'http://chat.openai.com/cdn-cgi/trace',
                headers: REQUEST_HEADERS,
            }
            $httpClient.get(option, function(error, response, data) {
                if (error != null || response.status !== 200) {
                    reject('Error')
                    return
                }

                if (data.indexOf('ChatGPT is not available in your country') !== -1) {
                    resolve('Not Available')
                    return
                }

                let country = data.split('\n').reduce((acc, line) => {
                    let [key, value] = line.split('=')
                    acc[key] = value
                    return acc
                }, {})

                let result = country.loc
                if (result != null && result.length === 2) {
                    region = result
                } else {
                    region = 'US'
                }
                resolve(region) // 返回区域信息，不再包含国旗
            })
        })
    }

    let check_result = 'ChatGPT: '

    await inner_check()
        .then((code) => {
        if (code === 'Not Available') {
            check_result += '不支持解锁'
        } else {
            check_result += '已解锁，区域: ' + code.toUpperCase()
        }
    })
        .catch((error) => {
        check_result += '检测失败，请刷新面板'
    })

    return check_result
}

// 检测 YouTube Premium
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
                resolve(region) // 只返回区域代码
            })
        })
    }

    let youtube_check_result = 'YouTube: '

    await inner_check()
        .then((code) => {
        if (code === 'Not Available') {
            youtube_check_result += '不支持解锁'
        } else {
            youtube_check_result += '已解锁，区域: ' + code
        }
    })
        .catch((error) => {
        youtube_check_result += '检测失败，请刷新面板'
    })

    return youtube_check_result
}

// 检测 Netflix
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
                    resolve(region) // 只返回区域代码
                    return
                }

                reject('Error')
            })
        })
    }

    let netflix_check_result = 'Netflix: '

    await inner_check(81280792)
        .then((code) => {
        if (code === 'Not Found') {
            return inner_check(80018499)
        }
        netflix_check_result += '已完整解锁，区域: ' + code
        return Promise.reject('BreakSignal')
    })
        .then((code) => {
        if (code === 'Not Found') {
            return Promise.reject('Not Available')
        }

        netflix_check_result += '仅解锁自制剧，区域: ' + code
        return Promise.reject('BreakSignal')
    })
        .catch((error) => {
        if (error === 'BreakSignal') {
            return
        }
        if (error === 'Not Available') {
            netflix_check_result += '该节点不支持解锁'
            return
        }
        netflix_check_result += '检测失败，请刷新面板'
    })

    return netflix_check_result
}

// 检测 Disney+
async function testDisneyPlus() {
    try {
        let {region, cnbl} = await Promise.race([testHomePage(), timeout(7000)])

        let { countryCode, inSupportedLocation } = await Promise.race([getLocationInfo(), timeout(7000)])

        region = countryCode ?? region

        if (region != null) {
            region = region.toUpperCase()
        }

        // 即将登陆
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
