/**********
 * Scamalytics IP 欺詐評分查詢
 * 修改者：基於原始代碼優化
 * 更新日期：2024年11月22日
 **********/

let nodeName = '';  // 將 nodeName 宣告為全局變量

// 獲取節點名稱的函數
async function getCurrentNodeName() {
  // 使用 API 獲取當前請求的最近連接
  if ($.isSurge()) {
    const res = await httpAPI('/v1/requests/recent', 'GET');
    const requests = res.requests;

    // 遍歷最近的請求以找到節點信息
    if (requests && requests.length > 0) {
      const request = requests[0]; // 獲取最近的一個請求
      nodeName = request.policyName || '未知節點'; // 獲取策略名稱，即節點名稱
    }
  }
}

// 第一步：獲取當前節點名稱
getCurrentNodeName().then(() => {
  // 第二步：獲取外部 IP 地址信息
  $httpClient.get({ url: "http://ip-api.com/json/" }, function (error, response, data) {
    if (error) {
      console.log("獲取 IP 資訊失敗:", error);
      return $done({
        title: "Scamalytics 查詢失敗",
        content: "無法獲取 IP 資訊，請檢查網絡連線或稍後重試。",
        icon: "exclamationmark.triangle",
        "icon-color": "#FF9500",
      });
    }

    let ipInfo;
    try {
      ipInfo = JSON.parse(data);
    } catch (e) {
      console.log("解析 IP 資訊失敗:", e);
      return $done({
        title: "Scamalytics 查詢失敗",
        content: "無法解析 IP 資訊，請稍後重試。",
        icon: "xmark.octagon",
        "icon-color": "#FF3B30",
      });
    }

    if (ipInfo.status !== "success") {
      return $done({
        title: "Scamalytics 查詢失敗",
        content: "IP 資訊無效，請稍後重試。",
        icon: "xmark.octagon",
        "icon-color": "#FF3B30",
      });
    }

    const ipValue = ipInfo.query;
    const city = ipInfo.city || "未知城市";
    const country = ipInfo.country || "未知國家";
    const isp = ipInfo.isp || "未知 ISP";
    const as = ipInfo.as || "未知 ASN";

    // 第三步：查詢 Scamalytics 資訊
    $httpClient.get({ url: `https://scamalytics.com/search?ip=${ipValue}` }, function (error, response, data) {
      if (error) {
        console.log("查詢 Scamalytics 資訊失敗:", error);
        return $done({
          title: "Scamalytics 查詢失敗",
          content: "無法查詢 Scamalytics 資訊，請稍後重試。",
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
            console.log("解析 JSON 資訊失敗:", e);
          }
        }
      }

      const riskMap = {
        "very high": { emoji: "🔴", desc: "非常高風險" },
        high: { emoji: "🟠", desc: "高風險" },
        medium: { emoji: "🟡", desc: "中等風險" },
        low: { emoji: "🟢", desc: "低風險" },
      };
      const riskInfo = riskMap[risk] || { emoji: "⚪", desc: "未知風險" };

      const content = `
節點名稱：${nodeName}
IP 地址：${ipValue}
城市：${city}
國家：${country}
ISP：${isp}
ASN：${as}
IP 欺詐分數：${score}
風險等級：${riskInfo.emoji} ${riskInfo.desc}
      `.trim();

      $done({
        title: "Scamalytics IP 查詢",
        content: content,
        icon: "shield.lefthalf.filled",
        "icon-color": risk === "very high" || risk === "high" ? "#FF3B30" : risk === "medium" ? "#FF9500" : "#34C759",
      });
    });
  });
});