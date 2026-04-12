import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const organizerId = session.user.id;

  // All completed orders for this organizer's events
  const orders = await prisma.order.findMany({
    where: {
      status: 'COMPLETED',
      event: { organizerId },
    },
    select: { totalAmount: true },
  });

  const totalTicketsSold = await prisma.ticket.count({
    where: {
      status: { in: ['SOLD', 'USED'] },
      ticketType: { event: { organizerId } },
    },
  });

  const totalRevenue = orders.reduce(
    (sum, o) => sum + Number(o.totalAmount),
    0
  );

  // Check-in rate from the most recent past event
  const lastEvent = await prisma.event.findFirst({
    where: {
      organizerId,
      isPublished: true,
      startTime: { lt: new Date() },
    },
    orderBy: { startTime: 'desc' },
    select: { id: true },
  });

  let checkInRate: number | null = null;

  if (lastEvent) {
    const [sold, used] = await Promise.all([
      prisma.ticket.count({
        where: {
          ticketType: { eventId: lastEvent.id },
          status: { in: ['SOLD', 'USED'] },
        },
      }),
      prisma.ticket.count({
        where: {
          ticketType: { eventId: lastEvent.id },
          status: 'USED',
        },
      }),
    ]);

    checkInRate = sold > 0 ? Math.round((used / sold) * 100) : null;
  }

  return NextResponse.json({ totalTicketsSold, totalRevenue, checkInRate });
}