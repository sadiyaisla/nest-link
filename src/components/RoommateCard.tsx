import { ChevronDown, ChevronUp, Heart, MapPin, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import type { RoommateWithScore } from '../../shared/types';
import { useAuth } from '../context/AuthContext';
import { SafeImage } from './SafeImage';

interface RoommateCardProps {
  profile: RoommateWithScore;
  onMessage?: (profile: RoommateWithScore) => void;
}

export function RoommateCard({ profile, onMessage }: RoommateCardProps) {
  const { favoriteRoommateIds, toggleFavorite } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const isSaved = favoriteRoommateIds.includes(profile.id);

  const { score, label, breakdown, reasons } = profile.compatibility;

  const scoreTone =
    score >= 90
      ? 'text-emerald-700'
      : score >= 75
        ? 'text-[#3B82F6]'
        : score >= 60
          ? 'text-amber-700'
          : 'text-slate-600';

  return (
    <article className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4">
      <div className="space-y-4">
        {/* Top Row: Avatar, Identity, Score */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
              <SafeImage
                src={profile.avatar}
                alt={profile.name}
                fallbackVariant="avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h3 className="font-display text-base font-bold text-[#142B4A] truncate">
                {profile.name}
              </h3>
              <p className="text-xs font-medium text-slate-600 truncate">
                {profile.university}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {profile.department} · {profile.semester}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className={`font-mono tabular-nums text-xl font-bold ${scoreTone}`}>
              {score}%
            </div>
            <div className={`text-xs font-semibold ${scoreTone}`}>{label}</div>
          </div>
        </div>

        {/* Budget & Location line */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 py-2 border-y border-slate-100">
          <span className="inline-flex items-center gap-1 font-medium text-[#142B4A]">
            <MapPin className="w-3.5 h-3.5 text-[#3B82F6]" />
            {profile.preferredLocation}
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums font-semibold text-[#142B4A]">
            BDT {profile.budget.toLocaleString()}/mo
          </span>
          <span aria-hidden="true">·</span>
          <span>{profile.gender}</span>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">{profile.bio}</p>

        {/* Lifestyle traits clean grid */}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <div>
            <dt className="text-slate-400">Sleep</dt>
            <dd className="font-medium text-slate-800">{profile.sleepSchedule}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Cleanliness</dt>
            <dd className="font-medium text-slate-800">{profile.cleanliness}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Study Style</dt>
            <dd className="font-medium text-slate-800">{profile.studyHabits}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Smoking / Meals</dt>
            <dd className="font-medium text-slate-800 truncate">
              {profile.smokingPreference} · {profile.foodPreference.split(' ')[0]}
            </dd>
          </div>
        </dl>

        {/* Top compatibility reasons */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3B82F6] hover:text-[#142B4A] cursor-pointer"
          >
            {expanded ? 'Hide match breakdown' : 'Why you match'}
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {!expanded ? (
            <p className="mt-1.5 text-xs text-slate-600 line-clamp-2">
              {reasons.slice(0, 2).join(' · ')}
            </p>
          ) : (
            <div className="mt-3 space-y-2 pt-3 border-t border-slate-100">
              {breakdown.map((item) => (
                <div key={item.factor} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{item.factor}</span>
                    <span className="font-mono tabular-nums text-slate-600">
                      {item.earned}/{item.weight}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.status === 'aligned'
                          ? 'bg-emerald-500'
                          : item.status === 'partial'
                            ? 'bg-[#3B82F6]'
                            : 'bg-slate-300'
                      }`}
                      style={{ width: `${Math.round((item.earned / item.weight) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">{item.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
        <button
          type="button"
          onClick={() => toggleFavorite('roommate', profile.id)}
          className={`px-3 py-2 rounded-lg text-xs font-semibold border inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            isSaved
              ? 'bg-[#142B4A] border-[#142B4A] text-white'
              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
          {isSaved ? 'Saved' : 'Save'}
        </button>

        {onMessage && (
          <button
            type="button"
            onClick={() => onMessage(profile)}
            className="flex-1 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#142B4A] hover:bg-[#1E3D66] inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Connect
          </button>
        )}
      </div>
    </article>
  );
}
