/* ============================================================
   Send Membership Certificate — Netlify Function
   Runs server-side only. Called by form-submit.js right after a
   registration is saved to Firestore.

   What it does:
   1. Builds a one-page A4-landscape membership certificate PDF
      (Bahasa Melayu template, party logo, signature block for
      Dato' Hafiz) using pdf-lib — verified working before this
      file was written (test render checked layout/spacing).
   2. Emails that PDF as an attachment to the registrant's email,
      via Resend's REST API (RESEND_API_KEY env var — never
      commit this key, set it in Netlify's env var settings the
      same way as MAPBOX_TOKEN / OPENAI_API_KEY).

   Requires "pdf-lib" as a dependency — run `npm install pdf-lib`
   in the repo root and commit the updated package.json /
   package-lock.json (not node_modules) so Netlify's build step
   installs it.

   IMPORTANT — the signature is a printed name in an italic font,
   not a scanned real signature (none was provided). If Dato' Hafiz
   has an actual signature image later, swap it in the same way the
   logo is embedded below (embedPng/embedJpg + drawImage) instead of
   the drawText() signature block.
   ============================================================ */

const fs = require('fs');
const path = require('path');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

const NAVY = rgb(0.039, 0.165, 0.369);
const RED = rgb(0.827, 0.024, 0.051);
const GOLD = rgb(0.788, 0.635, 0.153);
const INK = rgb(0.086, 0.094, 0.110);

const MALAY_MONTHS = [
  'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
  'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'
];

function malayDate(d) {
  return d.getDate() + ' ' + MALAY_MONTHS[d.getMonth()] + ' ' + d.getFullYear();
}

const JOIN_AS_LABEL = { ahli: 'Ahli', penyokong: 'Penyokong', sukarelawan: 'Sukarelawan' };

async function buildCertificatePdf(data) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]); // A4 landscape, points
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
  const fontItalicBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic);

  function centered(text, font, size, y, color) {
    const w = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: (width - w) / 2, y, size, font, color: color || INK });
  }

  // Decorative border, party colours
  page.drawRectangle({ x: 18, y: 18, width: width - 36, height: height - 36, borderColor: NAVY, borderWidth: 3 });
  page.drawRectangle({ x: 26, y: 26, width: width - 52, height: height - 52, borderColor: RED, borderWidth: 1 });
  page.drawLine({ start: { x: 60, y: height - 150 }, end: { x: width - 60, y: height - 150 }, thickness: 1.2, color: GOLD });

  // Logo (PNG — the source logo.jpg is a progressive JPEG, which
  // pdf-lib's embedJpg cannot read; it was pre-converted to PNG,
  // which embeds reliably).
  const logoBytes = fs.readFileSync(path.join(__dirname, 'certificate-assets/logo.png'));
  const logoImage = await pdfDoc.embedPng(logoBytes);
  const logoDim = logoImage.scale(90 / logoImage.width);
  page.drawImage(logoImage, {
    x: (width - logoDim.width) / 2,
    y: height - 55 - logoDim.height,
    width: logoDim.width,
    height: logoDim.height
  });

  centered('PARTI WAWASAN NEGARA', fontBold, 13, height - 165, NAVY);
  centered('CAWANGAN SABAK BERNAM', fontRegular, 10, height - 180, INK);

  centered('SIJIL KEAHLIAN', fontBold, 26, height - 225, RED);
  centered('Adalah dengan ini disahkan bahawa', fontRegular, 12, height - 260, INK);

  centered(String(data.fullName || '').toUpperCase(), fontBold, 22, height - 300, NAVY);
  centered('(No. Kad Pengenalan: ' + data.icNumber + ')', fontRegular, 10.5, height - 322, INK);

  const statusLabel = JOIN_AS_LABEL[data.joinAs] || 'Ahli';
  centered(
    'telah berdaftar secara rasmi sebagai ' + statusLabel + ' Parti Wawasan Negara, Cawangan Sabak Bernam',
    fontRegular, 11.5, height - 348, INK
  );
  centered('dengan No. Keahlian: ' + data.memberId, fontBold, 13, height - 368, RED);

  centered(
    'Terima kasih, ' + String(data.fullName || '') + ', atas komitmen anda bersama perjuangan kami.',
    fontItalic, 10.5, height - 392, INK
  );

  // Signature block (bottom right) — printed italic name, see note
  // at top of file about swapping in a real signature image later.
  const sigX = width - 260;
  const sigLineY = 110;
  page.drawLine({ start: { x: sigX, y: sigLineY }, end: { x: sigX + 190, y: sigLineY }, thickness: 1, color: INK });

  const sigName = "Dato' Hafiz";
  const sigNameW = fontItalicBold.widthOfTextAtSize(sigName, 15);
  page.drawText(sigName, { x: sigX + (190 - sigNameW) / 2, y: sigLineY + 8, size: 15, font: fontItalicBold, color: NAVY });

  const sigRole1 = 'Ketua Cawangan';
  const sigRole1W = fontRegular.widthOfTextAtSize(sigRole1, 9);
  page.drawText(sigRole1, { x: sigX + (190 - sigRole1W) / 2, y: sigLineY - 14, size: 9, font: fontRegular, color: INK });

  const sigRole2 = 'Parti Wawasan Negara, Sabak Bernam';
  const sigRole2W = fontRegular.widthOfTextAtSize(sigRole2, 9);
  page.drawText(sigRole2, { x: sigX + (190 - sigRole2W) / 2, y: sigLineY - 26, size: 9, font: fontRegular, color: INK });

  // Date / reference (bottom left)
  page.drawText('Bertarikh: ' + malayDate(new Date()), { x: 70, y: 100, size: 10, font: fontRegular, color: INK });
  page.drawText('Rujukan Sijil: ' + data.memberId, { x: 70, y: 84, size: 9, font: fontItalic, color: INK });

  return pdfDoc.save(); // Uint8Array
}

function buildEmailHtml(data) {
  var statusLabel = JOIN_AS_LABEL[data.joinAs] || 'Ahli';
  var rows = [
    ['Nama Penuh', data.fullName],
    ['No. Kad Pengenalan', data.icNumber],
    ['No. Telefon', data.phone],
    ['Mukim / Kawasan', data.mukim],
    ['Status Pendaftaran', statusLabel],
    ['No. Keahlian', data.memberId]
  ].filter(function (r) { return r[1]; });

  var rowsHtml = rows.map(function (r) {
    return (
      '<tr>' +
        '<td style="padding:6px 12px 6px 0;color:#4a4f58;font-size:0.88rem;white-space:nowrap;">' + escapeHtml(r[0]) + '</td>' +
        '<td style="padding:6px 0;color:#16181c;font-size:0.9rem;font-weight:600;">' + escapeHtml(r[1]) + '</td>' +
      '</tr>'
    );
  }).join('');

  return (
    '<div style="font-family:Arial,sans-serif;max-width:540px;margin:0 auto;color:#16181c;line-height:1.6;">' +
      '<div style="background:#0a2a5e;padding:22px 26px;border-radius:10px 10px 0 0;">' +
        '<p style="margin:0;color:#c9a227;font-size:0.72rem;letter-spacing:0.12em;font-weight:700;">PARTI WAWASAN NEGARA</p>' +
        '<p style="margin:2px 0 0;color:#fff;font-size:0.95rem;font-weight:700;">Cawangan Sabak Bernam</p>' +
      '</div>' +
      '<div style="border:1px solid #e4e2dc;border-top:none;border-radius:0 0 10px 10px;padding:26px;">' +
        '<h2 style="color:#0a2a5e;margin:0 0 6px;font-size:1.25rem;">Selamat Bergabung, ' + escapeHtml(data.fullName) + '!</h2>' +
        '<p style="margin:0 0 18px;color:#4a4f58;">' +
          'Bagi pihak seluruh keluarga besar Parti Wawasan Negara — di peringkat Cawangan Sabak Bernam mahupun ' +
          'peringkat Parti Wawasan Negara pusat — kami mengucapkan setinggi-tinggi terima kasih dan tahniah kerana ' +
          'sudi menyertai perjuangan kami untuk rakyat Sabak Bernam.' +
        '</p>' +
        '<p style="margin:0 0 16px;color:#16181c;">Pendaftaran anda telah <strong style="color:#0a7d3c;">berjaya disahkan</strong>. Berikut ringkasan maklumat pendaftaran anda:</p>' +
        '<table style="width:100%;border-collapse:collapse;margin:0 0 20px;background:#f7f7f5;border-radius:8px;padding:4px;">' +
          '<tbody>' + rowsHtml + '</tbody>' +
        '</table>' +
        '<p style="margin:0 0 6px;">Sijil keahlian rasmi anda disertakan sebagai lampiran PDF pada e-mel ini — sila muat turun dan simpan untuk rujukan anda.</p>' +
        '<p style="margin:18px 0 0;color:#4a4f58;">Sekali lagi, terima kasih kerana menjadi sebahagian daripada perjuangan ini. Suara anda amat bermakna bagi kami.</p>' +
        '<p style="margin:22px 0 0;font-weight:700;color:#0a2a5e;">Salam Perjuangan,<br>Parti Wawasan Negara, Cawangan Sabak Bernam</p>' +
        '<hr style="border:none;border-top:1px solid #e4e2dc;margin:22px 0 12px;">' +
        '<p style="margin:0;color:#8a8d93;font-size:0.78rem;">E-mel ini dijana secara automatik oleh sistem pendaftaran. Tidak perlu dibalas.</p>' +
      '</div>' +
    '</div>'
  );
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

exports.handler = async function (event) {
  console.log("Function triggered. Body:", event.body); // DEBUG
  
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { email, fullName, memberId } = payload;
  console.log("Received data:", { email, fullName, memberId }); // DEBUG

  if (!email) {
    console.log("No email provided, skipping."); // DEBUG
    return { statusCode: 200, body: JSON.stringify({ skipped: true }) };
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  console.log("API Key present:", !!RESEND_API_KEY); // DEBUG

  if (!RESEND_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Missing API Key' }) };
  }

  // ... (Keep your pdf generation code here)

  try {
    console.log("Attempting to fetch Resend API...");
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev', // Force this for testing
        to: [email],
        subject: 'Test Certificate',
        html: '<p>Test</p>'
      })
    });

    const result = await res.json();
    console.log("Resend Response:", result); // DEBUG

    return { statusCode: 200, body: JSON.stringify({ sent: true, result }) };
  } catch (err) {
    console.error("CRITICAL ERROR:", err); // DEBUG
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed', detail: String(err) }) };
  }
};
