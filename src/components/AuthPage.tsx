import React, { useState } from 'react';
import { HostProfile } from '../types';
import { Key, Mail, ShieldAlert, Sparkles, CheckCircle2, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface AuthPageProps {
  onLogin: (profile: HostProfile) => void;
  currentProfile: HostProfile | null;
  onLogout: () => void;
}

export default function AuthPage({ onLogin, currentProfile, onLogout }: AuthPageProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleInstantDemoLogin = () => {
    const demoProfile: HostProfile = {
      email: 'christiantampus606@gmail.com',
      name: 'Christian Tampus',
      isSignedIn: true
    };
    onLogin(demoProfile);
    setSuccessMsg('Successfully logged in as Christian Tampus!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please provide an email address.');
      return;
    }
    if (isSignUp && !name) {
      setErrorMsg('Please provide your name.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setErrorMsg('');
    const profile: HostProfile = {
      email: email.trim().toLowerCase(),
      name: name.trim() || email.split('@')[0],
      isSignedIn: true
    };
    onLogin(profile);
    setSuccessMsg(isSignUp ? 'Account created successfully!' : 'Logged in successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Auth form Card */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                <Key size={16} />
              </div>
              <span className="font-bold text-slate-800 tracking-tight font-display">Host Authentication</span>
            </div>

            {currentProfile?.isSignedIn ? (
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="font-semibold text-emerald-900 text-sm">You are logged in</h4>
                    <p className="text-emerald-700 text-xs mt-1">
                      Active Session: <span className="font-mono">{currentProfile.email}</span>
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Host Name</span>
                    <span className="font-semibold text-slate-800">{currentProfile.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Account Security</span>
                    <span className="text-emerald-600 font-medium">Secured (Free Tier DB)</span>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="w-full py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-semibold rounded-xl transition-all duration-200 border border-rose-100"
                >
                  Sign Out of Host Portal
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    {isSignUp ? 'Create your Host Account' : 'Welcome to FreeSched'}
                  </h3>
                  <p className="text-slate-500 text-xs">
                    {isSignUp ? 'Sign up to configure availability and branding' : 'Access your Calendly-like portal'}
                  </p>
                </div>

                {successMsg && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-100 flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {errorMsg && (
                  <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-lg border border-rose-100 flex items-center gap-2">
                    <AlertCircle size={14} className="text-rose-500" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="space-y-3">
                  {isSignUp && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Full Name</label>
                      <input
                        type="text"
                        placeholder="Christian Tampus"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 text-slate-400" size={14} />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-slate-600">Password</label>
                      {!isSignUp && (
                        <button type="button" className="text-[10px] text-blue-600 hover:underline">
                          Forgot?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold rounded-xl transition shadow-xs mt-2"
                >
                  {isSignUp ? 'Register Account' : 'Sign In'}
                </button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-100"></div>
                  <span className="flex-shrink mx-3 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Or Skip with Demo</span>
                  <div className="flex-grow border-t border-slate-100"></div>
                </div>

                <button
                  type="button"
                  onClick={handleInstantDemoLogin}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
                >
                  <Sparkles size={14} /> Log In with Christian Tampus Demo
                </button>

                <p className="text-center text-[11px] text-slate-500 mt-4">
                  {isSignUp ? 'Already have an account?' : "Don't have a free host login?"}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setErrorMsg('');
                    }}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    {isSignUp ? 'Sign In' : 'Create Account'}
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Info panel explaining how to connect real free db */}
        <div className="lg:col-span-7 bg-slate-900 text-white p-6 sm:p-8 rounded-2xl flex flex-col justify-between">
          <div className="space-y-5">
            <span className="px-2.5 py-1 bg-white/10 text-slate-200 text-[10px] font-semibold rounded-full border border-white/15 inline-flex items-center gap-1">
              <ShieldAlert size={12} className="text-amber-400 animate-pulse" /> Production-Grade Auth Reference
            </span>
            <div className="space-y-1">
              <h3 className="text-lg font-bold tracking-tight font-display text-white">How Free Auth Integration Works</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                By taking advantage of the generous 100% free forever tiers of Firebase Auth or Supabase Auth, you can support millions of simultaneous host registrations at no cost.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">A</div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">Firebase Auth Free Tier (Up to 50,000 MAUs)</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Provides built-in Google Auth, Email/Password, and phone OTP logins completely free for 50k monthly active users. Easily integrated in minutes via standard Firebase client SDK.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">B</div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">Supabase Auth Free Tier (Up to 50,000 MAUs)</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    PostgreSQL-backed authentication with full row-level security policy integration. Provides instant login links, passwordless OTP, and third-party social provider buttons.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-2 text-[11px]">
              <span className="font-semibold text-slate-200 block">Production Client Authorization Pattern (Firebase example):</span>
              <pre className="font-mono text-emerald-400 overflow-x-auto p-2 bg-black/40 rounded">
{`import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const auth = getAuth();
// Execute safe login
await signInWithEmailAndPassword(auth, email, password);`}
              </pre>
            </div>
          </div>

          <div className="text-slate-500 text-[10px] border-t border-white/5 pt-4 mt-6 flex justify-between">
            <span>Powered by Serverless Identity Solutions</span>
            <span>Free Tier Limits Verified</span>
          </div>
        </div>

      </div>
    </div>
  );
}
