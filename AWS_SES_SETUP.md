# AWS SES Email Integration Guide

## Overview

The API now automatically sends payment links via **beautiful HTML emails** to customers! 📧

When you create a payment link with a customer email, the system will:
1. Create the hosted payment URL
2. Send a professional HTML email with the payment link
3. Include all line items in a formatted table
4. Return both the URL and email delivery status

## Required AWS Credentials

You need **4 credentials** from AWS. Add them to your `.env` file:

```env
AWS_ACCESS_KEY_ID=your_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
AWS_REGION=us-east-1
SES_FROM_EMAIL=noreply@yourdomain.com
```

## How to Get AWS SES Credentials

### Step 1: Create AWS Account

1. Go to https://aws.amazon.com/
2. Sign up or log in to AWS Console
3. Navigate to **SES (Simple Email Service)**

### Step 2: Verify Your Email Domain or Address

**Option A: Verify a Single Email (Quick Test)**
1. Go to SES Console → **Verified identities**
2. Click **Create identity**
3. Select **Email address**
4. Enter your email (e.g., `noreply@yourdomain.com`)
5. Click **Create identity**
6. Check your email and click verification link
7. Use this email as `SES_FROM_EMAIL`

**Option B: Verify Domain (Production)**
1. Go to SES Console → **Verified identities**
2. Click **Create identity**
3. Select **Domain**
4. Enter your domain (e.g., `yourdomain.com`)
5. Follow DNS verification steps
6. Once verified, you can send from any email @yourdomain.com

### Step 3: Create IAM User with SES Access

1. Go to **IAM** service in AWS Console
2. Click **Users** → **Add users**
3. Enter username (e.g., `ses-api-user`)
4. Select **Access key - Programmatic access**
5. Click **Next: Permissions**
6. Click **Attach existing policies directly**
7. Search and select **AmazonSESFullAccess**
8. Click through to **Create user**
9. **IMPORTANT**: Save the credentials shown:
   - **Access Key ID** → `AWS_ACCESS_KEY_ID`
   - **Secret Access Key** → `AWS_SECRET_ACCESS_KEY`

### Step 4: Request Production Access (For High Volume)

**Note:** New AWS accounts start in "Sandbox Mode" with limitations.

**Sandbox Limitations:**
- Can only send to verified email addresses
- Max 200 emails per day
- Max 1 email per second

**To Request Production Access:**
1. Go to SES Console
2. Click **Account dashboard**
3. Click **Request production access**
4. Fill out the form:
   - **Mail type**: Transactional
   - **Website URL**: Your website
   - **Use case description**: "Sending payment links to customers"
   - **Compliance**: Confirm you follow best practices
5. Submit (usually approved within 24 hours)

## Example .env Configuration

```env
# AWS SES Email Configuration
AWS_ACCESS_KEY_ID=AKIAxxxxxxxxxxxx
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_REGION=us-east-1
SES_FROM_EMAIL=noreply@yourdomain.com
```

### AWS Regions

Common SES regions:
- `us-east-1` (N. Virginia) - Most common
- `us-west-2` (Oregon)
- `eu-west-1` (Ireland)
- `ap-south-1` (Mumbai)

Choose the region closest to your customers.

## Email Template

The API sends a beautiful, professional HTML email:

### Features:
- ✅ **Responsive design** - Works on mobile and desktop
- ✅ **Professional gradient header**
- ✅ **Line items table** - Shows all items being paid for
- ✅ **Large "Pay Now" button**
- ✅ **Plain text fallback** - For email clients that don't support HTML

### Preview:

```
┌─────────────────────────────────────────┐
│       Payment Request                    │ ← Purple gradient header
├─────────────────────────────────────────┤
│ Hello John Doe,                         │
│                                          │
│ You have a payment request for          │
│ invoice INV-12345.                      │
│                                          │
│ Items:                                   │
│ ┌───────────────┬─────┬────────┐       │
│ │ Description   │ Qty │ Amount  │       │
│ ├───────────────┼─────┼────────┤       │
│ │ Oil Change    │  1  │ $89.99  │       │
│ │ Tire Rotation │  1  │ $65.00  │       │
│ └───────────────┴─────┴────────┘       │
│                                          │
│ Total Amount: $154.99                   │
│                                          │
│      [   Pay Now   ]  ← Big button      │
│                                          │
│ Or copy this link:                      │
│ https://pay.mxmerchant.com/...          │
└─────────────────────────────────────────┘
```

## How to Use

### Automatic Email (Default)

When you include an email in the payload, email is sent automatically:

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
      "email": "customer@example.com"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentUrl": "https://pay.mxmerchant.com/Link2Pay/...",
    "email": {
      "sent": true,
      "messageId": "01000abc123def456",
      "to": "customer@example.com"
    },
    "message": "Payment link created and Email sent to customer"
  }
}
```

### With Line Items (Beautiful Table in Email)

```bash
curl -X POST http://localhost:3000/api/payments/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 250.50,
    "invoice": {"number": "INV-002"},
    "customer": {
      "name": "Jane Smith",
      "email": "jane@example.com"
    },
    "lineItems": [
      {"description": "Oil Change", "amount": 89.99, "quantity": 1},
      {"description": "Tire Rotation", "amount": 65.00, "quantity": 1},
      {"description": "Air Filter", "amount": 45.51, "quantity": 2}
    ]
  }'
```

The email will show all items in a formatted table!

### Disable Email for Specific Request

```json
{
  "amount": 100.00,
  "invoice": {"number": "INV-001"},
  "customer": {
    "name": "John Doe",
    "email": "customer@example.com"
  },
  "sendEmail": false
}
```

## Checking SES Status

```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
  "status": "healthy",
  "mxConfigured": true,
  "twilioConfigured": true,
  "sesConfigured": true  ← Shows email status
}
```

## Response Fields

### Email Sent Successfully

```json
{
  "email": {
    "sent": true,
    "messageId": "01000abc123def456",
    "to": "customer@example.com"
  }
}
```

### Email Failed

```json
{
  "email": {
    "sent": false,
    "error": "Email address is not verified"
  }
}
```

### SES Not Configured

```json
{
  "email": {
    "sent": false,
    "reason": "AWS SES not configured"
  }
}
```

## Sandbox Mode Limitations

**In Sandbox Mode you can only send to:**
- Verified email addresses
- Verified domains

**To Verify Test Email Addresses:**
1. Go to SES Console → **Verified identities**
2. Click **Create identity** → **Email address**
3. Enter test email
4. Verify via link sent to that email
5. Now you can send to it!

**To Remove Sandbox Limitations:**
- Request production access (see Step 4 above)
- Usually approved in 24 hours

## Cost

AWS SES is **very affordable**:

- **First 62,000 emails/month**: FREE (if sending from EC2)
- **Or**: $0.10 per 1,000 emails
- **Example**: 10,000 emails = $1

**Much cheaper than most email services!**

## Common Errors & Solutions

### "Email address is not verified"
**Solution**: Verify the sender email in SES Console

### "Message rejected: Email address is not verified"  
**Solution**: You're in sandbox mode. Verify recipient email or request production access

### "User is not authorized to perform: ses:SendEmail"
**Solution**: IAM user needs `AmazonSESFullAccess` policy

### "InvalidParameterValue: Missing final '@domain'"
**Solution**: Check that `SES_FROM_EMAIL` is a valid email address

## Testing

### Test Email Sending

```bash
# Create payment with email
curl -X POST http://localhost:3000/api/payments/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.00,
    "invoice": {"number": "TEST-001"},
    "customer": {
      "name": "Test User",
      "email": "your-verified-email@example.com"
    }
  }'
```

Check your inbox! You should receive a beautiful payment email. 📧

## Customize Email Template

To customize the email design, edit the `sendPaymentLinkEmail` function in `/routes/payment.js`:

```javascript
// Find the htmlBody variable and modify the HTML
const htmlBody = `
<!DOCTYPE html>
... your custom HTML ...
</html>
`;
```

## Send Both SMS and Email

When both phone and email are provided, both notifications are sent:

```bash
curl -X POST http://localhost:3000/api/payments/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 150.00,
    "invoice": {"number": "INV-001"},
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
  "sms": {
    "sent": true,
    "messageSid": "SM123...",
    "to": "+15551234567"
  },
  "email": {
    "sent": true,
    "messageId": "01000...",
    "to": "john@example.com"
  },
  "message": "Payment link created and SMS sent and Email sent to customer"
}
```

## Security Best Practices

1. **Never commit credentials** - Keep `.env` in `.gitignore`
2. **Use IAM user** - Don't use root account credentials
3. **Least privilege** - Only grant necessary SES permissions
4. **Rotate keys regularly** - Update access keys periodically
5. **Monitor usage** - Set up CloudWatch alerts for unusual activity
6. **Verify sender domain** - Use DKIM and SPF for better deliverability

## Summary

✅ **Professional HTML emails** - Beautiful, responsive design  
✅ **Automatic sending** - When email provided  
✅ **Line items included** - Shows payment details  
✅ **Optional** - Works without AWS SES  
✅ **Affordable** - $0.10 per 1,000 emails  
✅ **Reliable** - 99.9% delivery rate  

Your customers will receive beautiful payment link emails! 📧✨

