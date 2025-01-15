import React, { useEffect, useState } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/maplibre';
import { Clock, Check, X, Bird, Lock, Home } from 'lucide-react';
import { database } from '../lib/firebase';
import { ref, onValue, query, orderByChild, update, remove, get } from 'firebase/database';
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

interface PlotterData {
  email: string;
  name: string;
  dob: string;
  phone: string;
  bio: string;
  created_at: string;
}

interface PlottersData {
  [key: string]: PlotterData;
}

const ADMIN_KEY = 'svcesparrowv77';

export default function AdminMap() {
  const [viewState, setViewState] = useState({
    latitude: 13.0827,
    longitude: 80.1477,
    zoom: 15
  });
  const [selectedSparrow, setSelectedSparrow] = useState<SparrowData | null>(null);
  const [sparrows, setSparrows] = useState<SparrowData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPending, setShowPending] = useState(true);
  const [showPlotterDetails, setShowPlotterDetails] = useState(false);
  const [plotterDetails, setPlotterDetails] = useState<PlotterData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [keyInput, setKeyInput] = useState('');

  // Load sparrows data
  useEffect(() => {
    if (!isAuthenticated) return;

    const sparrowsRef = ref(database, 'sparrows');
    const sparrowsQuery = query(sparrowsRef, orderByChild('created_at'));

    const unsubscribe = onValue(sparrowsQuery, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const sparrowsArray = Object.entries(data)
            .map(([id, value]) => ({
              id,
              ...(value as Omit<SparrowData, 'id'>)
            }))
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
  }, [isAuthenticated]);

  const handleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyInput === ADMIN_KEY) {
      setIsAuthenticated(true);
      setKeyInput('');
      toast.success('Access granted');
    } else {
      toast.error('Invalid key');
      setKeyInput('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="h-screen w-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-blue-100 p-3 rounded-full">
              <Lock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Admin Access Required</h1>
          <p className="text-center text-gray-600 mb-6">Please enter the admin key to continue</p>
          <form onSubmit={handleKeySubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="Enter admin key"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                required
                autoComplete="off"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Access Admin Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const fetchPlotterDetails = async (email: string) => {
    try {
      const plottersRef = ref(database, 'plotters');
      const snapshot = await get(plottersRef);
      const plotters = snapshot.val() as PlottersData || {};
      
      const plotter = Object.values(plotters).find(
        (p) => p.email === email
      );

      if (plotter) {
        setPlotterDetails(plotter);
      } else {
        toast.error('Plotter details not found');
      }
    } catch (error) {
      console.error('Error fetching plotter details:', error);
      toast.error('Failed to fetch plotter details');
    }
  };

  const handleApprove = async (sparrowId: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const sparrowRef = ref(database, `sparrows/${sparrowId}`);
      await update(sparrowRef, { status: 'approved' });
      toast.success('Sparrow plot approved!');
      setSelectedSparrow(null);
    } catch (error) {
      console.error('Error approving sparrow:', error);
      toast.error('Failed to approve plot');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (sparrowId: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const sparrowRef = ref(database, `sparrows/${sparrowId}`);
      await remove(sparrowRef);
      toast.success('Sparrow plot rejected');
      setSelectedSparrow(null);
    } catch (error) {
      console.error('Error rejecting sparrow:', error);
      toast.error('Failed to reject plot');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = async (sparrowId: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const sparrowRef = ref(database, `sparrows/${sparrowId}`);
      await remove(sparrowRef);
      toast.success('Sparrow plot removed');
      setSelectedSparrow(null);
    } catch (error) {
      console.error('Error removing sparrow:', error);
      toast.error('Failed to remove plot');
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter sparrows based on status
  const filteredSparrows = sparrows.filter(sparrow => 
    showPending ? sparrow.status === 'pending' : sparrow.status === 'approved'
  );

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

        {/* Admin Dashboard Card - Mobile responsive */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-full px-4 sm:px-0 sm:w-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 min-w-[280px] sm:min-w-[300px] mx-auto">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Admin Dashboard</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPending(true)}
                className={`flex-1 px-2 sm:px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showPending 
                    ? 'bg-yellow-100 text-yellow-800 shadow-sm' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="flex items-center justify-center gap-1 sm:gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="hidden sm:inline">Pending</span>
                  <span>({sparrows.filter(s => s.status === 'pending').length})</span>
                </span>
              </button>
              <button
                onClick={() => setShowPending(false)}
                className={`flex-1 px-2 sm:px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !showPending 
                    ? 'bg-green-100 text-green-800 shadow-sm' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="flex items-center justify-center gap-1 sm:gap-2">
                  <Check className="w-4 h-4" />
                  <span className="hidden sm:inline">Approved</span>
                  <span>({sparrows.filter(s => s.status === 'approved').length})</span>
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Sparrow markers */}
        {filteredSparrows.map((sparrow) => (
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
                onClick={() => setSelectedSparrow(sparrow)}
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
                anchor="bottom"
                onClose={() => {
                  setSelectedSparrow(null);
                  setPlotterDetails(null);
                }}
                maxWidth="320px"
                className="rounded-xl overflow-hidden [&_.maplibregl-popup-content]:p-0"
              >
                <div className="p-3 max-w-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Bird className="w-5 h-5 text-blue-500" />
                      <h3 className="text-lg font-semibold text-gray-800">
                        Sparrow Plot
                      </h3>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      sparrow.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {sparrow.status === 'pending' ? (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Pending
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Check className="w-4 h-4" />
                          Approved
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="relative w-full h-48 mb-3 rounded-lg overflow-hidden bg-gray-50">
                    <img
                      src={sparrow.image_url}
                      alt="Sparrow"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <span className="text-xs font-medium text-gray-600">Count</span>
                        <p className="text-lg font-semibold text-gray-900">{sparrow.count}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <span className="text-xs font-medium text-gray-600">Gender</span>
                        <p className="text-lg font-semibold text-gray-900 capitalize">{sparrow.gender}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <span className="text-xs font-medium text-gray-600">Nest</span>
                        <p className={`text-lg font-semibold ${sparrow.nest ? 'text-green-600' : 'text-red-600'}`}>
                          {sparrow.nest ? 'Yes' : 'No'}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <span className="text-xs font-medium text-gray-600">Juveniles</span>
                        <p className={`text-lg font-semibold ${sparrow.juveniles ? 'text-green-600' : 'text-red-600'}`}>
                          {sparrow.juveniles ? 'Yes' : 'No'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {plotterDetails ? (
                    <div className="mb-4 bg-blue-50 p-3 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-base text-blue-900">Plotter Details</h3>
                        <button
                          onClick={() => setPlotterDetails(null)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Hide Details
                        </button>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-blue-700 font-medium">Name</p>
                            <p className="text-blue-900">{plotterDetails.name}</p>
                          </div>
                          <div>
                            <p className="text-blue-700 font-medium">Age</p>
                            <p className="text-blue-900">{calculateAge(plotterDetails.dob)} years</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-blue-700 font-medium">Email</p>
                          <p className="text-blue-900">{plotterDetails.email}</p>
                        </div>
                        <div>
                          <p className="text-blue-700 font-medium">Phone</p>
                          <p className="text-blue-900">{plotterDetails.phone}</p>
                        </div>
                        <div>
                          <p className="text-blue-700 font-medium">Bio</p>
                          <p className="text-blue-900 text-sm">{plotterDetails.bio}</p>
                        </div>
                        <div>
                          <p className="text-blue-700 font-medium">Member Since</p>
                          <p className="text-blue-900">{new Date(plotterDetails.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => fetchPlotterDetails(sparrow.user_email)}
                      className="mb-4 w-full py-2 px-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      View Plotter Details
                    </button>
                  )}

                  <div className="flex gap-2">
                    {sparrow.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleApprove(sparrow.id)}
                          className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium text-sm"
                          disabled={isProcessing}
                        >
                          <span className="flex items-center justify-center gap-2">
                            <Check className="w-5 h-5" />
                            Approve
                          </span>
                        </button>
                        <button
                          onClick={() => handleReject(sparrow.id)}
                          className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium text-sm"
                          disabled={isProcessing}
                        >
                          <span className="flex items-center justify-center gap-2">
                            <X className="w-5 h-5" />
                            Reject
                          </span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleRemove(sparrow.id)}
                        className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium text-sm"
                        disabled={isProcessing}
                      >
                        <span className="flex items-center justify-center gap-2">
                          <X className="w-5 h-5" />
                          Remove
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            )}
          </React.Fragment>
        ))}
      </Map>

      {/* Plotter Details Modal */}
      {showPlotterDetails && plotterDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Plotter Details</h3>
              <button
                onClick={() => setShowPlotterDetails(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-gray-800">{plotterDetails.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Age</label>
                <p className="text-gray-800">{calculateAge(plotterDetails.dob)} years old</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                <p className="text-gray-800">{new Date(plotterDetails.dob).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-800 break-all">{plotterDetails.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-gray-800">{plotterDetails.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Bio</label>
                <p className="text-gray-800 whitespace-pre-line">{plotterDetails.bio}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Member Since</label>
                <p className="text-gray-800">{new Date(plotterDetails.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 