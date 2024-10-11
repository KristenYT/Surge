// Surge Script to Fix YouTube Traditional Chinese Subtitle Timing Issue1

// 攔截和修改 YouTube 字幕 API 回應
let body = $response.body;
let headers = $response.headers;

// 確保回應的 Content-Type 是字幕 XML
if (headers["Content-Type"] && headers["Content-Type"].includes("text/xml")) {
  // 對字幕進行修正
  let fixedBody = fixTraditionalChineseSubtitle(body);

  // 返回修改後的字幕
  $done({
    body: fixedBody,
    headers: headers
  });
} else {
  // 如果回應不是字幕，則直接返回不修改
  $done({});
}

// 修正字幕時間軌的功能
function fixTraditionalChineseSubtitle(data) {
  try {
    // 匹配 <text> 標籤並修正其 start 和 dur 屬性
    return data.replace(/<text start="([\d.]+)" dur="([\d.]+)">/g, function (match, start, dur) {
      // 將 start 時間提前 0.5 秒
      let newStart = (parseFloat(start) - 0.5).toFixed(3);
      return `<text start="${newStart}" dur="${dur}">`;
    });
  } catch (e) {
    console.log("Failed to fix subtitles:", e);
    // 如果修正失敗，返回原始數據
    return data;
  }
}
