let currentViewer = null;
let autoRotateOn = true;
let floorplanVisible = true;

const scenes = window.SCENES || {};
const buttonsContainer = document.getElementById('scene-buttons');
const buttonMap = {};
const floorplanPinsContainer = document.getElementById('fp-pins');
const floorplanPins = {};
let errorOverlay = null;

function buildButtons() {
  const groups = {};
  Object.entries(scenes).forEach(([key, scene]) => {
    const g = scene.group || 'Other';
    if (!groups[g]) groups[g] = [];
    groups[g].push({ key, title: scene.title });
  });

  Object.entries(groups).forEach(([groupName, views]) => {
    if (views.length === 1) {
      const { key } = views[0];
      const b = document.createElement('button');
      b.className = 'px-4 py-2 text-white text-sm font-semibold hover:bg-black/60 transition-colors whitespace-nowrap';
      b.textContent = groupName;
      b.addEventListener('click', () => loadScene(key, b));
      buttonsContainer.appendChild(b);
      buttonMap[key] = b;
    } else {
      const wrapper = document.createElement('div');
      wrapper.className = 'relative';

      const mainBtn = document.createElement('button');
      mainBtn.className = 'px-4 py-2 text-white text-sm font-semibold hover:bg-black/60 transition-colors whitespace-nowrap';
      mainBtn.textContent = groupName;
      wrapper.appendChild(mainBtn);

      const dd = document.createElement('div');
      dd.className = 'hidden absolute right-0 mt-1 flex flex-col bg-black/80';

      views.forEach(({ key, title }) => {
        const item = document.createElement('button');
        item.className = 'px-4 py-2 text-white text-sm hover:bg-black/60 whitespace-nowrap text-left';
        item.textContent = title;
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          dd.classList.add('hidden');
          loadScene(key, item);
        });
        dd.appendChild(item);
        buttonMap[key] = item;
      });

      wrapper.appendChild(dd);

      mainBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dd.classList.toggle('hidden');
      });

      document.addEventListener('click', () => dd.classList.add('hidden'));

      buttonsContainer.appendChild(wrapper);
    }
  });
}

function toPercent(value, fallback = 50) {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.endsWith('%')) return trimmed;
    const numeric = parseFloat(trimmed);
    if (Number.isFinite(numeric)) return `${numeric}%`;
  }
  if (typeof value === 'number') {
    const scaled = value <= 1 && value >= 0 ? value * 100 : value;
    return `${scaled}%`;
  }
  return `${fallback}%`;
}

function buildFloorplanPins() {
  if (!floorplanPinsContainer) return;
  floorplanPinsContainer.innerHTML = '';
  Object.keys(floorplanPins).forEach((key) => delete floorplanPins[key]);
  Object.entries(scenes).forEach(([key, scene]) => {
    const fp = scene.floorplan;
    if (!fp) return;
    const left = toPercent(fp.x ?? fp.left);
    const top = toPercent(fp.y ?? fp.top);
    const pin = document.createElement('button');
    pin.type = 'button';
    pin.className = 'floorplan-pin';
    pin.style.left = left;
    pin.style.top = top;
    pin.setAttribute('aria-label', scene.title || key);

    const dot = document.createElement('span');
    dot.className = 'floorplan-pin-dot';
    pin.appendChild(dot);

    pin.addEventListener('click', () => {
      const button = buttonMap[key];
      loadScene(key, button);
    });
    floorplanPinsContainer.appendChild(pin);
    floorplanPins[key] = {
      pin
    };
  });
}

function highlightFloorplanPin(sceneKey) {
  Object.values(floorplanPins).forEach(({ pin }) => {
    pin.classList.remove('active');
  });
  const active = floorplanPins[sceneKey];
  if (active) {
    active.pin.classList.add('active');
  }
}

function setActiveButton(sceneKey) {
  Object.values(buttonMap).forEach((btn) => {
    btn.classList.remove('bg-red-700', 'hover:bg-red-800');
    btn.classList.add('hover:bg-black/60');
  });
  const btn = buttonMap[sceneKey];
  if (btn) {
    btn.classList.remove('hover:bg-black/60');
    btn.classList.add('bg-red-700', 'hover:bg-red-800');
  }
}

function ensureErrorOverlay() {
  const container = document.getElementById('panorama-viewer');
  if (!container) return null;
  if (!errorOverlay) {
    errorOverlay = document.createElement('div');
    errorOverlay.className = 'absolute inset-0 flex items-center justify-center text-red-500 bg-black/60 hidden';
    errorOverlay.setAttribute('role', 'alert');
    container.appendChild(errorOverlay);
  }
  return errorOverlay;
}

function showViewerError(message) {
  const overlay = ensureErrorOverlay();
  if (!overlay) return;
  overlay.textContent = message;
  overlay.classList.remove('hidden');
}

function hideViewerError() {
  if (!errorOverlay) return;
  errorOverlay.classList.add('hidden');
}

function buildViewerConfig(firstKey) {
  const config = {
    default: {
      firstScene: firstKey,
      autoLoad: true,
      autoRotate: autoRotateOn ? -2 : 0
    },
    scenes: {}
  };

  Object.entries(scenes).forEach(([key, scene]) => {
    const baseHotspots = scene.hotspots || [];
    const hotSpots = baseHotspots.map((hs) => {
      if (hs.type === 'scene' && hs.sceneId) {
        const targetKey = hs.target || hs.sceneId;
        return {
          ...hs,
          sceneId: targetKey,
          clickHandlerFunc: () => {
            loadScene(targetKey);
            return false;
          }
        };
      }
      return hs;
    });

    config.scenes[key] = {
      type: 'equirectangular',
      panorama: scene.url,
      hotSpots
    };
  });

  return config;
}

function initializeViewer(firstKey) {
  if (!firstKey) return;
  const config = buildViewerConfig(firstKey);

  try {
    currentViewer = pannellum.viewer('panorama-viewer', config);
  } catch (err) {
    showViewerError('Failed to initialize viewer.');
    return;
  }

  ensureErrorOverlay();

  currentViewer.on('scenechange', (sceneKey) => {
    setActiveButton(sceneKey);
    highlightFloorplanPin(sceneKey);
    hideViewerError();
  });

  currentViewer.on('load', () => {
    hideViewerError();
    if (autoRotateOn) {
      currentViewer.startAutoRotate(-2);
    }
  });

  currentViewer.on('error', () => {
    showViewerError('Failed to load scene.');
  });

  setActiveButton(firstKey);
  highlightFloorplanPin(firstKey);
}

function loadScene(key, btnEl) {
  if (!currentViewer || !scenes[key]) return;
  if (btnEl) {
    setActiveButton(key);
  }
  try {
    currentViewer.loadScene(key);
  } catch (err) {
    showViewerError('Failed to load scene.');
  }
}

function setupControls() {
  document.getElementById('btn-rotate')?.addEventListener('click', () => {
    autoRotateOn = !autoRotateOn;
    if (currentViewer) {
      currentViewer.stopAutoRotate();
      if (autoRotateOn) currentViewer.startAutoRotate(-2);
    }
  });

  document.getElementById('btn-reset')?.addEventListener('click', () => {
    currentViewer?.setYaw(0);
    currentViewer?.setPitch(0);
    currentViewer?.setHfov(100);
  });

  document.getElementById('btn-fullscreen')?.addEventListener('click', () => {
    currentViewer?.toggleFullscreen();
  });
}

window.addEventListener('DOMContentLoaded', () => {
  buildButtons();
  setupControls();
  buildFloorplanPins();
  // load first scene by default
  const firstKey = Object.keys(scenes)[0];
  if (firstKey) {
    initializeViewer(firstKey);
  }

  const btnFloorplan = document.getElementById('btn-floorplan');
  const fp = document.getElementById('floorplan');
  const controls = document.getElementById('viewer-controls');

  btnFloorplan?.addEventListener('click', () => {
    if (!fp || !btnFloorplan) return;
    floorplanVisible = !floorplanVisible;
    fp.classList.toggle('hidden', !floorplanVisible);
    btnFloorplan.textContent = floorplanVisible ? 'Hide Map' : 'Show Map';
  });

  function handleResize() {
    if (!fp || !btnFloorplan) return;
    const small = window.innerWidth < 768;
    if (small) {
      fp.classList.add('hidden');
      btnFloorplan.classList.add('hidden');
      controls?.classList.add('hidden');
    } else {
      btnFloorplan.classList.remove('hidden');
      fp.classList.toggle('hidden', !floorplanVisible);
      btnFloorplan.textContent = floorplanVisible ? 'Hide Map' : 'Show Map';
      controls?.classList.remove('hidden');
    }
  }

  handleResize();
  window.addEventListener('resize', handleResize);
});
