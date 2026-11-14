# v2 診斷修訂版（實機待驗證）

針對使用者回報：字幕顯示錯誤，切換其他字幕仍失敗，很久後繁中才出現。

## 本次修改
- 在 Surge pattern 階段就排除原有字幕、一般簡中和其他目標語言，不再為它們載入約 1 MB OpenCC 腳本。
- 只讓繁中翻譯與本模組標記的簡中翻譯進入轉換。
- 繁中 response timeout 從 60 秒縮為 15 秒，這不是對網路延遲的修復保證；若逾時可能直接看到簡中。
- 加入 [YouTube TC] 診斷行：status、chars、converted、processing_ms。不輸出簽名網址、token 或字幕內容。
- processing_ms 只計入包內字幕處理，不含 Surge 載入／解析 OpenCC 程式的時間，也不含等待網路回應。
- 未變更 Aioneas 去廣告、字幕來源選擇及 YouTube 翻譯服務。

## 更新
停用舊模組，替換三個 JS 及模組，重新載入設定並強制結束 YouTube。不要同時啟用 v1 / v2。
請先測一段有英文原字幕的影片：選英文應不進入 yt.tc.response；再選新增繁中翻譯軌。

## 如仍失敗，需提供
1. Surge 腳本日誌中的 [YouTube TC] 與任何 timeout/error；
2. /api/timedtext 請求的 HTTP 狀態及總耗時；
3. 停用整合模組後，原有英文字幕是否立即正常。
不要提供完整 signed URL、Cookie、Authorization。

這是縮小攔截及增加診斷的修訂版，並非已證實修好根因。沒有實機抓包前不能判定是 OpenCC、YouTube 限流/授權、網路、App 重試或其他模組衝突。
