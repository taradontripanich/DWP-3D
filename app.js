let currentViewer = null;
let autoRotateOn = true;

const scenes = window.SCENES || {};
const buttonsContainer = document.getElementById('scene-buttons');
const buttonMap = {};

function buildButtons() {
  Object.entries(scenes).forEach(([key, scene]) => {
    const b = document.createElement('button');
    b.className = 'px-4 py-2 text-white text-sm font-semibold hover:bg-black/60 transition-colors whitespace-nowrap';
    b.textContent = scene.title;
    b.addEventListener('click', () => loadScene(key, b));
    buttonsContainer.appendChild(b);
    buttonMap[key] = b;
  });
}

function loadScene(key, btnEl) {
  const container = document.getElementById('panorama-viewer');
    // clear active state
    Array.from(buttonsContainer.children).forEach(el => {
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
    currentViewer.on('error', () => {
      container.innerHTML = '<div class="flex items-center justify-center h-full text-red-500">Failed to load scene.</div>';
    });
  } catch (e) {
    container.innerHTML = '<div class="flex items-center justify-center h-full text-red-500">Failed to initialize viewer.</div>';
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
  // load first scene by default
  const firstKey = Object.keys(scenes)[0];
  const firstBtn = buttonsContainer.children[0];
  if (firstKey) loadScene(firstKey, firstBtn);

  document.getElementById('fp-pin-livdin')?.addEventListener('click', () => {
    loadScene('livdin', buttonMap['livdin']);
  });
});
