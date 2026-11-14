/* Prepend opencc-js cn2t UMD bundle. Converter cn -> twp matches the extension.
 * Convert only requested TC translations, never an ordinary simplified track.
 * Both rewritten and original request URLs are accepted: Surge may expose either.
 */
(function () {
  var started = Date.now();
  function finish(result) {
    console.log('[YouTube TC] status=' + $response.status + ' chars=' + (typeof $response.body === 'string' ? $response.body.length : 0) + ' converted=' + !!result.body + ' processing_ms=' + (Date.now() - started));
    $done(result);
  }
  try {
    var url = $request.url;
    var marked = /[?&]tlang=zh-Hans(?=&|$)/.test(url) && /[?&]origin_tlang=zh-Hant(?=&|$)/.test(url);
    var original = /[?&]tlang=zh-Hant(?=&|$)/.test(url);
    if (!/^https:\/\/(?:(?:www\.|m\.)?youtube\.com|video\.google\.com)\/api\/timedtext\?/.test(url) ||
        (!marked && !original) || Number($response.status) !== 200 ||
        typeof $response.body !== 'string' || !$response.body) return finish({});
    var convert = OpenCC.Converter({from: 'cn', to: 'twp'});
    var body = $response.body;
    // Improvement over the extension: decode JSON3 Unicode escapes and only
    // convert subtitle utf8 fields, leaving numeric timing and metadata alone.
    if (/^\s*\{/.test(body)) {
      var json = JSON.parse(body);
      if (Array.isArray(json.events)) {
        json.events.forEach(function (event) {
          if (Array.isArray(event.segs)) event.segs.forEach(function (seg) {
            if (typeof seg.utf8 === 'string') seg.utf8 = convert(seg.utf8);
          });
        });
        return finish({body: JSON.stringify(json)});
      }
      return finish({});
    }
    // XML/srv3: same in-place text conversion as the extension.
    if (/^\s*</.test(body)) return finish({body: convert(body)});
    finish({});
  } catch (error) {
    console.log('[YouTube TC response] conversion skipped: ' + String(error));
    finish({});
  }
})();
