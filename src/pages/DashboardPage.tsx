import {
  Check,
  CheckCircle2,
  Edit3,
  Heart,
  Mail,
  Plus,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  BD_LOCATIONS,
  BD_UNIVERSITIES,
  type AdminStatsDTO,
  type BookingRequestDTO,
  type CleanlinessLevel,
  type FoodPreference,
  type HostelDTO,
  type HostelGenderOption,
  type MessageDTO,
  type RoommateWithScore,
  type RoomTypeOption,
  type SleepSchedule,
  type SmokingPreference,
  type StudyHabits,
  type UserDTO,
} from '../../shared/types';
import { api, extractErrorMessage } from '../api/client';
import { HostelCard } from '../components/HostelCard';
import { MessageModal } from '../components/MessageModal';
import { RoommateCard } from '../components/RoommateCard';
import { useAuth } from '../context/AuthContext';

const PRESET_GALLERY = [
  { label: 'Dhanmondi Twin Room', url: '/src/assets/images/hostel_dhanmondi_room_1795240128171.jpg' },
  { label: 'Bashundhara Exterior', url: '/src/assets/images/hostel_bashundhara_exterior_1795240127758.jpg' },
  { label: 'Uttara Single Studio', url: '/src/assets/images/hostel_uttara_studio_1795240128257.jpg' },
  { label: 'Dining & Study Lounge', url: '/src/assets/images/hostel_chattogram_lounge_1795240128578.jpg' },
];

export function DashboardPage() {
  const { user, loading: authLoading, refreshUser, showToast, toggleFavorite } = useAuth();

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="h-48 bg-white border border-slate-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'admin') {
    return <AdminDashboard user={user} />;
  }
  if (user.role === 'owner') {
    return <OwnerDashboard user={user} />;
  }
  return <StudentDashboard user={user} refreshUser={refreshUser} showToast={showToast} toggleFavorite={toggleFavorite} />;
}

// ============================================================================
// STUDENT DASHBOARD
// ============================================================================
function StudentDashboard({
  user,
  refreshUser,
  showToast,
  toggleFavorite,
}: {
  user: UserDTO;
  refreshUser: () => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  toggleFavorite: (itemType: 'hostel' | 'roommate', itemId: string) => Promise<boolean>;
}) {
  const [tab, setTab] = useState<'requests' | 'favorites' | 'matches' | 'messages' | 'profile'>('requests');
  const [bookings, setBookings] = useState<BookingRequestDTO[]>([]);
  const [favHostels, setFavHostels] = useState<HostelDTO[]>([]);
  const [favRoommates, setFavRoommates] = useState<RoommateWithScore[]>([]);
  const [topMatches, setTopMatches] = useState<RoommateWithScore[]>([]);
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyTarget, setReplyTarget] = useState<MessageDTO | null>(null);
  const [connectTarget, setConnectTarget] = useState<RoommateWithScore | null>(null);

  // Profile Edit State
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [university, setUniversity] = useState(user.university || BD_UNIVERSITIES[0]);
  const [department, setDepartment] = useState(user.department || '');
  const [semester, setSemester] = useState(user.semester || '3rd Year');
  const [gender, setGender] = useState(user.gender);
  const [budget, setBudget] = useState(user.budget);
  const [preferredLocation, setPreferredLocation] = useState(user.preferredLocation || 'Dhanmondi');
  const [bio, setBio] = useState(user.bio || '');
  const [sleepSchedule, setSleepSchedule] = useState<SleepSchedule>(user.preferences.sleepSchedule);
  const [cleanliness, setCleanliness] = useState<CleanlinessLevel>(user.preferences.cleanliness);
  const [studyHabits, setStudyHabits] = useState<StudyHabits>(user.preferences.studyHabits);
  const [smokingPreference, setSmokingPreference] = useState<SmokingPreference>(
    user.preferences.smokingPreference
  );
  const [foodPreference, setFoodPreference] = useState<FoodPreference>(
    user.preferences.foodPreference
  );
  const [savingProfile, setSavingProfile] = useState(false);

  const loadStudentData = useCallback(async () => {
    setLoading(true);
    try {
      const [bRes, fRes, rRes, mRes] = await Promise.all([
        api.get('/bookings'),
        api.get('/favorites'),
        api.get('/roommates'),
        api.get('/messages'),
      ]);
      setBookings(bRes.data.bookings || []);
      setFavHostels(fRes.data.hostels || []);
      setFavRoommates(fRes.data.roommates || []);
      setTopMatches((rRes.data.roommates || []).slice(0, 4));
      setMessages(mRes.data.messages || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudentData();
  }, [loadStudentData]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.put('/users/me', {
        name,
        phone,
        university,
        department,
        semester,
        gender,
        budget,
        preferredLocation,
        bio,
        preferences: {
          sleepSchedule,
          cleanliness,
          studyHabits,
          smokingPreference,
          foodPreference,
        },
      });
      await refreshUser();
      await loadStudentData();
      showToast('Profile and roommate preferences updated.', 'success');
    } catch (err) {
      showToast(extractErrorMessage(err, 'Could not update profile.'), 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const unreadCount = messages.filter((m) => m.recipientId === user.id && !m.read).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#3B82F6]">Student Dashboard</p>
          <h1 className="font-display text-3xl font-bold text-[#142B4A]">
            Welcome, {user.name}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {user.university} · {user.department} · Preferred: {user.preferredLocation} (BDT {user.budget.toLocaleString()}/mo)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/hostels"
            className="px-4 py-2 text-xs font-semibold text-[#142B4A] bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Browse Hostels
          </Link>
          <Link
            to="/roommates"
            className="px-4 py-2 text-xs font-semibold text-white bg-[#142B4A] hover:bg-[#1E3D66] rounded-lg"
          >
            Find Roommates
          </Link>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Accommodation Requests</div>
          <div className="font-mono tabular-nums text-2xl font-bold text-[#142B4A] mt-1">
            {bookings.length}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Saved Hostels</div>
          <div className="font-mono tabular-nums text-2xl font-bold text-[#142B4A] mt-1">
            {favHostels.length}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Saved Roommates</div>
          <div className="font-mono tabular-nums text-2xl font-bold text-[#142B4A] mt-1">
            {favRoommates.length}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Unread Notifications</div>
          <div className="font-mono tabular-nums text-2xl font-bold text-[#3B82F6] mt-1">
            {unreadCount}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-lg w-fit">
        {(
          [
            ['requests', 'Accommodation Requests'],
            ['favorites', 'Favorites'],
            ['matches', 'Roommate Matches'],
            ['messages', `Notifications (${messages.length})`],
            ['profile', 'Edit Profile'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              tab === key ? 'bg-white text-[#142B4A] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-64 bg-white border border-slate-200 rounded-xl animate-pulse" />
      ) : (
        <>
          {tab === 'requests' && (
            <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-[#142B4A]">
                  My Accommodation Requests
                </h2>
              </div>
              {bookings.length === 0 ? (
                <div className="p-8 text-center space-y-3">
                  <p className="text-sm text-slate-600">
                    You have not submitted any hostel booking requests yet.
                  </p>
                  <Link
                    to="/hostels"
                    className="inline-block px-4 py-2 text-xs font-semibold text-white bg-[#142B4A] rounded-lg"
                  >
                    Explore Hostels
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {bookings.map((b) => (
                    <div key={b.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <Link
                          to={`/hostels/${b.hostelId}`}
                          className="font-display text-base font-bold text-[#142B4A] hover:text-[#3B82F6]"
                        >
                          {b.hostelName}
                        </Link>
                        <p className="text-xs text-slate-600">
                          {b.hostelLocation} · {b.roomType} · Move-in: <span className="font-mono">{b.moveInDate}</span> ·{' '}
                          <span className="font-mono font-semibold">BDT {b.monthlyRent.toLocaleString()}/mo</span>
                        </p>
                        {b.ownerNote && (
                          <p className="text-xs text-slate-700 bg-[#F8FAFC] border border-slate-200 rounded-lg px-3 py-2 mt-2">
                            Owner Note: {b.ownerNote}
                          </p>
                        )}
                      </div>

                      <span
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap self-start sm:self-center ${
                          b.status === 'Accepted'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : b.status === 'Rejected'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        Status: {b.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {tab === 'favorites' && (
            <div className="space-y-8">
              <section className="space-y-4">
                <h2 className="font-display text-lg font-bold text-[#142B4A]">
                  Saved Hostels ({favHostels.length})
                </h2>
                {favHostels.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-600">
                    No saved hostels yet. Click the heart icon on any hostel to save it here.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {favHostels.map((h) => (
                      <HostelCard key={h.id} hostel={h} />
                    ))}
                  </div>
                )}
              </section>

              <section className="space-y-4">
                <h2 className="font-display text-lg font-bold text-[#142B4A]">
                  Saved Roommates ({favRoommates.length})
                </h2>
                {favRoommates.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-600">
                    No saved roommate profiles yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {favRoommates.map((rm) => (
                      <div key={rm.id} className="space-y-2">
                        <RoommateCard
                          profile={rm}
                          onMessage={(target) => setConnectTarget(target)}
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            await toggleFavorite('roommate', rm.id);
                            loadStudentData();
                          }}
                          className="text-xs text-red-600 hover:underline cursor-pointer"
                        >
                          Remove from saved roommates
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {tab === 'matches' && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-[#142B4A]">
                  Top Roommate Matches for Your Profile
                </h2>
                <Link to="/roommates" className="text-xs font-semibold text-[#3B82F6]">
                  View all candidates
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {topMatches.map((rm) => (
                  <RoommateCard
                    key={rm.id}
                    profile={rm}
                    onMessage={(target) => setConnectTarget(target)}
                  />
                ))}
              </div>
            </section>
          )}

          {tab === 'messages' && (
            <section className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
              <div className="p-5">
                <h2 className="font-display text-lg font-bold text-[#142B4A]">
                  Messages &amp; Notifications
                </h2>
              </div>
              {messages.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  No messages yet.
                </div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className="p-5 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-bold text-[#142B4A]">{m.subject}</div>
                        <div className="text-xs text-slate-500">
                          {m.senderId === user.id ? `To: ${m.recipientName}` : `From: ${m.senderName}`}
                          {m.hostelName ? ` · ${m.hostelName}` : ''}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {m.recipientId === user.id && !m.read && (
                          <button
                            type="button"
                            onClick={async () => {
                              await api.patch(`/messages/${m.id}/read`);
                              loadStudentData();
                            }}
                            className="text-xs font-semibold text-[#3B82F6] cursor-pointer"
                          >
                            Mark read
                          </button>
                        )}
                        {m.senderId !== user.id && (
                          <button
                            type="button"
                            onClick={() => setReplyTarget(m)}
                            className="px-3 py-1.5 text-xs font-semibold bg-[#142B4A] text-white rounded-lg cursor-pointer"
                          >
                            Reply
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-slate-700">{m.body}</p>
                  </div>
                ))
              )}
            </section>
          )}

          {tab === 'profile' && (
            <form
              onSubmit={handleSaveProfile}
              className="bg-white border border-slate-200 rounded-xl p-6 space-y-6"
            >
              <h2 className="font-display text-lg font-bold text-[#142B4A]">
                Edit Profile &amp; Roommate Preferences
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">University</label>
                  <select
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    {BD_UNIVERSITIES.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Semester / Year</label>
                  <input
                    type="text"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Budget (BDT)</label>
                  <input
                    type="number"
                    min={2000}
                    max={40000}
                    step={500}
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value) || 6500)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Location</label>
                  <select
                    value={preferredLocation}
                    onChange={(e) => setPreferredLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    {BD_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sleep Schedule</label>
                  <select
                    value={sleepSchedule}
                    onChange={(e) => setSleepSchedule(e.target.value as SleepSchedule)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="Early Bird">Early Bird</option>
                    <option value="Balanced">Balanced</option>
                    <option value="Night Owl">Night Owl</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cleanliness</label>
                  <select
                    value={cleanliness}
                    onChange={(e) => setCleanliness(e.target.value as CleanlinessLevel)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="Very Tidy">Very Tidy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Relaxed">Relaxed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Study Habits</label>
                  <select
                    value={studyHabits}
                    onChange={(e) => setStudyHabits(e.target.value as StudyHabits)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="Quiet Focus">Quiet Focus</option>
                    <option value="Collaborative">Collaborative</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Smoking</label>
                  <select
                    value={smokingPreference}
                    onChange={(e) => setSmokingPreference(e.target.value as SmokingPreference)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="Non-Smoker">Non-Smoker</option>
                    <option value="Outside Only">Outside Only</option>
                    <option value="Smoker">Smoker</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Food Preference</label>
                  <select
                    value={foodPreference}
                    onChange={(e) => setFoodPreference(e.target.value as FoodPreference)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="Halal / Home-style">Halal / Home-style</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Short Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#142B4A] hover:bg-[#1E3D66] cursor-pointer"
              >
                {savingProfile ? 'Saving Changes...' : 'Save Profile'}
              </button>
            </form>
          )}
        </>
      )}

      {replyTarget && (
        <MessageModal
          open={Boolean(replyTarget)}
          onClose={() => setReplyTarget(null)}
          recipientId={replyTarget.senderId}
          recipientName={replyTarget.senderName}
          hostelId={replyTarget.hostelId}
          hostelName={replyTarget.hostelName}
          defaultSubject={`Re: ${replyTarget.subject}`}
        />
      )}

      {connectTarget && (
        <MessageModal
          open={Boolean(connectTarget)}
          onClose={() => setConnectTarget(null)}
          recipientId={connectTarget.userId}
          recipientName={connectTarget.name}
          defaultSubject={`Roommate connection via NestLink`}
        />
      )}
    </div>
  );
}

// ============================================================================
// HOSTEL OWNER DASHBOARD
// ============================================================================
function OwnerDashboard({ user }: { user: UserDTO }) {
  const { showToast } = useAuth();
  const [tab, setTab] = useState<'listings' | 'requests' | 'messages'>('listings');
  const [hostels, setHostels] = useState<HostelDTO[]>([]);
  const [bookings, setBookings] = useState<BookingRequestDTO[]>([]);
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Add/Edit Hostel Modal
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [location, setLocation] = useState<string>(BD_LOCATIONS[0]);
  const [address, setAddress] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('6500');
  const [totalBeds, setTotalBeds] = useState('24');
  const [availableBeds, setAvailableBeds] = useState('6');
  const [genderPreference, setGenderPreference] = useState<HostelGenderOption>('Male');
  const [roomTypes, setRoomTypes] = useState<RoomTypeOption[]>(['Shared Twin', 'Single']);
  const [photos, setPhotos] = useState<string[]>([PRESET_GALLERY[0].url]);
  const [description, setDescription] = useState('');
  const [mealsInfo, setMealsInfo] = useState('Three home-style meals optional.');
  const [securityInfo, setSecurityInfo] = useState('24/7 caretaker and CCTV surveillance.');
  const [nearbyInput, setNearbyInput] = useState('University of Dhaka, BUET');
  const [facilities, setFacilities] = useState({
    wifi: true,
    meals: true,
    generator: true,
    attachedBathroom: false,
    ac: false,
    laundry: true,
    cctv: true,
    studyRoom: true,
  });
  const [savingHostel, setSavingHostel] = useState(false);
  const [replyTarget, setReplyTarget] = useState<MessageDTO | null>(null);

  const loadOwnerData = useCallback(async () => {
    setLoading(true);
    try {
      const [hRes, bRes, mRes] = await Promise.all([
        api.get('/hostels/mine'),
        api.get('/bookings'),
        api.get('/messages'),
      ]);
      setHostels(hRes.data.hostels || []);
      setBookings(bRes.data.bookings || []);
      setMessages(mRes.data.messages || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOwnerData();
  }, [loadOwnerData]);

  const openNewForm = () => {
    setEditingId(null);
    setName('');
    setLocation('Dhanmondi');
    setAddress('');
    setMonthlyRent('6500');
    setTotalBeds('24');
    setAvailableBeds('6');
    setGenderPreference('Male');
    setRoomTypes(['Shared Twin', 'Single']);
    setPhotos([PRESET_GALLERY[0].url]);
    setDescription('');
    setMealsInfo('Three home-style meals optional.');
    setSecurityInfo('24/7 caretaker and CCTV surveillance.');
    setNearbyInput('University of Dhaka, BUET');
    setFacilities({
      wifi: true,
      meals: true,
      generator: true,
      attachedBathroom: false,
      ac: false,
      laundry: true,
      cctv: true,
      studyRoom: true,
    });
    setFormOpen(true);
  };

  const openEditForm = (h: HostelDTO) => {
    setEditingId(h.id);
    setName(h.name);
    setLocation(h.location);
    setAddress(h.address);
    setMonthlyRent(String(h.monthlyRent));
    setTotalBeds(String(h.totalBeds));
    setAvailableBeds(String(h.availableBeds));
    setGenderPreference(h.genderPreference);
    setRoomTypes(h.roomTypes);
    setPhotos(h.photos.length > 0 ? h.photos : [PRESET_GALLERY[0].url]);
    setDescription(h.description);
    setMealsInfo(h.mealsInfo);
    setSecurityInfo(h.securityInfo);
    setNearbyInput(h.nearbyUniversities.join(', '));
    setFacilities(h.facilities);
    setFormOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 900_000) {
      showToast('Please select an image under 900KB.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotos((prev) => [reader.result as string, ...prev].slice(0, 5));
        showToast('Image uploaded to listing gallery.', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveHostel = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingHostel(true);
    try {
      const payload = {
        name,
        location,
        address,
        monthlyRent: Number(monthlyRent),
        totalBeds: Number(totalBeds),
        availableBeds: Number(availableBeds),
        genderPreference,
        roomTypes: roomTypes.length > 0 ? roomTypes : ['Shared Twin'],
        photos,
        description,
        mealsInfo,
        securityInfo,
        nearbyUniversities: nearbyInput
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        facilities,
      };
      if (editingId) {
        await api.put(`/hostels/${editingId}`, payload);
        showToast('Hostel listing updated.', 'success');
      } else {
        await api.post('/hostels', payload);
        showToast(
          user.verifiedOwner
            ? 'New hostel listing published!'
            : 'Hostel submitted! Pending admin approval.',
          'success'
        );
      }
      setFormOpen(false);
      await loadOwnerData();
    } catch (err) {
      showToast(extractErrorMessage(err, 'Could not save hostel listing.'), 'error');
    } finally {
      setSavingHostel(false);
    }
  };

  const handleDeleteHostel = async (id: string) => {
    try {
      await api.delete(`/hostels/${id}`);
      showToast('Hostel listing deleted.', 'info');
      loadOwnerData();
    } catch (err) {
      showToast(extractErrorMessage(err, 'Could not delete hostel.'), 'error');
    }
  };

  const handleBookingDecision = async (bookingId: string, status: 'Accepted' | 'Rejected') => {
    const note =
      status === 'Accepted'
        ? 'Your room reservation is approved. Please bring your student ID during check-in.'
        : 'Sorry, we could not accommodate this request for the selected dates.';
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status, ownerNote: note });
      showToast(`Booking request marked as ${status}.`, 'success');
      loadOwnerData();
    } catch (err) {
      showToast(extractErrorMessage(err, 'Could not update booking status.'), 'error');
    }
  };

  const totalBedsAvailable = hostels.reduce((s, h) => s + h.availableBeds, 0);
  const pendingCount = bookings.filter((b) => b.status === 'Pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#3B82F6]">Hostel Owner Dashboard</p>
          <h1 className="font-display text-3xl font-bold text-[#142B4A]">
            {user.name}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {user.verifiedOwner ? 'Verified Owner Account' : 'Verification Pending'} · {user.email}
          </p>
        </div>
        <button
          type="button"
          onClick={openNewForm}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#142B4A] hover:bg-[#1E3D66] rounded-lg cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" />
          Add New Hostel
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">My Hostels</div>
          <div className="font-mono tabular-nums text-2xl font-bold text-[#142B4A] mt-1">
            {hostels.length}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Available Beds</div>
          <div className="font-mono tabular-nums text-2xl font-bold text-emerald-700 mt-1">
            {totalBedsAvailable}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Pending Requests</div>
          <div className="font-mono tabular-nums text-2xl font-bold text-amber-700 mt-1">
            {pendingCount}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Messages</div>
          <div className="font-mono tabular-nums text-2xl font-bold text-[#3B82F6] mt-1">
            {messages.length}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-lg w-fit">
        {(
          [
            ['listings', `My Listings (${hostels.length})`],
            ['requests', `Student Requests (${bookings.length})`],
            ['messages', `Messages (${messages.length})`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              tab === key ? 'bg-white text-[#142B4A] shadow-xs' : 'text-slate-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-64 bg-white border border-slate-200 rounded-xl animate-pulse" />
      ) : (
        <>
          {tab === 'listings' && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              {hostels.length === 0 ? (
                <div className="p-8 text-center space-y-3">
                  <p className="text-sm text-slate-600">You have not listed any hostels yet.</p>
                  <button
                    type="button"
                    onClick={openNewForm}
                    className="px-4 py-2 text-xs font-semibold bg-[#142B4A] text-white rounded-lg cursor-pointer"
                  >
                    Create First Listing
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {hostels.map((h) => (
                    <div key={h.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/hostels/${h.id}`}
                            className="font-display text-base font-bold text-[#142B4A] hover:text-[#3B82F6]"
                          >
                            {h.name}
                          </Link>
                          <span className="text-xs text-slate-500">
                            · {h.approved ? 'Published' : 'Pending Approval'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 tabular-nums">
                          {h.location} · <strong className="font-mono">BDT {h.monthlyRent.toLocaleString()}/mo</strong> · {h.availableBeds}/{h.totalBeds} beds available · {h.genderPreference}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => openEditForm(h)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#142B4A] border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteHostel(h.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-700 border border-red-200 rounded-lg hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'requests' && (
            <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
              {bookings.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  No student accommodation requests yet.
                </div>
              ) : (
                bookings.map((b) => (
                  <div key={b.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="font-display text-base font-bold text-[#142B4A]">
                        {b.studentName}{' '}
                        <span className="text-xs font-normal text-slate-500">
                          ({b.studentUniversity})
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        Hostel: <strong>{b.hostelName}</strong> · {b.roomType} · Move-in: {b.moveInDate} · Phone:{' '}
                        <span className="font-mono">{b.studentPhone}</span>
                      </p>
                      {b.message && <p className="text-sm text-slate-700 pt-1">&ldquo;{b.message}&rdquo;</p>}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {b.status === 'Pending' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleBookingDecision(b.id, 'Accepted')}
                            className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Accept
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBookingDecision(b.id, 'Rejected')}
                            className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-semibold text-red-700 border border-red-200 hover:bg-red-50 rounded-lg cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </>
                      ) : (
                        <span
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                            b.status === 'Accepted'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {b.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'messages' && (
            <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
              {messages.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">No messages yet.</div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className="p-5 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-[#142B4A]">{m.subject}</div>
                      <div className="text-xs text-slate-500">
                        {m.senderId === user.id ? `To: ${m.recipientName}` : `From: ${m.senderName}`}
                        {m.hostelName ? ` · ${m.hostelName}` : ''}
                      </div>
                      <p className="text-sm text-slate-700">{m.body}</p>
                    </div>
                    {m.senderId !== user.id && (
                      <button
                        type="button"
                        onClick={() => setReplyTarget(m)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-[#142B4A] rounded-lg cursor-pointer shrink-0"
                      >
                        Reply
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* Add / Edit Hostel Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full p-6 my-8 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-[#142B4A]">
                {editingId ? 'Edit Hostel Listing' : 'Add New Hostel'}
              </h2>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHostel} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hostel Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    {BD_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Rent (BDT/mo)</label>
                  <input
                    type="number"
                    min={1000}
                    max={50000}
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Total Beds</label>
                  <input
                    type="number"
                    min={1}
                    value={totalBeds}
                    onChange={(e) => setTotalBeds(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Available Beds</label>
                  <input
                    type="number"
                    min={0}
                    value={availableBeds}
                    onChange={(e) => setAvailableBeds(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={genderPreference}
                    onChange={(e) => setGenderPreference(e.target.value as HostelGenderOption)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Co-ed">Co-ed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Photos (Upload image or choose preset)
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-[#F8FAFC] hover:bg-slate-100 cursor-pointer">
                    Upload Image
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} className="hidden" />
                  </label>
                  {PRESET_GALLERY.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() =>
                        setPhotos((prev) =>
                          prev.includes(preset.url) ? prev : [...prev, preset.url].slice(0, 5)
                        )
                      }
                      className={`px-2.5 py-1.5 text-xs rounded-lg border cursor-pointer ${
                        photos.includes(preset.url)
                          ? 'bg-[#142B4A] text-white border-[#142B4A]'
                          : 'bg-white text-slate-600 border-slate-300'
                      }`}
                    >
                      + {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-xs font-semibold text-slate-700 mb-1.5">Facilities</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {(
                    [
                      ['wifi', 'Wi-Fi'],
                      ['meals', 'Meals'],
                      ['generator', 'Generator'],
                      ['attachedBathroom', 'Attached Bath'],
                      ['ac', 'AC'],
                      ['laundry', 'Laundry'],
                      ['cctv', 'CCTV'],
                      ['studyRoom', 'Study Room'],
                    ] as const
                  ).map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={facilities[key]}
                        onChange={(e) =>
                          setFacilities((prev) => ({ ...prev, [key]: e.target.checked }))
                        }
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nearby Universities (comma-separated)
                </label>
                <input
                  type="text"
                  value={nearbyInput}
                  onChange={(e) => setNearbyInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingHostel}
                  className="px-5 py-2 text-sm font-semibold text-white bg-[#142B4A] hover:bg-[#1E3D66] rounded-lg cursor-pointer"
                >
                  {savingHostel ? 'Saving...' : editingId ? 'Save Changes' : 'Publish Hostel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {replyTarget && (
        <MessageModal
          open={Boolean(replyTarget)}
          onClose={() => setReplyTarget(null)}
          recipientId={replyTarget.senderId}
          recipientName={replyTarget.senderName}
          hostelId={replyTarget.hostelId}
          hostelName={replyTarget.hostelName}
          defaultSubject={`Re: ${replyTarget.subject}`}
        />
      )}
    </div>
  );
}

// ============================================================================
// ADMIN DASHBOARD
// ============================================================================
function AdminDashboard({ user }: { user: UserDTO }) {
  const { showToast } = useAuth();
  const [tab, setTab] = useState<'hostels' | 'users' | 'requests'>('hostels');
  const [stats, setStats] = useState<AdminStatsDTO | null>(null);
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [hostels, setHostels] = useState<HostelDTO[]>([]);
  const [bookings, setBookings] = useState<BookingRequestDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAdminOverview = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/overview');
      setStats(res.data.stats);
      setUsers(res.data.users || []);
      setHostels(res.data.hostels || []);
      setBookings(res.data.bookings || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminOverview();
  }, [loadAdminOverview]);

  const toggleHostelApproval = async (h: HostelDTO) => {
    try {
      await api.patch(`/admin/hostels/${h.id}/approve`, {
        approved: !h.approved,
        verified: !h.approved,
      });
      showToast(h.approved ? 'Hostel moved to unapproved.' : 'Hostel approved & verified.', 'success');
      loadAdminOverview();
    } catch (err) {
      showToast(extractErrorMessage(err, 'Action failed.'), 'error');
    }
  };

  const removeHostel = async (id: string) => {
    try {
      await api.delete(`/hostels/${id}`);
      showToast('Listing removed.', 'info');
      loadAdminOverview();
    } catch (err) {
      showToast(extractErrorMessage(err, 'Could not remove listing.'), 'error');
    }
  };

  const toggleOwnerVerify = async (u: UserDTO) => {
    try {
      await api.patch(`/admin/users/${u.id}/verify`, { verifiedOwner: !u.verifiedOwner });
      showToast(
        u.verifiedOwner ? 'Owner verification revoked.' : `${u.name} verified as Hostel Owner.`,
        'success'
      );
      loadAdminOverview();
    } catch (err) {
      showToast(extractErrorMessage(err, 'Could not update verification.'), 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <p className="text-xs font-semibold text-[#3B82F6]">Administrator Console</p>
        <h1 className="font-display text-3xl font-bold text-[#142B4A]">
          Platform Overview ({user.name})
        </h1>
      </div>

      {/* Required Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Total Students</div>
          <div className="font-mono tabular-nums text-2xl font-bold text-[#142B4A] mt-1">
            {stats?.totalStudents ?? 0}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Total Hostels</div>
          <div className="font-mono tabular-nums text-2xl font-bold text-[#142B4A] mt-1">
            {stats?.totalHostels ?? 0}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Total Owners</div>
          <div className="font-mono tabular-nums text-2xl font-bold text-[#142B4A] mt-1">
            {stats?.totalOwners ?? 0}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Pending Requests</div>
          <div className="font-mono tabular-nums text-2xl font-bold text-amber-700 mt-1">
            {stats?.pendingRequests ?? 0}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-lg w-fit">
        {(
          [
            ['hostels', `Hostel Listings (${hostels.length})`],
            ['users', `Users & Owners (${users.length})`],
            ['requests', `Booking Requests (${bookings.length})`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              tab === key ? 'bg-white text-[#142B4A] shadow-xs' : 'text-slate-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-64 bg-white border border-slate-200 rounded-xl animate-pulse" />
      ) : (
        <>
          {tab === 'hostels' && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500">
                    <th className="p-4 font-semibold">Hostel</th>
                    <th className="p-4 font-semibold">Owner</th>
                    <th className="p-4 font-semibold">Rent</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {hostels.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50/60">
                      <td className="p-4">
                        <Link to={`/hostels/${h.id}`} className="font-semibold text-[#142B4A] hover:underline">
                          {h.name}
                        </Link>
                        <div className="text-xs text-slate-500">{h.location}</div>
                      </td>
                      <td className="p-4 text-xs text-slate-700">{h.ownerName}</td>
                      <td className="p-4 font-mono tabular-nums text-xs font-semibold text-[#142B4A]">
                        BDT {h.monthlyRent.toLocaleString()}
                      </td>
                      <td className="p-4 text-xs font-semibold">
                        <span className={h.approved ? 'text-emerald-700' : 'text-amber-700'}>
                          {h.approved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => toggleHostelApproval(h)}
                          className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg hover:bg-slate-100 cursor-pointer"
                        >
                          {h.approved ? 'Unapprove' : 'Approve'}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeHostel(h.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-red-700 border border-red-200 rounded-lg hover:bg-red-50 cursor-pointer"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'users' && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500">
                    <th className="p-4 font-semibold">User</th>
                    <th className="p-4 font-semibold">Role</th>
                    <th className="p-4 font-semibold">Campus / Location</th>
                    <th className="p-4 font-semibold text-right">Owner Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="p-4">
                        <div className="font-semibold text-[#142B4A]">{u.name}</div>
                        <div className="text-xs text-slate-500">{u.email}</div>
                      </td>
                      <td className="p-4 text-xs font-medium capitalize text-slate-700">{u.role}</td>
                      <td className="p-4 text-xs text-slate-600">
                        {u.university || u.preferredLocation || '—'}
                      </td>
                      <td className="p-4 text-right">
                        {u.role === 'owner' ? (
                          <button
                            type="button"
                            onClick={() => toggleOwnerVerify(u)}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer ${
                              u.verifiedOwner
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {u.verifiedOwner ? 'Verified Owner' : 'Verify Owner'}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'requests' && (
            <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
              {bookings.map((b) => (
                <div key={b.id} className="p-4 flex items-center justify-between gap-4 text-sm">
                  <div>
                    <div className="font-semibold text-[#142B4A]">
                      {b.studentName} → {b.hostelName}
                    </div>
                    <div className="text-xs text-slate-500">
                      {b.roomType} · Move-in {b.moveInDate}
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-700">{b.status}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
