import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-storage.js';
import { firebaseConfig, OWNER_UID } from './firebase-config.js';

const MAX_EDGE = 2400;
const MAX_BYTES = 3 * 1024 * 1024;
const THUMB_WIDTH = 800;
const THUMB_QUALITY = 0.82;
// Same curve and timing as the site lightbox in src/scripts/site-chrome.js.
const LIGHTBOX_EASE = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
const LIGHTBOX_MS = 420;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const REVEAL_STAGGER_MS = 60;
const REVEAL_MAX_DELAY_MS = 360;

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const grid = document.getElementById('ill-grid');
const empty = document.getElementById('ill-empty');
const statusEl = document.getElementById('ill-status');
const addBtn = document.getElementById('ill-add');
const signInBtn = document.getElementById('ill-signin');
const signOutBtn = document.getElementById('ill-signout');
const thumbsBtn = document.getElementById('ill-thumbs');
const loginDialog = document.getElementById('ill-login');
const loginForm = document.getElementById('ill-login-form');
const loginSubmit = document.getElementById('ill-login-submit');
const loginCancel = document.getElementById('ill-login-cancel');
const loginClose = document.getElementById('ill-login-close');
const loginError = document.getElementById('ill-login-error');
const emailInput = document.getElementById('ill-email');
const passwordInput = document.getElementById('ill-password');
const fileInput = document.getElementById('ill-file');
const drop = document.getElementById('ill-drop');
const viewer = document.getElementById('ill-viewer');
const viewerImg = document.getElementById('ill-viewer-img');
const viewerTitle = document.getElementById('ill-viewer-title');
const viewerPrev = document.getElementById('ill-viewer-prev');
const viewerNext = document.getElementById('ill-viewer-next');
const viewerRemove = document.getElementById('ill-viewer-remove');
const viewerEdit = document.getElementById('ill-viewer-edit');
const viewerDetails = document.getElementById('ill-viewer-details');
const editor = document.getElementById('ill-editor');
const editorForm = document.getElementById('ill-editor-form');
const editorImg = document.getElementById('ill-editor-img');
const editorHeading = document.getElementById('ill-editor-heading');
const editorStep = document.getElementById('ill-editor-step');
const editorName = document.getElementById('ill-editor-name');
const editorDetails = document.getElementById('ill-editor-details');
const editorError = document.getElementById('ill-editor-error');
const editorSave = document.getElementById('ill-editor-save');
const editorSkip = document.getElementById('ill-editor-skip');
const confirmDialog = document.getElementById('ill-confirm');
const confirmHeading = document.getElementById('ill-confirm-heading');
const confirmMessage = document.getElementById('ill-confirm-message');
const confirmOk = document.getElementById('ill-confirm-ok');
const main = document.getElementById('ill');
const loadingEl = document.getElementById('ill-loading');

let items = [];
let viewerIndex = -1;
let dragDepth = 0;
let statusTimer = 0;
let currentUser = null;
let editorMode = null;
let editorCurrent = null;
let editorQueue = [];
let editorShown = 0;
let editorTotal = 0;
let thumbsRunning = false;
let loaded = false;
// Images already revealed once; render() rebuilds the grid on every edit and these shouldn't replay.
const revealedSrcs = new Set();
let nextRevealAt = 0;
let viewerAnims = [];
let viewerClosing = false;

// Sign in is only offered at /illustration/?admin; an existing session still restores without it.
const adminMode = new URLSearchParams(location.search).has('admin');

function isAuthed() {
  return !!(currentUser && currentUser.uid === OWNER_UID);
}

function syncAuth() {
  const authed = isAuthed();
  signInBtn.hidden = authed || !adminMode;
  signOutBtn.hidden = !authed;
  addBtn.hidden = !authed;
  if (authed && loginDialog.open) loginDialog.close();
  if (!authed) {
    dragDepth = 0;
    drop.classList.remove('is-on');
    if (editor.open) editor.close();
  }
  render();
  if (viewer.open && viewerIndex >= 0) showViewer(viewerIndex);
}

function clearLoginError() {
  loginError.textContent = '';
  passwordInput.removeAttribute('aria-invalid');
  emailInput.removeAttribute('aria-invalid');
}

function openLogin() {
  if (loginDialog.open) return;
  passwordInput.value = '';
  clearLoginError();
  loginDialog.showModal();
  (emailInput.value ? passwordInput : emailInput).focus();
}

function closeLogin() {
  if (!loginDialog.open) return;
  passwordInput.value = '';
  clearLoginError();
  loginDialog.close();
}

function setStatus(message, persist) {
  window.clearTimeout(statusTimer);
  statusEl.textContent = message || '';
  if (!message || persist) return;
  statusTimer = window.setTimeout(() => {
    statusEl.textContent = '';
  }, 3200);
}

function authErrorMessage(err) {
  const code = err && err.code;
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
    return 'Wrong email or password.';
  }
  if (code === 'auth/too-many-requests') return 'Too many attempts. Try again later.';
  if (code === 'auth/network-request-failed') return 'Network error. Try again.';
  if (code === 'permission-denied') return 'You don’t have permission to do that.';
  return 'Couldn’t sign in.';
}

function titleFromName(name) {
  const base = String(name || '')
    .split('/')
    .pop()
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return base || 'Drawing';
}

function newId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function measureImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const size = { width: img.naturalWidth, height: img.naturalHeight };
      URL.revokeObjectURL(url);
      resolve(size);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('unreadable'));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

function compressImage(file, width, height) {
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  return resizeImage(file, width * scale, height * scale, 0.92);
}

function resizeImage(file, width, height, quality) {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('encode'));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      canvasToBlob(canvas, 'image/webp', quality)
        .then((blob) => {
          if (blob) return blob;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          return canvasToBlob(canvas, 'image/jpeg', quality);
        })
        .then((blob) => {
          URL.revokeObjectURL(url);
          if (!blob) {
            reject(new Error('encode'));
            return;
          }
          resolve({ blob, width: w, height: h });
        })
        .catch((err) => {
          URL.revokeObjectURL(url);
          reject(err);
        });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('unreadable'));
    };
    img.src = url;
  });
}

// Grid thumbnail. GIFs (animation) and SVGs (already small) keep the original, as do
// images no wider than a thumbnail; a failed thumbnail just falls back to the original.
function makeThumb(file, width, height, keepOriginal) {
  if (keepOriginal || width <= THUMB_WIDTH) return Promise.resolve(null);
  const scale = THUMB_WIDTH / width;
  return resizeImage(file, width * scale, height * scale, THUMB_QUALITY)
    .then((thumb) => thumb.blob)
    .catch(() => null);
}

function fileToStored(file) {
  const keepOriginal = file.type === 'image/gif' || file.type === 'image/svg+xml';
  return measureImage(file).then((size) => {
    const tooBig = Math.max(size.width, size.height) > MAX_EDGE || file.size > MAX_BYTES;
    const full =
      keepOriginal || !tooBig
        ? Promise.resolve({ blob: file, width: size.width, height: size.height })
        : compressImage(file, size.width, size.height);
    return Promise.all([full, makeThumb(file, size.width, size.height, keepOriginal)]).then(
      ([stored, thumbBlob]) => Object.assign(stored, { thumbBlob }),
    );
  });
}

function extForBlob(blob) {
  const type = (blob && blob.type) || 'image/png';
  if (type === 'image/jpeg') return 'jpg';
  if (type === 'image/svg+xml') return 'svg';
  const part = type.split('/')[1] || 'png';
  return part.split('+')[0];
}

function docToItem(id, data) {
  const created = data.createdAt;
  // Prefer the client-side createdAtMs: serverTimestamp() reflects save order, which
  // reverses a batch (its first drawing is saved first but should sort on top).
  let createdAt = 0;
  if (typeof data.createdAtMs === 'number') createdAt = data.createdAtMs;
  else if (created && typeof created.toMillis === 'function') createdAt = created.toMillis();
  else if (typeof created === 'number') createdAt = created;

  return {
    id,
    title: data.title || 'Drawing',
    details: data.details || '',
    createdAt,
    url: data.url,
    storagePath: data.storagePath || '',
    thumbUrl: data.thumbUrl || '',
    thumbPath: data.thumbPath || '',
    width: data.width || 0,
    height: data.height || 0,
  };
}

async function loadDrawings() {
  const q = query(collection(db, 'drawings'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  items = snap.docs.map((d) => docToItem(d.id, d.data()));
  items.sort((a, b) => b.createdAt - a.createdAt);
}

function render() {
  const n = items.length;
  syncThumbsButton();
  // Auth can resolve before the drawings do; don't flash "No drawings yet." under the loader.
  if (!loaded) {
    empty.hidden = true;
    grid.hidden = true;
    return;
  }
  empty.textContent = isAuthed()
    ? 'Drop or paste a drawing, or add one above.'
    : n
      ? ''
      : 'No drawings yet.';
  grid.replaceChildren();

  if (!n) {
    empty.hidden = false;
    grid.hidden = true;
    return;
  }

  empty.hidden = true;
  grid.hidden = false;

  const canManage = isAuthed();
  items.forEach((item) => {
    const title = item.title || 'Drawing';
    const card = document.createElement('article');
    card.className = 'ill-item';
    card.dataset.id = item.id;

    const openBtn = document.createElement('button');
    openBtn.type = 'button';
    openBtn.className = 'ill-item-open';
    openBtn.setAttribute('aria-label', title);

    const img = document.createElement('img');
    const src = item.thumbUrl || item.url;
    // loading must be set before src, or the browser may start fetching eagerly.
    img.loading = 'lazy';
    img.decoding = 'async';
    img.alt = title;
    img.draggable = false;
    if (item.width) img.width = item.width;
    if (item.height) img.height = item.height;
    if (revealedSrcs.has(src)) {
      img.classList.add('is-loaded');
    } else {
      img.addEventListener('load', () => revealImage(img, src), { once: true });
      img.addEventListener('error', () => img.classList.add('is-loaded'), { once: true });
    }
    img.src = src;

    const overlay = document.createElement('span');
    overlay.className = 'ill-item-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    const name = document.createElement('span');
    name.className = 'ill-item-name';
    name.textContent = title;

    overlay.appendChild(name);
    openBtn.appendChild(img);
    openBtn.appendChild(overlay);
    openBtn.addEventListener('click', () => openViewer(item.id, img));
    card.appendChild(openBtn);

    if (canManage) {
      const actions = document.createElement('div');
      actions.className = 'ill-item-actions';

      const edit = document.createElement('button');
      edit.type = 'button';
      edit.className = 'ill-item-action';
      edit.setAttribute('aria-label', 'Edit ' + title);
      edit.innerHTML = '<i class="ph ph-pencil-simple" aria-hidden="true"></i>';
      edit.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openEditorForItem(item);
      });
      actions.appendChild(edit);

      const trash = document.createElement('button');
      trash.type = 'button';
      trash.className = 'ill-item-action';
      trash.setAttribute('aria-label', 'Delete ' + title);
      trash.innerHTML = '<i class="ph ph-trash" aria-hidden="true"></i>';
      trash.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        confirmRemoveDrawing(item);
      });
      actions.appendChild(trash);

      card.appendChild(actions);
    }

    grid.appendChild(card);
  });
}

// Fades each image in once it has loaded and decoded. Images that land together are
// staggered so a screenful arrives as a ripple rather than all at once.
function revealImage(img, src) {
  img
    .decode()
    .catch(() => {})
    .then(() => {
      revealedSrcs.add(src);
      const now = performance.now();
      nextRevealAt = Math.max(nextRevealAt, now);
      const delay = Math.min(nextRevealAt - now, REVEAL_MAX_DELAY_MS);
      nextRevealAt += REVEAL_STAGGER_MS;
      if (delay) img.style.transitionDelay = delay + 'ms';
      img.addEventListener('transitionend', () => img.style.removeProperty('transition-delay'), {
        once: true,
      });
      requestAnimationFrame(() => img.classList.add('is-loaded'));
    });
}

function showViewer(index) {
  if (!items.length) {
    if (viewer.open) viewer.close();
    return;
  }
  viewerIndex = (index + items.length) % items.length;
  const item = items[viewerIndex];
  const title = item.title || 'Drawing';
  // Size the image box from the stored dimensions so its final rect is known before the
  // full image loads. Show the cached thumbnail first, then swap in the full image.
  if (item.width && item.height) {
    viewerImg.style.setProperty('--ratio', item.width / item.height);
    viewerImg.style.setProperty('--w', item.width + 'px');
  } else {
    viewerImg.style.removeProperty('--ratio');
    viewerImg.style.removeProperty('--w');
  }
  viewerImg.src = item.thumbUrl || item.url;
  if (item.thumbUrl) {
    const full = new Image();
    full.onload = () => {
      if (viewer.open && items[viewerIndex] === item) viewerImg.src = item.url;
    };
    full.src = item.url;
  }
  viewerImg.alt = title;
  viewerTitle.textContent = title;
  viewerDetails.textContent = item.details || '';
  viewer.setAttribute('aria-label', title);
  viewerEdit.hidden = !isAuthed();
  viewerEdit.setAttribute('aria-label', 'Edit ' + title);
  viewerPrev.disabled = items.length < 2;
  viewerNext.disabled = items.length < 2;
  viewerPrev.hidden = items.length < 2;
  viewerNext.hidden = items.length < 2;
  viewerRemove.hidden = !isAuthed();
  viewerRemove.setAttribute('aria-label', 'Delete ' + title);

  const url = new URL(location.href);
  url.searchParams.set('d', item.id);
  history.replaceState(null, '', url.pathname + url.search);

  const next = items[viewerIndex + 1];
  const prev = items[viewerIndex - 1];
  if (next) {
    const preloadNext = new Image();
    preloadNext.src = next.url;
  }
  if (prev) {
    const preloadPrev = new Image();
    preloadPrev.src = prev.url;
  }
}

function openViewer(id, fromImg) {
  const index = items.findIndex((item) => item.id === id);
  if (index < 0) return;
  showViewer(index);
  if (viewer.open) return;
  viewer.showModal();
  document.getElementById('ill-viewer-close').focus();
  animateViewer(true, fromImg).catch(() => {});
}

function closeViewer() {
  if (!viewer.open || viewerClosing) return;
  viewerClosing = true;
  const item = items[viewerIndex];
  animateViewer(false, item && cardImage(item.id))
    .catch(() => {})
    .then(() => {
      viewerClosing = false;
      viewer.close();
    });
}

function cardImage(id) {
  return grid.querySelector('.ill-item[data-id="' + CSS.escape(id) + '"] img');
}

function stopViewerAnims() {
  viewerAnims.forEach((anim) => anim.cancel());
  viewerAnims = [];
}

// Grows the viewer image out of its grid card (or back into it), like the site lightbox.
// Falls back to a fade when the card is off screen, e.g. after stepping or a ?d= link.
function animateViewer(opening, fromImg) {
  stopViewerAnims();
  if (reduceMotion.matches) return Promise.resolve();

  const target = viewerImg.getBoundingClientRect();
  const from = fromImg && fromImg.getBoundingClientRect();
  const onScreen = from && from.width > 0 && from.bottom > 0 && from.top < window.innerHeight;
  const rest = { transform: 'none', borderRadius: '0px', opacity: 1 };
  let card = { opacity: 0 };
  if (onScreen && target.width) {
    const scale = from.width / target.width;
    card = {
      transform: `translate(${from.left - target.left}px, ${from.top - target.top}px) scale(${scale})`,
      borderRadius: 8 / scale + 'px',
      opacity: 1,
    };
  }

  const fill = opening ? 'backwards' : 'forwards';
  const chrome = [viewerTitle, viewerDetails, viewer.querySelector('.ill-viewer-tools'), viewerPrev, viewerNext];
  const image = viewerImg.animate(opening ? [card, rest] : [rest, card], {
    duration: card.transform ? LIGHTBOX_MS : 250,
    easing: card.transform ? LIGHTBOX_EASE : 'ease',
    fill,
  });
  viewerAnims = [
    image,
    viewer.animate(
      { opacity: opening ? [0, 1] : [1, 0] },
      { duration: 350, easing: 'ease', fill, pseudoElement: '::backdrop' },
    ),
    ...chrome.map((el) =>
      el.animate(
        { opacity: opening ? [0, 1] : [1, 0] },
        opening
          ? { duration: 200, delay: LIGHTBOX_MS - 200, easing: 'ease', fill }
          : { duration: 150, easing: 'ease', fill },
      ),
    ),
  ];
  return image.finished;
}

function stepViewer(delta) {
  if (viewerIndex < 0 || items.length < 2) return;
  showViewer(viewerIndex + delta);
}

function clearDrawingParam() {
  const url = new URL(location.href);
  if (!url.searchParams.has('d')) return;
  url.searchParams.delete('d');
  const next = url.pathname + (url.searchParams.toString() ? '?' + url.searchParams.toString() : '');
  history.replaceState(null, '', next);
}

function addFiles(fileList) {
  if (!isAuthed()) return;
  const incoming = Array.prototype.slice.call(fileList);
  const images = incoming.filter((file) => file.type && file.type.indexOf('image/') === 0);
  const skipped = incoming.length - images.length;
  if (!images.length) {
    setStatus('Choose an image file.');
    return;
  }
  if (skipped) setStatus('Skipped files that weren’t images.');

  addBtn.disabled = true;
  let failed = false;
  const batchStart = Date.now();
  const drafts = [];
  let chain = Promise.resolve();
  images.forEach((file, index) => {
    chain = chain.then(() =>
      fileToStored(file)
        .then((stored) => {
          drafts.push({
            id: newId(),
            title: titleFromName(file.name),
            details: '',
            createdAt: batchStart + (images.length - index),
            blob: stored.blob,
            thumbBlob: stored.thumbBlob,
            width: stored.width,
            height: stored.height,
            previewUrl: URL.createObjectURL(stored.blob),
          });
        })
        .catch(() => {
          failed = true;
        }),
    );
  });

  chain.then(() => {
    addBtn.disabled = false;
    if (!drafts.length) {
      setStatus('Couldn’t add that drawing.');
      return;
    }
    if (failed) setStatus('Skipped a file that couldn’t be read.');
    editorQueue = editorQueue.concat(drafts);
    editorTotal += drafts.length;
    if (!editor.open) {
      editorMode = 'create';
      editor.showModal();
    }
    if (!editorCurrent) showNextDraft();
    else updateEditorStep();
  });
}

function setEditorError(message) {
  editorError.textContent = message || '';
  if (message) editorName.setAttribute('aria-invalid', 'true');
  else editorName.removeAttribute('aria-invalid');
}

function updateEditorStep() {
  const many = editorMode === 'create' && editorTotal > 1;
  editorStep.hidden = !many;
  editorStep.textContent = many ? editorShown + ' of ' + editorTotal : '';
}

function fillEditor(title, details, imageUrl, alt) {
  editorName.value = title || '';
  editorDetails.value = details || '';
  editorImg.src = imageUrl;
  editorImg.alt = alt || title || 'Drawing';
  setEditorError('');
}

function showNextDraft() {
  const draft = editorQueue.shift();
  if (!draft) {
    editorCurrent = null;
    if (editor.open) editor.close();
    return;
  }
  editorMode = 'create';
  editorCurrent = draft;
  editorShown += 1;
  editorHeading.textContent = 'Add drawing';
  editorSave.textContent = 'Add drawing';
  editorSkip.hidden = false;
  editorSkip.textContent = "Don't add";
  fillEditor(draft.title, '', draft.previewUrl, draft.title);
  updateEditorStep();
  editorName.focus();
  editorName.select();
}

function openEditorForItem(item) {
  if (!item || !isAuthed()) return;
  editorMode = 'edit';
  editorCurrent = { item };
  editorHeading.textContent = 'Edit drawing';
  editorSave.textContent = 'Save';
  editorSkip.hidden = false;
  editorSkip.textContent = 'Cancel';
  editorStep.hidden = true;
  fillEditor(item.title, item.details, item.url, item.title);
  if (!editor.open) editor.showModal();
  editorName.focus();
  editorName.select();
}

function discardDraft(draft) {
  if (draft && draft.previewUrl) URL.revokeObjectURL(draft.previewUrl);
}

function rememberOpenDrawing() {
  if (!viewer.open || viewerIndex < 0 || !items[viewerIndex]) return null;
  return items[viewerIndex].id;
}

function restoreOpenDrawing(id) {
  if (!id) return;
  const index = items.findIndex((item) => item.id === id);
  if (index >= 0) showViewer(index);
}

function readEditorFields() {
  const title = editorName.value.replace(/\s+/g, ' ').trim();
  const details = editorDetails.value.replace(/[ \t]+\n/g, '\n').trim();
  if (!title) {
    setEditorError('Add a name.');
    editorName.focus();
    return null;
  }
  return { title, details };
}

async function saveEditor(event) {
  event.preventDefault();
  const fields = readEditorFields();
  if (!fields || !editorCurrent) return;

  editorSave.disabled = true;
  const openId = rememberOpenDrawing();

  try {
    if (editorMode === 'edit') {
      const item = editorCurrent.item;
      await updateDoc(doc(db, 'drawings', item.id), {
        title: fields.title,
        details: fields.details,
      });
      item.title = fields.title;
      item.details = fields.details;
      render();
      restoreOpenDrawing(openId);
      editor.close();
      return;
    }

    const draft = editorCurrent;
    const ext = extForBlob(draft.blob);
    const path = `drawings/${draft.id}.${ext}`;
    const fileRef = storageRef(storage, path);
    await uploadBytes(fileRef, draft.blob, {
      contentType: draft.blob.type || 'image/png',
      cacheControl: 'public,max-age=31536000',
    });
    const url = await getDownloadURL(fileRef);
    const thumb = await uploadThumb(draft);
    await setDoc(doc(db, 'drawings', draft.id), {
      title: fields.title,
      details: fields.details,
      createdAt: serverTimestamp(),
      createdAtMs: draft.createdAt,
      storagePath: path,
      url,
      thumbPath: thumb.path,
      thumbUrl: thumb.url,
      width: draft.width,
      height: draft.height,
    });

    discardDraft(draft);
    editorCurrent = null;
    items.unshift({
      id: draft.id,
      title: fields.title,
      details: fields.details,
      createdAt: draft.createdAt,
      url,
      storagePath: path,
      thumbUrl: thumb.url,
      thumbPath: thumb.path,
      width: draft.width,
      height: draft.height,
    });
    items.sort((a, b) => b.createdAt - a.createdAt);
    render();
    restoreOpenDrawing(openId);
    showNextDraft();
  } catch (err) {
    console.error(err);
    if (err && err.code === 'storage/unauthorized') {
      setEditorError('You don’t have permission to upload.');
    } else if (err && err.code === 'storage/canceled') {
      setEditorError('Upload canceled.');
    } else {
      setEditorError('Couldn’t save that drawing.');
    }
  } finally {
    editorSave.disabled = false;
  }
}

// A failed thumbnail upload isn't fatal: the grid falls back to the full image.
async function uploadThumb(draft) {
  if (!draft.thumbBlob) return { path: '', url: '' };
  const path = `drawings/${draft.id}-thumb.${extForBlob(draft.thumbBlob)}`;
  const fileRef = storageRef(storage, path);
  try {
    await uploadBytes(fileRef, draft.thumbBlob, {
      contentType: draft.thumbBlob.type,
      cacheControl: 'public,max-age=31536000',
    });
    return { path, url: await getDownloadURL(fileRef) };
  } catch (err) {
    console.error(err);
    return { path: '', url: '' };
  }
}

// Drawings uploaded before thumbnails existed. Width 0 means unknown, so try it.
function needsThumb(item) {
  if (item.thumbUrl || !item.storagePath) return false;
  if (/\.(gif|svg)$/i.test(item.storagePath)) return false;
  return !item.width || item.width > THUMB_WIDTH;
}

function syncThumbsButton() {
  const missing = items.filter(needsThumb).length;
  thumbsBtn.hidden = !isAuthed() || (!missing && !thumbsRunning);
  thumbsBtn.disabled = thumbsRunning;
  if (!thumbsRunning) thumbsBtn.textContent = 'Make thumbnails (' + missing + ')';
}

// One-time backfill. Reading the originals back into a canvas needs the bucket's CORS
// to allow this origin (see storage-cors.json).
async function backfillThumbs() {
  if (!isAuthed() || thumbsRunning) return;
  const todo = items.filter(needsThumb);
  if (!todo.length) return;
  thumbsRunning = true;
  let done = 0;
  let failed = 0;
  for (const item of todo) {
    thumbsBtn.textContent = 'Making thumbnails… ' + (done + failed + 1) + ' of ' + todo.length;
    thumbsBtn.disabled = true;
    let blob;
    try {
      const res = await fetch(item.url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      blob = await res.blob();
    } catch (err) {
      console.error(err);
      thumbsRunning = false;
      syncThumbsButton();
      setStatus('Couldn’t read drawings from Storage. Check the bucket’s CORS setting.', true);
      return;
    }
    try {
      const size = await measureImage(blob);
      const thumbBlob = await makeThumb(blob, size.width, size.height, false);
      if (!thumbBlob) throw new Error('no thumbnail');
      const thumb = await uploadThumb({ id: item.id, thumbBlob });
      if (!thumb.url) throw new Error('upload failed');
      await updateDoc(doc(db, 'drawings', item.id), { thumbPath: thumb.path, thumbUrl: thumb.url });
      item.thumbPath = thumb.path;
      item.thumbUrl = thumb.url;
      done += 1;
    } catch (err) {
      console.error(err);
      failed += 1;
    }
  }
  thumbsRunning = false;
  render();
  setStatus(
    failed
      ? 'Made ' + done + ' thumbnails. ' + failed + ' failed; see the console.'
      : 'Made ' + done + ' thumbnails.',
    !!failed,
  );
}

function skipDraft() {
  discardDraft(editorCurrent);
  editorCurrent = null;
  showNextDraft();
}

function abandonEditorQueue() {
  const mode = editorMode;
  if (mode === 'create') {
    discardDraft(editorCurrent);
    editorQueue.forEach(discardDraft);
    editorQueue = [];
    editorShown = 0;
    editorTotal = 0;
  }
  const resume = mode === 'edit' && editorQueue.length > 0 && isAuthed();
  editorCurrent = null;
  editorMode = null;
  setEditorError('');
  if (!resume) return;
  window.setTimeout(() => {
    editorShown = 0;
    editorTotal = editorQueue.length;
    editorMode = 'create';
    editor.showModal();
    showNextDraft();
  }, 0);
}

let confirmResolver = null;

function askConfirm(options) {
  const opts = options || {};
  if (confirmResolver) {
    const pending = confirmResolver;
    confirmResolver = null;
    pending(false);
  }
  confirmHeading.textContent = opts.title || 'Are you sure?';
  confirmMessage.textContent = opts.message || '';
  confirmOk.textContent = opts.confirmLabel || 'Confirm';
  return new Promise((resolve) => {
    confirmResolver = resolve;
    confirmDialog.returnValue = '';
    if (!confirmDialog.open) confirmDialog.showModal();
    confirmOk.focus();
  });
}

function confirmRemoveDrawing(item) {
  if (!item) return;
  const label = item.title || 'this drawing';
  askConfirm({
    title: 'Remove drawing?',
    message: 'Remove “' + label + '”? This can’t be undone.',
    confirmLabel: 'Remove',
  }).then((ok) => {
    if (ok) removeDrawing(item.id);
  });
}

async function removeDrawing(id) {
  if (!isAuthed()) return;
  const index = items.findIndex((entry) => entry.id === id);
  if (index < 0) return;
  const item = items[index];

  try {
    // Doc first: if the file delete then fails, it's an orphaned file rather than a broken card.
    await deleteDoc(doc(db, 'drawings', item.id));
    [item.storagePath, item.thumbPath].forEach((path) => {
      if (path) deleteObject(storageRef(storage, path)).catch((err) => console.error(err));
    });
    const wasOpen = viewer.open && viewerIndex === index;
    items = items.filter((entry) => entry.id !== item.id);
    render();
    if (!viewer.open) return;
    if (!items.length) {
      viewer.close();
      return;
    }
    if (wasOpen) showViewer(Math.min(index, items.length - 1));
    else if (viewerIndex > index) showViewer(viewerIndex - 1);
  } catch (err) {
    console.error(err);
    setStatus('Couldn’t remove that drawing.');
  }
}

function hasFiles(e) {
  if (!e.dataTransfer || !e.dataTransfer.types) return false;
  return Array.prototype.indexOf.call(e.dataTransfer.types, 'Files') !== -1;
}

function imagesFromClipboard(data) {
  if (!data) return [];
  const found = [];

  function push(file) {
    if (!file || !file.type || file.type.indexOf('image/') !== 0) return;
    found.push(namePastedFile(file));
  }

  if (data.files && data.files.length) {
    Array.prototype.forEach.call(data.files, push);
  }
  if (!found.length && data.items) {
    Array.prototype.forEach.call(data.items, (item) => {
      if (item.kind !== 'file') return;
      push(item.getAsFile());
    });
  }
  return found;
}

function namePastedFile(file) {
  const generic = !file.name || /^(image|clipboard)(\.[a-z0-9]+)?$/i.test(file.name);
  if (!generic) return file;
  let ext = ((file.type || 'image/png').split('/')[1] || 'png').split('+')[0];
  if (ext === 'jpeg') ext = 'jpg';
  try {
    return new File([file], 'Pasted drawing.' + ext, { type: file.type, lastModified: Date.now() });
  } catch (err) {
    return file;
  }
}

addBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', () => {
  if (fileInput.files && fileInput.files.length) addFiles(fileInput.files);
  fileInput.value = '';
});

signInBtn.addEventListener('click', openLogin);

function dismissLogin() {
  closeLogin();
  signInBtn.focus();
}

loginCancel.addEventListener('click', dismissLogin);
loginClose.addEventListener('click', dismissLogin);

loginDialog.addEventListener('cancel', (e) => {
  e.preventDefault();
  dismissLogin();
});

loginDialog.addEventListener('click', (e) => {
  if (e.target === loginDialog) dismissLogin();
});

passwordInput.addEventListener('input', clearLoginError);
emailInput.addEventListener('input', clearLoginError);

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  if (!email || !password) return;
  loginSubmit.disabled = true;
  clearLoginError();
  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      closeLogin();
      setStatus('');
      addBtn.focus();
    })
    .catch((err) => {
      passwordInput.setAttribute('aria-invalid', 'true');
      loginError.textContent = authErrorMessage(err);
      passwordInput.select();
    })
    .finally(() => {
      loginSubmit.disabled = false;
    });
});

thumbsBtn.addEventListener('click', backfillThumbs);

signOutBtn.addEventListener('click', () => {
  signOut(auth).catch(() => setStatus('Couldn’t sign out.'));
});

confirmDialog.addEventListener('close', () => {
  const resolve = confirmResolver;
  confirmResolver = null;
  if (resolve) resolve(confirmDialog.returnValue === 'confirm');
});

confirmDialog.addEventListener('click', (e) => {
  if (e.target === confirmDialog) confirmDialog.close('cancel');
});

viewerEdit.addEventListener('click', () => openEditorForItem(items[viewerIndex]));

editorForm.addEventListener('submit', saveEditor);

editorSkip.addEventListener('click', () => {
  if (editorMode === 'edit') {
    editor.close();
    return;
  }
  skipDraft();
});

document.getElementById('ill-editor-close').addEventListener('click', () => editor.close());

editor.addEventListener('click', (e) => {
  if (e.target === editor) editor.close();
});

editor.addEventListener('close', abandonEditorQueue);

editorName.addEventListener('input', () => {
  if (editorName.value.trim()) setEditorError('');
});

viewerRemove.addEventListener('click', () => confirmRemoveDrawing(items[viewerIndex]));

document.getElementById('ill-viewer-close').addEventListener('click', closeViewer);

viewerPrev.addEventListener('click', () => stepViewer(-1));
viewerNext.addEventListener('click', () => stepViewer(1));

viewer.addEventListener('cancel', (e) => {
  e.preventDefault();
  closeViewer();
});

viewer.addEventListener('close', () => {
  stopViewerAnims();
  viewerClosing = false;
  viewerIndex = -1;
  viewerImg.removeAttribute('src');
  clearDrawingParam();
});

viewer.addEventListener('click', (e) => {
  if (e.target === viewer || e.target.classList.contains('ill-viewer-stage')) {
    closeViewer();
  }
});

viewer.addEventListener('keydown', (e) => {
  if (viewerClosing) return;
  if (e.key === 'ArrowRight') {
    e.preventDefault();
    stepViewer(1);
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    stepViewer(-1);
  }
});

window.addEventListener('dragenter', (e) => {
  if (!isAuthed() || !hasFiles(e)) return;
  e.preventDefault();
  dragDepth += 1;
  drop.classList.add('is-on');
});

window.addEventListener('dragover', (e) => {
  if (!hasFiles(e)) return;
  e.preventDefault();
});

window.addEventListener('dragleave', () => {
  dragDepth = Math.max(0, dragDepth - 1);
  if (dragDepth === 0) drop.classList.remove('is-on');
});

window.addEventListener('drop', (e) => {
  if (!e.dataTransfer || !e.dataTransfer.files || !e.dataTransfer.files.length) return;
  e.preventDefault();
  dragDepth = 0;
  drop.classList.remove('is-on');
  if (!isAuthed()) return;
  addFiles(e.dataTransfer.files);
});

window.addEventListener('paste', (e) => {
  const target = e.target;
  if (target && target.closest && target.closest('input, textarea, [contenteditable="true"]')) return;
  if (!isAuthed()) return;
  const files = imagesFromClipboard(e.clipboardData);
  if (!files.length) return;
  e.preventDefault();
  addFiles(files);
});

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  syncAuth();
});

loadDrawings()
  .then(() => {
    loaded = true;
    loadingEl.hidden = true;
    render();
    main.removeAttribute('aria-busy');
    const openId = new URLSearchParams(location.search).get('d');
    if (openId) openViewer(openId);
  })
  .catch((err) => {
    console.error(err);
    loaded = true;
    loadingEl.hidden = true;
    main.removeAttribute('aria-busy');
    empty.hidden = false;
    empty.textContent = 'Couldn’t load drawings.';
    setStatus('Couldn’t load drawings.', true);
  });
