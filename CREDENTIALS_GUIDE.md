# Mx Merchant API Credentials Guide

## Required Credentials for .env File

To connect to the Mx Merchant API sandbox, you need the following credentials. Please obtain these from your Mx Merchant dashboard and add them to your `.env` file.

### 1. **MX_API_KEY**
- **What it is:** Your API authentication key
- **Where to find it:** Mx Merchant Dashboard → Settings → API Keys → Sandbox API Key
- **Example:** `MX_API_KEY=pk_sandbox_abc123def456ghi789`

### 2. **MX_API_SECRET**
- **What it is:** Your API secret for secure authentication
- **Where to find it:** Mx Merchant Dashboard → Settings → API Keys → Sandbox API Secret
- **Example:** `MX_API_SECRET=sk_sandbox_xyz987uvw654rst321`
- **⚠️ Keep this secret! Never commit it to version control**

### 3. **MX_MERCHANT_ID**
- **What it is:** Your unique merchant identifier
- **Where to find it:** Mx Merchant Dashboard → Account → Merchant ID
- **Example:** `MX_MERCHANT_ID=merchant_12345678`

### 4. **MX_BASE_URL**
- **What it is:** The API endpoint URL
- **For Sandbox:** `https://sandbox.mx.com/api`
- **For Production:** `https://api.mx.com` (use only after testing in sandbox)
- **Example:** `MX_BASE_URL=https://sandbox.mx.com/api`

### 5. **MX_WEBHOOK_SECRET** (Optional)
- **What it is:** Secret used to verify webhook authenticity
- **Where to find it:** Mx Merchant Dashboard → Webhooks → Webhook Secret
- **Example:** `MX_WEBHOOK_SECRET=whsec_abc123def456`
- **Note:** Only needed if you're implementing webhook functionality

## How to Add Credentials

1. Open the `.env` file in your project root
2. Replace the empty values with your actual credentials:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Mx Merchant API Credentials
MX_API_KEY=pk_sandbox_your_actual_key_here
MX_API_SECRET=sk_sandbox_your_actual_secret_here
MX_MERCHANT_ID=merchant_your_actual_id_here
MX_BASE_URL=https://sandbox.mx.com/api

# Optional: Webhook Configuration
MX_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

3. Save the file
4. Start the server: `npm run dev`

## Testing Your Configuration

After adding your credentials, you can verify they're working by:

1. **Check Health Endpoint:**
   ```bash
   curl http://localhost:3000/api/health
   ```
   
   Look for `"mxConfigured": true` in the response

2. **Test Payment Creation:**
   ```bash
   curl -X POST http://localhost:3000/api/payments/create \
     -H "Content-Type: application/json" \
     -d '{
       "amount": 100,
       "currency": "USD",
       "description": "Test payment"
     }'
   ```

## Common Issues

### Issue: "MX_API_KEY is undefined"
- **Solution:** Make sure you've saved the `.env` file and restarted the server

### Issue: "401 Unauthorized"
- **Solution:** Double-check your API key and secret are correct and for the right environment (sandbox vs production)

### Issue: "Invalid merchant ID"
- **Solution:** Verify your merchant ID matches what's shown in your Mx Merchant dashboard

## Optional: Twilio SMS Credentials

If you want to send payment links via SMS, you'll need Twilio credentials:

### 5. **TWILIO_ACCOUNT_SID**
- **What it is:** Your Twilio Account SID
- **Where to find it:** Twilio Console Dashboard
- **Example:** `TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 6. **TWILIO_AUTH_TOKEN**
- **What it is:** Your Twilio authentication token
- **Where to find it:** Twilio Console Dashboard (click "Show")
- **Example:** `TWILIO_AUTH_TOKEN=your_auth_token_here`

### 7. **TWILIO_PHONE_NUMBER**
- **What it is:** Your Twilio phone number for sending SMS
- **Where to find it:** Twilio Console → Phone Numbers → Active Numbers
- **Example:** `TWILIO_PHONE_NUMBER=+15551234567`
- **Format:** Must be E.164 format with country code

**Note:** Twilio is optional. The API works without it, but won't send SMS.

See `TWILIO_SMS_SETUP.md` for detailed Twilio setup instructions.

## Security Best Practices

✅ **DO:**
- Keep your `.env` file in `.gitignore`
- Use sandbox credentials for testing
- Rotate your API keys regularly
- Use environment-specific credentials
- Protect your Twilio Auth Token

❌ **DON'T:**
- Commit `.env` files to git
- Share your API secret publicly
- Use production credentials in development
- Hardcode credentials in your code
- Share Twilio credentials

## Need Help?

If you can't find your credentials:
1. Log into your Mx Merchant dashboard
2. Navigate to the API or Developer section
3. Contact Mx Merchant support if credentials are not visible

## Reference

For more information, please refer to the Mx Merchant API documentation you provided.

