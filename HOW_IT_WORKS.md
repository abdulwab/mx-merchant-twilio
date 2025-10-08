# How MX Merchant Hosted Checkout Works

## Overview

The MX Merchant integration creates **hosted payment pages** where customers securely enter their payment information. You never handle sensitive card data directly.

## Payment Flow

```
┌─────────────┐      1. Create Payment Link      ┌─────────────┐
│             │────────────────────────────────>  │             │
│  Your App   │                                   │  Your API   │
│             │ <────────────────────────────────│             │
│             │      2. Return Payment URL        └─────────────┘
└─────────────┘                                          │
      │                                                  │
      │ 3. Redirect                                      │ Calls MX API
      │    Customer                                      ▼
      │                                           ┌─────────────┐
      ▼                                           │             │
┌─────────────┐                                  │ MX Merchant │
│             │                                   │     API     │
│  Customer   │◄─────────────────────────────────│             │
│   Browser   │  4. Shows Hosted Payment Page    └─────────────┘
│             │
└─────────────┘
      │
      │ 5. Enters Payment Details
      │
      ▼
┌─────────────┐
│             │
│ MX Merchant │
│   Hosted    │
│   Payment   │
│    Page     │
│             │
└─────────────┘
      │
      │ 6. Payment Processed
      │
      ▼
┌─────────────┐
│             │
│  Redirect   │
│  Customer   │
│    Back     │
│             │
└─────────────┘
```

## Implementation Steps

### 1. Create a Payment Link

Call your API endpoint with payment details:

```javascript
POST /api/payments/create
Content-Type: application/json

{
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
  "redirectUrl": "https://yoursite.com/payment/success",
  "cancelUrl": "https://yoursite.com/payment/cancel"
}
```

### 2. Receive Payment URL

Your API returns a hosted payment URL:

```javascript
{
  "success": true,
  "data": {
    "paymentUrl": "https://pay.mxmerchant.com/Link2Pay/[UDID]?Amt=150.00&InvoiceNo=INV-2024-001...",
    "amount": 150,
    "invoice": { ... },
    "customer": { ... },
    "message": "Redirect customer to paymentUrl to complete payment"
  }
}
```

### 3. Redirect Customer

Redirect the customer to the `paymentUrl`:

**JavaScript Example:**
```javascript
// Frontend code
async function createPayment() {
  const response = await fetch('/api/payments/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: 150.00,
      invoice: { number: 'INV-001' },
      customer: { 
        name: 'John Doe', 
        email: 'john@example.com' 
      }
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Redirect customer to hosted payment page
    window.location.href = data.data.paymentUrl;
  }
}
```

**React Example:**
```javascript
const handlePayment = async () => {
  try {
    const response = await fetch('/api/payments/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Redirect to hosted payment page
      window.location.href = result.data.paymentUrl;
    }
  } catch (error) {
    console.error('Payment creation failed:', error);
  }
};
```

### 4. Customer Completes Payment

The customer is now on the MX Merchant hosted page where they:
- See the payment amount and invoice details
- Enter their payment information (card, bank account, etc.)
- Submit the payment

### 5. Customer Returns to Your Site

After payment completion (success or failure), the customer is redirected back to:
- **Success**: `https://yoursite.com/payment/success`
- **Cancel/Failure**: `https://yoursite.com/payment/cancel`

You can add query parameters to track the payment:
```javascript
redirectUrl: `https://yoursite.com/payment/success?invoice=${invoiceNumber}`
```

## Behind the Scenes

### What the API Does

1. **First Request**: Creates a Link2Pay device (cached for reuse)
   ```javascript
   POST /checkout/v3/device
   {
     "deviceType": "Link2Pay",
     "merchantId": 1000131016,
     "enabled": true,
     "onSuccessUrl": "...",
     "onFailureUrl": "..."
   }
   ```
   Returns a UDID (Unique Device Identifier)

2. **For Each Payment**: Constructs a URL with payment details
   ```
   https://pay.mxmerchant.com/Link2Pay/{UDID}?
     Amt=150.00&
     InvoiceNo=INV-001&
     CustomerName=John+Doe&
     CustomerEmail=john@example.com&
     CustomerPhone=%2B1234567890&
     Memo=Payment+description
   ```

### Query Parameters

The payment URL includes these parameters:

| Parameter | Description | Required |
|-----------|-------------|----------|
| `Amt` | Payment amount | Yes |
| `InvoiceNo` | Invoice number | Yes |
| `CustomerName` | Customer name | Yes |
| `CustomerEmail` | Customer email | Yes |
| `CustomerPhone` | Customer phone | No |
| `Memo` | Payment description | No |

## Security Benefits

✅ **PCI Compliance**: You never handle card data directly  
✅ **Secure**: Payment details entered on MX Merchant's secure page  
✅ **Hosted**: MX handles all payment processing and security  
✅ **Encrypted**: All data transmitted securely via HTTPS  

## Testing

### Test the Integration

```bash
# Start your server
npm run dev

# Run the test script
npm run test:payment
```

### Test in Browser

1. Call your payment creation endpoint
2. Copy the `paymentUrl` from the response
3. Open it in a browser
4. You should see the MX Merchant hosted payment page
5. Enter test payment details (check MX docs for test cards)

## Production Checklist

Before going live:

- [ ] Test complete payment flow in sandbox
- [ ] Verify success/cancel URLs are correct
- [ ] Test with various payment amounts
- [ ] Handle redirect responses properly
- [ ] Set up webhook notifications (optional)
- [ ] Update to production credentials
- [ ] Change `MX_BASE_URL` to production URL

## Webhook Integration (Optional)

For real-time payment notifications, you can set up webhooks to receive payment status updates even if the customer doesn't complete the redirect.

See the MX Merchant documentation for webhook setup.

## Support

- **API Docs**: https://developer.mxmerchant.com
- **Sandbox Portal**: https://sandbox.mxmerchant.com
- **Production Portal**: https://mxmerchant.com

