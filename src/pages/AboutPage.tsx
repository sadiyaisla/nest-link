import { ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const WEIGHTS = [
  { factor: 'Budget Compatibility', weight: '20%', rule: 'Full points within BDT 1,000/mo; scaled tiers up to BDT 7,000/mo gap.' },
  { factor: 'Sleep Schedule', weight: '20%', rule: 'Early Bird, Balanced, or Night Owl exact match vs. flexible overlap.' },
  { factor: 'Cleanliness Standard', weight: '15%', rule: 'Very Tidy, Moderate, or Relaxed room upkeep alignment.' },
  { factor: 'Study Habits', weight: '15%', rule: 'Quiet Focus, Collaborative, or Flexible exam & assignment styles.' },
  { factor: 'Smoking Preference', weight: '10%', rule: 'Non-Smoker, Outside Only, or Smoker policy compatibility.' },
  { factor: 'Food Preference', weight: '10%', rule: 'Halal / Home-style, Vegetarian, or Flexible dining coordination.' },
  { factor: 'Preferred Location', weight: '10%', rule: 'Exact area match or adjacent Dhaka campus transit zone.' },
];

export function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <header className="space-y-4">
        <p className="text-xs font-semibold text-[#3B82F6]">About NestLink</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#142B4A] [text-wrap:balance]">
          Built for University Students Navigating Housing in Bangladesh
        </h1>
        <p className="text-base text-slate-600 leading-relaxed max-w-3xl">
          Finding a reliable hostel or trustworthy roommate near campuses in Dhaka and Chattogram often relies on scattered Facebook posts and word-of-mouth. NestLink brings transparent BDT pricing, verified hostel facilities, and weighted lifestyle matching into one organized platform.
        </p>
      </header>

      <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
        <div className="space-y-1">
          <h2 className="font-display text-xl font-bold text-[#142B4A]">
            How Our 7-Factor Roommate Matching Algorithm Works
          </h2>
          <p className="text-sm text-slate-600">
            Scores are computed deterministically out of 100% from real student preferences—never randomized.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-500">
                <th className="py-2.5 pr-4 font-semibold">Factor</th>
                <th className="py-2.5 px-4 font-semibold">Weight</th>
                <th className="py-2.5 pl-4 font-semibold">Scoring Logic</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {WEIGHTS.map((row) => (
                <tr key={row.factor}>
                  <td className="py-3 pr-4 font-semibold text-[#142B4A]">{row.factor}</td>
                  <td className="py-3 px-4 font-mono tabular-nums font-bold text-[#3B82F6]">
                    {row.weight}
                  </td>
                  <td className="py-3 pl-4 text-slate-600">{row.rule}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-100 text-xs">
          <div>
            <div className="font-mono font-bold text-emerald-700">90–100%</div>
            <div className="text-slate-700 font-medium">Excellent Match</div>
          </div>
          <div>
            <div className="font-mono font-bold text-[#3B82F6]">75–89%</div>
            <div className="text-slate-700 font-medium">Great Match</div>
          </div>
          <div>
            <div className="font-mono font-bold text-amber-700">60–74%</div>
            <div className="text-slate-700 font-medium">Potential Match</div>
          </div>
          <div>
            <div className="font-mono font-bold text-slate-600">Below 60%</div>
            <div className="text-slate-700 font-medium">Low Compatibility</div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
          <h3 className="font-display text-lg font-bold text-[#142B4A]">
            Hostel Verification &amp; Moderation
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Hostel owners are reviewed by platform administrators before receiving Verified Owner status. Every listing specifies exact room types, meal plans, gate hours, and security coverage.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
          <CheckCircle2 className="w-6 h-6 text-[#3B82F6]" />
          <h3 className="font-display text-lg font-bold text-[#142B4A]">
            Structured Accommodation Requests
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Students submit booking requests with expected move-in dates and preferred room types, while owners accept or reject requests with transparent status updates.
          </p>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/hostels"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#142B4A] hover:bg-[#1E3D66] text-white text-sm font-semibold rounded-lg"
        >
          Explore Hostels
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/roommates"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-[#142B4A] text-sm font-semibold rounded-lg"
        >
          Try Roommate Matching
        </Link>
      </div>
    </div>
  );
}
