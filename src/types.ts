/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BrandSettings {
  name: string;
  logoType: 'emoji' | 'url';
  logoValue: string; // Emoji character or image URL
  color: string; // Tailwind hex color (e.g. #3b82f6)
  typography: 'sans' | 'display' | 'serif' | 'mono';
  welcomeMessage: string;
}

export interface EventType {
  id: string;
  name: string;
  duration: number; // in minutes
  description: string;
  color: string; // Tailwind name e.g. 'emerald', 'sky', 'violet'
  isActive: boolean;
}

export interface AvailabilitySlot {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // "HH:MM" 24h
  endTime: string; // "HH:MM" 24h
  enabled: boolean;
}

export interface ReminderSetting {
  id: string;
  timeValue: number;
  timeUnit: 'minutes' | 'hours' | 'days';
  enabled: boolean;
}

export interface BookingLead {
  id: string;
  eventTypeId: string;
  eventTypeName: string;
  duration: number;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientNotes: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:MM
  createdAt: string;
  status: 'confirmed' | 'cancelled' | 'reminded';
  appsScriptStatus: 'idle' | 'sending' | 'sent' | 'failed';
  appsScriptError?: string;
}

export interface HostProfile {
  email: string;
  name: string;
  photoUrl?: string;
  isSignedIn: boolean;
}
