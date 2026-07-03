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

  // Broadcasts the outcome of a location lookup so other scripts (the
  // T1ERA terminal in particular) can react — e.g. print the real
  // coordinates under an AI reply — without being merged into this file.
  function announceLocation(detail) {
    window.dispatchEvent(new CustomEvent('zv:location-result', { detail: detail }));
  }

  // Fallback when geocoding finds nothing usable.
  function flyToDunFallback(dunKey, placeName, source) {
    var d = DUN_CENTROIDS[dunKey] || { center: PARLIMEN_CENTER, name: 'Sabak Bernam', color: '#d3060d', zoom: PARLIMEN_ZOOM };
    map.flyTo({ center: d.center, zoom: d.zoom, speed: 0.9, curve: 1.3, essential: true });
    dropResultMarker(d.center[0], d.center[1], d.color);
    openResultPopup(
      d.center[0], d.center[1], d.name, placeName,
      'Tiada padanan tepat ditemui buat masa ini — peta ditunjukkan pada anggaran pusat kawasan.'
    );
    announceLocation({
      source: source, name: placeName, matched: false,
      lng: d.center[0], lat: d.center[1], dun: d.name
    });
  }

  // ---- 3. Geocode any place name and fly to the real result ------------
  // source: 'list' (PDM list click), 'search' (search bar), 'ai' (T1ERA
  // terminal). Only affects which UI shows a busy state / who gets told.
  function geocodeAndFly(placeName, dunKey, listItem, source) {
    source = source || 'list';
    var d = DUN_CENTROIDS[dunKey] || { center: PARLIMEN_CENTER, name: 'Sabak Bernam', color: '#d3060d' };
    var query = encodeURIComponent(placeName + ', Sabak Bernam, Selangor, Malaysia');
    var url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + query + '.json'
      + '?access_token=' + encodeURIComponent(mapboxgl.accessToken)
      + '&country=MY'
      + '&bbox=' + SEARCH_BBOX.join(',')
      + '&proximity=' + d.center.join(',')
      + '&limit=1';

    if (listItem) listItem.classList.add('is-searching');
    showStatus('Mencari "' + placeName + '"…');

    return fetch(url)
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
          openResultPopup(lng, lat, d.name || '', placeName, 'Kedudukan dijumpai melalui carian lokasi.');
          announceLocation({
            source: source, name: feature.place_name || placeName, matched: true,
            lng: lng, lat: lat, dun: d.name || null
          });
        } else {
          flyToDunFallback(dunKey, placeName, source);
        }
      })
      .catch(function () {
        flyToDunFallback(dunKey, placeName, source);
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
      geocodeAndFly(name, dunKey, item, 'list');
    });
  });

  // ---- 6. Search bar -----------------------------------------------------
  var searchForm = document.getElementById('zvSearchForm');
  var searchInput = document.getElementById('zvSearchInput');
  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var query = searchInput.value.trim();
      if (!query) return;
      zoneItems.forEach(function (i) { i.classList.remove('is-active'); });
      geocodeAndFly(query, null, null, 'search');
    });
  }

  // ---- 7. "Find my location" — real browser geolocation, via Mapbox's
  //         built-in GeolocateControl (added off-screen in top-right,
  //         triggered programmatically by our own search-bar button so
  //         it matches the site's design instead of Mapbox's default UI).
  var locateBtn = document.getElementById('zvLocateBtn');
  if (locateBtn && navigator.geolocation) {
    var geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: false,
      showUserHeading: false
    });
    map.addControl(geolocateControl, 'top-right');
    geolocateControl._container.style.display = 'none'; // hidden, triggered via our own button

    geolocateControl.on('geolocate', function (pos) {
      locateBtn.classList.remove('is-active');
      var lng = pos.coords.longitude;
      var lat = pos.coords.latitude;
      dropResultMarker(lng, lat, '#5ee39a');
      openResultPopup(lng, lat, '', 'Lokasi anda', 'Kedudukan semasa mengikut GPS peranti anda.');
      announceLocation({ source: 'geolocate', name: 'Lokasi semasa', matched: true, lng: lng, lat: lat, dun: null });
    });
    geolocateControl.on('error', function () {
      locateBtn.classList.remove('is-active');
      showStatus('Tidak dapat mengesan lokasi anda. Semak kebenaran lokasi pelayar.');
      setTimeout(hideStatus, 2600);
    });

    locateBtn.addEventListener('click', function () {
      locateBtn.classList.add('is-active');
      geolocateControl.trigger();
    });
  } else if (locateBtn) {
    locateBtn.disabled = true;
    locateBtn.title = 'Lokasi tidak disokong pada pelayar ini';
  }

  // ---- 8. Public hook for other scripts (e.g. the T1ERA terminal) ------
  // Intentionally tiny: one function, no shared state exposed. Lets
  // assets/js/t1era-terminal.js ask the map to fly to a place name
  // without this file and that file being merged together.
  window.T1ERA_MAP = {
    flyToPlace: function (placeName, dunKey) {
      if (!placeName) return;
      geocodeAndFly(placeName, dunKey || null, null, 'ai');
    }
  };

})();
