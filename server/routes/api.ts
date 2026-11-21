import bcrypt from 'bcryptjs';
import { Router, type Response } from 'express';
import { calculateCompatibility, type CompatibilityInput } from '../../shared/compatibility.ts';
import type {
  BookingStatus,
  CleanlinessLevel,
  FoodPreference,
  GenderOption,
  HostelGenderOption,
  RoomTypeOption,
  SleepSchedule,
  SmokingPreference,
  StudyHabits,
} from '../../shared/types.ts';
import { db, getDefaultAvatar, PRESET_HOSTEL_PHOTOS, sanitizeUser } from '../db.ts';
import {
  clearAuthCookie,
  optionalAuth,
  requireAuth,
  requireRole,
  setAuthCookie,
  signToken,
  type AuthenticatedRequest,
} from '../middleware/auth.ts';

const router = Router();

// Input validation helpers
function asNonEmptyString(val: unknown, maxLen = 500): string | null {
  if (typeof val !== 'string') return null;
  const trimmed = val.trim();
  if (!trimmed || trimmed.length > maxLen) return null;
  return trimmed;
}

function asString(val: unknown, fallback = '', maxLen = 1000): string {
  if (typeof val !== 'string') return fallback;
  return val.trim().slice(0, maxLen);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isSafeImageUrl(url: string): boolean {
  if (url.startsWith('/src/assets/')) return true;
  if (url.startsWith('data:image/jpeg;base64,') || url.startsWith('data:image/png;base64,') || url.startsWith('data:image/webp;base64,')) {
    return url.length < 1_500_000;
  }
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function respondWithSession(res: Response, user: ReturnType<typeof sanitizeUser>) {
  const token = signToken({ userId: user.id, role: user.role, email: user.email });
  setAuthCookie(res, token);
  res.json({ token, user });
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------
router.get('/health', (_req, res) => {
  res.json({
    ok: true,
    database: db.isMongoActive() ? 'mongodb' : 'local-persistent',
  });
});

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------
router.post('/auth/register', async (req, res) => {
  try {
    const name = asNonEmptyString(req.body?.name, 100);
    const email = asNonEmptyString(req.body?.email, 160)?.toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const roleRaw = req.body?.role === 'owner' ? 'owner' : 'student';
    const phone = asString(req.body?.phone, '', 30);
    const university = asString(req.body?.university, '', 140);
    const department = asString(req.body?.department, '', 140);
    const semester = asString(req.body?.semester, '3rd Year', 60);
    const gender: GenderOption = ['Male', 'Female', 'Other'].includes(req.body?.gender)
      ? req.body.gender
      : 'Male';
    const budget = Math.max(1500, Math.min(50000, Number(req.body?.budget) || 6500));
    const preferredLocation = asString(req.body?.preferredLocation, 'Dhanmondi', 80);

    if (!name || !email || !isValidEmail(email)) {
      res.status(400).json({ error: 'Please provide a valid full name and email address.' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }
    if (!phone || phone.length < 8) {
      res.status(400).json({ error: 'Please provide a valid Bangladeshi phone number.' });
      return;
    }
    if (roleRaw === 'student' && (!university || !department)) {
      res.status(400).json({ error: 'Students must specify their university and department.' });
      return;
    }

    const existing = await db.users.findByEmail(email);
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const created = await db.users.create({
      name,
      email,
      passwordHash,
      role: roleRaw,
      phone,
      university,
      department,
      semester,
      gender,
      budget,
      preferredLocation,
      verifiedOwner: false,
      avatar: getDefaultAvatar(gender),
      bio:
        roleRaw === 'student'
          ? `${department} student at ${university} looking for accommodation near ${preferredLocation}.`
          : `Student housing host managing listings in ${preferredLocation}.`,
      preferences: {
        sleepSchedule: 'Balanced',
        cleanliness: 'Moderate',
        studyHabits: 'Quiet Focus',
        smokingPreference: 'Non-Smoker',
        foodPreference: 'Halal / Home-style',
      },
    });

    if (created.role === 'student') {
      await db.roommates.upsertForUser(created);
    }

    respondWithSession(res, created);
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const email = asNonEmptyString(req.body?.email, 160)?.toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = await db.users.findByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }
    if (user.role === 'admin') {
      res.status(403).json({ error: 'Please use the Administrator sign-in tab.' });
      return;
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    respondWithSession(res, sanitizeUser(user));
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Sign-in failed. Please try again.' });
  }
});

// One-click Demo Sign-In strictly restricted to non-admin Student or Owner demo accounts
router.post('/auth/demo', async (req, res) => {
  try {
    const role = req.body?.role === 'owner' ? 'owner' : 'student';
    const demoUser = await db.users.findDemoByRole(role);
    if (!demoUser) {
      res.status(404).json({ error: 'Demo account unavailable.' });
      return;
    }
    respondWithSession(res, sanitizeUser(demoUser));
  } catch (err) {
    console.error('Demo auth error:', err);
    res.status(500).json({ error: 'Could not start demo session.' });
  }
});

// Admin status & first-run claim / login
router.get('/auth/admin/status', async (_req, res) => {
  const envPasscodeActive = Boolean(process.env.ADMIN_PASSCODE?.trim());
  const existingAdmin = await db.users.findAdmin();
  res.json({
    configured: envPasscodeActive || Boolean(existingAdmin),
    envPasscodeActive,
  });
});

router.post('/auth/admin/claim', async (req, res) => {
  try {
    if (process.env.ADMIN_PASSCODE?.trim()) {
      res.status(403).json({ error: 'Admin passcode is managed via environment configuration.' });
      return;
    }
    const existingAdmin = await db.users.findAdmin();
    if (existingAdmin) {
      res.status(409).json({ error: 'Administrator account has already been claimed. Please sign in.' });
      return;
    }

    const name = asNonEmptyString(req.body?.name, 100) || 'Platform Administrator';
    const email = asNonEmptyString(req.body?.email, 160)?.toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!email || !isValidEmail(email)) {
      res.status(400).json({ error: 'Please provide a valid admin email address.' });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: 'Admin password must be at least 8 characters long.' });
      return;
    }

    const dup = await db.users.findByEmail(email);
    if (dup) {
      res.status(409).json({ error: 'That email is already registered.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const admin = await db.users.create({
      name,
      email,
      passwordHash,
      role: 'admin',
      phone: '01700000000',
      university: 'NestLink Administration',
      department: 'Platform Moderation',
      semester: '',
      gender: 'Other',
      budget: 0,
      preferredLocation: 'Dhaka',
      verifiedOwner: true,
      avatar: getDefaultAvatar('Male'),
      bio: 'NestLink platform administrator.',
      preferences: {
        sleepSchedule: 'Balanced',
        cleanliness: 'Very Tidy',
        studyHabits: 'Quiet Focus',
        smokingPreference: 'Non-Smoker',
        foodPreference: 'Flexible',
      },
    });

    respondWithSession(res, admin);
  } catch (err) {
    console.error('Admin claim error:', err);
    res.status(500).json({ error: 'Admin setup failed.' });
  }
});

router.post('/auth/admin/login', async (req, res) => {
  try {
    const passcode = typeof req.body?.password === 'string' ? req.body.password : '';
    const email = asString(req.body?.email, '', 160).toLowerCase();
    const envPasscode = process.env.ADMIN_PASSCODE?.trim();

    if (envPasscode) {
      if (passcode !== envPasscode) {
        res.status(401).json({ error: 'Invalid administrator passcode.' });
        return;
      }
      let admin = await db.users.findAdmin();
      if (!admin) {
        const hash = await bcrypt.hash(envPasscode, 10);
        const created = await db.users.create({
          name: 'NestLink Admin',
          email: email && isValidEmail(email) ? email : 'admin@nestlink.bd',
          passwordHash: hash,
          role: 'admin',
          phone: '01700000000',
          university: 'NestLink Administration',
          department: 'Moderation',
          semester: '',
          gender: 'Other',
          budget: 0,
          preferredLocation: 'Dhaka',
          verifiedOwner: true,
          avatar: getDefaultAvatar('Male'),
          bio: 'NestLink platform administrator.',
          preferences: {
            sleepSchedule: 'Balanced',
            cleanliness: 'Very Tidy',
            studyHabits: 'Quiet Focus',
            smokingPreference: 'Non-Smoker',
            foodPreference: 'Flexible',
          },
        });
        respondWithSession(res, created);
        return;
      }
      respondWithSession(res, sanitizeUser(admin));
      return;
    }

    const admin = await db.users.findAdmin();
    if (!admin) {
      res.status(404).json({ error: 'No administrator configured yet. Complete first-run setup.' });
      return;
    }
    if (email && admin.email.toLowerCase() !== email) {
      res.status(401).json({ error: 'Invalid administrator credentials.' });
      return;
    }
    const ok = await bcrypt.compare(passcode, admin.passwordHash);
    if (!ok) {
      res.status(401).json({ error: 'Invalid administrator credentials.' });
      return;
    }
    respondWithSession(res, sanitizeUser(admin));
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Administrator sign-in failed.' });
  }
});

router.post('/auth/logout', (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

router.get('/auth/me', requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = await db.users.findById(req.auth!.userId);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }
  res.json({ user: sanitizeUser(user) });
});

router.put('/users/me', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const existing = await db.users.findById(req.auth!.userId);
    if (!existing) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const patch: any = {};
    if (typeof req.body?.name === 'string' && req.body.name.trim()) {
      patch.name = req.body.name.trim().slice(0, 100);
    }
    if (typeof req.body?.phone === 'string') {
      patch.phone = req.body.phone.trim().slice(0, 30);
    }
    if (typeof req.body?.university === 'string') {
      patch.university = req.body.university.trim().slice(0, 140);
    }
    if (typeof req.body?.department === 'string') {
      patch.department = req.body.department.trim().slice(0, 140);
    }
    if (typeof req.body?.semester === 'string') {
      patch.semester = req.body.semester.trim().slice(0, 60);
    }
    if (['Male', 'Female', 'Other'].includes(req.body?.gender)) {
      patch.gender = req.body.gender;
    }
    if (req.body?.budget !== undefined) {
      patch.budget = Math.max(1500, Math.min(50000, Number(req.body.budget) || existing.budget));
    }
    if (typeof req.body?.preferredLocation === 'string' && req.body.preferredLocation.trim()) {
      patch.preferredLocation = req.body.preferredLocation.trim().slice(0, 80);
    }
    if (typeof req.body?.bio === 'string') {
      patch.bio = req.body.bio.trim().slice(0, 600);
    }

    const p = req.body?.preferences;
    if (p && typeof p === 'object') {
      patch.preferences = {
        sleepSchedule: ['Early Bird', 'Balanced', 'Night Owl'].includes(p.sleepSchedule)
          ? p.sleepSchedule
          : existing.preferences.sleepSchedule,
        cleanliness: ['Very Tidy', 'Moderate', 'Relaxed'].includes(p.cleanliness)
          ? p.cleanliness
          : existing.preferences.cleanliness,
        studyHabits: ['Quiet Focus', 'Collaborative', 'Flexible'].includes(p.studyHabits)
          ? p.studyHabits
          : existing.preferences.studyHabits,
        smokingPreference: ['Non-Smoker', 'Outside Only', 'Smoker'].includes(p.smokingPreference)
          ? p.smokingPreference
          : existing.preferences.smokingPreference,
        foodPreference: ['Halal / Home-style', 'Vegetarian', 'Flexible'].includes(p.foodPreference)
          ? p.foodPreference
          : existing.preferences.foodPreference,
      };
    }

    const updated = await db.users.update(existing.id, patch);
    if (!updated) {
      res.status(404).json({ error: 'Could not update profile.' });
      return;
    }

    if (updated.role === 'student') {
      await db.roommates.upsertForUser(updated);
    }

    res.json({ user: updated });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Profile update failed.' });
  }
});

// ---------------------------------------------------------------------------
// Hostels
// ---------------------------------------------------------------------------
router.get('/hostels', async (req, res) => {
  try {
    let items = await db.hostels.list(false);

    const location = asString(req.query.location, '', 80);
    const minRent = Number(req.query.minRent) || 0;
    const maxRent = Number(req.query.maxRent) || 0;
    const gender = asString(req.query.gender, '', 30);
    const roomType = asString(req.query.roomType, '', 40);
    const q = asString(req.query.q, '', 120).toLowerCase();
    const wifi = req.query.wifi === 'true';
    const meals = req.query.meals === 'true';
    const generator = req.query.generator === 'true';
    const attachedBathroom = req.query.attachedBathroom === 'true';
    const sort = asString(req.query.sort, 'featured', 30);

    if (location && location !== 'All') {
      items = items.filter((h) => h.location.toLowerCase() === location.toLowerCase());
    }
    if (minRent > 0) {
      items = items.filter((h) => h.monthlyRent >= minRent);
    }
    if (maxRent > 0) {
      items = items.filter((h) => h.monthlyRent <= maxRent);
    }
    if (gender && gender !== 'All') {
      items = items.filter((h) => h.genderPreference === gender || h.genderPreference === 'Co-ed');
    }
    if (roomType && roomType !== 'All') {
      items = items.filter((h) => h.roomTypes.includes(roomType as RoomTypeOption));
    }
    if (wifi) items = items.filter((h) => h.facilities.wifi);
    if (meals) items = items.filter((h) => h.facilities.meals);
    if (generator) items = items.filter((h) => h.facilities.generator);
    if (attachedBathroom) items = items.filter((h) => h.facilities.attachedBathroom);

    if (q) {
      items = items.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.location.toLowerCase().includes(q) ||
          h.address.toLowerCase().includes(q) ||
          h.nearbyUniversities.some((u) => u.toLowerCase().includes(q))
      );
    }

    if (sort === 'rent_asc') {
      items.sort((a, b) => a.monthlyRent - b.monthlyRent);
    } else if (sort === 'rent_desc') {
      items.sort((a, b) => b.monthlyRent - a.monthlyRent);
    } else if (sort === 'rating') {
      items.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'beds') {
      items.sort((a, b) => b.availableBeds - a.availableBeds);
    }

    res.json({ hostels: items });
  } catch (err) {
    console.error('List hostels error:', err);
    res.status(500).json({ error: 'Failed to load hostels.' });
  }
});

router.get('/hostels/mine', requireAuth, requireRole('owner', 'admin'), async (req: AuthenticatedRequest, res) => {
  const all = await db.hostels.list(true);
  const mine = req.auth!.role === 'admin' ? all : all.filter((h) => h.ownerId === req.auth!.userId);
  res.json({ hostels: mine });
});

router.get('/hostels/:id', async (req, res) => {
  const hostel = await db.hostels.findById(req.params.id);
  if (!hostel) {
    res.status(404).json({ error: 'Hostel listing not found.' });
    return;
  }
  const reviews = await db.reviews.listByHostel(hostel.id);
  res.json({ hostel, reviews });
});

router.post('/hostels', requireAuth, requireRole('owner', 'admin'), async (req: AuthenticatedRequest, res) => {
  try {
    const owner = await db.users.findById(req.auth!.userId);
    if (!owner) {
      res.status(404).json({ error: 'Owner account not found.' });
      return;
    }

    const name = asNonEmptyString(req.body?.name, 140);
    const location = asNonEmptyString(req.body?.location, 80);
    const address = asNonEmptyString(req.body?.address, 240);
    const monthlyRent = Number(req.body?.monthlyRent);
    const totalBeds = Number(req.body?.totalBeds);
    const availableBeds = Number(req.body?.availableBeds);
    const genderPreference: HostelGenderOption = ['Male', 'Female', 'Co-ed'].includes(req.body?.genderPreference)
      ? req.body.genderPreference
      : 'Male';
    const description = asNonEmptyString(req.body?.description, 2000);

    if (!name || !location || !address || !description) {
      res.status(400).json({ error: 'Name, location, full address, and description are required.' });
      return;
    }
    if (!Number.isFinite(monthlyRent) || monthlyRent < 1000 || monthlyRent > 50000) {
      res.status(400).json({ error: 'Monthly rent must be between 1,000 and 50,000 BDT.' });
      return;
    }
    if (!Number.isFinite(totalBeds) || totalBeds < 1 || !Number.isFinite(availableBeds) || availableBeds < 0 || availableBeds > totalBeds) {
      res.status(400).json({ error: 'Please enter valid total and available bed counts.' });
      return;
    }

    const rawPhotos = Array.isArray(req.body?.photos) ? req.body.photos : [];
    const safePhotos = rawPhotos.filter((p: unknown) => typeof p === 'string' && isSafeImageUrl(p)).slice(0, 6);
    if (safePhotos.length === 0) {
      safePhotos.push(PRESET_HOSTEL_PHOTOS[0]);
    }

    const roomTypes: RoomTypeOption[] = Array.isArray(req.body?.roomTypes) && req.body.roomTypes.length > 0
      ? req.body.roomTypes.filter((r: unknown) =>
          ['Single', 'Shared Twin', '3-Bed Room', '4-Bed Dorm'].includes(String(r))
        )
      : ['Shared Twin'];

    const f = req.body?.facilities || {};
    const rules = Array.isArray(req.body?.rules)
      ? req.body.rules.map((r: unknown) => asString(r, '', 200)).filter(Boolean)
      : ['Quiet study hours after 10:30 PM', 'Student ID required at check-in'];

    const nearbyUniversities = Array.isArray(req.body?.nearbyUniversities)
      ? req.body.nearbyUniversities.map((u: unknown) => asString(u, '', 120)).filter(Boolean)
      : [];

    const created = await db.hostels.create({
      ownerId: owner.id,
      ownerName: owner.name,
      ownerPhone: owner.phone,
      ownerEmail: owner.email,
      ownerVerified: owner.verifiedOwner,
      name,
      location,
      address,
      monthlyRent,
      roomTypes,
      totalBeds,
      availableBeds,
      genderPreference,
      facilities: {
        wifi: Boolean(f.wifi),
        meals: Boolean(f.meals),
        generator: Boolean(f.generator),
        attachedBathroom: Boolean(f.attachedBathroom),
        ac: Boolean(f.ac),
        laundry: Boolean(f.laundry),
        cctv: Boolean(f.cctv),
        studyRoom: Boolean(f.studyRoom),
      },
      photos: safePhotos,
      description,
      rules,
      mealsInfo: asString(req.body?.mealsInfo, 'Home-style student meal plan available.', 400),
      securityInfo: asString(req.body?.securityInfo, '24/7 caretaker and CCTV surveillance.', 400),
      nearbyUniversities,
      verified: owner.verifiedOwner,
      // Verified owners and admins publish immediately; newly registered unverified owners await admin approval
      approved: owner.verifiedOwner || owner.role === 'admin',
    });

    res.status(201).json({ hostel: created });
  } catch (err) {
    console.error('Create hostel error:', err);
    res.status(500).json({ error: 'Could not create hostel listing.' });
  }
});

router.put('/hostels/:id', requireAuth, requireRole('owner', 'admin'), async (req: AuthenticatedRequest, res) => {
  try {
    const existing = await db.hostels.findById(req.params.id);
    if (!existing) {
      res.status(404).json({ error: 'Hostel listing not found.' });
      return;
    }
    if (req.auth!.role !== 'admin' && existing.ownerId !== req.auth!.userId) {
      res.status(403).json({ error: 'You can only edit your own hostel listings.' });
      return;
    }

    const patch: any = {};
    if (typeof req.body?.name === 'string' && req.body.name.trim()) patch.name = req.body.name.trim().slice(0, 140);
    if (typeof req.body?.location === 'string' && req.body.location.trim()) patch.location = req.body.location.trim().slice(0, 80);
    if (typeof req.body?.address === 'string' && req.body.address.trim()) patch.address = req.body.address.trim().slice(0, 240);
    if (typeof req.body?.description === 'string' && req.body.description.trim()) patch.description = req.body.description.trim().slice(0, 2000);
    if (req.body?.monthlyRent !== undefined) {
      const rent = Number(req.body.monthlyRent);
      if (!Number.isFinite(rent) || rent < 1000 || rent > 50000) {
        res.status(400).json({ error: 'Rent must be between 1,000 and 50,000 BDT.' });
        return;
      }
      patch.monthlyRent = rent;
    }
    if (req.body?.totalBeds !== undefined) patch.totalBeds = Math.max(1, Number(req.body.totalBeds));
    if (req.body?.availableBeds !== undefined) patch.availableBeds = Math.max(0, Number(req.body.availableBeds));
    if (['Male', 'Female', 'Co-ed'].includes(req.body?.genderPreference)) {
      patch.genderPreference = req.body.genderPreference;
    }
    if (req.body?.facilities && typeof req.body.facilities === 'object') {
      const f = req.body.facilities;
      patch.facilities = {
        wifi: Boolean(f.wifi),
        meals: Boolean(f.meals),
        generator: Boolean(f.generator),
        attachedBathroom: Boolean(f.attachedBathroom),
        ac: Boolean(f.ac),
        laundry: Boolean(f.laundry),
        cctv: Boolean(f.cctv),
        studyRoom: Boolean(f.studyRoom),
      };
    }
    if (Array.isArray(req.body?.photos)) {
      const safe = req.body.photos.filter((p: unknown) => typeof p === 'string' && isSafeImageUrl(p)).slice(0, 6);
      if (safe.length > 0) patch.photos = safe;
    }
    if (Array.isArray(req.body?.roomTypes)) {
      const rt = req.body.roomTypes.filter((r: unknown) =>
        ['Single', 'Shared Twin', '3-Bed Room', '4-Bed Dorm'].includes(String(r))
      );
      if (rt.length > 0) patch.roomTypes = rt;
    }
    if (typeof req.body?.mealsInfo === 'string') patch.mealsInfo = req.body.mealsInfo.trim().slice(0, 400);
    if (typeof req.body?.securityInfo === 'string') patch.securityInfo = req.body.securityInfo.trim().slice(0, 400);

    const updated = await db.hostels.update(existing.id, patch);
    res.json({ hostel: updated });
  } catch (err) {
    console.error('Update hostel error:', err);
    res.status(500).json({ error: 'Could not update hostel.' });
  }
});

router.delete('/hostels/:id', requireAuth, requireRole('owner', 'admin'), async (req: AuthenticatedRequest, res) => {
  const existing = await db.hostels.findById(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Hostel listing not found.' });
    return;
  }
  if (req.auth!.role !== 'admin' && existing.ownerId !== req.auth!.userId) {
    res.status(403).json({ error: 'You can only delete your own hostel listings.' });
    return;
  }
  await db.hostels.remove(existing.id);
  res.json({ ok: true });
});

router.post('/hostels/:id/reviews', requireAuth, async (req: AuthenticatedRequest, res) => {
  const hostel = await db.hostels.findById(req.params.id);
  if (!hostel) {
    res.status(404).json({ error: 'Hostel not found.' });
    return;
  }
  const user = await db.users.findById(req.auth!.userId);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }
  const rating = Math.max(1, Math.min(5, Math.round(Number(req.body?.rating) || 5)));
  const comment = asNonEmptyString(req.body?.comment, 800);
  if (!comment) {
    res.status(400).json({ error: 'Please write a short review comment.' });
    return;
  }

  const review = await db.reviews.create({
    hostelId: hostel.id,
    userId: user.id,
    userName: user.name,
    userUniversity: user.university || 'University Student',
    rating,
    comment,
  });
  const updatedHostel = await db.hostels.findById(hostel.id);
  res.status(201).json({ review, hostel: updatedHostel });
});

// ---------------------------------------------------------------------------
// Roommate Finder & Compatibility Algorithm
// ---------------------------------------------------------------------------
router.get('/roommates', optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    let profiles = await db.roommates.list();

    // Exclude logged-in user's own roommate profile from their candidate list
    if (req.auth?.userId) {
      profiles = profiles.filter((p) => p.userId !== req.auth!.userId);
    }

    // Determine seeker baseline for deterministic 7-factor compatibility scoring
    let seeker: CompatibilityInput = {
      budget: 6500,
      preferredLocation: 'Dhanmondi',
      sleepSchedule: 'Balanced',
      cleanliness: 'Very Tidy',
      studyHabits: 'Quiet Focus',
      smokingPreference: 'Non-Smoker',
      foodPreference: 'Halal / Home-style',
    };

    if (req.auth?.userId) {
      const currentUser = await db.users.findById(req.auth.userId);
      if (currentUser) {
        seeker = {
          budget: currentUser.budget || 6500,
          preferredLocation: currentUser.preferredLocation || 'Dhanmondi',
          sleepSchedule: currentUser.preferences.sleepSchedule,
          cleanliness: currentUser.preferences.cleanliness,
          studyHabits: currentUser.preferences.studyHabits,
          smokingPreference: currentUser.preferences.smokingPreference,
          foodPreference: currentUser.preferences.foodPreference,
        };
      }
    }

    // Allow live query overrides so visitors or students testing preferences get instant recalculated scores
    if (req.query.myBudget) seeker.budget = Number(req.query.myBudget) || seeker.budget;
    if (typeof req.query.myLocation === 'string' && req.query.myLocation.trim()) {
      seeker.preferredLocation = req.query.myLocation.trim();
    }
    if (['Early Bird', 'Balanced', 'Night Owl'].includes(String(req.query.mySleep))) {
      seeker.sleepSchedule = req.query.mySleep as SleepSchedule;
    }
    if (['Very Tidy', 'Moderate', 'Relaxed'].includes(String(req.query.myCleanliness))) {
      seeker.cleanliness = req.query.myCleanliness as CleanlinessLevel;
    }
    if (['Quiet Focus', 'Collaborative', 'Flexible'].includes(String(req.query.myStudy))) {
      seeker.studyHabits = req.query.myStudy as StudyHabits;
    }
    if (['Non-Smoker', 'Outside Only', 'Smoker'].includes(String(req.query.mySmoking))) {
      seeker.smokingPreference = req.query.mySmoking as SmokingPreference;
    }
    if (['Halal / Home-style', 'Vegetarian', 'Flexible'].includes(String(req.query.myFood))) {
      seeker.foodPreference = req.query.myFood as FoodPreference;
    }

    // Candidate filters
    const university = asString(req.query.university, '', 140);
    const location = asString(req.query.location, '', 80);
    const maxBudget = Number(req.query.maxBudget) || 0;
    const gender = asString(req.query.gender, '', 30);
    const sleepSchedule = asString(req.query.sleepSchedule, '', 30);
    const cleanliness = asString(req.query.cleanliness, '', 30);
    const studyHabits = asString(req.query.studyHabits, '', 30);
    const smokingPreference = asString(req.query.smokingPreference, '', 30);

    if (university && university !== 'All') {
      profiles = profiles.filter((p) => p.university.toLowerCase().includes(university.toLowerCase()));
    }
    if (location && location !== 'All') {
      profiles = profiles.filter((p) => p.preferredLocation.toLowerCase() === location.toLowerCase());
    }
    if (maxBudget > 0) {
      profiles = profiles.filter((p) => p.budget <= maxBudget);
    }
    if (gender && gender !== 'All') {
      profiles = profiles.filter((p) => p.gender === gender);
    }
    if (sleepSchedule && sleepSchedule !== 'All') {
      profiles = profiles.filter((p) => p.sleepSchedule === sleepSchedule);
    }
    if (cleanliness && cleanliness !== 'All') {
      profiles = profiles.filter((p) => p.cleanliness === cleanliness);
    }
    if (studyHabits && studyHabits !== 'All') {
      profiles = profiles.filter((p) => p.studyHabits === studyHabits);
    }
    if (smokingPreference && smokingPreference !== 'All') {
      profiles = profiles.filter((p) => p.smokingPreference === smokingPreference);
    }

    const scored = profiles
      .map((p) => ({
        ...p,
        compatibility: calculateCompatibility(seeker, p),
      }))
      .sort((a, b) => b.compatibility.score - a.compatibility.score);

    res.json({ roommates: scored, seekerPreferences: seeker });
  } catch (err) {
    console.error('Roommates error:', err);
    res.status(500).json({ error: 'Could not load roommate profiles.' });
  }
});

// ---------------------------------------------------------------------------
// Booking Requests
// ---------------------------------------------------------------------------
router.get('/bookings', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { userId, role } = req.auth!;
  if (role === 'admin') {
    const bookings = await db.bookings.listAll();
    res.json({ bookings });
    return;
  }
  if (role === 'owner') {
    const bookings = await db.bookings.listByOwner(userId);
    res.json({ bookings });
    return;
  }
  const bookings = await db.bookings.listByStudent(userId);
  res.json({ bookings });
});

router.post('/bookings', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const student = await db.users.findById(req.auth!.userId);
    if (!student) {
      res.status(404).json({ error: 'Account not found.' });
      return;
    }
    const hostelId = asNonEmptyString(req.body?.hostelId, 100);
    if (!hostelId) {
      res.status(400).json({ error: 'Hostel ID is required.' });
      return;
    }
    const hostel = await db.hostels.findById(hostelId);
    if (!hostel) {
      res.status(404).json({ error: 'Hostel listing not found.' });
      return;
    }
    if (hostel.availableBeds <= 0) {
      res.status(400).json({ error: 'No beds are currently available at this hostel.' });
      return;
    }

    const roomType: RoomTypeOption = ['Single', 'Shared Twin', '3-Bed Room', '4-Bed Dorm'].includes(
      req.body?.roomType
    )
      ? req.body.roomType
      : hostel.roomTypes[0] || 'Shared Twin';
    const moveInDate = asNonEmptyString(req.body?.moveInDate, 40) || new Date().toISOString().slice(0, 10);
    const message = asString(req.body?.message, 'Requesting bed reservation for upcoming semester.', 600);

    const booking = await db.bookings.create({
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      studentPhone: student.phone,
      studentUniversity: student.university || 'University Student',
      hostelId: hostel.id,
      hostelName: hostel.name,
      hostelLocation: hostel.location,
      monthlyRent: hostel.monthlyRent,
      ownerId: hostel.ownerId,
      roomType,
      moveInDate,
      message,
    });

    res.status(201).json({ booking });
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ error: 'Could not submit booking request.' });
  }
});

router.patch(
  '/bookings/:id/status',
  requireAuth,
  requireRole('owner', 'admin'),
  async (req: AuthenticatedRequest, res) => {
    try {
      const booking = await db.bookings.findById(req.params.id);
      if (!booking) {
        res.status(404).json({ error: 'Booking request not found.' });
        return;
      }
      if (req.auth!.role !== 'admin' && booking.ownerId !== req.auth!.userId) {
        res.status(403).json({ error: 'You can only manage requests for your own hostels.' });
        return;
      }

      const status = req.body?.status as BookingStatus;
      if (!['Accepted', 'Rejected', 'Pending'].includes(status)) {
        res.status(400).json({ error: 'Invalid booking status.' });
        return;
      }
      const ownerNote = asString(req.body?.ownerNote, '', 400);

      // Update bed availability cleanly on first acceptance
      if (booking.status !== 'Accepted' && status === 'Accepted') {
        const hostel = await db.hostels.findById(booking.hostelId);
        if (hostel && hostel.availableBeds > 0) {
          await db.hostels.update(hostel.id, { availableBeds: hostel.availableBeds - 1 });
        }
      }

      const updated = await db.bookings.updateStatus(booking.id, status, ownerNote);
      res.json({ booking: updated });
    } catch (err) {
      console.error('Update booking status error:', err);
      res.status(500).json({ error: 'Failed to update booking request.' });
    }
  }
);

// ---------------------------------------------------------------------------
// Favorites
// ---------------------------------------------------------------------------
router.get('/favorites', requireAuth, async (req: AuthenticatedRequest, res) => {
  const favs = await db.favorites.listByUser(req.auth!.userId);
  const allHostels = await db.hostels.list(false);
  const allRoommates = await db.roommates.list();
  const user = await db.users.findById(req.auth!.userId);

  const hostelIds = favs.filter((f) => f.itemType === 'hostel').map((f) => f.itemId);
  const roommateIds = favs.filter((f) => f.itemType === 'roommate').map((f) => f.itemId);

  const hostels = allHostels.filter((h) => hostelIds.includes(h.id));
  const roommates = allRoommates
    .filter((r) => roommateIds.includes(r.id))
    .map((r) => ({
      ...r,
      compatibility: user
        ? calculateCompatibility(
            {
              budget: user.budget,
              preferredLocation: user.preferredLocation,
              ...user.preferences,
            },
            r
          )
        : undefined,
    }));

  res.json({
    favorites: favs,
    hostelIds,
    roommateIds,
    hostels,
    roommates,
  });
});

router.post('/favorites/toggle', requireAuth, async (req: AuthenticatedRequest, res) => {
  const itemType = req.body?.itemType === 'roommate' ? 'roommate' : 'hostel';
  const itemId = asNonEmptyString(req.body?.itemId, 100);
  if (!itemId) {
    res.status(400).json({ error: 'Item ID is required.' });
    return;
  }
  const result = await db.favorites.toggle(req.auth!.userId, itemType, itemId);
  res.json(result);
});

// ---------------------------------------------------------------------------
// Messages (Contact Owner / Roommate)
// ---------------------------------------------------------------------------
router.get('/messages', requireAuth, async (req: AuthenticatedRequest, res) => {
  const messages = await db.messages.listForUser(req.auth!.userId);
  res.json({ messages });
});

router.post('/messages', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const sender = await db.users.findById(req.auth!.userId);
    if (!sender) {
      res.status(404).json({ error: 'Sender account not found.' });
      return;
    }
    const recipientId = asNonEmptyString(req.body?.recipientId, 100);
    const subject = asNonEmptyString(req.body?.subject, 160);
    const body = asNonEmptyString(req.body?.body, 1500);
    const hostelId = asString(req.body?.hostelId, '', 100);

    if (!recipientId || !subject || !body) {
      res.status(400).json({ error: 'Recipient, subject, and message body are required.' });
      return;
    }

    const recipient = await db.users.findById(recipientId);
    if (!recipient) {
      res.status(404).json({ error: 'Recipient not found.' });
      return;
    }

    let hostelName = '';
    if (hostelId) {
      const h = await db.hostels.findById(hostelId);
      if (h) hostelName = h.name;
    }

    const message = await db.messages.create({
      senderId: sender.id,
      senderName: sender.name,
      senderEmail: sender.email,
      recipientId: recipient.id,
      recipientName: recipient.name,
      hostelId: hostelId || undefined,
      hostelName: hostelName || undefined,
      subject,
      body,
    });

    res.status(201).json({ message });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Could not send message.' });
  }
});

router.patch('/messages/:id/read', requireAuth, async (req: AuthenticatedRequest, res) => {
  await db.messages.markRead(req.params.id, req.auth!.userId);
  res.json({ ok: true });
});

// ---------------------------------------------------------------------------
// Admin Operations
// ---------------------------------------------------------------------------
router.get('/admin/overview', requireAuth, requireRole('admin'), async (_req, res) => {
  const [stats, users, hostels, bookings] = await Promise.all([
    db.getAdminStats(),
    db.users.listAll(),
    db.hostels.list(true),
    db.bookings.listAll(),
  ]);
  res.json({ stats, users, hostels, bookings });
});

router.patch('/admin/hostels/:id/approve', requireAuth, requireRole('admin'), async (req, res) => {
  const hostel = await db.hostels.findById(req.params.id);
  if (!hostel) {
    res.status(404).json({ error: 'Hostel not found.' });
    return;
  }
  const approved = typeof req.body?.approved === 'boolean' ? req.body.approved : !hostel.approved;
  const verified = typeof req.body?.verified === 'boolean' ? req.body.verified : approved;
  const updated = await db.hostels.update(hostel.id, { approved, verified });
  res.json({ hostel: updated });
});

router.patch('/admin/users/:id/verify', requireAuth, requireRole('admin'), async (req, res) => {
  const user = await db.users.findById(req.params.id);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }
  const verifiedOwner =
    typeof req.body?.verifiedOwner === 'boolean' ? req.body.verifiedOwner : !user.verifiedOwner;
  const updated = await db.users.update(user.id, { verifiedOwner });
  res.json({ user: updated });
});

export default router;
