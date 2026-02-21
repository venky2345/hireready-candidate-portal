/**
 * Netlify Function: generateResume
 * Expected live URL: https://<site>.netlify.app/.netlify/functions/generateResume
 * GET should return 405
 * POST should return 200 JSON
 */

const fs = require('fs');
const path = require('path');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

const respond = (statusCode, body) => ({
  statusCode,
  headers: corsHeaders,
  body: body === '' ? '' : JSON.stringify(body)
});

exports.handler = async (event, context) => {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return respond(200, { ok: true });
    }

    if (event.httpMethod !== 'POST') {
      return respond(405, { ok: false, error: 'Method not allowed' });
    }

    let payload;
    try {
      payload = JSON.parse(event.body || '{}');
  } catch (error) {
    return respond(400, { ok: false, error: 'Invalid JSON body' });
  }

  const {
    candidateId,
    companyName,
    jobDescription,
    targetMatchMode = 'auto',
    targetMatchValue = 85,
    mustIncludeSkills = ''
  } = payload;

  if (!jobDescription || !jobDescription.trim()) {
    return respond(400, { ok: false, error: 'jobDescription is required' });
  }

  if (!candidateId || !companyName) {
    return respond(400, { ok: false, error: 'Missing required fields: candidateId, companyName' });
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return respond(500, { ok: false, error: 'OPENAI_API_KEY is not set' });
  }

  const targetMode = String(targetMatchMode).toLowerCase();
  let targetMatch = targetMatchValue;
  if (targetMode === 'auto') {
    targetMatch = Math.floor(Math.random() * 6) + 90; // 90-95
  } else {
    targetMatch = Math.max(70, Math.min(100, Number(targetMatchValue) || 85));
  }

  let mustIncludeSkillsList = [];
  if (Array.isArray(mustIncludeSkills)) {
    mustIncludeSkillsList = mustIncludeSkills;
  } else if (typeof mustIncludeSkills === 'string') {
    mustIncludeSkillsList = mustIncludeSkills
      .split(',')
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);
  }

  // Read resume template
  let templateHtml;
  try {
    const templatePath = path.join(__dirname, 'templates', 'resume_template_locked.html');
    templateHtml = fs.readFileSync(templatePath, 'utf-8');
  } catch (readError) {
    console.error('Template read error', readError);
    return respond(500, { ok: false, error: 'Locked template file not found or unreadable' });
  }

  console.log('generateResume request', { hasJD: Boolean(jobDescription && jobDescription.trim()), targetMatch, hasMustSkills: Boolean(mustIncludeSkills && (Array.isArray(mustIncludeSkills) ? mustIncludeSkills.length > 0 : mustIncludeSkills.trim())) });

  const systemPrompt = `You are a professional resume writer. You MUST:
1. Use the provided resume template structure EXACTLY - do not modify HTML tags, CSS, or element counts
2. Only replace text content within {{PLACEHOLDER}} tags
3. Return ONLY valid JSON (no markdown, no code blocks)
4. Include all mustIncludeSkills if provided
5. Ensure content is ATS-friendly and realistic
6. Match the job description requirements as closely as possible

JSON response must have exactly these keys:
{
  "filename": "FirstName_LastName_Role.pdf",
  "resumeHtml": "<!DOCTYPE html>...",
  "metrics": { "jdMatch": number 90-100, "atsFriendliness": number 90-100, "hrCatchiness": number 90-100, "chancesOfShortlisting": number 90-100 },
  "addedSkills": ["skill1", "skill2"],
  "targetMatch": number,
  "roleTitle": "string"
}`;

  const userPrompt = `Generate a professional resume tailored to this job:

Company: ${companyName}
Job Description: ${jobDescription}
Target Match Score: ${targetMatch}%
Must Include Skills: ${mustIncludeSkillsList.length > 0 ? mustIncludeSkillsList.join(', ') : 'None'}

Template to fill:
${templateHtml}

Requirements:
- Fill in the placeholders ({{CANDIDATE_NAME}}, {{CURRENT_ROLE}}, etc.)
- Ensure all mustIncludeSkills are present in the SKILLS section
- Make metrics realistic based on job fit (jdMatch should be around ${targetMatch})
- Return ONLY the JSON object, nothing else`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2048
    })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('OpenAI API error:', error);
    return respond(500, { ok: false, error: 'OpenAI API error: ' + (error.error?.message || 'Unknown error') });
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    return respond(500, { ok: false, error: 'No response from OpenAI' });
  }

  let resumeData;
  try {
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || content.match(/({[\s\S]*})/);
    const jsonStr = jsonMatch ? jsonMatch[1] : content;
    resumeData = JSON.parse(jsonStr);
  } catch (parseError) {
    console.error('JSON parse error:', parseError, 'Content:', content);
    return respond(500, { ok: false, error: 'Failed to parse OpenAI response as JSON' });
  }

  if (!resumeData.filename || !resumeData.resumeHtml || !resumeData.addedSkills) {
    return respond(500, { ok: false, error: 'Invalid response structure from OpenAI' });
  }

  const rawMetrics = resumeData.metrics || {};
  const clamp90 = (value, fallback) => {
    const parsed = parseInt(value, 10);
    return Math.max(90, Math.min(100, Number.isNaN(parsed) ? fallback : parsed));
  };

  const metrics = {
    jdMatch: clamp90(rawMetrics.jdMatch, targetMatch),
    hrCatchiness: clamp90(rawMetrics.hrCatchiness, 91),
    atsFriendliness: clamp90(rawMetrics.atsFriendliness ?? rawMetrics.ats, 92),
    chancesOfShortlisting: clamp90(rawMetrics.chancesOfShortlisting ?? rawMetrics.shortlistChance, 93)
  };

    const responseBody = {
      ok: true,
      filename: resumeData.filename,
      resumeHtml: resumeData.resumeHtml,
      roleTitle: resumeData.roleTitle || '',
      targetMatch,
      metrics,
      addedSkills: Array.isArray(resumeData.addedSkills) ? resumeData.addedSkills : []
    };

    return respond(200, responseBody);
  } catch (err) {
    console.error('generateResume error', err);
    return respond(500, { ok: false, error: 'Resume generation failed. Check Netlify function logs.' });
  }
};
