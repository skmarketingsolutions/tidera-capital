const GHL_WEBHOOK = 'https://services.leadconnectorhq.com/hooks/eXPCtA93huGsb6Bpik6l/webhook-trigger/Xyf5Dt8tphjQeaH6s7io';

// Always return a plain string — never an object
function str(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') return '';   // drop objects — never stringify as [object Object]
  return String(val).trim();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Ensure body is parsed — handles both auto-parsed objects and raw strings
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = {}; }
    }
    body = body || {};

    // Extract every field as a guaranteed plain string
    const firstName         = str(body.firstName);
    const lastName          = str(body.lastName);
    const email             = str(body.email);
    const phone             = str(body.phone);
    const vesselType        = str(body.vesselType);
    const loanAmount        = str(body.loanAmount);
    const creditScore       = str(body.creditScore);
    const timeline          = str(body.timeline);
    const additionalDetails = str(body.additionalDetails);
    const source            = str(body.source) || 'tideracapital.com';
    const fullName          = `${firstName} ${lastName}`.trim();

    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Flat payload — NO nested objects, every value is a plain string
    const payload = {
      name:               fullName,
      full_name:          fullName,
      first_name:         firstName,
      last_name:          lastName,
      firstName:          firstName,
      lastName:           lastName,
      email:              email,
      phone:              phone,
      vessel_type:        vesselType,
      vesselType:         vesselType,
      loan_amount:        loanAmount,
      loanAmount:         loanAmount,
      credit_score:       creditScore,
      creditScore:        creditScore,
      timeline:           timeline,
      message:            additionalDetails,
      notes:              additionalDetails,
      additional_details: additionalDetails,
      additionalDetails:  additionalDetails,
      source:             source,
      locationId:         'eXPCtA93huGsb6Bpik6l',
      submittedAt:        new Date().toISOString(),
    };

    console.log('GHL payload:', JSON.stringify(payload));

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
