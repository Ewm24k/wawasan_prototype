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
  return (
    '<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#16181c;">' +
      '<h2 style="color:#0a2a5e;margin:0 0 12px;">Terima kasih, ' + escapeHtml(data.fullName) + '!</h2>' +
      '<p>Pendaftaran anda dengan Parti Wawasan Negara, Cawangan Sabak Bernam, telah berjaya diterima.</p>' +
      '<p><strong>No. Keahlian:</strong> ' + escapeHtml(data.memberId) + '</p>' +
      '<p>Sijil keahlian rasmi anda disertakan sebagai lampiran PDF pada e-mel ini — boleh dimuat turun dan disimpan.</p>' +
      '<p style="margin-top:24px;color:#4a4f58;font-size:0.85rem;">' +
        'Parti Wawasan Negara, Cawangan Sabak Bernam<br>E-mel ini dijana secara automatik, tidak perlu dibalas.' +
      '</p>' +
    '</div>'
  );
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body.' }) };
  }

  const email = typeof payload.email === 'string' ? payload.email.trim() : '';
  const fullName = typeof payload.fullName === 'string' ? payload.fullName.trim() : '';
  const icNumber = typeof payload.icNumber === 'string' ? payload.icNumber.trim() : '';
  const memberId = typeof payload.memberId === 'string' ? payload.memberId.trim() : '';
  const joinAs = typeof payload.joinAs === 'string' ? payload.joinAs.trim() : 'ahli';

  if (!email) {
    // Not an error — email is optional on the form. Nothing to send.
    return { statusCode: 200, body: JSON.stringify({ skipped: true, reason: 'no-email' }) };
  }
  if (!fullName || !memberId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing fullName or memberId.' }) };
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server misconfigured: RESEND_API_KEY is not set.' }) };
  }

  let pdfBytes;
  try {
    pdfBytes = await buildCertificatePdf({ fullName, icNumber, memberId, joinAs });
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Certificate generation failed', detail: String(err) }) };
  }

  const pdfBase64 = Buffer.from(pdfBytes).toString('base64');

  // FROM_EMAIL: set this Netlify env var to an address on a domain
  // you've verified in Resend. Until you verify a domain, Resend's
  // shared sandbox sender (onboarding@resend.dev) works for testing
  // only — swap FROM_EMAIL the moment a real domain is verified.
  const FROM_EMAIL = process.env.FROM_EMAIL || 'Parti Wawasan Negara <onboarding@resend.dev>';

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject: 'Sijil Keahlian Anda — Parti Wawasan Negara, Sabak Bernam',
        html: buildEmailHtml({ fullName, memberId }),
        attachments: [
          { filename: 'Sijil-Keahlian-' + memberId + '.pdf', content: pdfBase64 }
        ]
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      return { statusCode: 502, body: JSON.stringify({ error: 'Email send failed', detail: errText }) };
    }

    return { statusCode: 200, body: JSON.stringify({ sent: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Request failed', detail: String(err) }) };
  }
};
