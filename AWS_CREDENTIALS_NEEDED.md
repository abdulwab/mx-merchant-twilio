# AWS SES Credentials Needed

## 📝 What You Need to Add to .env

To enable email functionality, add these 4 credentials to your `.env` file:

```env
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
SES_FROM_EMAIL=
```

## 🔑 Where to Find Them

### 1. **AWS_ACCESS_KEY_ID** & **AWS_SECRET_ACCESS_KEY**

**Create IAM User:**
1. Go to https://console.aws.amazon.com/iam/
2. Click **Users** → **Add users**
3. Username: `ses-api-user`
4. Access type: **Programmatic access** ✓
5. **Next: Permissions**
6. Attach policy: **AmazonSESFullAccess**
7. **Create user**
8. **SAVE THESE** (shown only once):
   - Access Key ID → `AWS_ACCESS_KEY_ID`
   - Secret Access Key → `AWS_SECRET_ACCESS_KEY`

### 2. **AWS_REGION**

Choose the region closest to your customers:
- `us-east-1` - US East (N. Virginia) - Most common
- `us-west-2` - US West (Oregon)
- `eu-west-1` - EU (Ireland)
- `ap-south-1` - Asia Pacific (Mumbai)

Example: `AWS_REGION=us-east-1`

### 3. **SES_FROM_EMAIL**

**Must be a verified email or domain!**

**Option A: Verify Single Email (Quick)**
1. Go to https://console.aws.amazon.com/ses/
2. **Verified identities** → **Create identity**
3. Type: **Email address**
4. Enter: `noreply@yourdomain.com`
5. **Create identity**
6. **Check email** and click verification link
7. Use this email: `SES_FROM_EMAIL=noreply@yourdomain.com`

**Option B: Verify Domain (Production)**
1. SES Console → **Verified identities** → **Create identity**
2. Type: **Domain**
3. Enter your domain: `yourdomain.com`
4. Follow DNS verification steps
5. Once verified, use any email: `SES_FROM_EMAIL=noreply@yourdomain.com`

## ✅ Example Configuration

```env
# AWS SES Email Configuration
AWS_ACCESS_KEY_ID=AKIAxxxxxxxxxxxx
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_REGION=us-east-1
SES_FROM_EMAIL=noreply@yourdomain.com
```

## 🎯 Quick Checklist

- [ ] Sign up for AWS account (free tier available)
- [ ] Create IAM user with SES permissions
- [ ] Save Access Key ID and Secret Access Key
- [ ] Choose AWS region
- [ ] Verify email address or domain in SES
- [ ] Add all 4 credentials to `.env`
- [ ] Restart server: `npm run dev`
- [ ] Check: `curl http://localhost:3000/api/health`
- [ ] Should see: `"sesConfigured": true`

## ⚠️ Sandbox Mode

New AWS accounts start in **Sandbox Mode**:

**Limitations:**
- Can only send to verified emails
- Max 200 emails/day
- Max 1 email/second

**To Verify Test Emails:**
1. SES Console → **Verified identities**
2. **Create identity** → Email address
3. Enter test email
4. Verify via email link
5. Now you can send to it!

**To Remove Limitations:**
1. SES Console → **Account dashboard**
2. **Request production access**
3. Fill form (usually approved in 24 hours)

## 💰 Cost

**Very Affordable:**
- First 62,000 emails/month: **FREE** (from EC2)
- Or: **$0.10 per 1,000 emails**
- Example: 10,000 emails = **$1**

## 🧪 Testing

After adding credentials:

```bash
# Check configuration
curl http://localhost:3000/api/health

# Should return:
{
  "sesConfigured": true  ← Should be true
}

# Test email
curl -X POST http://localhost:3000/api/payments/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "invoice": {"number": "TEST-001"},
    "customer": {
      "name": "Test User",
      "email": "your-verified-email@example.com"
    }
  }'
```

Check your inbox for the payment email! 📧

## 🔒 Security

**Keep credentials safe:**
- ✅ Never commit to git
- ✅ Use environment variables
- ✅ Use IAM user (not root)
- ✅ Rotate keys regularly
- ❌ Don't share publicly

## 📚 More Help

See `AWS_SES_SETUP.md` for:
- Detailed setup instructions
- Email template customization
- Troubleshooting
- Production access request
- Advanced configuration

## 🎉 Once Configured

Your API will automatically:
- Send beautiful HTML emails when email provided
- Include line items in formatted table
- Show professional payment request
- Return email delivery status
- Work even if email fails

**Ready to add your AWS credentials?** Just copy them into your `.env` file! 🚀

