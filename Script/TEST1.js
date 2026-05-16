// =============UserScript=============
// @name         TMDB泰國電視公司聚合
// @version      1.1.1
// @description  聚合 TMDB 泰國電視公司
// @author       Kristen
// =============UserScript=============

// 補充缺失的函數
function getBeijingDate() {
    const now = new Date();
    const beijingTime = now.getTime() + (8 * 60 * 60 * 1000);
    const beijingDate = new Date(beijingTime);
    const year = beijingDate.getUTCFullYear();
    const month = String(beijingDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(beijingDate.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

WidgetMetadata = {
  id: "forward.combined.media.thai.tvnetworks",
  title: "TMDB泰國電視台",
  description: "聚合TMDB泰國電視台",
  author: "Kristen",
  site: "https://github.com/quantumultxx/FW-Widgets",
  version: "1.1.1",
  requiredVersion: "0.0.1",
  detailCacheDuration: 60,
  modules: [
    {
      id: "thai_companies",
      title: "TMDB 泰國出品公司",
      functionName: "tmdbDiscoverByNetwork",
      cacheDuration: 3600,
      params: [
        {
          name: "with_networks",
          title: "電視台",
          type: "enumeration",
          value: "",
          description: "選擇一個泰國電視台以查看其劇集內容",
          enumOptions: [
            { title: "全部", value: "" },
            { title: "One31", value: "1784" },
            { title: "Amarin TV", value: "3281" },
            { title: "Channel 3", value: "344" },
            { title: "GMM 25", value: "1974" },

            // ✅ 新增（公司類型）
            { title: "GMMTV", value: "company:139247" }
          ]
        },
        {
          name: "with_genres",
          title: "🎭內容類型",
          type: "enumeration",
          description: "選擇要篩選的內容類型",
          value: "",
          enumOptions: [
            { title: "全部類型", value: "" },
            { title: "犯罪", value: "80" },
            { title: "動畫", value: "16" },
            { title: "喜劇", value: "35" },
            { title: "劇情", value: "18" },
            { title: "家庭", value: "10751" },
            { title: "兒童", value: "10762" },
            { title: "懸疑", value: "9648" },
            { title: "真人秀", value: "10764" },
            { title: "脫口秀", value: "10767" },
            { title: "肥皂劇", value: "10766" },
            { title: "紀錄片", value: "99" },
            { title: "動作與冒險", value: "10759" },
            { title: "科幻與奇幻", value: "10765" },
            { title: "戰爭與政治", value: "10768" }
          ]
        },
        {
          name: "air_status",
          title: "上映狀態",
          type: "enumeration",
          description: "默認已上映",
          value: "released",
          enumOptions: [
            { title: "已上映", value: "released" },
            { title: "未上映", value: "upcoming" }
          ]
        },
        {
          name: "sort_by",
          title: "🔢 排序方式",
          type: "enumeration",
          description: "選擇內容排序方式, 默認上映時間↓",
          value: "first_air_date.desc",
          enumOptions: [
            { title: "上映時間↓", value: "first_air_date.desc" },
            { title: "上映時間↑", value: "first_air_date.asc" },
            { title: "人氣最高", value: "popularity.desc" },
            { title: "評分最高", value: "vote_average.desc" },
            { title: "最多投票", value: "vote_count.desc" }
          ]
        },
        { name: "page", title: "頁碼", type: "page" },
        { name: "language", title: "語言", type: "language", value: "zh-TW" }
      ]
    }
  ]
};

// ===============TMDB功能函數===============
async function fetchTmdbData(api, params) {
    try {
        const response = await Widget.tmdb.get(api, { params: params });

        if (!response) {
            throw new Error("獲取數據失敗");
        }

        const data = response.results;
        
        return data
            .filter(item => {
                const hasPoster = item.poster_path;
                const hasTitle = item.title || item.name;
                const hasValidId = Number.isInteger(item.id);
                
                return hasPoster && hasTitle && hasValidId;
            })
            .map((item) => {
                let mediaType = item.media_type;
                
                if (!mediaType) {
                    if (item.title) mediaType = "movie";
                    else if (item.name) mediaType = "tv";
                }
                
                return {
                    id: item.id,
                    type: "tmdb",
                    title: item.title || item.name,
                    description: item.overview,
                    releaseDate: item.release_date || item.first_air_date,
                    backdropPath: item.backdrop_path,
                    posterPath: item.poster_path,
                    rating: item.vote_average,
                    mediaType: mediaType || "unknown",
                };
            });
    } catch (error) {
        console.error("調用 TMDB API 失敗:", error);
        return [createErrorItem("tmdb-api", "API調用失敗", error)];
    }
}

async function tmdbDiscoverByNetwork(params = {}) {
    const api = "discover/tv";
    const beijingDate = getBeijingDate();

    const discoverParams = {
        language: params.language || 'zh-TW',
        page: params.page || 1,
        sort_by: params.sort_by || "first_air_date.desc",
    };

    // ✅ 核心修正（不混用 network / company）
    if (params.with_networks) {
        if (params.with_networks.startsWith("company:")) {
            discoverParams.with_companies = params.with_networks.replace("company:", "");
        } else {
            discoverParams.with_networks = params.with_networks;
        }
    }

    if (params.air_status === 'released') {
        discoverParams['first_air_date.lte'] = beijingDate;
    } else if (params.air_status === 'upcoming') {
        discoverParams['first_air_date.gte'] = beijingDate;
    }

    if (params.with_genres) {
        discoverParams.with_genres = params.with_genres;
    }

    return await fetchTmdbData(api, discoverParams);
}

// ===============錯誤輔助函數===============
function createErrorItem(id, title, error) {
    const errorMessage = String(error?.message || error || '未知錯誤');
    const uniqueId = `error-${id.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}`;
    return {
        id: uniqueId,
        type: "error",
        title: title || "載入失敗",
        description: `錯誤詳情：${errorMessage}`
    };
}
