window.SCENES = {
  livdin_v1: {
    group: "Living Room & Dining",
    title: "Central View",
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
        target: 'livdin_v2',
        pitch: -10,
        yaw: -20,
        text: "Artist's Corner",
        cssClass: 'hs-dot'
      },
      {
        type: 'scene',
        sceneId: 'livdin_v3',
        pitch: -10,
        yaw: -75,
        text: 'Media Lounge',
        cssClass: 'hs-dot'
      }
    ]
  },
  livdin_v2: {
    group: "Living Room & Dining",
    title: "Artist's Corner",
    url: "assets/images/Living_Room-View2.jpg",
    floorplan: {
      x: 70,
      y: 15
    },
    hotspots: [
      {
        type: 'scene',
        sceneId: 'livdin_v1',
        pitch: 0,
        yaw: -90,
        text: 'Central View',
        cssClass: 'hs-dot'
      },
      {
        type: 'scene',
        sceneId: 'livdin_v3',
        pitch: 0,
        yaw: 90,
        text: 'Media Lounge',
        cssClass: 'hs-dot'
      }
    ]
  },
  livdin_v3: {
    group: "Living Room & Dining",
    title: "Media Lounge",
    url: "assets/images/Living_Room-View3.jpg",
    floorplan: {
      x: 55,
      y: 25
    },
    hotspots: [
      {
        type: 'scene',
        sceneId: 'livdin_v1',
        pitch: 0,
        yaw: 60,
        text: 'Central View',
        cssClass: 'hs-dot'
      },
      {
        type: 'scene',
        sceneId: 'livdin_v2',
        pitch: 0,
        yaw: -60,
        text: "Artist's Corner",
        cssClass: 'hs-dot'
      }
    ]
  },
  msbed_v1: {
    group: "Master Bedroom",
    title: "Master Suite",
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
        yaw: 15,
        text: 'Walk-in Closet',
        cssClass: 'hs-dot'
      }
    ]
  },
  msbed_v2: {
    group: "Master Bedroom",
    title: "Walk-in Closet",
    url: "assets/images/Master_bedroom-View2.jpg",
    floorplan: {
      x: 10,
      y: 40
    },
    hotspots: [
      {
        type: 'scene',
        sceneId: 'msbed_v1',
        pitch: 0,
        yaw: 38,
        text: 'Master Suite',
        cssClass: 'hs-dot'
      },
      {
        type: 'scene',
        sceneId: 'msbed_v3',
        pitch: -20,
        yaw: 180,
        text: 'Spa Bathroom',
        cssClass: 'hs-dot'
      }
    ]
  },
  msbed_v3: {
    group: "Master Bedroom",
    title: "Spa Bathroom",
    url: "assets/images/Master_bedroom-View3.jpg",
    floorplan: {
      x: 10,
      y: 48
    },
    hotspots: [
      {
        type: 'scene',
        sceneId: 'msbed_v1',
        pitch: 0,
        yaw: 55,
        text: 'Master Suite',
        cssClass: 'hs-dot'
      },
      {
        type: 'scene',
        sceneId: 'msbed_v2',
        pitch: 0,
        yaw: -55,
        text: 'Walk-in Closet',
        cssClass: 'hs-dot'
      }
    ]
  },
  bedroom2: {
    group: "Bedroom 2",
    title: "Bedroom 2",
    url: "assets/images/Bedroom2-View1.jpg",
    floorplan: {
      x: 18,
      y: 78
    },
    hotspots: []
  }
};
