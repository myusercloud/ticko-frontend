export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface Venue {
  id?: string;
  name: string;
  city?: string;
  address?: string;
}

export interface TicketType {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  available?: number;
  capacity?: number;
}

export interface Event {
  id: string;
  name: string;
  description?: string;
  startTime: string;
  endTime?: string;

  // Keep this flexible for the current UI until all pages are aligned.
  venue?: Venue | string | null;

  ticketTypes: TicketType[];

  // Dashboard/editor fields currently used elsewhere in the app.
  isPublished?: boolean;
  totalCapacity?: number;
  ticketsSold?: number;
  revenue?: number;
  _count?: {
    orders?: number;
  };

  // Temporary legacy compatibility for pages still using `date`.
  date?: string;
}

export interface Ticket {
  id: string;
  eventId: string;
  event?: Event;
  ticketTypeId: string;
  ticketType?: TicketType;
  userId: string;
  status: 'valid' | 'used' | 'cancelled' | 'sold';
  qrCode?: string;
  purchasedAt?: string;
}

export interface EventStats {
  totalRevenue: number;
  ticketsSold: number;
  attendance?: number;
  byTicketType?: { name: string; sold: number }[];
}

export interface OrganizerStats {
  totalTicketsSold: number;
  totalRevenue: number;
  checkInRate: number | null;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export interface ScanResult {
  ticket?: Ticket;
  valid: boolean;
  message: string;
}
