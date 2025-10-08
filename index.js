require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const paymentRoutes = require('./routes/payment');

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'MX Merchant Hosted Checkout API - Ready! ✅',
    status: 'success',
    type: 'Hosted Payment Links',
    description: 'Creates secure payment URLs where customers enter payment details on MX Merchant\'s hosted page',
    endpoints: {
      health: 'GET /api/health',
      createPaymentLink: 'POST /api/payments/create - Returns a hosted payment URL',
      getPayment: 'GET /api/payments/:paymentId',
      listPayments: 'GET /api/payments'
    },
    documentation: {
      howItWorks: 'See HOW_IT_WORKS.md for flow diagrams',
      quickStart: 'See QUICK_START.md for examples',
      payloadExamples: 'See PAYLOAD_EXAMPLE.md for request/response examples',
      multipleItems: 'See MULTIPLE_ITEMS_EXAMPLE.md for line items support',
      twilioSetup: 'See TWILIO_SMS_SETUP.md for SMS integration',
      testScript: 'Run: npm run test:payment'
    },
    features: {
      hostedCheckout: true,
      multipleLineItems: true,
      pciCompliant: true,
      securePayments: true,
      smsNotifications: true
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mxConfigured: !!(process.env.MX_API_KEY && process.env.MX_API_SECRET),
    twilioConfigured: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER),
    sesConfigured: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_REGION && process.env.SES_FROM_EMAIL)
  });
});

// Mount payment routes
app.use('/api/payments', paymentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

