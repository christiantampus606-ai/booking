import React, { useState, useMemo } from 'react';
import { BrandSettings, EventType, AvailabilitySlot, BookingLead } from '../types';
import { Calendar, Clock, ChevronLeft, ChevronRight, User, Mail, Phone, CheckCircle, MessageSquare, AlertCircle, Loader2 } from 'lucide-react';

interface BookingPageProps {
  brand: BrandSettings;
  eventTypes: EventType[];
  availability: AvailabilitySlot[];
  bookings: BookingLead[];
  onAddBooking: (newBooking: BookingLead) => Promise<void>;
}

export default function BookingPage({ brand, eventTypes, availability, bookings, onAddBooking }: BookingPageProps) {
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(
    eventTypes.filter(e => e.isActive)[0] || null
  );
  
  // Date selection states
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justBooked, setJustBooked] = useState<BookingLead | null>(null);
  const [submitError, setSubmitError] = useState('');

  // Apply custom typography class based on brand settings
  const typographyClass = useMemo(() => {
    switch (brand.typography) {
      case 'display': return 'font-display';
      case 'serif': return 'font-serif';
      case 'mono': return 'font-mono';
      default: return 'font-sans';
    }
  }, [brand.typography]);

  // Check if a day of the week is enabled by host availability
  const isDayAvailable = (date: Date) => {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const rule = availability.find(r => r.dayOfWeek === dayOfWeek);
    return rule ? rule.enabled : false;
  };

  // Generate calendar grid for currentMonth
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday...
    const totalDays = lastDayOfMonth.getDate();

    const days: (Date | null)[] = [];

    // Pad leading empty cells
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // Add actual days
    for (let d = 1; d <= totalDays; d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  }, [currentMonth]);

  // Generate availability slots for the selected date
  const availableSlots = useMemo(() => {
    if (!selectedDate || !selectedEventType) return [];

    const dayOfWeek = selectedDate.getDay();
    const rule = availability.find(r => r.dayOfWeek === dayOfWeek && r.enabled);
    if (!rule) return [];

    // Parse start and end times
    const [startHour, startMin] = rule.startTime.split(':').map(Number);
    const [endHour, endMin] = rule.endTime.split(':').map(Number);

    const startTotalMins = startHour * 60 + startMin;
    const endTotalMins = endHour * 60 + endMin;

    const slots: string[] = [];
    let currentTotalMins = startTotalMins;

    const formattedSelectedDate = selectedDate.toISOString().split('T')[0];

    while (currentTotalMins + selectedEventType.duration <= endTotalMins) {
      const hour = Math.floor(currentTotalMins / 60);
      const min = currentTotalMins % 60;
      const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;

      // Check if this slot is already booked for this specific date
      const isAlreadyBooked = bookings.some(b => 
        b.appointmentDate === formattedSelectedDate && 
        b.appointmentTime === timeStr && 
        b.status !== 'cancelled'
      );

      if (!isAlreadyBooked) {
        slots.push(timeStr);
      }

      currentTotalMins += selectedEventType.duration;
    }

    return slots;
  }, [selectedDate, selectedEventType, availability, bookings]);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !selectedEventType) return;
    if (!name || !email || !phone) {
      setSubmitError('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    const bookingDateStr = selectedDate.toISOString().split('T')[0];

    const newBooking: BookingLead = {
      id: 'bk_' + Math.random().toString(36).substr(2, 9),
      eventTypeId: selectedEventType.id,
      eventTypeName: selectedEventType.name,
      duration: selectedEventType.duration,
      clientName: name.trim(),
      clientEmail: email.trim().toLowerCase(),
      clientPhone: phone.trim(),
      clientNotes: notes.trim(),
      appointmentDate: bookingDateStr,
      appointmentTime: selectedTime,
      createdAt: new Date().toISOString(),
      status: 'confirmed',
      appsScriptStatus: 'idle'
    };

    try {
      await onAddBooking(newBooking);
      setJustBooked(newBooking);
    } catch (err: any) {
      setSubmitError(err.message || 'Error occurred during registration submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetBookingState = () => {
    setJustBooked(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setName('');
    setEmail('');
    setPhone('');
    setNotes('');
  };

  // Success Confirmation screen
  if (justBooked) {
    return (
      <div className={`max-w-xl mx-auto bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center ${typographyClass}`}>
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle size={36} />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-display">Booking Confirmed!</h2>
        <p className="text-slate-500 text-sm mt-2">
          An invitation and calendar details have been dispatched. Here is your reservation checklist.
        </p>

        {/* Lead specs */}
        <div className="mt-8 bg-slate-50 border border-slate-100 rounded-xl p-5 text-left space-y-3">
          <div className="flex justify-between items-start pb-2 border-b border-slate-200/60">
            <span className="text-xs text-slate-500 font-medium">Meeting Agenda</span>
            <span className="text-xs font-semibold text-slate-800 text-right">{justBooked.eventTypeName}</span>
          </div>
          <div className="flex justify-between items-start pb-2 border-b border-slate-200/60">
            <span className="text-xs text-slate-500 font-medium">Reserved Host</span>
            <span className="text-xs font-semibold text-slate-800 text-right">{brand.name}</span>
          </div>
          <div className="flex justify-between items-start pb-2 border-b border-slate-200/60">
            <span className="text-xs text-slate-500 font-medium">Date &amp; Slot</span>
            <span className="text-xs font-bold text-slate-900 text-right">
              {justBooked.appointmentDate} at {justBooked.appointmentTime}
            </span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-500 font-medium font-mono">Google Sheets Sync</span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
              Transmission Complete (Sheets DB Updated)
            </span>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <button
            onClick={resetBookingState}
            style={{ backgroundColor: brand.color }}
            className="w-full py-3 text-white text-xs font-semibold rounded-xl hover:opacity-95 shadow-xs transition"
          >
            Reserve Another Session
          </button>
          <p className="text-[10px] text-slate-400 font-mono">
            Booking ID: {justBooked.id}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-5xl mx-auto bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 font-sans ${typographyClass}`}>
      
      {/* Brand & Event sidebar */}
      <div className="md:col-span-4 bg-slate-50 border-r border-slate-100 p-6 sm:p-8 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            {brand.logoType === 'emoji' ? (
              <div className="w-12 h-12 rounded-xl bg-white shadow-xs border border-slate-100 flex items-center justify-center text-2xl">
                {brand.logoValue || '📅'}
              </div>
            ) : (
              <img
                src={brand.logoValue || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60'}
                alt="Brand Logo"
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-xl bg-white object-cover border border-slate-100 shadow-xs"
              />
            )}
            <div>
              <h3 className="font-bold text-slate-900 text-sm tracking-tight">{brand.name}</h3>
              <p className="text-[11px] text-slate-500">Scheduler Portal</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed italic bg-white p-3 rounded-xl border border-slate-100 shadow-3xs">
            "{brand.welcomeMessage}"
          </p>

          {/* Event types select */}
          <div className="space-y-2 pt-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Available Consultations</span>
            <div className="space-y-2">
              {eventTypes.filter(e => e.isActive).map(event => (
                <button
                  key={event.id}
                  onClick={() => {
                    setSelectedEventType(event);
                    setSelectedDate(null);
                    setSelectedTime(null);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all duration-200 flex items-start gap-3 ${
                    selectedEventType?.id === event.id
                      ? 'bg-white border-slate-900 shadow-xs ring-1 ring-slate-900'
                      : 'bg-transparent border-slate-200/60 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full mt-1 shrink-0 bg-${event.color}-500`} style={{
                    backgroundColor: event.color === 'emerald' ? '#10b981' : event.color === 'sky' ? '#0ea5e9' : event.color === 'violet' ? '#8b5cf6' : '#64748b'
                  }} />
                  <div className="space-y-0.5">
                    <h4 className="font-semibold text-slate-800 text-xs">{event.name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock size={10} /> {event.duration} Mins
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{event.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 border-t border-slate-200/60 pt-4 mt-6">
          <span>📅 Secure Reservation Interface</span>
        </div>
      </div>

      {/* Scheduler Stage */}
      <div className="md:col-span-8 p-6 sm:p-8 flex flex-col justify-between">
        
        {!selectedDate ? (
          /* CALENDAR PICKER */
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Step 1 of 3</span>
                <h3 className="text-lg font-bold text-slate-900 font-display">Select a Date</h3>
              </div>
              
              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                <button onClick={handlePrevMonth} className="p-1.5 hover:bg-white rounded-md text-slate-600 transition">
                  <ChevronLeft size={16} />
                </button>
                <span className="px-2 text-xs font-bold text-slate-800">
                  {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={handleNextMonth} className="p-1.5 hover:bg-white rounded-md text-slate-600 transition">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-3xs bg-white">
              <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-100 text-center py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              <div className="grid grid-cols-7 p-2 gap-1 min-h-[220px]">
                {calendarDays.map((day, idx) => {
                  if (!day) return <div key={`empty-${idx}`} />;
                  
                  const isAvailable = isDayAvailable(day);
                  const isPast = day < new Date(new Date().setHours(0,0,0,0));
                  const isSelectable = isAvailable && !isPast;

                  return (
                    <button
                      key={`day-${day.getTime()}`}
                      disabled={!isSelectable}
                      onClick={() => setSelectedDate(day)}
                      className={`h-9 w-full rounded-lg text-xs font-semibold transition-all duration-150 flex items-center justify-center relative ${
                        isSelectable
                          ? 'text-slate-800 hover:bg-slate-100 cursor-pointer border border-slate-200/40 bg-emerald-50/20'
                          : 'text-slate-300 bg-slate-50/40 cursor-not-allowed'
                      }`}
                    >
                      <span>{day.getDate()}</span>
                      {isSelectable && (
                        <span className="absolute bottom-1 w-1 h-1 rounded-full bg-slate-900" style={{ backgroundColor: brand.color }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-4 text-[10px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-50/40 border border-slate-200/40 block" /> Available Days
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-50/40 block" /> Not Available
              </div>
            </div>
          </div>
        ) : !selectedTime ? (
          /* SLOT PICKER */
          <div className="space-y-5">
            <button
              onClick={() => setSelectedDate(null)}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 font-semibold"
            >
              <ChevronLeft size={14} /> Back to calendar
            </button>

            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Step 2 of 3</span>
              <h3 className="text-lg font-bold text-slate-900 font-display">
                Select a Time on {selectedDate.toLocaleDateString('default', { weekday: 'long', month: 'short', day: 'numeric' })}
              </h3>
            </div>

            {availableSlots.length === 0 ? (
              <div className="p-8 border border-slate-100 rounded-2xl bg-slate-50 text-center space-y-2">
                <AlertCircle className="text-slate-400 mx-auto" size={24} />
                <p className="text-xs font-semibold text-slate-700">No available slots remaining on this day.</p>
                <p className="text-[11px] text-slate-500">Please select another date in the calendar.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-1">
                {availableSlots.map(time => (
                  <button
                    key={`time-${time}`}
                    onClick={() => setSelectedTime(time)}
                    className="py-3 border border-slate-200/70 text-slate-800 font-medium rounded-xl hover:border-slate-800 text-xs transition"
                  >
                    {time}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* LEAD CONTACT INFO FORM */
          <form onSubmit={handleBookAppointment} className="space-y-5">
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setSelectedTime(null)}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 font-semibold"
              >
                <ChevronLeft size={14} /> Back to slots
              </button>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Step 3 of 3</span>
            </div>

            <div className="space-y-0.5">
              <h3 className="text-lg font-bold text-slate-900 font-display">Complete Your Reservation</h3>
              <p className="text-slate-500 text-xs">
                Booking <strong>{selectedEventType?.name}</strong> with {brand.name} on {selectedDate.toLocaleDateString('default', { month: 'short', day: 'numeric' })} at {selectedTime}.
              </p>
            </div>

            {submitError && (
              <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-100 flex items-center gap-2">
                <AlertCircle size={14} className="text-rose-500" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 text-slate-400" size={14} />
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 text-slate-400" size={14} />
                    <input
                      type="email"
                      required
                      placeholder="client@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 outline-none transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 text-slate-400" size={14} />
                    <input
                      type="tel"
                      required
                      placeholder="+1 (555) 019-2834"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 outline-none transition"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Questions or Notes for Host (Optional)</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-2.5 text-slate-400" size={14} />
                  <textarea
                    placeholder="Please let us know how we can prepare..."
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 outline-none transition resize-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{ backgroundColor: brand.color }}
              className="w-full py-3 text-white text-xs font-semibold rounded-xl hover:opacity-95 shadow-xs transition flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Recording Lead &amp; Synced Database...
                </>
              ) : (
                <>
                  Confirm Booking Appointment
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
