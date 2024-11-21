// 异步获取节点策略名称的函数
async function getRequestInfo(regexp, PROXIES = []) {
  let POLICY = '';
  try {
    const { requests } = await httpAPI('/v1/requests/recent', 'GET');
    const request = requests.slice(0, 10).find(i => regexp.test(i.URL));
    POLICY = request ? request.policyName : '未知策略'; // 获取节点策略名称
  } catch (e) {
    $.logErr(`从最近请求中获取 ${regexp} 发生错误: ${e.message || e}`);
  }
  return { POLICY };
}

// 获取节点名称的函数
async function getNodeName() {
    const nodeNameRegexp = /node\/([\w-]+)/;  // 正则表达式根据实际情况调整
    const { POLICY } = await getRequestInfo(nodeNameRegexp);
    return POLICY;
}

// 第一步：获取外部 IP 地址信息
$httpClient.get({ url: "http://ip-api.com/json/" }, async function (error, response, data) {
    if (error) {
        console.log("获取 IP 信息失败:", error);
        return $done({
            title: "Scamalytics 查询失败",
            content: "无法获取 IP 信息，请检查网络连接或稍后重试。",
            icon: "exclamationmark.triangle",
            "icon-color": "#FF9500",
        });
    }

    let ipInfo;
    try {
        ipInfo = JSON.parse(data);
    } catch (e) {
        console.log("解析 IP 信息失败:", e);
        return $done({
            title: "Scamalytics 查询失败",
            content: "无法解析 IP 信息，请稍后重试。",
            icon: "xmark.octagon",
            "icon-color": "#FF3B30",
        });
    }

    if (ipInfo.status !== "success") {
        return $done({
            title: "Scamalytics 查询失败",
            content: "IP 信息无效，请稍后重试。",
            icon: "xmark.octagon",
            "icon-color": "#FF3B30",
        });
    }

    const ipValue = ipInfo.query;
    const city = ipInfo.city || "未知城市";
    const country = ipInfo.country || "未知国家";
    const isp = ipInfo.isp || "未知 ISP";
    const as = ipInfo.as || "未知 ASN";

    // 获取节点名称
    const nodeName = await getNodeName();

    // 第二步：查询 Scamalytics 信息
    $httpClient.get({ url: `https://scamalytics.com/search?ip=${ipValue}` }, function (error, response, data) {
        if (error) {
            console.log("查询 Scamalytics 信息失败:", error);
            return $done({
                title: "Scamalytics 查询失败",
                content: "无法查询 Scamalytics 信息，请稍后重试。",
                icon: "xmark.octagon",
                "icon-color": "#FF3B30",
            });
        }

        let preContent = data.match(/<pre[^>]*>([\s\S]*?)<\/pre>/);
        preContent = preContent ? preContent[1] : null;

        let score = "未知";
        let risk = "未知";
        if (preContent) {
            const jsonMatch = preContent.match(/({[\s\S]*?})/);
            if (jsonMatch) {
                try {
                    const parsedData = JSON.parse(jsonMatch[1]);
                    score = parsedData.score || "未知";
                    risk = parsedData.risk || "未知";
                } catch (e) {
                    console.log("解析 JSON 信息失败:", e);
                }
            }
        }

        const riskMap = {
            "very high": { emoji: "🔴", desc: "非常高风险" },
            high: { emoji: "🟠", desc: "高风险" },
            medium: { emoji: "🟡", desc: "中等风险" },
            low: { emoji: "🟢", desc: "低风险" },
        };
        const riskInfo = riskMap[risk] || { emoji: "⚪", desc: "未知风险" };

        const content = `
节点名称：${nodeName}
IP 地址：${ipValue}
城市：${city}
国家：${country}
ISP：${isp}
ASN：${as}
IP 欺诈分数：${score}
风险等级：${riskInfo.emoji} ${riskInfo.desc}
        `.trim();

        $done({
            title: "Scamalytics IP 查询",
            content: content,
            icon: "shield.lefthalf.filled",
            "icon-color": risk === "very high" || risk === "high" ? "#FF3B30" : risk === "medium" ? "#FF9500" : "#34C759",
        });
    });
});
