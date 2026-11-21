import { Shield, UserCheck } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BD_LOCATIONS, BD_UNIVERSITIES } from '../../shared/types';
import { api, extractErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';

type AuthMode = 'login' | 'signup' | 'admin';

export function AuthPage() {
  const { user, login, register, loginDemo, claimAdmin, loginAdmin, showToast } = useAuth();
  const navigate = useNavigate();
  const routeLocation = useLocation();

  const initialMode: AuthMode = routeLocation.pathname === '/signup' ? 'signup' : 'login';
  const [mode, setMode] = useState<AuthMode>(initialMode);

  useEffect(() => {
    if (routeLocation.pathname === '/signup') setMode('signup');
    else if (routeLocation.pathname === '/login') setMode('login');
  }, [routeLocation.pathname]);

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup Form
  const [role, setRole] = useState<'student' | 'owner'>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [university, setUniversity] = useState<string>(BD_UNIVERSITIES[0]);
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [budget, setBudget] = useState('6500');
  const [preferredLocation, setPreferredLocation] = useState<string>(BD_LOCATIONS[0]);

  // Admin Status & Form
  const [adminConfigured, setAdminConfigured] = useState(true);
  const [envPasscodeActive, setEnvPasscodeActive] = useState(false);
  const [adminName, setAdminName] = useState('Platform Admin');
  const [adminEmail, setAdminEmail] = useState('admin@nestlink.bd');
  const [adminPassword, setAdminPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/auth/admin/status')
      .then((res) => {
        setAdminConfigured(Boolean(res.data.configured));
        setEnvPasscodeActive(Boolean(res.data.envPasscodeActive));
      })
      .catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!loginEmail.trim() || !loginPassword) {
      setError('Please enter both email and password.');
      return;
    }
    setSubmitting(true);
    try {
      const signedIn = await login(loginEmail.trim(), loginPassword);
      showToast(`Welcome back, ${signedIn.name}!`, 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(extractErrorMessage(err, 'Invalid email or password.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (name.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (phone.trim().length < 10) {
      setError('Please enter a valid Bangladeshi mobile number (e.g. 017XXXXXXXX).');
      return;
    }

    setSubmitting(true);
    try {
      const created = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        phone: phone.trim(),
        university: role === 'student' ? university : '',
        department: role === 'student' ? department.trim() : '',
        gender,
        budget: Number(budget) || 6500,
        preferredLocation,
      });
      showToast(`Account created! Welcome to NestLink, ${created.name}.`, 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(extractErrorMessage(err, 'Registration failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async (demoRole: 'student' | 'owner') => {
    setError('');
    setSubmitting(true);
    try {
      const signedIn = await loginDemo(demoRole);
      showToast(`Signed in to demo ${demoRole} account (${signedIn.name}).`, 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(extractErrorMessage(err, 'Demo sign-in failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (adminPassword.length < (adminConfigured ? 1 : 8)) {
      setError(
        adminConfigured
          ? 'Please enter the administrator password.'
          : 'Admin password must be at least 8 characters long.'
      );
      return;
    }
    setSubmitting(true);
    try {
      const signedIn = adminConfigured
        ? await loginAdmin({
            email: envPasscodeActive ? undefined : adminEmail.trim(),
            password: adminPassword,
          })
        : await claimAdmin({
            name: adminName.trim(),
            email: adminEmail.trim(),
            password: adminPassword,
          });
      showToast(`Signed in as ${signedIn.name}.`, 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(extractErrorMessage(err, 'Administrator authentication failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
        {/* Segmented Mode Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => {
              setError('');
              setMode('login');
            }}
            className={`py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              mode === 'login' ? 'bg-white text-[#142B4A] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setError('');
              setMode('signup');
            }}
            className={`py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              mode === 'signup' ? 'bg-white text-[#142B4A] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => {
              setError('');
              setMode('admin');
            }}
            className={`py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              mode === 'admin' ? 'bg-white text-[#142B4A] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Admin
          </button>
        </div>

        {error && (
          <div role="alert" className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        {mode === 'login' && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl font-bold text-[#142B4A]">Welcome Back</h1>
              <p className="text-sm text-slate-600 mt-1">
                Sign in to manage favorites, booking requests, and roommate matches.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="student@university.edu.bd"
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-lg text-sm font-semibold text-white bg-[#142B4A] hover:bg-[#1E3D66] disabled:opacity-60 cursor-pointer"
              >
                {submitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Quick Demo Sign-In */}
            <div className="pt-5 border-t border-slate-100 space-y-3">
              <p className="text-xs font-semibold text-slate-500">
                Quick Demonstration Accounts
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('student')}
                  disabled={submitting}
                  className="px-3.5 py-2.5 rounded-lg border border-slate-300 bg-[#F8FAFC] hover:bg-slate-100 text-left transition-colors cursor-pointer"
                >
                  <div className="text-xs font-bold text-[#142B4A] inline-flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-[#3B82F6]" />
                    Demo Student
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Rafiul Islam · DU CSE</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('owner')}
                  disabled={submitting}
                  className="px-3.5 py-2.5 rounded-lg border border-slate-300 bg-[#F8FAFC] hover:bg-slate-100 text-left transition-colors cursor-pointer"
                >
                  <div className="text-xs font-bold text-[#142B4A] inline-flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Demo Hostel Owner
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Karim Uddin · Dhanmondi</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {mode === 'signup' && (
          <div className="space-y-5">
            <div>
              <h1 className="font-display text-2xl font-bold text-[#142B4A]">
                Create Your NestLink Account
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Join as a university student or register your hostel property.
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`py-2.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                      role === 'student'
                        ? 'bg-[#142B4A] text-white border-[#142B4A]'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('owner')}
                    className={`py-2.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                      role === 'owner'
                        ? 'bg-[#142B4A] text-white border-[#142B4A]'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    Hostel Owner
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tasnim Rahman"
                    required
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    required
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@university.edu.bd"
                    required
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password (min 6 chars)
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    required
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              {role === 'student' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">University</label>
                    <select
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm"
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
                      required
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'Male' | 'Female' | 'Other')}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Budget (BDT)
                  </label>
                  <input
                    type="number"
                    min={2000}
                    max={40000}
                    step={500}
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Preferred Area
                  </label>
                  <select
                    value={preferredLocation}
                    onChange={(e) => setPreferredLocation(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm"
                  >
                    {BD_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-lg text-sm font-semibold text-white bg-[#142B4A] hover:bg-[#1E3D66] disabled:opacity-60 cursor-pointer"
              >
                {submitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          </div>
        )}

        {mode === 'admin' && (
          <div className="space-y-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#3B82F6]">
                <Shield className="w-4 h-4" />
                Platform Moderation Console
              </div>
              <h1 className="font-display text-2xl font-bold text-[#142B4A]">
                {adminConfigured ? 'Administrator Sign In' : 'First-Run Admin Setup'}
              </h1>
              <p className="text-sm text-slate-600">
                {adminConfigured
                  ? 'Enter your administrator credentials to review listings and verify hostel owners.'
                  : 'No administrator is configured yet. Claim the administrator account below with a strong password.'}
              </p>
            </div>

            <form onSubmit={handleAdminSubmit} className="space-y-4">
              {!adminConfigured && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Admin Name
                  </label>
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              )}

              {(!adminConfigured || !envPasscodeActive) && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {adminConfigured ? 'Admin Password / Passcode' : 'Create Admin Password (min 8 chars)'}
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-lg text-sm font-semibold text-white bg-[#142B4A] hover:bg-[#1E3D66] disabled:opacity-60 cursor-pointer"
              >
                {submitting
                  ? 'Verifying...'
                  : adminConfigured
                    ? 'Sign In to Admin Console'
                    : 'Claim Admin Access'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
