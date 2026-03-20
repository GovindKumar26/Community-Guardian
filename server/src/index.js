import express from 'express';
import 'dotenv/config';
import crypto from 'crypto';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import 'express-async-errors';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import mongoose from 'mongoose';

import connectDB from './config/database.js';
import { globalLimiter, authLimiter, apiLimiter, aiLimiter } from './middleware/rateLimiter.js';

import authRoutes from './routes/auth.js';
import alertRoutes from './routes/alerts.js';
import digestRoutes from './routes/digest.js';
import circleRoutes from './routes/circles.js';

const app = express();
let server;

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Security Headers (Helmet) ────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      baseUri: ["'none'"],
      fontSrc: ["'none'"],
      formAction: ["'none'"],
      frameAncestors: ["'none'"],
      imgSrc: ["'none'"],
      objectSrc: ["'none'"],
      scriptSrc: ["'none'"],
      styleSrc: ["'none'"],
      connectSrc: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "same-site" }
}));

// ─── NoSQL Injection Prevention ───────────────────────────────────────────────
app.use(mongoSanitize());

// ─── Logging ──────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ─── Environment Variable Validation ─────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const criticalVars = ['MONGO_URI', 'JWT_SECRET', 'ENCRYPTION_KEY'];
  const missing = criticalVars.filter(v => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(`CRITICAL: Missing required environment variables: ${missing.join(', ')}`);
  }
  if (!process.env.GEMINI_API_KEY) {
    console.warn('WARNING: GEMINI_API_KEY not set. AI features will use rule-based fallback.');
  }
  if (!process.env.FRONTEND_URL) {
    console.warn('WARNING: FRONTEND_URL not set. CORS may not work correctly in production.');
  }
}

// ─── CORS ─────────────────────────────────────────────────────────────────────
const FRONT = process.env.FRONTEND_URL || 'http://localhost:5173';

const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? [FRONT]
    : ['http://localhost:5173', 'http://localhost:5174', FRONT],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// ─── Trust Proxy (for PaaS deployments like Render, Railway) ─────────────────
app.set('trust proxy', 1);

// ─── Request ID Tracking ──────────────────────────────────────────────────────
app.use((req, _res, next) => {
  req.id = crypto.randomUUID();
  _res.setHeader('X-Request-ID', req.id);
  next();
});

// ─── Rate Limiting ────────────────────────────────────────────────────────────
app.use(globalLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/alerts', apiLimiter, alertRoutes);
app.use('/api/digest', aiLimiter, digestRoutes);
app.use('/api/circles', apiLimiter, circleRoutes);

// ─── Health & Ping Endpoints ──────────────────────────────────────────────────
app.get('/api/ping', (_req, res) => res.json({ ok: true, time: new Date() }));

app.get('/api/health', async (_req, res) => {
  const mongoConnected = mongoose.connection.readyState === 1;
  const geminiConfigured = !!process.env.GEMINI_API_KEY;

  const health = {
    status: mongoConnected ? 'OK' : 'DEGRADED',
    timestamp: new Date(),
    uptime: process.uptime(),
    mongodb: mongoConnected ? 'connected' : 'disconnected',
    ai: geminiConfigured ? 'gemini' : 'rule-based-fallback',
    environment: process.env.NODE_ENV || 'development'
  };

  res.status(mongoConnected ? 200 : 503).json(health);
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    requestId: req.id
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  console.error(`[${req.id || 'unknown'}] Error:`,
    process.env.NODE_ENV === 'development' ? err : err.message
  );

  const status = err.statusCode || err.status || 500;

  // Never expose internal error details in production for 5xx errors
  const message = process.env.NODE_ENV === 'production'
    ? (status < 500 ? err.message : 'An internal error occurred. Please try again later.')
    : err.message;

  res.status(status).json({
    error: message,
    requestId: req.id,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ─── Start Server ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    server = app.listen(PORT, () => {
      console.log(`\n Community Guardian API`);
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`AI Mode: ${process.env.GEMINI_API_KEY ? 'Gemini AI' : 'Rule-Based Fallback'}`);
    });
  })
  .catch(err => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });

// ─── Process Error Handlers ───────────────────────────────────────────────────
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err?.name, err?.message);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
const gracefulShutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);

  if (server) {
    server.close(() => console.log('HTTP server closed'));
  }

  try {
    await mongoose.connection.close(false);
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
