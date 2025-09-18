let currentViewer = null;
let autoRotateOn = true;
let floorplanVisible = true;

const scenes = window.SCENES || {};
const buttonsContainer = document.getElementById('scene-buttons');
const buttonMap = {};
const floorplanPinsContainer = document.getElementById('fp-pins');
const floorplanPins = {};

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

function prepareHotspots(sceneKey) {
  const scene = scenes[sceneKey];
  if (!scene || !Array.isArray(scene.hotspots)) return [];

  return scene.hotspots.map((hotspot) => {
    if (!hotspot || hotspot.type !== 'scene') return hotspot;

    const targetKey = hotspot.target || hotspot.sceneId;
    if (!targetKey) return hotspot;

    const cloned = { ...hotspot };
    cloned.type = 'info';
    cloned.clickHandlerFunc = () => {
      const button = buttonMap[targetKey];
      loadScene(targetKey, button);
    };

    return cloned;
  });
}

function loadScene(key, btnEl) {
  const container = document.getElementById('panorama-viewer');
  // clear active state
  Object.values(buttonMap).forEach(el => {
    el.classList.remove('bg-red-600','hover:bg-red-700','bg-red-700','hover:bg-red-800');
    el.classList.add('hover:bg-black/60');
  });

  const activeButton = btnEl || buttonMap[key];

  // destroy old viewer
  if (currentViewer) {
    currentViewer.destroy();
    currentViewer = null;
    while (container.firstChild) container.removeChild(container.firstChild);
  }

  const scene = scenes[key];
  if (!scene) {
    container.innerHTML = '<div class="flex items-center justify-center h-full text-red-500">Scene not found.</div>';
    return;
  }

  activeButton?.classList.remove('hover:bg-black/60');
  activeButton?.classList.add('bg-red-700','hover:bg-red-800');

  try {
    currentViewer = pannellum.viewer('panorama-viewer', {
      type: 'equirectangular',
      panorama: scene.url,
      autoLoad: true,
      autoRotate: autoRotateOn ? -2 : 0,
      hotSpots: prepareHotspots(key)
    });
    currentViewer.on('error', () => {
      container.innerHTML = '<div class="flex items-center justify-center h-full text-red-500">Failed to load scene.</div>';
    });
  } catch (e) {
    container.innerHTML = '<div class="flex items-center justify-center h-full text-red-500">Failed to initialize viewer.</div>';
  }

  highlightFloorplanPin(key);
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
  setupControls();
  buildFloorplanPins();
  // load first scene by default
  const firstKey = Object.keys(scenes)[0];
  if (firstKey) loadScene(firstKey, buttonMap[firstKey]);

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
