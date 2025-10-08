# Quick Start Guide - MX Merchant Hosted Checkout

## ✅ Setup Complete!

Your MX Merchant hosted payment link integration is **fully working** and tested! 🎉

## 🚀 Getting Started

### 1. Start the Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### 2. Test the Health Check

```bash
curl http://localhost:3000/api/health
```

You should see `"mxConfigured": true` if your credentials are loaded correctly.

### 3. Create Your First Payment Link ✅ WORKING!

#### Option A: Use the Test Script (Easiest)

```bash
npm run test:payment
```

This will create a hosted payment link and show you the payment URL. **This is already tested and working!**

**Example Output:**
```json
{
  "success": true,
  "data": {
    "paymentUrl": "https://pay.mxmerchant.com/Link2Pay/[UDID]?Amt=150.00&InvoiceNo=INV-2024-001...",
    "amount": 150,
    "message": "Redirect customer to paymentUrl to complete payment"
  }
}
```

#### Option B: Use cURL

```bash
curl -X POST http://localhost:3000/api/payments/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 150.00,
    "currency": "USD",
    "invoice": {
      "number": "INV-2024-001",
      "description": "Vehicle service payment"
    },
    "customer": {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+1-555-123-4567"
    },
    "redirectUrl": "https://celebrationchevrolet.com/payment/success",
    "cancelUrl": "https://celebrationchevrolet.com/payment/cancel",
    "lineItems": [
      {
        "description": "Oil change service",
        "amount": 75.00,
        "quantity": 1
      },
      {
        "description": "Tire rotation",
        "amount": 75.00,
        "quantity": 1
      }
    ]
  }'
```

#### Option C: Use Postman or Insomnia

1. Create a new POST request to `http://localhost:3000/api/payments/create`
2. Set header: `Content-Type: application/json`
3. Copy the JSON payload from `PAYLOAD_EXAMPLE.md`
4. Send the request

## 📋 Payment Request Structure

### Required Fields

- ✅ `amount` (number) - Payment amount
- ✅ `invoice.number` (string) - Unique invoice number
- ✅ `customer.name` (string) - Customer name
- ✅ `customer.email` (string) - Customer email

### Optional Fields with Defaults

- `currency` - Default: "USD"
- `invoice.description` - Default: "Payment for {invoice.number}"
- `customer.phone` - Optional
- `redirectUrl` - Default: "https://celebrationchevrolet.com/payment/success"
- `cancelUrl` - Default: "https://celebrationchevrolet.com/payment/cancel"
- `lineItems` - Default: []

## 📁 Important Files

| File | Purpose |
|------|---------|
| `routes/payment.js` | Payment API endpoint logic |
| `index.js` | Main server file |
| `.env` | Your API credentials (already configured) |
| `PAYLOAD_EXAMPLE.md` | Detailed payload documentation |
| `test-payment.js` | Test script for payment creation |
| `CREDENTIALS_GUIDE.md` | Guide to finding API credentials |

## 🔍 API Endpoints

### Create Payment
```
POST /api/payments/create
```

### Get Payment Status
```
GET /api/payments/:paymentId
```

### List All Payments
```
GET /api/payments
```

### Health Check
```
GET /api/health
```

## 🔐 Your Configuration

Your `.env` file is already configured with:

- ✅ MX_BASE_URL: `https://api.mxmerchant.com/checkout/v3/`
- ✅ MX_API_KEY: Configured
- ✅ MX_API_SECRET: Configured
- ✅ MX_MERCHANT_ID: 1000131016

## 📝 Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Mx Merchant API response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": {
    // Additional error details
  }
}
```

## 🛠️ Troubleshooting

### Server won't start
- Make sure port 3000 is not in use
- Check that all dependencies are installed: `npm install`

### "MX_API_KEY is undefined"
- Verify your `.env` file exists and has the correct values
- Restart the server after changing `.env`

### 401 Unauthorized
- Double-check your API credentials in `.env`
- Ensure you're using the correct environment (sandbox vs production)

### Payment creation fails
- Check that all required fields are provided
- Verify the invoice number is unique
- Check the server logs for detailed error messages

## 📚 Additional Resources

- `README.md` - Full project documentation
- `PAYLOAD_EXAMPLE.md` - Detailed payload examples
- `CREDENTIALS_GUIDE.md` - Help finding your credentials

## 🎯 Next Steps

1. Test the payment creation endpoint with the test script
2. Integrate the API into your application
3. Customize the redirect URLs for your use case
4. Add additional endpoints as needed (refunds, webhooks, etc.)

---

**Ready to test?** Run: `npm run dev` then `npm run test:payment`

