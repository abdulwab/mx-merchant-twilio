# Mx Merchant API Integration - Hosted Checkout

A Node.js Express application for creating secure hosted payment pages using the MX Merchant API.

## What This Does

This API creates **hosted payment links** where customers securely enter their payment information on MX Merchant's secure page. You never handle sensitive card data directly, making it PCI compliant and secure.

## Installation

1. Install the dependencies:

```bash
npm install
```

2. Configure your environment variables:

Copy `.env.example` to `.env` and fill in your Mx Merchant API credentials:

```bash
cp .env.example .env
```

Then edit `.env` with your credentials:
- `MX_API_KEY` - Your Mx Merchant API key
- `MX_API_SECRET` - Your Mx Merchant API secret
- `MX_MERCHANT_ID` - Your Merchant ID
- `MX_BASE_URL` - API base URL (sandbox or production)

## Running the Application

### Production mode
```bash
npm start
```

### Development mode (with auto-reload)
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## API Endpoints

### General
- `GET /` - Welcome message with available endpoints
- `GET /api/health` - Health check endpoint

### Payment Endpoints
- `POST /api/payments/create` - Create a hosted payment link (returns a URL to redirect customers to)
- `GET /api/payments/:paymentId` - Get payment details by ID
- `GET /api/payments` - List all payments

## Usage Examples

### Create a Hosted Payment Link

This creates a secure payment URL that you redirect your customer to:

```bash
curl -X POST http://localhost:3000/api/payments/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.00,
    "currency": "USD",
    "invoice": {
      "number": "INV-12345",
      "description": "Service payment"
    },
    "customer": {
      "name": "John Doe",
      "email": "customer@example.com",
      "phone": "+1234567890"
    },
    "lineItems": [
      {
        "description": "Oil Change",
        "amount": 50.00,
        "quantity": 1
      },
      {
        "description": "Tire Rotation",
        "amount": 50.00,
        "quantity": 1
      }
    ],
    "redirectUrl": "https://celebrationchevrolet.com/payment/success",
    "cancelUrl": "https://celebrationchevrolet.com/payment/cancel"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentUrl": "https://pay.mxmerchant.com/Link2Pay/[UDID]?Amt=100.00&InvoiceNo=INV-12345...",
    "amount": 100,
    "currency": "USD",
    "message": "Redirect customer to paymentUrl to complete payment"
  }
}
```

**Then redirect your customer to the `paymentUrl`** where they'll enter their payment details on MX Merchant's secure page.

### Get Payment Status

```bash
curl http://localhost:3000/api/payments/{paymentId}
```

### List Payments

```bash
curl http://localhost:3000/api/payments?limit=10&offset=0
```

## Project Structure

```
mxtest/
├── index.js              # Main application file
├── routes/
│   └── payment.js        # Payment API routes
├── package.json          # Project dependencies and scripts
├── .env                  # Environment variables (not in git)
├── .env.example          # Example environment variables
├── .gitignore            # Git ignore rules
└── README.md             # Project documentation
```

## Technologies Used

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **Axios** - HTTP client for API requests
- **Dotenv** - Environment variable management
- **Nodemon** - Development auto-reload tool
- **MX Merchant API** - Hosted payment processing
- **Twilio** - SMS delivery (optional)

## How It Works

1. **Your Backend**: Creates a payment link with customer/invoice details
2. **API Returns**: A secure hosted payment URL
3. **SMS Sent**: Payment link automatically sent to customer's phone (if Twilio configured)
4. **Customer**: Clicks link or gets redirected to the MX Merchant hosted page
5. **Customer**: Enters payment details securely
6. **After Payment**: Customer is redirected back to your success/cancel URL

See `HOW_IT_WORKS.md` for detailed flow diagrams and implementation guide.

## SMS & Email Integration

**NEW!** The API now automatically sends payment links via SMS and Email!

### SMS (Twilio)
- ✅ Automatic SMS delivery
- ✅ Optional - works with or without Twilio
- ✅ E.164 phone format support
- See `TWILIO_SMS_SETUP.md` for setup

### Email (AWS SES)
- ✅ Beautiful HTML emails
- ✅ Includes line items table
- ✅ Professional design
- ✅ Extremely affordable ($0.10/1000 emails)
- See `AWS_SES_SETUP.md` for setup

Both notifications can be sent simultaneously or individually!

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| PORT | Server port number | No (default: 3000) |
| NODE_ENV | Environment (development/production) | No |
| MX_API_KEY | Mx Merchant API key | Yes |
| MX_API_SECRET | Mx Merchant API secret | Yes |
| MX_MERCHANT_ID | Your Merchant ID | Yes |
| MX_BASE_URL | API base URL | Yes |
| MX_WEBHOOK_SECRET | Webhook verification secret | No |
| TWILIO_ACCOUNT_SID | Twilio Account SID | No (for SMS) |
| TWILIO_AUTH_TOKEN | Twilio Auth Token | No (for SMS) |
| TWILIO_PHONE_NUMBER | Twilio Phone Number | No (for SMS) |

