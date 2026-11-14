/* YouTube TC workaround: mirror Chrome extension's zh-Hant -> zh-Hans request.
 * Do not modify lang (the source language), or native Chinese caption requests.
 */
(function () {
  try {
    var url = $request.url;
    if (!/^https:\/\/(?:(?:www\.|m\.)?youtube\.com|video\.google\.com)\/api\/timedtext\?/.test(url) ||
        !/[?&]tlang=zh-Hant(?=&|$)/.test(url)) return $done({});
    url = url.replace(/([?&])tlang=zh-Hant(?=&|$)/g, '$1tlang=zh-Hans');
    if (!/[?&]origin_tlang=zh-Hant(?=&|$)/.test(url)) url += '&origin_tlang=zh-Hant';
    $done({url: url});
  } catch (error) {
    console.log('[YouTube TC request] ' + String(error));
    $done({});
  }
})();
