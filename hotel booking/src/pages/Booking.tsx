import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { ShieldCheck, CreditCard, ArrowLeft, Calendar, Users, Home, Award, MapPin, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../components/common/Toast';

export const Booking: React.FC = () => {
  const { hotelId, roomId } = useParams<{ hotelId: string; roomId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { hotels, addBooking } = useApp();
  const { toast } = useToast();

  // Retrieve details forwarded from Details page state
  const bookingState = location.state as {
    checkIn: string;
    checkOut: string;
    guests: number;
    dateDiffDays: number;
    totalPrice: number;
  } || {
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    guests: 2,
    dateDiffDays: 1,
    totalPrice: 0
  };

  const hotel = hotels.find((h) => h.id === hotelId);
  const room = hotel?.rooms.find((r) => r.id === roomId);

  // Form inputs states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  
  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // GST state
  const [isGstEnabled, setIsGstEnabled] = useState(false);
  const [gstCompany, setGstCompany] = useState('');
  const [gstNumber, setGstNumber] = useState('');

  // Checkout status
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmCode, setConfirmCode] = useState('');

  if (!hotel || !room) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-extrabold text-slate-800">Invalid Booking Request</h2>
        <button onClick={() => navigate('/')} className="bg-brand-500 text-white px-6 py-2.5 rounded-xl font-bold">
          Return Home
        </button>
      </div>
    );
  }

  // Calculate prices
  const roomPrice = room.price;
  const subtotal = roomPrice * bookingState.dateDiffDays;
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const taxableAmount = subtotal - discountAmount;
  const cgst = Math.round(taxableAmount * 0.06);
  const sgst = Math.round(taxableAmount * 0.06);
  const totalPayable = taxableAmount + cgst + sgst;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    const inputUpper = couponInput.trim().toUpperCase();
    if (inputUpper === 'WELCOME10') {
      setAppliedCoupon('WELCOME10');
      setDiscountPercent(10);
      setCouponSuccess('WELCOME10 applied successfully! 10% discount subtracted.');
    } else if (inputUpper === 'STAYGOLD') {
      setAppliedCoupon('STAYGOLD');
      setDiscountPercent(15);
      setCouponSuccess('STAYGOLD applied successfully! 15% discount subtracted.');
    } else {
      setCouponError('Invalid coupon code. Try WELCOME10 or STAYGOLD.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone) {
      toast.error('Please fill out all contact fields');
      return;
    }

    if (isGstEnabled) {
      if (!gstCompany.trim()) {
        toast.error('Please fill out Company Name for GST invoicing');
        return;
      }
      if (!gstNumber.trim() || gstNumber.trim().length !== 15) {
        toast.error('Please enter a valid 15-digit GSTIN');
        return;
      }
    }

    try {
      // Call store context to add booking
      const newBooking = await addBooking({
        hotelId: hotel.id,
        hotelName: hotel.name,
        hotelImage: hotel.images[0],
        roomId: room.id,
        roomName: room.name,
        checkIn: bookingState.checkIn,
        checkOut: bookingState.checkOut,
        guests: bookingState.guests,
        rooms: 1,
        totalPrice: totalPayable,
        guestDetails: {
          fullName,
          email,
          phone,
          specialRequests
        },
        paymentMethod: cardNumber ? `Credit Card (ending in ${cardNumber.slice(-4) || '4242'})` : 'Visa Card',
        status: 'Confirmed',
        couponCode: appliedCoupon || undefined,
        discountAmount: discountAmount || undefined,
        cgst,
        sgst,
        gstCompany: isGstEnabled ? gstCompany : undefined,
        gstin: isGstEnabled ? gstNumber : undefined
      });

      setConfirmCode(newBooking.id.toUpperCase());
      setIsConfirmed(true);
    } catch (err) {
      toast.error('Failed to confirm booking: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  if (isConfirmed) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 space-y-6 text-left"
        >
          {/* Animated Success Checkmark */}
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto text-3xl font-extrabold shadow-sm">
            ✓
          </div>

          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-extrabold text-slate-900">Booking Confirmed!</h2>
            <p className="text-slate-500 text-sm">
              Your reservation is verified. We sent confirmation details to <span className="font-bold text-slate-800">{email}</span>.
            </p>
          </div>

          {/* Reservation Code */}
          <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200 text-center">
            <span className="text-xxs font-bold text-slate-400 uppercase tracking-wide block">Reservation Code</span>
            <span className="text-xl font-extrabold text-slate-800 tracking-wider uppercase font-mono">{confirmCode}</span>
          </div>

          {/* Summary Box */}
          <div className="text-xs font-semibold text-slate-500 space-y-2 border-t border-slate-100 pt-4">
            <div className="flex justify-between"><span>Hotel</span><span className="text-slate-900 font-extrabold">{hotel.name}</span></div>
            <div className="flex justify-between"><span>Room</span><span className="text-slate-900 font-bold">{room.name}</span></div>
            <div className="flex justify-between"><span>Check-In</span><span className="text-slate-900 font-bold">{bookingState.checkIn}</span></div>
            <div className="flex justify-between"><span>Check-Out</span><span className="text-slate-900 font-bold">{bookingState.checkOut}</span></div>
            
            <div className="border-t border-slate-100 pt-2 space-y-1.5">
              <div className="flex justify-between"><span>Base Rate</span><span className="text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span></div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount ({appliedCoupon})</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between"><span>CGST (6%)</span><span className="text-slate-900">₹{cgst.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span>SGST (6%)</span><span className="text-slate-900">₹{sgst.toLocaleString('en-IN')}</span></div>
              {isGstEnabled && (
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-2 space-y-1 text-xxs font-bold">
                  <div className="flex justify-between text-slate-450 uppercase"><span>Company</span><span className="text-slate-700">{gstCompany}</span></div>
                  <div className="flex justify-between text-slate-455 uppercase"><span>GSTIN</span><span className="text-slate-700 font-mono">{gstNumber}</span></div>
                </div>
              )}
            </div>

            <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-100">
              <span>Paid Amount</span><span className="text-brand-600">₹{totalPayable.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <button
              onClick={() => navigate('/')}
              className="bg-slate-150 hover:bg-slate-200 text-slate-800 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border-none cursor-pointer"
            >
              <Home size={14} /> Back Home
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-slate-900 hover:bg-brand-500 text-white py-3 rounded-xl text-xs font-bold transition-all shadow-sm border-none cursor-pointer"
            >
              View Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left space-y-6">
      {/* Back link */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs font-bold transition-colors border-none bg-transparent cursor-pointer"
      >
        <ArrowLeft size={16} /> Back to Hotel Details
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Guest Contact details */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <h3 className="font-extrabold text-slate-900 text-md flex items-center gap-2">
                <Users size={18} className="text-brand-500" /> Guest Details
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 text-xs">
                  <label className="block font-bold text-slate-500 uppercase tracking-wide">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alice Johnson"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 text-slate-800 font-semibold focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1 text-xs">
                  <label className="block font-bold text-slate-500 uppercase tracking-wide">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 text-slate-800 font-semibold focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1 text-xs">
                  <label className="block font-bold text-slate-500 uppercase tracking-wide">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. alice@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 text-slate-800 font-semibold focus:outline-none focus:border-brand-500"
                  />
                </div>

                {/* Corporate GST Invoice Section */}
                <div className="sm:col-span-2 border-t border-slate-100 pt-4 mt-2">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={isGstEnabled}
                      onChange={(e) => setIsGstEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-brand-500 border-slate-350 focus:ring-brand-500 accent-brand-500 cursor-pointer"
                    />
                    <span>Book as Business (Claim GST Input Tax Credit)</span>
                  </label>

                  {isGstEnabled && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 bg-slate-50 p-4 rounded-xl border border-slate-150 overflow-hidden"
                    >
                      <div className="space-y-1 text-xs">
                        <label className="block font-bold text-slate-500 uppercase tracking-wide">Registered Company Name *</label>
                        <input
                          type="text"
                          required={isGstEnabled}
                          placeholder="e.g. StaySphere Technologies Pvt Ltd"
                          value={gstCompany}
                          onChange={(e) => setGstCompany(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 bg-white text-slate-800 font-semibold focus:outline-none focus:border-brand-500"
                        />
                      </div>
                      <div className="space-y-1 text-xs">
                        <label className="block font-bold text-slate-500 uppercase tracking-wide">Company GSTIN (15-digit) *</label>
                        <input
                          type="text"
                          required={isGstEnabled}
                          maxLength={15}
                          placeholder="e.g. 27AAPCG0808PD1ZS"
                          value={gstNumber}
                          onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 bg-white text-slate-800 font-semibold focus:outline-none focus:border-brand-500 font-mono"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="sm:col-span-2 space-y-1 text-xs">
                  <label className="block font-bold text-slate-500 uppercase tracking-wide">Special Requests (Optional)</label>
                  <textarea
                    placeholder="e.g. Twin beds, quiet room, late check-in..."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    rows={3}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 text-slate-800 font-semibold focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment options */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <h3 className="font-extrabold text-slate-900 text-md flex items-center gap-2">
                <CreditCard size={18} className="text-brand-500" /> Payment Guarantee
              </h3>
              <p className="text-slate-400 text-xs font-semibold">Your card will not be charged until checking out of the hotel. Requires validation details.</p>

              <div className="space-y-4">
                <div className="space-y-1 text-xs">
                  <label className="block font-bold text-slate-500 uppercase tracking-wide">Card Number</label>
                  <input
                    type="text"
                    required
                    placeholder="4000 1234 5678 9010"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 text-slate-800 font-semibold focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 text-xs">
                    <label className="block font-bold text-slate-500 uppercase tracking-wide">Expiry MM/YY</label>
                    <input
                      type="text"
                      required
                      placeholder="12/28"
                      maxLength={5}
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 text-slate-800 font-semibold focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="block font-bold text-slate-500 uppercase tracking-wide">CVV</label>
                    <input
                      type="password"
                      required
                      placeholder="123"
                      maxLength={3}
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 text-slate-800 font-semibold focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-brand-500 text-white font-extrabold text-sm py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 border-none cursor-pointer"
            >
              <ShieldCheck size={16} /> Confirm Reservation (₹{totalPayable.toLocaleString('en-IN')})
            </button>
          </form>
        </div>

        {/* Right Side Sticky booking details summary */}
        <div className="space-y-6">
          {/* Coupon Code Section */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-3">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Promotional Code</h4>
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter coupon (e.g. WELCOME10)"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 bg-slate-50 text-xs font-semibold focus:outline-none focus:border-brand-500 uppercase"
              />
              <button
                type="submit"
                className="bg-slate-900 hover:bg-brand-505 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all border-none cursor-pointer"
              >
                Apply
              </button>
            </form>
            {couponError && <p className="text-rose-600 text-xxs font-bold">{couponError}</p>}
            {couponSuccess && <p className="text-emerald-600 text-xxs font-bold">{couponSuccess}</p>}
            <div className="bg-amber-50/50 p-2.5 rounded-lg border border-amber-100/50 text-xxs font-semibold text-amber-800 space-y-0.5">
              <span className="font-bold">Available Coupons:</span>
              <p>• <span className="font-bold font-mono">WELCOME10</span>: Get 10% OFF on all bookings</p>
              <p>• <span className="font-bold font-mono">STAYGOLD</span>: Get 15% OFF on premium stays</p>
            </div>
          </div>

          <div className="sticky top-20 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
            <h3 className="font-extrabold text-slate-900 text-md">Booking Summary</h3>

            {/* Hotel Mini card */}
            <div className="flex gap-4">
              <img src={hotel.images[0]} alt={hotel.name} className="w-20 h-20 object-cover rounded-xl shrink-0" />
              <div className="space-y-1">
                <h4 className="font-extrabold text-sm text-slate-900 line-clamp-2">{hotel.name}</h4>
                <div className="flex items-center gap-1 text-slate-400 text-xxs font-bold">
                  <MapPin size={10} />
                  <span>{hotel.city}, {hotel.country}</span>
                </div>
                <div className="flex">
                  {[...Array(hotel.stars)].map((_, i) => (
                    <Star key={i} size={10} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </div>

            {/* Room specs */}
            <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100 text-xs font-semibold text-slate-600">
              <div className="flex justify-between"><span>Selected Room</span><span className="text-slate-800 font-bold">{room.name}</span></div>
              <div className="flex justify-between items-center gap-2">
                <Calendar size={14} className="text-slate-400" />
                <span className="text-slate-800">{bookingState.checkIn} to {bookingState.checkOut}</span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <Users size={14} className="text-slate-400" />
                <span className="text-slate-800">{bookingState.guests} Guests</span>
              </div>
            </div>

            {/* Pricing breakdown */}
            <div className="border-t border-slate-100 pt-4 space-y-2.5 text-xs font-semibold text-slate-500">
              <div className="flex justify-between">
                <span>Room Rate ({bookingState.dateDiffDays} {bookingState.dateDiffDays === 1 ? 'night' : 'nights'})</span>
                <span className="text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount ({appliedCoupon})</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>CGST (6%)</span>
                <span className="text-slate-900">₹{cgst.toLocaleString('en-IN')}</span>
              </div>
              
              <div className="flex justify-between">
                <span>SGST (6%)</span>
                <span className="text-slate-900">₹{sgst.toLocaleString('en-IN')}</span>
              </div>
              
              <div className="border-t border-slate-100 pt-3 flex justify-between text-sm font-extrabold text-slate-900">
                <span>Total Amount Due</span>
                <span className="text-brand-600">₹{totalPayable.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl p-3 text-xxs font-bold flex gap-2">
              <Award size={16} className="shrink-0 text-emerald-600" />
              <div>
                <span>Free cancellation available</span>
                <p className="text-slate-500 font-medium mt-0.5">Cancel up to 24 hours before check-in for a full refund.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
