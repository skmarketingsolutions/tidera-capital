const GHL_WEBHOOK = 'https://services.leadconnectorhq.com/hooks/eXPCtA93huGsb6Bpik6l/webhook-trigger/Xyf5Dt8tphjQeaH6s7io';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      firstName        = '',
      lastName         = '',
      email            = '',
      phone            = '',
      vesselType       = '',
      loanAmount       = '',
      creditScore      = '',
      timeline         = '',
      additionalDetails = '',
      source           = 'tideracapital.com',
    } = req.body || {};

    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const payload = {
      // GHL standard snake_case
      first_name:   firstName,
      last_name:    lastName,
      email,
      phone,
      // camelCase fallback
      firstName,
      lastName,
      // extra fields
      vessel_type:  vesselType,
      loan_amount:  loanAmount,
      credit_score: creditScore,
      timeline,
      message:      additionalDetails,
      notes:        additionalDetails,
      source,
      locationId:   'eXPCtA93huGsb6Bpik6l',
      submittedAt:  new Date().toISOString(),
    };

    const ghlRes = await fetch(GHL_WEBHOOK, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    const ghlText = await ghlRes.text();

    if (!ghlRes.ok) {
      console.error('GHL error:', ghlRes.status, ghlText);
      return res.status(502).json({ success: false, error: 'Webhook failed', detail: ghlText });
    }

    console.log('GHL success:', ghlText);
    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
