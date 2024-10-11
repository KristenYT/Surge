// 使用 fetch 請求來動態加載 OpenCC 的 cn2t.js 腳本1
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

            // 解析 JSON 格式的字幕
            let parsedBody;
            try {
                parsedBody = JSON.parse(responseBody);
            } catch (jsonError) {
                console.error("字幕內容不是 JSON 格式，將按文本進行轉換");
                parsedBody = null;
            }

            if (parsedBody) {
                // 對每段字幕進行簡轉繁，保留時間戳
                for (let i = 0; i < parsedBody.length; i++) {
                    if (parsedBody[i].segs) {
                        // 轉換每一段字幕的文字
                        for (let j = 0; j < parsedBody[i].segs.length; j++) {
                            parsedBody[i].segs[j].utf8 = converter.convert(parsedBody[i].segs[j].utf8);
                        }
                    }
                }

                // 返回轉換後的 JSON
                $done({ body: JSON.stringify(parsedBody) });
            } else {
                // 如果不是 JSON，將純文本進行轉換
                converter.convertPromise(responseBody).then((traditionalText) => {
                    $done({ body: traditionalText });
                }).catch((conversionError) => {
                    console.error("轉換錯誤：", conversionError);
                    $done({ body: responseBody });
                });
            }
        } else {
            console.error("OpenCC 未正確加載");
            $done({ body: $response.body });
        }
    } catch (evalError) {
        console.error("腳本執行錯誤：", evalError);
        $done({ body: $response.body });
    }
});
