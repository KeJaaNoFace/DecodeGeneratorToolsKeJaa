// File: /api/check-limit.js
// API untuk check usage limit berdasarkan IP

export const config = {
  runtime: 'edge',
};

// Simpan usage data di KV store (di production)
// Untuk demo, kita pakai in-memory

const MAX_FREE_USES = 3;

export default async function handler(request) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  try {
    // Di production, ambil dari database/KV store
    // const usageData = await getUsageFromDB(ip, today);
    
    // Untuk demo, kita return static data
    const usageData = {
      ip: ip,
      date: today,
      count: 0, // Default 0
      isPremium: false,
      maxFreeUses: MAX_FREE_USES
    };
    
    // Check if IP has premium license (di production, cek database)
    // const isPremium = await checkPremiumStatus(ip);
    
    return new Response(JSON.stringify({
      success: true,
      data: usageData,
      message: 'Usage data retrieved'
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    });

  } catch (error) {
    console.error('Check limit error:', error);
    
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
