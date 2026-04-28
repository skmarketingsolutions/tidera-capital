const GHL_WEBHOOK = 'https://services.leadconnectorhq.com/hooks/eXPCtA93huGsb6Bpik6l/webhook-trigger/Xyf5Dt8tphjQeaH6s7io';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const {
      firstName         = '',
      lastName          = '',
      email             = '',
      phone             = '',
      vesselType        = '',
      loanAmount        = '',
      creditScore       = '',
      timeline          = '',
      additionalDetails = '',
      source            = 'tideracapital.com',
    } = req.body || {};

    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const fullName = `${firstName} ${lastName}`.trim();

    // Send every field format GHL may recognize for contact name mapping
    const payload = {
      // ── Top-level formats ──────────────────────────────
      name:          fullName,   // combined full name
      full_name:     fullName,   // alternate combined key
      first_name:    firstName,  // snake_case (GHL standard)
      last_name:     lastName,   // snake_case (GHL standard)
      firstName:     firstName,  // camelCase
      lastName:      lastName,   // camelCase
      email,
      phone,

      // ── Nested contact object (GHL workflow maps as contact.firstName etc) ──
      contact: {
        name:       fullName,
        full_name:  fullName,
        firstName:  firstName,
        lastName:   lastName,
        first_name: firstName,
        last_name:  lastName,
        email,
        phone,
      },

      // ── Additional form fields ──────────────────────────
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

    console.log('Sending to GHL:', JSON.stringify(payload));

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
