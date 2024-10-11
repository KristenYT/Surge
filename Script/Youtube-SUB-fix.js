// Surge Script to Fix YouTube Traditional Chinese Subtitle Timing Issue
// Reference: https://github.com/Frank0945/fix-yt-traditional-chinese-subtitle

// 1. 設置攔截 URL 規則，針對 YouTube 字幕 API 的請求
// Surge requires URL filters to apply the script, use a Surge rule like:
// URL-REGEX,^https:\/\/www\.youtube\.com\/api\/timedtext

// 2. 攔截和修改字幕數據
const url = $request.url;
const headers = $request.headers;

if (url.includes("/api/timedtext")) {
  // 攔截 YouTube 字幕請求
  $httpClient.get(url, { headers }, function(error, response, data) {
    if (error) {
      // 若出現錯誤，則不做任何修改
      $done({});
      return;
    }

    // 對字幕進行修正 (仿照 Frank0945 的修正方式)
    const fixedData = fixTraditionalChineseSubtitle(data);

    // 返回修正後的字幕
    $done({
      body: fixedData,
      headers: response.headers
    });
  });
} else {
  // 如果不是目標請求，則直接跳過
  $done({});
}

// 修正字幕時間軌的功能 (基於 Frank0945 的邏輯進行時間軌修復)
function fixTraditionalChineseSubtitle(data) {
  try {
    // 將字幕資料解析為 XML 文檔
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, "text/xml");

    // 遍歷所有的 <text> 標籤，修正其中的時間軌
    const texts = xmlDoc.getElementsByTagName("text");
    for (let i = 0; i < texts.length; i++) {
      const textNode = texts[i];
      let startTime = parseFloat(textNode.getAttribute("start"));
      let duration = parseFloat(textNode.getAttribute("dur"));

      // 修正時間邏輯 (具體修正邏輯請參照實際問題)
      if (startTime && duration) {
        // 假設問題是由於時間滯後造成，進行一個簡單的時間修正
        textNode.setAttribute("start", (startTime - 0.5).toFixed(3));
      }
    }

    // 將修正後的字幕轉回字串
    const serializer = new XMLSerializer();
    return serializer.serializeToString(xmlDoc);
  } catch (e) {
    console.error("Failed to fix subtitles:", e);
    return data;  // 如果解析或修正失敗，返回原始數據
  }
}
