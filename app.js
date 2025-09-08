let currentViewer = null;
let autoRotateOn = true;

const scenes = window.SCENES || {};
const buttonsContainer = document.getElementById('scene-buttons');

function buildButtons() {
    Object.entries(scenes).forEach(([key, scene], idx) => {
      const b = document.createElement('button');
      b.className = 'w-10 h-10 flex items-center justify-center bg-black/40 text-white text-sm font-semibold shadow hover:bg-black/60 transition-colors';
      b.textContent = idx + 1;
      b.title = scene.title;
      b.addEventListener('click', () => loadScene(key, b));
      buttonsContainer.appendChild(b);
    });
  }

function loadScene(key, btnEl) {
  const container = document.getElementById('panorama-viewer');
    // clear active state
    Array.from(buttonsContainer.children).forEach(el => {
      el.classList.remove('bg-red-600','hover:bg-red-700');
      el.classList.add('bg-black/40','hover:bg-black/60');
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

    btnEl?.classList.remove('bg-black/40','hover:bg-black/60');
    btnEl?.classList.add('bg-red-600','hover:bg-red-700');

  try {
    currentViewer = pannellum.viewer('panorama-viewer', {
      type: 'equirectangular',
      panorama: scene.url,
      autoLoad: true,
      autoRotate: autoRotateOn ? -2 : 0,
      title: scene.title,
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
});
