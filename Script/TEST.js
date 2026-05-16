WidgetMetadata = {
  id: "forward.combined.media.thai.tvnetworks",
  title: "TMDB 泰國影視合集",
  icon: "https://assets.vvebo.vip/scripts/icon.png",
  description: "從 TMDB 拉取泰國電影、泰劇、電視台、影視公司、出品公司、串流平台，以及 BL/GL 泰劇分類。",
  author: "Kristen",
  site: "https://github.com/InchStudio/ForwardWidgets",
  version: "1.2.2",
  requiredVersion: "0.0.1",
  detailCacheDuration: 60,
  modules: [
    {
      id: "thai_tv",
      title: "泰國劇集 / 電視台 / 平台",
      description: "依泰國電視台、影視公司、出品公司、串流平台、BL/GL 泰劇分類拉取 TMDB 劇集。",
      functionName: "tmdbDiscoverByNetwork",
      cacheDuration: 3600,
      params: [
        {
          name: "relationship_category",
          title: "泰劇分類",
          type: "enumeration",
          value: "",
          description: "依 TMDB keyword 篩選 BL / GL 泰劇。",
          enumOptions: [
            { title: "全部泰劇", value: "" },
            { title: "BL 泰劇", value: "289844" },
            { title: "GL 泰劇", value: "280003" },
            { title: "BL + GL 泰劇", value: "289844|280003" }
          ]
        },
        {
          name: "source_filter",
          title: "電視台 / 公司 / 平台",
          type: "enumeration",
          value: "",
          description: "選擇泰國電視台、影視公司、出品公司或平台。",
          enumOptions: [
            { title: "全部泰國劇集", value: "" },
            { title: "電視台｜Channel 3", value: "network:344" },
            { title: "電視台｜Channel 7", value: "network:180" },
            { title: "電視台｜ONE 31", value: "network:1784" },
            { title: "電視台｜GMM 25", value: "network:1974" },
            { title: "電視台｜Amarin TV", value: "network:3281" },
            { title: "電視台｜Workpoint TV", value: "network:2937" },
            { title: "電視台｜True4U", value: "network:1910" },
            { title: "電視台｜Thai PBS", value: "network:1018" },
            { title: "電視台｜Channel 8", value: "network:2978" },
            { title: "影視/出品公司｜GMMTV", value: "company:139247" },
            { title: "影視/出品公司｜GDH 559", value: "company:93758" },
            { title: "影視/出品公司｜GMM Tai Hub (GTH)", value: "company:5369" },
            { title: "影視/出品公司｜Be On Cloud", value: "company:172413" },
            { title: "影視/出品公司｜The One Enterprise", value: "company-name:The One Enterprise" },
            { title: "影視/出品公司｜Nadao Bangkok", value: "company-name:Nadao Bangkok" },
            { title: "影視/出品公司｜Studio Wabi Sabi", value: "company-name:Studio Wabi Sabi" },
            { title: "影視/出品公司｜Mandee Work", value: "company-name:Mandee Work" },
            { title: "影視/出品公司｜Domundi", value: "company-name:Domundi" },
            { title: "影視/出品公司｜Me Mind Y", value: "company-name:Me Mind Y" },
            { title: "影視/出品公司｜IDOLFACTORY", value: "company-name:IDOLFACTORY" },
            { title: "影視/出品公司｜Star Hunter Entertainment", value: "company-name:Star Hunter Entertainment" },
            { title: "影視/出品公司｜Dee Hup House", value: "company-name:Dee Hup House" },
            { title: "影視/出品公司｜CHANGE2561", value: "company-name:CHANGE2561" },
            { title: "影視/出品公司｜Copy A Bangkok", value: "company-name:Copy A Bangkok" },
            { title: "影視/出品公司｜Kantana Group", value: "company-name:Kantana Group" },
            { title: "影視/出品公司｜TV Thunder", value: "company-name:TV Thunder" },
            { title: "影視/出品公司｜Broadcast Thai Television", value: "company-name:Broadcast Thai Television" },
            { title: "影視/出品公司｜Halo Productions", value: "company-name:Halo Productions" },
            { title: "影視/出品公司｜Kongthup Production", value: "company-name:Kongthup Production" },
            { title: "平台｜Netflix", value: "provider-name:Netflix" },
            { title: "平台｜Disney+", value: "provider-name:Disney Plus|Disney+" },
            { title: "平台｜Prime Video", value: "provider-name:Amazon Prime Video|Prime Video" },
            { title: "平台｜Apple TV+", value: "provider-name:Apple TV Plus|Apple TV+" },
            { title: "平台｜Max / HBO Max", value: "provider-name:Max|HBO Max" },
            { title: "平台｜Viu", value: "provider-name:Viu" },
            { title: "平台｜iQIYI", value: "provider-name:iQIYI|iQ.com" },
            { title: "平台｜WeTV", value: "provider-name:WeTV|Tencent Video" },
            { title: "平台｜TrueID", value: "provider-name:TrueID" },
            { title: "平台｜AIS PLAY", value: "provider-name:AIS PLAY" },
            { title: "平台｜LINE TV", value: "provider-name:LINE TV" },
            { title: "平台｜YouTube", value: "provider-name:YouTube|Youtube" }
          ]
        },
        {
          name: "with_genres",
          title: "劇集類型",
          type: "enumeration",
          value: "",
          description: "依 TMDB 劇集類型篩選。",
          enumOptions: [
            { title: "全部類型", value: "" },
            { title: "動作冒險", value: "10759" },
            { title: "動畫", value: "16" },
            { title: "喜劇", value: "35" },
            { title: "犯罪", value: "80" },
            { title: "紀錄", value: "99" },
            { title: "劇情", value: "18" },
            { title: "家庭", value: "10751" },
            { title: "兒童", value: "10762" },
            { title: "懸疑", value: "9648" },
            { title: "真人秀", value: "10764" },
            { title: "肥皂劇", value: "10766" },
            { title: "脫口秀", value: "10767" },
            { title: "戰爭政治", value: "10768" },
            { title: "科幻奇幻", value: "10765" }
          ]
        },
        {
          name: "release_status",
          title: "播出狀態",
          type: "enumeration",
          value: "released",
          enumOptions: [
            { title: "已播出", value: "released" },
            { title: "即將播出", value: "upcoming" },
            { title: "全部", value: "" }
          ]
        },
        {
          name: "sort_by",
          title: "排序",
          type: "enumeration",
          value: "first_air_date.desc",
          enumOptions: [
            { title: "首播日期：新到舊", value: "first_air_date.desc" },
            { title: "首播日期：舊到新", value: "first_air_date.asc" },
            { title: "人氣最高", value: "popularity.desc" },
            { title: "評分最高", value: "vote_average.desc" },
            { title: "評分人數最多", value: "vote_count.desc" }
          ]
        },
        {
          name: "watch_region",
          title: "平台地區",
          type: "enumeration",
          value: "TH",
          description: "只在選擇平台時使用。",
          enumOptions: [
            { title: "泰國 TH", value: "TH" },
            { title: "台灣 TW", value: "TW" },
            { title: "香港 HK", value: "HK" },
            { title: "新加坡 SG", value: "SG" },
            { title: "馬來西亞 MY", value: "MY" },
            { title: "美國 US", value: "US" }
          ]
        },
        {
          name: "watch_monetization",
          title: "平台模式",
          type: "enumeration",
          value: "flatrate|free|ads|rent|buy",
          description: "只在選擇平台時使用。",
          enumOptions: [
            { title: "全部模式", value: "flatrate|free|ads|rent|buy" },
            { title: "訂閱", value: "flatrate" },
            { title: "免費 / 廣告", value: "free|ads" },
            { title: "租借 / 購買", value: "rent|buy" }
          ]
        },
        { name: "page", title: "頁碼", type: "page" },
        { name: "language", title: "語言", type: "language", value: "zh-TW" }
      ]
    },
    {
      id: "thai_movies",
      title: "泰國電影 / 電影公司 / 平台",
      description: "依泰國電影公司、影視公司、出品公司或串流平台拉取 TMDB 電影。",
      functionName: "tmdbDiscoverThaiMovie",
      cacheDuration: 3600,
      params: [
        {
          name: "source_filter",
          title: "電影公司 / 平台",
          type: "enumeration",
          value: "",
          description: "選擇泰國電影公司、影視公司、出品公司或平台。",
          enumOptions: [
            { title: "全部泰國電影", value: "" },
            { title: "電影公司｜GDH 559", value: "company:93758" },
            { title: "電影公司｜GMM Tai Hub (GTH)", value: "company:5369" },
            { title: "電影公司｜GMMTV", value: "company:139247" },
            { title: "電影公司｜Sahamongkolfilm", value: "company-name:Sahamongkolfilm" },
            { title: "電影公司｜Five Star Production", value: "company-name:Five Star Production" },
            { title: "電影公司｜M Pictures", value: "company-name:M Pictures" },
            { title: "電影公司｜Transformation Films", value: "company-name:Transformation Films" },
            { title: "電影公司｜CJ Major Entertainment", value: "company-name:CJ Major Entertainment" },
            { title: "電影公司｜Kantana Motion Pictures", value: "company-name:Kantana Motion Pictures" },
            { title: "電影公司｜Mono Film", value: "company-name:Mono Film" },
            { title: "電影公司｜Neramitnung Film", value: "company-name:Neramitnung Film" },
            { title: "電影公司｜185 Films", value: "company-name:185 Films" },
            { title: "電影公司｜Be On Cloud", value: "company:172413" },
            { title: "平台｜Netflix", value: "provider-name:Netflix" },
            { title: "平台｜Disney+", value: "provider-name:Disney Plus|Disney+" },
            { title: "平台｜Prime Video", value: "provider-name:Amazon Prime Video|Prime Video" },
            { title: "平台｜Apple TV+", value: "provider-name:Apple TV Plus|Apple TV+" },
            { title: "平台｜Max / HBO Max", value: "provider-name:Max|HBO Max" },
            { title: "平台｜Viu", value: "provider-name:Viu" },
            { title: "平台｜iQIYI", value: "provider-name:iQIYI|iQ.com" },
            { title: "平台｜WeTV", value: "provider-name:WeTV|Tencent Video" },
            { title: "平台｜TrueID", value: "provider-name:TrueID" },
            { title: "平台｜AIS PLAY", value: "provider-name:AIS PLAY" },
            { title: "平台｜LINE TV", value: "provider-name:LINE TV" },
            { title: "平台｜YouTube", value: "provider-name:YouTube|Youtube" }
          ]
        },
        {
          name: "with_genres",
          title: "電影類型",
          type: "enumeration",
          value: "",
          description: "依 TMDB 電影類型篩選。",
          enumOptions: [
            { title: "全部類型", value: "" },
            { title: "動作", value: "28" },
            { title: "冒險", value: "12" },
            { title: "動畫", value: "16" },
            { title: "喜劇", value: "35" },
            { title: "犯罪", value: "80" },
            { title: "紀錄", value: "99" },
            { title: "劇情", value: "18" },
            { title: "家庭", value: "10751" },
            { title: "奇幻", value: "14" },
            { title: "歷史", value: "36" },
            { title: "恐怖", value: "27" },
            { title: "音樂", value: "10402" },
            { title: "懸疑", value: "9648" },
            { title: "愛情", value: "10749" },
            { title: "科幻", value: "878" },
            { title: "驚悚", value: "53" },
            { title: "戰爭", value: "10752" }
          ]
        },
        {
          name: "release_status",
          title: "上映狀態",
          type: "enumeration",
          value: "released",
          enumOptions: [
            { title: "已上映", value: "released" },
            { title: "即將上映", value: "upcoming" },
            { title: "全部", value: "" }
          ]
        },
        {
          name: "sort_by",
          title: "排序",
          type: "enumeration",
          value: "primary_release_date.desc",
          enumOptions: [
            { title: "上映日期：新到舊", value: "primary_release_date.desc" },
            { title: "上映日期：舊到新", value: "primary_release_date.asc" },
            { title: "人氣最高", value: "popularity.desc" },
            { title: "評分最高", value: "vote_average.desc" },
            { title: "評分人數最多", value: "vote_count.desc" }
          ]
        },
        {
          name: "watch_region",
          title: "平台地區",
          type: "enumeration",
          value: "TH",
          description: "只在選擇平台時使用。",
          enumOptions: [
            { title: "泰國 TH", value: "TH" },
            { title: "台灣 TW", value: "TW" },
            { title: "香港 HK", value: "HK" },
            { title: "新加坡 SG", value: "SG" },
            { title: "馬來西亞 MY", value: "MY" },
            { title: "美國 US", value: "US" }
          ]
        },
        {
          name: "watch_monetization",
          title: "平台模式",
          type: "enumeration",
          value: "flatrate|free|ads|rent|buy",
          description: "只在選擇平台時使用。",
          enumOptions: [
            { title: "全部模式", value: "flatrate|free|ads|rent|buy" },
            { title: "訂閱", value: "flatrate" },
            { title: "免費 / 廣告", value: "free|ads" },
            { title: "租借 / 購買", value: "rent|buy" }
          ]
        },
        { name: "page", title: "頁碼", type: "page" },
        { name: "language", title: "語言", type: "language", value: "zh-TW" }
      ]
    }
  ]
};

async function tmdbDiscoverThaiTv(params = {}) {
  return await tmdbDiscoverThaiMedia({ ...params, media_type: "tv" });
}

async function tmdbDiscoverByNetwork(params = {}) {
  const sourceFilter = params.source_filter || normalizeLegacyNetworkFilter(params.with_networks);
  const releaseStatus = params.release_status || params.air_status || "released";

  return await tmdbDiscoverThaiMedia({
    ...params,
    source_filter: sourceFilter,
    release_status: releaseStatus,
    media_type: "tv"
  });
}

async function tmdbDiscoverThaiMovie(params = {}) {
  return await tmdbDiscoverThaiMedia({ ...params, media_type: "movie" });
}

async function tmdbDiscoverThaiMedia(params = {}) {
  const mediaType = params.media_type === "movie" ? "movie" : "tv";
  const api = `discover/${mediaType}`;
  const today = getTodayInUTC8();
  const watchRegion = params.watch_region || "TH";
  const discoverParams = {
    language: params.language || "zh-TW",
    page: params.page || 1,
    sort_by: params.sort_by || (mediaType === "movie" ? "primary_release_date.desc" : "first_air_date.desc"),
    include_adult: false,
    with_origin_country: "TH",
    with_original_language: "th"
  };

  if (mediaType === "movie") {
    discoverParams.include_video = false;
    discoverParams.region = watchRegion;
  } else {
    discoverParams.include_null_first_air_dates = false;
  }

  applyReleaseStatus(discoverParams, mediaType, params.release_status, today);

  if (params.with_genres) {
    discoverParams.with_genres = params.with_genres;
  }

  if (mediaType === "tv" && params.relationship_category) {
    addKeywordFilter(discoverParams, params.relationship_category);
  }

  const sourceError = await applySourceFilter(
    discoverParams,
    params.source_filter,
    mediaType,
    watchRegion,
    params.watch_monetization || "flatrate|free|ads|rent|buy"
  );

  if (sourceError) {
    return [createErrorItem("source-filter", "篩選條件無法使用", sourceError)];
  }

  return await fetchTmdbData(api, discoverParams, mediaType);
}

function applyReleaseStatus(discoverParams, mediaType, releaseStatus, today) {
  if (releaseStatus === "released") {
    discoverParams[mediaType === "movie" ? "primary_release_date.lte" : "first_air_date.lte"] = today;
  } else if (releaseStatus === "upcoming") {
    discoverParams[mediaType === "movie" ? "primary_release_date.gte" : "first_air_date.gte"] = today;
  }
}

async function applySourceFilter(discoverParams, sourceFilter, mediaType, watchRegion, monetizationTypes) {
  if (!sourceFilter) return "";

  const separatorIndex = sourceFilter.indexOf(":");
  const kind = separatorIndex >= 0 ? sourceFilter.slice(0, separatorIndex) : sourceFilter;
  const value = separatorIndex >= 0 ? sourceFilter.slice(separatorIndex + 1) : "";

  if (kind === "network") {
    if (mediaType !== "tv") return "電視台篩選只適用於劇集。";
    discoverParams.with_networks = value;
    return "";
  }

  if (kind === "company") {
    discoverParams.with_companies = value;
    return "";
  }

  if (kind === "company-name") {
    const companyId = await resolveCompanyId(value);
    if (!companyId) return `在 TMDB 找不到公司：${value}`;
    discoverParams.with_companies = companyId;
    return "";
  }

  if (kind === "provider-name") {
    const providerId = await resolveWatchProviderId(mediaType, value, watchRegion);
    if (!providerId) return `在 ${watchRegion} 平台列表找不到：${value}`;
    discoverParams.watch_region = watchRegion;
    discoverParams.with_watch_providers = providerId;
    discoverParams.with_watch_monetization_types = monetizationTypes;
    return "";
  }

  return `未知的篩選格式：${sourceFilter}`;
}

async function resolveCompanyId(companyName) {
  const response = await Widget.tmdb.get("search/company", {
    params: {
      query: companyName,
      page: 1
    }
  });
  const results = Array.isArray(response?.results) ? response.results : [];
  if (!results.length) return "";

  const target = normalizeText(companyName);
  const exactThai = results.find((company) => normalizeText(company.name) === target && company.origin_country === "TH");
  const exactAny = results.find((company) => normalizeText(company.name) === target);
  const partialThai = results.find((company) => {
    const name = normalizeText(company.name);
    return company.origin_country === "TH" && (name.includes(target) || target.includes(name));
  });
  const partialAny = results.find((company) => {
    const name = normalizeText(company.name);
    return name.includes(target) || target.includes(name);
  });

  const matched = exactThai || exactAny || partialThai || partialAny || results[0];
  return matched?.id ? String(matched.id) : "";
}

async function resolveWatchProviderId(mediaType, providerNames, region) {
  const response = await Widget.tmdb.get(`watch/providers/${mediaType}`, {
    params: { watch_region: region }
  });
  const results = Array.isArray(response?.results) ? response.results : [];
  if (!results.length) return "";

  const targets = providerNames
    .split("|")
    .map((name) => normalizeText(name))
    .filter(Boolean);

  for (const target of targets) {
    const exact = results.find((provider) => normalizeText(provider.provider_name) === target);
    if (exact?.provider_id) return String(exact.provider_id);
  }

  for (const target of targets) {
    const partial = results.find((provider) => {
      const name = normalizeText(provider.provider_name);
      return name.includes(target) || target.includes(name);
    });
    if (partial?.provider_id) return String(partial.provider_id);
  }

  return "";
}

async function fetchTmdbData(api, discoverParams, mediaType) {
  try {
    const response = await Widget.tmdb.get(api, { params: discoverParams });
    const results = Array.isArray(response?.results) ? response.results : [];

    return results
      .filter((item) => {
        const hasPoster = Boolean(item.poster_path);
        const hasTitle = Boolean(item.title || item.name);
        const hasValidId = Number.isInteger(item.id);
        return hasPoster && hasTitle && hasValidId;
      })
      .map((item) => {
        let itemMediaType = item.media_type;

        if (!itemMediaType) {
          if (item.title) itemMediaType = "movie";
          else if (item.name) itemMediaType = "tv";
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
          mediaType: itemMediaType || "unknown",
        };
      });
  } catch (error) {
    console.error("TMDB API 請求失敗:", error);
    return [createErrorItem("tmdb-api", "TMDB API 請求失敗", error)];
  }
}

function addKeywordFilter(discoverParams, keywordValue) {
  if (!keywordValue) return;
  discoverParams.with_keywords = discoverParams.with_keywords
    ? `${discoverParams.with_keywords},${keywordValue}`
    : keywordValue;
}

function normalizeLegacyNetworkFilter(withNetworks) {
  if (!withNetworks) return "";
  if (withNetworks.startsWith("company:")) return withNetworks;
  return `network:${withNetworks}`;
}

function getTodayInUTC8() {
  const now = new Date();
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
  return new Date(utcTime + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/\+/g, "plus")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "");
}

function createErrorItem(id, title, error) {
  const errorMessage = String(error?.message || error || "未知錯誤");
  const uniqueId = `error-${id.replace(/[^a-zA-Z0-9]/g, "-")}-${Date.now()}`;
  return {
    id: uniqueId,
    type: "error",
    title: title || "載入失敗",
    description: `錯誤訊息：${errorMessage}`
  };
}
