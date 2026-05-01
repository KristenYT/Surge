// =============UserScript=============
// @name         TMDB泰國電視公司聚合
// @version      1.3.0
// @description  電視台 / 製作公司
// =============UserScript=============

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
  title: "TMDB泰國電視分類",
  description: "電視台 / 製作公司",
  version: "1.3.0",
  modules: [
    {
      id: "thai_companies",
      title: "泰國影視分類",
      functionName: "tmdbDiscoverByNetwork",
      cacheDuration: 3600,
      params: [

        // ✅ 先選分類
        {
          name: "filter_type",
          title: "🎯 分類",
          type: "enumeration",
          value: "network",
          enumOptions: [
            { title: "📺 電視台", value: "network" },
            { title: "🏢 製作公司", value: "company" }
          ]
        },

        // 📺 電視台
        {
          name: "with_networks",
          title: "📺 電視台",
          type: "enumeration",
          value: "",
          enumOptions: [
            { title: "全部", value: "" },
            { title: "One31", value: "1784" },
            { title: "Amarin TV", value: "3281" },
            { title: "Channel 3", value: "344" },
            { title: "GMM 25", value: "1974" }
          ]
        },

        // 🏢 製作公司
        {
          name: "with_companies",
          title: "🏢 製作公司",
          type: "enumeration",
          value: "",
          enumOptions: [
            { title: "全部", value: "" },
            { title: "GMMTV", value: "139247" }
          ]
        },

        {
          name: "sort_by",
          title: "排序",
          type: "enumeration",
          value: "first_air_date.desc",
          enumOptions: [
            { title: "上映時間↓", value: "first_air_date.desc" },
            { title: "人氣", value: "popularity.desc" }
          ]
        },

        { name: "page", type: "page" },
        { name: "language", type: "language", value: "zh-TW" }
      ]
    }
  ]
};

// ====== TMDB ======
async function tmdbDiscoverByNetwork(params = {}) {
    const api = "discover/tv";
    const beijingDate = getBeijingDate();

    const discoverParams = {
        language: params.language || 'zh-TW',
        page: params.page || 1,
        sort_by: params.sort_by || "first_air_date.desc",
        'first_air_date.lte': beijingDate
    };

    // ✅ 核心：只吃一種條件
    if (params.filter_type === "network") {
        if (params.with_networks) {
            discoverParams.with_networks = params.with_networks;
        }
    }

    if (params.filter_type === "company") {
        if (params.with_companies) {
            discoverParams.with_companies = params.with_companies;
        }
    }

    return await fetchTmdbData(api, discoverParams);
}

// ====== 共用 ======
async function fetchTmdbData(api, params) {
    try {
        const response = await Widget.tmdb.get(api, { params: params });

        return response.results.map(item => ({
            id: item.id,
            type: "tmdb",
            title: item.name,
            posterPath: item.poster_path,
            backdropPath: item.backdrop_path,
            rating: item.vote_average,
            releaseDate: item.first_air_date,
            mediaType: "tv"
        }));
    } catch (e) {
        return [];
    }
}
