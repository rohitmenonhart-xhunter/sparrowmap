import React, { useEffect, useState } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/maplibre';
import { Bird, Navigation2, Download, Home } from 'lucide-react';
import { database } from '../lib/firebase';
import { ref, onValue, query, orderByChild } from 'firebase/database';
import toast from 'react-hot-toast';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Link } from 'react-router-dom';

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

export default function PublicMap() {
  const [viewState, setViewState] = useState({
    latitude: 13.0827,
    longitude: 80.1477,
    zoom: 15
  });
  const [selectedSparrow, setSelectedSparrow] = useState<SparrowData | null>(null);
  const [sparrows, setSparrows] = useState<SparrowData[]>([]);
  const [userLocation, setUserLocation] = useState<{latitude: number; longitude: number} | null>(null);

  useEffect(() => {
    // Get user's location
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLocation = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        setUserLocation(newLocation);
        setViewState(prev => ({
          ...prev,
          ...newLocation
        }));
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error('Failed to get your location. Please enable location services.');
      }
    );

    // Set up realtime listener for sparrow data
    const sparrowsRef = ref(database, 'sparrows');
    const sparrowsQuery = query(sparrowsRef, orderByChild('created_at'));

    const unsubscribe = onValue(sparrowsQuery, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          // Convert object to array and filter approved sparrows
          const sparrowsArray = Object.entries(data)
            .map(([id, value]) => ({
              id,
              ...(value as Omit<SparrowData, 'id'>)
            }))
            .filter(sparrow => sparrow.status === 'approved')
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          
          setSparrows(sparrowsArray);
        } else {
          setSparrows([]);
        }
      } catch (error) {
        console.error('Error loading sparrows:', error);
        toast.error('Failed to load sparrow data');
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleRecenter = () => {
    if (userLocation) {
      setViewState(prev => ({
        ...prev,
        ...userLocation,
        zoom: 15
      }));
    }
  };

  const handleDownload = () => {
    try {
      // Create a JSON blob with the sparrow data
      const dataToDownload = {
        sparrows,
        downloadDate: new Date().toISOString(),
        totalCount: sparrows.length
      };
      
      const blob = new Blob([JSON.stringify(dataToDownload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `sparrow-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Sparrow data downloaded successfully!');
    } catch (error) {
      console.error('Error downloading data:', error);
      toast.error('Failed to download sparrow data');
    }
  };

  return (
    <div className="h-screen w-screen relative bg-gray-100">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
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
          {userLocation && (
            <button
              onClick={handleRecenter}
              className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
              title="Center on my location"
            >
              <Navigation2 className="w-5 h-5 text-gray-700" />
            </button>
          )}
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

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg hover:bg-white/95 transition-all text-gray-700 font-medium min-w-[40px]"
            title="Download sparrow data"
          >
            <Download className="w-5 h-5" />
            <span className="hidden sm:inline">Download Data</span>
            <span className="text-sm text-gray-500 hidden sm:inline">({sparrows.length} sparrows)</span>
          </button>
        </div>

        {/* Data Summary Card */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-full px-4 sm:px-0 sm:w-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 text-center max-w-md mx-auto">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Bird className="w-5 h-5 text-blue-500" />
              <h1 className="text-lg font-semibold text-gray-800">Sparrow Map</h1>
            </div>
            <p className="text-sm text-gray-600">
              {sparrows.length} sparrow{sparrows.length !== 1 ? 's' : ''} plotted
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Click the download button to view offline
            </p>
          </div>
        </div>

        {/* Current location marker */}
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

        {/* Sparrow markers */}
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
                anchor="bottom"
                onClose={() => setSelectedSparrow(null)}
                maxWidth="320px"
                className="rounded-xl overflow-hidden [&_.maplibregl-popup-content]:p-0"
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
                  </div>
                </div>
              </Popup>
            )}
          </React.Fragment>
        ))}
      </Map>
    </div>
  );
} 