const BASE_URL = "https://www.cineby.sc";
const TMDB_API = "YOUR_TMDB_API_KEY";

var WidgetMetadata = {
    id: "cineby.tmdb",
    title: "Cineby",
    description: "Cineby + TMDB Metadata",
    author: "ChatGPT",
    site: BASE_URL,
    version: "2.0.0",
    requiredVersion: "0.0.1",

    modules: [
        {
            title: "Trending",
            description: "熱門影片",
            requiresWebView: false,
            functionName: "loadTrending",
            cacheDuration: 1800,
            params: []
        },
        {
            title: "Latest",
            description: "最新影片",
            requiresWebView: false,
            functionName: "loadLatest",
            cacheDuration: 1800,
            params: []
        }
    ],

    search: {
        title: "搜尋",
        functionName: "search",
        params: [
            {
                name: "keyword",
                title: "關鍵字",
                type: "input"
            }
        ]
    }
};

const headers = {
    "User-Agent": "Mozilla/5.0",
    "Referer": BASE_URL,
    "Origin": BASE_URL
};

async function request(url, options = {}) {
    const res = await Widget.http.get(url, {
        headers: {
            ...headers,
            ...(options.headers || {})
        }
    });

    return res.data;
}

function absolute(url) {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return BASE_URL + url;
}

function buildMediaItem(item) {
    return {
        id: item.id || item.slug || item.url,
        type: "url",
        title: item.title,
        posterPath: absolute(item.poster),
        backdropPath: absolute(item.backdrop || item.poster),
        description: item.overview || "",
        link: absolute(item.url)
    };
}

async function search(params = {}) {
    const keyword = params.keyword;

    if (!keyword) {
        throw new Error("請輸入搜尋關鍵字");
    }

    const api =
        `${BASE_URL}/api/search?q=${encodeURIComponent(keyword)}`;

    const json = await request(api);

    const items = [];

    for (const item of json.results || []) {
        items.push(buildMediaItem({
            id: item.id,
            title: item.title,
            poster: item.poster_path,
            backdrop: item.backdrop_path,
            overview: item.overview,
            url: `/movie/${item.slug}`
        }));
    }

    return items;
}

async function loadTrending() {
    const api = `${BASE_URL}/api/trending`;

    const json = await request(api);

    return (json.results || []).map(item =>
        buildMediaItem({
            id: item.id,
            title: item.title,
            poster: item.poster_path,
            backdrop: item.backdrop_path,
            overview: item.overview,
            url: `/movie/${item.slug}`
        })
    );
}

async function loadLatest() {
    const api = `${BASE_URL}/api/latest`;

    const json = await request(api);

    return (json.results || []).map(item =>
        buildMediaItem({
            id: item.id,
            title: item.title,
            poster: item.poster_path,
            backdrop: item.backdrop_path,
            overview: item.overview,
            url: `/movie/${item.slug}`
        })
    );
}

async function loadDetail(link) {

    const html = await request(link);

    const $ = Widget.html.load(html);

    const title =
        $("meta[property='og:title']").attr("content") ||
        $("title").text();

    const poster =
        $("meta[property='og:image']").attr("content");

    const description =
        $("meta[property='og:description']").attr("content");

    let tmdbId = "";

    $("script").each((i, el) => {

        const text = $(el).html() || "";

        const match = text.match(/tmdb["']?\s*:\s*["']?(\d+)/i);

        if (match) {
            tmdbId = match[1];
        }
    });

    let metadata = {};

    if (tmdbId) {

        try {

            metadata = await loadTMDB(tmdbId);

        } catch (e) {
            console.log(e);
        }
    }

    const videoUrl = await extractVideoUrl($);

    return {
        id: link,
        type: "url",

        title: metadata.title || title,

        description:
            metadata.overview ||
            description,

        releaseDate:
            metadata.release_date || "",

        genres:
            (metadata.genres || [])
                .map(g => g.name)
                .join(", "),

        rating:
            metadata.vote_average || 0,

        posterPath:
            metadata.poster ||
            poster,

        backdropPath:
            metadata.backdrop ||
            poster,

        videoUrl,

        playerType: "hls",

        headers: {
            Referer: BASE_URL,
            Origin: BASE_URL
        },

        subtitles: metadata.subtitles || []
    };
}

async function loadTMDB(id) {

    const api =
        `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API}&language=zh-TW`;

    const json = await request(api);

    return {
        title: json.title,
        overview: json.overview,
        release_date: json.release_date,
        vote_average: json.vote_average,

        genres: json.genres,

        poster:
            "https://image.tmdb.org/t/p/w500" +
            json.poster_path,

        backdrop:
            "https://image.tmdb.org/t/p/original" +
            json.backdrop_path
    };
}

async function extractVideoUrl($) {

    let iframe = "";

    $("iframe").each((i, el) => {

        const src = $(el).attr("src");

        if (src && !iframe) {
            iframe = src;
        }
    });

    if (!iframe) {
        throw new Error("找不到播放器");
    }

    iframe = absolute(iframe);

    const embedHtml = await request(iframe);

    const m3u8 =
        embedHtml.match(/https?:\/\/.*?\.m3u8[^"' ]*/i);

    if (m3u8) {
        return m3u8[0];
    }

    const sources =
        embedHtml.match(/sources\s*:\s*(\[[\s\S]*?\])/i);

    if (sources) {

        try {

            const arr = JSON.parse(sources[1]);

            if (arr.length > 0) {
                return arr[0].file;
            }

        } catch (e) {}
    }

    throw new Error("無法解析影片");
}
