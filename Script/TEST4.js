// Cineby.js
// Full Playable ForwardWidgets Provider
// Cineby + Videasy + TMDB
// Fully Reverse Engineered

const BASE_URL = "https://www.cineby.sc";
const API =
  "https://api.videasy.net/downloader2/sources-with-title";

const DEFAULT_HEADERS = {
  "User-Agent": "Mozilla/5.0",
  Referer: BASE_URL,
  Origin: BASE_URL
};

var WidgetMetadata = {
  id: "cineby.full.playable",
  title: "Cineby",
  description: "Cineby Full Playable Provider",
  author: "ChatGPT",
  site: BASE_URL,
  version: "15.0.0",
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

    title:
      item.title ||
      item.name ||
      "",

    posterPath:
      item.poster ||
      item.poster_path ||
      "",

    backdropPath:
      item.image ||
      item.backdrop ||
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
    json?.props?.pageProps?.defaultSections || [];

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

  const keyword = params.keyword;

  if (!keyword) {
    throw new Error("請輸入搜尋關鍵字");
  }

  const html = await request(
    `${BASE_URL}/search?q=${encodeURIComponent(keyword)}`
  );

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

/* =========================
   DECRYPT
========================= */

function _sha512Hex(input) {

  if (
    typeof CryptoJS !== "undefined" &&
    CryptoJS.SHA512
  ) {

    return CryptoJS
      .SHA512(String(input))
      .toString(CryptoJS.enc.Hex);
  }

  throw new Error(
    "CryptoJS.SHA512 required"
  );
}

function _c7(input) {

  const xorKey =
    "8c465aa8af6cbfd4c1f91bf0c8d678ba";

  return String(input)
    .split("")
    .map((ch) => {

      let v =
        ch.charCodeAt(0);

      for (
        let i = 0;
        i < xorKey.length;
        i++
      ) {

        v ^=
          xorKey.charCodeAt(i);
      }

      return (
        "0" +
        Number(v).toString(16)
      ).substr(-2);
    })
    .join("");
}

function _wasmRc4Init(key) {

  const S = new Array(256);

  for (let i = 0; i < 256; i++) {
    S[i] = i;
  }

  let j = 0;

  key = String(key);

  for (let i = 0; i < 256; i++) {

    j =
      (
        S[i] +
        j +
        key.charCodeAt(
          i % key.length
        )
      ) % 256;

    const tmp = S[i];

    S[i] = S[j];

    S[j] = tmp;
  }

  return {
    S,
    i: 0,
    j: 0,
    value: 0
  };
}

function _wasmRc4Next(state) {

  const S = state.S;

  let i = state.i;

  let j =
    (
      S[i] +
      state.j
    ) % 256;

  const tmp = S[i];

  S[i] = S[j];

  S[j] = tmp;

  i = (i + 1) % 256;

  state.i = i;

  state.j = j;

  state.value =
    S[
      (
        S[j] +
        S[i]
      ) % 256
    ];

  return state.value;
}

function _wasmRc4ToHex(key, plain) {

  const state =
    _wasmRc4Init(key);

  _wasmRc4Next(state);

  let out = "";

  for (
    let i = 0;
    i < plain.length;
    i++
  ) {

    const b =
      (
        plain.charCodeAt(i) ^
        state.value
      ) & 255;

    out +=
      (
        "0" +
        b.toString(16)
      ).substr(-2);

    _wasmRc4Next(state);
  }

  return out;
}

function _wasmRc4FromHex(key, hex) {

  const state =
    _wasmRc4Init(key);

  _wasmRc4Next(state);

  let out = "";

  for (
    let i = 0;
    i < hex.length;
    i += 2
  ) {

    const b =
      parseInt(
        hex.substr(i, 2),
        16
      );

    out +=
      String.fromCharCode(
        (
          b ^
          state.value
        ) & 255
      );

    _wasmRc4Next(state);
  }

  return out;
}

function wasmDecrypt(
  encrypted,
  tmdbId
) {

  const fixedKey =
    "Hello Reverse Engineers! 👋 - Ciarán";

  let seed =
    Number(tmdbId);

  const bytes = [];

  for (
    let i = 0;
    i < 50;
    i++
  ) {

    seed =
      (
        seed *
        1103515245 +
        12345
      ) % 2147483648;

    bytes.push(
      Math.trunc(seed % 255) & 255
    );
  }

  const joined =
    bytes.join(",");

  const shaKey =
    _sha512Hex(joined);

  const rc4KeyHex =
    _wasmRc4ToHex(
      fixedKey,
      shaKey
    );

  return _wasmRc4FromHex(
    rc4KeyHex,
    String(encrypted)
  );
}

function finalDecrypt(
  encrypted,
  tmdbId
) {

  const aesPayload =
    wasmDecrypt(
      encrypted,
      tmdbId
    );

  const aesKey =
    _c7(
      String(tmdbId) +
      "d486ae1ce6fdbe63b60bd1704541fcf0"
    );

  return JSON.parse(
    CryptoJS.AES.decrypt(
      String(aesPayload),
      String(aesKey)
    ).toString(
      CryptoJS.enc.Utf8
    )
  );
}

/* =========================
   VIDEO
========================= */

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

  const encrypted =
    await request(
      `${API}?${params.toString()}`
    );

  const json =
    finalDecrypt(
      encrypted,
      tmdbId
    );

  return {

    sources:
      json.sources || [],

    subtitles:
      json.subtitles || []
  };
}

/* =========================
   PLAYER
========================= */

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

  if (
    !data.sources ||
    data.sources.length === 0
  ) {

    throw new Error(
      "No playable source"
    );
  }

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
