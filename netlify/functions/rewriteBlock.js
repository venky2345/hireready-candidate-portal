/**
 * Netlify Function: rewriteBlock
 * Expected live URL: https://<site>.netlify.app/.netlify/functions/rewriteBlock
 * Provides AI-powered text rewriting for the Guided Resume Editor.
 *
 * Follows the same error-handling and JSON-response pattern as generateResume.js.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

const respond = (statusCode, body) => {
  // Ensure every response is JSON; never return HTML.
  return {
    statusCode,
    headers: corsHeaders,
    body: typeof body === 'string' ? body : JSON.stringify(body || {})
  };
};

// Main handler: entry point for Netlify Functions.
async function handler(event, context) {
  try {
    console.log('[rewriteBlock] request', { method: event.httpMethod, bodyLength: (event.body || '').length });

    if (event.httpMethod === 'OPTIONS') {
      return respond(200, { ok: true });
    }

    if (event.httpMethod !== 'POST') {
      return respond(405, { ok: false, error: 'Method not allowed. Use POST.' });
    }

    let payload = {};
    try {
      payload = event.body ? JSON.parse(event.body) : {};
    } catch (parseErr) {
      console.log('[rewriteBlock] JSON parse error', parseErr.message);
      return respond(400, { ok: false, error: 'Invalid JSON in request body' });
    }

    const { blockText = '' } = payload;

    if (typeof blockText !== 'string' || !blockText.trim()) {
      return respond(400, { ok: false, error: 'blockText is required and must be non-empty' });
    }

    const openaiKey = process.env.OPENAI_API_KEY || process.env.API_KEY;
    if (!openaiKey) {
      console.log('[rewriteBlock] API key not configured');
      return respond(500, { ok: false, error: 'OPENAI_API_KEY not configured in Netlify environment' });
    }

    // Attempt OpenAI call; fall back to original text on error.
    let suggestion = String(blockText);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const aiResponse = await fetch('https://api.openai.com/v1/edits', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          input: blockText,
          instruction: 'Rewrite this text to improve clarity and grammar.'
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        if (aiData && aiData.choices && aiData.choices[0] && aiData.choices[0].text) {
          suggestion = aiData.choices[0].text;
          console.log('[rewriteBlock] OpenAI success');
        }
      } else {
        console.log('[rewriteBlock] OpenAI status', aiResponse.status);
      }
    } catch (aiErr) {
      if (aiErr.name === 'AbortError') {
        console.log('[rewriteBlock] OpenAI timeout');
      } else {
        console.log('[rewriteBlock] OpenAI error', aiErr.message);
      }
    }

    console.log('[rewriteBlock] returning result');
    return respond(200, { ok: true, result: suggestion, text: suggestion });
  } catch (err) {
    console.log('[rewriteBlock] unexpected error', err);
    return respond(500, { ok: false, error: 'Unexpected server error' });
  }
}

// Explicit exports for Netlify Functions.
module.exports = { handler };
exports.handler = handler;