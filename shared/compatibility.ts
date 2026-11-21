import type {
  CleanlinessLevel,
  CompatibilityFactorResult,
  CompatibilityLabel,
  CompatibilityResult,
  FoodPreference,
  SleepSchedule,
  SmokingPreference,
  StudyHabits,
} from './types.ts';

export interface CompatibilityInput {
  budget: number;
  preferredLocation: string;
  sleepSchedule: SleepSchedule;
  cleanliness: CleanlinessLevel;
  studyHabits: StudyHabits;
  smokingPreference: SmokingPreference;
  foodPreference: FoodPreference;
}

// Dhaka neighborhood clusters so nearby areas earn partial compatibility points
const LOCATION_CLUSTERS: Record<string, string> = {
  dhanmondi: 'central_west',
  mohammadpur: 'central_west',
  farmgate: 'central_west',
  bashundhara: 'north_east',
  mohakhali: 'north_east',
  uttara: 'north_corridor',
  mirpur: 'north_west',
  chattogram: 'chattogram',
};

function getCompatibilityLabel(score: number): CompatibilityLabel {
  if (score >= 90) return 'Excellent Match';
  if (score >= 75) return 'Great Match';
  if (score >= 60) return 'Potential Match';
  return 'Low Compatibility';
}

/**
 * Deterministic 7-factor Roommate Compatibility Algorithm (Total = 100%)
 * - Budget compatibility: 20%
 * - Sleep schedule:       20%
 * - Cleanliness:          15%
 * - Study habits:         15%
 * - Smoking preference:   10%
 * - Food preference:      10%
 * - Location:             10%
 */
export function calculateCompatibility(
  seeker: CompatibilityInput,
  candidate: CompatibilityInput
): CompatibilityResult {
  const breakdown: CompatibilityFactorResult[] = [];

  // 1. Budget compatibility (20%)
  const budgetDiff = Math.abs((seeker.budget || 0) - (candidate.budget || 0));
  let budgetPoints = 0;
  let budgetStatus: CompatibilityFactorResult['status'] = 'mismatch';
  let budgetReason = `Monthly budget differs by BDT ${budgetDiff.toLocaleString()}`;

  if (budgetDiff <= 1000) {
    budgetPoints = 20;
    budgetStatus = 'aligned';
    budgetReason = `Budgets align closely (within BDT 1,000/mo)`;
  } else if (budgetDiff <= 2500) {
    budgetPoints = 15;
    budgetStatus = 'aligned';
    budgetReason = `Similar rent range (within BDT 2,500/mo)`;
  } else if (budgetDiff <= 4500) {
    budgetPoints = 9;
    budgetStatus = 'partial';
    budgetReason = `Moderate budget gap (BDT ${budgetDiff.toLocaleString()}/mo difference)`;
  } else if (budgetDiff <= 7000) {
    budgetPoints = 4;
    budgetStatus = 'partial';
  }
  breakdown.push({
    factor: 'Budget',
    weight: 20,
    earned: budgetPoints,
    status: budgetStatus,
    reason: budgetReason,
  });

  // 2. Sleep schedule (20%)
  let sleepPoints = 2;
  let sleepStatus: CompatibilityFactorResult['status'] = 'mismatch';
  let sleepReason = `Different sleep rhythms (${seeker.sleepSchedule} vs ${candidate.sleepSchedule})`;
  if (seeker.sleepSchedule === candidate.sleepSchedule) {
    sleepPoints = 20;
    sleepStatus = 'aligned';
    sleepReason = `Both follow a ${candidate.sleepSchedule.toLowerCase()} sleep routine`;
  } else if (
    seeker.sleepSchedule === 'Balanced' ||
    candidate.sleepSchedule === 'Balanced'
  ) {
    sleepPoints = 12;
    sleepStatus = 'partial';
    sleepReason = `Flexible sleep overlap (${candidate.sleepSchedule} schedule)`;
  }
  breakdown.push({
    factor: 'Sleep Schedule',
    weight: 20,
    earned: sleepPoints,
    status: sleepStatus,
    reason: sleepReason,
  });

  // 3. Cleanliness (15%)
  let cleanPoints = 2;
  let cleanStatus: CompatibilityFactorResult['status'] = 'mismatch';
  let cleanReason = `Different tidiness standards (${candidate.cleanliness})`;
  if (seeker.cleanliness === candidate.cleanliness) {
    cleanPoints = 15;
    cleanStatus = 'aligned';
    cleanReason = `Shared ${candidate.cleanliness.toLowerCase()} room tidiness standard`;
  } else if (
    seeker.cleanliness === 'Moderate' ||
    candidate.cleanliness === 'Moderate'
  ) {
    cleanPoints = 9;
    cleanStatus = 'partial';
    cleanReason = `Compatible tidiness expectations (${candidate.cleanliness})`;
  }
  breakdown.push({
    factor: 'Cleanliness',
    weight: 15,
    earned: cleanPoints,
    status: cleanStatus,
    reason: cleanReason,
  });

  // 4. Study habits (15%)
  let studyPoints = 3;
  let studyStatus: CompatibilityFactorResult['status'] = 'mismatch';
  let studyReason = `Different study styles (${seeker.studyHabits} vs ${candidate.studyHabits})`;
  if (seeker.studyHabits === candidate.studyHabits) {
    studyPoints = 15;
    studyStatus = 'aligned';
    studyReason = `Both prefer ${candidate.studyHabits.toLowerCase()} study environments`;
  } else if (
    seeker.studyHabits === 'Flexible' ||
    candidate.studyHabits === 'Flexible'
  ) {
    studyPoints = 10;
    cleanStatus; // keep typescript happy
    studyStatus = 'partial';
    studyReason = `Adaptable study habits (${candidate.studyHabits})`;
  }
  breakdown.push({
    factor: 'Study Habits',
    weight: 15,
    earned: studyPoints,
    status: studyStatus,
    reason: studyReason,
  });

  // 5. Smoking preference (10%)
  let smokePoints = 0;
  let smokeStatus: CompatibilityFactorResult['status'] = 'mismatch';
  let smokeReason = `Smoking preferences conflict (${candidate.smokingPreference})`;
  if (seeker.smokingPreference === candidate.smokingPreference) {
    smokePoints = 10;
    smokeStatus = 'aligned';
    smokeReason = `Matching smoking policy (${candidate.smokingPreference})`;
  } else if (
    (seeker.smokingPreference === 'Non-Smoker' &&
      candidate.smokingPreference === 'Outside Only') ||
    (seeker.smokingPreference === 'Outside Only' &&
      candidate.smokingPreference !== 'Outside Only')
  ) {
    smokePoints = 4;
    smokeStatus = 'partial';
    smokeReason = `Manageable smoking boundary (${candidate.smokingPreference})`;
  }
  breakdown.push({
    factor: 'Smoking Preference',
    weight: 10,
    earned: smokePoints,
    status: smokeStatus,
    reason: smokeReason,
  });

  // 6. Food preference (10%)
  let foodPoints = 3;
  let foodStatus: CompatibilityFactorResult['status'] = 'mismatch';
  let foodReason = `Different meal styles (${candidate.foodPreference})`;
  if (seeker.foodPreference === candidate.foodPreference) {
    foodPoints = 10;
    foodStatus = 'aligned';
    foodReason = `Same meal preference (${candidate.foodPreference})`;
  } else if (
    seeker.foodPreference === 'Flexible' ||
    candidate.foodPreference === 'Flexible'
  ) {
    foodPoints = 7;
    foodStatus = 'partial';
    foodReason = `Flexible meal coordination (${candidate.foodPreference})`;
  }
  breakdown.push({
    factor: 'Food Preference',
    weight: 10,
    earned: foodPoints,
    status: foodStatus,
    reason: foodReason,
  });

  // 7. Location (10%)
  const seekerLoc = (seeker.preferredLocation || '').trim().toLowerCase();
  const candLoc = (candidate.preferredLocation || '').trim().toLowerCase();
  let locPoints = 1;
  let locStatus: CompatibilityFactorResult['status'] = 'mismatch';
  let locReason = `Looking in different areas (${candidate.preferredLocation})`;
  if (seekerLoc && candLoc && seekerLoc === candLoc) {
    locPoints = 10;
    locStatus = 'aligned';
    locReason = `Both targeting ${candidate.preferredLocation}`;
  } else if (
    seekerLoc &&
    candLoc &&
    LOCATION_CLUSTERS[seekerLoc] &&
    LOCATION_CLUSTERS[seekerLoc] === LOCATION_CLUSTERS[candLoc]
  ) {
    locPoints = 6;
    locStatus = 'partial';
    locReason = `Nearby campus zones (${seeker.preferredLocation} & ${candidate.preferredLocation})`;
  }
  breakdown.push({
    factor: 'Location',
    weight: 10,
    earned: locPoints,
    status: locStatus,
    reason: locReason,
  });

  const score = Math.min(
    100,
    Math.max(
      0,
      breakdown.reduce((sum, item) => sum + item.earned, 0)
    )
  );

  // Top reasons prioritize aligned factors, then partial
  const reasons = breakdown
    .filter((b) => b.status === 'aligned' || b.status === 'partial')
    .sort((a, b) => b.earned - a.earned)
    .slice(0, 4)
    .map((b) => b.reason);

  if (reasons.length === 0) {
    reasons.push('Different daily routines and budget targets');
  }

  return {
    score,
    label: getCompatibilityLabel(score),
    breakdown,
    reasons,
  };
}
