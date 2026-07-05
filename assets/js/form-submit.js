/* ============================================================
   Parti Wawasan Negara — Form Submission (Firebase)
   - Saves the form to Firestore ("registrations" collection)
   - Generates a unique membership ID: N + 6 digits + capital
     letter (e.g. N048213X), checked against Firestore so no
     two members ever get the same ID (uses a transaction to
     stay correct even if two people submit at the same instant)
   - Drives the processing popup: each step's icon is a live
     reflection of that step's real async Firebase call, not a
     fake timer — it only turns into a green tick once that
     specific call has actually finished.
   ============================================================ */

import { db, isFirebaseConfigured } from "./firebase-config.js";
import {
  collection,
  addDoc,
  doc,
  runTransaction,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ---------- Membership ID format ----------
   N + ID_DIGIT_LENGTH digits + one capital letter.
   Change ID_DIGIT_LENGTH here if you want a longer/shorter code. */
var ID_DIGIT_LENGTH = 6;
var LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var MAX_ID_ATTEMPTS = 25;

function randomDigits(len) {
  var s = "";
  for (var i = 0; i < len; i++) s += Math.floor(Math.random() * 10);
  return s;
}
function randomLetter() {
  return LETTERS.charAt(Math.floor(Math.random() * LETTERS.length));
}
function generateCandidateId() {
  return "N" + randomDigits(ID_DIGIT_LENGTH) + randomLetter();
}

/* Checks Firestore for a free ID and reserves it atomically via a
   transaction, so two simultaneous submissions can never collide
   on the same code. Retries with a new random candidate if the
   one it tried is already taken. */
async function generateUniqueMemberId() {
  for (var attempt = 0; attempt < MAX_ID_ATTEMPTS; attempt++) {
    var candidate = generateCandidateId();
    var ref = doc(db, "member_ids", candidate);
    try {
      var reserved = await runTransaction(db, async function (tx) {
        var snap = await tx.get(ref);
        if (snap.exists()) return false; // taken — try another candidate
        tx.set(ref, { createdAt: serverTimestamp() });
        return true;
      });
      if (reserved) return candidate;
    } catch (err) {
      if (attempt === MAX_ID_ATTEMPTS - 1) throw err;
    }
  }
  throw new Error("Gagal menjana ID unik selepas beberapa percubaan.");
}

/* ---------- Processing popup controller ---------- */
var popup = document.getElementById("processPopup");
var resultEl = document.getElementById("processResult");
var errorEl = document.getElementById("processError");
var retryBtn = document.getElementById("processRetry");
var okBtn = document.getElementById("processOk");
var stepItems = {};

if (popup) {
  popup.querySelectorAll(".pe-process__item").forEach(function (li) {
    stepItems[li.getAttribute("data-step")] = li;
  });
}

function resetSteps() {
  Object.keys(stepItems).forEach(function (k) {
    stepItems[k].classList.remove("is-done", "is-error");
  });
}
function openPopup() {
  if (!popup) return;
  resultEl.textContent = "";
  errorEl.hidden = true;
  retryBtn.hidden = true;
  if (okBtn) okBtn.hidden = true;
  resetSteps();
  popup.classList.add("is-open");
  popup.setAttribute("aria-hidden", "false");
}
function closePopup() {
  if (!popup) return;
  popup.classList.remove("is-open");
  popup.setAttribute("aria-hidden", "true");
}
function markStepDone(step) {
  if (stepItems[step]) stepItems[step].classList.add("is-done");
}
function markStepError(step) {
  if (stepItems[step]) stepItems[step].classList.add("is-error");
}
function showError(message) {
  errorEl.hidden = false;
  errorEl.textContent = message;
  retryBtn.hidden = false;
}
function friendlyError(err) {
  var code = err && err.code;
  var FRIENDLY_BY_CODE = {
    "permission-denied":
      "Kebenaran ditolak oleh pangkalan data. Semak peraturan Firestore (rules_database.md) telah diterbitkan.",
    "unavailable":
      "Tidak dapat menghubungi pangkalan data. Semak sambungan internet anda dan cuba lagi.",
    "resource-exhausted": "Pangkalan data sedang sibuk. Sila cuba sebentar lagi.",
    "unauthenticated": "Sesi tidak sah. Sila muat semula halaman dan cuba lagi.",
    "not-found": "Pangkalan data tidak ditemui. Semak Project ID dalam firebase-config.js.",
  };
  if (code && FRIENDLY_BY_CODE[code]) return FRIENDLY_BY_CODE[code];
  return err && err.message
    ? err.message
    : "Ralat tidak diketahui. Sila cuba lagi.";
}

/* ---------- Modal-popup (iframe) awareness, matching form.js ---------- */
var params = new URLSearchParams(window.location.search);
var isModal = params.get("modal") === "1";
function notifyParentClose() {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: "wawasan:closeForm" }, "*");
  }
}

/* ---------- Main submit flow ---------- */
var form = document.getElementById("joinForm");
var formStatus = document.getElementById("formStatus");

/* Deliberately NOT using form.checkValidity()/reportValidity() here.
   On mobile Chrome, a field filled via autofill/autocomplete can
   visually show text while the browser's own native validity check
   still reports it as empty — which silently blocks submission with
   no console error (exactly this bug). Reading .value directly is
   more reliable and lets us show our own clear message instead of
   an OS-level tooltip that renders inconsistently on mobile anyway. */
/* ---------- Field format validation ----------
   Deliberately lenient (Malaysian IC/phone numbers are written with
   or without dashes/spaces in the wild) but still catches obvious
   typos instead of silently accepting garbage. */
function isValidIcNumber(value) {
  var digits = value.replace(/[\s-]/g, "");
  return /^\d{12}$/.test(digits);
}
function isValidPhone(value) {
  var digits = value.replace(/[\s-]/g, "").replace(/^\+?60/, "0");
  return /^0\d{8,10}$/.test(digits);
}
function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function findFirstInvalidField() {
  var fullName = form.fullName.value.trim();
  var icNumber = form.icNumber.value.trim();
  var phone = form.phone.value.trim();
  var email = form.email.value.trim();

  if (!fullName) return { field: form.fullName, msg: "Sila isikan Nama Penuh." };
  if (fullName.length < 2)
    return { field: form.fullName, msg: "Nama penuh terlalu pendek — semak ejaan." };

  if (!icNumber) return { field: form.icNumber, msg: "Sila isikan No. Kad Pengenalan." };
  if (!isValidIcNumber(icNumber))
    return {
      field: form.icNumber,
      msg: "Format No. Kad Pengenalan tidak sah. Gunakan format 900101-10-1234 (12 digit).",
    };

  if (!phone) return { field: form.phone, msg: "Sila isikan No. Telefon." };
  if (!isValidPhone(phone))
    return {
      field: form.phone,
      msg: "Format No. Telefon tidak sah. Contoh: 012-345 6789.",
    };

  // Email is optional — only validated if the visitor typed something.
  if (email && !isValidEmail(email))
    return { field: form.email, msg: "Format e-mel tidak sah. Semak semula." };

  if (!form.consent.checked)
    return {
      field: form.consent,
      msg: "Sila bersetuju dengan penggunaan maklumat sebelum menghantar.",
    };
  return null;
}

function showFieldError(msg) {
  if (formStatus) {
    formStatus.textContent = msg;
    formStatus.className = "form-status is-error";
  }
}
function clearFieldError() {
  if (formStatus) {
    formStatus.textContent = "";
    formStatus.className = "form-status";
  }
}

async function handleSubmit(e) {
  e.preventDefault();
  if (!form) return;

  var invalid = findFirstInvalidField();
  if (invalid) {
    showFieldError(invalid.msg);
    invalid.field.focus();
    return;
  }
  clearFieldError();

  if (!isFirebaseConfigured) {
    openPopup();
    markStepError("id");
    showError(
      "Firebase belum disediakan lagi — lengkapkan assets/js/firebase-config.js dengan konfigurasi projek anda.",
    );
    return;
  }

  openPopup();

  /* Step 1 — generate and reserve this member's unique ID first.
     Doing this before the save means the registration document can
     be created with its memberId already attached in a single
     addDoc() call — no follow-up update needed, which matters
     because the Firestore rules deliberately disallow updates on
     the "registrations" collection (create-only, by design — see
     rules_database.md). Attaching the ID via a later updateDoc()
     would always be rejected with permission-denied. */
  var memberId;
  try {
    memberId = await generateUniqueMemberId();
    markStepDone("id");
  } catch (err) {
    markStepError("id");
    showError("Gagal menjana ID keahlian. " + friendlyError(err));
    return;
  }

  /* Step 2 — save the full registration, memberId included. */
  var payload = {
    fullName: form.fullName.value.trim(),
    icNumber: form.icNumber.value.trim(),
    phone: form.phone.value.trim(),
    email: form.email.value.trim(),
    address: form.address.value.trim(),
    mukim: form.mukim.value,
    joinAs: form.joinAs.value,
    message: form.message.value.trim(),
    consent: form.consent.checked,
    memberId: memberId,
    tier: "ahli", // AJK/VIP is an admin-assigned designation, set later from the dashboard
    submittedAt: serverTimestamp(),
  };

  try {
    await addDoc(collection(db, "registrations"), payload);
    markStepDone("save");
  } catch (err) {
    markStepError("save");
    showError(
      "ID keahlian (" + memberId + ") telah dijana, tetapi borang gagal disimpan. " +
        friendlyError(err) +
        " Sila cuba hantar semula — ID baharu akan dijana.",
    );
    return;
  }

  resultEl.textContent = "Berjaya! ID Keahlian anda: " + memberId;

  // Certificate email fetch is kept (harmless to leave firing in the
  // background) — not discussing/changing that part right now per
  // your last message. keepalive still makes sense here since the
  // popup no longer auto-closes, but the visitor could still click
  // OK and navigate away before this finishes.
  if (payload.email) {
    resultEl.textContent += " Sijil sedang dihantar ke e-mel anda.";
    fetch("/.netlify/functions/send-certificate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        email: payload.email,
        fullName: payload.fullName,
        icNumber: payload.icNumber,
        phone: payload.phone,
        mukim: payload.mukim,
        memberId: memberId,
        joinAs: payload.joinAs,
      }),
    }).catch(function () {
      // Silent by design — see note above.
    });
  }

  form.reset();

  // Popup now stays open on success until the visitor clicks OK —
  // no more setTimeout auto-close/auto-reload. The member ID stays
  // on screen for as long as they need to read/copy it.
  if (okBtn) {
    okBtn.hidden = false;
    okBtn.focus();
    okBtn.onclick = function () {
      closePopup();
      if (isModal) notifyParentClose();
      window.location.reload();
    };
  } else {
    // Fallback if the OK button markup isn't present for some reason —
    // still don't auto-close silently; at least close on backdrop-free
    // manual reload isn't assumed here, so just leave the popup open.
  }
}

if (retryBtn) {
  retryBtn.addEventListener("click", function () {
    handleSubmit({ preventDefault: function () {} });
  });
}

if (form) {
  form.addEventListener("submit", handleSubmit);
  form.addEventListener("input", clearFieldError);
  form.addEventListener("change", clearFieldError);
}
