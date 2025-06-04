// src/component/Map.js
import React, { useRef, useEffect, useState } from "react";
import * as mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./Map.css";
import { 
  IconButton, 
  Paper, 
  InputBase,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Button,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Menu,
  MenuItem,
  ListItemButton
} from '@mui/material';
import {
  Search as SearchIcon,
  DirectionsCar,
  DirectionsWalk,
  DirectionsBike,
  DirectionsBus,
  MyLocation,
  LocationOn,
  Navigation as NavigationIcon,
  Park,
  Museum,
  Restaurant,
  Attractions,
  FilterList,
  Layers as LayersIcon,
  Map as MapIcon,
  Terrain,
  Satellite
} from '@mui/icons-material';

// Use environment variable for Mapbox token
const token = process.env.REACT_APP_MAPBOX_TOKEN;
if (!token) {
  throw new Error(
    "You need to provide a Mapbox token in your .env file. See .env.example for more info."
  );
}
mapboxgl.accessToken = token;

const TRANSPORT_MODES = [
  { id: 'driving', label: 'Drive', icon: <DirectionsCar />, emoji: '🚗' },
  { id: 'walking', label: 'Walk', icon: <DirectionsWalk />, emoji: '🚶' },
  { id: 'cycling', label: 'Bike', icon: <DirectionsBike />, emoji: '🚲' },
  { id: 'driving-traffic', label: 'Transit', icon: <DirectionsBus />, emoji: '🚌' },
];

// Navigation instruction icons
const INSTRUCTION_ICONS = {
  turn_right: '↱',
  turn_left: '↰',
  turn_slight_right: '↱',
  turn_slight_left: '↰',
  turn_sharp_right: '⮮',
  turn_sharp_left: '⮭',
  uturn: '⮪',
  straight: '⭧',
  merge: '⭇',
  roundabout: '⭮',
  arrive: '📍',
  depart: '🚩'
};

// Sample location data
const LOCATIONS = [
  {
    id: 1,
    name: "Central Park",
    category: "park",
    description: "A beautiful urban park in the heart of the city",
    coordinates: [-73.9654, 40.7829],
    image: "https://images.unsplash.com/photo-1534270804882-6b5048b1c1fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 2,
    name: "Museum of Modern Art",
    category: "museum",
    description: "World-renowned modern art museum",
    coordinates: [-73.9776, 40.7614],
    image: "https://images.unsplash.com/photo-1553701879-4aa576804f65?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 3,
    name: "Le Bernardin",
    category: "restaurant",
    description: "Upscale French seafood restaurant",
    coordinates: [-73.9819, 40.7616],
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 4,
    name: "Times Square",
    category: "attraction",
    description: "Famous commercial intersection and tourist destination",
    coordinates: [-73.9855, 40.7580],
    image: "https://images.unsplash.com/photo-1534430480872-3498386e7856?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 5,
    name: "Bryant Park",
    category: "park",
    description: "Popular public park behind the New York Public Library",
    coordinates: [-73.9832, 40.7536],
    image: "https://images.unsplash.com/photo-1534251369789-5067c8b8602a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
  }
];

// Category-specific marker SVGs
const CATEGORY_MARKERS = {
  park: `
    <svg width="30" height="40" viewBox="0 0 30 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0C6.71573 0 0 6.71573 0 15C0 25 15 40 15 40C15 40 30 25 30 15C30 6.71573 23.2843 0 15 0Z" fill="#2ecc71"/>
      <path d="M15 7C11.134 7 8 10.134 8 14C8 17.866 11.134 21 15 21C18.866 21 22 17.866 22 14C22 10.134 18.866 7 15 7Z" fill="white"/>
      <path d="M15 9L17 13H13L15 9Z" fill="#2ecc71"/>
      <path d="M15 19C16.6569 19 18 17.6569 18 16C18 14.3431 16.6569 13 15 13C13.3431 13 12 14.3431 12 16C12 17.6569 13.3431 19 15 19Z" fill="#2ecc71"/>
    </svg>
  `,
  museum: `
    <svg width="30" height="40" viewBox="0 0 30 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0C6.71573 0 0 6.71573 0 15C0 25 15 40 15 40C15 40 30 25 30 15C30 6.71573 23.2843 0 15 0Z" fill="#e74c3c"/>
      <path d="M7 19V12L15 8L23 12V19H7Z" fill="white"/>
      <path d="M9 19V13H11V19H9ZM13 19V13H15V19H13ZM17 19V13H19V19H17Z" fill="#e74c3c"/>
      <path d="M6 20H24V22H6V20Z" fill="white"/>
    </svg>
  `,
  restaurant: `
    <svg width="30" height="40" viewBox="0 0 30 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0C6.71573 0 0 6.71573 0 15C0 25 15 40 15 40C15 40 30 25 30 15C30 6.71573 23.2843 0 15 0Z" fill="#f1c40f"/>
      <path d="M12 8V22M18 8V22M15 8V12M9 8V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V8M21 8V12C21 13.6569 19.6569 15 18 15C16.3431 15 15 13.6569 15 12V8" stroke="white" stroke-width="2"/>
    </svg>
  `,
  attraction: `
    <svg width="30" height="40" viewBox="0 0 30 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0C6.71573 0 0 6.71573 0 15C0 25 15 40 15 40C15 40 30 25 30 15C30 6.71573 23.2843 0 15 0Z" fill="#9b59b6"/>
      <path d="M15 8L17.5 13.5L23 14.5L19 18.5L20 24L15 21.5L10 24L11 18.5L7 14.5L12.5 13.5L15 8Z" fill="white"/>
    </svg>
  `
};

// Add category icons mapping
const CATEGORY_ICONS = {
  all: <FilterList />,
  park: <Park />,
  museum: <Museum />,
  restaurant: <Restaurant />,
  attraction: <Attractions />
};

// Add map styles
const MAP_STYLES = [
  {
    id: 'streets',
    name: 'Streets',
    url: 'mapbox://styles/mapbox/streets-v12',
    icon: <MapIcon />
  },
  {
    id: 'satellite',
    name: 'Satellite',
    url: 'mapbox://styles/mapbox/satellite-v9',
    icon: <Satellite />
  },
  {
    id: 'satellite-streets',
    name: 'Satellite with Labels',
    url: 'mapbox://styles/mapbox/satellite-streets-v12',
    icon: <Satellite />
  },
  {
    id: 'light',
    name: 'Light',
    url: 'mapbox://styles/mapbox/light-v11',
    icon: <MapIcon />
  },
  {
    id: 'dark',
    name: 'Dark',
    url: 'mapbox://styles/mapbox/dark-v11',
    icon: <MapIcon />
  },
  {
    id: 'outdoors',
    name: 'Outdoors',
    url: 'mapbox://styles/mapbox/outdoors-v12',
    icon: <Terrain />
  },
  {
    id: 'navigation-day',
    name: 'Navigation Day',
    url: 'mapbox://styles/mapbox/navigation-day-v1',
    icon: <DirectionsCar />
  },
  {
    id: 'navigation-night',
    name: 'Navigation Night',
    url: 'mapbox://styles/mapbox/navigation-night-v1',
    icon: <DirectionsCar />
  }
];

const Map = () => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [lng, setLng] = useState(-73.9855);
  const [lat, setLat] = useState(40.7580);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [markers, setMarkers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [searchMarker, setSearchMarker] = useState(null);
  const searchTimeout = useRef(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [selectedMode, setSelectedMode] = useState('driving');
  const routeLayerId = useRef('route');
  const [showDirections, setShowDirections] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationInstructions, setNavigationInstructions] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const userMarker = useRef(null);
  const watchId = useRef(null);
  const [nextInstruction, setNextInstruction] = useState(null);
  const [remainingDistance, setRemainingDistance] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const accuracyCircleRef = useRef(null);
  const [currentStyle, setCurrentStyle] = useState('light');
  const [styleMenuAnchor, setStyleMenuAnchor] = useState(null);

  const categories = ["all", "park", "museum", "restaurant", "attraction"];

  const createCustomMarkerElement = (category) => {
    const el = document.createElement('div');
    el.className = 'custom-marker';
    el.innerHTML = CATEGORY_MARKERS[category] || CATEGORY_MARKERS['attraction'];
    return el;
  };

  const addMarkers = (locations) => {
    // Remove existing markers
    markers.forEach(marker => marker.remove());
    const newMarkers = [];

    locations.forEach(location => {
      // Create custom popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="popup-content">
          <img src="${location.image}" alt="${location.name}" />
          <h3>${location.name}</h3>
          <p>${location.description}</p>
        </div>
      `);

      // Create custom marker element
      const el = createCustomMarkerElement(location.category);

      // Create and add marker
      const marker = new mapboxgl.Marker({
        element: el,
      })
        .setLngLat(location.coordinates)
        .setPopup(popup)
        .addTo(mapRef.current);

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);
  };

  const getCategoryColor = (category) => {
    const colors = {
      park: "#2ecc71",
      museum: "#e74c3c",
      restaurant: "#f1c40f",
      attraction: "#9b59b6"
    };
    return colors[category] || "#3498db";
  };

  const fetchLocationSuggestions = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${mapboxgl.accessToken}&types=place,address,poi&limit=5`
      );
      const data = await response.json();
      setSuggestions(data.features);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    }
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Set new timeout for debouncing
    searchTimeout.current = setTimeout(() => {
      fetchLocationSuggestions(value);
    }, 300);
  };

  const createCurrentLocationMarker = () => {
    const el = document.createElement('div');
    el.className = 'current-location-marker';
    
    // Create pulse effect
    const pulse = document.createElement('div');
    pulse.className = 'pulse';
    el.appendChild(pulse);

    // Create main dot
    const dot = document.createElement('div');
    dot.className = 'dot';
    el.appendChild(dot);

    // Create direction arrow
    const arrow = document.createElement('div');
    arrow.className = 'arrow';
    el.appendChild(arrow);

    return el;
  };

  const updateCurrentLocationMarker = (position) => {
    const { longitude, latitude, accuracy, heading } = position.coords;
    const userLocation = [longitude, latitude];

    // Update or create user marker
    if (!userMarker.current) {
      const el = createCurrentLocationMarker();
      userMarker.current = new mapboxgl.Marker({
        element: el,
        rotationAlignment: 'map',
        pitchAlignment: 'map'
      }).setLngLat(userLocation).addTo(mapRef.current);
    } else {
      userMarker.current.setLngLat(userLocation);
    }

    // Update arrow visibility and rotation based on heading
    const markerElement = userMarker.current.getElement();
    const arrow = markerElement.querySelector('.arrow');
    if (heading !== null && heading !== undefined) {
      arrow.style.display = 'block';
      arrow.style.transform = `translate(-50%, -50%) rotate(${heading}deg)`;
    } else {
      arrow.style.display = 'none';
    }

    // Update or create accuracy circle
    if (accuracy) {
      // Convert accuracy radius from meters to pixels at current zoom level
      const zoom = mapRef.current.getZoom();
      const metersPerPixel = 156543.03392 * Math.cos(latitude * Math.PI / 180) / Math.pow(2, zoom);
      const radiusInPixels = accuracy / metersPerPixel;

      if (!accuracyCircleRef.current) {
        // Create accuracy circle element
        const circleElement = document.createElement('div');
        circleElement.className = 'accuracy-circle';
        
        // Add circle to the map as a marker
        accuracyCircleRef.current = new mapboxgl.Marker({
          element: circleElement,
          rotationAlignment: 'map',
          pitchAlignment: 'map'
        }).setLngLat(userLocation).addTo(mapRef.current);
      }

      // Update circle size and position
      const circleElement = accuracyCircleRef.current.getElement();
      circleElement.style.width = `${radiusInPixels * 2}px`;
      circleElement.style.height = `${radiusInPixels * 2}px`;
      accuracyCircleRef.current.setLngLat(userLocation);
    }

    // Update current location state
    setCurrentLocation(userLocation);

    // If navigating, update map view
    if (isNavigating) {
      mapRef.current.easeTo({
        center: userLocation,
        zoom: 16,
        bearing: heading || 0
      });
    }

    // Update navigation if active
    if (isNavigating) {
      updateNavigationProgress(userLocation);
    }
  };

  const startNavigation = () => {
    setIsNavigating(true);
    
    // Start watching user's position with high accuracy
    watchId.current = navigator.geolocation.watchPosition(
      updateCurrentLocationMarker,
      (error) => {
        console.error('Error watching position:', error);
        stopNavigation();
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    );
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    if (watchId.current) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    if (userMarker.current) {
      userMarker.current.remove();
      userMarker.current = null;
    }
    if (accuracyCircleRef.current) {
      accuracyCircleRef.current.remove();
      accuracyCircleRef.current = null;
    }
    setNextInstruction(null);
    setRemainingDistance(null);
    setEstimatedTime(null);
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateCurrentLocationMarker(position);
          resolve([position.coords.longitude, position.coords.latitude]);
        },
        (error) => {
          console.error("Error getting location:", error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    });
  };

  const formatDistance = (meters) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  };

  const updateNavigationProgress = (userLocation) => {
    if (!navigationInstructions.length || !routeInfo) return;

    // Find the closest point on the route to the user's location
    const coordinates = mapRef.current.getSource(routeLayerId.current)._data.geometry.coordinates;
    let minDistance = Infinity;
    let closestPointIndex = 0;

    coordinates.forEach((coord, index) => {
      const distance = getDistance(userLocation, coord);
      if (distance < minDistance) {
        minDistance = distance;
        closestPointIndex = index;
      }
    });

    // Update current navigation step based on user's progress
    const currentInstruction = navigationInstructions.find((instruction, index) => {
      return closestPointIndex <= instruction.index && 
             (index === navigationInstructions.length - 1 || 
              closestPointIndex < navigationInstructions[index + 1].index);
    });

    if (currentInstruction) {
      const stepIndex = navigationInstructions.indexOf(currentInstruction);
      if (stepIndex !== currentStep) {
        setCurrentStep(stepIndex);
        setNextInstruction(currentInstruction);
      }

      // Calculate remaining distance and time
      const remainingCoords = coordinates.slice(closestPointIndex);
      const distance = calculateRouteDistance(remainingCoords);
      setRemainingDistance(formatDistance(distance));
      setEstimatedTime(formatDuration(distance / getAverageSpeed(selectedMode)));
    }

    // Check if arrived at destination
    const distanceToDestination = getDistance(userLocation, coordinates[coordinates.length - 1]);
    if (distanceToDestination < 0.02) { // 20 meters threshold
      stopNavigation();
      alert('You have arrived at your destination!');
    }
  };

  const getDistance = (point1, point2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = point1[1] * Math.PI / 180;
    const φ2 = point2[1] * Math.PI / 180;
    const Δφ = (point2[1] - point1[1]) * Math.PI / 180;
    const Δλ = (point2[0] - point1[0]) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  const calculateRouteDistance = (coordinates) => {
    let distance = 0;
    for (let i = 1; i < coordinates.length; i++) {
      distance += getDistance(coordinates[i-1], coordinates[i]);
    }
    return distance;
  };

  const getAverageSpeed = (mode) => {
    // Average speeds in meters per second
    const speeds = {
      driving: 13.89, // 50 km/h
      walking: 1.4,   // 5 km/h
      cycling: 4.17,  // 15 km/h
      'driving-traffic': 8.33 // 30 km/h
    };
    return speeds[mode] || speeds.driving;
  };

  const getRoute = async (start, end, mode) => {
    try {
      const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/${mode}/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`
      );
      const json = await query.json();
      
      if (json.routes && json.routes[0]) {
        const route = json.routes[0];
        const { distance, duration, geometry, legs } = route;

        // Process navigation instructions
        const instructions = legs[0].steps.map((step, index) => ({
          instruction: step.maneuver.instruction,
          distance: formatDistance(step.distance),
          duration: formatDuration(step.duration),
          type: step.maneuver.type,
          modifier: step.maneuver.modifier,
          index: geometry.coordinates.findIndex(coord => 
            coord[0] === step.maneuver.location[0] && 
            coord[1] === step.maneuver.location[1]
          ),
          icon: getInstructionIcon(step.maneuver.type, step.maneuver.modifier)
        }));

        setNavigationInstructions(instructions);

        // Remove existing route layer and source
        if (mapRef.current.getLayer(routeLayerId.current)) {
          mapRef.current.removeLayer(routeLayerId.current);
        }
        if (mapRef.current.getSource(routeLayerId.current)) {
          mapRef.current.removeSource(routeLayerId.current);
        }

        // Add new route layer
        mapRef.current.addSource(routeLayerId.current, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: geometry
          }
        });

        mapRef.current.addLayer({
          id: routeLayerId.current,
          type: 'line',
          source: routeLayerId.current,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3887be',
            'line-width': 5,
            'line-opacity': 0.75
          }
        });

        // Fit map to show the entire route
        const bounds = new mapboxgl.LngLatBounds();
        geometry.coordinates.forEach(coord => bounds.extend(coord));
        mapRef.current.fitBounds(bounds, {
          padding: 50
        });

        setRouteInfo({
          distance: formatDistance(distance),
          duration: formatDuration(duration)
        });
      }
    } catch (error) {
      console.error('Error getting route:', error);
    }
  };

  const getInstructionIcon = (type, modifier) => {
    const key = modifier ? `${type}_${modifier}` : type;
    return INSTRUCTION_ICONS[key] || '➡️';
  };

  const handleSuggestionClick = async (suggestion) => {
    const [lng, lat] = suggestion.center;
    setSearchQuery(suggestion.place_name);
    setSuggestions([]);
    setSelectedLocation([lng, lat]);

    // Remove previous search marker if it exists
    if (searchMarker) {
      searchMarker.remove();
    }

    // Add new marker
    const newMarker = new mapboxgl.Marker({ color: "#FF0000" })
      .setLngLat([lng, lat])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div class="popup-content"><h3>${suggestion.place_name}</h3></div>`
        )
      )
      .addTo(mapRef.current);

    setSearchMarker(newMarker);
    setShowDirections(true);

    try {
      const currentLoc = await getCurrentLocation();
      await getRoute(currentLoc, [lng, lat], selectedMode);
    } catch (error) {
      console.error('Error setting up route:', error);
    }
  };

  const handleModeChange = async (mode) => {
    setSelectedMode(mode);
    if (currentLocation && selectedLocation) {
      await getRoute(currentLocation, selectedLocation, mode);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = searchQuery.toLowerCase();
    
    // First check predefined locations
    const location = LOCATIONS.find(loc => 
      loc.name.toLowerCase().includes(searchTerm) ||
      loc.category.toLowerCase().includes(searchTerm)
    );

    if (location) {
      if (searchMarker) {
        searchMarker.remove();
      }
      
      mapRef.current.flyTo({
        center: location.coordinates,
        zoom: 15,
        essential: true
      });
    }
  };

  const filterLocations = (category) => {
    setActiveCategory(category);
    const filteredLocations = category === "all" 
      ? LOCATIONS 
      : LOCATIONS.filter(loc => loc.category === category);
    addMarkers(filteredLocations);
  };

  const handleCategoryChange = (event, newCategory) => {
    if (newCategory !== null) {
      setActiveCategory(newCategory);
      filterLocations(newCategory);
    }
  };

  // Add style switching function
  const handleStyleChange = (styleId) => {
    setCurrentStyle(styleId);
    if (mapRef.current) {
      const style = MAP_STYLES.find(s => s.id === styleId);
      if (style) {
        mapRef.current.setStyle(style.url);
      }
    }
    setStyleMenuAnchor(null);
  };

  // Handle style menu
  const handleStyleMenuOpen = (event) => {
    setStyleMenuAnchor(event.currentTarget);
  };

  const handleStyleMenuClose = () => {
    setStyleMenuAnchor(null);
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAP_STYLES.find(s => s.id === currentStyle)?.url || MAP_STYLES[0].url,
      center: [lng, lat],
      zoom: 12,
    });

    // Create a custom container for controls
    const customControlsContainer = document.createElement('div');
    customControlsContainer.className = 'custom-map-controls';

    // Add navigation controls (zoom and compass) to custom container
    mapRef.current.addControl(
      new mapboxgl.NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: true
      }), 
      'bottom-right'
    );

    // Add geolocate control
    mapRef.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showAccuracyCircle: true
      }),
      'bottom-right'
    );

    // Add markers for all locations initially
    addMarkers(LOCATIONS);

    // Cleanup
    return () => {
      if (searchMarker) {
        searchMarker.remove();
      }
      markers.forEach(marker => marker.remove());
      mapRef.current.remove();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (watchId.current) {
        navigator.geolocation.clearWatch(watchId.current);
      }
      if (userMarker.current) {
        userMarker.current.remove();
      }
      if (accuracyCircleRef.current) {
        accuracyCircleRef.current.remove();
      }
    };
  }, []);

  return (
    <div>
      <Paper className="search-container" elevation={3}>
        <form onSubmit={handleSearch}>
          <Box className="search-input-container">
            <IconButton sx={{ p: '10px' }} aria-label="search">
              <SearchIcon />
            </IconButton>
            <InputBase
              className="search-input"
              placeholder="Search locations..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              fullWidth
              autoComplete="off"
            />
            <IconButton 
              sx={{ p: '10px' }}
              onClick={() => getCurrentLocation()}
              aria-label="current location"
            >
              <MyLocation />
            </IconButton>
          </Box>
          {suggestions.length > 0 && (
            <Paper className="suggestions-container" elevation={3}>
              <List>
                {suggestions.map((suggestion) => (
                  <ListItem
                    key={suggestion.id}
                    button
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <ListItemIcon>
                      <LocationOn />
                    </ListItemIcon>
                    <ListItemText 
                      primary={suggestion.place_name}
                      primaryTypographyProps={{
                        style: { fontSize: '14px' }
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </form>
      </Paper>

      <Paper className="filter-container" elevation={3}>
        <ToggleButtonGroup
          value={activeCategory}
          exclusive
          onChange={handleCategoryChange}
          aria-label="location categories"
          className="filter-button-group"
        >
          {categories.map(category => (
            <ToggleButton 
              key={category} 
              value={category}
              aria-label={category}
              className="filter-toggle-button"
            >
              <Box className="filter-button-content">
                {CATEGORY_ICONS[category]}
                <Typography variant="caption">
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Typography>
              </Box>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Paper>

      {showDirections && (
        <Paper className="directions-container" elevation={3}>
          <Box className="transport-modes">
            {TRANSPORT_MODES.map((mode) => (
              <Button
                key={mode.id}
                className={`mode-button ${selectedMode === mode.id ? 'active' : ''}`}
                onClick={() => handleModeChange(mode.id)}
                title={mode.label}
                startIcon={mode.icon}
              >
                {mode.label}
              </Button>
            ))}
          </Box>
          {routeInfo && (
            <>
              <Box className="route-info">
                <Box className="info-item">
                  <Typography variant="caption" className="info-label">
                    Distance
                  </Typography>
                  <Typography variant="body1" className="info-value">
                    {routeInfo.distance}
                  </Typography>
                </Box>
                <Box className="info-item">
                  <Typography variant="caption" className="info-label">
                    Duration
                  </Typography>
                  <Typography variant="body1" className="info-value">
                    {routeInfo.duration}
                  </Typography>
                </Box>
              </Box>
              {!isNavigating ? (
                <Button
                  className="start-navigation-button"
                  onClick={startNavigation}
                  fullWidth
                  startIcon={<NavigationIcon />}
                >
                  Start Navigation
                </Button>
              ) : (
                <Button
                  className="stop-navigation-button"
                  onClick={stopNavigation}
                  fullWidth
                  color="error"
                >
                  Stop Navigation
                </Button>
              )}
            </>
          )}
          {isNavigating && nextInstruction && (
            <Box className="navigation-instructions">
              <Box className="next-instruction">
                <Typography className="instruction-icon">
                  {nextInstruction.icon}
                </Typography>
                <Typography className="instruction-text">
                  {nextInstruction.instruction}
                </Typography>
                <Typography className="instruction-distance">
                  {nextInstruction.distance}
                </Typography>
              </Box>
              <Box className="navigation-progress">
                <Box className="progress-item">
                  <Typography variant="caption" className="progress-label">
                    Remaining
                  </Typography>
                  <Typography variant="body2" className="progress-value">
                    {remainingDistance}
                  </Typography>
                </Box>
                <Box className="progress-item">
                  <Typography variant="caption" className="progress-label">
                    ETA
                  </Typography>
                  <Typography variant="body2" className="progress-value">
                    {estimatedTime}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Paper>
      )}

      {/* Add style switcher button */}
      <Paper className="style-switcher" elevation={3}>
        <IconButton
          onClick={handleStyleMenuOpen}
          size="large"
          className="style-button"
          aria-label="Change map style"
          aria-controls="style-menu"
          aria-haspopup="true"
        >
          <LayersIcon />
        </IconButton>
      </Paper>

      {/* Style selection menu */}
      <Menu
        id="style-menu"
        anchorEl={styleMenuAnchor}
        open={Boolean(styleMenuAnchor)}
        onClose={handleStyleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1,
            '& .MuiList-root': {
              padding: '8px 0',
            },
          },
        }}
      >
        {MAP_STYLES.map((style) => (
          <MenuItem
            key={style.id}
            onClick={() => handleStyleChange(style.id)}
            selected={currentStyle === style.id}
            sx={{
              minWidth: '200px',
              gap: '12px',
              py: '8px',
            }}
          >
            {style.icon}
            <ListItemText primary={style.name} />
          </MenuItem>
        ))}
      </Menu>

      <div ref={mapContainer} className="map-container" />
    </div>
  );
};

export default Map;
