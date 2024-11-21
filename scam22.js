// SCAM21.JS: 加入節點名稱檢測功能

(async () => {
    // 節點名稱檢測
    const groupName = "Your-Group-Name"; // 替換為你的策略組名稱
    const selectedNode = (await httpAPI(`/v1/policy_groups/select?group_name=${encodeURIComponent(groupName)}`)).policy;

    if (selectedNode) {
        console.log(`檢測到當前節點名稱：${selectedNode}`);
    } else {
        console.log("無法檢測到節點名稱，請確認策略組名稱是否正確。");
    }

    // 原始 SCAM21.JS 功能
    $httpClient.get({ url: "http://ip-api.com/json/" }, function (error, response, data) {
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

        // 查询 Scamalytics 信息
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
节点名称：${selectedNode || "無法檢測到"}
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
})();

// 定义 httpAPI 函数，用于访问 Surge 内部 API
function httpAPI(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        $httpAPI(method, path, body, result => {
            if (result.error) {
                reject(result.error);
            } else {
                resolve(result);
            }
        });
    });
}
