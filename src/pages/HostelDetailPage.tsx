import {
  ArrowLeft,
  BedDouble,
  Check,
  CheckCircle2,
  Heart,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
  Star,
  Utensils,
  X,
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { HostelDTO, ReviewDTO, RoomTypeOption } from '../../shared/types';
import { api, extractErrorMessage } from '../api/client';
import { MessageModal } from '../components/MessageModal';
import { SafeImage } from '../components/SafeImage';
import { useAuth } from '../context/AuthContext';

export function HostelDetailPage() {
  const { id } = useParams();
  const { user, favoriteHostelIds, toggleFavorite, showToast } = useAuth();

  const [hostel, setHostel] = useState<HostelDTO | null>(null);
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [activePhoto, setActivePhoto] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking Modal State
  const [bookingOpen, setBookingOpen] = useState(false);
  const [roomType, setRoomType] = useState<RoomTypeOption>('Shared Twin');
  const [moveInDate, setMoveInDate] = useState('2026-12-01');
  const [bookingMsg, setBookingMsg] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // Contact Modal State
  const [contactOpen, setContactOpen] = useState(false);

  // Review Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const loadDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/hostels/${id}`);
      const h: HostelDTO = res.data.hostel;
      setHostel(h);
      setReviews(res.data.reviews || []);
      if (h.roomTypes.length > 0) setRoomType(h.roomTypes[0]);
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not load hostel details.'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostel) return;
    setBookingLoading(true);
    try {
      await api.post('/bookings', {
        hostelId: hostel.id,
        roomType,
        moveInDate,
        message: bookingMsg.trim() || 'Interested in reserving a student bed.',
      });
      showToast('Booking request submitted! Track status in your dashboard.', 'success');
      setBookingOpen(false);
      setBookingMsg('');
    } catch (err) {
      showToast(extractErrorMessage(err, 'Could not submit booking request.'), 'error');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostel || !comment.trim()) return;
    setReviewLoading(true);
    try {
      const res = await api.post(`/hostels/${hostel.id}/reviews`, {
        rating,
        comment: comment.trim(),
      });
      setReviews((prev) => [res.data.review, ...prev]);
      if (res.data.hostel) setHostel(res.data.hostel);
      setComment('');
      showToast('Thank you for reviewing this hostel!', 'success');
    } catch (err) {
      showToast(extractErrorMessage(err, 'Could not submit review.'), 'error');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="h-96 bg-white border border-slate-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error || !hostel) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="font-display text-2xl font-bold text-[#142B4A]">
          {error || 'Hostel not found'}
        </h1>
        <Link
          to="/hostels"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#142B4A] text-white rounded-lg text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Hostels
        </Link>
      </div>
    );
  }

  const isSaved = favoriteHostelIds.includes(hostel.id);

  const facilityEntries: Array<{ key: keyof typeof hostel.facilities; label: string }> = [
    { key: 'wifi', label: 'High-Speed Wi-Fi' },
    { key: 'meals', label: 'Daily Meal Plan' },
    { key: 'generator', label: 'Backup Generator' },
    { key: 'attachedBathroom', label: 'Attached Bathroom' },
    { key: 'ac', label: 'Air Conditioning' },
    { key: 'laundry', label: 'Laundry Service' },
    { key: 'cctv', label: '24/7 CCTV Security' },
    { key: 'studyRoom', label: 'Dedicated Study Room' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        to="/hostels"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-[#142B4A]"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Hostel Search
      </Link>

      {/* Header + Photo Gallery + Booking Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          {/* Gallery */}
          <div className="space-y-3">
            <div className="aspect-[16/10] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
              <SafeImage
                src={hostel.photos[activePhoto] || hostel.photos[0]}
                alt={`${hostel.name} photo ${activePhoto + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
            {hostel.photos.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {hostel.photos.map((photo, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePhoto(idx)}
                    className={`aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      activePhoto === idx ? 'border-[#3B82F6]' : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <SafeImage src={photo} alt={`${hostel.name} thumbnail ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Core Details */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <div className="space-y-2 border-b border-slate-100 pb-5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1 font-medium text-[#142B4A]">
                  <MapPin className="w-3.5 h-3.5 text-[#3B82F6]" />
                  {hostel.location}
                </span>
                <span aria-hidden="true">·</span>
                <span>{hostel.genderPreference} Residence</span>
                {hostel.verified && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified Listing
                    </span>
                  </>
                )}
              </div>

              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#142B4A]">
                {hostel.name}
              </h1>
              <p className="text-sm text-slate-600">{hostel.address}</p>
            </div>

            <div className="space-y-2">
              <h2 className="font-display text-lg font-bold text-[#142B4A]">Overview</h2>
              <p className="text-sm text-slate-700 leading-relaxed">{hostel.description}</p>
            </div>

            {/* Room Types & Nearby Universities */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div>
                <h3 className="text-xs font-semibold text-slate-500 mb-2">Available Room Types</h3>
                <p className="text-sm font-medium text-[#142B4A]">
                  {hostel.roomTypes.join(' · ')}
                </p>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-500 mb-2">Nearby Universities</h3>
                <p className="text-sm font-medium text-[#142B4A]">
                  {hostel.nearbyUniversities.length > 0
                    ? hostel.nearbyUniversities.join(' · ')
                    : 'Central Dhaka Campus Transit'}
                </p>
              </div>
            </div>

            {/* Facilities */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h2 className="font-display text-lg font-bold text-[#142B4A]">Facilities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {facilityEntries.map((item) => {
                  const enabled = hostel.facilities[item.key];
                  return (
                    <div
                      key={item.key}
                      className={`p-3 rounded-lg border text-xs font-medium flex items-center gap-2 ${
                        enabled
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                          : 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                      }`}
                    >
                      <Check className={`w-3.5 h-3.5 shrink-0 ${enabled ? 'text-emerald-600' : 'text-slate-300'}`} />
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Meals & Security */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div className="space-y-1.5">
                <h3 className="font-display text-sm font-bold text-[#142B4A] inline-flex items-center gap-1.5">
                  <Utensils className="w-4 h-4 text-[#3B82F6]" />
                  Meals &amp; Dining
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">{hostel.mealsInfo}</p>
              </div>
              <div className="space-y-1.5">
                <h3 className="font-display text-sm font-bold text-[#142B4A] inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Security &amp; Caretaker
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">{hostel.securityInfo}</p>
              </div>
            </div>

            {/* Rules */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <h2 className="font-display text-lg font-bold text-[#142B4A]">House Rules</h2>
              <ul className="space-y-1.5 text-sm text-slate-700 list-disc pl-5">
                {hostel.rules.map((rule, i) => (
                  <li key={i}>{rule}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-[#142B4A]">
                Student Ratings &amp; Reviews ({reviews.length})
              </h2>
              <div className="inline-flex items-center gap-1.5 font-mono tabular-nums text-sm font-bold text-[#142B4A]">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                {hostel.rating.toFixed(1)} / 5.0
              </div>
            </div>

            {user && (
              <form onSubmit={handleReviewSubmit} className="p-4 bg-[#F8FAFC] border border-slate-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-semibold text-slate-700">Leave a Review</span>
                  <select
                    aria-label="Rating"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="px-2.5 py-1 bg-white border border-slate-300 rounded-md text-xs font-mono"
                  >
                    <option value={5}>5 Stars — Excellent</option>
                    <option value={4}>4 Stars — Good</option>
                    <option value={3}>3 Stars — Average</option>
                    <option value={2}>2 Stars — Below Average</option>
                    <option value={1}>1 Star — Poor</option>
                  </select>
                </div>
                <textarea
                  rows={2}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with Wi-Fi, cleanliness, meals, or management..."
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                />
                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#142B4A] hover:bg-[#1E3D66] rounded-lg cursor-pointer"
                >
                  {reviewLoading ? 'Posting...' : 'Post Review'}
                </button>
              </form>
            )}

            {reviews.length === 0 ? (
              <p className="text-sm text-slate-500">No reviews yet. Be the first student to share feedback.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {reviews.map((rev) => (
                  <div key={rev.id} className="py-4 first:pt-0 last:pb-0 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#142B4A]">
                        {rev.userName} · <span className="font-normal text-slate-500">{rev.userUniversity}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 font-mono font-semibold text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        {rev.rating}.0
                      </span>
                    </div>
                    <p className="text-sm text-slate-700">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Action & Owner Card */}
        <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="font-mono tabular-nums text-3xl font-bold text-[#142B4A]">
                  BDT {hostel.monthlyRent.toLocaleString()}
                </div>
                <span className="text-xs text-slate-500">per bed / month</span>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 tabular-nums">
                  <BedDouble className="w-4 h-4" />
                  {hostel.availableBeds} / {hostel.totalBeds} beds
                </div>
                <div className="text-xs text-slate-500">Available now</div>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    showToast('Please sign in to request a hostel booking.', 'info');
                    return;
                  }
                  setBookingOpen(true);
                }}
                disabled={hostel.availableBeds <= 0}
                className="w-full py-3 px-4 rounded-lg text-sm font-semibold text-white bg-[#142B4A] hover:bg-[#1E3D66] disabled:opacity-50 transition-colors cursor-pointer"
              >
                {hostel.availableBeds > 0 ? 'Request Booking' : 'Currently Full'}
              </button>

              <button
                type="button"
                onClick={() => setContactOpen(true)}
                className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-[#142B4A] bg-[#F8FAFC] border border-slate-300 hover:bg-slate-100 inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-[#3B82F6]" />
                Contact Owner
              </button>

              <button
                type="button"
                onClick={() => toggleFavorite('hostel', hostel.id)}
                className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold border inline-flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  isSaved
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-emerald-600 text-emerald-600' : ''}`} />
                {isSaved ? 'Saved to Favorites' : 'Save to Favorites'}
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
            <h2 className="font-display text-sm font-bold text-[#142B4A]">Hostel Owner</h2>
            <div>
              <div className="text-base font-semibold text-slate-900">{hostel.ownerName}</div>
              {hostel.ownerVerified && (
                <div className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified Owner
                </div>
              )}
            </div>
            {hostel.ownerPhone && (
              <div className="text-xs text-slate-600 inline-flex items-center gap-1.5 font-mono">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {hostel.ownerPhone}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Booking Request Modal */}
      {bookingOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-[#142B4A]">
                  Request Accommodation
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">{hostel.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setBookingOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Preferred Room Type
                </label>
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value as RoomTypeOption)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm"
                >
                  {hostel.roomTypes.map((rt) => (
                    <option key={rt} value={rt}>
                      {rt}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Expected Move-In Date
                </label>
                <input
                  type="date"
                  value={moveInDate}
                  onChange={(e) => setMoveInDate(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Message to Owner
                </label>
                <textarea
                  rows={3}
                  value={bookingMsg}
                  onChange={(e) => setBookingMsg(e.target.value)}
                  placeholder="Share your university, semester, and any room preferences..."
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBookingOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 border border-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#142B4A] hover:bg-[#1E3D66] cursor-pointer"
                >
                  {bookingLoading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MessageModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        recipientId={hostel.ownerId}
        recipientName={hostel.ownerName}
        hostelId={hostel.id}
        hostelName={hostel.name}
      />
    </div>
  );
}
