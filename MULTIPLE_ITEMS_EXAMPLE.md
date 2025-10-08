# Multiple Items / Line Items Support

## ✅ Yes, You Can Send Multiple Items!

The API now supports sending multiple line items that will be displayed on the hosted payment page.

## How It Works

When you include `lineItems` in your request, each item is passed to the MX Merchant hosted page with:
- `Item{N}Description` - Description of the item
- `Item{N}Amount` - Price of the item
- `Item{N}Quantity` - Quantity of the item

The hosted payment page will display all items to the customer before they complete payment.

## Example: Single Payment with Multiple Items

### Request

```bash
curl -X POST http://localhost:3000/api/payments/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 250.50,
    "invoice": {
      "number": "INV-MULTI-001",
      "description": "Auto Service Package"
    },
    "customer": {
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phone": "+1-555-999-8888"
    },
    "lineItems": [
      {
        "description": "Oil Change",
        "amount": 89.99,
        "quantity": 1
      },
      {
        "description": "Tire Rotation",
        "amount": 65.00,
        "quantity": 1
      },
      {
        "description": "Air Filter",
        "amount": 45.51,
        "quantity": 2
      },
      {
        "description": "Inspection",
        "amount": 50.00,
        "quantity": 1
      }
    ]
  }'
```

### Response

```json
{
  "success": true,
  "data": {
    "paymentUrl": "https://pay.mxmerchant.com/Link2Pay/[UDID]?Amt=250.50&InvoiceNo=INV-MULTI-001&Item1Description=Oil+Change&Item1Amount=89.99&Item1Quantity=1&Item2Description=Tire+Rotation&Item2Amount=65.00&Item2Quantity=1&Item3Description=Air+Filter&Item3Amount=45.51&Item3Quantity=2&Item4Description=Inspection&Item4Amount=50.00&Item4Quantity=1",
    "amount": 250.5,
    "currency": "USD",
    "invoice": {
      "number": "INV-MULTI-001",
      "description": "Auto Service Package"
    },
    "customer": {
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phone": "+1-555-999-8888"
    },
    "lineItems": [
      {
        "description": "Oil Change",
        "amount": 89.99,
        "quantity": 1
      },
      {
        "description": "Tire Rotation",
        "amount": 65.00,
        "quantity": 1
      },
      {
        "description": "Air Filter",
        "amount": 45.51,
        "quantity": 2
      },
      {
        "description": "Inspection",
        "amount": 50.00,
        "quantity": 1
      }
    ],
    "message": "Redirect customer to paymentUrl to complete payment"
  }
}
```

## Line Item Structure

Each line item can have:

```javascript
{
  "description": "Item name",  // Required - What is this item?
  "amount": 99.99,             // Required - Price per unit
  "quantity": 1                // Optional - How many? (defaults to 1)
}
```

## Use Cases

### 1. **E-commerce Order**
```json
{
  "amount": 159.97,
  "invoice": { "number": "ORD-12345" },
  "customer": { "name": "John Doe", "email": "john@example.com" },
  "lineItems": [
    {
      "description": "Widget Pro",
      "amount": 49.99,
      "quantity": 2
    },
    {
      "description": "Premium Support",
      "amount": 59.99,
      "quantity": 1
    }
  ]
}
```

### 2. **Service Invoice**
```json
{
  "amount": 350.00,
  "invoice": { "number": "SVC-2024-001" },
  "customer": { "name": "Company LLC", "email": "billing@company.com" },
  "lineItems": [
    {
      "description": "Consultation (2 hrs)",
      "amount": 150.00,
      "quantity": 1
    },
    {
      "description": "Implementation",
      "amount": 200.00,
      "quantity": 1
    }
  ]
}
```

### 3. **Subscription with Add-ons**
```json
{
  "amount": 129.99,
  "invoice": { "number": "SUB-2024-Q1" },
  "customer": { "name": "Jane Doe", "email": "jane@example.com" },
  "lineItems": [
    {
      "description": "Basic Plan (Monthly)",
      "amount": 99.99,
      "quantity": 1
    },
    {
      "description": "Extra Storage (10GB)",
      "amount": 10.00,
      "quantity": 1
    },
    {
      "description": "Priority Support",
      "amount": 20.00,
      "quantity": 1
    }
  ]
}
```

### 4. **Restaurant Order**
```json
{
  "amount": 87.50,
  "invoice": { "number": "ORDER-456" },
  "customer": { "name": "Customer Name", "email": "customer@email.com" },
  "lineItems": [
    {
      "description": "Burger Combo",
      "amount": 15.99,
      "quantity": 2
    },
    {
      "description": "Caesar Salad",
      "amount": 12.99,
      "quantity": 1
    },
    {
      "description": "Soft Drink",
      "amount": 2.99,
      "quantity": 3
    },
    {
      "description": "Dessert Special",
      "amount": 8.99,
      "quantity": 2
    }
  ]
}
```

## Important Notes

### 1. **Total Amount**
The `amount` field should be the **total of all items**. Make sure your line items add up correctly:

```javascript
const total = lineItems.reduce((sum, item) => 
  sum + (item.amount * (item.quantity || 1)), 0
);
```

### 2. **Line Item Limits**
While there's no strict limit, keep it reasonable (typically under 20 items) for best display on the hosted page.

### 3. **Optional vs Required**
- `description` - **Required** for each item
- `amount` - **Required** for each item
- `quantity` - **Optional**, defaults to 1 if not provided

### 4. **Display on Hosted Page**
The customer will see all items listed on the MX Merchant hosted payment page before entering their payment details.

## Frontend Integration Example

### React Example

```javascript
import { useState } from 'react';

function CheckoutPage() {
  const [cart, setCart] = useState([
    { description: 'Product A', amount: 29.99, quantity: 2 },
    { description: 'Product B', amount: 49.99, quantity: 1 }
  ]);

  const total = cart.reduce((sum, item) => 
    sum + (item.amount * item.quantity), 0
  );

  const handleCheckout = async () => {
    const response = await fetch('/api/payments/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: total,
        invoice: {
          number: `ORD-${Date.now()}`,
          description: 'Online Order'
        },
        customer: {
          name: 'Customer Name',
          email: 'customer@email.com'
        },
        lineItems: cart
      })
    });

    const data = await response.json();
    
    if (data.success) {
      // Redirect to hosted payment page
      window.location.href = data.data.paymentUrl;
    }
  };

  return (
    <div>
      <h2>Your Cart</h2>
      {cart.map((item, i) => (
        <div key={i}>
          {item.description} - ${item.amount} x {item.quantity}
        </div>
      ))}
      <h3>Total: ${total.toFixed(2)}</h3>
      <button onClick={handleCheckout}>Proceed to Payment</button>
    </div>
  );
}
```

### Vanilla JavaScript Example

```javascript
async function createPaymentWithItems(items) {
  // Calculate total
  const total = items.reduce((sum, item) => 
    sum + (item.amount * (item.quantity || 1)), 0
  );

  // Create payment
  const response = await fetch('/api/payments/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: total,
      invoice: {
        number: generateInvoiceNumber(),
        description: 'Order Payment'
      },
      customer: getCustomerInfo(),
      lineItems: items
    })
  });

  const data = await response.json();
  
  if (data.success) {
    window.location.href = data.data.paymentUrl;
  }
}

// Usage
const orderItems = [
  { description: 'Item 1', amount: 25.00, quantity: 2 },
  { description: 'Item 2', amount: 50.00, quantity: 1 }
];

createPaymentWithItems(orderItems);
```

## Testing

Test with multiple items:

```bash
npm run test:payment
```

Or use curl:

```bash
curl -X POST http://localhost:3000/api/payments/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.00,
    "invoice": {"number": "TEST-001"},
    "customer": {"name": "Test", "email": "test@example.com"},
    "lineItems": [
      {"description": "Item 1", "amount": 50.00, "quantity": 1},
      {"description": "Item 2", "amount": 25.00, "quantity": 2}
    ]
  }'
```

## Summary

✅ **Multiple items supported**  
✅ **Items displayed on hosted page**  
✅ **Flexible quantity handling**  
✅ **Works with any item count**  
✅ **Easy to integrate**  

Your customers will see a clear breakdown of what they're paying for! 🎉

