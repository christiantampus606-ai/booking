import React, { useState } from 'react';
import { BrandSettings, EventType, AvailabilitySlot, ReminderSetting, BookingLead, HostProfile } from '../types';
import { Palette, Calendar, Clock, Bell, Users, Download, Plus, Trash2, Globe, Sparkles, Check, RefreshCw, Send, AlertCircle, Save } from 'lucide-react';

interface DashboardProps {
  brand: BrandSettings;
  onUpdateBrand: (updated: BrandSettings) => void;
  eventTypes: EventType[];
  onUpdateEventTypes: (updated: EventType[]) => void;
  availability: AvailabilitySlot[];
  onUpdateAvailability: (updated: AvailabilitySlot[]) => void;
  reminders: ReminderSetting[];
  onUpdateReminders: (updated: ReminderSetting[]) => void;
  bookings: BookingLead[];
  onCancelBooking: (id: string) => void;
  hostProfile: HostProfile;
  bookingUrl: string;
  onToggleView: (view: 'dashboard' | 'booking') => void;
  activeTab?: 'leads' | 'branding' | 'events' | 'availability' | 'notifications';
  onTabChange?: (tab: 'leads' | 'branding' | 'events' | 'availability' | 'notifications') => void;
}

export default function Dashboard({
  brand,
  onUpdateBrand,
  eventTypes,
  onUpdateEventTypes,
  availability,
  onUpdateAvailability,
  reminders,
  onUpdateReminders,
  bookings,
  onCancelBooking,
  hostProfile,
  bookingUrl,
  onToggleView,
  activeTab: externalActiveTab,
  onTabChange,
}: DashboardProps) {
  const [localTab, setLocalTab] = useState<'leads' | 'branding' | 'events' | 'availability' | 'notifications'>('leads');
  const activeTab = externalActiveTab !== undefined ? externalActiveTab : localTab;
  const setActiveTab = onTabChange !== undefined ? onTabChange : setLocalTab;
  const [savedMessage, setSavedMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Branding states
  const [brandName, setBrandName] = useState(brand.name);
  const [logoType, setLogoType] = useState(brand.logoType);
  const [logoValue, setLogoValue] = useState(brand.logoValue);
  const [brandColor, setBrandColor] = useState(brand.color);
  const [brandTypography, setBrandTypography] = useState(brand.typography);
  const [welcomeMessage, setWelcomeMessage] = useState(brand.welcomeMessage);

  // Reminders states
  const [newReminderValue, setNewReminderValue] = useState(1);
  const [newReminderUnit, setNewReminderUnit] = useState<'minutes' | 'hours' | 'days'>('hours');

  // Event creation states
  const [newEventName, setNewEventName] = useState('');
  const [newEventDuration, setNewEventDuration] = useState(30);
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventColor, setNewEventColor] = useState('emerald');

  const showSavedNotification = (msg = 'Configuration saved!') => {
    setSavedMessage(msg);
    setTimeout(() => setSavedMessage(''), 3000);
  };

  // 1. Branding Save
  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBrand({
      name: brandName.trim(),
      logoType,
      logoValue: logoValue.trim(),
      color: brandColor,
      typography: brandTypography,
      welcomeMessage: welcomeMessage.trim()
    });
    showSavedNotification('Branding rules updated successfully!');
  };

  // 2. Add New Event Type
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventName) return;
    const newEvent: EventType = {
      id: 'ev_' + Math.random().toString(36).substr(2, 9),
      name: newEventName.trim(),
      duration: newEventDuration,
      description: newEventDesc.trim(),
      color: newEventColor,
      isActive: true
    };
    onUpdateEventTypes([...eventTypes, newEvent]);
    setNewEventName('');
    setNewEventDesc('');
    showSavedNotification('New appointment type registered!');
  };

  // Toggle Event Active state
  const handleToggleEvent = (id: string) => {
    const updated = eventTypes.map(ev => 
      ev.id === id ? { ...ev, isActive: !ev.isActive } : ev
    );
    onUpdateEventTypes(updated);
    showSavedNotification('Meeting status updated.');
  };

  // Delete Event
  const handleDeleteEvent = (id: string) => {
    onUpdateEventTypes(eventTypes.filter(ev => ev.id !== id));
    showSavedNotification('Meeting type removed.');
  };

  // 3. Update Availability day parameters
  const handleToggleDay = (dayIndex: number) => {
    const updated = availability.map(item => 
      item.dayOfWeek === dayIndex ? { ...item, enabled: !item.enabled } : item
    );
    onUpdateAvailability(updated);
    showSavedNotification('Availability calendar adjusted.');
  };

  const handleTimeChange = (dayIndex: number, field: 'startTime' | 'endTime', value: string) => {
    const updated = availability.map(item => 
      item.dayOfWeek === dayIndex ? { ...item, [field]: value } : item
    );
    onUpdateAvailability(updated);
  };

  // 4. Notifications & Reminders
  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    const newRem: ReminderSetting = {
      id: 'rem_' + Math.random().toString(36).substr(2, 9),
      timeValue: newReminderValue,
      timeUnit: newReminderUnit,
      enabled: true
    };
    onUpdateReminders([...reminders, newRem]);
    showSavedNotification('Reminder interval added.');
  };

  const handleToggleReminder = (id: string) => {
    const updated = reminders.map(rem => 
      rem.id === id ? { ...rem, enabled: !rem.enabled } : rem
    );
    onUpdateReminders(updated);
  };

  const handleDeleteReminder = (id: string) => {
    onUpdateReminders(reminders.filter(rem => rem.id !== id));
  };

  // 5. Leads Export CSV Generator
  const handleExportCSV = () => {
    if (bookings.length === 0) return;
    
    // Column headers
    const headers = ['Booking ID', 'Client Name', 'Client Email', 'Client Phone', 'Event Type', 'Duration (Mins)', 'Appointment Date', 'Appointment Time', 'Created At', 'Status', 'Sheets DB Sync'];
    
    const rows = bookings.map(b => [
      b.id,
      b.clientName,
      b.clientEmail,
      b.clientPhone,
      b.eventTypeName,
      b.duration,
      b.appointmentDate,
      b.appointmentTime,
      b.createdAt,
      b.status,
      b.appsScriptStatus
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `booking_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate stats
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const syncSuccess = bookings.filter(b => b.appsScriptStatus === 'sent').length;

  return (
    <div className="space-y-6 font-sans">
      
      {/* Alert message */}
      {savedMessage && (
        <div className="fixed bottom-4 right-4 z-50 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-800 flex items-center gap-2 text-xs">
          <Check size={14} className="text-emerald-400" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Overview stats panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-3xs flex justify-between items-center transition-all hover:border-slate-300">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-sans">Total Leads</span>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight font-sans">{totalBookings}</h3>
            <p className="text-[9px] text-slate-400 font-mono">Captured via free stack</p>
          </div>
          <div className="w-9 h-9 rounded-md bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-100">
            <Users size={16} />
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-3xs flex justify-between items-center transition-all hover:border-slate-300">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-sans">Availability Status</span>
            <h3 className="text-xl font-extrabold text-emerald-600 tracking-tight font-sans">
              {availability.filter(a => a.enabled).length} Days Active
            </h3>
            <p className="text-[9px] text-slate-400 font-mono">100% Client self-service</p>
          </div>
          <div className="w-9 h-9 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <Calendar size={16} />
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-3xs flex justify-between items-center transition-all hover:border-slate-300">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-sans">Endpoint Sync</span>
            <h3 className="text-xl font-extrabold text-blue-600 tracking-tight font-sans">
              {totalBookings > 0 ? Math.round((syncSuccess / totalBookings) * 100) : 100}% Rate
            </h3>
            <p className="text-[9px] text-slate-400 font-mono truncate max-w-[130px]">{syncSuccess} synced rows</p>
          </div>
          <div className="w-9 h-9 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <RefreshCw size={14} className={totalBookings > 0 && syncSuccess < totalBookings ? "animate-spin" : ""} />
          </div>
        </div>

        {/* Link box with click-to-copy */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-3xs flex flex-col justify-between transition-all hover:border-slate-300">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] text-indigo-600 uppercase tracking-widest font-bold font-sans">Booking Page Link</span>
            <Globe size={14} className="text-indigo-500" />
          </div>
          <div className="space-y-2">
            <input
              type="text"
              readOnly
              value={bookingUrl}
              className="w-full bg-slate-50 text-[10px] text-slate-600 font-mono px-2 py-1.5 border border-slate-200 rounded focus:outline-none select-all"
            />
            <button
              onClick={handleCopyLink}
              className={`w-full py-1.5 px-3 rounded text-[11px] font-bold flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                copied
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {copied ? (
                <>
                  <Check size={13} />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  <span>Copy Booking Link</span>
                </>
              )}
            </button>
            <div className="bg-emerald-50/50 border border-emerald-100 p-2.5 rounded text-[10px] text-slate-600 space-y-1 mt-1">
              <span className="font-bold text-emerald-800 block flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                Vercel 404 Solved!
              </span>
              <p className="leading-relaxed">
                The copied booking link is now structured as <code className="bg-emerald-100/50 text-emerald-800 px-1 py-0.5 rounded font-mono font-bold text-[9.5px]">/#/book</code>. This guarantees it works beautifully on static hosts like Vercel, Netlify, and GitHub Pages without throwing 404 errors!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      {externalActiveTab === undefined && (
        <div className="border-b border-slate-100 flex overflow-x-auto gap-1 pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('leads')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'leads' ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Leads Inbox ({totalBookings})
          </button>
          <button
            onClick={() => setActiveTab('branding')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'branding' ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Custom Branding
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'events' ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Event Formats
          </button>
          <button
            onClick={() => setActiveTab('availability')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'availability' ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Availability Scheduler
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'notifications' ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Reminders &amp; Alerts
          </button>
        </div>
      )}

      {/* TAB PANEL CONTENT */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-3xs">

        {/* LEADS PANEL */}
        {activeTab === 'leads' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-slate-900">Captured Booking Leads</h3>
                <p className="text-xs text-slate-500">A detailed ledger of leads captured and synced to your Google Apps Script database.</p>
              </div>
              {bookings.length > 0 && (
                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-3xs cursor-pointer"
                >
                  <Download size={14} /> Export leads to CSV
                </button>
              )}
            </div>

            {bookings.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-slate-100 rounded-xl space-y-2">
                <Users className="text-slate-300 mx-auto" size={32} />
                <p className="text-xs font-semibold text-slate-700">No appointments captured yet.</p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  Share your Booking Page link with potential clients. Once booked, client details populate here in real-time.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-100 rounded-xl bg-white shadow-3xs">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">Contact</th>
                      <th className="p-4">Event Details</th>
                      <th className="p-4">Reserved Date &amp; Time</th>
                      <th className="p-4">Sheets Database Status</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings.map(book => (
                      <tr key={book.id} className="hover:bg-slate-50/50 transition">
                        <td className="p-4">
                          <div className="font-semibold text-slate-800">{book.clientName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{book.clientEmail}</div>
                          <div className="text-[10px] text-slate-500">{book.clientPhone}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-slate-700">{book.eventTypeName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{book.duration} Mins</div>
                          {book.clientNotes && (
                            <div className="mt-1 text-[11px] text-slate-500 italic bg-slate-100/50 p-1.5 rounded border border-slate-100 max-w-xs truncate" title={book.clientNotes}>
                              "{book.clientNotes}"
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-slate-900">{book.appointmentDate}</div>
                          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                            <Clock size={11} /> {book.appointmentTime}
                          </div>
                        </td>
                        <td className="p-4">
                          {book.appsScriptStatus === 'sent' ? (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-full font-semibold text-[10px] inline-flex items-center gap-1">
                              ● Recorded (Sheets ID)
                            </span>
                          ) : book.appsScriptStatus === 'sending' ? (
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-100 rounded-full font-semibold text-[10px] inline-flex items-center gap-1 animate-pulse">
                              ● Transferring...
                            </span>
                          ) : book.appsScriptStatus === 'failed' ? (
                            <div className="space-y-0.5">
                              <span className="px-2 py-0.5 bg-rose-50 text-rose-800 border border-rose-100 rounded-full font-semibold text-[10px] inline-flex items-center gap-1">
                                ● Send Failed
                              </span>
                              <div className="text-[9px] text-rose-600 font-mono truncate max-w-[150px]">{book.appsScriptError}</div>
                            </div>
                          ) : (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-full font-semibold text-[10px] inline-flex items-center gap-1">
                              ● Offline Mode
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {book.status === 'cancelled' ? (
                            <span className="text-slate-400 text-[10px] italic">Cancelled</span>
                          ) : (
                            <button
                              onClick={() => onCancelBooking(book.id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Cancel appointment"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* BRANDING PANEL */}
        {activeTab === 'branding' && (
          <form onSubmit={handleSaveBranding} className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">Customize Client Branding</h3>
              <p className="text-xs text-slate-500">Inject custom aesthetics into the calendar scheduler. Changes propagate to visitors immediately.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Branding fields */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Host Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 outline-none transition"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block">Logo Presentation Type</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setLogoType('emoji'); setLogoValue('📅'); }}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg border transition ${
                        logoType === 'emoji' ? 'bg-slate-900 text-white' : 'bg-transparent text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      Emoji Icon Preset
                    </button>
                    <button
                      type="button"
                      onClick={() => { setLogoType('url'); setLogoValue('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80'); }}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg border transition ${
                        logoType === 'url' ? 'bg-slate-900 text-white' : 'bg-transparent text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      Image Logo URL
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">
                    {logoType === 'emoji' ? 'Select Emoji Presets' : 'Logo Vector Image URL'}
                  </label>
                  {logoType === 'emoji' ? (
                    <div className="flex gap-1.5 overflow-x-auto py-1 scrollbar-none">
                      {['📅', '💼', '🚀', '🌟', '🎯', '👩‍💻', '☕', '📈'].map(em => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => setLogoValue(em)}
                          className={`w-9 h-9 rounded-lg border text-base flex items-center justify-center transition-all ${
                            logoValue === em ? 'border-slate-900 bg-slate-50 font-bold scale-105' : 'border-slate-200/80 hover:border-slate-300'
                          }`}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="url"
                      value={logoValue}
                      onChange={(e) => setLogoValue(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 outline-none transition font-mono"
                    />
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Typography Mood Pairings</label>
                  <select
                    value={brandTypography}
                    onChange={(e) => setBrandTypography(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 outline-none transition"
                  >
                    <option value="sans">Modern Sans (Inter) - Neutral &amp; Accessible</option>
                    <option value="display">Tech Display (Space Grotesk) - Futuristic &amp; Direct</option>
                    <option value="serif">Editorial Serif (Playfair Display) - Premium &amp; Classic</option>
                    <option value="mono">Developer Mono (JetBrains Mono) - Systematic &amp; Precise</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Welcome Greeting message</label>
                  <textarea
                    rows={2}
                    value={welcomeMessage}
                    onChange={(e) => setWelcomeMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 outline-none transition resize-none"
                  />
                </div>
              </div>

              {/* Theme color custom and preview */}
              <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Interactive Visual Accent Color</span>
                
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { hex: '#2563eb', name: 'Blue (Standard)' },
                    { hex: '#10b981', name: 'Emerald (Fresh)' },
                    { hex: '#8b5cf6', name: 'Purple (Creative)' },
                    { hex: '#f59e0b', name: 'Amber (Warm)' },
                    { hex: '#e11d48', name: 'Rose (Professional)' },
                  ].map(color => (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => setBrandColor(color.hex)}
                      className={`h-12 rounded-xl flex flex-col items-center justify-center relative border text-[9px] font-semibold ${
                        brandColor === color.hex ? 'border-slate-900 bg-white shadow-2xs' : 'border-slate-200 bg-transparent'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full block mb-1" style={{ backgroundColor: color.hex }} />
                      <span className="text-[8px] text-slate-500 font-mono truncate max-w-[50px]">{color.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>

                {/* Simulated preview widget */}
                <div className="border border-slate-200/80 rounded-xl bg-white p-4 space-y-3 shadow-3xs mt-6">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Client portal preview snippet</span>
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-sm">{logoType === 'emoji' ? logoValue : '🖼️'}</span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{brandName || 'Untitled'}</h4>
                      <p className="text-[10px] text-slate-500">Scheduler Portal</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      style={{ backgroundColor: brandColor }}
                      className="flex-1 py-1.5 text-white text-[10px] font-semibold rounded-lg shadow-3xs"
                    >
                      Book Session
                    </button>
                    <button
                      type="button"
                      className="flex-1 py-1.5 border border-slate-200 text-slate-600 text-[10px] font-medium rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2.5 bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-3xs cursor-pointer"
            >
              <Save size={14} /> Update Portal Branding Setup
            </button>
          </form>
        )}

        {/* EVENT TYPES PANEL */}
        {activeTab === 'events' && (
          <div className="space-y-8">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">Configure Appointment Templates</h3>
              <p className="text-xs text-slate-500">Add or alter different appointment intervals that customers can select from your Calendly interface.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Event Types List */}
              <div className="lg:col-span-7 space-y-3">
                {eventTypes.map(event => (
                  <div
                    key={event.id}
                    className={`p-4 rounded-xl border flex justify-between items-start transition ${
                      event.isActive ? 'bg-white border-slate-200/80 shadow-3xs' : 'bg-slate-50 border-slate-200/40 opacity-70'
                    }`}
                  >
                    <div className="flex gap-3 items-start">
                      <span className="w-3.5 h-3.5 rounded-full mt-1 shrink-0" style={{
                        backgroundColor: event.color === 'emerald' ? '#10b981' : event.color === 'sky' ? '#0ea5e9' : event.color === 'violet' ? '#8b5cf6' : '#64748b'
                      }} />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-800 text-xs">{event.name}</h4>
                          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 font-mono text-[9px] rounded-sm">
                            {event.duration} Mins
                          </span>
                        </div>
                        <p className="text-slate-500 text-[11px] leading-relaxed max-w-md">{event.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleEvent(event.id)}
                        className={`px-2 py-1 rounded text-[9px] font-bold border transition ${
                          event.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {event.isActive ? 'Active' : 'Disabled'}
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        disabled={eventTypes.length === 1}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Event creation form */}
              <form onSubmit={handleAddEvent} className="lg:col-span-5 bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Add Custom Event format</span>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Meeting Agenda Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1-on-1 Business Strategy Session"
                    value={newEventName}
                    onChange={(e) => setNewEventName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 outline-none transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Duration interval *</label>
                  <select
                    value={newEventDuration}
                    onChange={(e) => setNewEventDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 outline-none transition"
                  >
                    <option value={15}>15 Minutes Consultation</option>
                    <option value={30}>30 Minutes Briefing</option>
                    <option value={45}>45 Minutes Assessment</option>
                    <option value={60}>60 Minutes Intensive session</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Visual Badge Color</label>
                  <div className="flex gap-2">
                    {[
                      { key: 'emerald', bg: 'bg-emerald-500' },
                      { key: 'sky', bg: 'bg-sky-500' },
                      { key: 'violet', bg: 'bg-violet-500' },
                    ].map(col => (
                      <button
                        key={col.key}
                        type="button"
                        onClick={() => setNewEventColor(col.key)}
                        className={`w-7 h-7 rounded-full ${col.bg} transition-all border flex items-center justify-center ${
                          newEventColor === col.key ? 'border-slate-900 ring-2 ring-slate-900/10' : 'border-transparent'
                        }`}
                      >
                        {newEventColor === col.key && <Check size={12} className="text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Format Description</label>
                  <textarea
                    rows={2}
                    placeholder="A quick summary outlining the scope of this meeting..."
                    value={newEventDesc}
                    onChange={(e) => setNewEventDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 outline-none transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} /> Add Agenda Format
                </button>
              </form>
            </div>
          </div>
        )}

        {/* AVAILABILITY PANEL */}
        {activeTab === 'availability' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">Define Host Availability</h3>
              <p className="text-xs text-slate-500">Configure which days of the week and hour frames you are accepting bookings. Out-of-bounds days are blocked in the customer calendar.</p>
            </div>

            <div className="space-y-3 max-w-2xl">
              {availability.map(slot => {
                const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][slot.dayOfWeek];
                return (
                  <div
                    key={slot.dayOfWeek}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition ${
                      slot.enabled ? 'bg-white border-slate-200 shadow-3xs' : 'bg-slate-50/50 border-slate-200/40 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleDay(slot.dayOfWeek)}
                        className={`w-10 py-1 rounded-md text-center text-xs font-bold border transition ${
                          slot.enabled
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-transparent text-slate-400 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {slot.enabled ? 'On' : 'Off'}
                      </button>
                      <span className="text-xs font-bold text-slate-800">{dayName}</span>
                    </div>

                    {slot.enabled ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => handleTimeChange(slot.dayOfWeek, 'startTime', e.target.value)}
                          className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-slate-900"
                        />
                        <span className="text-slate-400 text-xs">—</span>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => handleTimeChange(slot.dayOfWeek, 'endTime', e.target.value)}
                          className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-slate-900"
                        />
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px] italic">Not Accepting Reservations</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* NOTIFICATIONS & REMINDERS PANEL */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">Email Confirmation &amp; Reminders Config</h3>
              <p className="text-xs text-slate-500">Configure triggered alerts sent to both host and client upon confirmation, plus automated intervals.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              
              {/* Reminders list */}
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Configured Reminder Intervals</span>
                
                <div className="space-y-2">
                  {reminders.map(rem => (
                    <div key={rem.id} className="p-3 bg-white border border-slate-200 rounded-xl flex justify-between items-center shadow-3xs">
                      <div className="flex items-center gap-2">
                        <Bell size={14} className="text-slate-500 animate-swing" />
                        <span className="text-xs font-semibold text-slate-700">
                          {rem.timeValue} {rem.timeUnit === 'minutes' ? 'Minutes' : rem.timeUnit === 'hours' ? 'Hours' : 'Days'} before event
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleReminder(rem.id)}
                          className={`px-1.5 py-0.5 rounded text-[8px] font-bold border transition ${
                            rem.enabled ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'
                          }`}
                        >
                          {rem.enabled ? 'Active' : 'Muted'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteReminder(rem.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add new interval */}
                <form onSubmit={handleAddReminder} className="p-4 bg-slate-50 rounded-xl border border-slate-100/80 flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 flex gap-2">
                    <input
                      type="number"
                      required
                      min={1}
                      value={newReminderValue}
                      onChange={(e) => setNewReminderValue(Number(e.target.value))}
                      className="w-16 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-slate-900 font-bold"
                    />
                    <select
                      value={newReminderUnit}
                      onChange={(e) => setNewReminderUnit(e.target.value as any)}
                      className="flex-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-slate-900"
                    >
                      <option value="minutes">Minutes</option>
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="py-1 px-3 bg-slate-950 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition"
                  >
                    Add Interval
                  </button>
                </form>
              </div>

              {/* Email templates simulated logs */}
              <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl space-y-4">
                <span className="px-2 py-0.5 bg-white/10 text-white text-[9px] font-bold rounded-md border border-white/10 flex items-center gap-1 inline-flex">
                  <Send size={10} /> Real-Time Trigger Log
                </span>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-200">Triggered Booking Confirmation Template</h4>
                  <p className="text-[10px] text-slate-400">This payload template executes on host/client mail servers immediately upon client confirmation.</p>
                </div>

                <div className="border border-white/5 rounded-xl p-3 bg-black/40 space-y-1.5 text-[10px] font-mono leading-relaxed">
                  <div><span className="text-slate-500">From:</span> auto-scheduler@free-system.org</div>
                  <div><span className="text-slate-500">To:</span> client@email.com, host@email.com</div>
                  <div><span className="text-slate-500">Subject:</span> Appointment Confirmed: Strategy Session</div>
                  <div className="text-emerald-400 mt-2 bg-emerald-950/20 p-2 rounded border border-emerald-900/30">
                    "Hi [Client], Christian Tampus has confirmed your Strategy Session appointment for [Selected Date] at [Selected Time]. Reminders will trigger at your custom intervals."
                  </div>
                </div>

                <div className="flex gap-2 text-[9px] text-slate-400">
                  <AlertCircle size={12} className="text-slate-400 shrink-0" />
                  <span>Free SMTP integrations (like SendGrid free or Google Gmail Apps Script MailApp) are recommended to broadcast actual SMTP.</span>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
