// =============UserScript=============
// @name         影視聚合查詢元件
// @version      1.2.3
// @description  聚合查詢豆瓣/TMDB/IMDB影視資料
// @author       阿米諾斯
// =============UserScript=============
WidgetMetadata = {
  id: "forward.combined.media.lists",
  title: "影視榜單🔍超級聚合",
  description: "聚合豆瓣、TMDB和IMDB的電影、劇集、動畫片單與榜單",
  author: "阿米諾斯",
  site: "https://github.com/quantumultxx/FW-Widgets",
  version: "1.2.3",
  requiredVersion: "0.0.1",
  modules: [
        // =============TMDB模組=============
    // --- 目前與趨勢模組 ---
    {
        title: "TMDB 正在熱映",
        description: "目前影院或流媒體上映的電影/劇集",
        requiresWebView: false,
        functionName: "tmdbNowPlaying",
        params: [
            { 
                name: "type", 
                title: "型別", 
                type: "enumeration", 
                enumOptions: [
                    { title: "電影", value: "movie" },
                    { title: "劇集", value: "tv" }
                ], 
                value: "movie" 
            },
            { name: "page", title: "頁碼", type: "page" },
            { name: "language", title: "語言", type: "language", value: "zh-TW" }
        ]
    },
    // --- 高分內容 ---
    {
        title: "TMDB 高分內容",
        description: "高分電影或劇集 (按使用者評分排序)",
        requiresWebView: false,
        functionName: "tmdbTopRated",
        params: [
            { 
                name: "type", 
                title: "型別", 
                type: "enumeration", 
                enumOptions: [
                    { title: "電影", value: "movie" },
                    { title: "劇集", value: "tv" }
                ], 
                value: "movie" 
            },
            { name: "language", title: "語言", type: "language", value: "zh-TW" },
            { name: "page", title: "頁碼", type: "page" }
        ]
    },

    // =============IMDB模組=============
    {
      title: "IMDb Top 250 電影",
      description: "IMDb 使用者評分最高的 250 部電影",
      requiresWebView: false,
      functionName: "loadImdbCardItems",
      params: [
        { name: "url", title: "🔗 列表網址", type: "constant", value: "https://www.imdb.com/chart/top/?ref_=nv_mv_250" },
        { name: "page", title: "頁碼", type: "page" },
        { name: "limit", title: "🔢 每頁數量", type: "constant", value: "20" }
      ]
    },
    {
      title: "IMDb Top 250 劇集",
      description: "IMDb 使用者評分最高的 250 部劇集",
      requiresWebView: false,
      functionName: "loadImdbCardItems",
      params: [
        { name: "url", title: "🔗 列表網址", type: "constant", value: "https://www.imdb.com/chart/toptv/?ref_=nv_tvv_250" },
        { name: "page", title: "頁碼", type: "page" },
        { name: "limit", title: "🔢 每頁數量", type: "constant", value: "20" }
      ]
    },
    {
      title: "IMDB 自訂片單",
      description: "解析 IMDB 熱門電影/劇集等網頁片單 (需輸入 URL)",
      requiresWebView: false,
      functionName: "loadImdbCardItems",
      params: [
        {
          name: "url", 
          title: "🔗 列表網址", 
          type: "input", 
          description: "輸入 IMDB 片單或榜單網址",
          placeholders: [
            { title: "時下熱門電影", value: "https://www.imdb.com/chart/moviemeter/?ref_=nv_mv_mpm" },
            { title: "時下熱門劇集", value: "https://www.imdb.com/chart/tvmeter/?ref_=nv_tvv_mptv" }
          ]
        },
        { name: "page", title: "頁碼", type: "page" },
        { name: "limit", title: "🔢 每頁數量", type: "constant", value: "20" }
      ]
    },
 // =============豆瓣模組=============
    // --- 🔥 實時熱點 ---
    {
      title: "豆瓣電影實時熱榜",
      description: "來自豆瓣的目前熱門電影榜單",
      requiresWebView: false,
      functionName: "loadDoubanItemsFromApi",
      params: [
        { name: "url", title: "🔗 列表網址", type: "constant", value: "https://m.douban.com/rexxar/api/v2/subject_collection/movie_real_time_hotest/items" },
        { name: "type", title: "🎭 型別", type: "constant", value: "movie" },
        { name: "page", title: "頁碼", type: "page" },
        { name: "limit", title: "🔢 每頁數量", type: "constant", value: "20" }
      ]
    },
    {
      title: "豆瓣劇集實時熱榜",
      description: "來自豆瓣的目前熱門劇集榜單",
      requiresWebView: false,
      functionName: "loadDoubanItemsFromApi",
      params: [
        { name: "url", title: "🔗 列表網址", type: "constant", value: "https://m.douban.com/rexxar/api/v2/subject_collection/tv_real_time_hotest/items" },
        { name: "type", title: "🎭 型別", type: "constant", value: "tv" },
        { name: "page", title: "頁碼", type: "page" },
        { name: "limit", title: "🔢 每頁數量", type: "constant", value: "20" }
      ]
    },

    // --- 🏆 精選榜單 ---
    {
      title: "豆瓣 Top 250 電影",
      description: "豆瓣評分最高的 250 部電影",
      requiresWebView: false,
      functionName: "loadDoubanCardItems",
      params: [
        { name: "url", title: "🔗 列表網址", type: "constant", value: "https://m.douban.com/subject_collection/movie_top250" },
        { name: "page", title: "頁碼", type: "page" },
        { name: "limit", title: "🔢 每頁數量", type: "constant", value: "20" }
      ]
    },
    {
      title: "豆瓣自訂片單",
      description: "載入豆瓣官方榜單或使用者豆列 (需輸入 URL)",
      requiresWebView: false,
      functionName: "loadDoubanCardItems",
      params: [
        {
          name: "url", 
          title: "🔗 列表網址", 
          type: "input", 
          description: "輸入豆瓣片單或榜單網址 (subject_collection 或 doulist)",
          placeholders: [
            { title: "一週電影口碑榜", value: "https://m.douban.com/subject_collection/movie_weekly_best" },
            { title: "一週華語口碑劇集榜", value: "https://m.douban.com/subject_collection/tv_chinese_best_weekly" },
            { title: "一週全球口碑劇集榜", value: "https://m.douban.com/subject_collection/tv_global_best_weekly" },
            { title: "第97屆奧斯卡 (2025)", value: "https://m.douban.com/subject_collection/EC7I7ZDRA?type=rank" }
          ]
        },
        { name: "page", title: "頁碼", type: "page" },
        { name: "limit", title: "🔢 每頁數量", type: "constant", value: "20" }
      ]
    },

    // --- 🎬 探索探索 ---
    {
      title: "豆瓣電影推薦",
      description: "按分類、地區、型別標籤瀏覽豆瓣推薦電影",
      requiresWebView: false,
      functionName: "loadDoubanRecommendMovies",
      params: [
        {
          name: "category", 
          title: "🏷️ 分類", 
          type: "enumeration",
          enumOptions: [ 
            { title: "全部", value: "全部" }, 
            { title: "熱門電影", value: "熱門" }, 
            { title: "最新電影", value: "最新" }, 
            { title: "豆瓣高分", value: "豆瓣高分" }, 
            { title: "冷門佳片", value: "冷門佳片" } 
          ],
          value: "全部"
        },
        {
          name: "type", 
          title: "🌍 地區  (僅對 熱門/最新/高分/冷門 分類生效)", 
          type: "enumeration",
          description: "(僅對 熱門/最新/高分/冷門 分類生效)",
          enumOptions: [ 
            { title: "全部", value: "全部" }, 
            { title: "華語", value: "華語" }, 
            { title: "歐美", value: "歐美" }, 
            { title: "韓國", value: "韓國" }, 
            { title: "日本", value: "日本" } 
          ],
          value: "全部"
        },
        {
          name: "tags", 
          title: "🎭 型別  (僅當分類為'全部'時生效)", 
          type: "enumeration",
          description: "僅當分類為'全部'時生效", 
          value: "",
          enumOptions: [
            { title: "全部", value: "" },
            
            { title: "動作", value: "動作" }, 
            { title: "科幻", value: "科幻" }, 
            { title: "愛情", value: "愛情" }, 
            { title: "喜劇", value: "喜劇" }, 
            { title: "懸疑", value: "懸疑" }, 
            { title: "動畫", value: "動畫" }, 
            { title: "劇情", value: "劇情" }, 
            { title: "家庭", value: "家庭" }, 
            { title: "犯罪", value: "犯罪" }, 
            { title: "歌舞", value: "歌舞" }, 
            { title: "傳記", value: "傳記" }, 
            { title: "冒險", value: "冒險" }, 
            { title: "武俠", value: "武俠" }, 
            { title: "運動", value: "運動" }, 
            { title: "古裝", value: "古裝" },
            
            { title: "紀錄片", value: "紀錄片" }
          ]
        },
        { name: "page", title: "頁碼", type: "page" },
        { name: "limit", title: "🔢 每頁數量", type: "constant", value: "20" }
      ]
    },
    {
      title: "豆瓣劇集推薦",
      description: "按分類、型別瀏覽豆瓣推薦劇集",
      requiresWebView: false,
      functionName: "loadDoubanRecommendShows",
      params: [
        {
          name: "type", 
          title: "🎭 型別 (劇集)", 
          type: "enumeration",
            enumOptions: [
            { title: "綜合", value: "tv" }, 
            { title: "國產劇", value: "tv_domestic" }, 
            { title: "歐美劇", value: "tv_american" }, 
            { title: "日劇", value: "tv_japanese" }, 
            { title: "韓劇", value: "tv_korean" }, 
            { title: "動畫", value: "tv_animation" }, 
            { title: "紀錄片", value: "tv_documentary" } 
          ],
          value: "tv"
        },
        { name: "page", title: "頁碼", type: "page" },
        { name: "limit", title: "🔢 每頁數量", type: "constant", value: "20" }
      ]
    },
  ]
};
   
// ===============輔助函式===============
function formatItemDescription(item) {
    let description = item.description || '';
    const hasRating = /評分|rating/i.test(description);
    const hasYear = /年份|year/i.test(description);
    
    if (item.rating && !hasRating) {
        description = `評分: ${item.rating} | ${description}`;
    }
    
    if (item.releaseDate && !hasYear) {
        const year = String(item.releaseDate).substring(0,4);
        if (/^\d{4}$/.test(year)) {
            description = `年份: ${year} | ${description}`;
        }
    }
    
    return description
        .replace(/^\|\s*/, '')
        .replace(/\s*\|$/, '')
        .trim();
}

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

function calculatePagination(params) {
    let page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 20;
    
    if (typeof params.start !== 'undefined') {
        page = Math.floor(parseInt(params.start) / limit) + 1;
    }
    
    if (page < 1) page = 1;
    if (limit > 50) throw new Error("單頁數量不能超過50");

    const start = (page - 1) * limit;
    return { page, limit, start };
}

function getCurrentDate() {
    const now = new Date();
    return now.toISOString().split('T')[0];
}

// ===============豆瓣功能模組===============
async function loadDoubanCardItems(params = {}) {
  try {
    const url = params.url;
    if (!url) throw new Error("缺少片單 URL");
    if (url.includes("douban.com/doulist/")) {
      return loadDoubanDefaultList(params);
    } else if (url.includes("douban.com/subject_collection/")) {
      return loadDoubanSubjectCollection(params);
    } else {
        throw new Error("不支援的豆瓣 URL 格式");
    }
  } catch (error) {
    console.error("解析豆瓣片單失敗:", error);
    throw error;
  }
}

async function loadDoubanDefaultList(params = {}) {
  const { start, limit } = calculatePagination(params);
  const url = params.url;
  const listId = url.match(/doulist\/(\d+)/)?.[1];
  if (!listId) throw new Error("無法從 URL 獲取豆瓣豆列 ID");
  const pageUrl = `https://www.douban.com/doulist/${listId}/?start=${start}&sort=&playable=&sub_type=`;
  const response = await Widget.http.get(pageUrl, {
    headers: {
      Referer: `https://www.douban.com/`,
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
    },
  });
  if (!response || !response.data) throw new Error("獲取豆瓣豆列資料失敗");
  const docId = Widget.dom.parse(response.data);
  if (docId < 0) throw new Error("解析豆瓣豆列 HTML 失敗");
  const itemElements = Widget.dom.select(docId, "div.doulist-item");
  let fallbackItemElements = [];
  if (!itemElements || itemElements.length === 0) {
       const articleElement = Widget.dom.selectFirst(docId, ".article");
       if (articleElement >= 0) {
            fallbackItemElements = Widget.dom.select(articleElement, ".doulist-subject");
            if (!fallbackItemElements || fallbackItemElements.length === 0) {
                 fallbackItemElements = Widget.dom.select(articleElement, "li.subject-item");
            }
       }
  }
  const finalItemElements = (itemElements && itemElements.length > 0) ? itemElements : fallbackItemElements;
  if (!finalItemElements || finalItemElements.length === 0) {
      const paging = Widget.dom.selectFirst(docId, ".paginator .next a");
      if (paging < 0) {
          return [];
      } else {
           return [];
      }
  }
  let doubanIds = [];
  for (const itemId of finalItemElements) {
       let titleElementId = Widget.dom.selectFirst(itemId, ".title a");
       if (titleElementId < 0) {
           titleElementId = Widget.dom.selectFirst(itemId, ".item-title a");
       }
       if (titleElementId < 0) {
           titleElementId = Widget.dom.selectFirst(itemId, "a[onclick*='subject']");
       }
      if (titleElementId >= 0) {
          const link = await Widget.dom.attr(titleElementId, "href");
          const idMatch = link ? link.match(/subject\/(\d+)/) : null;
          const title = await Widget.dom.text(titleElementId);
          if (idMatch && idMatch[1]) {
              let coverUrl = "";
              let imgElementId = Widget.dom.selectFirst(itemId, ".post img");
              if (imgElementId < 0) {
                 imgElementId = Widget.dom.selectFirst(itemId, ".item-poster img");
              }
              if (imgElementId >= 0) {
                  coverUrl = await Widget.dom.attr(imgElementId, "src");
                   if (coverUrl) {
                       coverUrl = coverUrl.replace(/\/(s|m|sq)\//, '/l/');
                   }
              }
              let description = "";
              let abstractElementId = Widget.dom.selectFirst(itemId, ".abstract");
              if (abstractElementId < 0) {
                  abstractElementId = Widget.dom.selectFirst(itemId, ".card-abstract");
              }
               if (abstractElementId >= 0) {
                   description = await Widget.dom.text(abstractElementId);
                   description = description.trim().replace(/\n\s*/g, ' ');
               }
              let rating = undefined;
              let ratingElementId = Widget.dom.selectFirst(itemId, ".rating .rating_nums");
              if (ratingElementId < 0) {
                  ratingElementId = Widget.dom.selectFirst(itemId, ".item-rating .rating_nums");
              }
              if (ratingElementId >= 0) {
                  rating = await Widget.dom.text(ratingElementId);
                  rating = rating.trim();
              }
              doubanIds.push({
                  id: idMatch[1],
                  type: "douban",
                  title: title ? title.trim() : "未知標題",
                  coverUrl: coverUrl || undefined,
                  description: formatItemDescription({
                      description: description || undefined,
                      rating: rating,
                      releaseDate: item.releaseDate
                  }),
                  rating: rating ? parseFloat(rating) : undefined
                });
          } else {
             console.warn("解析豆列項時未找到 subject ID, Title:", title, "Link:", link);
          }
      } else {
         console.warn("在豆列項中未找到標題連結元素, Item ID:", itemId);
      }
  }
  return doubanIds;
}

async function loadDoubanItemsFromApi(params = {}) {
  const { start, limit } = calculatePagination(params);
  const url = params.url;
  const apiUrl = `${url}?start=${start}&count=${limit}&updated_at&items_only=1&for_mobile=1`;
  const listIdMatch = params.url.match(/subject_collection\/(\w+)/);
  const referer = listIdMatch ? `https://m.douban.com/subject_collection/${listIdMatch[1]}/` : 'https://m.douban.com/';
  const response = await Widget.http.get(apiUrl, {
    headers: {
      Referer: referer,
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1",
    },
  });
  if (response.data && response.data.subject_collection_items) {
    const items = response.data.subject_collection_items;
    const doubanIds = items.map((item) => ({
      id: item.id,
      type: "douban",
      title: item.title,
      coverUrl: item.cover?.url,
      description: formatItemDescription({
          description: item.card_subtitle || item.description,
          rating: item.rating?.value,
          releaseDate: item.year
      }),
      rating: item.rating?.value,
      releaseDate: item.year
    }));
    return doubanIds;
  }
  return [];
}

async function loadDoubanSubjectCollection(params = {}) {
  const listIdMatch = params.url.match(/subject_collection\/(\w+)/);
  if (!listIdMatch) throw new Error("無法從 URL 獲取豆瓣合集 ID");
  const listId = listIdMatch[1];
  const { start, limit } = calculatePagination(params);
  const apiUrl = `https://m.douban.com/rexxar/api/v2/subject_collection/${listId}/items`;
  return await loadDoubanItemsFromApi({
      ...params,
      url: apiUrl,
  });
}

async function loadDoubanRecommendMovies(params = {}) {
  return await loadDoubanRecommendItems(params, "movie");
}

async function loadDoubanRecommendShows(params = {}) {
  return await loadDoubanRecommendItems(params, "tv");
}

async function loadDoubanRecommendItems(params = {}, mediaType = "movie") {
  const { start, limit } = calculatePagination(params);
  const category = params.category || "";
  const subType = params.type || "";
  const tags = params.tags || "";
  const encodedTags = encodeURIComponent(tags);
  let url;
  if (category === "全部" || category === "all") {
      let recommendUrl = `https://m.douban.com/rexxar/api/v2/${mediaType}/recommend?refresh=0&start=${start}&count=${limit}&selected_categories=${encodeURIComponent(JSON.stringify(params.selected_categories || {}))}&uncollect=false&score_range=0,10`;
      if (encodedTags) {
          recommendUrl += `&tags=${encodedTags}`;
      }
      url = recommendUrl;
  } else {
      url = `https://m.douban.com/rexxar/api/v2/subject/recent_hot/${mediaType}?start=${start}&count=${limit}&category=${encodeURIComponent(category)}&type=${encodeURIComponent(subType)}`;
  }
  const response = await Widget.http.get(url, {
    headers: {
      Referer: `https://movie.douban.com/explore`,
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1",
    },
  });
  const items = response.data?.subjects
             || response.data?.items
             || response.data?.modules?.[0]?.data?.subject_collection_items
             || [];
  return items.map((item) => {
    const rating = item.rating?.value || (item.rate ? parseFloat(item.rate) : undefined);
    const releaseYear = item.year || item.release_date?.substring(0, 4);
    const cover = item.cover?.url || item.pic?.normal;
    return {
        id: String(item.id),
        type: "douban",
        title: item.title,
        coverUrl: cover,
        description: formatItemDescription({
            description: item.card_subtitle || item.description || item.intro,
            rating: rating,
            releaseDate: releaseYear ? `${releaseYear}-01-01` : undefined
        }),
        rating: rating,
        releaseDate: releaseYear ? `${releaseYear}-01-01` : undefined
    };
  }).filter(item => item !== null);
}

// ===============TMDB功能函式===============
async function fetchTmdbData(api, params) {
    try {
        const tmdbParams = { ...params };
        delete tmdbParams.type;
        delete tmdbParams.time_window;
        const response = await Widget.tmdb.get(api, { params: tmdbParams });
        if (!response?.results) {
            throw new Error(response?.status_message || "無效的API響應格式");
        }
        return response.results.map(item => {
            const isMovie = api.includes('movie') || item.media_type === 'movie';
            const mediaType = isMovie ? 'movie' : 'tv';
            return {
                id: item.id,
                type: "tmdb",
                mediaType: mediaType,
                title: isMovie ? item.title : item.name,
                description: formatItemDescription({
                    description: item.overview,
                    rating: item.vote_average ? (item.vote_average / 2).toFixed(1) : undefined,
                    releaseDate: isMovie ? item.release_date : item.first_air_date
                }),
                releaseDate: isMovie ? item.release_date : item.first_air_date,
                backdropPath: item.backdrop_path && `https://image.tmdb.org/t/p/w780${item.backdrop_path}`,
                posterPath: item.poster_path && `https://image.tmdb.org/t/p/w500${item.poster_path}`,
                rating: item.vote_average ? (item.vote_average / 2).toFixed(1) : undefined
            };
        }).filter(item => item.id && item.title);
    } catch (error) {
        console.error(`API呼叫失敗: ${api}`, error);
        return [createErrorItem(api, '資料載入失敗', error)];
    }
}

async function tmdbNowPlaying(params) {
    const type = params.type || 'movie';
    const api = type === 'movie' ? "movie/now_playing" : "tv/on_the_air";
    return await fetchTmdbData(api, params);
}

async function tmdbTrending(params) {
    const timeWindow = params.time_window || 'day';
    const api = `trending/all/${timeWindow}`;
    return await fetchTmdbData(api, params);
}


async function tmdbTopRated(params) {
    const type = params.type || 'movie';
    const api = type === 'movie' ? `movie/top_rated` : `tv/top_rated`;
    return await fetchTmdbData(api, params);
}

async function tmdbUpcomingMovies(params) {
    const api = "discover/movie";
    const discoverParams = {
        language: params.language || 'zh-TW',
        page: params.page || 1,
        sort_by: 'primary_release_date.asc',
        'primary_release_date.gte': params['primary_release_date.gte'] || getCurrentDate(),
        with_release_type: params.with_release_type || '2,3'
    };
    if (params['primary_release_date.lte']) discoverParams['primary_release_date.lte'] = params['primary_release_date.lte'];
    if (params.with_genres) discoverParams.with_genres = params.with_genres;
    if (params['vote_average.gte']) discoverParams['vote_average.gte'] = params['vote_average.gte'];
    if (params['vote_count.gte']) discoverParams['vote_count.gte'] = params['vote_count.gte'];
    if (params.with_keywords) discoverParams.with_keywords = params.with_keywords;
    return await fetchTmdbData(api, discoverParams);
}

async function tmdbDiscoverByNetwork(params = {}) {
    const api = "discover/tv";
    const discoverParams = {
        language: params.language || 'zh-TW',
        page: params.page || 1,
        with_networks: params.with_networks,
        sort_by: params.sort_by,
        ...(params.air_status === 'released' && { 
            'first_air_date.lte': getCurrentDate() 
        }),
        ...(params.air_status === 'upcoming' && { 
            'first_air_date.gte': getCurrentDate() 
        }),
        ...(params.with_genres && { with_genres: params.with_genres })
    };
    return await fetchTmdbData(api, discoverParams);
}

// ===============IMDB功能函式===============
async function loadImdbCardItems(params = {}) {
  const url = params.url;
  if (!url) throw new Error("缺少 IMDB 片單 URL");
  const response = await Widget.http.get(url, {
    headers: {
      Referer: "https://www.imdb.com/",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9,zh-TW;q=0.8,zh;q=0.7",
    },
  });
  if (!response || !response.data) throw new Error("獲取 IMDB 片單資料失敗");
  const videoIds = [];
  const ldJsonMatch = response.data.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (ldJsonMatch && ldJsonMatch[1]) {
      try {
          const json = JSON.parse(ldJsonMatch[1]);
          if (json && json.itemListElement && Array.isArray(json.itemListElement)) {
              for (const item of json.itemListElement) {
                  if (item && item.item && item.item.url) {
                      const idMatch = item.item.url.match(/(tt\d+)/);
                      if (idMatch && idMatch[1]) {
                          videoIds.push({
                              id: idMatch[1],
                              type: "imdb",
                              title: item.item.name || "Unknown Title",
                              coverUrl: item.item.image || undefined,
                          });
                      }
                  }
              }
          }
      } catch (e) {
          console.warn("解析 LD+JSON 失敗:", e);
      }
  }
  if (videoIds.length === 0) {
      const docId = Widget.dom.parse(response.data);
      if (docId < 0) throw new Error("解析 IMDB HTML 失敗");
      const itemElementIds = Widget.dom.select(docId, "ul.ipc-metadata-list > li, .lister-list > tr");
      for (const itemId of itemElementIds) {
          try {
              const linkElementId = Widget.dom.selectFirst(itemId, ".ipc-title__text, .titleColumn a");
              let link = "";
              let title = "";
              if (linkElementId >= 0) {
                  const titleText = await Widget.dom.text(linkElementId);
                  title = titleText ? titleText.replace(/^\d+\.\s*/, '').trim() : "Unknown Title";
                  const titleLinkElementId = Widget.dom.selectFirst(itemId, "a.ipc-title-link-wrapper, .titleColumn a");
                   if (titleLinkElementId >= 0) {
                       link = await Widget.dom.attr(titleLinkElementId, "href");
                   }
              }
              if (link) {
                  const idMatch = link.match(/(tt\d+)/);
                  if (idMatch && idMatch[1]) {
                      let coverUrl = "";
                      const imgElementId = Widget.dom.selectFirst(itemId, ".ipc-poster img, .posterColumn img");
                      if (imgElementId >= 0) {
                          coverUrl = await Widget.dom.attr(imgElementId, "src");
                          if (coverUrl && coverUrl.startsWith('//')) coverUrl = 'https:' + coverUrl;
                          if (coverUrl) coverUrl = coverUrl.replace(/\/(c|g|s)\//, '/l/');
                      }
                      videoIds.push({
                          id: idMatch[1],
                          type: "imdb",
                          title: title || "Unknown Title",
                          coverUrl: coverUrl || undefined,
                          description: ""
                        });
                  }
              }
          } catch (parseError) {
              console.error("IMDB 解析錯誤:", parseError);
          }
      }
  }
  const { start, limit } = calculatePagination(params);
  const end = start + limit;
  return videoIds.slice(start, end);
}
