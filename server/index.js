import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { Item } from './models/Item.js';
import { Sale } from './models/Sale.js';
import { User } from './models/User.js';
import { auth } from './middleware/auth.js';
import { sendLowStockAlert, sendSaleNotification, sendDailySalesSummary, sendPasswordResetLink, sendVerificationEmail } from './utils/mailer.js';
import crypto from 'crypto';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, warehouseName } = req.body;
    
    // Create verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 86400000); // 24 hours
    const checkUser = User.findOne({email});
    if(!checkUser){
      return res.status(400).json({message: 'Email already exists'});
    }
    const user = new User({
      email,
      password,
      name,
      warehouseName,
      verificationToken,
      verificationTokenExpires,
      isVerified: false
    });
    
    await user.save();
    await sendVerificationEmail(user, verificationToken);
    
    res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/auth/verify/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      verificationToken: req.params.token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.redirect(`${process.env.FRONTEND_URL}/login?verified=true`);
  } catch (error) {
    console.error('Verification error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Invalid login credentials');
    }

    if (!user.isVerified) {
      return res.status(401).json({ error: 'Please verify your email before logging in' });
    }
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ user, token });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Password reset routes
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    await sendPasswordResetLink(user, resetToken);
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Protected routes
app.get('/api/items', auth, async (req, res) => {
  try {
    const items = await Item.find({ user: req.user._id }).sort('-createdAt');
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/items', auth, async (req, res) => {
  try {
    const item = new Item({
      ...req.body,
      user: req.user._id
    });
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/items/:id', auth, async (req, res) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, user: req.user._id });
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    await item.deleteOne();
    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.patch('/api/items/:id', auth, async (req, res) => {
  try {
    const { quantity } = req.body;
    if (typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }

    const item = await Item.findOne({ _id: req.params.id, user: req.user._id });
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    item.quantity += quantity;
    await item.save();

    // Check if stock is low after update
    if (item.quantity < 5) {
      await sendLowStockAlert(req.user, item);
    }

    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/sales', auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { itemId, quantity } = req.body;
    const item = await Item.findOne({ _id: itemId, user: req.user._id });

    if (!item) {
      throw new Error('Item not found');
    }

    if (item.quantity < quantity) {
      throw new Error('Insufficient quantity');
    }

    item.quantity -= quantity;
    await item.save({ session });

    const sale = new Sale({
      item: itemId,
      quantity,
      totalAmount: quantity * item.price,
      user: req.user._id
    });
    await sale.save({ session });

    await session.commitTransaction();

    // Send sale notification
    await sendSaleNotification(req.user, sale, item);

    // Check if stock is low after sale
    if (item.quantity < 5) {
      await sendLowStockAlert(req.user, item);
    }

    res.status(201).json({ sale, updatedItem: item });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ error: error.message });
  } finally {
    session.endSession();
  }
});

// Schedule daily sales summary
const sendDailySummaries = async () => {
  try {
    const users = await User.find();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const user of users) {
      const sales = await Sale.find({
        user: user._id,
        createdAt: { $gte: today }
      });

      if (sales.length > 0) {
        await sendDailySalesSummary(user, sales);
      }
    }
  } catch (error) {
    console.error('Error sending daily summaries:', error);
  }
};

app.get('/api/sales/summary', auth, async (req, res) => {
  try {
    const summary = await Sale.aggregate([
      {
        $match: { user: req.user._id }
      },
      {
        $lookup: {
          from: 'items',
          localField: 'item',
          foreignField: '_id',
          as: 'itemDetails'
        }
      },
      {
        $unwind: '$itemDetails'
      },
      {
        $group: {
          _id: '$item',
          item_name: { $first: '$itemDetails.name' },
          total_quantity: { $sum: '$quantity' },
          total_amount: { $sum: '$totalAmount' }
        }
      }
    ]);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/sales/trend', auth, async (req, res) => {
  try {
    const trend = await Sale.aggregate([
      {
        $match: { user: req.user._id }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total_sales: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Map _id to date field for frontend compatibility
    const formattedTrend = trend.map(entry => ({
      date: entry._id,
      total_sales: entry.total_sales
    }));

    res.json(formattedTrend);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Run daily at midnight
setInterval(() => {
  const now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    sendDailySummaries();
  }
}, 60000); // Check every minute

const PORT = process.env.PORT ;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
