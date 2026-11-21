import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BD_LOCATIONS, type HostelDTO } from '../../shared/types';
import { api, extractErrorMessage } from '../api/client';
import { HostelCard } from '../components/HostelCard';

export function HostelsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [location, setLocation] = useState(searchParams.get('location') || 'All');
  const [minRent, setMinRent] = useState(searchParams.get('minRent') || '');
  const [maxRent, setMaxRent] = useState(searchParams.get('maxRent') || '');
  const [gender, setGender] = useState(searchParams.get('gender') || 'All');
  const [roomType, setRoomType] = useState(searchParams.get('roomType') || 'All');
  const [wifi, setWifi] = useState(searchParams.get('wifi') === 'true');
  const [meals, setMeals] = useState(searchParams.get('meals') === 'true');
  const [generator, setGenerator] = useState(searchParams.get('generator') === 'true');
  const [attachedBathroom, setAttachedBathroom] = useState(
    searchParams.get('attachedBathroom') === 'true'
  );
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'featured');

  const [hostels, setHostels] = useState<HostelDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHostels = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string> = {};
      if (location !== 'All') params.location = location;
      if (minRent) params.minRent = minRent;
      if (maxRent) params.maxRent = maxRent;
      if (gender !== 'All') params.gender = gender;
      if (roomType !== 'All') params.roomType = roomType;
      if (wifi) params.wifi = 'true';
      if (meals) params.meals = 'true';
      if (generator) params.generator = 'true';
      if (attachedBathroom) params.attachedBathroom = 'true';
      if (query.trim()) params.q = query.trim();
      if (sort !== 'featured') params.sort = sort;

      setSearchParams(params, { replace: true });
      const res = await api.get('/hostels', { params });
      setHostels(res.data.hostels || []);
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to load hostels.'));
    } finally {
      setLoading(false);
    }
  }, [
    location,
    minRent,
    maxRent,
    gender,
    roomType,
    wifi,
    meals,
    generator,
    attachedBathroom,
    query,
    sort,
    setSearchParams,
  ]);

  useEffect(() => {
    fetchHostels();
  }, [fetchHostels]);

  const resetFilters = () => {
    setLocation('All');
    setMinRent('');
    setMaxRent('');
    setGender('All');
    setRoomType('All');
    setWifi(false);
    setMeals(false);
    setGenerator(false);
    setAttachedBathroom(false);
    setQuery('');
    setSort('featured');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#142B4A]">
            Find Student Hostels
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Compare verified residences across Dhaka and Chattogram with real monthly BDT rates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search hostel or university..."
              className="pl-9 pr-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm w-60 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]"
            />
          </div>

          <select
            aria-label="Sort hostels"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30"
          >
            <option value="featured">Recommended</option>
            <option value="rent_asc">Rent: Low to High</option>
            <option value="rent_desc">Rent: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="beds">Most Beds Available</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Filter Sidebar */}
        <aside className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-display text-sm font-bold text-[#142B4A] inline-flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#3B82F6]" />
              Filters
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
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Location
            </label>
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

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Min Rent (BDT)
              </label>
              <input
                type="number"
                min={0}
                step={500}
                placeholder="3000"
                value={minRent}
                onChange={(e) => setMinRent(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-300 rounded-lg text-sm font-mono tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Max Rent (BDT)
              </label>
              <input
                type="number"
                min={0}
                step={500}
                placeholder="12000"
                value={maxRent}
                onChange={(e) => setMaxRent(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-300 rounded-lg text-sm font-mono tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Gender Preference
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-300 rounded-lg text-sm"
            >
              <option value="All">All</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Co-ed">Co-ed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Room Type
            </label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-300 rounded-lg text-sm"
            >
              <option value="All">Any Room Type</option>
              <option value="Single">Single</option>
              <option value="Shared Twin">Shared Twin</option>
              <option value="3-Bed Room">3-Bed Room</option>
              <option value="4-Bed Dorm">4-Bed Dorm</option>
            </select>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <span className="block text-xs font-semibold text-slate-700">
              Required Facilities
            </span>
            <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={wifi}
                onChange={(e) => setWifi(e.target.checked)}
                className="rounded border-slate-300 text-[#142B4A]"
              />
              High-Speed Wi-Fi
            </label>
            <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={meals}
                onChange={(e) => setMeals(e.target.checked)}
                className="rounded border-slate-300 text-[#142B4A]"
              />
              Meal Plan Included
            </label>
            <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={generator}
                onChange={(e) => setGenerator(e.target.checked)}
                className="rounded border-slate-300 text-[#142B4A]"
              />
              Backup Generator / IPS
            </label>
            <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={attachedBathroom}
                onChange={(e) => setAttachedBathroom(e.target.checked)}
                className="rounded border-slate-300 text-[#142B4A]"
              />
              Attached Bathroom
            </label>
          </div>
        </aside>

        {/* Results Grid */}
        <div className="lg:col-span-9 space-y-5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="tabular-nums">
              Showing <strong className="text-[#142B4A]">{hostels.length}</strong> hostels
            </span>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-96 rounded-xl bg-white border border-slate-200 animate-pulse" />
              ))}
            </div>
          ) : hostels.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-3">
              <h3 className="font-display text-lg font-bold text-[#142B4A]">
                No hostels match your selected filters
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Try increasing your maximum BDT budget or clearing one of the facility filters.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#142B4A] hover:bg-[#1E3D66] rounded-lg cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {hostels.map((h) => (
                <HostelCard key={h.id} hostel={h} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
