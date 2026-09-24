const zone = document.getElementById('upload-zone');
const fileInput = document.getElementById('file-input');
const previewImg = document.getElementById('preview-img');
const upNowBtn = document.getElementById('up-now-btn');
const modalBackdrop = document.getElementById('modal-backdrop');
const modalOkBtn = document.getElementById('modal-ok-btn');
const statusLine = document.getElementById('status-line');
const resultPanel = document.getElementById('result-panel');
const resultImg = document.getElementById('result-img');
const downloadNowBtn = document.getElementById('download-now');
const hdProgress = document.getElementById('hd-progress');
const hdProgressStatusText = document.getElementById('hd-progress-status-text');
const hdProgressFill = document.getElementById('hd-progress-fill');
const hdProgressBadge = document.getElementById('hd-progress-badge');

let selectedFile = null;

zone.addEventListener('click', () => fileInput.click());
zone.addEventListener('keydown', (e) => {
  if(e.key === 'Enter' || e.key === ' ') fileInput.click();
});

fileInput.addEventListener('change', (e) => {
  if(e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
});

['dragover','dragenter'].forEach(evt => {
  zone.addEventListener(evt, (e) => {
    e.preventDefault();
    zone.classList.add('dragover');
  });
});
['dragleave','dragend'].forEach(evt => {
  zone.addEventListener(evt, () => zone.classList.remove('dragover'));
});
zone.addEventListener('drop', (e) => {
  e.preventDefault();
  zone.classList.remove('dragover');
  if(e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
});

function handleFile(file){
  if(!file.type.startsWith('image/')) return;
  selectedFile = file;
  const reader = new FileReader();
  reader.onload = (ev) => {
    previewImg.src = ev.target.result;
    zone.classList.add('has-image');
  };
  reader.readAsDataURL(file);
}

function openModal(){
  modalBackdrop.classList.add('open');
}
function closeModal(){
  modalBackdrop.classList.remove('open');
}
modalOkBtn.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', (e) => {
  if(e.target === modalBackdrop) closeModal();
});

// --- Liquid Glass interaction: cursor-tracked highlight + subtle 3D tilt ---
let pressed = false;
function tiltFromEvent(e){
  if(upNowBtn.disabled) return;
  const rect = upNowBtn.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  upNowBtn.style.setProperty('--mx', x + 'px');
  upNowBtn.style.setProperty('--my', y + 'px');
  const midX = rect.width / 2, midY = rect.height / 2;
  const rotateY = ((x - midX) / midX) * 9;
  const rotateX = -((y - midY) / midY) * 9;
  const scale = pressed ? 0.97 : 1.015;
  upNowBtn.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
}
upNowBtn.addEventListener('mousemove', tiltFromEvent);
upNowBtn.addEventListener('mousedown', (e) => { pressed = true; tiltFromEvent(e); });
window.addEventListener('mouseup', () => { pressed = false; });
upNowBtn.addEventListener('mouseleave', () => {
  upNowBtn.style.transform = '';
});

// ================================================================
// KONFIGURASI API
// ================================================================
const CONFIG = {
  // Tiap versi punya nama parameter query yang beda-beda (kebukti dari hasil tes):
  // V1 & V2 pakai "url", V3 pakai "image".
  HD_ENDPOINTS: {
    v1: { url: "https://api-faa.my.id/faa/superhd", param: "url" },
    v2: { url: "https://api-faa.my.id/faa/hdv2", param: "url" },
    v3: { url: "https://api-faa.my.id/faa/hdv3", param: "image" }
  },
  // Kalau API HD butuh API key, isi di sini. Kalau nggak butuh, biarin kosong.
  HD_API_KEY: "",

  // API key gratis buat ImgBB (dipakai buat ubah "Foto -> Link Foto").
  // Catbox diganti ke ImgBB karena Catbox memblokir CORS dari browser (nggak bisa
  // dipanggil langsung dari JavaScript web, cuma bisa dari server/aplikasi).
  // Cara ambil key (gratis, ~1 menit):
  // 1. Buka https://api.imgbb.com/
  // 2. Login/daftar (bisa pakai Google)
  // 3. Klik "Get API Key", copy key-nya, taruh di bawah ini.
  IMGBB_API_KEY: "a4cc6806a9fc3bd30daf5dc3462aa8f6"
};

let selectedVersion = "v1";
const versionSwitch = document.getElementById('version-switch');
const versionThumb = document.getElementById('version-thumb');

function moveThumbTo(btn){
  const switchRect = versionSwitch.getBoundingClientRect();
  const btnRect = btn.getBoundingClientRect();
  versionThumb.style.width = btnRect.width + 'px';
  versionThumb.style.transform = `translateX(${btnRect.left - switchRect.left}px)`;
}

versionSwitch.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-version]');
  if(!btn) return;
  selectedVersion = btn.dataset.version;
  versionSwitch.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === btn));
  moveThumbTo(btn);
});

// posisikan thumb ke tombol aktif langsung saat render, lalu re-check setelah semua
// resource (termasuk font) kelar dimuat biar ukurannya presisi, dan saat resize.
moveThumbTo(versionSwitch.querySelector('button.active'));
window.addEventListener('load', () => moveThumbTo(versionSwitch.querySelector('button.active')));
window.addEventListener('resize', () => moveThumbTo(versionSwitch.querySelector('button.active')));
if(document.fonts && document.fonts.ready){
  document.fonts.ready.then(() => moveThumbTo(versionSwitch.querySelector('button.active')));
}

// Ubah foto lokal jadi LINK publik dulu (step "Foto -> Link Foto") lewat ImgBB,
// karena API HD butuh link, bukan file, dan ImgBB memang mendukung dipanggil
// langsung dari browser (beda sama Catbox yang blokir CORS).
async function uploadFileToGetLink(file){
  if(!CONFIG.IMGBB_API_KEY || CONFIG.IMGBB_API_KEY.startsWith("GANTI_")){
    throw new Error("API key ImgBB belum diisi di CONFIG.IMGBB_API_KEY.");
  }
  const form = new FormData();
  form.append("image", file);
  const res = await fetch(`https://api.imgbb.com/1/upload?key=${CONFIG.IMGBB_API_KEY}`, {
    method: "POST",
    body: form
  });
  if(!res.ok) throw new Error("Gagal upload foto ke ImgBB.");
  const data = await res.json();
  const link = data?.data?.url;
  if(!link) throw new Error("ImgBB tidak balikin link foto yang valid.");
  return link;
}

// Kirim link foto ke API HD (V1/V2/V3), balikin link/blob foto HD hasil proses.
// CATATAN: nama parameter query beda per versi — V1/V2 pakai "url", V3 pakai "image".
// Contoh yang berhasil:
//   V1: https://api-faa.my.id/faa/superhd?url=<link_encoded>  -> JSON {status, creator, result}
//   V2: https://api-faa.my.id/faa/hdv2?url=<link_encoded>     -> JSON {status, creator, result}
//   V3: https://api-faa.my.id/faa/hdv3?image=<link_encoded>   -> foto langsung (binary)
async function processHdFromLink(photoLink){
  const endpoint = CONFIG.HD_ENDPOINTS[selectedVersion];
  const reqUrl = `${endpoint.url}?${endpoint.param}=${encodeURIComponent(photoLink)}`;
  const headers = {};
  if(CONFIG.HD_API_KEY) headers["Authorization"] = "Bearer " + CONFIG.HD_API_KEY;

  const res = await fetch(reqUrl, { method: "GET", headers });
  if(!res.ok) throw new Error(`API HD (${selectedVersion.toUpperCase()}) gagal memproses foto.`);

  const contentType = res.headers.get("content-type") || "";

  if(contentType.includes("application/json")){
    const data = await res.json();
    const hdLink =
      data.result || data.url || data.data?.url || data.hasil || data.output || data.image;
    if(!hdLink) throw new Error("Response API HD tidak ketemu link hasilnya. Cek format JSON-nya.");
    return hdLink;
  }

  if(contentType.startsWith("image/")){
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  }

  // fallback: coba parse sebagai JSON manual kalau content-type-nya nggak jelas
  const text = await res.text();
  try{
    const data = JSON.parse(text);
    const hdLink =
      data.result || data.url || data.data?.url || data.hasil || data.output || data.image;
    if(hdLink) return hdLink;
  }catch(_e){ /* bukan JSON, abaikan */ }

  throw new Error("Format response API HD nggak dikenali, perlu disesuaikan manual.");
}
// ================================================================

function setStatus(text, isError){
  statusLine.textContent = text || "";
  statusLine.classList.toggle("error", !!isError);
}

// ================================================================
// PROGRESS BAR — "Menunggu Running" -> "Memproses ... %" -> selesai
// CATATAN: api-faa.my.id itu satu kali request doang, nggak ngasih tau
// progress asli, jadi persennya di sini disimulasiin (naik pelan-pelan,
// nanggung di ~92% sambil nunggu API-nya beneran selesai, baru loncat
// ke 100% pas hasilnya dapet). Begitu bot Node.js/Telegram yang ngasih
// progress asli udah jadi, tinggal ganti bagian simulasi ini jadi baca
// angka progress beneran dari situ.
// ================================================================
let progressTimer = null;
let currentPercent = 0;

function setProgressPercent(p){
  currentPercent = Math.max(0, Math.min(100, p));
  hdProgressFill.style.width = currentPercent + '%';
  hdProgressBadge.style.left = currentPercent + '%';
  hdProgressBadge.textContent = Math.round(currentPercent) + '%';
}

function showProgressWaiting(){
  hdProgress.hidden = false;
  hdProgress.classList.remove('state-running', 'state-done');
  hdProgress.classList.add('state-waiting');
  hdProgressStatusText.textContent = 'Menunggu Running';
  setProgressPercent(0);
}

function showProgressRunning(){
  hdProgress.classList.remove('state-waiting');
  hdProgress.classList.add('state-running');
  hdProgressStatusText.textContent = 'Memproses Foto untuk Di HD';
  setProgressPercent(2);

  clearInterval(progressTimer);
  progressTimer = setInterval(() => {
    // makin deket 92%, makin pelan nambahnya — biar kerasa natural
    // dan nggak keburu penuh sebelum hasil aslinya beneran dapet.
    const remaining = 92 - currentPercent;
    const step = Math.max(0.4, remaining * 0.06);
    setProgressPercent(currentPercent + step);
  }, 180);
}

function finishProgress(){
  clearInterval(progressTimer);
  hdProgress.classList.remove('state-waiting', 'state-running');
  hdProgress.classList.add('state-done');
  hdProgressStatusText.textContent = 'Selesai!';
  setProgressPercent(100);
  setTimeout(() => { hdProgress.hidden = true; }, 900);
}

function stopProgress(){
  clearInterval(progressTimer);
  hdProgress.hidden = true;
  hdProgress.classList.remove('state-waiting', 'state-running', 'state-done');
}

upNowBtn.addEventListener('click', async () => {
  if(!selectedFile){
    openModal();
    return;
  }

  resultPanel.classList.remove('visible');
  upNowBtn.disabled = true;
  upNowBtn.classList.add('loading');
  setStatus("");
  showProgressWaiting();

  try{
    // 1) Foto -> Link Foto
    upNowBtn.dataset.loadingText = "Mengupload...";
    const photoLink = await uploadFileToGetLink(selectedFile);

    // 2) Link Foto -> Proses HD -> Link Foto HD
    upNowBtn.dataset.loadingText = "Memproses HD...";
    showProgressRunning();
    const hdLink = await processHdFromLink(photoLink);

    // 3) Tampilkan hasil + tombol Download Now
    finishProgress();
    resultImg.src = hdLink;
    downloadNowBtn.href = hdLink;
    resultPanel.classList.add('visible');

    upNowBtn.classList.remove('loading');
    upNowBtn.classList.add('done');
    setTimeout(() => {
      upNowBtn.classList.remove('done');
      upNowBtn.disabled = false;
    }, 1200);

  }catch(err){
    stopProgress();
    upNowBtn.classList.remove('loading');
    upNowBtn.disabled = false;
    setStatus(err.message || "Ada yang salah, coba lagi.", true);
  }
});
