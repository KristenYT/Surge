// 動態加載 OpenCC 的 cn2t.js 腳本
$httpClient.get('https://raw.githubusercontent.com/KristenYT/Surge/refs/heads/main/Script/cn2t.js', function(error, response, body) {
    if (error) {
        console.error("無法加載 cn2t.js:", error);
        $done({});
        return;
    }

    // 將 cn2t.js 的代碼作為腳本執行
    eval(body);

    // 使用 OpenCC 進行簡體轉繁體的轉換
    const converter = OpenCC.Converter({ from: 'cn', to: 't' });

    // 取得 HTTP 回應的簡體字幕內容
    let responseBody = $response.body;

    // 將簡體字幕轉換為繁體字幕
    converter.convertPromise(responseBody).then((traditionalText) => {
        // 返回轉換後的繁體字幕
        $done({ body: traditionalText });
    }).catch((error) => {
        console.error("轉換錯誤：", error);
        $done({ body: responseBody });
    });
});
