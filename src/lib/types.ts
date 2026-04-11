export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface TicketType {
  id: string;
  name: string;
  price: number;
  quantity: number;
  available?: number;
}

export interface Event {
  id: string
  name: string
  description?: string
  startTime: string
  endTime: string
  venue?: {
    id: string
    name: string
    city?: string
  }
  ticketTypes?: any[]
}

export interface Ticket {
  id: string;
  eventId: string;
  event?: Event;
  ticketTypeId: string;
  ticketType?: TicketType;
  userId: string;
  status: 'valid' | 'used' | 'cancelled';
  qrCode?: string;
  purchasedAt?: string;
}

export interface EventStats {
  totalRevenue: number;
  ticketsSold: number;
  attendance?: number;
  byTicketType?: { name: string; sold: number }[];
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
