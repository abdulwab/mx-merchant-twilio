const axios = require('axios');

const API_URL = 'http://localhost:3000/api/payments/create';

// Example payment request
const paymentRequest = {
  amount: 150.00,
  currency: 'USD',
  invoice: {
    number: 'INV-2024-001',
    description: 'Vehicle service payment'
  },
  customer: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-123-4567'
  },
  redirectUrl: 'https://celebrationchevrolet.com/payment/success',
  cancelUrl: 'https://celebrationchevrolet.com/payment/cancel',
  lineItems: [
    {
      description: 'Oil change service',
      amount: 75.00,
      quantity: 1
    },
    {
      description: 'Tire rotation',
      amount: 75.00,
      quantity: 1
    }
  ]
};

async function testPaymentCreation() {
  try {
    console.log('🚀 Testing Payment Creation...\n');
    console.log('Request Data:');
    console.log(JSON.stringify(paymentRequest, null, 2));
    console.log('\n---\n');

    const response = await axios.post(API_URL, paymentRequest, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Success!');
    console.log('Response:');
    console.log(JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ Error creating payment:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

// Run the test
testPaymentCreation();

