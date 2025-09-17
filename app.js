let currentViewer = null;
let autoRotateOn = true;
let floorplanVisible = true;

const scenes = window.SCENES || {};
const buttonsContainer = document.getElementById('scene-buttons');
const buttonMap = {};
const floorplanPinsContainer = document.getElementById('fp-pins');
const floorplanPins = {};
let activeSceneKey = null;

// heading rotates the floor plan cone so a yaw of 0 points in the desired direction.
const floorplanPositions = {
  livdin_v1: { left: '75%', top: '30%', heading: 0 },
  livdin_v2: { left: '85%', top: '30%', heading: 0 },
  livdin_v3: { left: '85%', top: '55%', heading: 0 },
  msbed_v1: { left: '20%', top: '20%', heading: 0 },
  msbed_v2: { left: '30%', top: '20%', heading: 0 },
  msbed_v3: { left: '20%', top: '45%', heading: 0 },
  msbed_v4: { left: '30%', top: '45%', heading: 0 },
  bedroom2: { left: '25%', top: '70%', heading: 0 }
};

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

function buildFloorplanPins() {
  if (!floorplanPinsContainer) return;
  Object.entries(floorplanPositions).forEach(([key, pos]) => {
    const pin = document.createElement('button');
    pin.type = 'button';
    pin.className = 'floorplan-pin';
    pin.style.left = pos.left;
    pin.style.top = pos.top;

    const cone = document.createElement('span');
    cone.className = 'floorplan-cone';
    pin.appendChild(cone);

    const dot = document.createElement('span');
    dot.className = 'floorplan-pin-dot';
    pin.appendChild(dot);

    pin.addEventListener('click', () => loadScene(key, buttonMap[key]));
    floorplanPinsContainer.appendChild(pin);
    let heading = typeof pos.heading === 'number' ? pos.heading : parseFloat(pos.heading ?? 0);
    heading = Number.isFinite(heading) ? heading : 0;
    floorplanPins[key] = {
      pin,
      cone,
      heading
    };
  });
}

function loadScene(key, btnEl) {
  const container = document.getElementById('panorama-viewer');
  // clear active state
  Object.values(buttonMap).forEach(el => {
    el.classList.remove('bg-red-600','hover:bg-red-700','bg-red-700','hover:bg-red-800');
    el.classList.add('hover:bg-black/60');
  });

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

  btnEl?.classList.remove('hover:bg-black/60');
  btnEl?.classList.add('bg-red-700','hover:bg-red-800');

  try {
    currentViewer = pannellum.viewer('panorama-viewer', {
      type: 'equirectangular',
      panorama: scene.url,
      autoLoad: true,
      autoRotate: autoRotateOn ? -2 : 0,
      hotSpots: scene.hotspots || []
    });
    const handleOrientationUpdate = () => updateActiveFloorplanCone();
    currentViewer.on('load', handleOrientationUpdate);
    currentViewer.on('animate', handleOrientationUpdate);
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
  activeSceneKey = active ? sceneKey : null;
  if (active) {
    active.pin.classList.add('active');
    updateActiveFloorplanCone();
  }
}

function updateFloorplanCone(sceneKey) {
  const entry = floorplanPins[sceneKey];
  if (!entry) return;
  const yaw = typeof currentViewer?.getYaw === 'function' ? currentViewer.getYaw() : 0;
  const rotation = normalizeDegrees(yaw + entry.heading);
  entry.cone.style.setProperty('--cone-rotation', `${rotation}deg`);
}

function normalizeDegrees(value) {
  return ((value % 360) + 360) % 360;
}

function updateActiveFloorplanCone() {
  if (!activeSceneKey) return;
  updateFloorplanCone(activeSceneKey);
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
