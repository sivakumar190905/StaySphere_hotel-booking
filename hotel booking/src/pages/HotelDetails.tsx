import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { MapPin, Star, Calendar, Users, Heart, Share2, Shield, Check, Image as ImageIcon, Compass, HelpCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const HotelDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hotels, favorites, toggleFavorite, searchParams } = useApp();

  const hotel = useMemo(() => hotels.find((h) => h.id === id), [hotels, id]);

  // Active view tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'rooms' | 'reviews'>('overview');

  // Selected room state (default to first room if available)
  const [selectedRoomId, setSelectedRoomId] = useState(hotel?.rooms[0]?.id || '');

  // Sticky widget local date states (inherited from search params)
  const [checkIn, setCheckIn] = useState(searchParams.checkIn || new Date().toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState(searchParams.checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [guests, setGuests] = useState(searchParams.guests || 2);

  // Gallery zoom state
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  // Expanded details states
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

  const nearbyAttractions = useMemo(() => {
    if (!hotel) return [];
    const city = hotel.city.toLowerCase();
    if (city.includes('udaipur')) {
      return [
        { name: 'Lake Pichola', distance: '0.4 km', time: '5 min walk', desc: 'Serene boat rides and views' },
        { name: 'City Palace Udaipur', distance: '1.2 km', time: '15 min walk', desc: 'Grand royal palace museum' },
        { name: 'Jagdish Temple', distance: '0.9 km', time: '10 min walk', desc: 'Historic 17th-century shrine' },
        { name: 'Sajjangarh Monsoon Palace', distance: '6.5 km', time: '18 min drive', desc: 'Panoramic hilltop views' },
      ];
    }
    if (city.includes('goa')) {
      return [
        { name: 'Calangute Beach', distance: '1.1 km', time: '12 min walk', desc: 'Vibrant golden sand shores' },
        { name: 'Fort Aguada', distance: '4.2 km', time: '10 min drive', desc: '17th-century Portuguese lighthouse' },
        { name: 'Anjuna Flea Market', distance: '5.8 km', time: '15 min drive', desc: 'Famous beachfront bazaar' },
        { name: 'Basilica of Bom Jesus', distance: '14.0 km', time: '25 min drive', desc: 'UNESCO world heritage church' },
      ];
    }
    if (city.includes('jaipur')) {
      return [
        { name: 'Hawa Mahal (Palace of Winds)', distance: '1.4 km', time: '15 min walk', desc: 'Iconic pink sandstone facade' },
        { name: 'Amber Fort & Palace', distance: '8.5 km', time: '20 min drive', desc: 'Majestic hilltop sandstone fort' },
        { name: 'City Palace Jaipur', distance: '1.1 km', time: '12 min walk', desc: 'Royal residence & museum' },
        { name: 'Jantar Mantar Observatory', distance: '1.0 km', time: '10 min walk', desc: 'UNESCO historic sundial park' },
      ];
    }
    if (city.includes('manali')) {
      return [
        { name: 'Solang Valley Adventure Arena', distance: '11.5 km', time: '25 min drive', desc: 'Skiing, paragliding & zorbing' },
        { name: 'Hidimba Devi Temple', distance: '1.6 km', time: '15 min walk', desc: 'Wooden shrine set in pine forests' },
        { name: 'Atal Tunnel Passway', distance: '24.0 km', time: '40 min drive', desc: 'Engineering marvel highway tunnel' },
        { name: 'Jogini Waterfall Trail', distance: '3.8 km', time: '12 min drive', desc: 'Scenic cascades and nature walks' },
      ];
    }
    return [
      { name: 'City Center Hub', distance: '0.8 km', time: '8 min walk', desc: 'Fine dining and local boutique shopping' },
      { name: 'Historical Monument Landmark', distance: '2.5 km', time: '10 min drive', desc: 'Scenic architectural viewpoints' },
      { name: 'Main Airport Terminal', distance: '18.0 km', time: '35 min drive', desc: 'Global passenger flights' },
      { name: 'Central Transit Station', distance: '4.5 km', time: '12 min drive', desc: 'Express rail connections' },
    ];
  }, [hotel]);

  if (!hotel) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-extrabold text-slate-800">Hotel not found</h2>
        <button onClick={() => navigate('/')} className="bg-brand-500 text-white px-6 py-2.5 rounded-xl font-bold">
          Return Home
        </button>
      </div>
    );
  }

  const isFavorited = favorites.includes(hotel.id);
  const selectedRoom = hotel.rooms.find((r) => r.id === selectedRoomId) || hotel.rooms[0];

  // Calculate pricing
  const dateDiffDays = useMemo(() => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return isNaN(diffDays) || diffDays <= 0 ? 1 : diffDays;
  }, [checkIn, checkOut]);

  const priceCalculations = useMemo(() => {
    if (!selectedRoom) return { subtotal: 0, tax: 0, grandTotal: 0 };
    const subtotal = selectedRoom.price * dateDiffDays;
    const tax = Math.round(subtotal * 0.12); // 12% mock tax
    const grandTotal = subtotal + tax;
    return { subtotal, tax, grandTotal };
  }, [selectedRoom, dateDiffDays]);

  const handleBookNow = () => {
    if (!selectedRoomId) return;
    navigate(`/booking/${hotel.id}/${selectedRoomId}`, {
      state: { checkIn, checkOut, guests, dateDiffDays, totalPrice: priceCalculations.grandTotal }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Title & Share Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <span className="bg-brand-50 text-brand-700 text-xxs font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
              {hotel.tag || 'Luxury Resort'}
            </span>
            <div className="flex ml-1">
              {[...Array(hotel.stars)].map((_, i) => (
                <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
              ))}
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight m-0">
            {hotel.name}
          </h1>
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
            <MapPin size={14} className="text-brand-500" />
            <span>{hotel.address}, {hotel.city}, {hotel.country}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleFavorite(hotel.id)}
            className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors"
          >
            <Heart size={16} className={isFavorited ? 'fill-red-500 text-red-500' : ''} />
            <span>{isFavorited ? 'Saved' : 'Save Stay'}</span>
          </button>
          <button className="flex items-center justify-center border border-slate-200 rounded-xl p-2 text-slate-700 bg-white hover:bg-slate-50">
            <Share2 size={16} />
          </button>
        </div>
      </div>

      {/* Grid Image Gallery */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 rounded-2xl overflow-hidden shadow-sm h-[400px]">
        {/* Main Large Image */}
        <div className="md:col-span-2 relative group overflow-hidden cursor-pointer" onClick={() => setShowAllPhotos(true)}>
          <img
            src={hotel.images[activeImageIdx]}
            alt={hotel.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <span className="absolute bottom-4 left-4 bg-slate-950/80 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <ImageIcon size={14} /> View Gallery ({hotel.images.length})
          </span>
        </div>

        {/* Smaller side previews */}
        <div className="hidden md:grid md:grid-cols-2 md:col-span-2 gap-4">
          {hotel.images.slice(0, 4).map((img, idx) => (
            <div
              key={idx}
              onClick={() => setActiveImageIdx(idx % hotel.images.length)}
              className={`relative overflow-hidden cursor-pointer group rounded-lg border-2 ${
                activeImageIdx === idx ? 'border-brand-500' : 'border-transparent'
              }`}
            >
              <img
                src={img}
                alt={`${hotel.name} preview`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Details Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Information, Tabs, Rooms */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section Navigation Tabs */}
          <div className="flex border-b border-slate-200">
            {(['overview', 'rooms', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3.5 px-6 font-bold text-sm border-b-2 capitalize transition-all ${
                  activeTab === tab
                    ? 'border-brand-500 text-brand-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <h3 className="font-extrabold text-lg text-slate-900">About the Property</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">{hotel.description}</p>
                </div>

                {/* Amenities Grid */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h3 className="font-extrabold text-lg text-slate-900">Popular Amenities</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {hotel.amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center gap-2.5 text-slate-600 text-sm font-semibold">
                        <div className="w-5 h-5 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                          <Check size={12} />
                        </div>
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mock Location Map */}
                <div className="space-y-3 pt-6 border-t border-slate-100">
                  <h3 className="font-extrabold text-lg text-slate-900">Location Map</h3>
                  <div className="h-64 bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden relative flex items-center justify-center">
                    {/* Visual representation of map */}
                    <div className="absolute inset-0 bg-blue-50/50 flex flex-col justify-between p-4">
                      <div className="text-xs text-slate-500 font-bold bg-white/95 rounded-lg px-3 py-1.5 shadow-sm w-fit flex items-center gap-1.5">
                        <MapPin size={12} className="text-brand-500" />
                        <span>Coordinates: {hotel.city}, {hotel.country}</span>
                      </div>
                    </div>
                    {/* Simulated Map Graphic */}
                    <svg className="w-full h-full text-slate-200" xmlns="http://www.w3.org/2000/svg">
                      <rect width="100%" height="100%" fill="#e6f2ff" />
                      <path d="M 0 100 Q 150 150 300 100 T 600 100 T 900 100" fill="none" stroke="#b3d9ff" strokeWidth="6" />
                      <line x1="200" y1="0" x2="200" y2="400" stroke="#fff" strokeWidth="3" />
                      <line x1="450" y1="0" x2="450" y2="400" stroke="#fff" strokeWidth="3" />
                      <line x1="0" y1="180" x2="900" y2="180" stroke="#fff" strokeWidth="3" />
                      <circle cx="350" cy="180" r="10" fill="#3b82f6" fillOpacity="0.3" />
                      <circle cx="350" cy="180" r="4" fill="#3b82f6" />
                    </svg>
                  </div>
                </div>

                {/* Nearby Attractions */}
                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                    <Compass className="text-brand-500" size={20} />
                    <span>Nearby Attractions & Landmarks</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {nearbyAttractions.map((att) => (
                      <div key={att.name} className="p-4 border border-slate-150 rounded-2xl bg-slate-50/50 flex flex-col justify-between text-xs space-y-1">
                        <div>
                          <span className="font-extrabold text-slate-900 text-[13px] block">{att.name}</span>
                          <span className="text-slate-500 font-semibold block mt-0.5">{att.desc}</span>
                        </div>
                        <span className="text-[10px] text-brand-600 font-black uppercase tracking-wider block pt-2 border-t border-slate-100/50">
                          📍 {att.distance} ({att.time})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Policies */}
                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                    <Info className="text-brand-500" size={20} />
                    <span>Hotel Guidelines & Policies</span>
                  </h3>
                  <div className="border border-slate-150 rounded-2xl p-5 bg-white space-y-4 text-xs font-semibold text-slate-655">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-slate-400 font-extrabold uppercase text-[10px] tracking-wide block">Check-In Desk</span>
                        <span className="text-slate-800 font-bold block mt-1">From 2:00 PM onwards</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-extrabold uppercase text-[10px] tracking-wide block">Check-Out Desk</span>
                        <span className="text-slate-800 font-bold block mt-1">Before 12:00 PM noon</span>
                      </div>
                    </div>
                    <div className="border-t border-slate-100 pt-3">
                      <span className="text-slate-400 font-extrabold uppercase text-[10px] tracking-wide block">Cancellation terms</span>
                      <p className="text-slate-600 font-medium leading-relaxed mt-1">Free reservation cancellations are fully eligible up to 24 hours prior to scheduled check-in arrival. Cancellations made inside the 24-hour window incur a one-night standard base rate charge.</p>
                    </div>
                    <div className="border-t border-slate-100 pt-3">
                      <span className="text-slate-400 font-extrabold uppercase text-[10px] tracking-wide block">Pet policy</span>
                      <p className="text-slate-600 font-medium leading-relaxed mt-1">Luxury villas and pool suites welcome family pets. Deluxe and standard rooms require pre-clearance and housekeeping deposit surcharges.</p>
                    </div>
                  </div>
                </div>

                {/* FAQs */}
                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                    <HelpCircle className="text-brand-500" size={20} />
                    <span>Frequently Asked Questions</span>
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        q: "Does the hotel provide airport transfer?",
                        a: "Yes, we offer complimentary private airport transfers for all suite and villa bookings. Standard room bookings can schedule a private shuttle for a surcharge of ₹1,500."
                      },
                      {
                        q: "Is early check-in or late check-out available?",
                        a: "Early check-in (before 2:00 PM) and late check-out (after 12:00 PM) are subject to room availability. StaySphere Elite members enjoy guaranteed late check-out."
                      },
                      {
                        q: "Are pool and spa accesses included in the room rate?",
                        a: "Yes, guest reservations include full complimentary access to our outdoor infinity swimming pools, fitness centers, and basic spa relaxation steam chambers. Special therapeutic massage sessions can be booked separately."
                      }
                    ].map((faq, idx) => {
                      const isFaqOpen = openFaqIdx === idx;
                      return (
                        <div key={idx} className="border border-slate-150 rounded-2xl overflow-hidden bg-white shadow-xxs">
                          <button
                            type="button"
                            onClick={() => setOpenFaqIdx(isFaqOpen ? null : idx)}
                            className="w-full flex justify-between items-center px-5 py-4 font-extrabold text-xs text-slate-900 text-left border-none bg-transparent cursor-pointer"
                          >
                            <span>{faq.q}</span>
                            <span className="text-slate-400 font-mono text-sm">{isFaqOpen ? '−' : '+'}</span>
                          </button>
                          {isFaqOpen && (
                            <div className="px-5 pb-4 text-xs font-semibold text-slate-500 leading-relaxed border-t border-slate-50 pt-3">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'rooms' && (
              <motion.div
                key="rooms"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <h3 className="font-extrabold text-lg text-slate-900">Available Room Types</h3>
                <div className="space-y-6">
                  {hotel.rooms.map((room) => (
                    <div
                      key={room.id}
                      className={`border rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row text-left transition-all ${
                        selectedRoomId === room.id ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-slate-200'
                      }`}
                    >
                      {/* Room Photo */}
                      <div className="md:w-56 h-40 md:h-auto shrink-0 relative">
                        <img src={room.images[0]} alt={room.name} className="w-full h-full object-cover" />
                      </div>

                      {/* Room Details */}
                      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                        <div>
                          <div className="flex justify-between items-start gap-4">
                            <h4 className="font-extrabold text-md text-slate-900 leading-snug">{room.name}</h4>
                            <span className="text-slate-400 text-xs font-bold font-mono uppercase">{room.sizeSqFt} sq ft</span>
                          </div>
                          
                          <div className="flex gap-4 text-xs font-bold text-slate-500 mt-1">
                            <span>Up to {room.capacity.guests} guests</span>
                            <span>•</span>
                            <span>{room.capacity.beds} King beds</span>
                          </div>

                          <div className="flex flex-wrap gap-1 mt-3">
                            {room.amenities.map((a) => (
                              <span key={a} className="bg-slate-100 text-slate-500 text-xxs font-semibold px-2 py-0.5 rounded">
                                {a}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                          <div>
                            <span className="text-2xl font-extrabold text-slate-900">₹{room.price.toLocaleString('en-IN')}</span>
                            <span className="text-slate-400 text-xxs font-semibold"> / night</span>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedRoomId(room.id);
                              setActiveTab('overview'); // visual response to help flow
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                              selectedRoomId === room.id
                                ? 'bg-brand-500 text-white'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                            }`}
                          >
                            {selectedRoomId === room.id ? 'Selected' : 'Select Room'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Guest Rating breakdown summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div className="text-center sm:border-r border-slate-200 flex flex-col justify-center space-y-1 py-2">
                    <span className="text-4xl font-extrabold text-slate-900">{hotel.rating}</span>
                    <span className="text-xs font-bold text-slate-600">Excellent Score</span>
                    <span className="text-slate-400 text-xxs font-bold">({hotel.reviewCount} total reviews)</span>
                  </div>

                  <div className="sm:col-span-2 space-y-2 py-2">
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider text-left">Rating Details</h4>
                    <div className="space-y-2 text-xs">
                      {/* Cleanliness */}
                      <div className="flex items-center gap-4">
                        <span className="w-20 font-semibold text-slate-600 text-left">Cleanliness</span>
                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-500 rounded-full" style={{ width: '96%' }} />
                        </div>
                        <span className="font-bold text-slate-800">4.9</span>
                      </div>
                      {/* Location */}
                      <div className="flex items-center gap-4">
                        <span className="w-20 font-semibold text-slate-600 text-left">Location</span>
                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-500 rounded-full" style={{ width: '92%' }} />
                        </div>
                        <span className="font-bold text-slate-800">4.8</span>
                      </div>
                      {/* Service */}
                      <div className="flex items-center gap-4">
                        <span className="w-20 font-semibold text-slate-600 text-left">Service</span>
                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-500 rounded-full" style={{ width: '90%' }} />
                        </div>
                        <span className="font-bold text-slate-800">4.7</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-6">
                  {hotel.reviews.map((rev) => (
                    <div key={rev.id} className="p-5 border border-slate-200 rounded-2xl bg-white space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm">
                            {rev.guestName[0]}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-900">{rev.guestName}</h4>
                            <p className="text-xxs text-slate-400 font-bold">{rev.date}</p>
                          </div>
                        </div>

                        <span className="bg-brand-50 text-brand-700 text-xs font-bold px-2.5 py-1 rounded-xl">
                          ★ {rev.rating.toFixed(1)}
                        </span>
                      </div>

                      <p className="text-sm text-slate-600 leading-relaxed italic">"{rev.comment}"</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs">
                        {rev.positivePoints && (
                          <div className="text-emerald-700">
                            <span className="font-bold">✓ Likes:</span>
                            <p className="text-slate-500 mt-0.5">{rev.positivePoints}</p>
                          </div>
                        )}
                        {rev.negativePoints && (
                          <div className="text-red-700">
                            <span className="font-bold">✗ Dislikes:</span>
                            <p className="text-slate-500 mt-0.5">{rev.negativePoints}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Sticky Booking Calculation Widget */}
        <div>
          <div className="sticky top-20 bg-white p-6 rounded-2xl shadow-md border border-slate-100 space-y-6">
            <h3 className="font-extrabold text-slate-900 text-md">Configure Your Stay</h3>

            {/* Dates Selection inputs */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wide mb-1">Check-In</label>
                <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50">
                  <Calendar size={16} className="text-slate-400" />
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="bg-transparent font-semibold focus:outline-none w-full text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wide mb-1">Check-Out</label>
                <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50">
                  <Calendar size={16} className="text-slate-400" />
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn || new Date().toISOString().split('T')[0]}
                    className="bg-transparent font-semibold focus:outline-none w-full text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wide mb-1">Guests</label>
                <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50">
                  <Users size={16} className="text-slate-400" />
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="bg-transparent font-semibold focus:outline-none w-full text-slate-800 cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6].map(n => (
                      <option key={n} value={n}>{n} Guests</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Room Selector Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Selected Room Option</label>
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-800 cursor-pointer focus:outline-none"
              >
                {hotel.rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name} (₹{room.price.toLocaleString('en-IN')}/night)
                  </option>
                ))}
              </select>
            </div>

            {/* Calculation details */}
            <div className="border-t border-slate-100 pt-4 space-y-2 text-xs font-semibold text-slate-500">
              <div className="flex justify-between">
                <span>₹{(selectedRoom?.price || 0).toLocaleString('en-IN')} x {dateDiffDays} nights</span>
                <span className="text-slate-900">₹{priceCalculations.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Resort fee & local taxes (12%)</span>
                <span className="text-slate-900">₹{priceCalculations.tax.toLocaleString('en-IN')}</span>
              </div>
              
              <div className="border-t border-slate-100 pt-3 flex justify-between text-sm font-extrabold text-slate-900">
                <span>Total Amount due</span>
                <span className="text-brand-600">₹{priceCalculations.grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Booking action button */}
            <button
              onClick={handleBookNow}
              className="w-full bg-slate-900 hover:bg-brand-500 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-md"
            >
              Book Stay Now
            </button>

            <div className="flex items-center gap-2 text-xxs font-bold text-slate-400 justify-center">
              <Shield size={12} className="text-brand-500" /> Secure checkout encrypted with 256-bit SSL.
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Slideshow Modal (Mock) */}
      {showAllPhotos && (
        <div className="fixed inset-0 bg-slate-950/95 z-50 flex flex-col justify-between p-6">
          <div className="flex justify-between items-center text-white">
            <span className="font-bold text-sm">Photos of {hotel.name}</span>
            <button onClick={() => setShowAllPhotos(false)} className="text-xs font-bold bg-white/10 px-3 py-1.5 rounded-lg">
              Close
            </button>
          </div>

          <div className="max-w-4xl mx-auto h-[70svh] flex items-center justify-center">
            <img src={hotel.images[activeImageIdx]} alt={hotel.name} className="max-h-full max-w-full object-contain rounded-lg shadow-2xl" />
          </div>

          <div className="flex justify-center gap-3 overflow-x-auto py-4 no-scrollbar">
            {hotel.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                onClick={() => setActiveImageIdx(idx)}
                className={`h-16 w-24 object-cover rounded-md cursor-pointer border-2 transition-all shrink-0 ${
                  activeImageIdx === idx ? 'border-brand-500' : 'border-transparent opacity-60'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
