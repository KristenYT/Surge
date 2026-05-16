// Cineby.js
// ForwardWidgets Advanced Provider
// Cineby + Videasy + TMDB
// VodMax-style Full Module

const BASE_URL = "https://www.cineby.sc";
const API_BASE = "https://api.videasy.net";
const BACKEND = "https://backend.cineby.sc/v1";

const DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0",
    "Origin": BASE_URL,
    "Referer": BASE_URL
};

var WidgetMetadata = {
    id: "cineby.full",
    title: "Cineby",
    description: "Cineby Full Provider",
    author: "ChatGPT",
    site: BASE_URL,
    version: "5.0.0",
    requiredVersion: "0.0.1",

    modules: [
        {
            title: "熱門電影",
            description: "Trending Movies",
            requiresWebView: false,
            functionName: "loadTrendingMovies",
            cacheDuration: 1800,
            params: []
        },
        {
            title: "熱門劇集",
            description: "Trending TV",
            requiresWebView: false,
            functionName: "loadTrendingTV",
            cacheDuration: 1800,
            params: []
        },
        {
            title: "最新電影",
            description: "Latest Movies",
            requiresWebView: false,
            functionName: "loadLatestMovies",
            cacheDuration: 1800,
            params: []
        },
        {
            title: "動漫",
            description: "Anime",
            requiresWebView: false,
            functionName: "loadAnime",
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
                type: "input",
                description: "輸入影片名稱"
            }
        ]
    }
};

async function request(url, options = {}) {

    const method = options.method || "GET";

    let response;

    if (method === "POST") {

        response = await Widget.http.post(url, {
            headers: {
                ...DEFAULT_HEADERS,
                ...(options.headers || {})
            },
            data: options.data || {}
        });

    } else {

        response = await Widget.http.get(url, {
            headers: {
                ...DEFAULT_HEADERS,
                ...(options.headers || {})
            }
        });
    }

    return response.data;
}

function absolute(url) {

    if (!url) return "";

    if (url.startsWith("http")) {
        return url;
    }

    return BASE_URL + url;
}

function extractNextData(html) {

    const match = html.match(
        /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/
    );

    if (!match) {
        throw new Error("NEXT_DATA not found");
    }

    return JSON.parse(match[1]);
}

function mapItem(item) {

    return {
        id: item.slug || item.id,
        type: "url",

        title: item.title || item.name,

        posterPath:
            item.poster ||
            item.poster_path ||
            "",

        backdropPath:
            item.image ||
            item.backdrop ||
            item.backdrop_path ||
            item.poster ||
            "",

        description:
            item.description ||
            item.overview ||
            "",

        link:
            item.slug
                ? BASE_URL + item.slug
                : ""
    };
}

async function loadHomeSection(index = 0) {

    const html = await request(BASE_URL);

    const json = extractNextData(html);

    const sections =
        json.props.pageProps.defaultSections || [];

    if (!sections[index]) {
        return [];
    }

    return (sections[index].movies || [])
        .map(mapItem);
}

async function loadTrendingMovies() {
    return await loadHomeSection(0);
}

async function loadTrendingTV() {
    return await loadHomeSection(1);
}

async function loadLatestMovies() {
    return await loadHomeSection(2);
}

async function loadAnime() {
    return await loadHomeSection(3);
}

async function search(params = {}) {

    const keyword = params.keyword;

    if (!keyword) {
        throw new Error("請輸入搜尋關鍵字");
    }

    const url =
        `${BASE_URL}/search?q=${encodeURIComponent(keyword)}`;

    const html = await request(url);

    const json = extractNextData(html);

    const data =
        JSON.stringify(json);

    const regex =
        /"title":"(.*?)".*?"slug":"(.*?)".*?"poster":"(.*?)"/g;

    let match;

    const items = [];

    while ((match = regex.exec(data)) !== null) {

        items.push({
            id: match[2],
            type: "url",

            title: match[1],

            posterPath: match[3],
            backdropPath: match[3],

            link:
                BASE_URL + match[2]
        });
    }

    return items;
}

async function loadDetail(link) {

    const html = await request(link);

    const json = extractNextData(html);

    const raw =
        JSON.stringify(json);

    const tmdbId =
        raw.match(/"id":(\d+)/)?.[1] || "";

    const imdbId =
        raw.match(/tt\d+/)?.[0] || "";

    const title =
        raw.match(/"title":"(.*?)"/)?.[1] || "";

    const overview =
        raw.match(/"description":"(.*?)"/)?.[1] || "";

    const poster =
        raw.match(/"poster":"(.*?)"/)?.[1] || "";

    const backdrop =
        raw.match(/"image":"(.*?)"/)?.[1] || poster;

    const year =
        raw.match(/"releaseDate":"(.*?)"/)?.[1]
            ?.split("-")[0] || "";

    const mediaType =
        link.includes("/tv/")
            ? "tv"
            : "movie";

    let seasons = [];

    if (mediaType === "tv") {

        const seasonMatches =
            [...raw.matchAll(/"seasonNumber":(\d+)/g)];

        seasons =
            [...new Set(
                seasonMatches.map(v => v[1])
            )];
    }

    return {
        id: link,
        type: "detail",

        title,
        description: overview,

        posterPath: poster,
        backdropPath: backdrop,

        releaseDate: year,

        mediaType,

        tmdbId,
        imdbId,

        seasons,

        link
    };
}

async function loadEpisodes(detail, season = 1) {

    const tmdbId = detail.tmdbId;

    const api =
        `${BACKEND}/tmdb/tv/${tmdbId}/season/${season}`;

    try {

        const json =
            await request(api);

        return (json.episodes || []).map(ep => ({

            id: ep.id,

            title:
                `E${ep.episode_number} ${ep.name}`,

            episode: ep.episode_number,
            season,

            thumbnail:
                ep.still_path
                    ? `https://image.tmdb.org/t/p/w500${ep.still_path}`
                    : detail.posterPath,

            overview:
                ep.overview || ""
        }));

    } catch (e) {

        return [];
    }
}

async function loadVideo(detail, season = 1, episode = 1) {

    const mediaType =
        detail.mediaType;

    let endpoint =
        `${API_BASE}/mb-flix/sources-with-title`;

    const params = new URLSearchParams();

    params.append("title", detail.title);

    params.append("mediaType", mediaType);

    params.append("tmdbId", detail.tmdbId);

    if (detail.imdbId) {
        params.append("imdbId", detail.imdbId);
    }

    if (mediaType === "tv") {

        params.append("seasonId", season);
        params.append("episodeId", episode);
    }

    const url =
        `${endpoint}?${params.toString()}`;

    const data =
        await request(url);

    return parseVideoResponse(data);
}

function parseVideoResponse(data) {

    if (!data) {
        throw new Error("No source");
    }

    if (typeof data === "string") {

        const m3u8 =
            data.match(
                /https?:\/\/[^"' ]+\.m3u8[^"' ]*/i
            );

        if (m3u8) {

            return {
                sources: [
                    {
                        quality: "Auto",
                        url: m3u8[0]
                    }
                ],
                subtitles: []
            };
        }
    }

    if (data.sources) {

        return {
            sources:
                data.sources.map(v => ({
                    quality:
                        v.quality ||
                        "Auto",

                    url:
                        v.file ||
                        v.url
                })),

            subtitles:
                (data.subtitles || [])
                    .map(v => ({
                        lang:
                            v.label ||
                            v.lang,

                        url:
                            v.file ||
                            v.url
                    }))
        };
    }

    throw new Error("Unable to parse source");
}

async function loadPlayer(detail, season = 1, episode = 1) {

    const parsed =
        await loadVideo(
            detail,
            season,
            episode
        );

    const source =
        parsed.sources[0];

    return {

        videoUrl: source.url,

        playerType: "hls",

        headers: {
            Referer: BASE_URL,
            Origin: BASE_URL
        },

        subtitles:
            parsed.subtitles || []
    };
}

async function loadSeasonEpisodes(detail) {

    if (detail.mediaType !== "tv") {
        return [];
    }

    const all = [];

    for (const season of detail.seasons) {

        const episodes =
            await loadEpisodes(
                detail,
                season
            );

        all.push({
            season,
            episodes
        });
    }

    return all;
}
