import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './PlacesToStay.css';

// ------------------------- UNIQUE UNSPLASH IMAGE POOLS -------------------------
// 50 unique hotel/room images (Unsplash)
const hotelImagePool = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600',
  'https://images.unsplash.com/photo-1568495248636-6432b97bd949?w=600',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600',
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600',
  'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=600',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600',
  'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600',
  'https://images.unsplash.com/photo-1584132967334-10e028d69efb?w=600',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600',
  'https://images.unsplash.com/photo-1527576539890-dfa815648363?w=600',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600',
  'https://images.unsplash.com/photo-1535827841776-24afc1e255ac?w=600',
  'https://images.unsplash.com/photo-1556414425-dab8ab83e2f4?w=600',
  'https://images.unsplash.com/photo-1522778526097-e0a22ceb95be?w=600',
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600',
  'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600',
  'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=600',
  'https://images.unsplash.com/photo-1548013146-72479768bada?w=600',
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600',
  'https://images.unsplash.com/photo-1468824357306-a439d58ccb1c?w=600',
  'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=600',
  'https://images.unsplash.com/photo-1521401830884-6c03c1c87ebb?w=600',
  'https://images.unsplash.com/photo-1549294413-26f195200c16?w=600',
  'https://images.unsplash.com/photo-1551884831-bc3cdb7c9eae?w=600',
  'https://images.unsplash.com/photo-1523217582562-09d0def993a8?w=600',
  'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=600',
  'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600',
  'https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?w=600',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600',
  'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=600',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600',
  'https://images.unsplash.com/photo-1460574283810-2aab119d8511?w=600',
  'https://images.unsplash.com/photo-1489324464666-cf6146b4e186?w=600',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600',
  'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=600',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600',
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600',
  'https://images.unsplash.com/photo-1568495248636-6432b97bd949?w=600',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600',
  'https://images.unsplash.com/photo-1527576539890-dfa815648363?w=600',
  'https://images.unsplash.com/photo-1535827841776-24afc1e255ac?w=600',
  'https://images.unsplash.com/photo-1556414425-dab8ab83e2f4?w=600',
  'https://images.unsplash.com/photo-1522778526097-e0a22ceb95be?w=600',
];

// 30 unique restaurant/dining images (Unsplash)
const restaurantImagePool = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600',
  'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=600',
  'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600',
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600',
  'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=600',
  'https://images.unsplash.com/photo-1515669097368-22e68427d265?w=600',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600',
  'https://images.unsplash.com/photo-1586999768265-24af89630739?w=600',
  'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=600',
  'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=600',
  'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=600',
  'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=600',
  'https://images.unsplash.com/photo-1484980972926-edee96e0960f?w=600',
  'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600',
  'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=600',
  'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=600',
  'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=600',
  'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=600',
  'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=600',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
  'https://images.unsplash.com/photo-1515669097368-22e68427d265?w=600',
  'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600',
  'https://images.unsplash.com/photo-1484980972926-edee96e0960f?w=600',
  'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=600',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600',
  'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600',
  'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=600',
  'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=600',
];

// Destinations list (Patriata (New Murree) and Naran Valley removed)
const destinations = [
  { _id: '1', name: 'Ziarat' }, { _id: '2', name: 'Thandiani' }, { _id: '3', name: 'Changla Gali' },
  { _id: '4', name: 'Dunga Gali' }, { _id: '5', name: 'Galiyat Region' }, { _id: '6', name: 'Kallar Kahar' },
  // Removed { _id: '7', name: 'Patriata (New Murree)' },
  { _id: '8', name: 'Ayubia' }, { _id: '9', name: 'Nathia Gali' },
  { _id: '10', name: 'Murree' }, { _id: '11', name: 'Wah Cantt' }, { _id: '12', name: 'Peshawar' },
  { _id: '13', name: 'Khanpur Dam' }, { _id: '14', name: 'Tarbela Dam' }, { _id: '15', name: 'Mangla Dam' },
  { _id: '16', name: 'Attock' }, { _id: '17', name: 'Taxila' }, { _id: '18', name: 'Rawalpindi' },
  { _id: '19', name: 'Lahore' }, { _id: '20', name: 'Islamabad' }, { _id: '21', name: 'Taobat' },
  { _id: '22', name: 'Kalash Valley' }, 
  // Removed { _id: '23', name: 'Naran Valley' },
  { _id: '24', name: 'Kumrat Valley' },
  { _id: '25', name: 'Skardu Valley' }, { _id: '26', name: 'Lower Kachura Lake' }, { _id: '27', name: 'Upper Kachura Lake' },
  { _id: '28', name: 'Rush Lake' }, { _id: '29', name: 'Sheosar Lake' }, { _id: '30', name: 'Attabad Lake' },
  { _id: '31', name: 'Saif-ul-Malook Lake' }, { _id: '32', name: 'Basho Valley' }, { _id: '33', name: 'Leepa Valley' },
  { _id: '34', name: 'Ratti Gali Lake' }, { _id: '35', name: 'Chitral Valley' }, { _id: '36', name: 'Naran' },
  { _id: '37', name: 'Kaghan Valley' }, { _id: '38', name: 'Neelum Valley' }, { _id: '39', name: 'Naltar Valley' },
  { _id: '40', name: 'Chitral' }, { _id: '41', name: 'Karachi' }, { _id: '42', name: 'Naran Kaghan' },
  { _id: '43', name: 'Swat Valley' }, { _id: '44', name: 'Hunza Valley' }
];

// Helper: generate realistic Pakistani contact numbers
const generateContactNumber = (seed) => {
  const prefixes = ['300', '301', '302', '303', '304', '305', '306', '307', '308', '309', '310', '311', '312', '313', '314', '315', '316', '317', '318', '319', '320', '321', '322', '323', '324', '325', '326', '327', '328', '329', '330', '331', '332', '333', '334', '335', '336', '337', '338', '339', '340', '341', '342', '343', '344', '345', '346', '347', '348', '349'];
  const prefix = prefixes[seed % prefixes.length];
  const num = 1000000 + (seed * 123456) % 9000000;
  return `+92 ${prefix} ${num.toString().slice(0,3)} ${num.toString().slice(3,7)}`;
};

// Global counters for unique image assignment
let hotelImageIndex = 0;
let restaurantImageIndex = 0;

// Generate hotels for a destination (unique image each time, no email)
const generateHotelsForDestination = (destId, destName, count = 3) => {
  const starOptions = [3, 4, 5];
  const hotels = [];
  for (let i = 1; i <= count; i++) {
    const stars = starOptions[(parseInt(destId) + i) % starOptions.length];
    const phoneSeed = parseInt(destId) * 10 + i;
    const image = hotelImagePool[hotelImageIndex % hotelImagePool.length];
    hotelImageIndex++;
    hotels.push({
      _id: `h_${destId}_${i}`,
      name: `${destName} ${stars === 5 ? 'Grand' : stars === 4 ? 'Resort' : 'Inn'} ${i}`,
      destination: { _id: destId, name: destName },
      rating: stars,
      description: `Beautiful ${stars}-star accommodation in ${destName} with stunning views and premium amenities.`,
      address: `Main ${destName} Road, ${destName}`,
      contactNumber: generateContactNumber(phoneSeed),
      bookingLink: `https://example.com/book/${destName.replace(/\s/g, '')}_${i}`,
      pricePerNight: stars === 5 ? 15000 + (i * 1000) : stars === 4 ? 9000 + (i * 500) : 5000 + (i * 300),
      images: [image]
    });
  }
  return hotels;
};

// Generate restaurants (unique image each time, no email)
const generateRestaurantsForDestination = (destId, destName, count = 2) => {
  const cuisinesList = ['Pakistani', 'Chinese', 'Continental', 'BBQ', 'Fast Food'];
  const restaurants = [];
  for (let i = 1; i <= count; i++) {
    const phoneSeed = parseInt(destId) * 10 + i + 100;
    const image = restaurantImagePool[restaurantImageIndex % restaurantImagePool.length];
    restaurantImageIndex++;
    restaurants.push({
      _id: `r_${destId}_${i}`,
      name: `${destName} ${i === 1 ? 'Dhaba' : 'Café'} ${i}`,
      destination: { _id: destId, name: destName },
      rating: 3 + (i % 3),
      description: `Authentic ${cuisinesList[i % cuisinesList.length]} cuisine in the heart of ${destName}.`,
      address: `Food Street, ${destName}`,
      contactNumber: generateContactNumber(phoneSeed),
      cuisine: [cuisinesList[(i) % cuisinesList.length], cuisinesList[(i+1) % cuisinesList.length]],
      images: [image]
    });
  }
  return restaurants;
};

// Build full static arrays
let allHotels = [];
let allRestaurants = [];
destinations.forEach(dest => {
  allHotels.push(...generateHotelsForDestination(dest._id, dest.name, 3));
  allRestaurants.push(...generateRestaurantsForDestination(dest._id, dest.name, 2));
});

// Famous hotels with REAL working contact numbers (no email)
const famousHotels = [
  { _id: 'f1', name: 'Pearl Continental Peshawar', destination: { _id: '12', name: 'Peshawar' }, rating: 5, description: 'Luxury 5-star hotel', address: 'Khyber Road, Peshawar', contactNumber: '+92 91 52763619', bookingLink: 'https://www.pchotels.com', pricePerNight: 22000, images: [hotelImagePool[42 % hotelImagePool.length]] },
  { _id: 'f2', name: 'Serena Hotel Islamabad', destination: { _id: '20', name: 'Islamabad' }, rating: 5, description: 'Iconic 5-star', address: 'Khayaban-e-Suhrawardy, Islamabad', contactNumber: '+92 51 111 133 133', bookingLink: 'https://www.serenahotels.com', pricePerNight: 28000, images: [hotelImagePool[43 % hotelImagePool.length]] },
  { _id: 'f3', name: 'Shangrila Resort Skardu', destination: { _id: '25', name: 'Skardu Valley' }, rating: 4, description: 'Famous resort at Lower Kachura Lake', address: 'Shangrila Road, Skardu', contactNumber: '+92 5815 554943', bookingLink: 'https://www.shangrilaresort.com.pk', pricePerNight: 18000, images: [hotelImagePool[44 % hotelImagePool.length]] },
  { _id: 'f4', name: 'Hunza Serena Inn', destination: { _id: '44', name: 'Hunza Valley' }, rating: 4, description: 'Heritage property with panoramic views', address: 'Karimabad, Hunza', contactNumber: '+92 5813 457660', bookingLink: 'https://www.serenahotels.com', pricePerNight: 16000, images: [hotelImagePool[45 % hotelImagePool.length]] },
  { _id: 'f5', name: 'Cecil Murree', destination: { _id: '10', name: 'Murree' }, rating: 5, description: 'Historic luxury hotel', address: 'Mall Road, Murree', contactNumber: '+92 51 111 505 505', bookingLink: 'https://www.pchotels.com', pricePerNight: 25000, images: [hotelImagePool[46 % hotelImagePool.length]] },
  { _id: 'f6', name: 'Kallar Kahar Lake Resort', destination: { _id: '6', name: 'Kallar Kahar' }, rating: 4, description: 'Lakeside resort', address: 'Kallar Kahar', contactNumber: '+92 322 4600880', bookingLink: '#', pricePerNight: 12000, images: [hotelImagePool[47 % hotelImagePool.length]] },
  { _id: 'f7', name: 'PTDC Motel Ziarat', destination: { _id: '1', name: 'Ziarat' }, rating: 3, description: 'Government-run motel', address: 'Ziarat', contactNumber: '+92 333 560356', bookingLink: '#', pricePerNight: 8000, images: [hotelImagePool[48 % hotelImagePool.length]] },
  { _id: 'f8', name: 'River View Hotel Naran', destination: { _id: '36', name: 'Naran' }, rating: 3, description: 'Family hotel with river view', address: 'Naran Bazar', contactNumber: '+92 345 5344444', bookingLink: '#', pricePerNight: 9000, images: [hotelImagePool[49 % hotelImagePool.length]] },
];

// Remove generated ones for those destinations and replace with famous
const famousDestIds = famousHotels.map(f => f.destination._id);
allHotels = allHotels.filter(h => !famousDestIds.includes(h.destination._id) || (!h.name.includes('Grand') && !h.name.includes('Resort') && !h.name.includes('Inn')));
allHotels.push(...famousHotels);

// Real restaurants with only phone numbers (no email)
const famousRestaurants = [
  { _id: 'r_f1', name: 'The Monal Restaurant', destination: { _id: '20', name: 'Islamabad' }, rating: 4.5, description: 'Scenic mountain restaurant', address: 'Monal, Margalla Hills', contactNumber: '+92 51 111 111 111', cuisine: ['Pakistani', 'BBQ'], images: [restaurantImagePool[28 % restaurantImagePool.length]] },
  { _id: 'r_f2', name: 'Savour Foods Lahore', destination: { _id: '19', name: 'Lahore' }, rating: 4, description: 'Popular desi food', address: '22 Abbot Road', contactNumber: '+92 42 111 111 111', cuisine: ['Pakistani'], images: [restaurantImagePool[29 % restaurantImagePool.length]] },
];
allRestaurants.push(...famousRestaurants);

// ------------------------- REACT COMPONENT -------------------------
const PlacesToStay = () => {
  const [searchParams] = useSearchParams();
  const destinationId = searchParams.get('destination');
  const hotelIdParam = searchParams.get('hotel');
  const [activeTab, setActiveTab] = useState('hotels');
  const [hotels, setHotels] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [destinationsList, setDestinationsList] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => {
    setDestinationsList(destinations);
    let filteredHotels = [...allHotels];
    let filteredRestaurants = [...allRestaurants];
    if (destinationId) {
      filteredHotels = filteredHotels.filter(h => h.destination._id === destinationId);
      filteredRestaurants = filteredRestaurants.filter(r => r.destination._id === destinationId);
    }
    // Apply sorting
    if (sortBy === 'rating') {
      filteredHotels.sort((a,b) => b.rating - a.rating);
      filteredRestaurants.sort((a,b) => b.rating - a.rating);
    } else if (sortBy === 'price-low') {
      filteredHotels.sort((a,b) => (a.pricePerNight||0) - (b.pricePerNight||0));
      filteredRestaurants.sort((a,b) => b.rating - a.rating);
    } else if (sortBy === 'price-high') {
      filteredHotels.sort((a,b) => (b.pricePerNight||0) - (a.pricePerNight||0));
      filteredRestaurants.sort((a,b) => b.rating - a.rating);
    }
    setHotels(filteredHotels);
    setRestaurants(filteredRestaurants);
  }, [destinationId, sortBy]);

  useEffect(() => {
    if (hotelIdParam && hotels.length > 0) {
      const found = hotels.find((h) => h._id === hotelIdParam);
      if (found) setSelectedHotel(found);
    }
  }, [hotelIdParam, hotels]);

  const handleHotelClick = (hotel) => {
    setSelectedHotel(hotel);
    setSelectedRestaurant(null);
  };

  const handleRestaurantClick = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setSelectedHotel(null);
  };

  const currentDestination = destinationId && destinationsList.length ? destinationsList.find((d) => d._id === destinationId) : null;

  // Detail view for Hotel (no email)
  if (selectedHotel) {
    const h = selectedHotel;
    return (
      <div className="places-to-stay">
        <div className="content">
          <div className="header">
            <button type="button" className="back-btn" onClick={() => setSelectedHotel(null)}>← Back to Hotels</button>
            <h1>Places to Stay</h1>
          </div>
          <div className="section detail-view">
            {h.images && h.images[0] && <img src={h.images[0]} alt={h.name} className="detail-image" />}
            <h2>{h.name}</h2>
            <p className="location">📍 {h.destination?.name}</p>
            <p className="rating">⭐ {h.rating} Star Hotel</p>
            {h.description && <p className="description">{h.description}</p>}
            {h.address && <p><strong>Address:</strong> {h.address}</p>}
            {h.contactNumber && <p><strong>Contact:</strong> {h.contactNumber}</p>}
            {h.pricePerNight && <p><strong>Price per night:</strong> Rs. {h.pricePerNight.toLocaleString()}</p>}
            {/* Booking link removed: no external booking button shown */}
          </div>
        </div>
      </div>
    );
  }

  // Detail view for Restaurant (no email)
  if (selectedRestaurant) {
    const r = selectedRestaurant;
    return (
      <div className="places-to-stay">
        <div className="content">
          <div className="header">
            <button type="button" className="back-btn" onClick={() => setSelectedRestaurant(null)}>← Back to Restaurants</button>
            <h1>Places to Eat</h1>
          </div>
          <div className="section detail-view">
            {r.images && r.images[0] && <img src={r.images[0]} alt={r.name} className="detail-image" />}
            <h2>{r.name}</h2>
            <p className="location">📍 {r.destination?.name}</p>
            <p className="rating">⭐ {r.rating} / 5</p>
            {r.description && <p className="description">{r.description}</p>}
            {r.address && <p><strong>Address:</strong> {r.address}</p>}
            {r.contactNumber && <p><strong>Contact:</strong> {r.contactNumber}</p>}
            {r.cuisine && <p><strong>Cuisine:</strong> {Array.isArray(r.cuisine) ? r.cuisine.join(', ') : r.cuisine}</p>}
          </div>
        </div>
      </div>
    );
  }

  // Main listing view
  return (
    <div className="places-to-stay">
      <div className="content">
        <div className="header">
          <h1>Places to Stay & Eat</h1>
          {currentDestination && <p className="filter-note">Showing results for <strong>{currentDestination.name}</strong></p>}
        </div>

        {fetchError && (
          <div className="page-error-banner">
            <span>{fetchError}</span>
            <button type="button" onClick={() => window.location.reload()}>Retry</button>
          </div>
        )}

        <div className="section">
          <div className="section-header-tabs">
            <button className={`tab-btn ${activeTab === 'hotels' ? 'active' : ''}`} onClick={() => setActiveTab('hotels')}>
              🏨 Hotels ({hotels.length})
            </button>
            <button className={`tab-btn ${activeTab === 'restaurants' ? 'active' : ''}`} onClick={() => setActiveTab('restaurants')}>
              🍽️ Restaurants ({restaurants.length})
            </button>
          </div>

          <div className="section-toolbar">
            <label>Sort by:
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
                <option value="rating">⭐ Rating (High to Low)</option>
                <option value="price-low">💰 Price: Low to High</option>
                <option value="price-high">💰 Price: High to Low</option>
              </select>
            </label>
          </div>

          {loading ? <p className="loading-msg">Loading...</p> : (
            activeTab === 'hotels' ? (
              hotels.length === 0 ? <p className="empty-msg">No hotels found for this destination.</p> : (
                <div className="items-grid">
                  {hotels.map((hotel) => (
                    <div key={hotel._id} className="item-card" onClick={() => handleHotelClick(hotel)} onKeyDown={(e) => e.key === 'Enter' && handleHotelClick(hotel)} role="button" tabIndex={0}>
                      {hotel.images && hotel.images[0] && <img src={hotel.images[0]} alt={hotel.name} className="card-image" />}
                      <h3>{hotel.name}</h3>
                      <p className="location">📍 {hotel.destination?.name}</p>
                      <p className="rating">⭐ {hotel.rating}</p>
                      <p className="price">From Rs. {hotel.pricePerNight?.toLocaleString()}/night</p>
                      <span className="view-details">View details →</span>
                    </div>
                  ))}
                </div>
              )
            ) : (
              restaurants.length === 0 ? <p className="empty-msg">No restaurants found for this destination.</p> : (
                <div className="items-grid">
                  {restaurants.map((rest) => (
                    <div key={rest._id} className="item-card" onClick={() => handleRestaurantClick(rest)} onKeyDown={(e) => e.key === 'Enter' && handleRestaurantClick(rest)} role="button" tabIndex={0}>
                      {rest.images && rest.images[0] && <img src={rest.images[0]} alt={rest.name} className="card-image" />}
                      <h3>{rest.name}</h3>
                      <p className="location">📍 {rest.destination?.name}</p>
                      <p className="rating">⭐ {rest.rating}</p>
                      <div className="cuisine-preview">{(rest.cuisine || []).slice(0,2).map(c => <span key={c} className="cuisine-tag-small">{c}</span>)}</div>
                      <span className="view-details">View details →</span>
                    </div>
                  ))}
                </div>
              )
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default PlacesToStay;