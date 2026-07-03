/* ============================================================
   WawasanVerse — Zon Kawasan
   Map init, DUN tabs, and zone-list → real-location search.

   Clicking a PDM now geocodes its name through the Mapbox
   Geocoding API (biased to the Sabak Bernam area) and flies to
   the actual matched coordinates, with a marker + popup. If a
   name can't be geocoded confidently (common for small kampung/
   parit names not in Mapbox's index), it falls back to the
   parent DUN's approximate centroid and says so in the popup.
   ============================================================ */

(function () {

  // ---- 1. Mapbox access token ---------------------------------------
  // Replace with your own Mapbox public token (starts with "pk.").
  // Get one at https://account.mapbox.com/access-tokens/
  mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';

  // ---- 2. Approximate DUN centroids (fallback only, used when a PDM
  //         name can't be geocoded to an exact point)
  var DUN_CENTROIDS = {
    dun1: { name: 'N.01 Sungai Air Tawar', center: [100.9980, 3.7520], zoom: 12.2, color: '#d3060d' },
    dun2: { name: 'N.02 Sabak',            center: [100.9540, 3.7880], zoom: 12.2, color: '#14110f' }
  };

  var PARLIMEN_CENTER = [100.9750, 3.7700];
  var PARLIMEN_ZOOM = 11.1;

  // Rough bounding box around P.092 Sabak Bernam, used to bias/limit
  // geocoding results so "Parit Enam" etc. doesn't match somewhere
  // else in the world.
  var SEARCH_BBOX = [100.72, 3.52, 101.18, 3.98];

  var mapEl = document.getElementById('zvMap');
  if (!mapEl || typeof mapboxgl === 'undefined') return;

  var map = new mapboxgl.Map({
    container: 'zvMap',
    style: 'mapbox://styles/neolingo/cmga9j5xh00bd01qo7uakglxy',
    center: PARLIMEN_CENTER,
    zoom: PARLIMEN_ZOOM,
    attributionControl: true
  });

  map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

  var statusEl = document.getElementById('zvMapStatus');
  var resultMarker = null;
  var activePopup = null;
  var duMarkers = {};

  map.on('load', function () {
    Object.keys(DUN_CENTROIDS).forEach(function (dunKey) {
      var d = DUN_CENTROIDS[dunKey];
      var el = document.createElement('div');
      el.style.width = '14px';
      el.style.height = '14px';
      el.style.borderRadius = '50%';
      el.style.background = d.color;
      el.style.border = '2px solid #fff';
      el.style.opacity = '0.55';
      el.style.boxShadow = '0 0 0 5px ' + d.color + '22';

      duMarkers[dunKey] = new mapboxgl.Marker({ element: el })
        .setLngLat(d.center)
        .setPopup(new mapboxgl.Popup({ offset: 14, className: 'zv-popup' }).setHTML(
          '<span class="zv-popup__dun">' + d.name + '</span>' +
          '<span class="zv-popup__name">Pusat DUN</span>' +
          '<span class="zv-popup__note">Pilih satu PDM di senarai bawah untuk cari kedudukan sebenarnya.</span>'
        ))
        .addTo(map);
    });
  });

  function showStatus(text) {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.hidden = false;
  }

  function hideStatus() {
    if (!statusEl) return;
    statusEl.hidden = true;
  }

  function dropResultMarker(lng, lat, color) {
    if (resultMarker) resultMarker.remove();
    var el = document.createElement('div');
    el.style.width = '18px';
    el.style.height = '18px';
    el.style.borderRadius = '50%';
    el.style.background = color;
    el.style.border = '3px solid #fff';
    el.style.boxShadow = '0 0 0 7px ' + color + '3d';
    resultMarker = new mapboxgl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map);
  }

  function openResultPopup(lng, lat, dunLabel, pdmName, note) {
    if (activePopup) activePopup.remove();
    activePopup = new mapboxgl.Popup({ offset: 16, className: 'zv-popup' })
      .setLngLat([lng, lat])
      .setHTML(
        '<span class="zv-popup__dun">' + dunLabel + '</span>' +
        '<span class="zv-popup__name">' + pdmName + '</span>' +
        '<span class="zv-popup__note">' + note + '</span>'
      )
      .addTo(map);
  }

  // Fallback when geocoding finds nothing usable.
  function flyToDunFallback(dunKey, pdmName) {
    var d = DUN_CENTROIDS[dunKey];
    if (!d) return;
    map.flyTo({ center: d.center, zoom: d.zoom, speed: 0.9, curve: 1.3, essential: true });
    dropResultMarker(d.center[0], d.center[1], d.color);
    openResultPopup(
      d.center[0], d.center[1], d.name, pdmName,
      'Tiada padanan tepat ditemui buat masa ini — peta ditunjukkan pada anggaran pusat DUN.'
    );
  }

  // ---- 3. Geocode a PDM name and fly to the real result ----------------
  function geocodeAndFly(pdmName, dunKey, listItem) {
    var d = DUN_CENTROIDS[dunKey] || { center: PARLIMEN_CENTER, name: '' };
    var query = encodeURIComponent(pdmName + ', Sabak Bernam, Selangor, Malaysia');
    var url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + query + '.json'
      + '?access_token=' + encodeURIComponent(mapboxgl.accessToken)
      + '&country=MY'
      + '&bbox=' + SEARCH_BBOX.join(',')
      + '&proximity=' + d.center.join(',')
      + '&limit=1';

    if (listItem) listItem.classList.add('is-searching');
    showStatus('Mencari "' + pdmName + '"…');

    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('Geocoding request failed: ' + res.status);
        return res.json();
      })
      .then(function (data) {
        var feature = data && data.features && data.features[0];
        if (feature && feature.center) {
          var lng = feature.center[0];
          var lat = feature.center[1];
          map.flyTo({ center: [lng, lat], zoom: 15.2, speed: 1.1, curve: 1.3, essential: true });
          dropResultMarker(lng, lat, d.color || '#d3060d');
          openResultPopup(lng, lat, d.name, pdmName, 'Kedudukan dijumpai melalui carian lokasi.');
        } else {
          flyToDunFallback(dunKey, pdmName);
        }
      })
      .catch(function () {
        flyToDunFallback(dunKey, pdmName);
      })
      .finally(function () {
        if (listItem) listItem.classList.remove('is-searching');
        hideStatus();
      });
  }

  // ---- 4. Tabs ---------------------------------------------------------
  var tabs = document.querySelectorAll('.zv-tab');
  var panels = { dun1: document.getElementById('panelN01'), dun2: document.getElementById('panelN02') };

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var target = tab.getAttribute('data-dun');

      tabs.forEach(function (t) {
        var isActive = t === tab;
        t.classList.toggle('is-active', isActive);
        t.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      Object.keys(panels).forEach(function (key) {
        var isTarget = key === target;
        panels[key].hidden = !isTarget;
        panels[key].classList.toggle('is-hidden', !isTarget);
      });
    });
  });

  // ---- 5. Zone list clicks ----------------------------------------------
  var zoneItems = document.querySelectorAll('.zone-list__item');
  zoneItems.forEach(function (item) {
    item.addEventListener('click', function () {
      if (item.classList.contains('is-searching')) return;

      zoneItems.forEach(function (i) { i.classList.remove('is-active'); });
      item.classList.add('is-active');

      var dunKey = item.getAttribute('data-dun');
      var name = item.querySelector('.zone-list__name').textContent.trim();
      geocodeAndFly(name, dunKey, item);
    });
  });

})();
