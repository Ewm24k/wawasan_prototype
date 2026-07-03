/* ============================================================
   WawasanVerse — Zon Kawasan
   Map init, DUN tabs, and zone-list → map interaction.

   NOTE ON PER-PDM COORDINATES
   ----------------------------
   The 32 individual PDM boundaries/coordinates aren't in hand yet
   ("later" per the brief). For now, clicking any PDM in the list
   flies the camera to its parent DUN's approximate centroid and
   opens a popup naming the PDM, flagged as pending exact geodata.
   Swap DUN_CENTROIDS for a per-PDM lookup once that data exists —
   the click handler already reads data-dun/data-index/name, so no
   markup changes will be needed, just richer data here.
   ============================================================ */

(function () {

  // ---- 1. Mapbox access token ---------------------------------------
  // Replace with your own Mapbox public token (starts with "pk.").
  // Get one at https://account.mapbox.com/access-tokens/
  mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';

  // ---- 2. Approximate DUN centroids (placeholder, pending per-PDM data)
  var DUN_CENTROIDS = {
    dun1: { name: 'N.01 Sungai Air Tawar', center: [100.9980, 3.7520], zoom: 12.2, color: '#d3060d' },
    dun2: { name: 'N.02 Sabak',            center: [100.9540, 3.7880], zoom: 12.2, color: '#14110f' }
  };

  var PARLIMEN_CENTER = [100.9750, 3.7700];
  var PARLIMEN_ZOOM = 11.1;

  var mapEl = document.getElementById('zvMap');
  if (!mapEl || typeof mapboxgl === 'undefined') return;

  var map = new mapboxgl.Map({
    container: 'zvMap',
    style: 'mapbox://styles/mapbox/dark-v11',
    center: PARLIMEN_CENTER,
    zoom: PARLIMEN_ZOOM,
    attributionControl: true
  });

  map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

  var activePopup = null;
  var duMarkers = {};

  map.on('load', function () {
    Object.keys(DUN_CENTROIDS).forEach(function (dunKey) {
      var d = DUN_CENTROIDS[dunKey];
      var el = document.createElement('div');
      el.style.width = '16px';
      el.style.height = '16px';
      el.style.borderRadius = '50%';
      el.style.background = d.color;
      el.style.border = '2px solid #fff';
      el.style.boxShadow = '0 0 0 6px ' + d.color + '33';

      duMarkers[dunKey] = new mapboxgl.Marker({ element: el })
        .setLngLat(d.center)
        .setPopup(new mapboxgl.Popup({ offset: 14, className: 'zv-popup' }).setHTML(
          '<span class="zv-popup__dun">' + d.name + '</span>' +
          '<span class="zv-popup__name">Pusat DUN</span>' +
          '<span class="zv-popup__note">Pilih satu PDM di senarai bawah untuk perincian.</span>'
        ))
        .addTo(map);
    });
  });

  function flyToZone(dunKey, pdmName) {
    var d = DUN_CENTROIDS[dunKey];
    if (!d) return;

    map.flyTo({ center: d.center, zoom: d.zoom, speed: 0.9, curve: 1.3, essential: true });

    if (activePopup) activePopup.remove();
    activePopup = new mapboxgl.Popup({ offset: 14, className: 'zv-popup' })
      .setLngLat(d.center)
      .setHTML(
        '<span class="zv-popup__dun">' + d.name + '</span>' +
        '<span class="zv-popup__name">' + pdmName + '</span>' +
        '<span class="zv-popup__note">Kedudukan tepat PDM ini akan dikemas kini tidak lama lagi.</span>'
      )
      .addTo(map);
  }

  // ---- 3. Tabs ---------------------------------------------------------
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

  // ---- 4. Zone list clicks ----------------------------------------------
  var zoneItems = document.querySelectorAll('.zone-list__item');
  zoneItems.forEach(function (item) {
    item.addEventListener('click', function () {
      zoneItems.forEach(function (i) { i.classList.remove('is-active'); });
      item.classList.add('is-active');

      var dunKey = item.getAttribute('data-dun');
      var name = item.querySelector('.zone-list__name').textContent.trim();
      flyToZone(dunKey, name);
    });
  });

})();
