# 360° Property Tour

A lightweight 360° virtual tour using [Pannellum](https://pannellum.org/) and Tailwind CSS. Scenes are defined in a single data file and rendered into a minimal Fraser-style UI.

## Running Locally

```bash
python -m http.server 5500
# open http://localhost:5500 in your browser
```

## Deployment

Deploy directly to GitHub Pages:

1. Push to `main`.
2. In repository settings, enable **Pages** with source `main` branch and root folder.
3. Wait for the site to build and publish.

## Adding Scenes

Edit `scenes.js` and add new entries to the `window.SCENES` object. Images can be hosted remotely or placed under `assets/panos/`.
