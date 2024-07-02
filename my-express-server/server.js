const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Replace with your actual MongoDB URI
const mongoURI = 'mongodb://localhost:27017/queue';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const queueSchema = new mongoose.Schema({
  queueId: { type: Number, required: true }
});

const Queue = mongoose.model('Queue', queueSchema);

// Initialize queueId if not exists
(async () => {
  try {
    let queue = await Queue.findOne({});
    if (!queue) {
      queue = new Queue({ queueId: 1000000 });
      await queue.save();
      console.log('Queue initialized with queueId:', queue.queueId);
    }
  } catch (err) {
    console.error('Initialization error:', err);
  }
})();

// API to get and increment queueId
app.get('/api/queue', async (req, res) => {
  try {
    const queue = await Queue.findOneAndUpdate({}, { $inc: { queueId: 1 } }, { new: true });
    if (!queue) {
      res.status(404).send('Queue not found');
    } else {
      res.json({ queueId: queue.queueId });
    }
  } catch (error) {
    console.error('Error incrementing queueId:', error);
    res.status(500).send('Server error');
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
