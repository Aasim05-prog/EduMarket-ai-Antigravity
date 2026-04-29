const Razorpay = require('razorpay');
const crypto = require('crypto');
const Note = require('../models/Note');
const User = require('../models/User');

// Initialize Razorpay instance
const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay keys not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env');
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// @desc    Create a Razorpay order for a note purchase
// @route   POST /api/payments/create-order
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { noteId } = req.body;

    if (!noteId) return res.status(400).json({ message: 'noteId is required' });

    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    // Free notes don't go through payment
    if (note.price === 0 || note.isTextbook) {
      return res.status(400).json({ message: 'This note is free. Use the purchase endpoint directly.' });
    }

    const user = await User.findById(req.user._id);
    if (user.purchasedNotes.includes(note._id)) {
      return res.status(400).json({ message: 'Note already purchased' });
    }

    const razorpay = getRazorpay();

    // Amount is in paise (₹1 = 100 paise)
    const order = await razorpay.orders.create({
      amount: note.price * 100,
      currency: 'INR',
      receipt: `note_${noteId}_user_${req.user._id}`,
      notes: {
        noteId: noteId.toString(),
        userId: req.user._id.toString(),
        noteTitle: note.title,
      },
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      note: {
        _id: note._id,
        title: note.title,
        price: note.price,
      },
      user: {
        name: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    if (error.message.includes('Razorpay keys')) {
      return res.status(503).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Razorpay payment signature & complete purchase
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, noteId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !noteId) {
      return res.status(400).json({ message: 'Missing payment verification fields' });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed. Invalid signature.' });
    }

    // Payment is valid — complete the purchase
    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    const user = await User.findById(req.user._id);

    // Idempotent — don't double-add
    if (!user.purchasedNotes.includes(note._id)) {
      user.purchasedNotes.push(note._id);
      await user.save();

      note.downloads += 1;
      await note.save();

      await User.findByIdAndUpdate(note.sellerId, { $inc: { totalDownloads: 1 } });
    }

    res.json({
      message: 'Payment verified and note unlocked successfully!',
      noteId: note._id,
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, verifyPayment };
