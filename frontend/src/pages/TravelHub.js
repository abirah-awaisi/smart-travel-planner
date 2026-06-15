import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './TravelHub.css';

const TravelHub = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [destinations, setDestinations] = useState([]);
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [weatherError, setWeatherError] = useState(null);
  const [placesToVisit, setPlacesToVisit] = useState([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loadingItinerary, setLoadingItinerary] = useState(false);
  const [aiItinerary, setAiItinerary] = useState(null);
  const [bucketListSuccess, setBucketListSuccess] = useState(false);
  const [bucketListError, setBucketListError] = useState(null);
  const [listError, setListError] = useState(null);

  useEffect(() => {
    fetchDestinations();
    const destId = searchParams.get('id');
    if (destId) {
      fetchDestinationDetails(destId);
    }
  }, [categoryFilter]);

  useEffect(() => {
    if (search) {
      const filtered = destinations.filter(dest =>
        dest.name.toLowerCase().includes(search.toLowerCase()) ||
        dest.city.toLowerCase().includes(search.toLowerCase()) ||
        dest.country.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredDestinations(filtered);
    } else {
      setFilteredDestinations(destinations);
    }
  }, [search, destinations]);

  const fetchDestinations = async () => {
    setListError(null);
    try {
      setLoading(true);
      let response;
      if (categoryFilter && categoryFilter !== 'all') {
        response = await api.get(`/travel-hub/category/${encodeURIComponent(categoryFilter)}`);
      } else {
        response = await api.get('/travel-hub');
      }
      setDestinations(response.data);
      setFilteredDestinations(response.data);
    } catch (error) {
      console.error('Error fetching destinations:', error);
      setListError(error.response?.data?.message || 'Could not load destinations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDestinationDetails = async (destId) => {
    try {
      setLoading(true);
      setWeatherData(null);
      setWeatherError(null);
      
      const destRes = await api.get(`/travel-hub/${destId}`);
      const destination = destRes.data;
      setSelectedDestination(destination);

      // Fetch weather
      if (destination.name) {
        try {
          const weatherRes = await api.get(`/travel-hub/weather?destination=${encodeURIComponent(destination.name)}`);
          setWeatherData(weatherRes.data);
        } catch (err) {
          setWeatherError(err.response?.data?.message || 'Weather is not available right now.');
        }
      }

      // Fetch places to visit from OpenTripMap if coordinates exist
      if (destination.coordinates && destination.coordinates.lat && destination.coordinates.lng) {
        fetchPlacesToVisit(destination.coordinates.lat, destination.coordinates.lng);
      }
    } catch (error) {
      console.error('Error fetching destination details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlacesToVisit = async (lat, lng) => {
    setLoadingPlaces(true);
    try {
      const response = await api.get(
        `/travel-hub/places-to-visit?lat=${lat}&lng=${lng}&radius=10000&limit=20&_t=${Date.now()}`,
        {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }
      );
      setPlacesToVisit(response.data || []);
    } catch (error) {
      console.error('Error fetching places to visit:', error);
      setPlacesToVisit([]);
    } finally {
      setLoadingPlaces(false);
    }
  };

  const handleDestinationClick = (dest) => {
    fetchDestinationDetails(dest._id);
  };

  const handleAddToBucketList = async () => {
    if (!selectedDestination) return;
    
    setBucketListSuccess(false);
    setBucketListError(null);
    
    try {
      const budgetData = {
        destination: selectedDestination.name,
        numberOfMembers: 1,
        days: 1,
        season: selectedDestination.bestSeason || 'summer',
        breakdown: {
          transportation: 0,
          accommodation: 0,
          food: 0,
          activities: 0,
          miscellaneous: 0
        },
        total: 0,
        isBucketList: true
      };
      
      const response = await api.post('/travel-fund', budgetData);
      
      if (response.status === 201 || response.status === 200) {
        setBucketListSuccess(true);
        setTimeout(() => setBucketListSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error adding to bucket list:', error);
      let errorMessage = 'Failed to add to bucket list. Please try again.';
      if (error.response?.data?.message) errorMessage = error.response.data.message;
      else if (error.response?.status === 400) errorMessage = 'This destination is already in your bucket list.';
      else if (error.response?.status === 401) errorMessage = 'Please log in again.';
      else if (error.response?.status === 500) errorMessage = 'Server error. Please try again later.';
      else if (error.message) errorMessage = error.message;
      setBucketListError(errorMessage);
      setTimeout(() => setBucketListError(null), 5000);
    }
  };

  const handleCheckRoute = () => {
    if (!selectedDestination) return;
    const lat = selectedDestination.coordinates?.lat;
    const lng = selectedDestination.coordinates?.lng;
    const query = new URLSearchParams({
      destination: selectedDestination.name || '',
      ...(Number.isFinite(lat) ? { lat: String(lat) } : {}),
      ...(Number.isFinite(lng) ? { lng: String(lng) } : {}),
    });
    navigate(`/app/travel-map?${query.toString()}`);
  };

  const handleCalculateBudget = () => {
    if (!selectedDestination) return;
    const season = (selectedDestination.bestSeason || 'summer').toLowerCase();
    const normalizedSeason =
      season.includes('winter') ? 'winter' :
      season.includes('autumn') || season.includes('fall') ? 'autumn' :
      season.includes('spring') ? 'spring' : 'summer';

    const query = new URLSearchParams({
      destination: selectedDestination.name || '',
      days: '3',
      members: '2',
      season: normalizedSeason
    });
    navigate(`/app/money-map?${query.toString()}`);
  };

  const handleGenerateItinerary = async () => {
    if (!selectedDestination) return;
    
    setLoadingItinerary(true);
    setAiItinerary(null);
    try {
      const response = await api.post('/buddy-bot/message', {
        message: `Create a detailed 3-day itinerary for ${selectedDestination.name}, ${selectedDestination.city}, Pakistan. Include day-wise activities, places to visit, food recommendations, and travel tips. Format it clearly with Day 1, Day 2, Day 3 sections.`
      });
      const itineraryText = response.data.response || response.data.message || response.data;
      setAiItinerary(itineraryText);
    } catch (error) {
      console.error('Error generating itinerary:', error);
      alert('❌ Failed to generate itinerary. Please try again.');
    } finally {
      setLoadingItinerary(false);
    }
  };

  const popularDestinations = destinations.filter(d => d.isPopular);

  if (selectedDestination) {
    return (
      <div className="travel-hub travel-hub-pro">
        <div className="hub-header detail-header">
          <h1>{selectedDestination.name}</h1>
        </div>

        <div className="destination-details">
          {selectedDestination.tagline && (
            <div className="place-header-section">
              <p className="place-tagline-label">Place Tagline / Short Name</p>
              <h2 className="place-tagline">{selectedDestination.tagline}</h2>
            </div>
          )}

          <div className="action-buttons-section">
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                onClick={handleAddToBucketList}
                className="action-btn bucket-list-btn"
                disabled={bucketListSuccess}
              >
                {bucketListSuccess ? '✅ Added to Bucket List!' : '📋 Add to Bucket List'}
              </button>
              {bucketListSuccess && (
                <div className="bucket-list-toast success">
                  <span className="toast-icon">✅</span>
                  <span className="toast-message">{selectedDestination.name} added to Bucket List!</span>
                </div>
              )}
              {bucketListError && (
                <div className="bucket-list-toast error">
                  <span className="toast-icon">❌</span>
                  <span className="toast-message">{bucketListError}</span>
                </div>
              )}
            </div>
            <button onClick={handleCheckRoute} className="action-btn check-route-btn">🧭 Check Route</button>
            <button onClick={handleCalculateBudget} className="action-btn">💰 Calculate Budget</button>
          </div>

          <div className="detail-section">
            <h2>About This Place</h2>
            <p className="place-description">{selectedDestination.description}</p>
            {selectedDestination.culture && (
              <div className="culture-section">
                <h3>Culture & Vibes</h3>
                <p>{selectedDestination.culture}</p>
              </div>
            )}
          </div>

          {selectedDestination.history && (
            <div className="detail-section">
              <h2>History</h2>
              <p>{selectedDestination.history}</p>
            </div>
          )}

          {placesToVisit.length > 0 && (
            <div className="detail-section">
              <h2>Places to Visit</h2>
              {loadingPlaces ? (
                <div className="loading">Loading places to visit...</div>
              ) : (
                <div className="famous-locations-grid">
                  {placesToVisit.map((place, idx) => (
                    <div key={place.xid || idx} className="famous-location-card">
                      {place.image && <img src={place.image} alt={place.name} />}
                      <div className="location-content">
                        <h3>{place.name}</h3>
                        <p className="location-description">{place.description}</p>
                        {place.kinds && place.kinds.length > 0 && (
                          <div className="location-kinds">
                            {place.kinds.map((kind, i) => (
                              <span key={i} className="kind-tag">{kind.replace(/_/g, ' ')}</span>
                            ))}
                          </div>
                        )}
                        {place.rating && <div className="location-rating">⭐ {place.rating}</div>}
                        {place.distance && <div className="location-distance">📍 {Math.round(place.distance)}m away</div>}
                        {place.wikipedia && (
                          <a href={place.wikipedia} target="_blank" rel="noopener noreferrer" className="wikipedia-link">📖 Learn More</a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedDestination.famousLocations && selectedDestination.famousLocations.length > 0 && (
            <div className="detail-section">
              <h2>Famous Locations</h2>
              <div className="famous-locations-grid">
                {selectedDestination.famousLocations.map((location, idx) => (
                  <div key={idx} className="famous-location-card">
                    {location.image && <img src={location.image} alt={location.name} />}
                    <div className="location-content">
                      <h3>{location.name}</h3>
                      <p>{location.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="detail-section">
            <h2>Weather Information</h2>
            {weatherData?.current ? (
              <div className="weather-info-card">
                <div className="weather-main">
                  <div className="weather-icon-large">{weatherData.current?.icon || '⛅'}</div>
                  <div>
                    <div className="weather-temp-large">{weatherData.current?.temperature || 'N/A'}°C</div>
                    <div className="weather-condition-text">{weatherData.current?.condition || 'N/A'}</div>
                  </div>
                </div>
                <div className="weather-details-grid">
                  <div className="weather-detail">
                    <span className="detail-label">Feels Like</span>
                    <span className="detail-value">{weatherData.current?.feelsLike || 'N/A'}°C</span>
                  </div>
                  <div className="weather-detail">
                    <span className="detail-label">Humidity</span>
                    <span className="detail-value">{weatherData.current?.humidity || 'N/A'}%</span>
                  </div>
                  <div className="weather-detail">
                    <span className="detail-label">Wind Speed</span>
                    <span className="detail-value">{weatherData.current?.windSpeed || 'N/A'} km/h</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="weather-unavailable-msg">{weatherError || 'Weather is temporarily unavailable for this destination.'}</p>
            )}
          </div>

          {selectedDestination.famousFood && selectedDestination.famousFood.length > 0 && (
            <div className="detail-section">
              <h2>🍽️ Famous Food</h2>
              <div className="famous-food-grid">
                {selectedDestination.famousFood.map((food, idx) => (
                  <div key={idx} className="food-item-card">
                    <div className="food-icon">{food.icon || '🍛'}</div>
                    <h4>{food.name}</h4>
                    {food.description && <p>{food.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedDestination.famousThings && selectedDestination.famousThings.length > 0 && (
            <div className="detail-section">
              <h2>🛍️ Famous Things & Specialities</h2>
              <div className="famous-things-grid">
                {selectedDestination.famousThings.map((thing, idx) => (
                  <div key={idx} className="thing-item-card">
                    <div className="thing-icon">{thing.icon || '🎁'}</div>
                    <h4>{thing.name}</h4>
                    {thing.description && <p>{thing.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedDestination.famousFor && selectedDestination.famousFor.length > 0 && (
            <div className="detail-section">
              <h2>🎉 Famous For</h2>
              <div className="famous-for-badges">
                {selectedDestination.famousFor.map((item, idx) => (
                  <span key={idx} className="famous-for-badge">{item}</span>
                ))}
              </div>
            </div>
          )}

          <div className="detail-section">
            <div className="section-header-with-action">
              <h2>🗓️ Suggested Itinerary</h2>
              <button
                onClick={handleGenerateItinerary}
                className="action-btn-small generate-itinerary-btn"
                disabled={loadingItinerary}
              >
                {loadingItinerary ? '⏳ Generating...' : '✨ Generate AI Itinerary'}
              </button>
            </div>

            {aiItinerary && (
              <div className="ai-itinerary-container">
                <div className="ai-itinerary-header">
                  <h3>✨ AI Generated Itinerary</h3>
                  <button onClick={() => setAiItinerary(null)} className="close-itinerary-btn">✕ Close</button>
                </div>
                <div className="ai-itinerary-content">
                  {typeof aiItinerary === 'string' ? (
                    aiItinerary.split('\n').map((line, idx) => {
                      const trimmedLine = line.trim();
                      if (trimmedLine.match(/^(Day \d+|Din \d+|Day\d+)/i)) {
                        return <h4 key={idx} className="itinerary-day-heading">{trimmedLine}</h4>;
                      }
                      if (trimmedLine.match(/^(Morning|Afternoon|Evening|Subah|Dopahar|Shaam|Breakfast|Lunch|Dinner|Aghaz|Sham|Raat)/i)) {
                        return <h5 key={idx} className="itinerary-time-heading">{trimmedLine}</h5>;
                      }
                      if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•') || trimmedLine.match(/^\d+\./)) {
                        return <div key={idx} className="itinerary-list-item">{trimmedLine}</div>;
                      }
                      if (trimmedLine) {
                        return <p key={idx} className="itinerary-paragraph">{trimmedLine}</p>;
                      }
                      return null;
                    }).filter(Boolean)
                  ) : (
                    <p className="itinerary-paragraph">{String(aiItinerary)}</p>
                  )}
                </div>
              </div>
            )}

            {!aiItinerary && selectedDestination.suggestedItinerary && selectedDestination.suggestedItinerary.length > 0 && (
              <div className="itinerary-container">
                {selectedDestination.suggestedItinerary.map((day, idx) => (
                  <div key={idx} className="itinerary-day-card">
                    <div className="day-header">
                      <span className="day-number">Day {day.day || idx + 1}</span>
                      <h3>{day.title}</h3>
                    </div>
                    {day.description && <p className="day-description">{day.description}</p>}
                    {day.activities && day.activities.length > 0 && (
                      <ul className="day-activities">
                        {day.activities.map((activity, actIdx) => (
                          <li key={actIdx}>{activity}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!aiItinerary && (!selectedDestination.suggestedItinerary || selectedDestination.suggestedItinerary.length === 0) && (
              <div className="itinerary-generate-section">
                <p>Use the &quot;Generate AI Itinerary&quot; button above to get a personalized plan.</p>
              </div>
            )}
          </div>

          <div className="end-page-action">
            <button onClick={() => setSelectedDestination(null)} className="end-page-btn">Destination List</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="travel-hub travel-hub-pro">
      <div className="hub-hero">
        <h1 className="hub-hero-title">Travel Hub</h1>
        <p className="hub-hero-subtitle">Explore Pakistan&apos;s Northern, Hilly & Valley Regions</p>
      </div>
      <div className="hub-content">
        <div className="hub-toolbar">
          <div className="category-chips">
            <button type="button" className={`category-btn ${categoryFilter === 'all' ? 'active' : ''}`} onClick={() => setCategoryFilter('all')}>All</button>
            <button type="button" className={`category-btn ${categoryFilter === 'Northern Areas' ? 'active' : ''}`} onClick={() => setCategoryFilter('Northern Areas')}>🏔️ Northern</button>
            <button type="button" className={`category-btn ${categoryFilter === 'Hill Stations' ? 'active' : ''}`} onClick={() => setCategoryFilter('Hill Stations')}>🌄 Hilly</button>
            <button type="button" className={`category-btn ${categoryFilter === 'Valleys' ? 'active' : ''}`} onClick={() => setCategoryFilter('Valleys')}>🌿 Valley</button>
          </div>
          <div className="search-bar">
            <span className="search-icon">📍</span>
            <input type="text" placeholder="Search destinations..." value={search} onChange={(e) => setSearch(e.target.value)} className="search-input" />
            <button type="button" className="search-btn">🔍 Search</button>
          </div>
        </div>

        {popularDestinations.length > 0 && (
          <div className="popular-section">
            <h2>Popular Places</h2>
            <div className="popular-grid">
              {popularDestinations.map((dest) => (
                <div key={dest._id} className="popular-card" onClick={() => handleDestinationClick(dest)}>
                  {dest.images && dest.images[0] && <img src={dest.images[0]} alt={dest.name} />}
                  <div className="popular-info">
                    <div className="destination-header">
                      <h3>{dest.name}</h3>
                      {dest.category && <span className="category-badge-small">{dest.category}</span>}
                    </div>
                    <p>{dest.city}, {dest.country}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="destinations-section">
          <h2>All Destinations</h2>
          {listError && (
            <div className="page-error-banner">
              <span>{listError}</span>
              <button type="button" onClick={() => fetchDestinations()}>Retry</button>
            </div>
          )}
          {loading ? (
            <div className="loading">Loading destinations...</div>
          ) : filteredDestinations.length === 0 ? (
            <p className="empty-msg">No destinations match your search. Try a different term or category.</p>
          ) : (
            <div className="destinations-grid">
              {filteredDestinations.map((dest) => (
                <div key={dest._id} className="destination-card" onClick={() => handleDestinationClick(dest)}>
                  {dest.images && dest.images[0] && <img src={dest.images[0]} alt={dest.name} />}
                  <div className="destination-info">
                    <div className="destination-header">
                      <h3>{dest.name}</h3>
                      {dest.category && <span className="category-badge">{dest.category}</span>}
                    </div>
                    <p>{dest.city}, {dest.country}</p>
                    <p className="description">{dest.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TravelHub;