let currentViewer = null;
let autoRotateOn = true;
let floorplanVisible = true;

const scenes = window.SCENES || {};
const buttonsContainer = document.getElementById('scene-buttons');
const buttonMap = {};
const floorplanPinsContainer = document.getElementById('fp-pins');
const floorplanPins = {};
const viewerErrorOverlay = document.getElementById('viewer-error');

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
      b.className = 'px-3 py-1.5 text-white text-xs md:text-sm font-semibold hover:bg-black/60 transition-colors whitespace-nowrap';
      b.textContent = groupName;
      b.addEventListener('click', () => loadScene(key, b));
      buttonsContainer.appendChild(b);
      buttonMap[key] = b;
    } else {
      const wrapper = document.createElement('div');
      wrapper.className = 'relative';

      const mainBtn = document.createElement('button');
      mainBtn.className = 'px-3 py-1.5 text-white text-xs md:text-sm font-semibold hover:bg-black/60 transition-colors whitespace-nowrap';
      mainBtn.textContent = groupName;
      wrapper.appendChild(mainBtn);

      const dd = document.createElement('div');
      dd.className = 'hidden absolute right-0 mt-1 flex flex-col bg-black/80';

      views.forEach(({ key, title }) => {
        const item = document.createElement('button');
        item.className = 'px-4 py-2 text-white text-xs md:text-sm hover:bg-black/60 whitespace-nowrap text-left';
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

function prepareHotspots(sceneKey) {
  const scene = scenes[sceneKey];
  if (!scene || !Array.isArray(scene.hotspots)) return [];

  return scene.hotspots.map((hotspot) => {
    if (!hotspot) return hotspot;
    if (hotspot.type !== 'scene') return { ...hotspot };

    const targetKey = hotspot.target || hotspot.sceneId;
    if (!targetKey) return { ...hotspot };

    return {
      ...hotspot,
      type: 'info',
      clickHandlerFunc: () => {
        const button = buttonMap[targetKey];
        loadScene(targetKey, button);
      }
    };
  });
}

function showViewerError(message) {
  if (!viewerErrorOverlay) return;
  viewerErrorOverlay.textContent = message;
  viewerErrorOverlay.classList.remove('hidden');
}

function hideViewerError() {
  if (!viewerErrorOverlay) return;
  viewerErrorOverlay.textContent = '';
  viewerErrorOverlay.classList.add('hidden');
}

function setActiveButton(sceneKey, btnEl) {
  Object.values(buttonMap).forEach((el) => {
    el.classList.remove('bg-red-600', 'hover:bg-red-700', 'bg-red-700', 'hover:bg-red-800');
    el.classList.add('hover:bg-black/60');
  });

  const activeButton = btnEl || buttonMap[sceneKey];
  if (activeButton) {
    activeButton.classList.remove('hover:bg-black/60');
    activeButton.classList.add('bg-red-700', 'hover:bg-red-800');
  }
}

function loadScene(key, btnEl) {
  if (!currentViewer) return;

  const scene = scenes[key];
  if (!scene) {
    showViewerError('Scene not found.');
    return;
  }

  hideViewerError();
  setActiveButton(key, btnEl);
  highlightFloorplanPin(key);

  try {
    currentViewer.loadScene(key);
  } catch (e) {
    showViewerError('Failed to load scene.');
  }
}

function createViewer(initialKey) {
  if (!initialKey) return;

  const config = {
    default: {
      firstScene: initialKey,
      autoLoad: true,
      autoRotate: autoRotateOn ? -2 : 0
    },
    scenes: {}
  };

  Object.entries(scenes).forEach(([key, scene]) => {
    config.scenes[key] = {
      type: 'equirectangular',
      panorama: scene.url,
      hotSpots: prepareHotspots(key)
    };
  });

  try {
    currentViewer = pannellum.viewer('panorama-viewer', config);
  } catch (e) {
    showViewerError('Failed to initialize viewer.');
    currentViewer = null;
    return;
  }

  currentViewer.on('scenechange', (sceneId) => {
    setActiveButton(sceneId, buttonMap[sceneId]);
    highlightFloorplanPin(sceneId);
    hideViewerError();
    if (autoRotateOn) {
      currentViewer.startAutoRotate(-2);
    } else {
      currentViewer.stopAutoRotate();
    }
  });

  currentViewer.on('load', () => {
    hideViewerError();
  });

  currentViewer.on('error', () => {
    showViewerError('Failed to load scene.');
  });

  setActiveButton(initialKey, buttonMap[initialKey]);
  highlightFloorplanPin(initialKey);
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
  buildFloorplanPins();

  const firstKey = Object.keys(scenes)[0];
  if (firstKey) {
    createViewer(firstKey);
  }

  setupControls();

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
