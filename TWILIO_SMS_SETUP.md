# Twilio SMS Integration Guide

## Overview

The API now automatically sends payment links via SMS to customers when a phone number is provided! 📱

When you create a payment link with a customer phone number, the system will:
1. Create the hosted payment URL
2. Send an SMS to the customer with the payment link
3. Return both the URL and SMS delivery status

## Required Twilio Credentials

You need three credentials from Twilio. Add them to your `.env` file:

```env
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here
```

## How to Get Twilio Credentials

### 1. **TWILIO_ACCOUNT_SID** and **TWILIO_AUTH_TOKEN**

1. Go to [Twilio Console](https://console.twilio.com/)
2. Sign up for a free account or log in
3. On the dashboard, you'll see:
   - **Account SID** - Copy this to `TWILIO_ACCOUNT_SID`
   - **Auth Token** - Click "Show" and copy to `TWILIO_AUTH_TOKEN`

### 2. **TWILIO_PHONE_NUMBER**

You need a Twilio phone number to send SMS from:

#### Option A: Free Trial Number
1. In Twilio Console, go to **Phone Numbers** → **Manage** → **Active Numbers**
2. If you're on trial, Twilio provides a test number
3. Copy the phone number (format: `+15551234567`)

#### Option B: Buy a Number
1. Go to **Phone Numbers** → **Buy a Number**
2. Select a number with SMS capabilities
3. Purchase it ($1-2/month typically)
4. Copy the phone number

**Important:** Use E.164 format: `+1XXXXXXXXXX` (country code + number)

## Example .env Configuration

```env
# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_32_characters_long
TWILIO_PHONE_NUMBER=+15551234567
```

## SMS Message Format

The SMS sent to customers looks like this:

```
Payment Link for Invoice INV-12345

Amount: $150.00

Pay here: https://pay.mxmerchant.com/Link2Pay/[UDID]?...

Thank you!
```

## How to Use

### Automatic SMS (Default)

When you include a phone number in the payload, SMS is sent automatically:

```bash
curl -X POST http://localhost:3000/api/payments/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 150.00,
    "invoice": {
      "number": "INV-001"
    },
    "customer": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+15551234567"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentUrl": "https://pay.mxmerchant.com/Link2Pay/...",
    "amount": 150,
    "customer": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+15551234567"
    },
    "sms": {
      "sent": true,
      "messageSid": "SM1234567890abcdef",
      "to": "+15551234567"
    },
    "message": "Payment link created and SMS sent to customer"
  }
}
```

### Disable SMS for Specific Request

If you don't want to send SMS for a particular request:

```json
{
  "amount": 150.00,
  "invoice": { "number": "INV-001" },
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+15551234567"
  },
  "sendSms": false
}
```

### Without Phone Number

If no phone number is provided, no SMS is sent (obviously):

```json
{
  "amount": 150.00,
  "invoice": { "number": "INV-001" },
  "customer": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

## Phone Number Format

**Important:** Phone numbers must be in E.164 format:
- ✅ `+15551234567` (US)
- ✅ `+447911123456` (UK)
- ✅ `+919876543210` (India)
- ❌ `5551234567` (missing country code)
- ❌ `(555) 123-4567` (formatted, not E.164)

### Converting to E.164

```javascript
// US number example
const rawNumber = "(555) 123-4567";
const e164Number = "+1" + rawNumber.replace(/\D/g, ''); // +15551234567
```

## Response Fields

### When SMS is Sent Successfully

```json
{
  "sms": {
    "sent": true,
    "messageSid": "SM1234567890abcdef",
    "to": "+15551234567"
  }
}
```

### When SMS Fails

```json
{
  "sms": {
    "sent": false,
    "error": "Error message from Twilio"
  }
}
```

### When Twilio Not Configured

```json
{
  "sms": {
    "sent": false,
    "reason": "Twilio not configured"
  }
}
```

## Checking Twilio Status

Check if Twilio is properly configured:

```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
  "status": "healthy",
  "mxConfigured": true,
  "twilioConfigured": true
}
```

## Twilio Trial Account Limitations

If you're using a **free trial account**:

### ✅ What Works:
- Send SMS to **verified numbers only**
- Test the integration
- Develop and test your application

### ❌ Limitations:
- Can only send to numbers you've verified in Twilio
- SMS includes trial message footer
- Limited credits (~$15 USD)

### 📝 To Verify Numbers on Trial:
1. Go to Twilio Console
2. **Phone Numbers** → **Verified Caller IDs**
3. Click **Add a new Number**
4. Enter the phone number and verify via code

### 💳 To Remove Limitations:
Upgrade to a paid account:
1. Add payment method in Twilio Console
2. Remove trial restrictions
3. Send to any phone number

## Cost

Typical Twilio SMS pricing:
- **US/Canada**: ~$0.0079 per SMS
- **International**: Varies by country
- **Phone number**: ~$1-2/month

**Example:** 1,000 SMS = ~$8 + phone rental

## Error Handling

The API continues to work even if SMS fails:

```json
{
  "success": true,
  "data": {
    "paymentUrl": "https://...",
    "sms": {
      "sent": false,
      "error": "The 'To' number +1234 is not a valid phone number."
    },
    "message": "Payment link created. Redirect customer to paymentUrl to complete payment"
  }
}
```

The payment link is still created and returned, but SMS delivery failed.

## Testing

### Test with Twilio Configured

```bash
npm run test:payment
```

If Twilio is configured and the test phone number is valid, you'll see:
```
✅ SMS sent to +15551234567 - SID: SM1234567890abcdef
```

### Test without Twilio

If credentials aren't configured:
```
⚠️  Twilio SMS disabled (credentials not configured)
```

The payment link still works, just no SMS is sent.

## Frontend Integration

### React Example

```javascript
const createPaymentWithSMS = async (orderData) => {
  const response = await fetch('/api/payments/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: orderData.total,
      invoice: {
        number: orderData.invoiceNumber
      },
      customer: {
        name: orderData.customerName,
        email: orderData.customerEmail,
        phone: orderData.customerPhone // Will trigger SMS
      }
    })
  });

  const data = await response.json();
  
  if (data.success) {
    if (data.data.sms?.sent) {
      alert('Payment link sent via SMS!');
    } else {
      // SMS failed, but payment link still available
      window.location.href = data.data.paymentUrl;
    }
  }
};
```

## Customizing SMS Message

To customize the SMS message, edit the `sendPaymentLinkSMS` function in `/routes/payment.js`:

```javascript
const message = `Payment Link for Invoice ${invoiceNumber}\n\nAmount: $${amount.toFixed(2)}\n\nPay here: ${paymentUrl}\n\nThank you!`;
```

Change to:
```javascript
const message = `Hi! Your payment of $${amount.toFixed(2)} for invoice ${invoiceNumber} is ready.\n\nClick here to pay: ${paymentUrl}\n\nQuestions? Call us at (555) 123-4567`;
```

## Security Best Practices

1. **Never commit credentials** - Keep `.env` in `.gitignore`
2. **Use environment variables** - Different keys for dev/production
3. **Rotate auth tokens** - Regularly update in Twilio Console
4. **Monitor usage** - Set up alerts in Twilio for unusual activity
5. **Validate phone numbers** - Check format before sending

## Troubleshooting

### "Cannot find module 'twilio'"
```bash
npm install twilio
```

### "The 'To' number is not a valid phone number"
- Use E.164 format: `+1XXXXXXXXXX`
- Include country code
- No spaces or special characters

### SMS not sending on trial account
- Verify the recipient's phone number in Twilio Console
- Or upgrade to paid account

### "Account not authorized to send to this number"
- Number not verified on trial account
- Verify in Twilio Console or upgrade

## Summary

✅ **Automatic SMS sending when phone provided**  
✅ **Optional - can be disabled per request**  
✅ **Works with or without Twilio configured**  
✅ **Includes delivery status in response**  
✅ **Payment link always created, even if SMS fails**  

Your customers can now receive payment links directly via SMS! 📱✨

