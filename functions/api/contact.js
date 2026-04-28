const GHL_WEBHOOK = 'https://services.leadconnectorhq.com/hooks/eXPCtA93huGsb6Bpik6l/webhook-trigger/Xyf5Dt8tphjQeaH6s7io';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();

    const {
      firstName = '',
      lastName  = '',
      email     = '',
      phone     = '',
      vesselType = '',
      loanAmount = '',
      creditScore = '',
      timeline   = '',
      additionalDetails = '',
      source     = 'tideracapital.com',
    } = body;

    // Validate required fields server-side
    if (!firstName || !lastName || !email || !phone) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } }
      );
    }

    const payload = {
      firstName,
      lastName,
      email,
      phone,
      vesselType,
      loanAmount,
      creditScore,
      timeline,
      additionalDetails,
      message: additionalDetails,
      source,
      locationId: 'eXPCtA93huGsb6Bpik6l',
      submittedAt: new Date().toISOString(),
    };

    const ghlRes = await fetch(GHL_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!ghlRes.ok) {
      const errText = await ghlRes.text();
      console.error('GHL webhook error:', ghlRes.status, errText);
      return new Response(
        JSON.stringify({ success: false, error: 'Webhook delivery failed', status: ghlRes.status }),
        { status: 502, headers: { 'Content-Type': 'application/json', ...CORS } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } }
    );

  } catch (err) {
    console.error('Contact handler error:', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }
}
