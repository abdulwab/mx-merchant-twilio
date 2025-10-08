# Twilio Credentials Needed

## 📝 What You Need to Add to .env

To enable SMS functionality, add these 3 credentials to your `.env` file:

```env
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

## 🔑 Where to Find Them

### Step 1: Go to Twilio Console
Visit: https://console.twilio.com/

### Step 2: Get Account SID and Auth Token
On the main dashboard, you'll see:

```
Account Info
├── Account SID: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  ← Copy this
└── Auth Token: [Show] ← Click "Show" and copy
```

### Step 3: Get Phone Number
1. Click **Phone Numbers** in the left menu
2. Click **Manage** → **Active numbers**
3. Copy your phone number (format: `+15551234567`)

**Don't have a number?**
- Click **Buy a number**
- Select a number with SMS capability
- Purchase it (usually $1-2/month)

## ✅ Example Configuration

Your `.env` should look like this:

```env
# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your32characterauthtokenhere123
TWILIO_PHONE_NUMBER=+15551234567
```

## 🎯 Quick Checklist

- [ ] Sign up for Twilio account (free trial available)
- [ ] Copy Account SID from dashboard
- [ ] Copy Auth Token from dashboard (click "Show")
- [ ] Get or buy a phone number with SMS capability
- [ ] Add all three to `.env` file
- [ ] Restart your server (`npm run dev`)
- [ ] Check health: `curl http://localhost:3000/api/health`
- [ ] Should see: `"twilioConfigured": true`

## 🆓 Free Trial

Twilio offers a **free trial** with:
- ~$15 in credits
- SMS to verified numbers only
- Test the integration before paying

**Trial Limitations:**
- Must verify recipient phone numbers in Twilio Console
- SMS includes trial message footer

**To verify numbers:**
1. Go to Twilio Console
2. **Phone Numbers** → **Verified Caller IDs**
3. Add and verify the test number

## 💰 Pricing (After Trial)

- **SMS**: ~$0.0079 per message (US/Canada)
- **Phone Number**: ~$1-2/month
- **Example**: 1,000 SMS = ~$8 + phone rental

## ⚠️ Important Notes

1. **Phone Number Format**: Must be E.164 format
   - ✅ Good: `+15551234567`
   - ❌ Bad: `5551234567` or `(555) 123-4567`

2. **Security**: Keep credentials secret
   - Never commit to git
   - Use environment variables only

3. **Optional Feature**: API works without Twilio
   - Payment links still created
   - Just no SMS sent

## 🧪 Testing

After adding credentials and restarting:

```bash
# Check configuration
curl http://localhost:3000/api/health

# Should return:
{
  "status": "healthy",
  "twilioConfigured": true  ← Should be true now
}

# Test SMS
npm run test:payment
```

If configured correctly, you'll see in the server logs:
```
✅ Twilio SMS enabled
✅ SMS sent to +15551234567 - SID: SM1234567890
```

## 📚 More Help

See `TWILIO_SMS_SETUP.md` for:
- Detailed setup instructions
- Phone number format conversion
- Customizing SMS messages
- Error handling
- Frontend integration examples

## 🎉 Once Configured

Your API will automatically:
- Send payment links via SMS when phone provided
- Include SMS status in API response
- Continue working even if SMS fails
- Allow disabling SMS per request

**Ready to add your Twilio credentials?** Just copy them into your `.env` file! 🚀

