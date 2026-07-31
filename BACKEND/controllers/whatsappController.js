import Appointment from '../models/appointmentModel.js';
import {
  notifyUserBookingResult,
} from '../helpers/whatsapp.js';

/**
 * GET — Meta webhook verification
 * Query: hub.mode, hub.verify_token, hub.challenge
 */
export const verifyWhatsAppWebhook = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === 'subscribe' && token && verifyToken && token === verifyToken) {
    console.log('[whatsapp] webhook verified');
    return res.status(200).send(challenge);
  }

  console.warn('[whatsapp] webhook verification failed');
  return res.sendStatus(403);
};

/**
 * POST — inbound messages (Approve / Reject button replies)
 */
export const receiveWhatsAppWebhook = async (req, res) => {
  // Always acknowledge quickly so Meta does not retry
  res.sendStatus(200);

  try {
    const entries = req.body?.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        const messages = change.value?.messages || [];
        for (const message of messages) {
          await handleInboundMessage(message);
        }
      }
    }
  } catch (err) {
    console.error('[whatsapp] webhook handler error:', err);
  }
};

async function handleInboundMessage(message) {
  if (message.type !== 'interactive') return;

  const replyId =
    message.interactive?.button_reply?.id ||
    message.interactive?.list_reply?.id;

  if (!replyId) return;

  const approveMatch = /^approve_(.+)$/i.exec(replyId);
  const rejectMatch = /^reject_(.+)$/i.exec(replyId);
  if (!approveMatch && !rejectMatch) return;

  const bookingId = (approveMatch || rejectMatch)[1];
  const nextStatus = approveMatch ? 'Confirmed' : 'Rejected';

  const appointment = await Appointment.findOne({ bookingId });
  if (!appointment) {
    console.warn('[whatsapp] booking not found:', bookingId);
    return;
  }

  const terminal = ['Confirmed', 'Rejected', 'Cancelled'];
  if (terminal.includes(appointment.status)) {
    console.log(
      `[whatsapp] ignore ${nextStatus} for ${bookingId}; already ${appointment.status}`
    );
    return;
  }

  appointment.status = nextStatus;
  await appointment.save();

  try {
    await notifyUserBookingResult(appointment, nextStatus);
  } catch (err) {
    console.error('[whatsapp] notify user failed:', err.message);
  }

  console.log(`[whatsapp] ${bookingId} -> ${nextStatus}`);
}
