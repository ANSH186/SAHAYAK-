// NIE North Campus — Live Code Sync Place Editor
window.addEventListener('DOMContentLoaded', () => {
  let campusBoundary = [
    [12.3708164, 76.5857619],
    [12.3704832, 76.5876098],
    [12.3702353, 76.5878755],
    [12.3702106, 76.5886288],
    [12.3710493, 76.5885008],
    [12.3709666, 76.5874306],
    [12.3719324, 76.5874824],
    [12.3724239, 76.5871614],
    [12.3741434, 76.5870053],
    [12.3750691, 76.5861900],
    [12.3709411, 76.5840391],
    [12.3708164, 76.5857619]
  ];

  const categoryIcons = {
    'Library': '📚',
    'Academic': '🎓',
    'Classroom': '🏫',
    'Lab': '🔬',
    'Admin': '🏛️',
    'Food': '☕',
    'Hostel': '🏠',
    'Sports': '🏆',
    'Medical': '🏥',
    'Auditorium': '🎭',
    'Hub': '💡',
    'Facility': '🚗',
    'Gate': '🛡️',
    'Custom': '📍'
  };

  const categoryColors = {
    'Library': '#0ea5e9',
    'Academic': '#00f0ff',
    'Classroom': '#3b82f6',
    'Lab': '#8b5cf6',
    'Admin': '#f59e0b',
    'Food': '#f97316',
    'Hostel': '#ec4899',
    'Sports': '#10b981',
    'Medical': '#ef4444',
    'Auditorium': '#a855f7',
    'Hub': '#eab308',
    'Facility': '#64748b',
    'Gate': '#14b8a6',
    'Custom': '#00f0ff'
  };

  const state = {
    isAddMode: false,
    places: [],
    markersMap: new Map(),
    isMaskOn: true,
    activeFloorPlaceId: null,
    activeFloorIndex: 0,
    activeRoomFilter: 'all',
    roomSearchQuery: ''
  };

  // Dedicated Esri High-Resolution Satellite Layer
  const esriSatelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; Esri &bull; High-Res Satellite',
    maxZoom: 20,
    maxNativeZoom: 18,
    minZoom: 15
  });

  const campusBounds = L.latLngBounds(campusBoundary);

  const map = L.map('campus-map', {
    center: campusBounds.getCenter(),
    zoom: 17,
    minZoom: 15,
    maxZoom: 20,
    maxBounds: campusBounds.pad(0.35),
    maxBoundsViscosity: 0.95,
    zoomControl: true
  });

  esriSatelliteLayer.addTo(map);

  // Inverted Surrounding Mask
  const worldOuter = [[-90, -180], [-90, 180], [90, 180], [90, -180], [-90, -180]];
  const maskLayer = L.polygon([worldOuter, campusBoundary], {
    color: '#070b14',
    fillColor: '#070b14',
    fillOpacity: 0.70,
    weight: 0,
    interactive: false
  }).addTo(map);

  // Glowing Cyan Campus Boundary Outline
  const boundaryOutline = L.polygon(campusBoundary, {
    color: '#00f0ff',
    weight: 3.5,
    opacity: 0.95,
    fillColor: 'transparent',
    fillOpacity: 0,
    dashArray: '5, 8',
    interactive: false
  }).addTo(map);

  // Center Badge
  boundaryOutline.bindTooltip('🏛️ NIE North Campus', {
    permanent: true,
    direction: 'center',
    className: 'campus-badge'
  });

  map.fitBounds(campusBounds, { padding: [40, 40] });
  setTimeout(() => map.invalidateSize(), 100);

  const placesLayerGroup = L.layerGroup().addTo(map);

  // Auto-Save Toast
  let toastTimeout = null;
  function showSaveToast(msg = "Changes saved directly to code (data/nie_north.geojson)") {
    const toast = document.getElementById('saveToast');
    const toastMsg = document.getElementById('toastMsg');
    const saveStatusBadge = document.getElementById('saveStatusBadge');
    const saveStatusText = document.getElementById('saveStatusText');

    toastMsg.innerText = msg;
    toast.style.display = 'flex';

    saveStatusBadge.classList.remove('saving');
    saveStatusText.innerText = 'Code Synced';

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.style.display = 'none';
    }, 2800);
  }

  // Sync to Backend Code
  async function syncPlacesToCode() {
    const saveStatusBadge = document.getElementById('saveStatusBadge');
    const saveStatusText = document.getElementById('saveStatusText');
    saveStatusBadge.classList.add('saving');
    saveStatusText.innerText = 'Syncing to code...';

    const geojsonData = {
      type: "FeatureCollection",
      name: "NIE North",
      features: [
        {
          type: "Feature",
          properties: {
            Name: "nie north map",
            description: "National Institute of Engineering - North Campus Boundary",
            location: "Mysuru, Karnataka, India"
          },
          geometry: {
            type: "Polygon",
            coordinates: [campusBoundary.map(c => [c[1], c[0], 0.0])]
          }
        },
        ...state.places.map(p => ({
          type: "Feature",
          properties: {
            id: p.id,
            name: p.name,
            category: p.category,
            color: p.color,
            badge: p.badge || '',
            description: p.desc || '',
            floors: p.floors || []
          },
          geometry: {
            type: "Point",
            coordinates: [p.lng, p.lat, 0.0]
          }
        }))
      ]
    };

    localStorage.setItem('nie_north_custom_places', JSON.stringify(state.places));

    try {
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geojsonData)
      });

      if (response.ok) {
        showSaveToast(`✓ Saved ${state.places.length} places directly to data/nie_north.geojson`);
      } else {
        showSaveToast("✓ Saved in local storage");
      }
    } catch (err) {
      showSaveToast("✓ Saved in local storage");
    }

    updateCounts();
    renderPlacesDrawer();
  }

  // Load from GeoJSON on start
  async function loadPlacesFromCode() {
    try {
      const res = await fetch('data/nie_north.geojson?t=' + Date.now());
      if (res.ok) {
        const geojson = await res.json();
        const loadedPlaces = [];

        if (geojson.features && Array.isArray(geojson.features)) {
          geojson.features.forEach(f => {
            if (f.geometry && f.geometry.type === 'Point' && f.geometry.coordinates) {
              const coords = f.geometry.coordinates;
              const props = f.properties || {};
              loadedPlaces.push({
                id: props.id || `place_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                lat: coords[1],
                lng: coords[0],
                name: props.name || props.Name || 'Custom Place',
                category: props.category || 'Academic',
                color: props.color || '#00f0ff',
                badge: props.badge || '',
                desc: props.description || props.desc || '',
                floors: props.floors || []
              });
            }
          });
        }

        if (loadedPlaces.length > 0) {
          state.places = loadedPlaces;
          localStorage.setItem('nie_north_custom_places', JSON.stringify(state.places));
        }
      }
    } catch (e) {
      console.warn("Could not load data/nie_north.geojson:", e);
      const local = localStorage.getItem('nie_north_custom_places');
      if (local) state.places = JSON.parse(local);
    }

    updateCounts();
    renderAllMarkers();
    renderPlacesDrawer();
  }

  function updateCounts() {
    const count = state.places.length;
    document.getElementById('headerPlacesCount').innerText = count;
    document.getElementById('drawerPlacesCount').innerText = count;
  }

  // Render Custom Markers
  function renderAllMarkers() {
    placesLayerGroup.clearLayers();
    state.markersMap.clear();

    state.places.forEach(place => {
      const iconEmoji = categoryIcons[place.category] || '📍';
      const color = place.color || '#00f0ff';

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div class="custom-pin-marker" style="background: ${color};" title="${place.name}">
            <span class="pin-inner-icon">${iconEmoji}</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -30]
      });

      const marker = L.marker([place.lat, place.lng], {
        icon: customIcon,
        draggable: true,
        autoPan: true
      });

      const totalRooms = (place.floors || []).reduce((acc, f) => acc + (f.rooms ? f.rooms.length : 0), 0);
      const hasFloors = place.floors && place.floors.length > 0;

      const popupHtml = `
        <div style="min-width: 190px;">
          <div style="font-weight: 700; font-size: 0.95rem; color: #fff; margin-bottom: 2px;">${place.name}</div>
          <div style="display: flex; gap: 6px; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 0.7rem; background: rgba(255,255,255,0.12); padding: 2px 6px; border-radius: 4px; color: ${color}; font-weight: 600;">${place.category}</span>
            ${place.badge ? `<span style="font-size: 0.68rem; color: #94a3b8;">${place.badge}</span>` : ''}
          </div>
          ${place.desc ? `<div style="font-size: 0.78rem; color: #94a3b8; margin-bottom: 8px;">${place.desc}</div>` : ''}
          
          <div style="display: flex; gap: 6px; margin-bottom: 8px;">
            <button class="popup-action-btn" style="flex: 1; justify-content: center; background: linear-gradient(135deg, #0284c7, #0ea5e9); padding: 6px 8px;" onclick="window.campusEditor.openFloorPlanModal('${place.id}')">
              🏢 Floors ${hasFloors ? `(${totalRooms})` : ''}
            </button>
            <button class="popup-action-btn" style="flex: 1; justify-content: center; background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 6px 8px;" onclick="window.campusEditor.open3DBuildingViewer('${place.id}')">
              🧊 3D View
            </button>
          </div>

          <div style="font-size: 0.68rem; color: #64748b; margin-bottom: 6px;">Drag marker to adjust location</div>
          <div style="display: flex; gap: 6px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 6px;">
            <button class="popup-action-btn" onclick="window.campusEditor.openEditModal('${place.id}')">✏️ Edit</button>
            <button class="popup-action-btn" style="background: rgba(239,68,68,0.25); color: #fca5a5;" onclick="window.campusEditor.deletePlace('${place.id}')">🗑️ Delete</button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('dragend', (e) => {
        const newLatLng = e.target.getLatLng();
        place.lat = parseFloat(newLatLng.lat.toFixed(7));
        place.lng = parseFloat(newLatLng.lng.toFixed(7));
        syncPlacesToCode();
      });

      placesLayerGroup.addLayer(marker);
      state.markersMap.set(place.id, marker);
    });
  }

  // Render Places Drawer
  function renderPlacesDrawer() {
    const list = document.getElementById('placesListContainer');
    list.innerHTML = '';

    if (state.places.length === 0) {
      list.innerHTML = `
        <div style="text-align: center; padding: 2rem 1rem; color: var(--text-muted); font-size: 0.82rem;">
          <p style="font-size: 1.5rem; margin-bottom: 8px;">📍</p>
          <p>No custom places added yet.</p>
        </div>
      `;
      return;
    }

    state.places.forEach(place => {
      const iconEmoji = categoryIcons[place.category] || '📍';
      const color = place.color || '#00f0ff';

      const totalRooms = (place.floors || []).reduce((acc, f) => acc + (f.rooms ? f.rooms.length : 0), 0);

      const item = document.createElement('div');
      item.className = 'custom-place-item';
      item.innerHTML = `
        <div class="place-item-top">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span>${iconEmoji}</span>
            <span class="place-item-title">${place.name}</span>
          </div>
          <span class="place-item-badge" style="border-left: 3px solid ${color};">${place.category}</span>
        </div>
        ${place.desc ? `<div class="place-item-desc">${place.desc}</div>` : ''}
        <div class="place-item-footer">
          <span>${place.lat.toFixed(4)}, ${place.lng.toFixed(4)}</span>
          <div class="place-item-actions">
            <button class="action-btn-sm" style="color: #a855f7;" onclick="event.stopPropagation(); window.campusEditor.open3DBuildingViewer('${place.id}')">🧊 3D</button>
            <button class="action-btn-sm" style="color: #38bdf8;" onclick="event.stopPropagation(); window.campusEditor.openFloorPlanModal('${place.id}')">🏢 Floors ${totalRooms > 0 ? `(${totalRooms})` : ''}</button>
            <button class="action-btn-sm" onclick="event.stopPropagation(); window.campusEditor.openEditModal('${place.id}')">Edit</button>
            <button class="action-btn-sm" style="color: #f87171;" onclick="event.stopPropagation(); window.campusEditor.deletePlace('${place.id}')">Delete</button>
          </div>
        </div>
      `;

      item.addEventListener('click', () => {
        map.flyTo([place.lat, place.lng], 18.5, { duration: 0.8 });
        const marker = state.markersMap.get(place.id);
        if (marker) {
          setTimeout(() => marker.openPopup(), 600);
        }
      });

      list.appendChild(item);
    });
  }

  // Add Mode Listeners
  const addPlaceModeBtn = document.getElementById('addPlaceModeBtn');
  const addInstructionBanner = document.getElementById('addInstructionBanner');
  const cancelAddModeBtn = document.getElementById('cancelAddModeBtn');
  const addBtnText = document.getElementById('addBtnText');

  function setAddMode(enable) {
    state.isAddMode = enable;
    if (enable) {
      addPlaceModeBtn.classList.add('active');
      addBtnText.innerText = 'Exit Add Mode';
      addInstructionBanner.style.display = 'flex';
      document.getElementById('campus-map').style.cursor = 'crosshair';
    } else {
      addPlaceModeBtn.classList.remove('active');
      addBtnText.innerText = 'Add Place (Click Map)';
      addInstructionBanner.style.display = 'none';
      document.getElementById('campus-map').style.cursor = '';
    }
  }

  addPlaceModeBtn.addEventListener('click', () => setAddMode(!state.isAddMode));
  cancelAddModeBtn.addEventListener('click', () => setAddMode(false));

  map.on('click', (e) => {
    if (!state.isAddMode) return;
    const lat = parseFloat(e.latlng.lat.toFixed(7));
    const lng = parseFloat(e.latlng.lng.toFixed(7));
    openAddModal(lat, lng);
    setAddMode(false);
  });

  // Available Color Palette
  const paletteColors = [
    '#00f0ff', '#0ea5e9', '#3b82f6', '#1d4ed8', '#6366f1', '#8b5cf6',
    '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#ef4444', '#f97316',
    '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0284c7', '#b45309', '#78350f', '#64748b', '#f8fafc'
  ];

  // Modal Controls
  const modalBackdrop = document.getElementById('placeModalBackdrop');
  const placeForm = document.getElementById('placeForm');
  const modalHeading = document.getElementById('modalHeading');
  const placeIdInput = document.getElementById('placeId');
  const placeLatInput = document.getElementById('placeLat');
  const placeLngInput = document.getElementById('placeLng');
  const placeNameInput = document.getElementById('placeName');
  const placeCategoryInput = document.getElementById('placeCategory');
  const placeColorInput = document.getElementById('placeColor');
  const placeCustomColorPicker = document.getElementById('placeCustomColorPicker');
  const colorSwatchesContainer = document.getElementById('colorSwatchesContainer');
  const placeBadgeInput = document.getElementById('placeBadge');
  const placeDescInput = document.getElementById('placeDesc');
  const coordsDisplayVal = document.getElementById('coordsDisplayVal');
  const deletePlaceBtn = document.getElementById('deletePlaceBtn');

  // Build Swatches UI
  paletteColors.forEach(c => {
    const swatch = document.createElement('button');
    swatch.type = 'button';
    swatch.className = 'color-swatch-btn';
    swatch.style.backgroundColor = c;
    swatch.style.color = c;
    swatch.title = c;
    swatch.dataset.color = c;
    swatch.addEventListener('click', () => {
      setColor(c);
    });
    colorSwatchesContainer.appendChild(swatch);
  });

  function setColor(hex) {
    if (!hex) return;
    hex = hex.toLowerCase();
    
    // Update select if exists
    let matchedOption = false;
    for (let i = 0; i < placeColorInput.options.length; i++) {
      if (placeColorInput.options[i].value.toLowerCase() === hex) {
        placeColorInput.selectedIndex = i;
        matchedOption = true;
        break;
      }
    }
    if (!matchedOption) {
      // Add or select custom
      let customOpt = placeColorInput.querySelector('option[data-custom="true"]');
      if (!customOpt) {
        customOpt = document.createElement('option');
        customOpt.dataset.custom = "true";
        placeColorInput.appendChild(customOpt);
      }
      customOpt.value = hex;
      customOpt.innerText = `🎨 Custom (${hex})`;
      placeColorInput.value = hex;
    }

    placeCustomColorPicker.value = hex;

    // Highlight active swatch
    document.querySelectorAll('.color-swatch-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.color.toLowerCase() === hex);
    });
  }

  placeColorInput.addEventListener('change', (e) => {
    setColor(e.target.value);
  });

  placeCustomColorPicker.addEventListener('input', (e) => {
    setColor(e.target.value);
  });

  // Auto-sync suggested color when category changes
  placeCategoryInput.addEventListener('change', (e) => {
    const selectedCat = e.target.value;
    if (categoryColors[selectedCat]) {
      setColor(categoryColors[selectedCat]);
    }
  });

  function openAddModal(lat, lng) {
    modalHeading.innerText = 'Add New Place';
    placeIdInput.value = '';
    placeLatInput.value = lat;
    placeLngInput.value = lng;
    placeNameInput.value = '';
    placeCategoryInput.value = 'Library';
    setColor(categoryColors['Library'] || '#0ea5e9');
    placeBadgeInput.value = '';
    placeDescInput.value = '';
    coordsDisplayVal.innerText = `${lat}, ${lng}`;
    deletePlaceBtn.style.display = 'none';

    modalBackdrop.style.display = 'flex';
    setTimeout(() => placeNameInput.focus(), 100);
  }

  function openEditModal(placeId) {
    const place = state.places.find(p => p.id === placeId);
    if (!place) return;

    modalHeading.innerText = 'Edit Place';
    placeIdInput.value = place.id;
    placeLatInput.value = place.lat;
    placeLngInput.value = place.lng;
    placeNameInput.value = place.name;
    placeCategoryInput.value = place.category || 'Academic';
    setColor(place.color || categoryColors[place.category] || '#00f0ff');
    placeBadgeInput.value = place.badge || '';
    placeDescInput.value = place.desc || '';
    coordsDisplayVal.innerText = `${place.lat}, ${place.lng}`;
    deletePlaceBtn.style.display = 'block';

    modalBackdrop.style.display = 'flex';
    setTimeout(() => placeNameInput.focus(), 100);
  }

  function closeModal() {
    modalBackdrop.style.display = 'none';
  }

  document.getElementById('closeModalBtn').addEventListener('click', closeModal);
  document.getElementById('cancelModalBtn').addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });

  // Save Place
  placeForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = placeIdInput.value || `place_${Date.now()}`;
    const lat = parseFloat(placeLatInput.value);
    const lng = parseFloat(placeLngInput.value);
    const name = placeNameInput.value.trim();
    const category = placeCategoryInput.value;
    const color = placeColorInput.value;
    const badge = placeBadgeInput.value.trim();
    const desc = placeDescInput.value.trim();

    const existingIndex = state.places.findIndex(p => p.id === id);

    if (existingIndex >= 0) {
      const oldFloors = state.places[existingIndex].floors || [];
      state.places[existingIndex] = { id, lat, lng, name, category, color, badge, desc, floors: oldFloors };
    } else {
      state.places.push({
        id, lat, lng, name, category, color, badge, desc,
        floors: [
          { floorNumber: 0, floorName: 'Ground Floor', rooms: [] },
          { floorNumber: 1, floorName: '1st Floor', rooms: [] }
        ]
      });
    }

    syncPlacesToCode();
    renderAllMarkers();
    closeModal();

    map.flyTo([lat, lng], 18, { duration: 0.6 });
  });

  // Delete Place
  function deletePlace(placeId) {
    if (confirm('Are you sure you want to delete this place?')) {
      state.places = state.places.filter(p => p.id !== placeId);
      syncPlacesToCode();
      renderAllMarkers();
      closeModal();
    }
  }

  deletePlaceBtn.addEventListener('click', () => {
    const id = placeIdInput.value;
    if (id) deletePlace(id);
  });

  // Clear All
  document.getElementById('clearAllPlacesBtn').addEventListener('click', () => {
    if (state.places.length === 0) return;
    if (confirm('Delete all custom places from the map?')) {
      state.places = [];
      syncPlacesToCode();
      renderAllMarkers();
    }
  });

  // ==========================================
  // OPTION C: FLOOR PLAN & INDOOR ROOMS ENGINE
  // ==========================================
  const floorPlanModalBackdrop = document.getElementById('floorPlanModalBackdrop');
  const closeFloorPlanModalBtn = document.getElementById('closeFloorPlanModalBtn');
  const fpBuildingIcon = document.getElementById('fpBuildingIcon');
  const fpBuildingName = document.getElementById('fpBuildingName');
  const fpBuildingCategory = document.getElementById('fpBuildingCategory');
  const floorTabsList = document.getElementById('floorTabsList');
  const addFloorLevelBtn = document.getElementById('addFloorLevelBtn');
  const deleteFloorLevelBtn = document.getElementById('deleteFloorLevelBtn');
  const fpAddRoomBtn = document.getElementById('fpAddRoomBtn');
  const roomsGridContainer = document.getElementById('roomsGridContainer');
  const roomSearchInput = document.getElementById('roomSearchInput');
  const roomTypeFilterPills = document.getElementById('roomTypeFilterPills');

  // Room Edit Sub-Modal Controls
  const roomEditModalBackdrop = document.getElementById('roomEditModalBackdrop');
  const closeRoomModalBtn = document.getElementById('closeRoomModalBtn');
  const cancelRoomModalBtn = document.getElementById('cancelRoomModalBtn');
  const roomForm = document.getElementById('roomForm');
  const roomModalHeading = document.getElementById('roomModalHeading');
  const editRoomIdInput = document.getElementById('editRoomId');
  const roomNumberInput = document.getElementById('roomNumber');
  const roomTypeSelect = document.getElementById('roomType');
  const roomNameInput = document.getElementById('roomName');
  const roomCapacityInput = document.getElementById('roomCapacity');
  const roomBadgeInput = document.getElementById('roomBadge');
  const roomNotesInput = document.getElementById('roomNotes');
  const deleteRoomBtn = document.getElementById('deleteRoomBtn');

  const roomTypeIcons = {
    'Classroom': '🏫',
    'Lab': '🔬',
    'Faculty': '👨‍🏫',
    'Seminar': '🎭',
    'Admin': '🏛️',
    'Facility': '🚻',
    'Other': '📍'
  };

  function getActivePlace() {
    return state.places.find(p => p.id === state.activeFloorPlaceId);
  }

  function openFloorPlanModal(placeId) {
    const place = state.places.find(p => p.id === placeId);
    if (!place) return;

    state.activeFloorPlaceId = placeId;
    state.activeFloorIndex = 0;
    state.activeRoomFilter = 'all';
    state.roomSearchQuery = '';
    roomSearchInput.value = '';

    // Initialize default floors if empty
    if (!place.floors || place.floors.length === 0) {
      place.floors = [
        { floorNumber: 0, floorName: 'Ground Floor', rooms: [] },
        { floorNumber: 1, floorName: '1st Floor', rooms: [] }
      ];
    }

    fpBuildingIcon.innerText = categoryIcons[place.category] || '🏢';
    fpBuildingName.innerText = place.name;
    fpBuildingCategory.innerText = `${place.category} &bull; Indoor Floor Plan`;

    // Reset filters
    roomTypeFilterPills.querySelectorAll('.type-pill').forEach(p => {
      p.classList.toggle('active', p.dataset.filter === 'all');
    });

    renderFloorTabs();
    renderRooms();

    floorPlanModalBackdrop.style.display = 'flex';
  }

  function closeFloorPlanModal() {
    floorPlanModalBackdrop.style.display = 'none';
  }

  closeFloorPlanModalBtn.addEventListener('click', closeFloorPlanModal);
  floorPlanModalBackdrop.addEventListener('click', (e) => {
    if (e.target === floorPlanModalBackdrop) closeFloorPlanModal();
  });

  // Render Floor Level Tabs
  function renderFloorTabs() {
    const place = getActivePlace();
    if (!place) return;

    floorTabsList.innerHTML = '';
    place.floors.forEach((floor, idx) => {
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.className = `floor-tab-btn ${idx === state.activeFloorIndex ? 'active' : ''}`;
      const roomCount = floor.rooms ? floor.rooms.length : 0;
      tab.innerHTML = `<span>${floor.floorName}</span> <span style="opacity: 0.75; font-size: 0.72rem;">(${roomCount})</span>`;
      tab.addEventListener('click', () => {
        state.activeFloorIndex = idx;
        renderFloorTabs();
        renderRooms();
      });
      floorTabsList.appendChild(tab);
    });

    deleteFloorLevelBtn.style.display = place.floors.length > 1 ? 'block' : 'none';
  }

  // Add Floor Level
  addFloorLevelBtn.addEventListener('click', () => {
    const place = getActivePlace();
    if (!place) return;

    const nextNumber = place.floors.length;
    let defaultName = `${nextNumber}th Floor`;
    if (nextNumber === 1) defaultName = '1st Floor';
    else if (nextNumber === 2) defaultName = '2nd Floor';
    else if (nextNumber === 3) defaultName = '3rd Floor';

    const floorName = prompt('Enter Floor Name:', defaultName);
    if (!floorName) return;

    place.floors.push({
      floorNumber: nextNumber,
      floorName: floorName.trim(),
      rooms: []
    });

    state.activeFloorIndex = place.floors.length - 1;
    syncPlacesToCode();
    renderFloorTabs();
    renderRooms();
  });

  // Delete Current Floor Level
  deleteFloorLevelBtn.addEventListener('click', () => {
    const place = getActivePlace();
    if (!place || place.floors.length <= 1) return;

    const currentFloor = place.floors[state.activeFloorIndex];
    if (confirm(`Delete "${currentFloor.floorName}" and all rooms on this floor?`)) {
      place.floors.splice(state.activeFloorIndex, 1);
      state.activeFloorIndex = Math.max(0, state.activeFloorIndex - 1);
      syncPlacesToCode();
      renderFloorTabs();
      renderRooms();
    }
  });

  // Filter Pills
  roomTypeFilterPills.addEventListener('click', (e) => {
    const pill = e.target.closest('.type-pill');
    if (!pill) return;

    roomTypeFilterPills.querySelectorAll('.type-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    state.activeRoomFilter = pill.dataset.filter;
    renderRooms();
  });

  // Search Input
  roomSearchInput.addEventListener('input', (e) => {
    state.roomSearchQuery = e.target.value.toLowerCase().trim();
    renderRooms();
  });

  // Render Rooms for Current Floor
  function renderRooms() {
    const place = getActivePlace();
    if (!place) return;

    const floor = place.floors[state.activeFloorIndex];
    if (!floor) return;

    const rooms = floor.rooms || [];
    roomsGridContainer.innerHTML = '';

    // Filter rooms
    let filtered = rooms.filter(r => {
      const matchType = state.activeRoomFilter === 'all' || r.type === state.activeRoomFilter;
      const matchSearch = !state.roomSearchQuery || 
        r.number.toLowerCase().includes(state.roomSearchQuery) || 
        r.name.toLowerCase().includes(state.roomSearchQuery) ||
        (r.notes && r.notes.toLowerCase().includes(state.roomSearchQuery));
      return matchType && matchSearch;
    });

    if (filtered.length === 0) {
      roomsGridContainer.innerHTML = `
        <div class="rooms-empty-state">
          <div class="rooms-empty-icon">🚪</div>
          <div style="font-weight: 600; color: #fff; margin-bottom: 4px;">No rooms found on ${floor.floorName}</div>
          <div style="font-size: 0.78rem; margin-bottom: 14px;">Add classrooms, computer labs, or faculty cabins to this floor.</div>
          <button class="fp-action-btn primary" onclick="window.campusEditor.openRoomAddModal()">➕ Add First Room / Lab</button>
        </div>
      `;
      return;
    }

    filtered.forEach(room => {
      const card = document.createElement('div');
      card.className = 'room-card';
      const icon = roomTypeIcons[room.type] || '🚪';

      card.innerHTML = `
        <div class="room-card-header">
          <span class="room-code-tag">${room.number}</span>
          <span class="room-type-badge">${icon} ${room.type}</span>
        </div>
        <div class="room-card-title">${room.name}</div>
        ${room.notes ? `<div class="room-card-desc">${room.notes}</div>` : ''}
        <div class="room-card-meta">
          ${room.capacity ? `<span>👥 ${room.capacity}</span>` : ''}
          ${room.badge ? `<span>🏷️ ${room.badge}</span>` : ''}
        </div>
        <div class="room-card-actions">
          <button type="button" class="room-lost-found-btn" onclick="window.campusEditor.reportLostInRoom('${room.number}', '${room.name}')">🔍 Lost & Found</button>
          <div style="display: flex; gap: 4px;">
            <button type="button" class="room-btn-icon" title="Edit Room" onclick="window.campusEditor.openRoomEditModal('${room.id}')">✏️</button>
            <button type="button" class="room-btn-icon" title="Delete Room" style="color: #f87171;" onclick="window.campusEditor.deleteRoom('${room.id}')">🗑️</button>
          </div>
        </div>
      `;

      roomsGridContainer.appendChild(card);
    });
  }

  // Add / Edit Room Sub-Modal
  function openRoomAddModal() {
    roomModalHeading.innerText = 'Add Room / Lab';
    editRoomIdInput.value = '';
    roomNumberInput.value = '';
    roomTypeSelect.value = 'Classroom';
    roomNameInput.value = '';
    roomCapacityInput.value = '';
    roomBadgeInput.value = '';
    roomNotesInput.value = '';
    deleteRoomBtn.style.display = 'none';

    roomEditModalBackdrop.style.display = 'flex';
    setTimeout(() => roomNumberInput.focus(), 100);
  }

  function openRoomEditModal(roomId) {
    const place = getActivePlace();
    if (!place) return;
    const floor = place.floors[state.activeFloorIndex];
    if (!floor) return;
    const room = (floor.rooms || []).find(r => r.id === roomId);
    if (!room) return;

    roomModalHeading.innerText = 'Edit Room / Lab';
    editRoomIdInput.value = room.id;
    roomNumberInput.value = room.number;
    roomTypeSelect.value = room.type || 'Classroom';
    roomNameInput.value = room.name;
    roomCapacityInput.value = room.capacity || '';
    roomBadgeInput.value = room.badge || '';
    roomNotesInput.value = room.notes || '';
    deleteRoomBtn.style.display = 'block';

    roomEditModalBackdrop.style.display = 'flex';
    setTimeout(() => roomNameInput.focus(), 100);
  }

  function closeRoomModal() {
    roomEditModalBackdrop.style.display = 'none';
  }

  fpAddRoomBtn.addEventListener('click', openRoomAddModal);
  closeRoomModalBtn.addEventListener('click', closeRoomModal);
  cancelRoomModalBtn.addEventListener('click', closeRoomModal);
  roomEditModalBackdrop.addEventListener('click', (e) => {
    if (e.target === roomEditModalBackdrop) closeRoomModal();
  });

  // Save Room Form
  roomForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const place = getActivePlace();
    if (!place) return;
    const floor = place.floors[state.activeFloorIndex];
    if (!floor) return;

    if (!floor.rooms) floor.rooms = [];

    const id = editRoomIdInput.value || `room_${Date.now()}`;
    const number = roomNumberInput.value.trim();
    const type = roomTypeSelect.value;
    const name = roomNameInput.value.trim();
    const capacity = roomCapacityInput.value.trim();
    const badge = roomBadgeInput.value.trim();
    const notes = roomNotesInput.value.trim();

    const existingIdx = floor.rooms.findIndex(r => r.id === id);
    if (existingIdx >= 0) {
      floor.rooms[existingIdx] = { id, number, type, name, capacity, badge, notes };
    } else {
      floor.rooms.push({ id, number, type, name, capacity, badge, notes });
    }

    syncPlacesToCode();
    renderFloorTabs();
    renderRooms();
    renderAllMarkers();
    renderPlacesDrawer();
    closeRoomModal();

    showSaveToast(`✓ Room ${number} (${name}) saved!`);
  });

  // Delete Room
  function deleteRoom(roomId) {
    const place = getActivePlace();
    if (!place) return;
    const floor = place.floors[state.activeFloorIndex];
    if (!floor || !floor.rooms) return;

    if (confirm('Delete this room/lab?')) {
      floor.rooms = floor.rooms.filter(r => r.id !== roomId);
      syncPlacesToCode();
      renderFloorTabs();
      renderRooms();
      renderAllMarkers();
      renderPlacesDrawer();
      closeRoomModal();
    }
  }

  deleteRoomBtn.addEventListener('click', () => {
    const id = editRoomIdInput.value;
    if (id) deleteRoom(id);
  });

  // Report Lost & Found In Room
  function reportLostInRoom(roomNumber, roomName) {
    const place = getActivePlace();
    const floor = place ? place.floors[state.activeFloorIndex] : null;
    const floorName = floor ? floor.floorName : '';
    const buildingName = place ? place.name : '';
    showSaveToast(`📍 Location selected for Lost & Found: ${buildingName} > ${floorName} > ${roomNumber} (${roomName})`);
  }

  // ==========================================
  // 3D BUILDING LIVE ARCHITECTURAL VIEWER
  // ==========================================
  const building3dModalBackdrop = document.getElementById('building3dModalBackdrop');
  const close3dModalBtn = document.getElementById('close3dModalBtn');
  const b3dTitle = document.getElementById('b3dTitle');
  const b3dSubtitle = document.getElementById('b3dSubtitle');
  const explodeSlider = document.getElementById('explodeSlider');
  const toggleWireframeBtn = document.getElementById('toggleWireframeBtn');
  const reset3dCameraBtn = document.getElementById('reset3dCameraBtn');
  const b3dFloorButtonsList = document.getElementById('b3dFloorButtonsList');
  const b3dRoomHud = document.getElementById('b3dRoomHud');
  const hudRoomCode = document.getElementById('hudRoomCode');
  const hudRoomName = document.getElementById('hudRoomName');
  const hudRoomType = document.getElementById('hudRoomType');
  const hudLostFoundBtn = document.getElementById('hudLostFoundBtn');
  const open3dFromFpBtn = document.getElementById('open3dFromFpBtn');

  const threeState = {
    isInitialized: false,
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    buildingGroup: null,
    floorGroups: [],
    roomMeshes: [],
    activePlace: null,
    isGlass: true,
    isolatedFloorIndex: -1, // -1 means all floors visible
    hoveredMesh: null,
    selectedRoomData: null,
    raycaster: null,
    mouse: null
  };

  const roomType3dColors = {
    'Classroom': 0x3b82f6,
    'Lab': 0x8b5cf6,
    'Faculty': 0x10b981,
    'Seminar': 0xec4899,
    'Admin': 0xf59e0b,
    'Facility': 0x64748b,
    'Other': 0x00f0ff
  };

  function initThreeScene() {
    if (threeState.isInitialized) return;

    const container = document.getElementById('b3dViewportContainer');
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b16);
    scene.fog = new THREE.FogExp2(0x070b16, 0.012);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(30, 26, 38);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document.getElementById('threeCanvas').appendChild(renderer.domElement);

    // Controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Don't go below ground
    controls.minDistance = 10;
    controls.maxDistance = 120;
    controls.target.set(0, 6, 0);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight.position.set(25, 40, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const bluePoint = new THREE.PointLight(0x00f0ff, 1.2, 50);
    bluePoint.position.set(-15, 12, -15);
    scene.add(bluePoint);

    const purplePoint = new THREE.PointLight(0xa855f7, 0.8, 40);
    purplePoint.position.set(15, 8, 15);
    scene.add(purplePoint);

    // Ground Grid & Podium
    const gridHelper = new THREE.GridHelper(60, 30, 0x00f0ff, 0x1e293b);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    const groundGeo = new THREE.PlaneGeometry(80, 80);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x070d1a,
      roughness: 0.9,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    threeState.scene = scene;
    threeState.camera = camera;
    threeState.renderer = renderer;
    threeState.controls = controls;
    threeState.raycaster = raycaster;
    threeState.mouse = mouse;
    threeState.isInitialized = true;

    // Animation Loop
    function animate() {
      requestAnimationFrame(animate);
      controls.update();

      // Subtle slow rotation if idle and not dragging
      renderer.render(scene, camera);
    }
    animate();

    // Resize Handler
    window.addEventListener('resize', onThreeResize);

    // Mouse Interaction
    renderer.domElement.addEventListener('mousemove', on3DMouseMove);
    renderer.domElement.addEventListener('click', on3DMouseClick);
  }

  function onThreeResize() {
    if (!threeState.isInitialized) return;
    const container = document.getElementById('b3dViewportContainer');
    if (!container) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;

    threeState.camera.aspect = w / h;
    threeState.camera.updateProjectionMatrix();
    threeState.renderer.setSize(w, h);
  }

  // Create text sprite for 3D room label
  function makeTextSprite(message, bgColor = 'rgba(15, 23, 42, 0.85)', textColor = '#00f0ff') {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Rounded background
    ctx.fillStyle = bgColor;
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(8, 8, 240, 112, 16);
    ctx.fill();
    ctx.stroke();

    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(message, 128, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(3.2, 1.6, 1);
    return sprite;
  }

  // Build Procedural 3D Building
  function build3DBuilding(place) {
    if (!threeState.scene) return;

    // Clean up previous building
    if (threeState.buildingGroup) {
      threeState.scene.remove(threeState.buildingGroup);
    }

    const buildingGroup = new THREE.Group();
    threeState.buildingGroup = buildingGroup;
    threeState.floorGroups = [];
    threeState.roomMeshes = [];
    threeState.activePlace = place;
    threeState.isolatedFloorIndex = -1;
    explodeSlider.value = 0;

    const floors = place.floors && place.floors.length > 0 ? place.floors : [
      { floorNumber: 0, floorName: 'Ground Floor', rooms: [] },
      { floorNumber: 1, floorName: '1st Floor', rooms: [] }
    ];

    const floorWidth = 22;
    const floorDepth = 16;
    const floorHeight = 4.2;
    const slabThickness = 0.5;

    floors.forEach((floor, fIdx) => {
      const floorGroup = new THREE.Group();
      floorGroup.userData = {
        floorIndex: fIdx,
        floorName: floor.floorName,
        baseY: fIdx * (floorHeight + 0.3)
      };
      floorGroup.position.y = floorGroup.userData.baseY;

      // Concrete Floor Slab
      const slabGeo = new THREE.BoxGeometry(floorWidth, slabThickness, floorDepth);
      const slabMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.7,
        metalness: 0.2
      });
      const slab = new THREE.Mesh(slabGeo, slabMat);
      slab.position.y = slabThickness / 2;
      slab.receiveShadow = true;
      slab.castShadow = true;
      floorGroup.add(slab);

      // Glass Exterior Facade Perimeter
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: threeState.isGlass ? 0.22 : 0.85,
        roughness: 0.1,
        metalness: 0.1,
        transmission: threeState.isGlass ? 0.6 : 0,
        ior: 1.4,
        depthWrite: false
      });
      const exteriorGeo = new THREE.BoxGeometry(floorWidth - 0.2, floorHeight - slabThickness, floorDepth - 0.2);
      const exterior = new THREE.Mesh(exteriorGeo, glassMat);
      exterior.position.y = floorHeight / 2;
      floorGroup.add(exterior);

      // Floor Columns / Pillars
      const pillarGeo = new THREE.CylinderGeometry(0.3, 0.3, floorHeight, 8);
      const pillarMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, metalness: 0.5, roughness: 0.4 });

      [
        [-floorWidth/2 + 0.8, -floorDepth/2 + 0.8],
        [floorWidth/2 - 0.8, -floorDepth/2 + 0.8],
        [-floorWidth/2 + 0.8, floorDepth/2 - 0.8],
        [floorWidth/2 - 0.8, floorDepth/2 - 0.8]
      ].forEach(([px, pz]) => {
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.set(px, floorHeight / 2, pz);
        floorGroup.add(pillar);
      });

      // Rooms Layout inside Floor
      const rooms = floor.rooms && floor.rooms.length > 0 ? floor.rooms : [
        { id: `demo_r_${fIdx}_1`, number: `${fIdx === 0 ? 'G' : fIdx}01`, name: `${fIdx === 0 ? 'Admin Office' : 'Lecture Hall 1'}`, type: fIdx === 0 ? 'Admin' : 'Classroom' },
        { id: `demo_r_${fIdx}_2`, number: `${fIdx === 0 ? 'G' : fIdx}02`, name: `${fIdx === 0 ? 'Basic Lab' : 'Computer Lab'}`, type: 'Lab' },
        { id: `demo_r_${fIdx}_3`, number: `${fIdx === 0 ? 'G' : fIdx}03`, name: 'Faculty Cabin', type: 'Faculty' },
        { id: `demo_r_${fIdx}_4`, number: `${fIdx === 0 ? 'G' : fIdx}04`, name: 'Classroom', type: 'Classroom' }
      ];

      // Place rooms in 2 rows
      const numRooms = rooms.length;
      const cols = Math.min(4, Math.ceil(numRooms / 2));
      const colWidth = (floorWidth - 3) / cols;
      const rowDepth = (floorDepth - 4) / 2;

      rooms.forEach((room, rIdx) => {
        const row = Math.floor(rIdx / cols);
        const col = rIdx % cols;

        const rx = -floorWidth/2 + 1.5 + col * colWidth + colWidth/2;
        const rz = row === 0 ? -floorDepth/4 : floorDepth/4;
        const rw = colWidth - 0.6;
        const rd = rowDepth - 0.6;
        const rh = floorHeight * 0.75;

        const roomColor = roomType3dColors[room.type] || 0x00f0ff;
        const roomGeo = new THREE.BoxGeometry(rw, rh, rd);
        const roomMat = new THREE.MeshStandardMaterial({
          color: roomColor,
          roughness: 0.35,
          metalness: 0.3,
          emissive: 0x000000
        });

        const roomMesh = new THREE.Mesh(roomGeo, roomMat);
        roomMesh.position.set(rx, rh / 2 + slabThickness, rz);
        roomMesh.castShadow = true;
        roomMesh.receiveShadow = true;

        roomMesh.userData = {
          isRoom: true,
          room: room,
          floorIndex: fIdx,
          floorName: floor.floorName,
          baseColor: roomColor,
          placeName: place.name
        };

        // Add 3D Text Badge on top
        const labelSprite = makeTextSprite(room.number, 'rgba(11, 17, 32, 0.85)', '#38bdf8');
        labelSprite.position.set(0, rh/2 + 1.2, 0);
        roomMesh.add(labelSprite);

        floorGroup.add(roomMesh);
        threeState.roomMeshes.push(roomMesh);
      });

      buildingGroup.add(floorGroup);
      threeState.floorGroups.push(floorGroup);
    });

    // Rooftop Structure
    const roofY = floors.length * (floorHeight + 0.3);
    const roofGroup = new THREE.Group();
    roofGroup.userData = { baseY: roofY };
    roofGroup.position.y = roofY;

    // Roof slab
    const roofSlabGeo = new THREE.BoxGeometry(floorWidth + 0.8, 0.6, floorDepth + 0.8);
    const roofSlabMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });
    const roofSlab = new THREE.Mesh(roofSlabGeo, roofSlabMat);
    roofSlab.position.y = 0.3;
    roofGroup.add(roofSlab);

    // Rooftop Solar / AC Chillers
    const chillerGeo = new THREE.BoxGeometry(4, 2, 3);
    const chillerMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
    const chiller = new THREE.Mesh(chillerGeo, chillerMat);
    chiller.position.set(-5, 1.6, 0);
    roofGroup.add(chiller);

    // Elevator shaft penthouse
    const shaftGeo = new THREE.BoxGeometry(5, 3.5, 4);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.position.set(4, 2.3, 0);
    roofGroup.add(shaft);

    buildingGroup.add(roofGroup);
    threeState.floorGroups.push(roofGroup);

    threeState.scene.add(buildingGroup);

    // Build Floor Buttons Panel
    build3DFloorButtons(floors);
  }

  // 3D Floor Selector Panel
  function build3DFloorButtons(floors) {
    b3dFloorButtonsList.innerHTML = '';

    const allBtn = document.createElement('button');
    allBtn.className = 'b3d-floor-btn active';
    allBtn.innerText = '🏢 All Floors';
    allBtn.addEventListener('click', () => isolate3DFloor(-1));
    b3dFloorButtonsList.appendChild(allBtn);

    floors.forEach((f, idx) => {
      const btn = document.createElement('button');
      btn.className = 'b3d-floor-btn';
      btn.innerText = `Lvl ${idx}: ${f.floorName}`;
      btn.addEventListener('click', () => isolate3DFloor(idx));
      b3dFloorButtonsList.appendChild(btn);
    });
  }

  function isolate3DFloor(floorIdx) {
    threeState.isolatedFloorIndex = floorIdx;

    // Update UI active state
    const btns = b3dFloorButtonsList.querySelectorAll('.b3d-floor-btn');
    btns.forEach((b, i) => {
      b.classList.toggle('active', floorIdx === -1 ? i === 0 : i === floorIdx + 1);
    });

    // Toggle Floor Visibility in 3D
    threeState.floorGroups.forEach((group, idx) => {
      if (floorIdx === -1) {
        group.visible = true;
      } else {
        group.visible = (idx === floorIdx);
      }
    });

    if (floorIdx >= 0) {
      explodeSlider.value = 0;
      updateExplode(0);
      threeState.controls.target.set(0, floorIdx * 4.5 + 2, 0);
    } else {
      threeState.controls.target.set(0, (threeState.floorGroups.length * 4.5) / 2, 0);
    }
  }

  // Explode Floors Animation
  function updateExplode(val) {
    const explodeOffset = (val / 100) * 4.5;
    threeState.floorGroups.forEach((group, idx) => {
      const baseY = group.userData.baseY || 0;
      group.position.y = baseY + (idx * explodeOffset * 3);
    });
  }

  explodeSlider.addEventListener('input', (e) => {
    updateExplode(parseFloat(e.target.value));
  });

  // Toggle Glass / Wireframe
  toggleWireframeBtn.addEventListener('click', () => {
    threeState.isGlass = !threeState.isGlass;
    toggleWireframeBtn.innerText = threeState.isGlass ? '🪟 Glass View' : '🧱 Solid View';
    if (threeState.activePlace) {
      build3DBuilding(threeState.activePlace);
    }
  });

  // Reset Camera
  reset3dCameraBtn.addEventListener('click', () => {
    threeState.camera.position.set(30, 26, 38);
    threeState.controls.target.set(0, 6, 0);
  });

  // Mouse Move Raycasting
  function on3DMouseMove(e) {
    const rect = threeState.renderer.domElement.getBoundingClientRect();
    threeState.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    threeState.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    threeState.raycaster.setFromCamera(threeState.mouse, threeState.camera);
    const intersects = threeState.raycaster.intersectObjects(threeState.roomMeshes);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      if (threeState.hoveredMesh !== hit) {
        if (threeState.hoveredMesh && threeState.hoveredMesh.material) {
          threeState.hoveredMesh.material.emissive.setHex(0x000000);
        }
        threeState.hoveredMesh = hit;
        hit.material.emissive.setHex(0x443300); // Warm gold hover
        threeState.renderer.domElement.style.cursor = 'pointer';
      }
    } else {
      if (threeState.hoveredMesh && threeState.hoveredMesh.material) {
        threeState.hoveredMesh.material.emissive.setHex(0x000000);
      }
      threeState.hoveredMesh = null;
      threeState.renderer.domElement.style.cursor = 'default';
    }
  }

  // Mouse Click on Room
  function on3DMouseClick(e) {
    const rect = threeState.renderer.domElement.getBoundingClientRect();
    threeState.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    threeState.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    threeState.raycaster.setFromCamera(threeState.mouse, threeState.camera);
    const intersects = threeState.raycaster.intersectObjects(threeState.roomMeshes);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const data = hit.userData;
      if (data && data.room) {
        threeState.selectedRoomData = data;
        hudRoomCode.innerText = data.room.number || 'Room';
        hudRoomName.innerText = data.room.name || 'Classroom / Lab';
        hudRoomType.innerText = `${data.floorName} &bull; ${data.room.type || 'Room'} ${data.room.capacity ? `&bull; ${data.room.capacity}` : ''}`;
        b3dRoomHud.style.display = 'flex';
      }
    } else {
      b3dRoomHud.style.display = 'none';
    }
  }

  hudLostFoundBtn.addEventListener('click', () => {
    if (threeState.selectedRoomData) {
      const { room, floorName, placeName } = threeState.selectedRoomData;
      showSaveToast(`📍 3D Selected: ${placeName} > ${floorName} > ${room.number} (${room.name})`);
    }
  });

  // Open 3D Viewer Modal
  function open3DBuildingViewer(placeId) {
    const place = state.places.find(p => p.id === placeId);
    if (!place) return;

    b3dTitle.innerText = `${place.name} — 3D Live Model`;
    b3dSubtitle.innerText = `${place.category} &bull; Interactive 3D Architectural Cutaway`;

    initThreeScene();
    build3DBuilding(place);

    building3dModalBackdrop.style.display = 'flex';

    setTimeout(() => {
      onThreeResize();
      threeState.controls.target.set(0, 6, 0);
      threeState.camera.position.set(30, 26, 38);
    }, 150);
  }

  function close3DModal() {
    building3dModalBackdrop.style.display = 'none';
    b3dRoomHud.style.display = 'none';
  }

  close3dModalBtn.addEventListener('click', close3DModal);
  building3dModalBackdrop.addEventListener('click', (e) => {
    if (e.target === building3dModalBackdrop) close3DModal();
  });

  open3dFromFpBtn.addEventListener('click', () => {
    if (state.activeFloorPlaceId) {
      open3DBuildingViewer(state.activeFloorPlaceId);
    }
  });

  // Drawer Controls
  const placesSidebar = document.getElementById('placesSidebar');
  document.getElementById('togglePlacesSidebarBtn').addEventListener('click', () => {
    placesSidebar.classList.toggle('open');
  });
  document.getElementById('closeDrawerBtn').addEventListener('click', () => {
    placesSidebar.classList.remove('open');
  });
  document.getElementById('addNewPlaceDrawerBtn').addEventListener('click', () => {
    placesSidebar.classList.remove('open');
    setAddMode(true);
  });

  // Reset View
  document.getElementById('resetViewBtn').addEventListener('click', () => {
    map.fitBounds(campusBounds, { padding: [40, 40], animate: true });
  });

  // Toggle Mask
  const toggleMaskBtn = document.getElementById('toggleMaskBtn');
  toggleMaskBtn.addEventListener('click', () => {
    state.isMaskOn = !state.isMaskOn;
    maskLayer.setStyle({
      fillOpacity: state.isMaskOn ? 0.70 : 0.0
    });
    toggleMaskBtn.classList.toggle('active', state.isMaskOn);
    toggleMaskBtn.querySelector('span').innerText = state.isMaskOn ? 'Surroundings: Frosted Dim' : 'Surroundings: Clear';
  });

  window.campusEditor = {
    openEditModal,
    deletePlace,
    openFloorPlanModal,
    open3DBuildingViewer,
    openRoomAddModal,
    openRoomEditModal,
    deleteRoom,
    reportLostInRoom
  };

  // Load from code
  loadPlacesFromCode();
});


