import { RotateCcw, SlidersHorizontal } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  BD_LOCATIONS,
  BD_UNIVERSITIES,
  type CleanlinessLevel,
  type FoodPreference,
  type RoommateWithScore,
  type SleepSchedule,
  type SmokingPreference,
  type StudyHabits,
} from '../../shared/types';
import { api, extractErrorMessage } from '../api/client';
import { MessageModal } from '../components/MessageModal';
import { RoommateCard } from '../components/RoommateCard';
import { useAuth } from '../context/AuthContext';

export function RoommatesPage() {
  const { user, showToast } = useAuth();

  // Seeker preferences used by the 7-factor matching algorithm
  const [myBudget, setMyBudget] = useState(user?.budget || 6500);
  const [myLocation, setMyLocation] = useState(user?.preferredLocation || 'Dhanmondi');
  const [mySleep, setMySleep] = useState<SleepSchedule>(user?.preferences.sleepSchedule || 'Balanced');
  const [myCleanliness, setMyCleanliness] = useState<CleanlinessLevel>(
    user?.preferences.cleanliness || 'Very Tidy'
  );
  const [myStudy, setMyStudy] = useState<StudyHabits>(user?.preferences.studyHabits || 'Quiet Focus');
  const [mySmoking, setMySmoking] = useState<SmokingPreference>(
    user?.preferences.smokingPreference || 'Non-Smoker'
  );
  const [myFood, setMyFood] = useState<FoodPreference>(
    user?.preferences.foodPreference || 'Halal / Home-style'
  );

  // Candidate Filters
  const [university, setUniversity] = useState('All');
  const [location, setLocation] = useState('All');
  const [maxBudget, setMaxBudget] = useState('');
  const [gender, setGender] = useState('All');
  const [sleepFilter, setSleepFilter] = useState('All');
  const [cleanFilter, setCleanFilter] = useState('All');
  const [studyFilter, setStudyFilter] = useState('All');
  const [smokeFilter, setSmokeFilter] = useState('All');

  const [roommates, setRoommates] = useState<RoommateWithScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [messageTarget, setMessageTarget] = useState<RoommateWithScore | null>(null);

  // Sync baseline when user logs in
  useEffect(() => {
    if (user) {
      setMyBudget(user.budget || 6500);
      setMyLocation(user.preferredLocation || 'Dhanmondi');
      setMySleep(user.preferences.sleepSchedule);
      setMyCleanliness(user.preferences.cleanliness);
      setMyStudy(user.preferences.studyHabits);
      setMySmoking(user.preferences.smokingPreference);
      setMyFood(user.preferences.foodPreference);
    }
  }, [user]);

  const fetchRoommates = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string | number> = {
        myBudget,
        myLocation,
        mySleep,
        myCleanliness,
        myStudy,
        mySmoking,
        myFood,
      };
      if (university !== 'All') params.university = university;
      if (location !== 'All') params.location = location;
      if (maxBudget) params.maxBudget = maxBudget;
      if (gender !== 'All') params.gender = gender;
      if (sleepFilter !== 'All') params.sleepSchedule = sleepFilter;
      if (cleanFilter !== 'All') params.cleanliness = cleanFilter;
      if (studyFilter !== 'All') params.studyHabits = studyFilter;
      if (smokeFilter !== 'All') params.smokingPreference = smokeFilter;

      const res = await api.get('/roommates', { params });
      setRoommates(res.data.roommates || []);
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not load roommate matches.'));
    } finally {
      setLoading(false);
    }
  }, [
    myBudget,
    myLocation,
    mySleep,
    myCleanliness,
    myStudy,
    mySmoking,
    myFood,
    university,
    location,
    maxBudget,
    gender,
    sleepFilter,
    cleanFilter,
    studyFilter,
    smokeFilter,
  ]);

  useEffect(() => {
    fetchRoommates();
  }, [fetchRoommates]);

  const saveMyPreferences = async () => {
    if (!user) {
      showToast('Sign in to save your preferences to your student profile.', 'info');
      return;
    }
    setSavingPrefs(true);
    try {
      await api.put('/users/me', {
        budget: myBudget,
        preferredLocation: myLocation,
        preferences: {
          sleepSchedule: mySleep,
          cleanliness: myCleanliness,
          studyHabits: myStudy,
          smokingPreference: mySmoking,
          foodPreference: myFood,
        },
      });
      showToast('Preferences saved! Compatibility scores updated.', 'success');
    } catch (err) {
      showToast(extractErrorMessage(err, 'Failed to save preferences.'), 'error');
    } finally {
      setSavingPrefs(false);
    }
  };

  const resetFilters = () => {
    setUniversity('All');
    setLocation('All');
    setMaxBudget('');
    setGender('All');
    setSleepFilter('All');
    setCleanFilter('All');
    setStudyFilter('All');
    setSmokeFilter('All');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-[#142B4A]">
          Roommate Finder &amp; Compatibility Matching
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Every match percentage is calculated from your budget (20%), sleep schedule (20%), cleanliness (15%), study habits (15%), smoking (10%), food (10%), and location (10%).
        </p>
      </div>

      {/* Interactive Compatibility Profile Strip */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-sm font-bold text-[#142B4A]">
              Your Matching Preferences
            </h2>
            <p className="text-xs text-slate-500">
              Adjust these to recalculate roommate compatibility scores in real time.
            </p>
          </div>
          {user && (
            <button
              type="button"
              onClick={saveMyPreferences}
              disabled={savingPrefs}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#142B4A] hover:bg-[#1E3D66] rounded-lg cursor-pointer whitespace-nowrap self-start"
            >
              {savingPrefs ? 'Saving...' : 'Save to My Profile'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Budget (BDT)
            </label>
            <input
              type="number"
              min={2000}
              max={30000}
              step={500}
              value={myBudget}
              onChange={(e) => setMyBudget(Number(e.target.value) || 6500)}
              className="w-full px-2.5 py-2 bg-[#F8FAFC] border border-slate-300 rounded-lg text-xs font-mono tabular-nums"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Location
            </label>
            <select
              value={myLocation}
              onChange={(e) => setMyLocation(e.target.value)}
              className="w-full px-2.5 py-2 bg-[#F8FAFC] border border-slate-300 rounded-lg text-xs"
            >
              {BD_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Sleep
            </label>
            <select
              value={mySleep}
              onChange={(e) => setMySleep(e.target.value as SleepSchedule)}
              className="w-full px-2.5 py-2 bg-[#F8FAFC] border border-slate-300 rounded-lg text-xs"
            >
              <option value="Early Bird">Early Bird</option>
              <option value="Balanced">Balanced</option>
              <option value="Night Owl">Night Owl</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Cleanliness
            </label>
            <select
              value={myCleanliness}
              onChange={(e) => setMyCleanliness(e.target.value as CleanlinessLevel)}
              className="w-full px-2.5 py-2 bg-[#F8FAFC] border border-slate-300 rounded-lg text-xs"
            >
              <option value="Very Tidy">Very Tidy</option>
              <option value="Moderate">Moderate</option>
              <option value="Relaxed">Relaxed</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Study Habits
            </label>
            <select
              value={myStudy}
              onChange={(e) => setMyStudy(e.target.value as StudyHabits)}
              className="w-full px-2.5 py-2 bg-[#F8FAFC] border border-slate-300 rounded-lg text-xs"
            >
              <option value="Quiet Focus">Quiet Focus</option>
              <option value="Collaborative">Collaborative</option>
              <option value="Flexible">Flexible</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Smoking
            </label>
            <select
              value={mySmoking}
              onChange={(e) => setMySmoking(e.target.value as SmokingPreference)}
              className="w-full px-2.5 py-2 bg-[#F8FAFC] border border-slate-300 rounded-lg text-xs"
            >
              <option value="Non-Smoker">Non-Smoker</option>
              <option value="Outside Only">Outside Only</option>
              <option value="Smoker">Smoker</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Food
            </label>
            <select
              value={myFood}
              onChange={(e) => setMyFood(e.target.value as FoodPreference)}
              className="w-full px-2.5 py-2 bg-[#F8FAFC] border border-slate-300 rounded-lg text-xs"
            >
              <option value="Halal / Home-style">Halal / Home-style</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Flexible">Flexible</option>
            </select>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Filter Panel */}
        <aside className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-display text-sm font-bold text-[#142B4A] inline-flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#3B82F6]" />
              Filter Candidates
            </h2>
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-medium text-[#3B82F6] hover:text-[#142B4A] inline-flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">University</label>
            <select
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-300 rounded-lg text-sm"
            >
              <option value="All">All Universities</option>
              {BD_UNIVERSITIES.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-300 rounded-lg text-sm"
            >
              <option value="All">All Locations</option>
              {BD_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Candidate Max Budget (BDT)
            </label>
            <input
              type="number"
              min={0}
              step={500}
              placeholder="e.g. 8500"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-300 rounded-lg text-sm font-mono tabular-nums"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-300 rounded-lg text-sm"
            >
              <option value="All">All</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Sleep Schedule</label>
            <select
              value={sleepFilter}
              onChange={(e) => setSleepFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-300 rounded-lg text-sm"
            >
              <option value="All">Any</option>
              <option value="Early Bird">Early Bird</option>
              <option value="Balanced">Balanced</option>
              <option value="Night Owl">Night Owl</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Cleanliness</label>
            <select
              value={cleanFilter}
              onChange={(e) => setCleanFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-300 rounded-lg text-sm"
            >
              <option value="All">Any</option>
              <option value="Very Tidy">Very Tidy</option>
              <option value="Moderate">Moderate</option>
              <option value="Relaxed">Relaxed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Study Habits</label>
            <select
              value={studyFilter}
              onChange={(e) => setStudyFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-300 rounded-lg text-sm"
            >
              <option value="All">Any</option>
              <option value="Quiet Focus">Quiet Focus</option>
              <option value="Collaborative">Collaborative</option>
              <option value="Flexible">Flexible</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Smoking</label>
            <select
              value={smokeFilter}
              onChange={(e) => setSmokeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-300 rounded-lg text-sm"
            >
              <option value="All">Any</option>
              <option value="Non-Smoker">Non-Smoker</option>
              <option value="Outside Only">Outside Only</option>
              <option value="Smoker">Smoker</option>
            </select>
          </div>
        </aside>

        {/* Results */}
        <div className="lg:col-span-9 space-y-4">
          <div className="text-xs text-slate-500 tabular-nums">
            Showing <strong className="text-[#142B4A]">{roommates.length}</strong> students sorted by compatibility score
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-72 rounded-xl bg-white border border-slate-200 animate-pulse" />
              ))}
            </div>
          ) : roommates.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-3">
              <h3 className="font-display text-lg font-bold text-[#142B4A]">
                No roommate profiles match these filters
              </h3>
              <p className="text-sm text-slate-600">
                Clear a few filters to see more compatible university students.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#142B4A] rounded-lg cursor-pointer"
              >
                Reset Candidate Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {roommates.map((rm) => (
                <RoommateCard
                  key={rm.id}
                  profile={rm}
                  onMessage={(target) => setMessageTarget(target)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {messageTarget && (
        <MessageModal
          open={Boolean(messageTarget)}
          onClose={() => setMessageTarget(null)}
          recipientId={messageTarget.userId}
          recipientName={messageTarget.name}
          defaultSubject={`Roommate connection (${messageTarget.compatibility.score}% match)`}
        />
      )}
    </div>
  );
}
