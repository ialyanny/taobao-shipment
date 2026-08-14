;(function () {
  var BASE = '__BASE__';
  function b(x, c) { return (x << c) | (x >>> (32 - c)); }
  function cadd(x, y) { var e = 2147483648 & x, f = 2147483648 & y, g = 1073741824 & x, h = 1073741824 & y, i = (1073741823 & x) + (1073741823 & y); if (g & h) return 2147483648 ^ i ^ e ^ f; if (g | h) return 1073741824 & i ? 3221225472 ^ i ^ e ^ f : 1073741824 ^ i ^ e ^ f; return i ^ e ^ f; }
  function d(x, y, z) { return (x & y) | (~x & z); }
  function e(x, y, z) { return (x & z) | (y & ~z); }
  function f(x, y, z) { return x ^ y ^ z; }
  function g(x, y, z) { return y ^ (x | ~z); }
  function h(x, y, z, A, B, C, D) { return cadd(b(cadd(x, cadd(cadd(d(y, z, A), B), D)), C), y); }
  function i(x, y, z, A, B, C, D) { return cadd(b(cadd(x, cadd(cadd(e(y, z, A), B), D)), C), y); }
  function j(x, y, z, A, B, C, D) { return cadd(b(cadd(x, cadd(cadd(f(y, z, A), B), D)), C), y); }
  function k(x, y, z, A, B, C, D) { return cadd(b(cadd(x, cadd(cadd(g(y, z, A), B), D)), C), y); }
  function l(x) { var y = [], z, A = x.length, B = A + 8, C = (B - (B % 64)) / 64, D = 16 * (C + 1), E = 0, F = 0; while (F < A) { z = (F - (F % 4)) / 4; E = (F % 4) * 8; y[z] = y[z] | (x.charCodeAt(F) << E); F++; } z = (F - (F % 4)) / 4; E = (F % 4) * 8; y[z] = y[z] | (128 << E); y[D - 2] = A << 3; y[D - 1] = A >>> 29; return y; }
  function m(x) { var y = ''; for (var z = 0; z <= 3; z++) { var A = (x >>> (8 * z)) & 255, B = '0' + A.toString(16); y += B.substring(B.length - 2); } return y; }
  function n(x) { x = x.replace(/\r\n/g, '\n'); var y = ''; for (var z = 0; z < x.length; z++) { var A = x.charCodeAt(z); if (A < 128) y += String.fromCharCode(A); else if (A < 2048) { y += String.fromCharCode((A >> 6) | 192); y += String.fromCharCode((A & 63) | 128); } else { y += String.fromCharCode((A >> 12) | 224); y += String.fromCharCode(((A >> 6) & 63) | 128); y += String.fromCharCode((A & 63) | 128); } } return y; }
  function md5(a) { var o, p, q, r, s, x = l(n(a)), y = 1732584193, z = 4023233417, A = 2562383102, B = 271733878; for (o = 0; o < x.length; o += 16) { p = y; q = z; r = A; s = B; y = h(y, z, A, B, x[o + 0], 7, 3614090360); B = h(B, y, z, A, x[o + 1], 12, 3905402710); A = h(A, B, y, z, x[o + 2], 17, 606105819); z = h(z, A, B, y, x[o + 3], 22, 3250441966); y = h(y, z, A, B, x[o + 4], 7, 4118548399); B = h(B, y, z, A, x[o + 5], 12, 1200080426); A = h(A, B, y, z, x[o + 6], 17, 2821735955); z = h(z, A, B, y, x[o + 7], 22, 4249261313); y = h(y, z, A, B, x[o + 8], 7, 1770035416); B = h(B, y, z, A, x[o + 9], 12, 2336552879); A = h(A, B, y, z, x[o + 10], 17, 4294925233); z = h(z, A, B, y, x[o + 11], 22, 2304563134); y = h(y, z, A, B, x[o + 12], 7, 1804603682); B = h(B, y, z, A, x[o + 13], 12, 4254626195); A = h(A, B, y, z, x[o + 14], 17, 2792965006); z = h(z, A, B, y, x[o + 15], 22, 1236535329); y = i(y, z, A, B, x[o + 1], 5, 4129170786); B = i(B, y, z, A, x[o + 6], 9, 3225465664); A = i(A, B, y, z, x[o + 11], 14, 643717713); z = i(z, A, B, y, x[o + 0], 20, 3921069994); y = i(y, z, A, B, x[o + 5], 5, 3593408605); B = i(B, y, z, A, x[o + 10], 9, 38016083); A = i(A, B, y, z, x[o + 15], 14, 3634488961); z = i(z, A, B, y, x[o + 4], 20, 3889429448); y = i(y, z, A, B, x[o + 9], 5, 568446438); B = i(B, y, z, A, x[o + 14], 9, 3275163606); A = i(A, B, y, z, x[o + 3], 14, 4107603335); z = i(z, A, B, y, x[o + 8], 20, 1163531501); y = i(y, z, A, B, x[o + 13], 5, 2850285829); B = i(B, y, z, A, x[o + 2], 9, 4243563512); A = i(A, B, y, z, x[o + 7], 14, 1735328473); z = i(z, A, B, y, x[o + 12], 20, 2368359562); y = j(y, z, A, B, x[o + 5], 4, 4294588738); B = j(B, y, z, A, x[o + 8], 11, 2272392833); A = j(A, B, y, z, x[o + 11], 16, 1839030562); z = j(z, A, B, y, x[o + 14], 23, 4259657740); y = j(y, z, A, B, x[o + 1], 4, 2763975236); B = j(B, y, z, A, x[o + 4], 11, 1272893353); A = j(A, B, y, z, x[o + 7], 16, 4139469664); z = j(z, A, B, y, x[o + 10], 23, 3200236656); y = j(y, z, A, B, x[o + 13], 4, 681279174); B = j(B, y, z, A, x[o + 0], 11, 3936430074); A = j(A, B, y, z, x[o + 3], 16, 3572445317); z = j(z, A, B, y, x[o + 6], 23, 76029189); y = j(y, z, A, B, x[o + 9], 4, 3654602809); B = j(B, y, z, A, x[o + 12], 11, 3873151461); A = j(A, B, y, z, x[o + 15], 16, 530742520); z = j(z, A, B, y, x[o + 2], 23, 3299628645); y = k(y, z, A, B, x[o + 0], 6, 4096336452); B = k(B, y, z, A, x[o + 7], 10, 1126891415); A = k(A, B, y, z, x[o + 14], 15, 2878612391); z = k(z, A, B, y, x[o + 5], 21, 4237533241); y = k(y, z, A, B, x[o + 12], 6, 1700485571); B = k(B, y, z, A, x[o + 3], 10, 2399980690); A = k(A, B, y, z, x[o + 10], 15, 4293915773); z = k(z, A, B, y, x[o + 1], 21, 2240044497); y = k(y, z, A, B, x[o + 8], 6, 1873313359); B = k(B, y, z, A, x[o + 15], 10, 4264355552); A = k(A, B, y, z, x[o + 6], 15, 2734768916); z = k(z, A, B, y, x[o + 13], 21, 1309151649); y = k(y, z, A, B, x[o + 4], 6, 4149444226); B = k(B, y, z, A, x[o + 11], 10, 3174756917); A = k(A, B, y, z, x[o + 2], 15, 718787259); z = k(z, A, B, y, x[o + 9], 21, 3951481745); y = cadd(y, p); z = cadd(z, q); A = cadd(A, r); B = cadd(B, s); } return (m(y) + m(z) + m(A) + m(B)).toLowerCase(); }

  function findTk() {
    var m = document.cookie.match(/_m_h5_tk=([^;]+)/);
    return m ? m[1].split('_')[0] : '';
  }
  function b64u(s) {
    var b = btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return b;
  }
  function fetchOrders(pageIdx, tk) {
    var time = Date.now();
    var appKey = '12574478';
    var condition = JSON.stringify({ version: '1.0.0', appChannel: '' });
    var extParams = JSON.stringify({ useNewDetail: true, appChannel: '' });
    var data = JSON.stringify({ tabCode: 'all', page: pageIdx, OrderType: 'OrderList', templateConfigVersion: '0', appName: 'tborder', appVersion: '3.0', condition: condition, ttid: '201200@taobao_h5_9.18.0', requestIdentity: '#t#ip#h5', extParams: extParams });
    var sign = md5(tk + '&' + time + '&' + appKey + '&' + data);
    var url = 'https://h5api.m.taobao.com/h5/mtop.taobao.order.queryboughtlistv2/1.0/?jsv=2.7.4&appKey=' + appKey + '&t=' + time + '&sign=' + sign + '&api=mtop.taobao.order.queryboughtlistV2&isSec=0&ecode=1&AntiFlood=true&AntiCreep=true&LoginRequest=true&needLogin=true&v=1.0&ttid=201200%40taobao_h5_9.18.0&H5Request=true&type=jsonp&dataType=jsonp&callback=mtopjsonp24&data=' + encodeURIComponent(data);
    return fetch(url, { headers: { accept: '*/*' }, referrer: 'https://main.m.taobao.com/', referrerPolicy: 'strict-origin-when-cross-origin', method: 'GET', mode: 'cors', credentials: 'include' })
      .then(function (r) { return r.text(); })
      .then(function (raw) {
        var txt = String(raw || '').trim();
        var mm = txt.match(/^[^(]+\(([\s\S]+)\)\s*$/);
        if (!mm || !mm[1]) throw new Error('淘寶訂單回應解析失敗');
        var resp = JSON.parse(mm[1]);
        if (JSON.stringify(resp).indexOf('SESSION_EXPIRE') >= 0) return { needsLogin: true, orders: [] };
        var block = (resp && resp.data && resp.data.data) || {};
        var main = [], goods = {}, pay = {}, seller = {};
        Object.keys(block).forEach(function (key) {
          if (key.indexOf('Main_') === 0) main.push(block[key]);
          else if (key.indexOf('item_') === 0) { var k2 = key.split('_')[1]; (goods[k2] = goods[k2] || []).push(block[key].fields); }
          else if (key.indexOf('pay_') === 0) { var k3 = key.split('_')[1].split('/')[0]; (pay[k3] = pay[k3] || []).push(block[key].fields); }
          else if (key.indexOf('sellerInfo_') === 0) { var k4 = key.split('_')[1]; (seller[k4] = seller[k4] || []).push(block[key].fields); }
        });
        return { needsLogin: false, orders: main.map(function (it) { return Object.assign({}, it, { payInfo: pay[it.id] || [], goodsInfo: goods[it.id] || [], sellerInfo: seller[it.id] || [] }); }) };
      });
  }
  function mapOrder(item) {
    var names = [], price = 0, qty = 0;
    (item.goodsInfo || []).forEach(function (g) {
      var gi = g.item || g || {};
      if (gi.title) names.push(gi.title);
      price += Number((((gi.priceInfo || {}).itemUnitPrice) || '0').replace(/[￥¥]/g, '')) || 0;
      qty += Number(gi.quantity || 0) || 0;
    });
    if (!names.length && Array.isArray(item.sub)) {
      item.sub.forEach(function (sub) {
        var f = sub.fields || {};
        if (f.title && f.title !== '保险服务') { names.push(f.title); price += Number(((f.priceInfo || {}).promotion || '0').replace(/[￥¥]/g, '')) || 0; qty += Number(f.quantity || 0) || 0; }
      });
    }
    var payInfo = (item.payInfo || [])[0] || {};
    var sellerInfo = (item.sellerInfo || [])[0] || {};
    return {
      orderId: (item.fields && item.fields.orderId) || item.id || '',
      goodsName: names.join(',') || '快递包裹',
      goodsMoney: Number(((payInfo.actualFee || {}).value || String(price || 1)).replace(/[￥¥]/g, '')) || price || 1,
      goodsAccount: qty || 1,
      shopName: (sellerInfo.seller && sellerInfo.seller.shopName) || '',
      raw: item
    };
  }
  function fetchLogistics(orderInfo) {
    var tk = findTk();
    if (!tk) return Promise.resolve([]);
    var isNew = !!(orderInfo.raw.goodsInfo && orderInfo.raw.goodsInfo.length);
    var appKey = '12574478', time = Date.now();
    if (isNew) {
      var data = JSON.stringify({ orderId: orderInfo.orderId });
      var sign = md5(tk + '&' + time + '&' + appKey + '&' + data);
      var url = 'https://h5api.m.taobao.com/h5/mtop.taobao.logistics.detailorlist.query/1.0/?jsv=2.7.0&appKey=' + appKey + '&t=' + time + '&sign=' + sign + '&mpHost=trade-acs.m.taobao.com&unitStrategy=TRADE&needLogin=true&type=originaljson&dataType=json&timeout=20000&api=mtop.taobao.logistics.detailorlist.query&v=1.0&ttid=%23t%23ip%23%23_h5_web_default&preventFallback=true';
      return fetch(url, { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: 'data=' + encodeURIComponent(data) })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          var item = (res.data && res.data.data && res.data.data.popupBodyCompony && res.data.data.popupBodyCompony.fields) || {};
          return item.mailNo ? [{ expressNo: item.mailNo }] : [];
        });
    }
    var data2 = '{"tradeId":"' + orderInfo.orderId + '","mailNo":"","orderCode":"","extParams":"{\\"templateCardVersion\\":\\"1.0.1\\", \\"querySourceId\\": 68719484951}"}';
    var sign2 = md5(tk + '&' + time + '&' + appKey + '&' + data2);
    var url2 = 'https://h5api.m.taobao.com/h5/mtop.cainiao.ld.detail.tradeid.ordercode.mailno.rescode.get/1.0/?jsv=2.6.1&appKey=' + appKey + '&t=' + time + '&sign=' + sign2 + '&v=1.0&ecode=1&type=originaljson&method=GET&dataType=json&timeout=10000&LoginRequest=true&needLogin=true&sessionOption=AutoLoginAndManualLogin&localNodeProxy=true&dangerouslySetProtocol=https&prefix=h5api&subDomain=m&mainDomain=taobao.com&H5Request=true&api=mtop.cainiao.ld.detail.tradeid.ordercode.mailno.rescode.get&data=' + encodeURIComponent(data2);
    return fetch(url2, { method: 'GET', credentials: 'include', mode: 'cors' })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        var list = Array.isArray(res.data && res.data.detailViewList) ? res.data.detailViewList : [];
        return list.map(function (it) { return { expressNo: it.mailNo || '' }; }).filter(function (it) { return it.expressNo; });
      });
  }

  var statusEl = document.createElement('div');
  statusEl.style.cssText = 'position:fixed;top:10px;right:10px;z-index:99999;background:#111;color:#fff;padding:12px 16px;border-radius:8px;font:13px/1.6 sans-serif;max-width:340px;box-shadow:0 4px 16px rgba(0,0,0,.4)';
  function setStatus(text) {
    statusEl.textContent = text;
    if (!statusEl.parentNode) document.body.appendChild(statusEl);
  }
  setStatus('正在讀取淘寶訂單…');

  (async function () {
    try {
      var tk = findTk();
      if (!tk) { setStatus('尚未登入淘寶，請先登入後再試'); return; }
      var res1 = await fetchOrders(1, tk);
      if (res1.needsLogin) { setStatus('淘寶登入已過期，請重新整理訂單頁登入後再試'); return; }
      var orders = res1.orders.map(mapOrder);
      setStatus('已取得 ' + orders.length + ' 筆訂單，正在抓取快遞單號…');
      var rows = [];
      for (var n = 0; n < orders.length; n++) {
        setStatus('正在抓取快遞單號（' + (n + 1) + '/' + orders.length + '）…');
        var logs = [];
        try { logs = await fetchLogistics(orders[n]); } catch (e) { logs = []; }
        var waybill = (logs[0] && logs[0].expressNo) || '';
        rows.push({ waybillNo: waybill, orderNo: orders[n].orderId, itemName: orders[n].goodsName, itemPrice: orders[n].goodsMoney, shopName: orders[n].shopName });
      }
      var payload = b64u(JSON.stringify(rows));
      var target = BASE + (BASE.indexOf('?') >= 0 ? '&' : '?') + 'tbimport=' + payload;
      if (target.length > 7800) {
        setStatus('資料過多（' + rows.length + ' 筆）。請減少訂單頁一頁顯示的訂單數量後重試，或分批導入。');
        return;
      }
      location.href = target;
    } catch (err) {
      setStatus('發生錯誤：' + (err && err.message ? err.message : err));
    }
  })();
})();