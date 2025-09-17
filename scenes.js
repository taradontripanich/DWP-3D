window.SCENES = {
  livdin_v1: {
    group: "Living & Dining",
    title: "View 1",
    url: "assets/images/Living_Room-View1.jpg",
    floorplan: {
      // Position the floor plan pin using percentages of the image width / height.
      x: 75,
      y: 30
    },
    hotspots: [
      {
        // Adjust pitch (vertical) and yaw (horizontal) to move the hsimage.png hotspot dot.
        type: 'scene',
        sceneId: 'livdin_v2',
        pitch: 0,
        yaw: 75,
        text: 'Living & Dining View 2',
        cssClass: 'hs-dot'
      },
      {
        type: 'scene',
        sceneId: 'livdin_v3',
        pitch: 0,
        yaw: -75,
        text: 'Living & Dining View 3',
        cssClass: 'hs-dot'
      }
    ]
  },
  livdin_v2: {
    group: "Living & Dining",
    title: "View 2",
    url: "assets/images/Living_Room-View2.jpg",
    floorplan: {
      x: 85,
      y: 30
    },
    hotspots: [
      {
        type: 'scene',
        sceneId: 'livdin_v1',
        pitch: 0,
        yaw: -90,
        text: 'Living & Dining View 1',
        cssClass: 'hs-dot'
      },
      {
        type: 'scene',
        sceneId: 'livdin_v3',
        pitch: 0,
        yaw: 90,
        text: 'Living & Dining View 3',
        cssClass: 'hs-dot'
      }
    ]
  },
  livdin_v3: {
    group: "Living & Dining",
    title: "View 3",
    url: "assets/images/Living_Room-View3.jpg",
    floorplan: {
      x: 85,
      y: 55
    },
    hotspots: [
      {
        type: 'scene',
        sceneId: 'livdin_v1',
        pitch: 0,
        yaw: 60,
        text: 'Living & Dining View 1',
        cssClass: 'hs-dot'
      },
      {
        type: 'scene',
        sceneId: 'livdin_v2',
        pitch: 0,
        yaw: -60,
        text: 'Living & Dining View 2',
        cssClass: 'hs-dot'
      }
    ]
  },
  msbed_v1: {
    group: "Master Bedroom",
    title: "View 1",
    url: "assets/images/Master_bedroom-View1.jpg",
    floorplan: {
      x: 20,
      y: 20
    },
    hotspots: [
      {
        type: 'scene',
        sceneId: 'msbed_v2',
        pitch: 0,
        yaw: 55,
        text: 'Master Bedroom View 2',
        cssClass: 'hs-dot'
      },
      {
        type: 'scene',
        sceneId: 'msbed_v3',
        pitch: 0,
        yaw: -55,
        text: 'Master Bedroom View 3',
        cssClass: 'hs-dot'
      }
    ]
  },
  msbed_v2: {
    group: "Master Bedroom",
    title: "View 2",
    url: "assets/images/Master_bedroom-View2.jpg",
    floorplan: {
      x: 30,
      y: 20
    },
    hotspots: [
      {
        type: 'scene',
        sceneId: 'msbed_v1',
        pitch: 0,
        yaw: -55,
        text: 'Master Bedroom View 1',
        cssClass: 'hs-dot'
      },
      {
        type: 'scene',
        sceneId: 'msbed_v3',
        pitch: 0,
        yaw: 55,
        text: 'Master Bedroom View 3',
        cssClass: 'hs-dot'
      }
    ]
  },
  msbed_v3: {
    group: "Master Bedroom",
    title: "View 3",
    url: "assets/images/Master_bedroom-View3.jpg",
    floorplan: {
      x: 20,
      y: 45
    },
    hotspots: [
      {
        type: 'scene',
        sceneId: 'msbed_v1',
        pitch: 0,
        yaw: 55,
        text: 'Master Bedroom View 1',
        cssClass: 'hs-dot'
      },
      {
        type: 'scene',
        sceneId: 'msbed_v2',
        pitch: 0,
        yaw: -55,
        text: 'Master Bedroom View 2',
        cssClass: 'hs-dot'
      }
    ]
  },
  bedroom2: {
    group: "Bedroom 2",
    title: "View 1",
    url: "assets/images/Bedroom2-View1.jpg",
    floorplan: {
      x: 25,
      y: 70
    },
    hotspots: []
  }
};
