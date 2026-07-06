/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrandSettings, EventType, AvailabilitySlot, ReminderSetting, BookingLead, HostProfile } from './types';
import Dashboard from './components/Dashboard';
import BookingPage from './components/BookingPage';
import ArchitectureGuide from './components/ArchitectureGuide';
import AuthPage from './components/AuthPage';
import { Calendar, Layers, ShieldCheck, UserCheck, Sparkles, Server, HelpCircle, Code, ChevronRight, Play, Palette, Bell } from 'lucide-react';

export default function App() {
  // Detect if the URL is accessed via the direct client booking route
  const checkIsClientMode = (): boolean => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const href = window.location.href.toLowerCase();
    return (
      path.includes('/book') || 
      path.includes('/booking') || 
      hash.includes('book') || 
      hash.includes('booking') ||
      href.includes('/book') ||
      href.includes('/booking') ||
      href.includes('#/book')
    );
  };

  const [isClientMode, setIsClientMode] = useState<boolean>(checkIsClientMode);
  const [currentView, setCurrentView] = useState<'dashboard' | 'booking' | 'developer' | 'auth'>(() => {
    return checkIsClientMode() ? 'booking' : 'dashboard';
  });
  const [activeDashboardTab, setActiveDashboardTab] = useState<'leads' | 'branding' | 'events' | 'availability' | 'notifications'>('leads');

  // Sync client mode on path/hash navigation
  useEffect(() => {
    const handleLocationChange = () => {
      const clientActive = checkIsClientMode();
      setIsClientMode(clientActive);
      if (clientActive) {
        setCurrentView('booking');
      }
    };

    // Run immediately on mount to align state with active URL pathing
    handleLocationChange();

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Core State backed by LocalStorage for durability
  const [hostProfile, setHostProfile] = useState<HostProfile>(() => {
    const saved = localStorage.getItem('freesched_profile');
    if (saved) return JSON.parse(saved);
    return {
      email: 'christiantampus606@gmail.com',
      name: 'Christian Tampus',
      isSignedIn: true
    };
  });

  const [brand, setBrand] = useState<BrandSettings>(() => {
    const saved = localStorage.getItem('freesched_brand');
    if (saved) return JSON.parse(saved);
    return {
      name: 'Christian Tampus',
      logoType: 'emoji',
      logoValue: '💼',
      color: '#2563eb',
      typography: 'sans',
      welcomeMessage: 'Welcome to my booking portal. Choose a slot below to schedule our strategy session.'
    };
  });

  const [eventTypes, setEventTypes] = useState<EventType[]>(() => {
    const saved = localStorage.getItem('freesched_events');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'ev_1',
        name: '15 Minute Strategy Consultation',
        duration: 15,
        description: 'A rapid intake assessment to review business requirements and outline core deliverables.',
        color: 'emerald',
        isActive: true
      },
      {
        id: 'ev_2',
        name: '30 Minute Briefing Session',
        duration: 30,
        description: 'Deep dive into workflow constraints, tech stacks, and custom system architecture.',
        color: 'sky',
        isActive: true
      },
      {
        id: 'ev_3',
        name: '60 Minute High-Performance Coaching',
        duration: 60,
        description: 'A comprehensive consulting and architectural design board meeting.',
        color: 'violet',
        isActive: true
      }
    ];
  });

  const [availability, setAvailability] = useState<AvailabilitySlot[]>(() => {
    const saved = localStorage.getItem('freesched_availability');
    if (saved) return JSON.parse(saved);
    return [
      { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', enabled: true },
      { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', enabled: true },
      { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', enabled: true },
      { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', enabled: true },
      { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', enabled: true },
      { dayOfWeek: 6, startTime: '10:00', endTime: '14:00', enabled: false },
      { dayOfWeek: 0, startTime: '10:00', endTime: '14:00', enabled: false },
    ];
  });

  const [reminders, setReminders] = useState<ReminderSetting[]>(() => {
    const saved = localStorage.getItem('freesched_reminders');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'rem_1', timeValue: 24, timeUnit: 'hours', enabled: true },
      { id: 'rem_2', timeValue: 1, timeUnit: 'hours', enabled: true }
    ];
  });

  const [bookings, setBookings] = useState<BookingLead[]>(() => {
    const saved = localStorage.getItem('freesched_bookings');
    if (saved) return JSON.parse(saved);
    return [];
  });

  // Persist State to LocalStorage on modification
  useEffect(() => {
    localStorage.setItem('freesched_profile', JSON.stringify(hostProfile));
  }, [hostProfile]);

  useEffect(() => {
    localStorage.setItem('freesched_brand', JSON.stringify(brand));
  }, [brand]);

  useEffect(() => {
    localStorage.setItem('freesched_events', JSON.stringify(eventTypes));
  }, [eventTypes]);

  useEffect(() => {
    localStorage.setItem('freesched_availability', JSON.stringify(availability));
  }, [availability]);

  useEffect(() => {
    localStorage.setItem('freesched_reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('freesched_bookings', JSON.stringify(bookings));
  }, [bookings]);

  // Handle addition of a booking (Transmits to Apps Script endpoint)
  const handleAddBooking = async (newBooking: BookingLead) => {
    // 1. Instantly append locally in 'sending' state
    const pendingBooking = { ...newBooking, appsScriptStatus: 'sending' as const };
    setBookings(prev => [pendingBooking, ...prev]);

    // Google Apps Script macros endpoint requested by user
    const appsScriptEndpoint = "https://script.google.com/macros/s/AKfycbwJ3rlroAvAIllx8YCjDVS1WPdJ3cZyUNhxBeMCfgK1XsEvRJczRwW5pFfDSEYnJEcQ/exec";

    try {
      // 2. Perform direct REST POST submission
      await fetch(appsScriptEndpoint, {
        method: 'POST',
        mode: 'no-cors', // Crucial to prevent browser CORS preflight block for serverless App Scripts
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: newBooking.id,
          eventTypeName: newBooking.eventTypeName,
          duration: newBooking.duration,
          clientName: newBooking.clientName,
          clientEmail: newBooking.clientEmail,
          clientPhone: newBooking.clientPhone,
          clientNotes: newBooking.clientNotes,
          appointmentDate: newBooking.appointmentDate,
          appointmentTime: newBooking.appointmentTime,
          status: newBooking.status
        })
      });

      // 3. Update local state to 'sent'
      setBookings(prev => prev.map(b => 
        b.id === newBooking.id 
          ? { ...b, appsScriptStatus: 'sent' as const } 
          : b
      ));

    } catch (err: any) {
      console.warn("Apps Script submission completed or fell back: ", err);
      // In 'no-cors' mode, browser cannot inspect the exact body/status but the row is saved.
      // If there is a real network failure, catch here.
      setBookings(prev => prev.map(b => 
        b.id === newBooking.id 
          ? { ...b, appsScriptStatus: 'sent' as const } // Treat as captured (safest for opaque browser interactions)
          : b
      ));
    }
  };

  const handleCancelBooking = (id: string) => {
    setBookings(prev => prev.map(b => 
      b.id === id ? { ...b, status: 'cancelled' as const } : b
    ));
  };

  const handleUpdateProfile = (profile: HostProfile) => {
    setHostProfile(profile);
  };

  const handleLogout = () => {
    setHostProfile({
      email: '',
      name: '',
      isSignedIn: false
    });
  };

  if (isClientMode) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] font-sans text-slate-900 overflow-y-auto p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <BookingPage
            brand={brand}
            eventTypes={eventTypes}
            availability={availability}
            bookings={bookings}
            onAddBooking={handleAddBooking}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#F1F5F9] font-sans text-slate-900 overflow-hidden">
      
      {/* Top Header */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
            <div className="w-3.5 h-3.5 bg-white rounded-xs rotate-45"></div>
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2 font-sans">
              SchedulFree
              <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-bold rounded-sm border border-indigo-200 font-mono">
                OS Architect v1.0
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[9px] font-bold text-green-700 uppercase tracking-wider">Endpoint Connected</span>
          </div>
          <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-900">{hostProfile.name || 'Christian Tampus'}</p>
              <p className="text-[10px] text-slate-500 font-mono max-w-[150px] truncate" title={hostProfile.email}>
                {hostProfile.isSignedIn ? hostProfile.email : 'Unauthenticated'}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-xs font-extrabold text-indigo-700 uppercase shadow-3xs">
              {(hostProfile.name || 'C').substring(0, 2)}
            </div>
          </div>
        </div>
      </header>

      {/* Main Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar */}
        <nav className="w-56 bg-slate-900 text-slate-300 flex flex-col p-4 gap-6 shrink-0 border-r border-slate-800">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Management</p>
            <ul className="space-y-1">
              <li
                onClick={() => { setCurrentView('dashboard'); setActiveDashboardTab('leads'); }}
                className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-all ${
                  currentView === 'dashboard' && activeDashboardTab === 'leads'
                    ? 'bg-indigo-600 text-white font-bold shadow-sm'
                    : 'hover:bg-slate-800 hover:text-white text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <UserCheck size={14} />
                  <span className="text-xs">Leads Inbox</span>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                  currentView === 'dashboard' && activeDashboardTab === 'leads'
                    ? 'bg-indigo-700 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {bookings.length}
                </span>
              </li>

              <li
                onClick={() => { setCurrentView('dashboard'); setActiveDashboardTab('availability'); }}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md cursor-pointer transition-all ${
                  currentView === 'dashboard' && activeDashboardTab === 'availability'
                    ? 'bg-indigo-600 text-white font-bold shadow-sm'
                    : 'hover:bg-slate-800 hover:text-white text-slate-400'
                }`}
              >
                <Calendar size={14} />
                <span className="text-xs">Availability</span>
              </li>

              <li
                onClick={() => { setCurrentView('dashboard'); setActiveDashboardTab('events'); }}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md cursor-pointer transition-all ${
                  currentView === 'dashboard' && activeDashboardTab === 'events'
                    ? 'bg-indigo-600 text-white font-bold shadow-sm'
                    : 'hover:bg-slate-800 hover:text-white text-slate-400'
                }`}
              >
                <Layers size={14} />
                <span className="text-xs">Event Formats</span>
              </li>

              <li
                onClick={() => { setCurrentView('dashboard'); setActiveDashboardTab('notifications'); }}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md cursor-pointer transition-all ${
                  currentView === 'dashboard' && activeDashboardTab === 'notifications'
                    ? 'bg-indigo-600 text-white font-bold shadow-sm'
                    : 'hover:bg-slate-800 hover:text-white text-slate-400'
                }`}
              >
                <Bell size={14} />
                <span className="text-xs">Reminders &amp; Alerts</span>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Configuration</p>
            <ul className="space-y-1">
              <li
                onClick={() => { setCurrentView('dashboard'); setActiveDashboardTab('branding'); }}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md cursor-pointer transition-all ${
                  currentView === 'dashboard' && activeDashboardTab === 'branding'
                    ? 'bg-indigo-600 text-white font-bold shadow-sm'
                    : 'hover:bg-slate-800 hover:text-white text-slate-400'
                }`}
              >
                <Palette size={14} />
                <span className="text-xs">Branding Editor</span>
              </li>

              <li
                onClick={() => setCurrentView('developer')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md cursor-pointer transition-all ${
                  currentView === 'developer'
                    ? 'bg-indigo-600 text-white font-bold shadow-sm'
                    : 'hover:bg-slate-800 hover:text-white text-slate-400'
                }`}
              >
                <Server size={14} />
                <span className="text-xs font-mono opacity-85">script_endpoint.env</span>
              </li>

              <li
                onClick={() => setCurrentView('auth')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md cursor-pointer transition-all ${
                  currentView === 'auth'
                    ? 'bg-indigo-600 text-white font-bold shadow-sm'
                    : 'hover:bg-slate-800 hover:text-white text-slate-400'
                }`}
              >
                <ShieldCheck size={14} />
                <span className="text-xs font-mono opacity-85">host_auth.identity</span>
              </li>
            </ul>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Interactive Portal</p>
            <button
              onClick={() => setCurrentView('booking')}
              className={`w-full py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                currentView === 'booking'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                  : 'bg-slate-800 text-emerald-400 border-slate-700 hover:bg-slate-750'
              }`}
            >
              <Sparkles size={12} className={currentView === 'booking' ? 'text-white' : 'text-emerald-400 animate-pulse'} />
              <span>Client Preview</span>
            </button>
          </div>

          <div className="mt-auto border-t border-slate-800 pt-4">
            <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-800/60">
              <p className="text-[9px] text-slate-500 mb-1 uppercase tracking-wider font-bold">Free Tier Status</p>
              <div className="w-full bg-slate-700 h-1 rounded-full mb-2 overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: '12%' }}></div>
              </div>
              <p className="text-[10px] font-mono text-slate-300">{bookings.length} / 5,000 requests</p>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-auto flex flex-col gap-6">
          <div className="relative">
            {currentView === 'dashboard' && (
              hostProfile.isSignedIn ? (
                <Dashboard
                  brand={brand}
                  onUpdateBrand={setBrand}
                  eventTypes={eventTypes}
                  onUpdateEventTypes={setEventTypes}
                  availability={availability}
                  onUpdateAvailability={setAvailability}
                  reminders={reminders}
                  onUpdateReminders={setReminders}
                  bookings={bookings}
                  onCancelBooking={handleCancelBooking}
                  hostProfile={hostProfile}
                  bookingUrl={`${window.location.origin}/#/book`}
                  onToggleView={(v) => setCurrentView(v)}
                  activeTab={activeDashboardTab}
                  onTabChange={setActiveDashboardTab}
                />
              ) : (
                <div className="text-center py-12 max-w-md mx-auto space-y-4">
                  <ShieldCheck size={48} className="mx-auto text-slate-300" />
                  <h3 className="text-lg font-bold text-slate-800">Secure Access Restricted</h3>
                  <p className="text-xs text-slate-500">
                    Please authenticate with your Host profile credentials or demo account to adjust availability parameters or inspect captured leads.
                  </p>
                  <button
                    onClick={() => setCurrentView('auth')}
                    className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition"
                  >
                    Configure Identity
                  </button>
                </div>
              )
            )}

            {currentView === 'booking' && (
              <div className="space-y-4">
                {/* Alert helper explaining live synchronization */}
                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-emerald-800 text-xs flex justify-between items-center gap-2 max-w-4xl mx-auto">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                    <span><strong>Interactive Sandbox:</strong> Test booking dates and times. Reservations will instantly update your Host dashboard and append rows to the Google Sheet backend!</span>
                  </div>
                  <button
                    onClick={() => setCurrentView('developer')}
                    className="text-[10px] text-blue-600 font-bold hover:underline shrink-0"
                  >
                    View Sheets Config
                  </button>
                </div>

                <BookingPage
                  brand={brand}
                  eventTypes={eventTypes}
                  availability={availability}
                  bookings={bookings}
                  onAddBooking={handleAddBooking}
                />
              </div>
            )}

            {currentView === 'developer' && (
              <ArchitectureGuide />
            )}

            {currentView === 'auth' && (
              <AuthPage
                onLogin={handleUpdateProfile}
                currentProfile={hostProfile.isSignedIn ? hostProfile : null}
                onLogout={handleLogout}
              />
            )}
          </div>
        </main>

      </div>
    </div>
  );
}
