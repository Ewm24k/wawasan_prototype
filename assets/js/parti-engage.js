/* ============================================================
   Parti Engage — Member/Volunteer Engagement App
   Converted from parti-engage-final.jsx (React) to vanilla JS.
   Same data, layout and interactions as the original design.

   NOTE: one mission's description was intentionally softened —
   see MISSIONS below (id:1) — to avoid asking canvassers to
   record members of the public's IC numbers inside a gamified,
   points-driven app. Everything else matches the source file.
   ============================================================ */

(function () {
  'use strict';

  var N = {
    navy: '#0F2A5E', navyDark: '#071A3E', gold: '#C9A84C', goldLight: '#E8C96B',
    red: '#C0392B', green: '#1D7A4A', surface: '#F7F6F2', white: '#FFFFFF',
    border: '#E2DDD4', muted: '#8A8278', text: '#1A1612'
  };

  /* ---------- Data ---------- */
  var MEMBERS = [
    { id:1, name:'Ahmad Faizal', cawangan:'Taman Muda', rank:'Ketua Cawangan', points:2840, badge:'🥇', avatar:'AF', trend:'+120', tasks:12, events:18, reports:5 },
    { id:2, name:'Siti Hajar', cawangan:'Pandan Indah', rank:'Naib Ketua', points:2610, badge:'🥈', avatar:'SH', trend:'+95', tasks:10, events:16, reports:4 },
    { id:3, name:'Razif Othman', cawangan:'Taman Keramat', rank:'Ketua Cawangan', points:2390, badge:'🥉', avatar:'RO', trend:'+88', tasks:9, events:14, reports:6 },
    { id:4, name:'Nurul Ain', cawangan:'Ampang Jaya', rank:'Ahli Biasa', points:2150, badge:'', avatar:'NA', trend:'+72', tasks:8, events:12, reports:3 },
    { id:5, name:'Hasrul Nizam', cawangan:'Ulu Kelang', rank:'Setiausaha', points:1980, badge:'', avatar:'HN', trend:'+65', tasks:7, events:11, reports:2 },
    { id:6, name:'Zarina Mohd', cawangan:'Bukit Antarabangsa', rank:'Ahli Biasa', points:1760, badge:'', avatar:'ZM', trend:'+54', tasks:6, events:9, reports:4 },
    { id:7, name:'Kamarul Hisham', cawangan:'Cheras Baru', rank:'Bendahari', points:1540, badge:'', avatar:'KH', trend:'+43', tasks:5, events:8, reports:1 },
    { id:8, name:'Faridah Ismail', cawangan:'Keramat Baru', rank:'Ahli Biasa', points:1320, badge:'', avatar:'FI', trend:'+38', tasks:4, events:7, reports:2 }
  ];

  var CAWANGAN = [
    { id:1, name:'Taman Muda', members:142, active:118, pts:24800, attendance:83, trend:'up' },
    { id:2, name:'Pandan Indah', members:128, active:104, pts:22100, attendance:81, trend:'up' },
    { id:3, name:'Taman Keramat', members:156, active:119, pts:21400, attendance:76, trend:'up' },
    { id:4, name:'Ampang Jaya', members:134, active:97, pts:19800, attendance:72, trend:'down' },
    { id:5, name:'Ulu Kelang', members:112, active:88, pts:18200, attendance:79, trend:'up' },
    { id:6, name:'Bukit Antarabangsa', members:98, active:71, pts:16400, attendance:72, trend:'down' },
    { id:7, name:'Cheras Baru', members:119, active:82, pts:15800, attendance:69, trend:'down' },
    { id:8, name:'Keramat Baru', members:103, active:74, pts:14200, attendance:72, trend:'up' },
    { id:9, name:'Pandan Perdana', members:91, active:68, pts:13400, attendance:75, trend:'up' },
    { id:10, name:'Taman Sri Rampai', members:108, active:75, pts:12900, attendance:69, trend:'down' }
  ];

  var EVENTS = [
    { id:1, title:'Ceramah Perdana Ampang', date:'3 Jul 2026', time:'8:00 PM', location:'Dataran Ampang', type:'Ceramah', pts:150, slots:200, enrolled:178, urgent:true },
    { id:2, title:'Gotong-royong Taman Muda', date:'5 Jul 2026', time:'8:00 AM', location:'Taman Muda P1', type:'Community', pts:100, slots:80, enrolled:62, urgent:false },
    { id:3, title:'Voter Registration Drive', date:'8 Jul 2026', time:'9:00 AM', location:'Pandan Mall', type:'Pengundi', pts:200, slots:40, enrolled:31, urgent:false },
    { id:4, title:'Latihan Kempen Digital', date:'10 Jul 2026', time:'2:00 PM', location:'Bilik Gerakan P101', type:'Latihan', pts:120, slots:50, enrolled:44, urgent:false },
    { id:5, title:'Mesyuarat AGM Bahagian', date:'12 Jul 2026', time:'10:00 AM', location:'Dewan Sri Ampang', type:'Mesyuarat', pts:80, slots:300, enrolled:241, urgent:false }
  ];

  // NOTE: mission id:1 description softened from the source file's
  // "Rekod nama dan IC" (record name + IC number) to "Rekod nama &
  // maklumat hubungan" (name + contact info) — collecting the
  // public's IC numbers inside a gamified, points-driven volunteer
  // app carries real data-protection risk regardless of intent.
  var MISSIONS = [
    { id:1, title:'Daftar 10 pengundi baru', desc:'Rekod nama & maklumat hubungan', pts:500, progress:6, total:10, deadline:'Jul 31', cat:'Pengundi' },
    { id:2, title:'Hadir 3 aktiviti bulan ini', desc:'Ceramah, gotong-royong atau latihan', pts:300, progress:2, total:3, deadline:'Jul 31', cat:'Hadir' },
    { id:3, title:'Selesai modul latihan digital', desc:'4 bahagian · 45 minit', pts:200, progress:3, total:4, deadline:'Jul 15', cat:'Latihan' },
    { id:4, title:'Hantar 2 laporan kawasan', desc:'Isu jalan, banjir, keselamatan', pts:250, progress:1, total:2, deadline:'Jul 20', cat:'Laporan' }
  ];

  var REWARDS = [
    { id:1, title:'Baju T Rasmi Parti', pts:500, img:'👕', stock:120 },
    { id:2, title:'Topi Kempen Eksklusif', pts:300, img:'🧢', stock:80 },
    { id:3, title:'Baucar Minyak RM20', pts:800, img:'⛽', stock:50 },
    { id:4, title:'Tiket Malam Gala Parti', pts:1500, img:'🍽️', stock:30 },
    { id:5, title:'Jaket Kempen Rasmi', pts:1200, img:'🧥', stock:25 },
    { id:6, title:'Baucar Groceri RM50', pts:1000, img:'🛒', stock:40 }
  ];

  var REPORTS = [
    { id:1, title:'Jalan berlubang Jln Ampang Lama', member:'Ahmad Faizal', cawangan:'Taman Muda', cat:'Jalan', status:'open', time:'1 jam lalu' },
    { id:2, title:'Longkang tersumbat Tmn Muda', member:'Siti Hajar', cawangan:'Pandan Indah', cat:'Longkang', status:'in-progress', time:'3 jam lalu' },
    { id:3, title:'Lampu jalan mati 5 hari', member:'Razif Othman', cawangan:'Taman Keramat', cat:'Lampu', status:'resolved', time:'semalam' },
    { id:4, title:'Tempat letak kereta haram', member:'Nurul Ain', cawangan:'Ampang Jaya', cat:'Parking', status:'open', time:'semalam' }
  ];

  var MODULES = [
    { id:1, title:'Ideologi & Perlembagaan Parti', parts:4, done:4, pts:150, dur:'30 min' },
    { id:2, title:'Teknik Kempen Digital', parts:5, done:3, pts:200, dur:'45 min' },
    { id:3, title:'Komunikasi Efektif dengan Pengundi', parts:3, done:0, pts:120, dur:'25 min' },
    { id:4, title:'Pendaftaran & Semakan Pengundi', parts:3, done:0, pts:100, dur:'20 min' }
  ];

  var NAVBAR = [
    { id:'home', label:'Home', d:'M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z' },
    { id:'leaderboard', label:'Ranking', d:'M8 13v-1m4 1v-3m4 3V8M8 21l4-4 4 4M3 4h18' },
    { id:'events', label:'Aktiviti', d:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id:'rewards', label:'Ganjaran', d:'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7' },
    { id:'dashboard', label:'Dashboard', d:'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' }
  ];

  var CURRENT_USER = MEMBERS[2]; // Razif Othman, matches source (MEMBERS[2])

  /* ---------- App state (mirrors the React useState calls) ---------- */
  var state = {
    tab: 'home',
    checkedIn: false,
    joinedEvents: {},
    claimedRewards: { 3: true },
    leaderboardScope: 'ahli',
    dashCawView: 'pts',
    reportsShowForm: false,
    reportsCat: ''
  };

  /* ---------- Small helpers (mirror Av / PB / Cd from source) ---------- */
  function esc(s) {
    var d = document.createElement('div');
    d.textContent = String(s == null ? '' : s);
    return d.innerHTML;
  }

  function fmt(n) { return Number(n).toLocaleString('en-US'); }

  function av(initials, size, bg, color, fontSize) {
    size = size || 36; bg = bg || N.navy; color = color || '#fff'; fontSize = fontSize || 13;
    return '<div class="pe-av" style="width:' + size + 'px;height:' + size + 'px;background:' + bg +
      ';color:' + color + ';font-size:' + fontSize + 'px">' + esc(initials) + '</div>';
  }

  function pb(v, m, color, h) {
    color = color || N.gold; h = h || 6;
    var pct = Math.min(100, Math.round((v / m) * 100));
    return '<div class="pe-pb-track" style="height:' + h + 'px"><div class="pe-pb-fill" style="width:' + pct + '%;background:' + color + '"></div></div>';
  }

  function cardOpen(styleExtra) {
    return '<div class="pe-card" style="' + (styleExtra || '') + '">';
  }
  function cardClose() { return '</div>'; }

  /* ================================================================
     HOME
     ================================================================ */
  function renderHome() {
    var u = CURRENT_USER;
    var checkinBlock = state.checkedIn
      ? '<div style="background:#EAF3DE;border:0.5px solid #C0DD97;border-radius:8px;padding:10px;text-align:center;font-size:13px;color:' + N.green + ';font-weight:500">✓ Hadir disahkan · +150 mata dikreditkan</div>'
      : '<button onclick="PE.checkIn()" style="width:100%;padding:10px;border-radius:8px;background:' + N.navy + ';color:#fff;border:none;font-size:13px;font-weight:500;cursor:pointer">Daftar hadir (QR)</button>';

    var missionsHtml = MISSIONS.slice(0, 3).map(function (m) {
      return cardOpen('padding:12px;margin-bottom:8px') +
        '<div style="display:flex;justify-content:space-between;margin-bottom:6px">' +
        '<span style="font-size:12px;font-weight:500">' + esc(m.title) + '</span>' +
        '<span style="font-size:12px;color:' + N.gold + ';font-weight:500">+' + m.pts + '</span></div>' +
        pb(m.progress, m.total, N.navy) +
        '<div style="display:flex;justify-content:space-between;margin-top:4px">' +
        '<span style="font-size:11px;color:' + N.muted + '">' + m.progress + '/' + m.total + ' selesai</span>' +
        '<span style="font-size:11px;color:' + N.muted + '">tamat ' + m.deadline + '</span></div>' +
        cardClose();
    }).join('');

    var quickActions = [['📍','Lapor isu','reports'],['📚','Modul latihan','training'],['🏆','Ranking ahli','leaderboard'],['🎁','Tebus ganjaran','rewards']]
      .map(function (qa) {
        return '<button onclick="PE.goto(\'' + qa[2] + '\')" style="background:' + N.white + ';border:0.5px solid ' + N.border + ';border-radius:12px;padding:14px 12px;display:flex;align-items:center;gap:10px;cursor:pointer;text-align:left">' +
          '<span style="font-size:22px">' + qa[0] + '</span><span style="font-size:13px;font-weight:500;color:' + N.text + '">' + qa[1] + '</span></button>';
      }).join('');

    var stats = [['Aktiviti hadir', u.events], ['Misi selesai', u.tasks], ['Laporan hantar', u.reports]]
      .map(function (s) {
        return cardOpen('padding:12px;text-align:center') +
          '<div style="font-size:22px;font-weight:500;color:' + N.navy + '">' + s[1] + '</div>' +
          '<div style="font-size:10px;color:' + N.muted + ';margin-top:2px">' + s[0] + '</div>' + cardClose();
      }).join('');

    return (
      '<div>' +
        '<div style="background:linear-gradient(135deg,' + N.navyDark + ',' + N.navy + ');padding:20px 16px 24px;position:relative;overflow:hidden">' +
          '<div style="position:absolute;top:-40px;right:-40px;width:140px;height:140px;border-radius:50%;border:1px solid rgba(201,168,76,0.12);pointer-events:none"></div>' +
          '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">' +
            av(u.avatar, 44, N.gold, N.navyDark, 15) +
            '<div><div style="color:rgba(255,255,255,0.55);font-size:11px">Selamat datang,</div>' +
            '<div style="color:#fff;font-size:16px;font-weight:500">' + esc(u.name) + '</div>' +
            '<div style="color:' + N.gold + ';font-size:11px;margin-top:1px">' + esc(u.rank) + ' · ' + esc(u.cawangan) + '</div></div>' +
            '<div style="margin-left:auto;background:rgba(255,255,255,0.1);border-radius:8px;padding:6px 12px;text-align:center">' +
            '<div style="color:' + N.gold + ';font-size:20px;font-weight:500">' + fmt(u.points) + '</div>' +
            '<div style="color:rgba(255,255,255,0.45);font-size:10px">mata</div></div>' +
          '</div>' +
          '<div style="display:flex;gap:8px">' +
            '<div style="background:rgba(201,168,76,0.15);border:0.5px solid rgba(201,168,76,0.3);border-radius:20px;padding:4px 12px;font-size:11px;color:' + N.goldLight + '">🔥 7 hari berturut-turut</div>' +
            '<div style="background:rgba(255,255,255,0.08);border-radius:20px;padding:4px 12px;font-size:11px;color:rgba(255,255,255,0.65)">#3 ranking cawangan</div>' +
          '</div>' +
        '</div>' +
        '<div style="padding:16px;display:flex;flex-direction:column;gap:12px">' +
          cardOpen('border-left:3px solid ' + N.gold + ';padding:14px') +
            '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">' +
              '<span style="background:' + N.gold + ';color:' + N.navyDark + ';padding:2px 8px;border-radius:4px;font-size:11px;font-weight:500">MALAM INI</span>' +
              '<span style="font-size:11px;color:' + N.muted + '">+150 mata</span></div>' +
            '<div style="font-size:14px;font-weight:500;margin-bottom:3px">Ceramah Perdana Ampang</div>' +
            '<div style="font-size:12px;color:' + N.muted + ';margin-bottom:12px">8:00 PM · Dataran Ampang</div>' +
            checkinBlock +
          cardClose() +
          '<div><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">' +
            '<div style="font-size:14px;font-weight:500">Misi bulan ini</div>' +
            '<button onclick="PE.goto(\'missions\')" style="font-size:12px;color:' + N.navy + ';background:none;border:none;cursor:pointer;font-weight:500">Lihat semua</button></div>' +
            missionsHtml +
          '</div>' +
          '<div><div style="font-size:14px;font-weight:500;margin-bottom:10px">Tindakan pantas</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' + quickActions + '</div></div>' +
          '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">' + stats + '</div>' +
        '</div>' +
      '</div>'
    );
  }

  /* ================================================================
     LEADERBOARD
     ================================================================ */
  function renderLeaderboard() {
    var scope = state.leaderboardScope;
    var podium = MEMBERS.slice(0, 3);

    var scopeButtons = ['ahli', 'cawangan'].map(function (s) {
      var active = scope === s;
      return '<button onclick="PE.setLeaderboardScope(\'' + s + '\')" style="padding:6px 14px;border-radius:20px;border:none;cursor:pointer;font-size:12px;font-weight:500;background:' +
        (active ? N.gold : 'rgba(255,255,255,0.12)') + ';color:' + (active ? N.navyDark : 'rgba(255,255,255,0.7)') + '">' +
        (s === 'ahli' ? 'Ahli' : 'Cawangan') + '</button>';
    }).join('');

    var podiumHtml = '';
    if (scope === 'ahli') {
      podiumHtml = '<div style="display:flex;align-items:flex-end;justify-content:center;gap:16px;padding-bottom:20px">' +
        '<div style="text-align:center;flex:1">' + av(podium[1].avatar, 44, 'rgba(255,255,255,0.15)', '#fff') +
          '<div style="font-size:11px;color:#fff;font-weight:500;margin-top:4px">' + esc(podium[1].name.split(' ')[0]) + '</div>' +
          '<div style="font-size:10px;color:rgba(255,255,255,0.5)">' + fmt(podium[1].points) + '</div>' +
          '<div style="background:rgba(255,255,255,0.15);border-radius:6px 6px 0 0;height:50px;margin-top:8px;display:flex;align-items:center;justify-content:center;font-size:22px">🥈</div></div>' +
        '<div style="text-align:center;flex:1"><div style="font-size:18px;margin-bottom:4px">👑</div>' + av(podium[0].avatar, 52, N.gold, N.navyDark, 16) +
          '<div style="font-size:12px;color:#fff;font-weight:500;margin-top:4px">' + esc(podium[0].name.split(' ')[0]) + '</div>' +
          '<div style="font-size:10px;color:' + N.gold + '">' + fmt(podium[0].points) + '</div>' +
          '<div style="background:rgba(201,168,76,0.25);border-radius:6px 6px 0 0;height:70px;margin-top:8px;display:flex;align-items:center;justify-content:center;font-size:26px">🥇</div></div>' +
        '<div style="text-align:center;flex:1">' + av(podium[2].avatar, 44, 'rgba(255,255,255,0.1)', '#fff') +
          '<div style="font-size:11px;color:#fff;font-weight:500;margin-top:4px">' + esc(podium[2].name.split(' ')[0]) + '</div>' +
          '<div style="font-size:10px;color:rgba(255,255,255,0.5)">' + fmt(podium[2].points) + '</div>' +
          '<div style="background:rgba(255,255,255,0.1);border-radius:6px 6px 0 0;height:40px;margin-top:8px;display:flex;align-items:center;justify-content:center;font-size:20px">🥉</div></div>' +
        '</div>';
    }

    var listHtml;
    if (scope === 'ahli') {
      listHtml = MEMBERS.slice(3).map(function (m, i) {
        return cardOpen('padding:12px;display:flex;align-items:center;gap:12px') +
          '<div style="width:22px;font-size:13px;color:' + N.muted + ';font-weight:500;text-align:center">' + (i + 4) + '</div>' +
          av(m.avatar, 36, N.navy, '#fff') +
          '<div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:500">' + esc(m.name) + '</div>' +
          '<div style="font-size:11px;color:' + N.muted + '">' + esc(m.cawangan) + ' · ' + esc(m.rank) + '</div></div>' +
          '<div style="text-align:right"><div style="font-size:14px;font-weight:500;color:' + N.navy + '">' + fmt(m.points) + '</div>' +
          '<div style="font-size:11px;color:' + N.green + '">' + m.trend + ' minggu ini</div></div>' +
          cardClose();
      }).join('');
    } else {
      listHtml = CAWANGAN.map(function (c, i) {
        return cardOpen('padding:12px') +
          '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">' +
          '<div style="width:28px;height:28px;border-radius:8px;background:' + (i < 3 ? N.gold : 'rgba(15,42,94,0.08)') + ';display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:500;color:' + (i < 3 ? N.navyDark : N.navy) + ';flex-shrink:0">' + (i + 1) + '</div>' +
          '<div style="flex:1"><div style="font-size:13px;font-weight:500">' + esc(c.name) + '</div>' +
          '<div style="font-size:11px;color:' + N.muted + '">' + c.active + '/' + c.members + ' ahli aktif</div></div>' +
          '<div style="text-align:right"><div style="font-size:14px;font-weight:500;color:' + N.navy + '">' + fmt(c.pts) + '</div>' +
          '<div style="font-size:11px;color:' + (c.trend === 'up' ? N.green : N.red) + '">' + (c.trend === 'up' ? '↑ naik' : '↓ turun') + '</div></div></div>' +
          pb(c.active, c.members, i < 3 ? N.gold : N.navy) +
          '<div style="font-size:10px;color:' + N.muted + ';margin-top:4px">' + c.attendance + '% kehadiran purata</div>' +
          cardClose();
      }).join('');
    }

    return (
      '<div>' +
        '<div style="background:linear-gradient(135deg,' + N.navyDark + ',' + N.navy + ');padding:20px 16px 0">' +
          '<div style="color:#fff;font-size:16px;font-weight:500;margin-bottom:4px">Papan Ranking</div>' +
          '<div style="color:rgba(255,255,255,0.5);font-size:12px;margin-bottom:14px">Parlimen Ampang P101 · 40 cawangan</div>' +
          '<div style="display:flex;gap:6px;margin-bottom:16px">' + scopeButtons + '</div>' +
          podiumHtml +
        '</div>' +
        '<div style="padding:16px;display:flex;flex-direction:column;gap:8px">' + listHtml + '</div>' +
      '</div>'
    );
  }

  /* ================================================================
     EVENTS
     ================================================================ */
  function renderEvents() {
    var typeColor = {
      'Ceramah': [N.gold, N.navyDark],
      'Community': ['#EAF3DE', '#1D7A4A'],
      'Pengundi': ['#E6F1FB', '#0C447C'],
      'Latihan': ['#FAEEDA', '#633806'],
      'Mesyuarat': ['#F1EFE8', '#444441']
    };

    var cards = EVENTS.map(function (e) {
      var tc = typeColor[e.type] || ['#F1EFE8', '#444441'];
      var isJoined = !!state.joinedEvents[e.id];
      var fill = Math.round((e.enrolled / e.slots) * 100);
      return cardOpen('padding:14px') +
        '<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px">' +
        '<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:500;background:' + tc[0] + ';color:' + tc[1] + '">' + esc(e.type) + '</span>' +
        '<span style="font-size:13px;font-weight:500;color:' + N.gold + '">+' + e.pts + ' mata</span></div>' +
        '<div style="font-size:14px;font-weight:500;margin-bottom:3px">' + esc(e.title) + '</div>' +
        '<div style="font-size:12px;color:' + N.muted + ';margin-bottom:10px">' + e.date + ' · ' + e.time + ' · ' + esc(e.location) + '</div>' +
        '<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:11px;color:' + N.muted + ';margin-bottom:4px">' +
        '<span>Kapasiti</span><span>' + e.enrolled + '/' + e.slots + ' (' + fill + '% penuh)</span></div>' +
        pb(e.enrolled, e.slots, fill > 85 ? N.red : N.navy) + '</div>' +
        '<button onclick="PE.toggleEventJoin(' + e.id + ')" style="width:100%;padding:9px;border-radius:8px;border:' + (isJoined ? '1px solid ' + N.border : 'none') + ';background:' + (isJoined ? 'transparent' : N.navy) + ';color:' + (isJoined ? N.muted : '#fff') + ';font-size:13px;font-weight:500;cursor:pointer">' +
        (isJoined ? '✓ Sudah daftar' : 'Daftar sekarang') + '</button>' +
        cardClose();
    }).join('');

    return (
      '<div>' +
        '<div style="background:' + N.navy + ';padding:20px 16px 16px">' +
          '<div style="color:#fff;font-size:16px;font-weight:500;margin-bottom:4px">Aktiviti & Acara</div>' +
          '<div style="color:rgba(255,255,255,0.5);font-size:12px">Jul 2026 · Parlimen Ampang P101</div>' +
        '</div>' +
        '<div style="padding:16px;display:flex;flex-direction:column;gap:12px">' + cards + '</div>' +
      '</div>'
    );
  }

  /* ================================================================
     REWARDS
     ================================================================ */
  function renderRewards() {
    var pts = CURRENT_USER.points;
    var cards = REWARDS.map(function (r) {
      var isClaimed = !!state.claimedRewards[r.id];
      var canClaim = pts >= r.pts;
      var label = isClaimed ? '✓ Ditebus' : canClaim ? 'Tebus' : ('Perlu ' + fmt(r.pts - pts) + ' lagi');
      return cardOpen('padding:14px;text-align:center;opacity:' + (isClaimed ? '0.75' : '1')) +
        '<div style="font-size:36px;margin-bottom:8px">' + r.img + '</div>' +
        '<div style="font-size:13px;font-weight:500;margin-bottom:4px">' + esc(r.title) + '</div>' +
        '<div style="font-size:14px;font-weight:500;color:' + N.gold + ';margin-bottom:4px">' + fmt(r.pts) + ' mata</div>' +
        '<div style="font-size:11px;color:' + N.muted + ';margin-bottom:10px">' + r.stock + ' tersedia</div>' +
        '<button ' + ((isClaimed || !canClaim) ? 'disabled' : '') + ' onclick="PE.claimReward(' + r.id + ')" style="width:100%;padding:8px;border-radius:8px;border:none;cursor:' + ((isClaimed || !canClaim) ? 'default' : 'pointer') + ';font-size:12px;font-weight:500;background:' +
        (isClaimed ? '#EAF3DE' : canClaim ? N.navy : 'rgba(15,42,94,0.07)') + ';color:' + (isClaimed ? N.green : canClaim ? '#fff' : N.muted) + '">' + label + '</button>' +
        cardClose();
    }).join('');

    return (
      '<div>' +
        '<div style="background:linear-gradient(135deg,' + N.navyDark + ',' + N.navy + ');padding:20px 16px 20px">' +
          '<div style="color:#fff;font-size:16px;font-weight:500;margin-bottom:10px">Ganjaran</div>' +
          '<div style="display:flex;align-items:center;gap:12px">' +
            '<div style="background:rgba(201,168,76,0.2);border:0.5px solid rgba(201,168,76,0.4);border-radius:8px;padding:8px 16px">' +
            '<div style="color:' + N.gold + ';font-size:22px;font-weight:500">' + fmt(pts) + '</div>' +
            '<div style="color:rgba(255,255,255,0.45);font-size:11px">mata anda</div></div>' +
            '<div style="color:rgba(255,255,255,0.5);font-size:12px;flex:1">Kumpul mata dengan hadir aktiviti, selesai misi & hantar laporan.</div>' +
          '</div>' +
        '</div>' +
        '<div style="padding:16px"><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' + cards + '</div></div>' +
      '</div>'
    );
  }

  /* ================================================================
     MISSIONS
     ================================================================ */
  function renderMissions() {
    var cards = MISSIONS.map(function (m) {
      var done = m.progress >= m.total;
      var doneBlock = done ? '<div style="margin-top:10px;background:#EAF3DE;border:0.5px solid #C0DD97;border-radius:8px;padding:8px;text-align:center;font-size:12px;color:' + N.green + ';font-weight:500">✓ Misi selesai · +' + m.pts + ' mata dikreditkan</div>' : '';
      return cardOpen('padding:14px;margin-bottom:10px') +
        '<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px">' +
        '<div style="flex:1;padding-right:8px">' +
        '<span style="display:inline-block;padding:2px 7px;border-radius:4px;font-size:10px;font-weight:500;background:rgba(15,42,94,0.08);color:' + N.navy + ';margin-bottom:6px">' + esc(m.cat) + '</span>' +
        '<div style="font-size:13px;font-weight:500;margin-bottom:2px">' + esc(m.title) + '</div>' +
        '<div style="font-size:12px;color:' + N.muted + '">' + esc(m.desc) + '</div></div>' +
        '<div style="text-align:right;flex-shrink:0"><div style="font-size:15px;font-weight:500;color:' + N.gold + '">+' + m.pts + '</div>' +
        '<div style="font-size:11px;color:' + N.muted + '">mata</div></div></div>' +
        pb(m.progress, m.total, done ? N.green : N.navy) +
        '<div style="display:flex;justify-content:space-between;margin-top:6px;font-size:11px;color:' + N.muted + '">' +
        '<span>' + m.progress + '/' + m.total + ' selesai</span><span>Tamat: ' + m.deadline + '</span></div>' +
        doneBlock +
        cardClose();
    }).join('');

    return '<div style="padding:16px">' +
      '<div style="font-size:16px;font-weight:500;margin-bottom:4px">Misi Aktif</div>' +
      '<div style="font-size:12px;color:' + N.muted + ';margin-bottom:16px">Jul 2026 · Selesai misi untuk mata bonus</div>' +
      cards + '</div>';
  }

  /* ================================================================
     REPORTS
     ================================================================ */
  function renderReports() {
    var stMap = {
      open: ['#FCEBEB', '#791F1F', 'Terbuka'],
      'in-progress': ['#FAEEDA', '#633806', 'Dalam proses'],
      resolved: ['#EAF3DE', '#27500A', 'Selesai']
    };

    var formHtml = '';
    if (state.reportsShowForm) {
      var cats = ['Jalan', 'Longkang', 'Lampu', 'Sampah', 'Banjir', 'Lain-lain'].map(function (c) {
        var active = state.reportsCat === c;
        return '<button onclick="PE.setReportCat(\'' + c + '\')" style="padding:4px 10px;border-radius:20px;border:0.5px solid ' + (active ? N.navy : N.border) + ';background:' + (active ? 'rgba(15,42,94,0.08)' : N.surface) + ';font-size:12px;cursor:pointer;color:' + (active ? N.navy : N.text) + '">' + c + '</button>';
      }).join('');

      formHtml = cardOpen('padding:14px;margin-bottom:16px;border-left:3px solid ' + N.gold) +
        '<div style="font-size:14px;font-weight:500;margin-bottom:12px">Laporan baru</div>' +
        ['Tajuk isu', 'Lokasi'].map(function (f) {
          return '<div style="margin-bottom:10px"><div style="font-size:12px;color:' + N.muted + ';margin-bottom:4px">' + f + '</div>' +
            '<input style="width:100%;padding:8px 10px;border-radius:8px;border:0.5px solid ' + N.border + ';font-size:13px;color:' + N.text + ';background:' + N.surface + ';box-sizing:border-box" placeholder="Masukkan ' + f.toLowerCase() + '"></div>';
        }).join('') +
        '<div style="font-size:12px;color:' + N.muted + ';margin-bottom:6px">Penerangan</div>' +
        '<textarea style="width:100%;padding:8px 10px;border-radius:8px;border:0.5px solid ' + N.border + ';font-size:13px;min-height:64px;resize:vertical;color:' + N.text + ';background:' + N.surface + ';box-sizing:border-box;margin-bottom:10px" placeholder="Huraikan isu..."></textarea>' +
        '<div style="font-size:12px;color:' + N.muted + ';margin-bottom:6px">Kategori</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">' + cats + '</div>' +
        '<button onclick="PE.hideReportForm()" style="width:100%;padding:10px;border-radius:8px;background:' + N.navy + ';color:#fff;border:none;font-size:13px;font-weight:500;cursor:pointer">Hantar laporan (+50 mata)</button>' +
        cardClose();
    }

    var listHtml = REPORTS.map(function (r) {
      var st = stMap[r.status];
      return cardOpen('padding:12px') +
        '<div style="font-size:13px;font-weight:500;margin-bottom:3px">' + esc(r.title) + '</div>' +
        '<div style="font-size:11px;color:' + N.muted + ';margin-bottom:8px">' + esc(r.member) + ' · ' + esc(r.cawangan) + ' · ' + r.time + '</div>' +
        '<div style="display:flex;gap:6px">' +
        '<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:500;background:' + st[0] + ';color:' + st[1] + '">' + st[2] + '</span>' +
        '<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;background:rgba(15,42,94,0.06);color:' + N.navy + '">' + esc(r.cat) + '</span></div>' +
        cardClose();
    }).join('');

    return '<div style="padding:16px">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">' +
      '<div><div style="font-size:16px;font-weight:500">Laporan Kawasan</div>' +
      '<div style="font-size:12px;color:' + N.muted + '">+50 mata setiap laporan</div></div>' +
      '<button onclick="PE.toggleReportForm()" style="padding:8px 14px;border-radius:8px;background:' + N.navy + ';color:#fff;border:none;font-size:13px;font-weight:500;cursor:pointer">+ Lapor isu</button></div>' +
      formHtml +
      '<div style="display:flex;flex-direction:column;gap:8px">' + listHtml + '</div>' +
      '</div>';
  }

  /* ================================================================
     TRAINING
     ================================================================ */
  function renderTraining() {
    var cards = MODULES.map(function (m) {
      var done = m.done >= m.parts;
      var label = done ? '✓ Selesai' : (m.done === 0 ? 'Mula sekarang' : 'Sambung');
      return cardOpen('padding:14px;margin-bottom:10px') +
        '<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:6px">' +
        '<div style="font-size:13px;font-weight:500;flex:1;padding-right:8px">' + esc(m.title) + '</div>' +
        '<div style="font-size:14px;font-weight:500;color:' + N.gold + ';flex-shrink:0">+' + m.pts + '</div></div>' +
        '<div style="font-size:12px;color:' + N.muted + ';margin-bottom:10px">' + m.parts + ' bahagian · ' + m.dur + '</div>' +
        pb(m.done, m.parts, done ? N.green : N.navy) +
        '<div style="display:flex;justify-content:space-between;margin-top:6px;margin-bottom:12px;font-size:11px;color:' + N.muted + '">' +
        '<span>' + m.done + '/' + m.parts + ' bahagian</span><span>' + Math.round((m.done / m.parts) * 100) + '%</span></div>' +
        '<button style="width:100%;padding:8px;border-radius:8px;border:none;cursor:pointer;font-size:13px;font-weight:500;background:' + (done ? '#EAF3DE' : N.navy) + ';color:' + (done ? N.green : '#fff') + '">' + label + '</button>' +
        cardClose();
    }).join('');

    return '<div style="padding:16px">' +
      '<div style="font-size:16px;font-weight:500;margin-bottom:4px">Modul Latihan</div>' +
      '<div style="font-size:12px;color:' + N.muted + ';margin-bottom:16px">Tingkatkan kemahiran · Jana mata bonus</div>' +
      cards + '</div>';
  }

  /* ================================================================
     DASHBOARD (HQ)
     ================================================================ */
  function renderDashboard() {
    var totM = CAWANGAN.reduce(function (a, c) { return a + c.members; }, 0);
    var totA = CAWANGAN.reduce(function (a, c) { return a + c.active; }, 0);
    var totP = CAWANGAN.reduce(function (a, c) { return a + c.pts; }, 0);
    var avgAtt = Math.round(CAWANGAN.reduce(function (a, c) { return a + c.attendance; }, 0) / CAWANGAN.length);
    var barMax = Math.max.apply(null, CAWANGAN.map(function (c) { return c.pts; }));
    var cawView = state.dashCawView;

    var kpis = [
      ['Jumlah ahli', fmt(totM), '40 cawangan', N.navy],
      ['Ahli aktif', Math.round((totA / totM) * 100) + '%', totA + ' orang', N.green],
      ['Jumlah mata', (totP / 1000).toFixed(0) + 'k', 'bulan ini', N.gold],
      ['Kehadiran purata', avgAtt + '%', 'merentas aktiviti', N.navy]
    ].map(function (k) {
      return cardOpen('padding:12px') +
        '<div style="font-size:11px;color:' + N.muted + ';margin-bottom:4px">' + k[0] + '</div>' +
        '<div style="font-size:22px;font-weight:500;color:' + k[3] + '">' + k[1] + '</div>' +
        '<div style="font-size:11px;color:' + N.muted + ';margin-top:2px">' + k[2] + '</div>' + cardClose();
    }).join('');

    var viewBtns = ['pts', 'att'].map(function (v) {
      var active = cawView === v;
      return '<button onclick="PE.setDashView(\'' + v + '\')" style="padding:3px 8px;border-radius:4px;border:none;cursor:pointer;font-size:11px;font-weight:500;background:' +
        (active ? N.navy : 'rgba(15,42,94,0.06)') + ';color:' + (active ? '#fff' : N.muted) + '">' + (v === 'pts' ? 'Mata' : 'Hadir') + '</button>';
    }).join('');

    var bars = CAWANGAN.slice(0, 8).map(function (c, i) {
      var val = cawView === 'pts' ? c.pts : c.attendance;
      var max = cawView === 'pts' ? barMax : 100;
      var label = cawView === 'pts' ? (c.pts / 1000).toFixed(1) + 'k' : c.attendance + '%';
      var pct = Math.round((val / max) * 100);
      return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">' +
        '<div style="width:18px;font-size:11px;color:' + N.muted + ';text-align:right;flex-shrink:0">' + (i + 1) + '</div>' +
        '<div style="font-size:12px;width:100px;flex-shrink:0">' + esc(c.name) + '</div>' +
        '<div style="flex:1;background:rgba(15,42,94,0.06);border-radius:4px;height:16px;overflow:hidden">' +
        '<div style="height:100%;border-radius:4px;background:' + (i < 3 ? N.gold : N.navy) + ';width:' + pct + '%;transition:width .6s ease;display:flex;align-items:center;padding-left:6px">' +
        '<span style="font-size:10px;color:' + (i < 3 ? N.navyDark : '#fff') + ';white-space:nowrap">' + label + '</span></div></div></div>';
    }).join('');

    var reportsFeed = REPORTS.map(function (r, i) {
      var c = { open: N.red, 'in-progress': N.gold, resolved: N.green }[r.status];
      var isLast = i === REPORTS.length - 1;
      return '<div style="display:flex;gap:10px;padding-bottom:' + (isLast ? 0 : 8) + 'px;margin-bottom:' + (isLast ? 0 : 8) + 'px;border-bottom:' + (isLast ? 'none' : '0.5px solid ' + N.border) + '">' +
        '<div style="width:6px;height:6px;border-radius:50%;background:' + c + ';margin-top:5px;flex-shrink:0"></div>' +
        '<div><div style="font-size:12px;font-weight:500">' + esc(r.title) + '</div>' +
        '<div style="font-size:11px;color:' + N.muted + '">' + esc(r.cawangan) + ' · ' + r.time + '</div></div></div>';
    }).join('');

    var activeMembers = MEMBERS.slice(0, 5).map(function (m, i) {
      var isLast = i === 4;
      return '<div style="display:flex;align-items:center;gap:10px;margin-bottom:' + (isLast ? 0 : 10) + 'px">' +
        '<div style="font-size:13px;width:20px;text-align:center">' + (m.badge || (i + 1)) + '</div>' +
        av(m.avatar, 32, N.navy, '#fff', 11) +
        '<div style="flex:1"><div style="font-size:12px;font-weight:500">' + esc(m.name) + '</div>' +
        '<div style="font-size:11px;color:' + N.muted + '">' + esc(m.cawangan) + '</div></div>' +
        '<div style="font-size:13px;font-weight:500;color:' + N.navy + '">' + fmt(m.points) + '</div></div>';
    }).join('');

    return '<div style="padding:16px">' +
      '<div style="font-size:16px;font-weight:500;margin-bottom:2px">Dashboard HQ</div>' +
      '<div style="font-size:12px;color:' + N.muted + ';margin-bottom:14px">Parlimen Ampang P101 · 40 cawangan</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">' + kpis + '</div>' +
      cardOpen('margin-bottom:14px') +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">' +
        '<div style="font-size:13px;font-weight:500">Prestasi cawangan</div><div style="display:flex;gap:4px">' + viewBtns + '</div></div>' +
        bars +
      cardClose() +
      cardOpen('margin-bottom:14px') +
        '<div style="font-size:13px;font-weight:500;margin-bottom:12px">Laporan Kawasan Terkini</div>' + reportsFeed +
      cardClose() +
      cardOpen() +
        '<div style="font-size:13px;font-weight:500;margin-bottom:12px">Ahli Paling Aktif</div>' + activeMembers +
      cardClose() +
      '</div>';
  }

  /* ================================================================
     Screen registry + tab switching
     ================================================================ */
  var SCREENS = {
    home: renderHome,
    leaderboard: renderLeaderboard,
    events: renderEvents,
    rewards: renderRewards,
    missions: renderMissions,
    reports: renderReports,
    training: renderTraining,
    dashboard: renderDashboard
  };

  function renderScreen() {
    var el = document.getElementById('peScreen');
    var fn = SCREENS[state.tab] || SCREENS.home;
    el.innerHTML = fn();
    el.scrollTop = 0;
  }

  function renderNavbar() {
    var el = document.getElementById('peNavbar');
    el.innerHTML = NAVBAR.map(function (n) {
      var on = state.tab === n.id;
      return '<button class="pe-nav-btn' + (on ? ' is-active' : '') + '" onclick="PE.goto(\'' + n.id + '\')">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (on ? 2 : 1.5) + '" stroke-linecap="round" stroke-linejoin="round"><path d="' + n.d + '"/></svg>' +
        '<span>' + n.label + '</span></button>';
    }).join('');
  }

  /* ---------- Public API (referenced by inline onclick handlers) ---------- */
  window.PE = {
    goto: function (tabId) {
      state.tab = tabId;
      renderScreen();
      renderNavbar();
    },
    checkIn: function () {
      state.checkedIn = true;
      renderScreen();
    },
    setLeaderboardScope: function (s) {
      state.leaderboardScope = s;
      renderScreen();
    },
    toggleEventJoin: function (id) {
      state.joinedEvents[id] = !state.joinedEvents[id];
      renderScreen();
    },
    claimReward: function (id) {
      state.claimedRewards[id] = true;
      renderScreen();
    },
    setDashView: function (v) {
      state.dashCawView = v;
      renderScreen();
    },
    toggleReportForm: function () {
      state.reportsShowForm = !state.reportsShowForm;
      renderScreen();
    },
    hideReportForm: function () {
      state.reportsShowForm = false;
      renderScreen();
    },
    setReportCat: function (c) {
      state.reportsCat = c;
      renderScreen();
    }
  };

  /* ---------- Initial render ---------- */
  renderScreen();
  renderNavbar();
})();
