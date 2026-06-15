/**
 * Northern / hilly / valley Pakistan destinations (curated list).
 * Images: Unsplash CDN; each set ties to Pakistan listings on the photo page
 * (exact place, or same valley/route — e.g. Phander/Ghizer highlands for Shandur when Shandur itself has no free hits).
 * Upserts by destination name (case-insensitive).
 *
 * Usage: node backend/src/scripts/addNorthernPakistanDestinations.js
 */

const mongoose = require('mongoose');
const Destination = require('../models/Destination');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-travel-planner', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB Connected');
  addDestinations();
}).catch(err => {
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1);
});

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Unsplash CDN — w=1200&q=80 for consistent sizing */
const U = (id) => `https://images.unsplash.com/${id}?w=1200&q=80`;
const UQ = (query) => `https://source.unsplash.com/1200x800/?${encodeURIComponent(query)}`;

const withExtraDetails = (text, extraLine) => {
  const clean = String(text || '').trim();
  if (!clean) return extraLine;
  if (clean.length > 220) return clean;
  return `${clean} ${extraLine}`;
};

const enrichFamousLocations = (destinationName, destinationImages, famousLocations = []) => {
  return (famousLocations || []).map((loc, idx) => {
    const location = typeof loc === 'string' ? { name: loc } : { ...loc };
    const locationName = location.name || `Location ${idx + 1}`;
    const fallbackImage = destinationImages?.[idx % (destinationImages?.length || 1)];
    return {
      name: locationName,
      image:
        location.image ||
        fallbackImage ||
        UQ(`${locationName}, ${destinationName}, Pakistan, mountains, valley`),
      description:
        location.description ||
        `${locationName} is a key attraction in ${destinationName}, known for scenic views, local culture, and memorable sightseeing opportunities.`
    };
  });
};

const enrichNamedList = (items = [], destinationName, kind) => {
  return (items || []).map((entry) => {
    const item = typeof entry === 'string' ? { name: entry } : { ...entry };
    const itemName = item.name || kind;
    const defaultDescription =
      kind === 'food'
        ? `${itemName} is popular in ${destinationName} and is commonly enjoyed by travelers for local flavor and regional taste.`
        : `${itemName} is a well-known local specialty from ${destinationName}, often bought by visitors as a cultural souvenir.`;
    return {
      ...item,
      description: item.description || defaultDescription
    };
  });
};

async function addDestinations() {
  try {
    console.log('🔄 Upserting Northern Pakistan destinations...\n');

    // Remove older granular valley entries (we now represent them as full valley destinations)
    const removeNames = [
      'Arang Kel',
      'Keran',
      'Sharda',
      'Kalam Valley',
      'Skardu',
      'Murree',
      'Nathia Gali',
      'Malam Jabba'
    ];
    try {
      const deleteQuery = {
        $or: removeNames.map((n) => ({
          name: { $regex: new RegExp(`^${escapeRegex(n)}$`, 'i') }
        }))
      };
      const deleted = await Destination.deleteMany(deleteQuery);
      console.log(
        `🧹 Cleaned legacy valley entries: ${deleted?.deletedCount || 0} removed\n`
      );
    } catch (e) {
      console.log(`⚠️ Cleanup skipped: ${e.message}\n`);
    }

    // Reset hill stations so only curated hilly list remains
    try {
      const deletedHills = await Destination.deleteMany({ category: 'Hill Stations' });
      console.log(`🧹 Reset Hill Stations: ${deletedHills?.deletedCount || 0} removed\n`);
    } catch (e) {
      console.log(`⚠️ Hill cleanup skipped: ${e.message}\n`);
    }

    // Remove old pre-existing Northern Areas entries
    try {
      const deletedNorthern = await Destination.deleteMany({ category: 'Northern Areas' });
      console.log(`🧹 Reset Northern Areas: ${deletedNorthern?.deletedCount || 0} removed\n`);
    } catch (e) {
      console.log(`⚠️ Northern cleanup skipped: ${e.message}\n`);
    }

    const destinations = [
      {
        name: 'Skardu Valley',
        city: 'Skardu',
        country: 'Pakistan',
        region: 'Gilgit-Baltistan',
        category: 'Valleys',
        tagline: 'Gateway to Mighty Mountains',
        description: 'Skardu Valley is known for lakes, deserts, rivers, and some of the world’s highest mountains including K2.',
        history: 'Skardu was historically part of Baltistan and served as a major route between Central Asia and Kashmir.',
        culture: 'Baltistani traditions, mountain hospitality, and peaceful villages make Skardu unique.',
        coordinates: { lat: 35.2971, lng: 75.6333 },
        isPopular: true,
        bestSeason: 'summer',
        images: [
          'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&q=80',
          'https://images.unsplash.com/photo-1511497584788-876760111969?w=1200&q=80',
          'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80'
        ],
        famousLocations: [{ name: 'Shangrila Resort' }, { name: 'Deosai Plains' }, { name: 'Katpana Desert' }],
        famousFood: [{ name: 'Mamtu', icon: '🍜' }, { name: 'Balay', icon: '🍲' }, { name: 'Apricot Juice', icon: '🧃' }],
        famousThings: [{ name: 'Pashmina Shawls', icon: '🧣' }, { name: 'Gemstones', icon: '💎' }, { name: 'Wooden Crafts', icon: '🪵' }],
        famousFor: ['Adventure', 'Camping', 'Mountains', 'Lakes', 'Trekking']
      },

      {
        name: 'Neelum Valley',
        city: 'Muzaffarabad',
        country: 'Pakistan',
        region: 'Azad Kashmir',
        category: 'Valleys',
        tagline: 'Paradise of Azad Kashmir',
        description: 'Neelum Valley is one of the most beautiful valleys in Azad Kashmir, famous for rivers, forests, waterfalls, and peaceful villages near the Line of Control.',
        history: 'Neelum Valley has historical importance due to ancient Buddhist civilization and old trade routes connecting Kashmir regions.',
        culture: 'The valley has traditional Kashmiri culture, wooden houses, hospitality, and peaceful natural surroundings.',
        coordinates: { lat: 34.5895, lng: 73.9070 },
        isPopular: true,
        bestSeason: 'summer',
        images: [
          'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80',
          'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80',
          'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80'
        ],
        famousLocations: [{ name: 'Arang Kel' }, { name: 'Sharda' }, { name: 'Keran' }],
        famousFood: [{ name: 'Kashmiri Chai', icon: '☕' }, { name: 'Roghan Josh', icon: '🍛' }, { name: 'Makai Roti', icon: '🌽' }],
        famousThings: [{ name: 'Kashmiri Shawls', icon: '🧣' }, { name: 'Wooden Handicrafts', icon: '🎁' }, { name: 'Natural Honey', icon: '🍯' }],
        famousFor: ['Nature', 'Rivers', 'Hiking', 'Camping', 'Photography']
      },
      {
        name: 'Kumrat Valley',
        city: 'Upper Dir',
        country: 'Pakistan',
        region: 'Khyber Pakhtunkhwa',
        category: 'Valleys',
        tagline: 'Land of Forests and Rivers',
        description: 'Kumrat Valley is famous for dense forests, waterfalls, rivers, and camping spots surrounded by mountains.',
        history: 'Kumrat remained an untouched natural valley for many years and became popular through tourism in recent decades.',
        culture: 'Traditional Pashtun hospitality, calm atmosphere, and natural beauty create a peaceful travel experience.',
        coordinates: { lat: 35.5536, lng: 72.2258 },
        isPopular: true,
        bestSeason: 'summer',
        images: [
          'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1200&q=80',
          'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1200&q=80',
          'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80'
        ],
        famousLocations: [{ name: 'Jahaz Banda' }, { name: 'Kumrat Waterfall' }, { name: 'Panjkora River' }],
        famousFood: [{ name: 'Chapli Kebab', icon: '🍢' }, { name: 'BBQ', icon: '🍖' }, { name: 'Green Tea', icon: '🍵' }],
        famousThings: [{ name: 'Camping Gear', icon: '🏕️' }, { name: 'Wooden Crafts', icon: '🪵' }, { name: 'Dry Fruits', icon: '🥜' }],
        famousFor: ['Camping', 'Forests', 'Rivers', 'Adventure', 'Trekking']
      },
      {
        name: 'Taobat',
        city: 'Taobat',
        country: 'Pakistan',
        region: 'Azad Kashmir',
        category: 'Valleys',
        tagline: 'Last Village of Neelum',
        description: 'Taobat is a remote and scenic village in upper Neelum Valley, known for wooden homes, crystal streams, pine forests, and peaceful mountain landscapes near the Line of Control.',
        history: 'Historically, Taobat remained a seasonal settlement connected to old mountain routes and local pastoral communities in Neelum.',
        culture: 'The area reflects simple Kashmiri mountain lifestyle with warm hospitality, traditional architecture, and close connection to nature.',
        coordinates: { lat: 34.6694, lng: 74.0528 },
        isPopular: true,
        bestSeason: 'summer',
        images: [
          U('photo-1728137597529-56116895b9b5'),
          U('photo-1687286945285-c0fa4b0753ae'),
          U('photo-1659553761498-6a8728fbf281')
        ],
        famousLocations: [
          { name: 'Taobat Village', description: 'Main village cluster with wooden houses, riverside fields, and classic mountain valley views.' },
          { name: 'Neelum River Bend', description: 'A scenic section of the Neelum River near Taobat, popular for photography and short walks.' },
          { name: 'Upper Neelum Meadows', description: 'Open green meadows around Taobat that are ideal for quiet nature stays and family picnics.' }
        ],
        famousFood: [{ name: 'Kashmiri Chai', icon: '☕' }, { name: 'Makai Roti', icon: '🌽' }, { name: 'Saag', icon: '🥬' }],
        famousThings: [{ name: 'Wool Shawls', icon: '🧣' }, { name: 'Handmade Crafts', icon: '🎁' }, { name: 'Mountain Honey', icon: '🍯' }],
        famousFor: ['Remote Beauty', 'Rivers', 'Nature', 'Photography', 'Peaceful Stay']
      },
      {
        name: 'Kaghan Valley',
        city: 'Balakot',
        country: 'Pakistan',
        region: 'Khyber Pakhtunkhwa',
        category: 'Valleys',
        tagline: 'Valley of Lakes and Mountains',
        description: 'Kaghan Valley is a beautiful mountain valley with rivers, forests, lakes, and cool weather attracting thousands of tourists every year.',
        history: 'The valley has long been an important travel route toward Gilgit-Baltistan and northern mountains.',
        culture: 'Peaceful mountain villages and cool climate make Kaghan ideal for family tourism and relaxation.',
        coordinates: { lat: 34.7930, lng: 73.5790 },
        isPopular: true,
        bestSeason: 'summer',
        images: [
          'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80',
          'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80',
          'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1200&q=80'
        ],
        famousLocations: [{ name: 'Shogran' }, { name: 'Siri Paye' }, { name: 'Saif ul Malook' }],
        famousFood: [{ name: 'Trout Fish', icon: '🐟' }, { name: 'BBQ', icon: '🍖' }, { name: 'Kashmiri Tea', icon: '☕' }],
        famousThings: [{ name: 'Wool Shawls', icon: '🧣' }, { name: 'Handmade Crafts', icon: '🎁' }, { name: 'Dry Fruits', icon: '🥜' }],
        famousFor: ['Lakes', 'Rivers', 'Family Tours', 'Jeep Tracks']
      },
      {
        name: 'Naran Valley',
        city: 'Naran',
        country: 'Pakistan',
        region: 'Khyber Pakhtunkhwa',
        category: 'Valleys',
        tagline: 'Gateway to Northern Beauty',
        description: 'Naran Valley is one of Pakistan’s most visited tourist destinations known for lakes, rivers, mountains, and adventure tourism.',
        history: 'Naran developed as a tourist hill station due to its location on the Kaghan route.',
        culture: 'The valley offers cool weather, river-side hotels, and a lively tourism atmosphere.',
        coordinates: { lat: 34.9106, lng: 73.6498 },
        isPopular: true,
        bestSeason: 'summer',
        images: [
          'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&q=80',
          'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1200&q=80',
          'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80'
        ],
        famousLocations: [{ name: 'Lake Saif ul Malook' }, { name: 'Babusar Top' }, { name: 'Lulusar Lake' }],
        famousFood: [{ name: 'Trout Fish', icon: '🐟' }, { name: 'Chicken Karahi', icon: '🍗' }, { name: 'Kashmiri Tea', icon: '☕' }],
        famousThings: [{ name: 'Dry Fruits', icon: '🥜' }, { name: 'Wool Caps', icon: '🧢' }, { name: 'Traditional Shawls', icon: '🧣' }],
        famousFor: ['Boating', 'Camping', 'Rivers', 'Photography']
      },
      {
        name: 'Kalash Valley',
        city: 'Chitral',
        country: 'Pakistan',
        region: 'Khyber Pakhtunkhwa',
        category: 'Valleys',
        tagline: 'Valley of Unique Culture',
        description: 'Kalash Valley is famous worldwide for the ancient Kalash tribe, colorful festivals, and unique culture.',
        history: 'The Kalash people are considered one of the oldest indigenous communities in the region.',
        culture: 'Traditional music, festivals, colorful dresses, and mountain lifestyle create a unique atmosphere.',
        coordinates: { lat: 35.6699, lng: 71.7311 },
        isPopular: true,
        bestSeason: 'summer',
        images: [
          'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80',
          'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80',
          'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80'
        ],
        famousLocations: [{ name: 'Bumburet' }, { name: 'Rumbur' }, { name: 'Birir' }],
        famousFood: [{ name: 'Cheese Bread', icon: '🥖' }, { name: 'Walnut Cake', icon: '🍰' }, { name: 'Local Tea', icon: '☕' }],
        famousThings: [{ name: 'Traditional Dresses', icon: '👗' }, { name: 'Handmade Jewelry', icon: '💍' }, { name: 'Wooden Art', icon: '🪵' }],
        famousFor: ['Culture', 'Festivals', 'History', 'Mountains']
      },
      {
        name: 'Leepa Valley',
        city: 'Leepa',
        country: 'Pakistan',
        region: 'Azad Kashmir',
        category: 'Valleys',
        tagline: 'Hidden Jewel of Kashmir',
        description: 'Leepa Valley is famous for green rice fields, wooden houses, forests, and peaceful mountain landscapes.',
        history: 'Leepa remained historically connected with Kashmir trade routes and mountain settlements.',
        culture: 'Traditional Kashmiri lifestyle and peaceful natural scenery attract nature lovers.',
        coordinates: { lat: 34.3210, lng: 73.9258 },
        isPopular: true,
        bestSeason: 'summer',
        images: [
          'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80',
          'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1200&q=80',
          'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80'
        ],
        famousLocations: [{ name: 'Chananian' }, { name: 'Leepa Village' }, { name: 'Reshian' }],
        famousFood: [{ name: 'Kashmiri Chai', icon: '☕' }, { name: 'Roghani Roti', icon: '🍞' }, { name: 'Makai Roti', icon: '🌽' }],
        famousThings: [{ name: 'Shawls', icon: '🧣' }, { name: 'Handicrafts', icon: '🎁' }, { name: 'Honey', icon: '🍯' }],
        famousFor: ['Nature', 'Photography', 'Peace', 'Rivers']
      },
      {
        name: 'Naltar Valley',
        city: 'Gilgit',
        country: 'Pakistan',
        region: 'Gilgit-Baltistan',
        category: 'Valleys',
        tagline: 'Valley of Colorful Lakes',
        description: 'Naltar Valley is famous for colorful lakes, pine forests, skiing, and snow-covered mountains.',
        history: 'Naltar became famous due to tourism and Pakistan’s ski competitions.',
        culture: 'Peaceful forests, cool weather, and adventure tourism create an exciting environment.',
        coordinates: { lat: 36.1391, lng: 74.1877 },
        isPopular: true,
        bestSeason: 'all',
        images: [
          'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80',
          'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80',
          'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80'
        ],
        famousLocations: [{ name: 'Naltar Lakes' }, { name: 'Ski Resort' }, { name: 'Pine Forests' }],
        famousFood: [{ name: 'Trout Fish', icon: '🐟' }, { name: 'BBQ', icon: '🍖' }, { name: 'Kashmiri Tea', icon: '☕' }],
        famousThings: [{ name: 'Handicrafts', icon: '🎁' }, { name: 'Dry Fruits', icon: '🥜' }, { name: 'Wool Shawls', icon: '🧣' }],
        famousFor: ['Skiing', 'Lakes', 'Forests', 'Snowfall', 'Camping']
      },
      {
        name: 'Hunza Valley',
        city: 'Karimabad',
        country: 'Pakistan',
        region: 'Gilgit-Baltistan',
        category: 'Valleys',
        tagline: 'Heaven Between the Mountains',
        description: 'Hunza Valley is one of the most famous tourist destinations in Pakistan, known for its snow-covered peaks, beautiful lakes, forts, and peaceful environment. The valley attracts tourists from around the world for adventure and sightseeing.',
        history: 'Hunza was once an independent princely state ruled by the Mir of Hunza and was part of the ancient Silk Route.',
        culture: 'Hunza has a peaceful atmosphere with friendly locals, traditional music, and rich Burusho culture.',
        coordinates: { lat: 36.3167, lng: 74.6500 },
        isPopular: true,
        bestSeason: 'summer',
        images: [
          'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?w=1200&q=80',
          'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80',
          'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80'
        ],
        famousLocations: [{ name: 'Attabad Lake' }, { name: 'Baltit Fort' }, { name: 'Passu Cones' }],
        famousFood: [{ name: 'Chapshuro', icon: '🍛' }, { name: 'Apricot Cake', icon: '🍰' }, { name: 'Hunza Bread', icon: '🍞' }],
        famousThings: [{ name: 'Dry Fruits', icon: '🥜' }, { name: 'Handicrafts', icon: '🎁' }, { name: 'Gemstones', icon: '💎' }],
        famousFor: ['Mountains', 'Lakes', 'Trekking', 'Culture', 'Photography']
      },
      {
        name: 'Swat Valley',
        city: 'Mingora',
        country: 'Pakistan',
        region: 'Khyber Pakhtunkhwa',
        category: 'Valleys',
        tagline: 'Switzerland of Pakistan',
        description: 'Swat Valley is famous for rivers, waterfalls, forests, snowy mountains, and skiing resorts.',
        history: 'Swat was once a center of Gandhara civilization and Buddhist culture.',
        culture: 'Traditional Pashtun culture, green landscapes, and peaceful weather make Swat ideal for tourism.',
        coordinates: { lat: 35.2227, lng: 72.4258 },
        isPopular: true,
        bestSeason: 'all',
        images: [
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
          'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80',
          'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1200&q=80'
        ],
        famousLocations: [{ name: 'Malam Jabba' }, { name: 'Kalam Valley' }, { name: 'Mahodand Lake' }],
        famousFood: [{ name: 'Trout Fish', icon: '🐟' }, { name: 'Chapli Kebab', icon: '🍢' }, { name: 'Kabuli Pulao', icon: '🍚' }],
        famousThings: [{ name: 'Wool Shawls', icon: '🧣' }, { name: 'Wooden Art', icon: '🪵' }, { name: 'Dry Fruits', icon: '🥜' }],
        famousFor: ['Skiing', 'Rivers', 'Snowfall', 'Waterfalls', 'Nature']
      },

      // 🏙️ Northern non-hilly / non-valley cities & landmarks (full detail)
      {
        name: 'Islamabad',
        city: 'Islamabad',
        country: 'Pakistan',
        region: 'Islamabad Capital Territory',
        category: 'Northern Areas',
        tagline: 'Green Capital of Pakistan',
        description: 'Islamabad is the capital city of Pakistan, known for its clean environment, modern infrastructure, diplomatic presence, and organized urban planning. The city combines urban convenience with easy access to hills, parks, and family attractions.',
        history: 'Islamabad was built in the 1960s to replace Karachi as the federal capital and was planned as a purpose-built modern city.',
        culture: 'The city has a calm and balanced lifestyle with diverse residents, educational institutions, food districts, and recreational spaces.',
        coordinates: { lat: 33.6844, lng: 73.0479 },
        isPopular: true,
        bestSeason: 'spring',
        images: [
          'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=1200&q=80',
          'https://images.unsplash.com/photo-1620043760470-2c5f6b0c9d4a?w=1200&q=80',
          'https://images.unsplash.com/photo-1625225233840-69545602c6a5?w=1200&q=80'
        ],
        famousLocations: [
          { name: 'Faisal Mosque', image: 'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=1200&q=80', description: 'Iconic national mosque and one of Islamabad’s most recognizable architectural landmarks.' },
          { name: 'Daman-e-Koh', image: 'https://images.unsplash.com/photo-1620043760470-2c5f6b0c9d4a?w=1200&q=80', description: 'Scenic viewpoint in the Margalla Hills with panoramic views of the city.' },
          { name: 'Pakistan Monument', image: 'https://images.unsplash.com/photo-1625225233840-69545602c6a5?w=1200&q=80', description: 'National heritage site symbolizing provincial unity and modern civic identity.' },
          { name: 'Rawal Lake', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80', description: 'Popular lakefront recreation area known for boating, picnics, and sunset views.' }
        ],
        famousFood: [{ name: 'Pakistani BBQ', icon: '🍖' }, { name: 'Burgers', icon: '🍔' }, { name: 'Street Food', icon: '🌯' }, { name: 'Tea', icon: '☕' }],
        famousThings: [{ name: 'Handicrafts', icon: '🎁' }, { name: 'Books', icon: '📚' }, { name: 'Souvenirs', icon: '🧿' }, { name: 'Traditional Clothing', icon: '👕' }],
        famousFor: ['Capital City', 'Clean Environment', 'Tourism', 'Modern Architecture']
      },
      {
        name: 'Lahore',
        city: 'Lahore',
        country: 'Pakistan',
        region: 'Punjab',
        category: 'Northern Areas',
        tagline: 'Heart of Pakistan',
        description: 'Lahore is Pakistan’s cultural capital, famous for architecture, heritage districts, vibrant bazaars, and legendary food culture. The city offers a blend of historical landmarks and modern urban life.',
        history: 'Lahore has evolved through Mughal, Sikh, and British periods and remains one of South Asia’s major historical cities.',
        culture: 'The city has a lively social rhythm with festivals, food streets, traditional arts, and deep literary and cultural roots.',
        coordinates: { lat: 31.5204, lng: 74.3587 },
        isPopular: true,
        bestSeason: 'autumn',
        images: [
          'https://images.unsplash.com/photo-1582034986517-30d163aa1d8c?w=1200&q=80',
          'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&q=80',
          'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=1200&q=80'
        ],
        famousLocations: [
          { name: 'Badshahi Mosque', image: 'https://images.unsplash.com/photo-1582034986517-30d163aa1d8c?w=1200&q=80', description: 'Grand Mughal-era mosque and one of Lahore’s most iconic historical sites.' },
          { name: 'Lahore Fort', image: 'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=1200&q=80', description: 'Historic fort complex with architecture spanning multiple dynasties.' },
          { name: 'Minar-e-Pakistan', image: 'https://images.unsplash.com/photo-1582034986517-30d163aa1d8c?w=1200&q=80', description: 'National monument marking a key milestone in Pakistan’s political history.' },
          { name: 'Shalimar Gardens', image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&q=80', description: 'UNESCO-recognized Mughal garden known for terraced design and water channels.' }
        ],
        famousFood: [{ name: 'Nihari', icon: '🍲' }, { name: 'Biryani', icon: '🍛' }, { name: 'Halwa Puri', icon: '🫓' }, { name: 'Lassi', icon: '🥤' }],
        famousThings: [{ name: 'Traditional Clothes', icon: '👗' }, { name: 'Jewelry', icon: '💍' }, { name: 'Handicrafts', icon: '🎁' }, { name: 'Shoes', icon: '👞' }],
        famousFor: ['Food Capital', 'Mughal Heritage', 'Culture', 'Festivals']
      },
      {
        name: 'Rawalpindi',
        city: 'Rawalpindi',
        country: 'Pakistan',
        region: 'Punjab',
        category: 'Northern Areas',
        tagline: 'Twin City of Islamabad',
        description: 'Rawalpindi is a major commercial and transport hub neighboring Islamabad. It is known for old bazaars, military significance, and high-volume local markets.',
        history: 'Rawalpindi grew from an old trading center into an important administrative and military city over modern history.',
        culture: 'The city has an energetic bazaar culture with street food, wholesale trade, and constant business movement.',
        coordinates: { lat: 33.5651, lng: 73.0169 },
        isPopular: true,
        bestSeason: 'all',
        images: [
          'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=1200&q=80',
          'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80',
          'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80'
        ],
        famousLocations: [
          { name: 'Saddar Market', image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=1200&q=80', description: 'Popular shopping and food district with diverse retail options.' },
          { name: 'Ayub National Park', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80', description: 'Large family park area with boating, play zones, and open green space.' },
          { name: 'Raja Bazaar', image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80', description: 'Historic market area known for dense traditional trade activity.' },
          { name: 'Chandni Chowk Rawalpindi', image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80', description: 'High-footfall urban center connecting transit, shopping, and street food.' }
        ],
        famousFood: [{ name: 'Gol Gappay', icon: '🥙' }, { name: 'BBQ', icon: '🍖' }, { name: 'Street Tea', icon: '☕' }, { name: 'Dahi Bhallay', icon: '🥗' }],
        famousThings: [{ name: 'Clothes', icon: '👕' }, { name: 'Shoes', icon: '👞' }, { name: 'Electronics', icon: '📱' }, { name: 'Accessories', icon: '🎒' }],
        famousFor: ['Markets', 'Military Area', 'Transport Hub']
      },
      {
        name: 'Taxila',
        city: 'Rawalpindi District',
        country: 'Pakistan',
        region: 'Punjab',
        category: 'Northern Areas',
        tagline: 'Ancient Civilization City',
        description: 'Taxila is one of the world’s major archaeological landscapes with Buddhist and Gandhara heritage remains. It attracts researchers, students, and heritage travelers.',
        history: 'Taxila dates back to early antiquity and served as a key center of learning and civilization in the Gandhara period.',
        culture: 'The site reflects educational and historical tourism with museums, ruins, and heritage interpretation.',
        coordinates: { lat: 33.7475, lng: 72.8119 },
        isPopular: true,
        bestSeason: 'winter',
        images: [
          'https://images.unsplash.com/photo-1582034986517-30d163aa1d8c?w=1200&q=80',
          'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80',
          'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80'
        ],
        famousLocations: [
          { name: 'Taxila Museum', image: 'https://images.unsplash.com/photo-1582034986517-30d163aa1d8c?w=1200&q=80', description: 'Museum housing Gandhara artifacts, sculptures, and archaeological records.' },
          { name: 'Dharmarajika Stupa', image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80', description: 'Historic Buddhist stupa complex and key excavation point in Taxila.' },
          { name: 'Jaulian Monastery', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80', description: 'Ancient monastery remains known for preserved stone architecture.' },
          { name: 'Sirkap Ruins', image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80', description: 'Archaeological remains of an ancient planned city in the Taxila valley.' }
        ],
        famousFood: [{ name: 'Traditional BBQ', icon: '🍖' }, { name: 'Desi Karahi', icon: '🍲' }, { name: 'Chapati Meals', icon: '🫓' }, { name: 'Tea', icon: '☕' }],
        famousThings: [{ name: 'Artifacts Replicas', icon: '🏺' }, { name: 'Handicrafts', icon: '🎁' }, { name: 'Books', icon: '📚' }, { name: 'Souvenirs', icon: '🧿' }],
        famousFor: ['Archaeology', 'Ancient Civilization', 'Museums']
      },
      {
        name: 'Attock',
        city: 'Attock',
        country: 'Pakistan',
        region: 'Punjab',
        category: 'Northern Areas',
        tagline: 'Gateway of the North',
        description: 'Attock is a strategic city near the Indus crossing, known for river views, historical routes, and military-era landmarks.',
        history: 'Attock has long held strategic value since Mughal times due to its location at important river and route junctions.',
        culture: 'The city has a quieter tourism style centered around heritage points, bridges, and riverfront landscapes.',
        coordinates: { lat: 33.7754, lng: 72.3667 },
        isPopular: true,
        bestSeason: 'winter',
        images: [
          'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80',
          'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80',
          'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80'
        ],
        famousLocations: [
          { name: 'Attock Bridge', image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80', description: 'Historic bridge crossing that links key routes near the Indus.' },
          { name: 'Attock Fort', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80', description: 'Historic fortification associated with regional defense history.' },
          { name: 'Indus River View', image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80', description: 'Scenic river viewpoint area popular for short stopovers.' },
          { name: 'Riverbank Area', image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&q=80', description: 'Relaxed riverside zone for landscape photography and quiet visits.' }
        ],
        famousFood: [{ name: 'Fish Fry', icon: '🐟' }, { name: 'BBQ', icon: '🍖' }, { name: 'Chapli Kebabs', icon: '🍢' }, { name: 'Tea', icon: '☕' }],
        famousThings: [{ name: 'Fishing Items', icon: '🎣' }, { name: 'Handicrafts', icon: '🎁' }, { name: 'Local Clothes', icon: '👕' }, { name: 'River Souvenirs', icon: '🧿' }],
        famousFor: ['River Bridge', 'History', 'Military Importance']
      },
      {
        name: 'Mangla Dam',
        city: 'Mirpur',
        country: 'Pakistan',
        region: 'Azad Kashmir',
        category: 'Northern Areas',
        tagline: 'Power of Water',
        description: 'Mangla Dam is one of Pakistan’s largest dams on the Jhelum River, known for its vast reservoir, boating opportunities, and scenic waterfront drives.',
        history: 'Constructed in the 1960s, Mangla became a major project for irrigation and hydroelectric support in Pakistan.',
        culture: 'The area has a calm water-tourism atmosphere with boating points, picnic zones, and family travel activity.',
        coordinates: { lat: 33.1421, lng: 73.6488 },
        isPopular: true,
        bestSeason: 'winter',
        images: [
          'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80',
          'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80',
          'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1200&q=80'
        ],
        famousLocations: [
          { name: 'Mangla Dam Wall', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80', description: 'Main dam structure viewpoint reflecting the scale of the project.' },
          { name: 'Mangla Lake View', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80', description: 'Reservoir panorama known for calm water and open sky scenes.' },
          { name: 'Boating Area', image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200&q=80', description: 'Visitor zone with local boating and family recreation activities.' },
          { name: 'Sunset Water View', image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1200&q=80', description: 'Evening photo point around the reservoir edge and hills.' }
        ],
        famousFood: [{ name: 'Fish BBQ', icon: '🐟' }, { name: 'Fries', icon: '🍟' }, { name: 'Tea', icon: '☕' }, { name: 'Chicken Tikka', icon: '🍗' }],
        famousThings: [{ name: 'Fishing Gear', icon: '🎣' }, { name: 'Souvenirs', icon: '🎁' }, { name: 'Handicrafts', icon: '🧿' }, { name: 'Local Snacks', icon: '🌯' }],
        famousFor: ['Dam Tourism', 'Water Views', 'Boating']
      },
      {
        name: 'Tarbela Dam',
        city: 'Haripur',
        country: 'Pakistan',
        region: 'Khyber Pakhtunkhwa',
        category: 'Northern Areas',
        tagline: 'Giant Hydropower Wonder',
        description: 'Tarbela Dam is one of the largest earth-filled dams in the world and a major hydropower and water-management landmark on the Indus River.',
        history: 'Completed in the 1970s, Tarbela became one of Pakistan’s most significant engineering and electricity infrastructure projects.',
        culture: 'The site is known more for engineering significance and reservoir scenery than traditional urban tourism.',
        coordinates: { lat: 34.0854, lng: 72.6911 },
        isPopular: true,
        bestSeason: 'summer',
        images: [
          'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80',
          'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80',
          'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200&q=80'
        ],
        famousLocations: [
          { name: 'Tarbela Reservoir', image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80', description: 'Wide reservoir view showing the scale of the Tarbela system.' },
          { name: 'Dam Structure View', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80', description: 'Key overlook for observing embankment and spillway structures.' },
          { name: 'Indus River Flow Area', image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1200&q=80', description: 'River flow section downstream tied to controlled water release.' },
          { name: 'Hydropower Station View', image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200&q=80', description: 'Infrastructure-facing view linked with generation facilities.' }
        ],
        famousFood: [{ name: 'BBQ', icon: '🍖' }, { name: 'Fish', icon: '🐟' }, { name: 'Tea', icon: '☕' }, { name: 'Paratha Breakfast', icon: '🫓' }],
        famousThings: [{ name: 'Local Crafts', icon: '🎁' }, { name: 'Handicrafts', icon: '🧿' }, { name: 'Snacks', icon: '🌯' }, { name: 'Fishing Items', icon: '🎣' }],
        famousFor: ['Hydropower', 'Largest Dam', 'Engineering Marvel']
      },
      {
        name: 'Khanpur Dam',
        city: 'Haripur',
        country: 'Pakistan',
        region: 'Khyber Pakhtunkhwa',
        category: 'Northern Areas',
        tagline: 'Adventure Water Spot',
        description: 'Khanpur Dam is a popular day-trip destination for water activities including jet skiing, cliff diving, boating, and lakeside adventure tourism.',
        history: 'Built in the 1980s, it became an important water source and later evolved into a regional recreational hotspot.',
        culture: 'Khanpur has a high-energy outdoor vibe with youth tourism, water sports, and weekend family visits.',
        coordinates: { lat: 33.8690, lng: 72.9200 },
        isPopular: true,
        bestSeason: 'summer',
        images: [
          'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1200&q=80',
          'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200&q=80',
          'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80'
        ],
        famousLocations: [
          { name: 'Khanpur Lake', image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1200&q=80', description: 'Main reservoir area known for water color and hill surroundings.' },
          { name: 'Jet Ski Area', image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200&q=80', description: 'Adventure zone for high-speed recreational water rides.' },
          { name: 'Cliff Diving Point', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80', description: 'Popular diving spot used by trained activity groups and tourists.' },
          { name: 'Sunset Hills View', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80', description: 'Evening viewpoint with warm light over water and surrounding hills.' }
        ],
        famousFood: [{ name: 'BBQ', icon: '🍖' }, { name: 'Fries', icon: '🍟' }, { name: 'Cold Drinks', icon: '🥤' }, { name: 'Chicken Rolls', icon: '🌯' }],
        famousThings: [{ name: 'Water Sports Gear', icon: '🏄' }, { name: 'Souvenirs', icon: '🎁' }, { name: 'Sunglasses', icon: '🕶️' }, { name: 'Travel Snacks', icon: '🥨' }],
        famousFor: ['Adventure Sports', 'Boating', 'Cliff Diving']
      },
      {
        name: 'Peshawar',
        city: 'Peshawar',
        country: 'Pakistan',
        region: 'Khyber Pakhtunkhwa',
        category: 'Northern Areas',
        tagline: 'City of Flowers',
        description: 'Peshawar is one of South Asia’s oldest living cities, known for its deep history, Pashtun culture, bustling bazaars, and traditional cuisine.',
        history: 'A key city on old trade routes, Peshawar has links to Gandhara civilization and later Silk Route-era movement.',
        culture: 'The city has strong traditional identity with hospitality, craft bazaars, and iconic regional food.',
        coordinates: { lat: 34.0151, lng: 71.5249 },
        isPopular: true,
        bestSeason: 'winter',
        images: [
          'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=1200&q=80',
          'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80',
          'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80'
        ],
        famousLocations: [
          { name: 'Qissa Khwani Bazaar', image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=1200&q=80', description: 'Historic bazaar district known for oral tradition and old city commerce.' },
          { name: 'Bala Hisar Fort', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80', description: 'Prominent fort site tied to the strategic history of Peshawar.' },
          { name: 'Peshawar Museum', image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80', description: 'Museum containing archaeological and cultural collections of the region.' },
          { name: 'Ghanta Ghar (Clock Tower)', image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80', description: 'Recognizable central landmark in the old commercial quarters.' }
        ],
        famousFood: [{ name: 'Chapli Kebab', icon: '🍖' }, { name: 'Pulao', icon: '🍛' }, { name: 'Sajji', icon: '🍗' }, { name: 'Qehwa Tea', icon: '☕' }],
        famousThings: [{ name: 'Traditional Clothes', icon: '👕' }, { name: 'Jewelry', icon: '💍' }, { name: 'Carpets', icon: '🧶' }, { name: 'Handicrafts', icon: '🎁' }],
        famousFor: ['Culture', 'Food', 'History', 'Old Civilization']
      },
      {
        name: 'Wah Cantt',
        city: 'Wah',
        country: 'Pakistan',
        region: 'Punjab',
        category: 'Northern Areas',
        tagline: 'Green Military City',
        description: 'Wah Cantt is a planned urban center known for cleanliness, greenery, and organized civic structure with defense-industry relevance.',
        history: 'The area developed over the colonial period and later expanded around strategic industrial and defense establishments.',
        culture: 'Wah has a disciplined and orderly city culture with parks, educational institutions, and family neighborhoods.',
        coordinates: { lat: 33.7839, lng: 72.7265 },
        isPopular: true,
        bestSeason: 'all',
        images: [
          'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&q=80',
          'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200&q=80',
          'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80'
        ],
        famousLocations: [
          { name: 'Wah Gardens', image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&q=80', description: 'Historic garden complex tied to Mughal-era landscaping traditions.' },
          { name: 'POF Industrial Area', image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200&q=80', description: 'Prominent industrial zone associated with defense manufacturing.' },
          { name: 'Mughal Ruins', image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1200&q=80', description: 'Historical remains around Wah that reflect earlier settlement layers.' },
          { name: 'Canal View Park', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80', description: 'Urban green recreation point for local families and visitors.' }
        ],
        famousFood: [{ name: 'BBQ', icon: '🍖' }, { name: 'Fast Food', icon: '🍔' }, { name: 'Tea', icon: '☕' }, { name: 'Bun Kabab', icon: '🥪' }],
        famousThings: [{ name: 'Military Products', icon: '🎖️' }, { name: 'Crafts', icon: '🎁' }, { name: 'Clothing', icon: '👕' }, { name: 'Books', icon: '📚' }],
        famousFor: ['Clean City', 'Military Industry', 'Gardens']
      },

      // 🌄 Hill stations (project-ready detailed set)
      {
        name: 'Murree',
        city: 'Murree',
        country: 'Pakistan',
        region: 'Punjab',
        category: 'Hill Stations',
        tagline: 'Queen of Hills',
        description: 'Murree is Pakistan’s most famous hill station near Islamabad. It is known for snowfall, green mountains, hotels, and busy tourist streets. Families visit it all year for vacations and scenic views.',
        history: 'Murree developed during British rule as a summer retreat for officials. Many colonial era roads and old structures still define the town center.',
        culture: 'Murree has a lively tourism vibe with hotels, food stalls, shopping streets, and family-focused attractions throughout the year.',
        coordinates: { lat: 33.9070, lng: 73.3943 },
        isPopular: true,
        bestSeason: 'all',
        images: [
          'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=1200&q=80',
          'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80',
          'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80'
        ],
        famousLocations: [
          { name: 'Mall Road', image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=1200&q=80', description: 'Main commercial street of Murree with cafes, shops, and busy evening crowds.' },
          { name: 'Kashmir Point', image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80', description: 'Scenic viewpoint offering open hill panoramas and cool breeze.' },
          { name: 'Patriata Viewpoints', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80', description: 'A popular side trip from Murree with elevated viewpoints and forested ridges.' }
        ],
        famousFood: [{ name: 'Corn on the Cob', icon: '🌽' }, { name: 'Pakoras', icon: '🍢' }, { name: 'Tea', icon: '☕' }],
        famousThings: [{ name: 'Wool Shawls', icon: '🧣' }, { name: 'Souvenirs', icon: '🎁' }],
        famousFor: ['Snowfall', 'Tourism', 'Shopping', 'Family Trips']
      },
      {
        name: 'Nathia Gali',
        city: 'Abbottabad',
        country: 'Pakistan',
        region: 'Khyber Pakhtunkhwa',
        category: 'Hill Stations',
        tagline: 'Pine Forest Paradise',
        description: 'Nathia Gali is a peaceful hill station surrounded by pine forests and cool weather. It is less crowded than Murree and ideal for hiking and family stays.',
        history: 'Nathia Gali was established during the British era as a summer hill retreat in the Galiyat belt.',
        culture: 'It offers a quiet and nature-friendly environment with small guesthouses and laid-back mountain routines.',
        coordinates: { lat: 34.0724, lng: 73.4063 },
        isPopular: true,
        bestSeason: 'summer',
        images: [
          'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80',
          'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80'
        ],
        famousLocations: [
          { name: 'Mukshpuri Top', image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80', description: 'A well-known hiking summit with forest routes and wide valley views.' },
          { name: 'Pipeline Track', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80', description: 'Easy scenic walking trail connecting nearby Galiyat spots through pine cover.' }
        ],
        famousFood: [{ name: 'Trout Fish', icon: '🐟' }, { name: 'BBQ', icon: '🍖' }],
        famousThings: [{ name: 'Walking Sticks', icon: '🪵' }, { name: 'Wool Caps', icon: '🧢' }],
        famousFor: ['Hiking', 'Forests', 'Nature', 'Cool Weather']
      },
      {
        name: 'Ayubia',
        city: 'Abbottabad',
        country: 'Pakistan',
        region: 'Khyber Pakhtunkhwa',
        category: 'Hill Stations',
        tagline: 'Green Forest Escape',
        description: 'Ayubia is a scenic hill area known for national park forests, cool climate, and chair lift attractions in the Galiyat region.',
        history: 'Named after President Ayub Khan, the area developed as a protected park and hill tourism zone.',
        culture: 'Ayubia has an eco-tourism atmosphere focused on forest walks, family picnics, and light adventure.',
        coordinates: { lat: 34.0526, lng: 73.4032 },
        isPopular: true,
        bestSeason: 'all',
        images: [
          'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80',
          'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1200&q=80'
        ],
        famousLocations: [
          { name: 'Ayubia Chair Lift', image: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1200&q=80', description: 'Aerial forest ride with broad hill station views.' },
          { name: 'Ayubia National Park Forest', image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80', description: 'Dense pine ecosystem with walking paths and wildlife habitat.' }
        ],
        famousFood: [{ name: 'Maggi', icon: '🍜' }, { name: 'Corn', icon: '🌽' }],
        famousThings: [{ name: 'Wooden Crafts', icon: '🪵' }],
        famousFor: ['Forest', 'Hiking', 'Wildlife', 'Chair Lift']
      },
      {
        name: 'Patriata (New Murree)',
        city: 'Murree',
        country: 'Pakistan',
        region: 'Punjab',
        category: 'Hill Stations',
        tagline: 'Cable Car Hills',
        description: 'Patriata is a modern tourist point near Murree famous for long chair lift and cable car rides through green hills.',
        history: 'The area was developed to reduce tourist pressure on central Murree and provide structured recreation facilities.',
        culture: 'Patriata is energetic and family-friendly with adventure rides, food stalls, and day-trip tourism.',
        coordinates: { lat: 33.8681, lng: 73.4711 },
        isPopular: true,
        bestSeason: 'all',
        images: [
          'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80',
          'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1200&q=80'
        ],
        famousLocations: [
          { name: 'Cable Car Ride', image: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1200&q=80', description: 'Main attraction offering elevated views over deep green valleys.' },
          { name: 'Chair Lift Top', image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80', description: 'Upper viewpoint area with cool weather and broad landscape scenes.' }
        ],
        famousFood: [{ name: 'Fries', icon: '🍟' }, { name: 'Burgers', icon: '🍔' }],
        famousThings: [{ name: 'Toys', icon: '🎁' }],
        famousFor: ['Cable Car', 'Adventure', 'Views']
      },
      {
        name: 'Kallar Kahar',
        city: 'Chakwal',
        country: 'Pakistan',
        region: 'Punjab',
        category: 'Hill Stations',
        tagline: 'Salt Range Beauty',
        description: 'Kallar Kahar is a scenic Salt Range destination known for its lake, surrounding hills, and family picnic atmosphere.',
        history: 'The area has roots in the ancient Salt Range with links to older trade and settlement routes.',
        culture: 'It has a relaxed and local tourism vibe with lake-side leisure and short road trips from nearby cities.',
        coordinates: { lat: 32.7795, lng: 72.6971 },
        isPopular: true,
        bestSeason: 'spring',
        images: [
          'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&q=80',
          'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80'
        ],
        famousLocations: [
          { name: 'Kallar Kahar Lake', image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&q=80', description: 'The central lake point offering calm waters and hill reflections.' },
          { name: 'Peacock Park', image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80', description: 'Popular family stop with open green spaces and nearby viewpoints.' }
        ],
        famousFood: [{ name: 'BBQ', icon: '🍖' }],
        famousThings: [{ name: 'Local Crafts', icon: '🎁' }],
        famousFor: ['Lake', 'Picnic', 'Nature']
      },
      {
        name: 'Galiyat Region',
        city: 'Abbottabad',
        country: 'Pakistan',
        region: 'Khyber Pakhtunkhwa',
        category: 'Hill Stations',
        tagline: 'Land of Hill Stations',
        description: 'Galiyat is a hill belt that includes Nathia Gali, Dunga Gali, and surrounding forest stations with cool weather and hiking routes.',
        history: 'The region developed in colonial times as a connected series of summer mountain retreats.',
        culture: 'It offers a mountain tourism culture based on nature walks, small lodges, and seasonal family travel.',
        coordinates: { lat: 34.0697, lng: 73.3893 },
        isPopular: true,
        bestSeason: 'summer',
        images: [
          'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80',
          'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80'
        ],
        famousLocations: [
          { name: 'Nathia Gali', image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80', description: 'High-traffic hill town within the Galiyat corridor.' },
          { name: 'Dunga Gali', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80', description: 'Forest trail zone known for calm walking tracks.' },
          { name: 'Ayubia', image: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1200&q=80', description: 'National park and chair-lift attraction area in Galiyat.' }
        ],
        famousFood: [{ name: 'Trout Fish', icon: '🐟' }],
        famousThings: [{ name: 'Wool Items', icon: '🧣' }],
        famousFor: ['Hills', 'Forests', 'Tourism']
      },
      {
        name: 'Dunga Gali',
        city: 'Abbottabad',
        country: 'Pakistan',
        region: 'Khyber Pakhtunkhwa',
        category: 'Hill Stations',
        tagline: 'Peaceful Forest Walk',
        description: 'Dunga Gali is a calm hill station famous for pine forests and walking routes that connect to other Galiyat points.',
        history: 'It remained part of the wider British-era Galiyat hill system and gradually became a nature tourism stop.',
        culture: 'The area has a peaceful environment, light tourism footprint, and a strong focus on outdoor walking.',
        coordinates: { lat: 34.0600, lng: 73.4050 },
        isPopular: true,
        bestSeason: 'summer',
        images: [
          'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80',
          'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1200&q=80'
        ],
        famousLocations: [
          { name: 'Pipeline Track', image: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1200&q=80', description: 'Long and scenic forest walkway ideal for soft hiking and photography.' }
        ],
        famousFood: [{ name: 'Tea', icon: '☕' }],
        famousThings: [{ name: 'Walking Gear', icon: '🥾' }],
        famousFor: ['Hiking', 'Forest', 'Peace']
      },
      {
        name: 'Changla Gali',
        city: 'Abbottabad',
        country: 'Pakistan',
        region: 'Khyber Pakhtunkhwa',
        category: 'Hill Stations',
        tagline: 'Cold Mountain Escape',
        description: 'Changla Gali is a high-altitude hill destination known for cold weather, pine hills, and peaceful scenic surroundings.',
        history: 'It evolved in colonial times as a cool-weather station in the greater Galiyat zone.',
        culture: 'The location has a quiet mountain-town feel with modest tourism and natural landscapes.',
        coordinates: { lat: 34.0570, lng: 73.4055 },
        isPopular: true,
        bestSeason: 'summer',
        images: [
          'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1200&q=80',
          'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80'
        ],
        famousLocations: [
          { name: 'Forest Trails', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80', description: 'Cool pine routes suitable for short hikes and nature walks.' }
        ],
        famousFood: [{ name: 'Tea', icon: '☕' }],
        famousThings: [{ name: 'Wool Clothes', icon: '🧣' }],
        famousFor: ['Cold Weather', 'Nature']
      },
      {
        name: 'Thandiani',
        city: 'Abbottabad',
        country: 'Pakistan',
        region: 'Khyber Pakhtunkhwa',
        category: 'Hill Stations',
        tagline: 'Very Cold Place',
        description: 'Thandiani is a cool hill point above Abbottabad, known for open mountain views, seasonal snow, and green summer meadows.',
        history: 'Historically used as a colonial mission retreat and later developed into a local scenic tourism site.',
        culture: 'Thandiani offers a calm atmosphere with small-scale tourism and nature-focused travel.',
        coordinates: { lat: 34.2200, lng: 73.3700 },
        isPopular: true,
        bestSeason: 'all',
        images: [
          'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80'
        ],
        famousLocations: [
          { name: 'Mountain Viewpoints', image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80', description: 'High viewpoints with cloud-level scenes and valley panoramas.' }
        ],
        famousFood: [{ name: 'BBQ', icon: '🍖' }],
        famousThings: [{ name: 'Wool Caps', icon: '🧢' }],
        famousFor: ['Snow', 'Cold Weather', 'Views']
      },
      {
        name: 'Ziarat',
        city: 'Ziarat',
        country: 'Pakistan',
        region: 'Balochistan',
        category: 'Hill Stations',
        tagline: 'Juniper Forest Heaven',
        description: 'Ziarat is a historic mountain destination known for ancient juniper forests, cool climate, and cultural heritage landmarks.',
        history: 'Ziarat is remembered nationally because Quaid-e-Azam Muhammad Ali Jinnah spent his final days here.',
        culture: 'The area blends historical significance with calm hill-station life and traditional Balochi hospitality.',
        coordinates: { lat: 30.3816, lng: 67.7250 },
        isPopular: true,
        bestSeason: 'summer',
        images: [
          'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1200&q=80',
          'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80'
        ],
        famousLocations: [
          { name: 'Quaid-e-Azam Residency', image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&q=80', description: 'Historic building associated with the final days of Quaid-e-Azam.' },
          { name: 'Juniper Forest', image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80', description: 'One of the oldest juniper forest zones in the region.' }
        ],
        famousFood: [{ name: 'Sajji', icon: '🍖' }],
        famousThings: [{ name: 'Dry Fruits', icon: '🥜' }],
        famousFor: ['History', 'Forest', 'Nature']
      },

      // 🏞️ Lakes
      {
        name: 'Saif-ul-Malook Lake',
        city: 'Naran',
        country: 'Pakistan',
        region: 'Khyber Pakhtunkhwa',
        category: 'Lakes',
        description: 'High-altitude lake above Naran — jeep track, boating season, iconic mountain backdrop.',
        coordinates: { lat: 34.8833, lng: 73.7000 },
        isPopular: true,
        bestSeason: 'summer',
        images: [
          U('photo-1626685516371-a0ee93a0f370'),
          U('photo-1694327454162-bd320f1538fd'),
          U('photo-1606815455082-ad72381c8b41')
        ]
      },
      {
        name: 'Attabad Lake',
        city: 'Gojal',
        country: 'Pakistan',
        region: 'Northern Areas',
        category: 'Lakes',
        description: 'Turquoise landslide lake on the Karakoram Highway — boat rides, dramatic cliffs, link between Hunza and upper valleys.',
        coordinates: { lat: 36.3167, lng: 74.8333 },
        isPopular: true,
        bestSeason: 'summer',
        images: [
          U('photo-1611821887389-cd0ae7ebfff4'),
          U('photo-1684230715186-cb6387f1f09f'),
          U('photo-1722082933604-288a1c130475')
        ]
      },
      {
        name: 'Lower Kachura Lake (Shangrila)',
        city: 'Skardu',
        country: 'Pakistan',
        region: 'Northern Areas',
        category: 'Lakes',
        description: 'Resort lake near Skardu — red huts, boating, easy add-on with Skardu city trips.',
        coordinates: { lat: 35.4167, lng: 75.4667 },
        isPopular: true,
        bestSeason: 'summer',
        images: [
          U('photo-1604676055604-fe96097e4f9f'),
          U('photo-1633584210825-e0a95a64e653'),
          U('photo-1668197091449-0a2b87ef7650')
        ]
      }
    ];

    let added = 0;
    let skipped = 0;
    let updated = 0;

    for (const destData of destinations) {
      try {
        destData.description = withExtraDetails(
          destData.description,
          `Visitors usually spend multiple days here to explore nature, local hospitality, and nearby viewpoints in a relaxed itinerary.`
        );
        destData.history = withExtraDetails(
          destData.history,
          `Over time, the area developed as a tourism hub while preserving much of its regional identity and heritage.`
        );
        destData.culture = withExtraDetails(
          destData.culture,
          `Travelers can experience local traditions, food culture, and community lifestyle through village visits and seasonal festivals.`
        );

        destData.famousLocations = enrichFamousLocations(
          destData.name,
          destData.images,
          destData.famousLocations
        );
        destData.famousFood = enrichNamedList(destData.famousFood, destData.name, 'food');
        destData.famousThings = enrichNamedList(destData.famousThings, destData.name, 'thing');

        const safeName = escapeRegex(destData.name);
        const existing = await Destination.findOne({
          name: { $regex: new RegExp(`^${safeName}$`, 'i') }
        });

        if (existing) {
          Object.assign(existing, destData);
          await existing.save();
          updated++;
          console.log(`✅ Updated: ${destData.name}`);
        } else {
          const destination = new Destination(destData);
          await destination.save();
          added++;
          console.log(`✅ Added: ${destData.name} (${destData.category})`);
        }
      } catch (error) {
        console.error(`❌ Error adding ${destData.name}:`, error.message);
        skipped++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Added: ${added} destinations`);
    console.log(`   🔄 Updated: ${updated} destinations`);
    console.log(`   ⏭️  Skipped: ${skipped} destinations`);
    console.log(`\n🎉 Process completed!`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}
