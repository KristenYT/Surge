// 使用 fetch 請求來動態加載 OpenCC 的 cn2t.js 腳本
$httpClient.get('https://raw.githubusercontent.com/KristenYT/Surge/refs/heads/main/Script/cn2t.js', function(error, response, body) {
    if (error) {
        console.error("無法加載 cn2t.js:", error);
        $done({ body: $response.body });
        return;
    }

    try {
        // 執行加載的腳本
        eval(body);

        // 確保 OpenCC 轉換器已經加載
        if (typeof OpenCC !== 'undefined') {
            const converter = OpenCC.Converter({ from: 'cn', to: 't' });

            // 獲取字幕內容
            let responseBody = $response.body;

            // 使用 OpenCC 進行簡體轉繁體
            converter.convertPromise(responseBody).then((traditionalText) => {
                $done({ body: traditionalText });
            }).catch((conversionError) => {
                console.error("轉換錯誤：", conversionError);
                $done({ body: responseBody });
            });
        } else {
            console.error("OpenCC 未正確加載");
            $done({ body: $response.body });
        }
    } catch (evalError) {
        console.error("腳本執行錯誤：", evalError);
        $done({ body: $response.body });
    }
});
