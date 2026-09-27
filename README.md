# 🧭 SAHAYAK — NIE North Campus Navigator & Assistant

Interactive High-Resolution Satellite Map, Indoor Floor-by-Floor Directory, 3D Architectural Cutaway Explorer, and Lost & Found System for **National Institute of Engineering (NIE) North Campus, Mysuru**.

---

## 🌟 Key Features

- 🛰️ **Esri High-Resolution Satellite Map**: Exact geo-referenced campus boundary with frosted surroundings dimming.
- 📍 **Real-Time Place Editor**: Click to add, edit, and drag-and-drop custom campus landmarks directly on the satellite view.
- 🏢 **Floor-by-Floor Indoor Navigation**: Select any building to explore Ground, 1st, 2nd, and custom floor plans with individual classrooms, labs, and faculty cabins.
- 🧊 **3D Live Architectural Viewer**: 360° Orbit WebGL model with real-time **Explode Floors** slider, floor isolation, glass/solid views, and clickable 3D room HUD.
- 🔍 **Integrated Lost & Found Location Tagging**: Select building, floor, and room directly from map markers or 3D view.
- 💾 **Live Code Sync**: All marker updates, indoor rooms, and custom boundaries automatically sync directly to `data/nie_north.geojson`.

---

## 🚀 Quick Start

### 1. Run the Local Backend
```bash
python3 server.py
```

### 2. Open in Browser
Navigate to `http://localhost:5173` in any modern web browser.

---

## 📁 Project Structure

```
SAHAYAK/
├── data/
│   └── nie_north.geojson       # Campus boundary & custom synced places
├── index.html                  # Main application UI layout & modals
├── app.js                      # Leaflet map, floor engine & Three.js 3D viewer
├── style.css                   # Glassmorphic dark styling & animations
├── server.py                   # Python sync server (POST /api/save)
└── README.md                   # Project documentation
```

---

## 🛠️ Tech Stack
- **Frontend**: Vanilla JavaScript (ES6+), Leaflet.js, Three.js, CSS3 Glassmorphism
- **Base Imagery**: Esri World Imagery (Satellite)
- **Backend**: Python 3 HTTP Server with Live GeoJSON persistence
