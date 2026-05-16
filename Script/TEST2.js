const BASE_URL = "https://www.cineby.sc";
const API = "https://api.videasy.net";

const headers = {
    "User-Agent": "Mozilla/5.0",
    "Origin": BASE_URL,
    "Referer": BASE_URL
};

var WidgetMetadata = {
    id: "cineby.videasy",
    title: "Cineby",
    description: "Cineby + Videasy",
    author: "ChatGPT",
    site: BASE_URL,
    version: "3.0.0",
    requiredVersion: "0.0.1",

    modules: [
        {
            title: "Trending",
            description: "熱門",
            requiresWebView: false,
            functionName: "loadTrending",
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

async function request(url) {

    const res = await Widget.http.get(url, {
        headers
    });

    return res.data;
}

async function search(params = {}) {

    const keyword = params.keyword;

    const html = await request(
        `${BASE_URL}/search?q=${encodeURIComponent(keyword)}`
    );

    const nextData =
        html.match(
            /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/
        );

    if (!nextData) {
        throw new Error("No data");
    }

    const json =
        JSON.parse(nextData[1]);

    const items = [];

    const all =
        JSON.stringify(json);

    const matches =
        all.match(
            /"title":"(.*?)".*?"slug":"(.*?)".*?"poster":"(.*?)"/g
        ) || [];

    for (const raw of matches) {

        const title =
            raw.match(/"title":"(.*?)"/)?.[1];

        const slug =
            raw.match(/"slug":"(.*?)"/)?.[1];

        const poster =
            raw.match(/"poster":"(.*?)"/)?.[1];

        items.push({
            id: slug,
            type: "url",
            title,
            posterPath: poster,
            backdropPath: poster,
            link: BASE_URL + slug
        });
    }

    return items;
}

async function loadTrending() {

    const html = await request(BASE_URL);

    const nextData =
        html.match(
            /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/
        );

    const json =
        JSON.parse(nextData[1]);

    const sections =
        json.props.pageProps.defaultSections || [];

    const items = [];

    for (const section of sections) {

        for (const item of section.movies || []) {

            items.push({
                id: item.slug,
                type: "url",
                title: item.title,
                posterPath: item.poster,
                backdropPath: item.image,
                description: item.description,
                link: BASE_URL + item.slug
            });
        }
    }

    return items;
}

async function loadDetail(link) {

    const html = await request(link);

    const nextData =
        html.match(
            /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/
        );

    const json =
        JSON.parse(nextData[1]);

    const data =
        JSON.stringify(json);

    const tmdbId =
        data.match(/"id":(\d+)/)?.[1];

    const imdbId =
        data.match(/tt\d+/)?.[0];

    const title =
        data.match(/"title":"(.*?)"/)?.[1];

    const poster =
        data.match(/"poster":"(.*?)"/)?.[1];

    const overview =
        data.match(/"description":"(.*?)"/)?.[1];

    let mediaType =
        link.includes("/tv/")
            ? "tv"
            : "movie";

    let sourceUrl = "";

    if (mediaType === "tv") {

        sourceUrl =
            `${API}/mb-flix/sources-with-title?title=${encodeURIComponent(title)}&mediaType=tv&year=2026&episodeId=1&seasonId=1&tmdbId=${tmdbId}&imdbId=${imdbId}`;

    } else {

        sourceUrl =
            `${API}/mb-flix/sources-with-title?title=${encodeURIComponent(title)}&mediaType=movie&tmdbId=${tmdbId}&imdbId=${imdbId}`;
    }

    const sourceJson =
        await request(sourceUrl);

    let videoUrl = "";

    if (typeof sourceJson === "string") {

        const m3u8 =
            sourceJson.match(
                /https?:\/\/[^"' ]+\.m3u8[^"' ]*/i
            );

        if (m3u8) {
            videoUrl = m3u8[0];
        }
    }

    if (!videoUrl) {

        if (sourceJson?.sources?.length > 0) {

            videoUrl =
                sourceJson.sources[0].file;
        }
    }

    return {
        id: link,
        type: "url",

        title,
        description: overview,

        posterPath: poster,
        backdropPath: poster,

        videoUrl,

        playerType: "hls",

        headers: {
            Referer: BASE_URL,
            Origin: BASE_URL
        }
    };
}
