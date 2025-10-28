const GRID = 4;
const TILE_SIZE = 100;
const CANVAS_SIZE = GRID * TILE_SIZE;

let map;
let marker;
let geoPermissionState = "prompt";
let hasLocated = false;

const mapEl = document.getElementById("map");
const canvas = document.getElementById("mapCanvas");
const ctx = canvas.getContext("2d");
const coordsEl = document.getElementById("coords");
const slotsEl = document.getElementById("slots");
const trayEl = document.getElementById("tray");
const locBtn = document.getElementById("locBtn");
const saveBtn = document.getElementById("saveBtn");
const clearBtn = document.getElementById("clearBtn");

function initMap() {
  map = L.map("map", { zoomControl: true }).setView([52.2297, 21.0122], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap",
    crossOrigin: true
  }).addTo(map);
}

function updateUI() {
  locBtn.disabled = (geoPermissionState === "denied");
  saveBtn.disabled = !hasLocated;
}

function buildSlots() {
  slotsEl.innerHTML = "";
  for (let i = 0; i < GRID * GRID; i++) {
    const slot = document.createElement("div");
    slot.className = "slot";
    slot.dataset.index = String(i);
    slot.addEventListener("dragover", (e) => e.preventDefault());
    slot.addEventListener("drop", onDropToSlot);
    slotsEl.appendChild(slot);
  }
}

function buildPiecesFromCanvas() {
  const dataURL = canvas.toDataURL("image/png");
  trayEl.innerHTML = "";
  const pieces = [];
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      const index = y * GRID + x;
      const piece = document.createElement("div");
      piece.className = "piece";
      piece.id = `piece-${index}`;
      piece.draggable = true;
      piece.dataset.index = String(index);
      piece.style.backgroundImage = `url(${dataURL})`;
      piece.style.backgroundPosition = `-${x * TILE_SIZE}px -${y * TILE_SIZE}px`;
      piece.style.backgroundSize = `${CANVAS_SIZE}px ${CANVAS_SIZE}px`;
      piece.addEventListener("dragstart", onDragStartPiece);
      pieces.push(piece);
    }
  }
  shuffle(pieces).forEach(p => trayEl.appendChild(p));
  trayEl.addEventListener("dragover", (e) => e.preventDefault());
  trayEl.addEventListener("drop", onDropToTray);
}

function onDragStartPiece(e) {
  const piece = e.target;
  if (!piece.classList.contains("piece")) return;
  e.dataTransfer.setData("text/plain", piece.id);
}

function onDropToSlot(e) {
  e.preventDefault();
  const target = e.currentTarget;
  const id = e.dataTransfer.getData("text/plain");
  const piece = document.getElementById(id);
  if (!piece) return;
  if (target.firstElementChild) {
    const existing = target.firstElementChild;
    const src = piece.parentElement;
    target.replaceChild(piece, existing);
    if (src) src.appendChild(existing);
  } else {
    target.appendChild(piece);
  }
  highlightCorrect();
  checkSolved();
}

function onDropToTray(e) {
  e.preventDefault();
  const id = e.dataTransfer.getData("text/plain");
  const piece = document.getElementById(id);
  if (!piece) return;
  trayEl.appendChild(piece);
  highlightCorrect();
}

function highlightCorrect() {
  const slots = Array.from(slotsEl.children);
  for (const s of slots) {
    const p = s.firstElementChild;
    const ok = p && p.dataset.index === s.dataset.index;
    s.classList.toggle("correct", !!ok);
  }
}

function checkSolved() {
  const slots = Array.from(slotsEl.children);
  const solved = slots.every(s => {
    const p = s.firstElementChild;
    return p && p.dataset.index === s.dataset.index;
  });
  if (solved){ console.log("[PUZZLE] Ułożono wszystkie 16 elementów"); notifyWin();}
}

function notifyWin() {
  const title = "Brawo! Ułożyłeś wszystkie puzzle";
  if ("Notification" in window) {
    if (Notification.permission === "granted") new Notification(title);
    else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(p => { if (p === "granted") new Notification(title); });
    }
  } else alert(title);
}

locBtn.addEventListener("click", () => {
  if (!navigator.geolocation) { alert("Brak Geolocation API"); return; }
  navigator.geolocation.getCurrentPosition((pos) => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    coordsEl.textContent = `Lat: ${lat.toFixed(5)}, Lng: ${lon.toFixed(5)}`;
    map.setView([lat, lon], 14);
    if (marker) marker.remove();
    marker = L.marker([lat, lon]).addTo(map).bindPopup("Tu jesteś!");
    hasLocated = true;
    updateUI();
  }, (err) => {
    hasLocated = false;
    updateUI();
    if (err && err.code === 1) alert("Odmowa dostępu do lokalizacji.");
    else alert("Nie udało się pobrać lokalizacji.");
  }, { enableHighAccuracy: true, timeout: 8000 });
});

saveBtn.addEventListener("click", async () => {
  if (!hasLocated) { alert("Najpierw pobierz lokalizację."); return; }
  try {
    const shot = await html2canvas(mapEl, { useCORS: true, backgroundColor: null });
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.drawImage(shot, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
    buildPiecesFromCanvas();
  } catch (e) { console.error(e); alert("Błąd przechwycenia mapy."); }
});

clearBtn.addEventListener("click", () => {
  trayEl.innerHTML = "";
  buildSlots();
  highlightCorrect();
});

function shuffle(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

window.addEventListener("load", () => {
  initMap();
  buildSlots();
  if (navigator.permissions && navigator.permissions.query) {
    navigator.permissions.query({ name: "geolocation" }).then((s) => {
      geoPermissionState = s.state;
      updateUI();
      s.onchange = () => { geoPermissionState = s.state; if (geoPermissionState !== "granted") hasLocated = false; updateUI(); };
    }).catch(() => updateUI());
  } else updateUI();
});