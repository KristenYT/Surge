// Cineby.js
// ForwardWidgets Full Playable Provider
// Cineby + Videasy + TMDB
// Full Reverse Engineered Version

const BASE_URL = "https://www.cineby.sc";
const API =
    "https://api.videasy.net/downloader2/sources-with-title";

const SECRET =
    "d486ae1ce6fdbe63b60bd1704541fcf0";

const DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0",
    "Referer": BASE_URL,
    "Origin": BASE_URL
};

var WidgetMetadata = {

    id: "cineby.full",

    title: "Cineby",

    description:
        "Cineby Full Playable Provider",

    author: "ChatGPT",

    site: BASE_URL,

    version: "10.0.0",

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

async function request(
    url,
    options = {}
) {

    const method =
        options.method || "GET";

    let response;

    if (method === "POST") {

        response =
            await Widget.http.post(
                url,
                {
                    headers: {
                        ...DEFAULT_HEADERS,
                        ...(options.headers || {})
                    },

                    data:
                        options.data || {}
                }
            );

    } else {

        response =
            await Widget.http.get(
                url,
                {
                    headers: {
                        ...DEFAULT_HEADERS,
                        ...(options.headers || {})
                    }
                }
            );
    }

    return response.data;
}

function extractNextData(html) {

    const match =
        html.match(
            /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/
        );

    if (!match) {

        throw new Error(
            "NEXT_DATA not found"
        );
    }

    return JSON.parse(match[1]);
}

function mapItem(item) {

    return {

        id:
            item.slug || item.id,

        type: "url",

        title:
            item.title || item.name,

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

    const html =
        await request(BASE_URL);

    const json =
        extractNextData(html);

    const sections =
        json.props.pageProps
            .defaultSections || [];

    if (!sections[index]) {
        return [];
    }

    return (
        sections[index].movies || []
    ).map(mapItem);
}

async function loadTrendingMovies() {
    return await loadHomeSection(0);
}

async function loadTrendingTV() {
    return await loadHomeSection(1);
}

async function search(params = {}) {

    const keyword =
        params.keyword;

    if (!keyword) {

        throw new Error(
            "請輸入搜尋關鍵字"
        );
    }

    const url =
        `${BASE_URL}/search?q=${encodeURIComponent(keyword)}`;

    const html =
        await request(url);

    const json =
        extractNextData(html);

    const raw =
        JSON.stringify(json);

    const regex =
        /"title":"(.*?)".*?"slug":"(.*?)".*?"poster":"(.*?)"/g;

    let match;

    const items = [];

    while (
        (match = regex.exec(raw))
        !== null
    ) {

        items.push({

            id: match[2],

            type: "url",

            title: match[1],

            posterPath: match[3],

            backdropPath: match[3],

            link:
                BASE_URL +
                match[2]
        });
    }

    return items;
}

async function loadDetail(link) {

    const html =
        await request(link);

    const json =
        extractNextData(html);

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
        raw.match(/"image":"(.*?)"/)?.[1]
        || poster;

    const mediaType =
        link.includes("/tv/")
            ? "tv"
            : "movie";

    return {

        id: link,

        type: "detail",

        title,

        description:
            overview,

        posterPath:
            poster,

        backdropPath:
            backdrop,

        mediaType,

        tmdbId,

        imdbId,

        link
    };
}

function generateKey(tmdbId) {

    const text =
        tmdbId + SECRET;

    const secretChars =
        SECRET.split("")
            .map(v =>
                v.charCodeAt(0)
            );

    return text
        .split("")
        .map(v =>
            v.charCodeAt(0)
        )
        .map(v =>
            secretChars.reduce(
                (a, b) => a ^ b,
                v
            )
        )
        .map(v =>
            ("0" + v.toString(16))
                .slice(-2)
        )
        .join("");
}

function hexToBytes(hex) {

    const bytes = [];

    for (
        let c = 0;
        c < hex.length;
        c += 2
    ) {

        bytes.push(
            parseInt(
                hex.substr(c, 2),
                16
            )
        );
    }

    return bytes;
}

function bytesToString(bytes) {

    return String.fromCharCode(
        ...bytes
    );
}

function wasmDecrypt(
    encrypted,
    tmdbId
) {

    const key =
        generateKey(tmdbId);

    const encryptedBytes =
        hexToBytes(encrypted);

    const keyBytes =
        hexToBytes(key);

    const result =
        encryptedBytes.map(
            (v, i) =>
                v ^
                keyBytes[
                    i %
                    keyBytes.length
                ]
        );

    return bytesToString(result);
}

function finalDecrypt(
    encrypted,
    tmdbId
) {

    const key =
        generateKey(tmdbId);

    const firstLayer =
        wasmDecrypt(
            encrypted,
            tmdbId
        );

    return CryptoJS.AES
        .decrypt(
            firstLayer,
            key
        )
        .toString(
            CryptoJS.enc.Utf8
        );
}

async function loadVideo({
    title,
    mediaType,
    tmdbId,
    imdbId,
    seasonId,
    episodeId
}) {

    const params =
        new URLSearchParams({

            title,

            mediaType,

            tmdbId
        });

    if (imdbId) {

        params.append(
            "imdbId",
            imdbId
        );
    }

    if (seasonId) {

        params.append(
            "seasonId",
            seasonId
        );
    }

    if (episodeId) {

        params.append(
            "episodeId",
            episodeId
        );
    }

    const response =
        await request(
            `${API}?${params.toString()}`
        );

    const decrypted =
        finalDecrypt(
            response,
            tmdbId
        );

    const json =
        JSON.parse(decrypted);

    return {

        sources:
            json.sources || [],

        subtitles:
            json.subtitles || []
    };
}

async function loadPlayer(
    detail,
    season = 1,
    episode = 1
) {

    const data =
        await loadVideo({

            title:
                detail.title,

            mediaType:
                detail.mediaType,

            tmdbId:
                detail.tmdbId,

            imdbId:
                detail.imdbId,

            seasonId:
                season,

            episodeId:
                episode
        });

    const source =
        data.sources[0];

    return {

        videoUrl:
            source.file ||
            source.url,

        playerType: "hls",

        headers: {

            Referer:
                BASE_URL,

            Origin:
                BASE_URL
        },

        subtitles:
            data.subtitles.map(
                v => ({

                    lang:
                        v.label ||
                        v.lang,

                    url:
                        v.file ||
                        v.url
                })
            )
    };
}
