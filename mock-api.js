const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

// Initialize mock data
let tags = {
  'dQw4w9WgXcQ': { tag: 'factual', score: 8, history: '10 verified videos' },
  'abc123xyz789': { tag: 'opinion', score: 6, history: '5 uploads' }
};

// Rate limiting middleware
const rateLimit = {};
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 30;

function rateLimiter(req, res, next) {
  const ip = req.ip;
  const now = Date.now();
  
  if (!rateLimit[ip]) {
    rateLimit[ip] = {
      requests: 1,
      windowStart: now
    };
    return next();
  }

  if (now - rateLimit[ip].windowStart > RATE_LIMIT_WINDOW) {
    rateLimit[ip] = {
      requests: 1,
      windowStart: now
    };
    return next();
  }

  if (rateLimit[ip].requests >= MAX_REQUESTS) {
    return res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.ceil((rateLimit[ip].windowStart + RATE_LIMIT_WINDOW - now) / 1000)
    });
  }

  rateLimit[ip].requests++;
  next();
}

app.use(rateLimiter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Get tags for a video
app.get('/getTags', (req, res) => {
  const videoId = req.query.videoId;
  if (!videoId) {
    return res.status(400).json({
      error: 'Missing videoId',
      message: 'Please provide a videoId query parameter'
    });
  }
  res.json(tags[videoId] || { tag: null });
});

// Scan a video for tags
app.post('/scan', (req, res) => {
  const { videoId, title, description } = req.body;
  
  if (!videoId) {
    return res.status(400).json({
      error: 'Missing videoId',
      message: 'Please provide a videoId in the request body'
    });
  }

  // Mock content analysis
  const tag = title?.toLowerCase().includes('news') ? 'factual' :
              description?.toLowerCase().includes('funny') ? 'satire' : 'opinion';
  
  // Generate a realistic score with slight randomness
  const baseScore = tag === 'factual' ? 8 :
                   tag === 'satire' ? 7 : 6;
  const score = Math.min(10, Math.max(1, baseScore + (Math.random() * 2 - 1)));
  
  const tagData = {
    tag,
    score: Math.round(score * 10) / 10,
    history: 'Mock creator history'
  };
  
  tags[videoId] = tagData;
  
  // Simulate processing time (1-3 seconds)
  setTimeout(() => res.json(tagData), 1000 + Math.random() * 2000);
});

// Submit feedback
app.post('/feedback', (req, res) => {
  const { videoId, tag, score, comment } = req.body;
  
  if (!videoId || !tag) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'Please provide videoId and tag in the request body'
    });
  }

  console.log('Feedback received:', {
    videoId,
    tag,
    score,
    comment,
    timestamp: new Date().toISOString()
  });

  res.status(200).json({ success: true });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', version: '0.3.0' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`ORB Mock API running on port ${port}`));