# Payment API Payload Examples - Hosted Checkout

## Create Hosted Payment Link

This API creates a secure hosted payment page URL that you can redirect your customers to. The customer enters their payment details on the MX Merchant secure page, not on your site.

### Endpoint
```
POST /api/payments/create
```

### Required Headers
```
Content-Type: application/json
```

### Request Body Structure

```json
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
}
```

### Field Descriptions

| Field | Type | Required | Description | Default |
|-------|------|----------|-------------|---------|
| `amount` | Number | Yes | Total payment amount | - |
| `currency` | String | No | Currency code (ISO 4217) | "USD" |
| `invoice.number` | String | Yes | Unique invoice number | - |
| `invoice.description` | String | No | Invoice description | "Payment for {invoice.number}" |
| `customer.name` | String | Yes | Customer full name | - |
| `customer.email` | String | Yes | Customer email address | - |
| `customer.phone` | String | No | Customer phone number | - |
| `redirectUrl` | String | No | Success redirect URL | "https://celebrationchevrolet.com/payment/success" |
| `cancelUrl` | String | No | Cancel redirect URL | "https://celebrationchevrolet.com/payment/cancel" |
| `lineItems` | Array | No | Array of line items | [] |

### Line Item Structure

Each item in the `lineItems` array should have:

```json
{
  "description": "Item description",
  "amount": 75.00,
  "quantity": 1
}
```

## Example Requests

### Minimal Request (Required Fields Only)

```json
{
  "amount": 100.00,
  "invoice": {
    "number": "INV-001"
  },
  "customer": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Complete Request with All Fields

```json
{
  "amount": 250.50,
  "currency": "USD",
  "invoice": {
    "number": "INV-2024-12345",
    "description": "Annual service package"
  },
  "customer": {
    "name": "Jane Smith",
    "email": "jane.smith@email.com",
    "phone": "+1-555-987-6543"
  },
  "redirectUrl": "https://celebrationchevrolet.com/payment/success?order=12345",
  "cancelUrl": "https://celebrationchevrolet.com/payment/cancel?order=12345",
  "lineItems": [
    {
      "description": "Full synthetic oil change",
      "amount": 89.99,
      "quantity": 1
    },
    {
      "description": "Cabin air filter replacement",
      "amount": 45.00,
      "quantity": 1
    },
    {
      "description": "4-wheel tire rotation and balance",
      "amount": 65.51,
      "quantity": 1
    },
    {
      "description": "Multi-point inspection",
      "amount": 50.00,
      "quantity": 1
    }
  ]
}
```

## Response Examples

### Success Response

The API returns a hosted payment URL that you should redirect your customer to:

```json
{
  "success": true,
  "data": {
    "paymentUrl": "https://pay.mxmerchant.com/Link2Pay/1751813B-2765-4275-9D5A-95CDD6FB7FB9?Amt=150.00&InvoiceNo=INV-2024-001&CustomerName=John+Doe&CustomerEmail=john.doe%40example.com&CustomerPhone=%2B1-555-123-4567&Memo=Vehicle+service+payment",
    "amount": 150,
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
    "message": "Redirect customer to paymentUrl to complete payment"
  }
}
```

**Important**: Redirect your customer to the `paymentUrl` where they will enter their payment details securely on the MX Merchant hosted page.

### Error Response

```json
{
  "success": false,
  "error": "Customer name and email are required"
}
```

## Testing with cURL

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

## Testing with the Test Script

We've included a test script in the project. To use it:

1. Make sure your server is running:
   ```bash
   npm run dev
   ```

2. In a new terminal, run the test script:
   ```bash
   node test-payment.js
   ```

This will send a sample payment request and display the response.

