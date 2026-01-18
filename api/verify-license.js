// File: /api/verify-license.js
// API untuk verifikasi license key

export const config = {
  runtime: 'edge',
};

// Simpan license keys di KV store (di production)
// Untuk demo, kita pakai hardcoded validation

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { licenseKey, email } = await request.json();
    
    // Validasi format license key
    const isValidFormat = /^DC-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(licenseKey);
    
    if (!isValidFormat) {
      return new Response(JSON.stringify({
        valid: false,
        isPremium: false,
        message: 'Invalid license key format'
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
      });
    }
    
    // Di production, cek di database
    // const isValid = await checkLicenseInDB(licenseKey, email);
    
    // Untuk demo, kita terima semua license dengan format benar
    const isValid = true;
    
    if (isValid) {
      // Calculate expiration date (30 days from now for demo)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      
      return new Response(JSON.stringify({
        valid: true,
        isPremium: true,
        expiresAt: expiresAt.toISOString(),
        licenseType: licenseKey.includes('LIFETIME') ? 'lifetime' : 'premium',
        message: 'License activated successfully'
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
      });
    } else {
      return new Response(JSON.stringify({
        valid: false,
        isPremium: false,
        message: 'License key not found or expired'
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
      });
    }

  } catch (error) {
    console.error('License verification error:', error);
    
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
