import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { Item } from './models/Item.js';
import { Sale } from './models/Sale.js';
import { User } from './models/User.js';
import { auth } from './middleware/auth.js';

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
    const user = new User({ email, password, name, warehouseName });
    await user.save();
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ user, token });
  } catch (error) {
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
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ user, token });
  } catch (error) {
    res.status(401).json({ error: error.message });
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

    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// New route for sales trend data
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
    res.status(201).json({ sale, updatedItem: item });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ error: error.message });
  } finally {
    session.endSession();
  }
});

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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});