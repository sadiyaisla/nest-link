import { Link } from 'react-router-dom';
import { BD_LOCATIONS } from '../../shared/types';

export function Footer() {
  return (
    <footer className="bg-[#142B4A] text-slate-300 border-t border-[#1E3D66]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3">
            <Link to="/" className="font-display text-xl font-bold text-white tracking-tight">
              NestLink
            </Link>
            <p className="text-sm text-slate-300 max-w-md leading-relaxed">
              Verified student hostels and lifestyle-matched roommate discovery for university students across Dhaka and Chattogram.
            </p>
            <p className="text-xs text-slate-400">
              Support: hello@nestlink.bd · Dhanmondi Road 9/A, Dhaka 1209
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/hostels" className="hover:text-white transition-colors">
                  Find Hostels
                </Link>
              </li>
              <li>
                <Link to="/roommates" className="hover:text-white transition-colors">
                  Find Roommates
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  How Matching Works
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-white transition-colors">
                  List Your Hostel
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Popular Student Zones</h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {BD_LOCATIONS.map((loc) => (
                <li key={loc}>
                  <Link
                    to={`/hostels?location=${encodeURIComponent(loc)}`}
                    className="hover:text-white transition-colors"
                  >
                    {loc}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} NestLink Bangladesh. Built for university student housing.</p>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-white transition-colors">
              Verification Standards
            </Link>
            <Link to="/login" className="hover:text-white transition-colors">
              Account Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
