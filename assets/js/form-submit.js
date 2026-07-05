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

import { db, isFirebaseConfigured } from './firebase-config.js';
import {
  collection, addDoc, doc, updateDoc, runTransaction, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

/* ---------- Membership ID format ----------
   N + ID_DIGIT_LENGTH digits + one capital letter.
   Change ID_DIGIT_LENGTH here if you want a longer/shorter code. */
var ID_DIGIT_LENGTH = 6;
var LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var MAX_ID_ATTEMPTS = 25;

function randomDigits(len) {
  var s = '';
  for (var i = 0; i < len; i++) s += Math.floor(Math.random() * 10);
  return s;
}
function randomLetter() {
  return LETTERS.charAt(Math.floor(Math.random() * LETTERS.length));
}
function generateCandidateId() {
  return 'N' + randomDigits(ID_DIGIT_LENGTH) + randomLetter();
}

/* Checks Firestore for a free ID and reserves it atomically via a
   transaction, so two simultaneous submissions can never collide
   on the same code. Retries with a new random candidate if the
   one it tried is already taken. */
async function generateUniqueMemberId() {
  for (var attempt = 0; attempt < MAX_ID_ATTEMPTS; attempt++) {
    var candidate = generateCandidateId();
    var ref = doc(db, 'member_ids', candidate);
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
  throw new Error('Gagal menjana ID unik selepas beberapa percubaan.');
}

/* ---------- Processing popup controller ---------- */
var popup = document.getElementById('processPopup');
var resultEl = document.getElementById('processResult');
var errorEl = document.getElementById('processError');
var retryBtn = document.getElementById('processRetry');
var stepItems = {};

if (popup) {
  popup.querySelectorAll('.pe-process__item').forEach(function (li) {
    stepItems[li.getAttribute('data-step')] = li;
  });
}

function resetSteps() {
  Object.keys(stepItems).forEach(function (k) {
    stepItems[k].classList.remove('is-done', 'is-error');
  });
}
function openPopup() {
  if (!popup) return;
  resultEl.textContent = '';
  errorEl.hidden = true;
  retryBtn.hidden = true;
  resetSteps();
  popup.classList.add('is-open');
  popup.setAttribute('aria-hidden', 'false');
}
function closePopup() {
  if (!popup) return;
  popup.classList.remove('is-open');
  popup.setAttribute('aria-hidden', 'true');
}
function markStepDone(step) {
  if (stepItems[step]) stepItems[step].classList.add('is-done');
}
function markStepError(step) {
  if (stepItems[step]) stepItems[step].classList.add('is-error');
}
function showError(message) {
  errorEl.hidden = false;
  errorEl.textContent = message;
  retryBtn.hidden = false;
}
function friendlyError(err) {
  return (err && err.message) ? err.message : 'Ralat tidak diketahui. Sila cuba lagi.';
}

/* ---------- Modal-popup (iframe) awareness, matching form.js ---------- */
var params = new URLSearchParams(window.location.search);
var isModal = params.get('modal') === '1';
function notifyParentClose() {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: 'wawasan:closeForm' }, '*');
  }
}

/* ---------- Main submit flow ---------- */
var form = document.getElementById('joinForm');
var formStatus = document.getElementById('formStatus');

/* Deliberately NOT using form.checkValidity()/reportValidity() here.
   On mobile Chrome, a field filled via autofill/autocomplete can
   visually show text while the browser's own native validity check
   still reports it as empty — which silently blocks submission with
   no console error (exactly this bug). Reading .value directly is
   more reliable and lets us show our own clear message instead of
   an OS-level tooltip that renders inconsistently on mobile anyway. */
function findFirstInvalidField() {
  if (!form.fullName.value.trim()) return { field: form.fullName, msg: 'Sila isikan Nama Penuh.' };
  if (!form.icNumber.value.trim()) return { field: form.icNumber, msg: 'Sila isikan No. Kad Pengenalan.' };
  if (!form.phone.value.trim()) return { field: form.phone, msg: 'Sila isikan No. Telefon.' };
  if (!form.consent.checked) return { field: form.consent, msg: 'Sila bersetuju dengan penggunaan maklumat sebelum menghantar.' };
  return null;
}

function showFieldError(msg) {
  if (formStatus) {
    formStatus.textContent = msg;
    formStatus.className = 'form-status is-error';
  }
}
function clearFieldError() {
  if (formStatus) {
    formStatus.textContent = '';
    formStatus.className = 'form-status';
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
    markStepError('save');
    showError('Firebase belum disediakan lagi — lengkapkan assets/js/firebase-config.js dengan konfigurasi projek anda.');
    return;
  }

  openPopup();

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
    submittedAt: serverTimestamp()
  };

  /* Step 1 — save the submitted form to Firestore. */
  var docRef;
  try {
    docRef = await addDoc(collection(db, 'registrations'), payload);
    markStepDone('save');
  } catch (err) {
    markStepError('save');
    showError('Gagal menyimpan maklumat borang. ' + friendlyError(err));
    return;
  }

  /* Step 2 — generate this member's unique ID and attach it to
     the record just saved above. */
  var memberId;
  try {
    memberId = await generateUniqueMemberId();
    await updateDoc(docRef, { memberId: memberId });
    markStepDone('id');
  } catch (err) {
    markStepError('id');
    showError('Maklumat telah disimpan, tetapi ID keahlian gagal dijana. ' + friendlyError(err));
    return;
  }

  resultEl.textContent = 'Berjaya! ID Keahlian anda: ' + memberId;
  form.reset();

  setTimeout(function () {
    closePopup();
    if (isModal) notifyParentClose();
    window.location.reload();
  }, 1800);
}

if (retryBtn) {
  retryBtn.addEventListener('click', function () {
    handleSubmit({ preventDefault: function () {} });
  });
}

if (form) {
  form.addEventListener('submit', handleSubmit);
  form.addEventListener('input', clearFieldError);
  form.addEventListener('change', clearFieldError);
}
