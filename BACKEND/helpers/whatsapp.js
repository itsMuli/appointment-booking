/**
 * Meta WhatsApp Cloud API helper.
 *
 * For first outreach outside the 24h customer-care window, Meta requires
 * approved message templates (e.g. booking_request, booking_result).
 * Interactive approve/reject replies from Joan stay in-session and can use
 * free-form / button messages after she has an open conversation.
 *
 * Env:
 *   WHATSAPP_TOKEN
 *   WHATSAPP_PHONE_NUMBER_ID
 *   WHATSAPP_JOAN_PHONE   (E.164 digits, e.g. 2547XXXXXXXX)
 */

const GRAPH_VERSION = 'v21.0';

export function isWhatsAppConfigured() {
  return Boolean(
    process.env.WHATSAPP_TOKEN &&
      process.env.WHATSAPP_PHONE_NUMBER_ID
  );
}

/** Normalize to WhatsApp digits (no +). Kenya-friendly defaults. */
export function normalizePhone(phone) {
  if (!phone) return null;
  let digits = String(phone).replace(/\D/g, '');
  if (!digits) return null;
  if (digits.startsWith('0') && digits.length === 10) {
    digits = `254${digits.slice(1)}`;
  } else if (digits.length === 9 && digits.startsWith('7')) {
    digits = `254${digits}`;
  }
  return digits;
}

async function sendMessage(payload) {
  if (!isWhatsAppConfigured()) {
    console.log('[whatsapp] skipped (not configured):', payload.type, payload.to);
    return { skipped: true };
  }

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      ...payload,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('[whatsapp] send failed:', res.status, data);
    throw new Error(data?.error?.message || `WhatsApp API ${res.status}`);
  }
  return data;
}

export async function sendWhatsAppText(to, body) {
  const phone = normalizePhone(to);
  if (!phone) {
    console.warn('[whatsapp] invalid phone, skip text');
    return { skipped: true };
  }
  return sendMessage({
    to: phone,
    type: 'text',
    text: { preview_url: false, body: String(body).slice(0, 4096) },
  });
}

/**
 * Interactive reply buttons (max 3). Each: { id, title } (title ≤ 20 chars).
 */
export async function sendWhatsAppButtons(to, bodyText, buttons) {
  const phone = normalizePhone(to);
  if (!phone) {
    console.warn('[whatsapp] invalid phone, skip buttons');
    return { skipped: true };
  }

  return sendMessage({
    to: phone,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: String(bodyText).slice(0, 1024) },
      action: {
        buttons: buttons.slice(0, 3).map((b) => ({
          type: 'reply',
          reply: {
            id: String(b.id).slice(0, 256),
            title: String(b.title).slice(0, 20),
          },
        })),
      },
    },
  });
}

function formatBookingSummary(appointment) {
  const dateStr = appointment.date
    ? new Date(appointment.date).toLocaleDateString()
    : '—';
  const name = `${appointment.userDetails?.firstname || ''} ${appointment.userDetails?.lastname || ''}`.trim();
  return [
    `Booking ${appointment.bookingId}`,
    `Client: ${name || '—'}`,
    `Phone: ${appointment.userDetails?.phone || '—'}`,
    `Service: ${appointment.service?.name || '—'}`,
    `Artist: ${appointment.artist?.name || '—'}`,
    `When: ${dateStr} · ${appointment.timeSlot || '—'}`,
    `Pay: ${appointment.paymentMethod || '—'} · Ksh ${appointment.service?.price ?? '—'}`,
  ].join('\n');
}

export async function notifyJoanNewBooking(appointment) {
  const joan = process.env.WHATSAPP_JOAN_PHONE;
  if (!joan) {
    console.warn('[whatsapp] WHATSAPP_JOAN_PHONE not set');
    return { skipped: true };
  }

  const body = `New booking request (Pending)\n\n${formatBookingSummary(appointment)}\n\nTap a button to respond:`;
  return sendWhatsAppButtons(joan, body, [
    { id: `approve_${appointment.bookingId}`, title: 'Approve' },
    { id: `reject_${appointment.bookingId}`, title: 'Reject' },
  ]);
}

export async function notifyUserBookingResult(appointment, status) {
  const phone = appointment.userDetails?.phone;
  const name = appointment.userDetails?.firstname || 'there';
  const dateStr = appointment.date
    ? new Date(appointment.date).toLocaleDateString()
    : '—';

  let body;
  if (status === 'Confirmed') {
    body = `Hi ${name}, your booking ${appointment.bookingId} is Confirmed.\n${appointment.service?.name} with ${appointment.artist?.name} on ${dateStr} at ${appointment.timeSlot}.\nSee you at Infinity Nail Salon!`;
  } else if (status === 'Rejected') {
    body = `Hi ${name}, unfortunately booking ${appointment.bookingId} was not approved. Please book another time or contact the salon.`;
  } else {
    body = `Hi ${name}, your booking ${appointment.bookingId} status is now ${status}.`;
  }

  return sendWhatsAppText(phone, body);
}

export async function notifyJoanCancellation(appointment) {
  const joan = process.env.WHATSAPP_JOAN_PHONE;
  if (!joan) return { skipped: true };

  const name = `${appointment.userDetails?.firstname || ''} ${appointment.userDetails?.lastname || ''}`.trim();
  const body = `Booking cancelled by client\n\n${appointment.bookingId} — ${name}\n${appointment.service?.name} · ${appointment.timeSlot}`;
  return sendWhatsAppText(joan, body);
}
