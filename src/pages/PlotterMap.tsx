import React, { useEffect, useState, useCallback } from 'react';
import Map, { Marker, Popup, NavigationControl, Source, Layer } from 'react-map-gl/maplibre';
import { Bird, MapPin, Clock, LogOut, Camera, X, Home } from 'lucide-react';
import { database } from '../lib/firebase';
import { ref, onValue, query, orderByChild, set } from 'firebase/database';
import toast from 'react-hot-toast';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useNavigate, Link } from 'react-router-dom';
import Webcam from 'react-webcam';

// Constants
const ALLOWED_RADIUS_KM = 0.07; // 70 meters radius

// Function to calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
}

// Function to create a circle polygon for the map
function createCirclePolygon(centerLat: number, centerLng: number, radiusKm: number) {
  const points = 64; // Number of points to make the circle
  const coords = [];
  
  for (let i = 0; i < points; i++) {
    const angle = (i * 360) / points;
    const rad = (angle * Math.PI) / 180;
    // Convert radius from km to degrees (approximately)
    const latRadius = radiusKm / 111.32;
    const lonRadius = radiusKm / (111.32 * Math.cos(centerLat * Math.PI / 180));
    const lat = centerLat + (latRadius * Math.sin(rad));
    const lon = centerLng + (lonRadius * Math.cos(rad));
    coords.push([lon, lat]);
  }
  coords.push(coords[0]); // Close the circle
  
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [coords]
    }
  };
}

interface SparrowData {
  id: string;
  latitude: number;
  longitude: number;
  count: number;
  gender: string;
  nest: boolean;
  juveniles: boolean;
  image_url: string;
  created_at: string;
  user_email: string;
  status: 'pending' | 'approved';
}

export default function PlotterMap() {
  const navigate = useNavigate();
  const [viewState, setViewState] = useState({
    latitude: 13.0827,
    longitude: 80.1477,
    zoom: 15
  });
  const [userLocation, setUserLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedSparrow, setSelectedSparrow] = useState<SparrowData | null>(null);
  const [sparrows, setSparrows] = useState<SparrowData[]>([]);
  const [formData, setFormData] = useState({
    count: 1,
    gender: 'male',
    nest: false,
    juveniles: false,
    image_url: ''
  });
  const [showCamera, setShowCamera] = useState(false);
  const webcamRef = React.useRef<Webcam>(null);
  const [zoom, setZoom] = useState(1);
  const MAX_ZOOM = 8; // Increased from 4 to 8
  const MIN_ZOOM = 1;
  const ZOOM_STEP = 0.25; // Reduced from 0.5 to 0.25 for finer control
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('environment');

  const handleSignOut = () => {
    localStorage.removeItem('plotterId');
    localStorage.removeItem('plotterEmail');
    toast.success('Signed out successfully');
    navigate('/plotter-signin');
  };

  useEffect(() => {
    // Check authentication using localStorage
    const plotterId = localStorage.getItem('plotterId');
    const plotterEmail = localStorage.getItem('plotterEmail');
    
    if (!plotterId || !plotterEmail) {
      navigate('/plotter-signin');
      return;
    }

    // Get user's location
    navigator.geolocation.getCurrentPosition((pos) => {
      const newLocation = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };
      setUserLocation(newLocation);
      setViewState(prev => ({
        ...prev,
        ...newLocation
      }));
    });

    // Set up realtime listener for user's sparrow data
    const sparrowsRef = ref(database, 'sparrows');
    const sparrowsQuery = query(sparrowsRef, orderByChild('created_at'));

    const unsubscribeDB = onValue(sparrowsQuery, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          // Convert object to array and filter user's sparrows
          const sparrowsArray = Object.entries(data)
            .map(([id, value]) => ({
              id,
              ...(value as Omit<SparrowData, 'id'>)
            }))
            .filter(sparrow => sparrow.user_email === plotterEmail)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          
          setSparrows(sparrowsArray);
        } else {
          setSparrows([]);
        }
      } catch (error) {
        console.error('Error loading sparrows:', error);
        toast.error('Failed to load your sparrow data');
      }
    });

    return () => {
      unsubscribeDB();
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocation) return;

    const plotterEmail = localStorage.getItem('plotterEmail');
    if (!plotterEmail) {
      toast.error('Please sign in again');
      navigate('/plotter-signin');
      return;
    }

    try {
      const newSparrow: Omit<SparrowData, 'id'> = {
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        count: formData.count,
        gender: formData.gender,
        nest: formData.nest,
        juveniles: formData.juveniles,
        image_url: formData.image_url,
        created_at: new Date().toISOString(),
        user_email: plotterEmail,
        status: 'pending'
      };

      const newId = Date.now().toString();
      const sparrowRef = ref(database, `sparrows/${newId}`);
      await set(sparrowRef, newSparrow);

      toast.success('Sparrow plot submitted for approval!');
      setSelectedLocation(null);
      setShowForm(false);
      setFormData({
        count: 1,
        gender: 'male',
        nest: false,
        juveniles: false,
        image_url: ''
      });
    } catch (error) {
      console.error('Error submitting sparrow:', error);
      toast.error('Failed to submit sparrow data');
    }
  };

  const handleMapClick = (event: { lngLat: { lat: number; lng: number } }) => {
    if (!showForm && userLocation) {
      const clickedLat = event.lngLat.lat;
      const clickedLng = event.lngLat.lng;
      
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        clickedLat,
        clickedLng
      );

      if (distance <= ALLOWED_RADIUS_KM) {
        setSelectedLocation({
          latitude: clickedLat,
          longitude: clickedLng
        });
        setShowForm(true);
      } else {
        toast.error('Please select a location within the blue circle (70 meters from your position)');
      }
    }
  };

  // Create circle data for visualization
  const circleData = userLocation ? {
    type: 'FeatureCollection',
    features: [createCirclePolygon(userLocation.latitude, userLocation.longitude, ALLOWED_RADIUS_KM)]
  } : null;

  const captureImage = useCallback(async () => {
    if (!webcamRef.current) return;
    
    try {
      const video = webcamRef.current.video;
      if (!video) {
        toast.error('Camera not ready');
        return;
      }

      // Create a canvas to draw the zoomed image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        toast.error('Failed to create image context');
        return;
      }

      // Set canvas size to match video dimensions
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      canvas.width = videoWidth;
      canvas.height = videoHeight;

      // Calculate the zoomed area
      const zoomFactor = zoom;
      const sourceWidth = videoWidth / zoomFactor;
      const sourceHeight = videoHeight / zoomFactor;
      const sourceX = (videoWidth - sourceWidth) / 2;
      const sourceY = (videoHeight - sourceHeight) / 2;

      // Draw the zoomed portion
      ctx.drawImage(
        video,
        sourceX, sourceY, sourceWidth, sourceHeight,  // Source rectangle
        0, 0, videoWidth, videoHeight                 // Destination rectangle
      );

      // Get the zoomed image as base64
      const imageSrc = canvas.toDataURL('image/jpeg', 0.9);

      // Convert base64 to blob
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      
      // Create form data
      const formData = new FormData();
      formData.append('file', blob, 'sparrow.jpg');
      formData.append('upload_preset', 'sparrow_photos');

      const uploadResponse = await fetch(
        'https://api.cloudinary.com/v1_1/denh6a7h8/image/upload',
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await uploadResponse.json();
      
      if (!uploadResponse.ok) {
        throw new Error(data.error?.message || 'Failed to upload image');
      }

      if (data.secure_url) {
        setFormData(prev => ({ ...prev, image_url: data.secure_url }));
        setShowCamera(false);
        toast.success('Image captured successfully!');
      } else {
        throw new Error('Failed to get image URL');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
    }
  }, [zoom]);

  return (
    <div className="h-screen w-screen relative bg-gray-100">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        onClick={handleMapClick}
        mapStyle={{
          version: 8,
          sources: {
            osm: {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors'
            }
          },
          layers: [
            {
              id: 'osm',
              type: 'raster',
              source: 'osm',
              minzoom: 0,
              maxzoom: 19
            }
          ]
        }}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Navigation Controls Container */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-50">
          <NavigationControl position="top-right" />
        </div>

        {/* Top Controls Container */}
        <div className="absolute top-4 left-4 flex flex-col sm:flex-row gap-2 z-50">
          {/* Back to Home Button */}
          <Link
            to="/"
            className="flex items-center justify-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg hover:bg-white/95 transition-all text-gray-700 font-medium min-w-[40px]"
          >
            <Home className="w-5 h-5" />
            <span className="hidden sm:inline">Back to Home</span>
          </Link>
        </div>

        {/* Welcome Message - Mobile responsive */}
        <div className="absolute bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-full px-4 sm:px-0 sm:w-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 text-center max-w-md mx-auto">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Bird className="w-5 h-5 text-blue-500" />
              <h1 className="text-lg font-semibold text-gray-800">Sparrow Plotter</h1>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Click anywhere within the blue circle to add a new sparrow plot</p>
              <p className="text-xs text-blue-600">You can only plot within 70 meters of your current location</p>
            </div>
          </div>
        </div>

        {/* Sign Out Button - Mobile responsive */}
        <div className="absolute bottom-4 left-4 z-50">
          <button
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl shadow-lg hover:bg-white/95 transition-all text-gray-700 font-medium text-sm sm:text-base sm:px-4 min-w-[40px]"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>

        {/* Circle Overlay */}
        {userLocation && circleData && (
          <Source type="geojson" data={circleData}>
            <Layer
              id="radius-circle"
              type="fill"
              paint={{
                'fill-color': '#3B82F6',
                'fill-opacity': 0.1
              }}
            />
            <Layer
              id="radius-circle-border"
              type="line"
              paint={{
                'line-color': '#3B82F6',
                'line-width': 2,
                'line-dasharray': [3, 3]
              }}
            />
          </Source>
        )}

        {/* User location marker */}
        {userLocation && (
          <Marker
            latitude={userLocation.latitude}
            longitude={userLocation.longitude}
          >
            <div className="relative">
              <div className="absolute w-6 h-6 bg-blue-500 rounded-full opacity-30 animate-ping" />
              <div className="relative w-6 h-6">
                <div className="absolute w-6 h-6 bg-blue-500 rounded-full" />
                <div className="absolute w-3 h-3 bg-white rounded-full top-1.5 left-1.5" />
              </div>
            </div>
          </Marker>
        )}

        {/* Selected location marker */}
        {selectedLocation && (
          <Marker
            latitude={selectedLocation.latitude}
            longitude={selectedLocation.longitude}
          >
            <div className="animate-bounce">
              <MapPin className="w-8 h-8 text-red-500 drop-shadow-lg" />
            </div>
          </Marker>
        )}

        {/* Existing sparrow markers */}
        {sparrows.map((sparrow) => (
          <React.Fragment key={sparrow.id}>
            <Marker
              latitude={sparrow.latitude}
              longitude={sparrow.longitude}
              onClick={e => {
                e.originalEvent.stopPropagation();
                setSelectedSparrow(sparrow);
              }}
            >
              <div 
                className="cursor-pointer transform hover:scale-150 transition-all duration-300 ease-in-out p-2 hover:bg-white hover:bg-opacity-20 rounded-full"
                onMouseEnter={() => setSelectedSparrow(sparrow)}
                onMouseLeave={() => setSelectedSparrow(null)}
              >
                {sparrow.status === 'pending' ? (
                  <Clock className="w-8 h-8 text-yellow-500 drop-shadow-lg" />
                ) : (
                  <Bird className="w-8 h-8 text-blue-600 drop-shadow-lg" />
                )}
              </div>
            </Marker>
            {selectedSparrow?.id === sparrow.id && (
              <Popup
                latitude={sparrow.latitude}
                longitude={sparrow.longitude}
                closeButton={true}
                closeOnClick={false}
                onClose={() => setSelectedSparrow(null)}
                anchor="bottom"
                className="rounded-xl overflow-hidden shadow-2xl"
                maxWidth="320px"
              >
                <div className="p-4 min-w-[280px] max-w-[320px] bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-800">Sparrow Details</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      sparrow.status === 'approved' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {sparrow.status === 'approved' ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                  {sparrow.image_url && (
                    <div className="relative mb-3">
                      <img 
                        src={sparrow.image_url} 
                        alt="Sparrow" 
                        className="w-full h-44 object-cover rounded-lg shadow-md"
                        style={{ objectFit: 'contain', backgroundColor: '#f3f4f6' }}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-gray-700">
                        <span className="font-medium">Count:</span> 
                        <span className="ml-1">{sparrow.count}</span>
                      </div>
                      <div className="text-gray-700">
                        <span className="font-medium">Gender:</span> 
                        <span className="ml-1 capitalize">{sparrow.gender}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-gray-700">
                        <span className="font-medium">Nest:</span> 
                        <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${sparrow.nest ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {sparrow.nest ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="text-gray-700">
                        <span className="font-medium">Juveniles:</span>
                        <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${sparrow.juveniles ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {sparrow.juveniles ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Popup>
            )}
          </React.Fragment>
        ))}

        {selectedLocation && showForm && (
          <Popup
            latitude={selectedLocation.latitude}
            longitude={selectedLocation.longitude}
            anchor="bottom"
            onClose={() => {
              setSelectedLocation(null);
              setShowForm(false);
              setFormData({
                count: 1,
                gender: 'male',
                nest: false,
                juveniles: false,
                image_url: ''
              });
            }}
            maxWidth="min(90vw, 320px)"
            className="rounded-xl overflow-hidden [&_.maplibregl-popup-content]:p-0 [&_.maplibregl-popup-close-button]:w-8 [&_.maplibregl-popup-close-button]:h-8 [&_.maplibregl-popup-close-button]:flex [&_.maplibregl-popup-close-button]:items-center [&_.maplibregl-popup-close-button]:justify-center [&_.maplibregl-popup-close-button]:text-xl [&_.maplibregl-popup-close-button]:bg-white [&_.maplibregl-popup-close-button]:hover:bg-gray-100 [&_.maplibregl-popup-close-button]:text-gray-600 [&_.maplibregl-popup-close-button]:hover:text-gray-900 [&_.maplibregl-popup-close-button]:shadow-md [&_.maplibregl-popup-close-button]:rounded-full [&_.maplibregl-popup-close-button]:top-2 [&_.maplibregl-popup-close-button]:right-2 [&_.maplibregl-popup-close-button]:transition-all"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bird className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-800">New Sparrow Plot</h3>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Count</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.count}
                    onChange={e => setFormData(prev => ({ ...prev, count: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={e => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={formData.nest}
                      onChange={e => setFormData(prev => ({ ...prev, nest: e.target.checked }))}
                      className="rounded text-blue-500 focus:ring-blue-500"
                    />
                    Has Nest
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={formData.juveniles}
                      onChange={e => setFormData(prev => ({ ...prev, juveniles: e.target.checked }))}
                      className="rounded text-blue-500 focus:ring-blue-500"
                    />
                    Has Juveniles
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                  {formData.image_url ? (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-50 mb-2">
                      <img
                        src={formData.image_url}
                        alt="Sparrow"
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                        className="absolute top-2 right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowCamera(true)}
                      className="w-full py-2 px-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
                    >
                      <Camera className="w-5 h-5" />
                      Take Photo
                    </button>
                  )}
                </div>

                {/* Validation Message */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Your request will be validated with the photo you upload. We'll validate your request as soon as possible.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                  disabled={!formData.image_url}
                >
                  <Bird className="w-5 h-5" />
                  Submit Plot
                </button>
              </form>
            </div>
          </Popup>
        )}
      </Map>

      {/* Camera Modal - In a popup */}
      {showCamera && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl overflow-hidden shadow-2xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Take Photo</h3>
                <button
                  onClick={() => setShowCamera(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="relative bg-black">
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                <button
                  onClick={() => setCameraFacingMode(prev => 
                    prev === 'user' ? 'environment' : 'user'
                  )}
                  className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setZoom(prev => Math.max(MIN_ZOOM, prev - ZOOM_STEP))}
                    className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                  >
                    <span className="text-lg font-bold">−</span>
                  </button>
                  <span className="px-2 py-1 bg-black/50 rounded-lg text-white text-sm">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={() => setZoom(prev => Math.min(MAX_ZOOM, prev + ZOOM_STEP))}
                    className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                  >
                    <span className="text-lg font-bold">+</span>
                  </button>
                </div>
              </div>
              <div className="aspect-[4/3] relative overflow-hidden">
                <div 
                  className="w-full h-full origin-center transition-transform duration-200"
                  style={{ 
                    transform: `scale(${zoom})`,
                  }}
                >
                  <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full h-full object-cover"
                    videoConstraints={{
                      facingMode: cameraFacingMode,
                      aspectRatio: 4/3,
                      width: { ideal: 1920 }, // Request HD quality
                      height: { ideal: 1440 }
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50">
              <button
                onClick={captureImage}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
              >
                <Camera className="w-6 h-6" />
                Capture Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 