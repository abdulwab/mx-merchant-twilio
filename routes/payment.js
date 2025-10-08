const express = require('express');
const router = express.Router();
const axios = require('axios');

// Mx Merchant API configuration
const MX_CONFIG = {
  apiKey: process.env.MX_API_KEY,
  apiSecret: process.env.MX_API_SECRET,
  merchantId: process.env.MX_MERCHANT_ID,
  baseURL: process.env.MX_BASE_URL || 'https://api.mxmerchant.com/checkout/v3',
  paymentPageBaseURL: process.env.MX_PAYMENT_PAGE_URL || 'https://pay.mxmerchant.com'
};

// Twilio configuration
const TWILIO_CONFIG = {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  phoneNumber: process.env.TWILIO_PHONE_NUMBER
};

// AWS SES configuration
const AWS_SES_CONFIG = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  fromEmail: process.env.SES_FROM_EMAIL
};

// Initialize Twilio client only if credentials are provided
let twilioClient = null;
if (TWILIO_CONFIG.accountSid && TWILIO_CONFIG.authToken && TWILIO_CONFIG.phoneNumber) {
  const twilio = require('twilio');
  twilioClient = twilio(TWILIO_CONFIG.accountSid, TWILIO_CONFIG.authToken);
  console.log('✅ Twilio SMS enabled');
} else {
  console.log('⚠️  Twilio SMS disabled (credentials not configured)');
}

// Initialize AWS SES client only if credentials are provided
let sesClient = null;
if (AWS_SES_CONFIG.accessKeyId && AWS_SES_CONFIG.secretAccessKey && AWS_SES_CONFIG.region && AWS_SES_CONFIG.fromEmail) {
  const { SESClient } = require('@aws-sdk/client-ses');
  sesClient = new SESClient({
    region: AWS_SES_CONFIG.region,
    credentials: {
      accessKeyId: AWS_SES_CONFIG.accessKeyId,
      secretAccessKey: AWS_SES_CONFIG.secretAccessKey
    }
  });
  console.log('✅ AWS SES Email enabled');
} else {
  console.log('⚠️  AWS SES Email disabled (credentials not configured)');
}

// Helper function to get API headers
const getHeaders = () => {
  // Create Basic Auth token (API Key:API Secret in base64)
  const auth = Buffer.from(`${MX_CONFIG.apiKey}:${MX_CONFIG.apiSecret}`).toString('base64');
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${auth}`
  };
};

// Cache for Link2Pay device UDID (to avoid creating multiple devices)
let link2PayDeviceUDID = null;

// Helper function to send SMS via Twilio
async function sendPaymentLinkSMS(phoneNumber, paymentUrl, invoiceNumber, amount) {
  if (!twilioClient) {
    console.log('SMS not sent - Twilio not configured');
    return { sent: false, reason: 'Twilio not configured' };
  }

  try {
    // Format the SMS message
    const message = `Payment Link for Invoice ${invoiceNumber}\n\nAmount: $${amount.toFixed(2)}\n\nPay here: ${paymentUrl}\n\nThank you!`;

    // Send SMS
    const result = await twilioClient.messages.create({
      body: message,
      from: TWILIO_CONFIG.phoneNumber,
      to: phoneNumber
    });

    console.log(`✅ SMS sent to ${phoneNumber} - SID: ${result.sid}`);
    return { 
      sent: true, 
      messageSid: result.sid,
      to: phoneNumber 
    };

  } catch (error) {
    console.error('❌ Error sending SMS:', error.message);
    return { 
      sent: false, 
      error: error.message 
    };
  }
}

// Helper function to send Email via AWS SES
async function sendPaymentLinkEmail(email, customerName, paymentUrl, invoiceNumber, amount, lineItems = []) {
  if (!sesClient) {
    console.log('Email not sent - AWS SES not configured');
    return { sent: false, reason: 'AWS SES not configured' };
  }

  try {
    const { SendEmailCommand } = require('@aws-sdk/client-ses');

    // Build line items HTML
    let lineItemsHtml = '';
    if (lineItems && lineItems.length > 0) {
      lineItemsHtml = `
        <h3 style="color: #333; margin-top: 20px;">Items:</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Description</th>
            <th style="padding: 10px; text-align: center; border-bottom: 2px solid #dee2e6;">Qty</th>
            <th style="padding: 10px; text-align: right; border-bottom: 2px solid #dee2e6;">Amount</th>
          </tr>
          ${lineItems.map(item => `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">${item.description}</td>
              <td style="padding: 10px; text-align: center; border-bottom: 1px solid #dee2e6;">${item.quantity || 1}</td>
              <td style="padding: 10px; text-align: right; border-bottom: 1px solid #dee2e6;">$${parseFloat(item.amount).toFixed(2)}</td>
            </tr>
          `).join('')}
        </table>
      `;
    }

    // HTML email template
    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Payment Request</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hello ${customerName},
              </p>
              
              <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 30px 0;">
                You have a payment request for invoice <strong>${invoiceNumber}</strong>.
              </p>
              
              ${lineItemsHtml}
              
              <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0;">
                <p style="color: #333; font-size: 18px; margin: 0;">
                  <strong>Total Amount:</strong>
                </p>
                <p style="color: #667eea; font-size: 32px; font-weight: bold; margin: 10px 0 0 0;">
                  $${amount.toFixed(2)}
                </p>
              </div>
              
              <!-- Payment Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${paymentUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                      Pay Now
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #999; font-size: 12px; line-height: 1.6; margin: 20px 0 0 0; text-align: center;">
                Or copy this link: <br/>
                <a href="${paymentUrl}" style="color: #667eea; word-break: break-all;">${paymentUrl}</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #dee2e6;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                This is an automated payment notification. Please do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Plain text version
    const textBody = `
Payment Request for Invoice ${invoiceNumber}

Hello ${customerName},

You have a payment request for invoice ${invoiceNumber}.

${lineItems.length > 0 ? '\nItems:\n' + lineItems.map(item => `- ${item.description}: $${parseFloat(item.amount).toFixed(2)} x ${item.quantity || 1}`).join('\n') + '\n' : ''}

Total Amount: $${amount.toFixed(2)}

Click here to pay: ${paymentUrl}

Thank you!
    `;

    const command = new SendEmailCommand({
      Source: AWS_SES_CONFIG.fromEmail,
      Destination: {
        ToAddresses: [email]
      },
      Message: {
        Subject: {
          Data: `Payment Request - Invoice ${invoiceNumber}`,
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: htmlBody,
            Charset: 'UTF-8'
          },
          Text: {
            Data: textBody,
            Charset: 'UTF-8'
          }
        }
      }
    });

    const result = await sesClient.send(command);
    console.log(`✅ Email sent to ${email} - MessageId: ${result.MessageId}`);
    
    return {
      sent: true,
      messageId: result.MessageId,
      to: email
    };

  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    return {
      sent: false,
      error: error.message
    };
  }
}

// Helper function to get or create Link2Pay device
async function getLink2PayDevice() {
  // If we already have a UDID cached, return it
  if (link2PayDeviceUDID) {
    return link2PayDeviceUDID;
  }

  try {
    // First, try to get existing Link2Pay devices
    const listResponse = await axios.get(
      `${MX_CONFIG.baseURL}/device`,
      {
        headers: getHeaders(),
        params: {
          merchantId: MX_CONFIG.merchantId,
          deviceType: 'Link2Pay'
        }
      }
    );

    // If we have existing Link2Pay devices, use the first enabled one
    if (listResponse.data && listResponse.data.length > 0) {
      const existingDevice = listResponse.data.find(device => device.enabled && device.deviceType === 'Link2Pay');
      
      if (existingDevice) {
        link2PayDeviceUDID = existingDevice.UDID;
        console.log('Using existing Link2Pay device with UDID:', link2PayDeviceUDID);
        return link2PayDeviceUDID;
      }
    }

    // If no existing device found, create a new one with a unique name
    const timestamp = Date.now();
    const deviceData = {
      name: `Payment Link API ${timestamp}`,
      description: 'Hosted payment page for API',
      deviceType: 'Link2Pay',
      merchantId: parseInt(MX_CONFIG.merchantId),
      enabled: true,
      onSuccessUrl: 'https://celebrationchevrolet.com/payment/success',
      onFailureUrl: 'https://celebrationchevrolet.com/payment/cancel'
    };

    const response = await axios.post(
      `${MX_CONFIG.baseURL}/device?echo=true`,
      deviceData,
      {
        headers: getHeaders()
      }
    );

    link2PayDeviceUDID = response.data.UDID;
    console.log('Created new Link2Pay device with UDID:', link2PayDeviceUDID);
    return link2PayDeviceUDID;

  } catch (error) {
    console.error('Error with Link2Pay device:', error.response?.data || error.message);
    throw error;
  }
}

// Create Payment Link endpoint
router.post('/create', async (req, res) => {
  try {
    const requestBody = req.body;

    // Validate required fields
    if (!requestBody.amount) {
      return res.status(400).json({
        success: false,
        error: 'Amount is required'
      });
    }

    if (!requestBody.invoice || !requestBody.invoice.number) {
      return res.status(400).json({
        success: false,
        error: 'Invoice number is required'
      });
    }

    if (!requestBody.customer || !requestBody.customer.name || !requestBody.customer.email) {
      return res.status(400).json({
        success: false,
        error: 'Customer name and email are required'
      });
    }

    // Get or create Link2Pay device
    const udid = await getLink2PayDevice();

    // Prepare payment amount and customer data
    const amount = parseFloat(requestBody.amount);
    const invoiceNumber = requestBody.invoice.number;
    const description = requestBody.invoice.description || `Payment for ${invoiceNumber}`;
    const lineItems = requestBody.lineItems || [];
    
    // Build query parameters for the payment URL
    const params = new URLSearchParams({
      Amt: amount.toFixed(2),
      InvoiceNo: invoiceNumber,
      CustomerName: requestBody.customer.name,
      CustomerEmail: requestBody.customer.email
    });

    // Add optional phone if provided
    if (requestBody.customer.phone) {
      params.append('CustomerPhone', requestBody.customer.phone);
    }

    // Add description/memo if provided
    if (description) {
      params.append('Memo', description);
    }

    // Add line items if provided
    // MX Merchant supports adding multiple line items to display on the hosted page
    if (lineItems && lineItems.length > 0) {
      lineItems.forEach((item, index) => {
        // Add each line item with indexed parameters
        if (item.description) {
          params.append(`Item${index + 1}Description`, item.description);
        }
        if (item.amount) {
          params.append(`Item${index + 1}Amount`, parseFloat(item.amount).toFixed(2));
        }
        if (item.quantity) {
          params.append(`Item${index + 1}Quantity`, item.quantity);
        }
      });
    }

    // Construct the payment URL
    const paymentUrl = `${MX_CONFIG.paymentPageBaseURL}/Link2Pay/${udid}?${params.toString()}`;

    // Send SMS if phone number is provided and sendSms is true (default: true if phone exists)
    const shouldSendSms = requestBody.sendSms !== false; // Default to true if not specified
    let smsResult = null;

    if (requestBody.customer.phone && shouldSendSms) {
      smsResult = await sendPaymentLinkSMS(
        requestBody.customer.phone,
        paymentUrl,
        invoiceNumber,
        amount
      );
    }

    // Send Email if email is provided and sendEmail is true (default: true if email exists)
    const shouldSendEmail = requestBody.sendEmail !== false; // Default to true if not specified
    let emailResult = null;

    if (requestBody.customer.email && shouldSendEmail) {
      emailResult = await sendPaymentLinkEmail(
        requestBody.customer.email,
        requestBody.customer.name,
        paymentUrl,
        invoiceNumber,
        amount,
        lineItems
      );
    }

    // Build response message
    let responseMessage = 'Payment link created';
    const notifications = [];
    if (smsResult?.sent) notifications.push('SMS sent');
    if (emailResult?.sent) notifications.push('Email sent');
    if (notifications.length > 0) {
      responseMessage += ` and ${notifications.join(' and ')} to customer`;
    } else {
      responseMessage += '. Redirect customer to paymentUrl to complete payment';
    }

    // Return the hosted payment URL
    res.json({
      success: true,
      data: {
        paymentUrl: paymentUrl,
        amount: amount,
        currency: requestBody.currency || 'USD',
        invoice: {
          number: invoiceNumber,
          description: description
        },
        customer: {
          name: requestBody.customer.name,
          email: requestBody.customer.email,
          phone: requestBody.customer.phone
        },
        lineItems: lineItems,
        sms: smsResult,
        email: emailResult,
        message: responseMessage
      }
    });

  } catch (error) {
    console.error('Payment link creation error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.message || 'Failed to create payment link',
      details: error.response?.data
    });
  }
});

// Get Payment Status endpoint
router.get('/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;

    const response = await axios.get(
      `${MX_CONFIG.baseURL}/payments/${paymentId}`,
      {
        headers: getHeaders()
      }
    );

    res.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('Payment retrieval error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.message || 'Failed to retrieve payment',
      details: error.response?.data
    });
  }
});

// List Payments endpoint
router.get('/', async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;

    const response = await axios.get(
      `${MX_CONFIG.baseURL}/payments`,
      {
        headers: getHeaders(),
        params: { limit, offset }
      }
    );

    res.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('Payment list error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.message || 'Failed to retrieve payments',
      details: error.response?.data
    });
  }
});

module.exports = router;

