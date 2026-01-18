// File: /api/webhook.js
// Webhook untuk menerima payment confirmation dari Pakasir

export const config = {
  runtime: 'edge',
};

// Pakasir Secret Key dari Bos
const PAKASIR_SECRET = '0U9NxUQJHnMKcROslIzDNjLuxtgdZJsB';

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Verifikasi signature (optional, tapi recommended)
    // const signature = request.headers.get('x-pakasir-signature');
    // if (!verifySignature(signature, await request.clone().text())) {
    //   return new Response(JSON.stringify({ error: 'Invalid signature' }), {
    //     status: 401,
    //     headers: { 'Content-Type': 'application/json' },
    //   });
    // }

    const payload = await request.json();
    
    // Log webhook untuk debugging
    console.log('Pakasir Webhook Received:', JSON.stringify(payload, null, 2));
    
    const { 
      event,
      data: {
        transaction_id,
        status,
        customer_email,
        amount,
        currency = 'IDR',
        metadata = {},
        created_at
      } = {}
    } = payload;

    // Hanya proses jika payment sukses
    if (event === 'payment.completed' && status === 'paid') {
      // Generate license key
      const licenseKey = generateLicenseKey();
      
      // Simpan ke database (di production)
      // Untuk demo, kita log saja
      console.log(`Payment completed for ${customer_email}`);
      console.log(`Transaction ID: ${transaction_id}`);
      console.log(`Amount: ${amount} ${currency}`);
      console.log(`License Key: ${licenseKey}`);
      console.log(`Metadata:`, metadata);
      
      // Di production, kirim email dengan license key
      // await sendLicenseEmail(customer_email, licenseKey);
      
      // Simpan ke KV store atau database
      // await saveLicenseToDB(customer_email, licenseKey, transaction_id);
      
      // Return success response
      return new Response(JSON.stringify({
        success: true,
        message: 'Webhook processed successfully',
        license_key: licenseKey,
        transaction_id: transaction_id
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
      });
    }
    
    // Untuk event lain, cukup return success
    return new Response(JSON.stringify({
      success: true,
      message: 'Webhook received'
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    });

  } catch (error) {
    console.error('Webhook error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    });
  }
}

function generateLicenseKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key = 'DC-';
  for (let i = 0; i < 16; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
    if (i === 3 || i === 7 || i === 11) key += '-';
  }
  return key;
}

// Function untuk verify signature (jika Pakasir menyediakan)
function verifySignature(signature, payload) {
  // Implementasi verifikasi signature
  // Biasanya dengan HMAC-SHA256
  return true; // Untuk sementara return true
}
