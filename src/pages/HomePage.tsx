import { ArrowRight, CheckCircle2, MapPin, Search, ShieldCheck, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BD_LOCATIONS, type HostelDTO, type RoommateWithScore } from '../../shared/types';
import { api } from '../api/client';
import { HostelCard } from '../components/HostelCard';
import { MessageModal } from '../components/MessageModal';
import { RoommateCard } from '../components/RoommateCard';
import { SafeImage } from '../components/SafeImage';

const HERO_IMG = '/src/assets/images/hero_student_hostel_1795240129892.jpg';

const POPULAR_AREAS = [
  { name: 'Dhanmondi', note: 'Near DU, BUET & DIU', avgRent: 'BDT 6,500' },
  { name: 'Bashundhara', note: 'Near NSU, IUB & AIUB', avgRent: 'BDT 8,500' },
  { name: 'Uttara', note: 'MRT-connected sectors', avgRent: 'BDT 7,200' },
  { name: 'Mirpur', note: 'Budget metro residences', avgRent: 'BDT 4,800' },
  { name: 'Mohammadpur', note: 'Iqbal Rd & Asad Gate', avgRent: 'BDT 6,200' },
  { name: 'Farmgate', note: 'Central transit hub', avgRent: 'BDT 5,600' },
  { name: 'Mohakhali', note: 'Near BRACU & AUST', avgRent: 'BDT 9,000' },
  { name: 'Chattogram', note: 'Nasirabad & GEC Circle', avgRent: 'BDT 4,500' },
];

export function HomePage() {
  const navigate = useNavigate();
  const [location, setLocation] = useState('All');
  const [maxBudget, setMaxBudget] = useState('9000');
  const [gender, setGender] = useState('All');

  const [hostels, setHostels] = useState<HostelDTO[]>([]);
  const [roommates, setRoommates] = useState<RoommateWithScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageTarget, setMessageTarget] = useState<RoommateWithScore | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([api.get('/hostels'), api.get('/roommates')])
      .then(([hRes, rRes]) => {
        if (!active) return;
        setHostels((hRes.data.hostels || []).slice(0, 3));
        setRoommates((rRes.data.roommates || []).slice(0, 3));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location !== 'All') params.set('location', location);
    if (maxBudget) params.set('maxRent', maxBudget);
    if (gender !== 'All') params.set('gender', gender);
    navigate(`/hostels?${params.toString()}`);
  };

  return (
    <div className="bg-[#F8FAFC]">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
              <div className="space-y-4">
                <p className="text-xs font-semibold tracking-wide text-[#3B82F6]">
                  Student Housing &amp; Roommate Platform · Bangladesh
                </p>
                <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-[#142B4A] tracking-tight leading-[1.12] [text-wrap:balance]">
                  Find Your Perfect Student Home
                </h1>
                <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                  Discover affordable hostels and connect with roommates who match your lifestyle.
                </p>
              </div>

              {/* Hero Search Box */}
              <form
                onSubmit={handleHeroSearch}
                className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="hero-location" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Location
                    </label>
                    <select
                      id="hero-location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]"
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
                    <label htmlFor="hero-budget" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Max Budget (BDT)
                    </label>
                    <select
                      id="hero-budget"
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]"
                    >
                      <option value="">Any Budget</option>
                      <option value="5000">Up to 5,000</option>
                      <option value="7000">Up to 7,000</option>
                      <option value="9000">Up to 9,000</option>
                      <option value="12000">Up to 12,000</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="hero-gender" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Gender Preference
                    </label>
                    <select
                      id="hero-gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]"
                    >
                      <option value="All">All Hostels</option>
                      <option value="Male">Male Only</option>
                      <option value="Female">Female Only</option>
                      <option value="Co-ed">Co-ed Wings</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#142B4A] hover:bg-[#1E3D66] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Search className="w-4 h-4" />
                    Search Hostels
                  </button>
                  <Link
                    to="/roommates"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#3B82F6] hover:text-[#142B4A] whitespace-nowrap"
                  >
                    Or calculate roommate compatibility
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </form>
            </div>

            <div className="lg:col-span-5">
              <div className="h-full min-h-[280px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <SafeImage
                  src={HERO_IMG}
                  alt="Modern sunlit university student hostel study lounge"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* 4-column Key Value Strip */}
          <div className="mt-10 pt-8 border-t border-slate-100 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="font-mono tabular-nums text-2xl font-bold text-[#142B4A]">8 Zones</div>
              <p className="text-xs text-slate-600 mt-1">Dhaka &amp; Chattogram university corridors</p>
            </div>
            <div>
              <div className="font-mono tabular-nums text-2xl font-bold text-[#142B4A]">BDT 4,500+</div>
              <p className="text-xs text-slate-600 mt-1">Transparent monthly student rents</p>
            </div>
            <div>
              <div className="font-mono tabular-nums text-2xl font-bold text-[#142B4A]">7-Factor</div>
              <p className="text-xs text-slate-600 mt-1">Weighted lifestyle roommate matching</p>
            </div>
            <div>
              <div className="font-mono tabular-nums text-2xl font-bold text-[#142B4A]">Direct</div>
              <p className="text-xs text-slate-600 mt-1">Booking requests &amp; verified owners</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Hostels */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#142B4A]">
              Featured Student Hostels
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Verified residences with clear facilities, meal plans, and real bed availability.
            </p>
          </div>
          <Link
            to="/hostels"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#3B82F6] hover:text-[#142B4A] whitespace-nowrap"
          >
            Browse all hostels
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 rounded-xl bg-white border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {hostels.map((h) => (
              <HostelCard key={h.id} hostel={h} />
            ))}
          </div>
        )}
      </section>

      {/* Popular Student Locations */}
      <section className="bg-white border-y border-slate-200 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#142B4A]">
              Popular Student Locations
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Jump directly to hostels near major campuses and metro stations.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {POPULAR_AREAS.map((area) => (
              <Link
                key={area.name}
                to={`/hostels?location=${encodeURIComponent(area.name)}`}
                className="group p-4 rounded-xl border border-slate-200 bg-[#F8FAFC] hover:bg-white hover:border-[#3B82F6] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-[#142B4A] group-hover:text-[#3B82F6] transition-colors">
                    {area.name}
                  </span>
                  <MapPin className="w-4 h-4 text-slate-400 group-hover:text-[#3B82F6]" />
                </div>
                <p className="text-xs text-slate-500 mt-1">{area.note}</p>
                <p className="font-mono tabular-nums text-xs font-semibold text-slate-700 mt-3">
                  From {area.avgRent}/mo
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works & Why Choose NestLink */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-6 space-y-6">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#142B4A]">
                How NestLink Works
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                From campus search to confirmed bed reservation in three clear steps.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-5 bg-white border border-slate-200 rounded-xl">
                <h3 className="font-display text-base font-bold text-[#142B4A]">
                  01. Filter Hostels by Campus &amp; Budget
                </h3>
                <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                  Compare BDT monthly rents, Wi-Fi, meal availability, backup generators, and attached bathrooms across Dhaka and Chattogram.
                </p>
              </div>
              <div className="p-5 bg-white border border-slate-200 rounded-xl">
                <h3 className="font-display text-base font-bold text-[#142B4A]">
                  02. Match with Compatible Roommates
                </h3>
                <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                  Our 7-factor algorithm scores sleep routines, cleanliness, study habits, smoking, food, budget, and location out of 100%.
                </p>
              </div>
              <div className="p-5 bg-white border border-slate-200 rounded-xl">
                <h3 className="font-display text-base font-bold text-[#142B4A]">
                  03. Message Owners &amp; Request Booking
                </h3>
                <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                  Send accommodation requests directly to verified owners and track Pending, Accepted, or Rejected status in your dashboard.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-[#142B4A] text-white rounded-xl p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <h2 className="font-display text-2xl sm:text-3xl font-bold">
                Why Choose NestLink
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Built around the real challenges Bangladeshi university students face when moving to a new campus city.
              </p>
            </div>

            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold text-white">Verified Owners &amp; Transparent Rules</strong>
                  <p className="text-slate-300 text-xs mt-0.5">
                    Gate timings, meal plans, and security measures are clearly listed before you visit.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Users className="w-5 h-5 text-[#3B82F6] shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold text-white">Real Compatibility Breakdown</strong>
                  <p className="text-slate-300 text-xs mt-0.5">
                    No random scores—see factor-by-factor alignment before sharing a twin room.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold text-white">Persistent Favorites &amp; Instant Tracking</strong>
                  <p className="text-slate-300 text-xs mt-0.5">
                    Save shortlisted hostels and roommate profiles to your student account across sessions.
                  </p>
                </div>
              </li>
            </ul>

            <div className="pt-2">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3B82F6] hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Create Student Account
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Roommate Profiles */}
      <section className="bg-white border-t border-slate-200 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#142B4A]">
                Featured Roommate Profiles
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Live compatibility scores computed from lifestyle preferences and monthly rent targets.
              </p>
            </div>
            <Link
              to="/roommates"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#3B82F6] hover:text-[#142B4A] whitespace-nowrap"
            >
              Find your match
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roommates.map((rm) => (
              <RoommateCard
                key={rm.id}
                profile={rm}
                onMessage={(target) => setMessageTarget(target)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Student Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="mb-8">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#142B4A]">
            Trusted by University Students
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Real stories from students who found safe residences and compatible roommates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <blockquote className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <p className="text-sm text-slate-700 leading-relaxed">
              &ldquo;Moving from Sylhet to Dhaka for my first semester at NSU felt overwhelming until I filtered Bashundhara female hostels by generator backup and booked within two days.&rdquo;
            </p>
            <footer className="text-xs">
              <div className="font-semibold text-[#142B4A]">Nusrat Jahan Mim</div>
              <div className="text-slate-500">BBA (Finance), North South University</div>
            </footer>
          </blockquote>

          <blockquote className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <p className="text-sm text-slate-700 leading-relaxed">
              &ldquo;The compatibility breakdown helped me pair with a fellow quiet-study engineering student in Dhanmondi. Knowing sleep and cleanliness habits upfront saved us so much friction.&rdquo;
            </p>
            <footer className="text-xs">
              <div className="font-semibold text-[#142B4A]">Tanvir Ahmed</div>
              <div className="text-slate-500">EEE 4th Year, BUET</div>
            </footer>
          </blockquote>

          <blockquote className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <p className="text-sm text-slate-700 leading-relaxed">
              &ldquo;As a hostel manager in Dhanmondi, receiving structured student requests with university details and move-in dates keeps our room allocation organized.&rdquo;
            </p>
            <footer className="text-xs">
              <div className="font-semibold text-[#142B4A]">Karim Uddin</div>
              <div className="text-slate-500">Verified Owner, Satmasjid Scholars Residence</div>
            </footer>
          </blockquote>
        </div>
      </section>

      {messageTarget && (
        <MessageModal
          open={Boolean(messageTarget)}
          onClose={() => setMessageTarget(null)}
          recipientId={messageTarget.userId}
          recipientName={messageTarget.name}
          defaultSubject={`Roommate connection via NestLink (${messageTarget.compatibility.score}% match)`}
        />
      )}
    </div>
  );
}
