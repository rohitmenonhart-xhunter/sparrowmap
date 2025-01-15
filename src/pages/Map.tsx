import React, { useEffect, useState } from 'react';
import Map, { Marker, Popup, NavigationControl, MapLayerMouseEvent } from 'react-map-gl/maplibre';
import { Bird, Camera, MapPin } from 'lucide-react';
import Webcam from 'react-webcam';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import 'maplibre-gl/dist/maplibre-gl.css';

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
}

export default function MapView() {
  const [viewState, setViewState] = useState({
    latitude: 13.0827,
    longitude: 80.1477,
    zoom: 15
  });
  const [userLocation, setUserLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [selectedSparrow, setSelectedSparrow] = useState<SparrowData | null>(null);
  const [sparrows, setSparrows] = useState<SparrowData[]>([]);
  const [formData, setFormData] = useState({
    count: 1,
    gender: 'male',
    nest: 'no',
    juveniles: 'no'
  });
  const webcamRef = React.useRef<Webcam>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
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

    // Subscribe to realtime updates
    const channel = supabase
      .channel('sparrows')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'sparrows' }, 
        (payload) => {
          console.log('Realtime update:', payload);
          if (payload.eventType === 'INSERT') {
            const newSparrow = payload.new as SparrowData;
            setSparrows(prev => [...prev, newSparrow]);
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id;
            setSparrows(prev => prev.filter(s => s.id !== deletedId));
          }
        }
      )
      .subscribe();

    // Load existing sparrow data
    loadSparrows();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadSparrows = async () => {
    try {
      console.log('Loading sparrows...');
      const { data, error } = await supabase
        .from('sparrows')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading sparrows:', error);
        throw error;
      }

      console.log('Loaded sparrows:', data);
      if (data) {
        setSparrows(data);
      } else {
        console.warn('No sparrow data received');
        setSparrows([]);
      }
    } catch (error: unknown) {
      console.error('Error loading sparrows:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const captureImage = React.useCallback(async () => {
    const imageSrc = (webcamRef.current as Webcam)?.getScreenshot();
    if (!imageSrc) {
      toast.error('Failed to capture image');
      return;
    }

    try {
      // Create form data for Cloudinary upload
      const formData = new FormData();
      formData.append('file', imageSrc);
      formData.append('upload_preset', 'sparrow_photos'); // You'll need to create this in Cloudinary
      
      console.log('Uploading to Cloudinary...');
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/denh6a7h8/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload image to Cloudinary');
      }

      const data = await response.json();
      const imageUrl = data.secure_url;

      console.log('Upload successful, URL:', imageUrl);
      setImageUrl(imageUrl);
      setShowCamera(false);
      toast.success('Image captured successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      if (error instanceof Error) {
        toast.error(`Upload failed: ${error.message}`);
      } else {
        toast.error('Failed to upload image. Please try again.');
      }
      return;
    }
  }, [webcamRef]);

  const handleMapClick = (event: MapLayerMouseEvent) => {
    if (!showForm) {
      setSelectedLocation({
        latitude: event.lngLat.lat,
        longitude: event.lngLat.lng
      });
      setShowForm(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocation) {
      toast.error('Please select a location on the map first');
      return;
    }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to submit data');
        return;
      }

      console.log('Submitting sparrow data:', {
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        count: formData.count,
        gender: formData.gender,
        nest: formData.nest === 'yes',
        juveniles: formData.juveniles === 'yes',
        user_email: user.email,
        image_url: imageUrl
      });

      const { data, error } = await supabase
        .from('sparrows')
        .insert([
          {
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
            count: formData.count,
            gender: formData.gender,
            nest: formData.nest === 'yes',
            juveniles: formData.juveniles === 'yes',
            user_email: user.email,
            image_url: imageUrl
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error inserting data:', error);
        throw error;
      }

      console.log('Successfully inserted data:', data);
      toast.success('Sparrow data recorded!');
      setShowForm(false);
      setSelectedLocation(null);
      setImageUrl(null);
      
      // Refresh the sparrows data
      loadSparrows();
    } catch (error: unknown) {
      console.error('Error in handleSubmit:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    }
  };

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
        style={{ borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
      >
        <div className="mr-4 mt-4">
          <NavigationControl position="top-right" />
        </div>
        
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
                <Bird className="w-8 h-8 text-blue-600 drop-shadow-lg" />
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
                  <h3 className="text-lg font-bold mb-3 text-gray-800">Sparrow Details</h3>
                  {sparrow.image_url && (
                    <div className="relative mb-3">
                      <img 
                        src={sparrow.image_url} 
                        alt="Sparrow" 
                        className="w-full h-44 object-cover rounded-lg shadow-md hover:opacity-90 transition-opacity"
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
                    <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
                      <span className="font-medium">Reported by:</span><br/>
                      <span className="break-all">{sparrow.user_email}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            )}
          </React.Fragment>
        ))}
      </Map>

      {/* Add Sparrow Button */}
      <div className="absolute bottom-8 right-8 flex flex-col items-end space-y-4">
        <button
          onClick={() => {
            if (!showForm) {
              toast.error('Click on the map to select a location first');
            }
          }}
          className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-all duration-200 hover:shadow-xl transform hover:scale-110"
        >
          <Bird className="w-6 h-6" />
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl transform transition-all duration-300 scale-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Plot a Sparrow</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">How many sparrows?</label>
                <input
                  type="number"
                  min="1"
                  value={formData.count}
                  onChange={(e) => setFormData({...formData, count: parseInt(e.target.value)})}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Do you see a nest?</label>
                <select
                  value={formData.nest}
                  onChange={(e) => setFormData({...formData, nest: e.target.value})}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Do you see any juveniles?</label>
                <select
                  value={formData.juveniles}
                  onChange={(e) => setFormData({...formData, juveniles: e.target.value})}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              
              {/* Image Section */}
              <div className="space-y-4">
                {!imageUrl && (
                  <button
                    type="button"
                    onClick={() => setShowCamera(true)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                    Take Photo
                  </button>
                )}

                {imageUrl && (
                  <div className="relative group">
                    <img 
                      src={imageUrl} 
                      alt="Captured sparrow" 
                      className="w-full h-48 object-cover rounded-lg shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageUrl(null);
                        setShowCamera(true);
                      }}
                      className="absolute top-2 right-2 bg-white bg-opacity-90 p-2 rounded-full shadow-md hover:bg-opacity-100 transition-all duration-200"
                    >
                      <Camera className="w-4 h-4 text-blue-600" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white rounded-lg py-2.5 hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-600 text-white rounded-lg py-2.5 hover:bg-gray-700 transition-colors shadow-md hover:shadow-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl p-6 max-w-3xl w-full shadow-2xl">
            <div className="relative">
              <div className="relative overflow-hidden rounded-lg shadow-inner">
                <div style={{ transform: `scale(${zoom})`, transformOrigin: 'center', transition: 'transform 0.3s ease-out' }}>
                  <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full rounded-lg"
                    videoConstraints={{
                      width: 1280,
                      height: 720,
                      facingMode: "environment"
                    }}
                  />
                </div>
              </div>
              
              {/* Zoom Controls */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-black bg-opacity-60 rounded-full p-3 shadow-lg backdrop-blur-sm">
                <button
                  onClick={() => setZoom(prev => Math.max(1, prev - 0.1))}
                  className="text-white hover:text-blue-400 p-2 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="text-white min-w-[4rem] text-center font-medium">
                  {(zoom * 100).toFixed(0)}%
                </span>
                <button
                  onClick={() => setZoom(prev => Math.min(3, prev + 0.1))}
                  className="text-white hover:text-blue-400 p-2 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Camera Controls */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={captureImage}
                className="flex-1 bg-blue-600 text-white rounded-lg py-3 hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                Capture Photo
              </button>
              <button
                onClick={() => {
                  setShowCamera(false);
                  setZoom(1);
                }}
                className="flex-1 bg-gray-600 text-white rounded-lg py-3 hover:bg-gray-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}