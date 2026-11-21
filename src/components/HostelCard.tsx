import { BedDouble, CheckCircle2, Heart, MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { HostelDTO } from '../../shared/types';
import { useAuth } from '../context/AuthContext';
import { SafeImage } from './SafeImage';

interface HostelCardProps {
  hostel: HostelDTO;
}

export function HostelCard({ hostel }: HostelCardProps) {
  const { favoriteHostelIds, toggleFavorite } = useAuth();
  const isSaved = favoriteHostelIds.includes(hostel.id);

  const facilitySummary = [
    hostel.facilities.wifi && 'Wi-Fi',
    hostel.facilities.meals && 'Meals',
    hostel.facilities.generator && 'Generator',
    hostel.facilities.attachedBathroom && 'Attached Bath',
  ].filter(Boolean) as string[];

  return (
    <article className="group bg-white border border-slate-200 rounded-xl overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 flex flex-col">
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        <Link to={`/hostels/${hostel.id}`} className="block w-full h-full">
          <SafeImage
            src={hostel.photos[0]}
            alt={hostel.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </Link>
        <button
          type="button"
          onClick={() => toggleFavorite('hostel', hostel.id)}
          aria-label={isSaved ? `Remove ${hostel.name} from favorites` : `Save ${hostel.name} to favorites`}
          className={`absolute top-3 right-3 w-9 h-9 rounded-lg flex items-center justify-center border transition-colors cursor-pointer ${
            isSaved
              ? 'bg-[#142B4A] border-[#142B4A] text-white'
              : 'bg-white/95 border-slate-200 text-slate-700 hover:text-[#142B4A]'
          }`}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-2.5">
          {/* Clean unboxed metadata kicker */}
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 font-medium text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-[#3B82F6]" />
              {hostel.location}
            </span>
            <span aria-hidden="true">·</span>
            <span>{hostel.genderPreference}</span>
            {hostel.verified && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified
                </span>
              </>
            )}
          </div>

          <Link to={`/hostels/${hostel.id}`} className="block">
            <h3 className="font-display text-lg font-bold text-[#142B4A] group-hover:text-[#3B82F6] transition-colors line-clamp-1">
              {hostel.name}
            </h3>
          </Link>

          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {hostel.description}
          </p>

          {/* Unboxed facility line */}
          {facilitySummary.length > 0 && (
            <p className="text-xs text-slate-500 truncate">
              {facilitySummary.join(' · ')}
            </p>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-end justify-between gap-3">
          <div>
            <div className="font-mono tabular-nums text-lg font-bold text-[#142B4A]">
              BDT {hostel.monthlyRent.toLocaleString()}
              <span className="font-sans text-xs font-normal text-slate-500">/mo</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600 mt-0.5 tabular-nums">
              <span className="inline-flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                {hostel.rating.toFixed(1)} ({hostel.reviewCount})
              </span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                <BedDouble className="w-3.5 h-3.5" />
                {hostel.availableBeds} beds left
              </span>
            </div>
          </div>

          <Link
            to={`/hostels/${hostel.id}`}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#142B4A] hover:bg-[#1E3D66] rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}
