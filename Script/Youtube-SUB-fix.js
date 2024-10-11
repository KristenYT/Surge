// Surge Script to Fix YouTube Traditional Chinese Subtitle Timing Issue
// Based on https://github.com/Frank0945/fix-yt-traditional-chinese-subtitle

let body = $response.body;
let headers = $response.headers;

// 確保回應是字幕 XML
if (headers["Content-Type"] && headers["Content-Type"].includes("text/xml")) {
  // 修正字幕
  let fixedBody = fixTraditionalChineseSubtitle(body);

  // 返回修改後的字幕
  $done({
    body: fixedBody,
    headers: headers
  });
} else {
  // 非字幕回應則不做任何修改
  $done({});
}

// 修正 YouTube 字幕時間軌的功能
function fixTraditionalChineseSubtitle(data) {
  try {
    // 匹配 <text> 標籤，修正其 start 和 dur 屬性
    return data.replace(/<text start="([\d.]+)" dur="([\d.]+)">/g, function (match, start, dur) {
      // 將 start 和 dur 四捨五入保留三位小數
      let fixedStart = parseFloat(start).toFixed(3);
      let fixedDur = parseFloat(dur).toFixed(3);

      // 返回修正後的 <text> 標籤
      return `<text start="${fixedStart}" dur="${fixedDur}">`;
    });
  } catch (e) {
    console.log("Failed to fix subtitles:", e);
    // 如果修正失敗，返回原始數據
    return data;
  }
}
