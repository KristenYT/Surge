# YouTube 整合模組（Surge 實機待驗證版）

## 下載包與安裝

本包是 **一個 Surge 模組 + 三個本機腳本**。Surge 的 sgmodule 以 script-path 引用 JavaScript；這不是可把 1 MB OpenCC 字典直接塞入設定的單檔格式。

1. 解壓 `YouTube.Integrated.zip`。
2. 將下列三個檔案存入 Surge 可讀取的本機腳本位置／設定目錄，保留檔名：
   - `youtube.response.js`
   - `youtube.tc.request.js`
   - `youtube.tc.response.js`
3. 匯入 `YouTube.Integrated.sgmodule`。內含相對 script-path；若你的 Surge 將模組與腳本存放於不同位置，請在 Surge 的腳本設定中將三個 script-path 指到對應的本機檔案。
4. 啟用 HTTPS 解密（MITM），安裝並完整信任 Surge CA 憑證。
5. **停用舊的 Maasea／Aioneas／其他 YouTube 改寫及字幕模組**，避免首個命中的 response script 攔走回應。
6. 強制結束 YouTube，再重新開啟。測試有字幕的影片，開啟 CC；視 App 是否記住先前選擇，可能要手動選擇新增的 `@Enhance (zh-Hant)` 字幕。

如需要可直接貼入 Surge 的「遠端模組網址」，需將模組與三個 JS 上傳到你可控制的 HTTPS 靜態空間，例如 GitHub raw；把三個 script-path 改成各自完整 HTTPS URL。本包尚未公開上傳，也沒有假設 minis:// 可供 Surge 讀取。

## 功能分工

| 元件 | 實作 |
|---|---|
| 去廣告 | 以使用者提供的 Aioneas 模組規則與 Aioneas 核心腳本快照為基礎 |
| 字幕翻譯 | 只移植 Maasea 現行 response 腳本的 `Pi` 字幕函式及語言列表；替換 Aioneas 原有字幕方法 |
| 繁中修正 | 參照 Chrome 外掛，取得 `zh-Hans` 翻譯後本機用 OpenCC `cn → twp` 轉換 |

**不載入 Maasea 完整 response 腳本，也不加入其 initplayback / log_event request 腳本。** 沒有將 Maasea 的去廣告函式移入整合碼。但 Aioneas 本身是包含 Maasea 衍生碼的專案；這不代表 Aioneas 上游沒有共用歷史。

Aioneas 的廣告規則、背景／PiP 設定及既有介面處理保留；`lyricLang` 為 off，這是影片字幕整合，不是 YouTube Music 歌詞翻譯。Aioneas 快照亦有既有的 Shorts 內容過濾；「隱藏Shorts按鈕」參數並非控制所有 Shorts 內容過濾。

預設字幕語言為 `zh-Hant`。若已有原生繁中字幕，優先使用，不強制改成機器翻譯。若需新增翻譯字幕軌，優先選英文來源，否則選既有第一條字幕；這沿用 Maasea 的選軌策略，不代表額外先把來源翻成英文。

## 為何不是只填 zh-Hant

已下載並核對指定 Chrome 外掛 CRX 1.0.9 及作者原始碼。

```text
來源字幕 lang 不動
  → tlang=zh-Hans（避開直接要求 zh-Hant 的結果）
  → origin_tlang=zh-Hant（標記）
  → OpenCC cn → twp（台灣繁體字詞）
```

外掛不修算時間戳、不先翻英文、不使用外部 Google Translate API。它利用簡中翻譯回應，迴避作者發現的繁中字幕分段／時間問題。OpenCC 只轉字詞，不會修正機器翻譯語意。

本版直接在新增的繁中字幕軌 URL 填入 Hans 與標記，讓自動字幕不依賴 Surge 在 response 階段是否保留 request 改寫後的 URL。另有 request 腳本處理手動選取的 Hant 翻譯。

### 與外掛相同與不同之處

- 相同：Hant → Hans 請求、OpenCC cn → twp，保留來源 lang。
- 改善：只作用於受限 timedtext 端點；JSON3 解碼後僅轉 `events[].segs[].utf8`，支援 `\uXXXX` 文字並保留其他欄位；空字幕陣列不拋錯。
- XML/srv3：仿外掛整份文字轉換，不重新計算時間。
- 原生繁中、一般簡中及其他翻譯不受強制轉換。

## 驗證狀態與限制

已於 Node 模擬 Surge globals 驗證（見 test-results.txt）：字幕選軌、已有繁中不重複、off、空字幕、真正 Player protobuf 編解碼、Hans 標記、JSON3／XML、Unicode 跳脫、時間及中繼資料保留、非 200／空回應略過。

**尚未在你的 Surge／YouTube iOS App 做 live MITM 測試，不保證現行每個帳號、影片、App 版本皆有效，也不保證所有廣告皆移除。**

- 沒有任何來源字幕的影片，不能憑此產生語音辨識字幕。
- 本版沿用 Aioneas 的 `youtubei.googleapis.com` protobuf 回應結構；若 App 使用新端點、加密播放器資料或不同格式，可能不觸發。
- 不加入 Maasea initplayback request 改寫，因此其新型串流協定的處理不在本版範圍。
- timedtext 涵蓋 youtube.com、www.youtube.com、m.youtube.com、video.google.com；其他實際端點需依去識別化日誌再修。
- 用戶手動直接選「簡體」仍維持簡體；自動生成的繁中軌在轉換腳本未載入／執行失敗時可能顯示簡體。
- OpenCC 字典約 1 MB；長影片完整回應緩衝有記憶體成本。timeout/max-size 設定不能保證所有情形。
- 不建議同時啟用 Chrome 修正外掛與本模組測試網頁版，避免重複攔截。

## 原始來源及可重現性

上游下載快照日期：2026-11-14。整合 JS 是本地固定快照，不會無聲追蹤上游更新；更新時需重新核對。

- Maasea 模組：https://raw.githubusercontent.com/Maasea/sgmodule/master/YouTube.Enhance.sgmodule
- 字幕函式來源：https://raw.githubusercontent.com/Maasea/sgmodule/master/Script/Youtube/youtube.response.js
- 使用者指定 Aioneas 模組：https://gist.githubusercontent.com/KristenYT/0158a7003f39fd616b3fcce92f88906a/raw/763101db764a163eaf003a3900608561de5a62bb/Youtube-adblock.sgmodule
- Aioneas 核心：https://raw.githubusercontent.com/Aioneas/Surge/main/Script/youtube.response.js
- Chrome 原碼：https://github.com/Frank0945/fix-yt-traditional-chinese-subtitle/blob/008c1fa397c1b10806c881d3a0f3b77d6dc09f07/src/injected.ts
- OpenCC：opencc-js 1.0.5 的 dist/umd/cn2t.js，https://registry.npmjs.org/opencc-js/-/opencc-js-1.0.5.tgz
- Surge API：https://manual.nssurge.com/scripting/http-request.html 及 https://manual.nssurge.com/scripting/http-response.html

來源均歸原作者所有。隨附 OpenCC MIT 授權；其餘上游快照保留供來源追溯，未將上游統一重新授權。部分 GitHub 下載因當時環境憑證鏈驗證失敗而以略過憑證驗證重試；SHA256SUMS 提供本次檔案識別，不是獨立的上游真實性證明。

開發檔：build.py、tc-response-tail.js、test.js、source/。使用 Python 3 重建播放器腳本；使用 Node 22 跑 test.js。繁中 response bundle 由 OpenCC UMD 加 tc-response-tail.js 組成。
