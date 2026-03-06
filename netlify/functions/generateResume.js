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
    mustIncludeSkills = '',
    templateId = 'template_01',
    baseResumeText = ''
  } = payload;

  if (!jobDescription || !jobDescription.trim()) {
    return respond(400, { ok: false, error: 'jobDescription is required' });
  }

  if (!companyName) {
    return respond(400, { ok: false, error: 'companyName is required' });
  }

  const safeCandidateId = candidateId || `anon_${Date.now()}`;

  const openaiKey = process.env.OPENAI_API_KEY || process.env.API_KEY;
  if (!openaiKey) {
    console.log('generateResume error: OPENAI_API_KEY or API_KEY missing');
    return respond(500, { ok: false, error: 'OPENAI_API_KEY or API_KEY is not configured in Netlify environment variables' });
  }

  const targetMode = String(targetMatchMode).toLowerCase();
  let targetMatch = targetMatchValue;
  if (targetMode === 'auto') {
    targetMatch = Math.floor(Math.random() * 6) + 90; // 90-95
  } else {
    targetMatch = Math.max(70, Math.min(100, Number(targetMatchValue) || 85));
  }

  // Hard limit input size to prevent timeouts
  const jdSafe = String(jobDescription || '').slice(0, 6000);
  const resumeSafe = String(baseResumeText || '').slice(0, 6000);

  let mustIncludeSkillsList = [];
  if (Array.isArray(mustIncludeSkills)) {
    mustIncludeSkillsList = mustIncludeSkills.slice(0, 60);
  } else if (typeof mustIncludeSkills === 'string') {
    mustIncludeSkillsList = mustIncludeSkills
      .slice(0, 1200)
      .split(',')
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);
  }

  // Map frontend IDs (t01..t12) to actual template file names (template_01..template_12)
  const templateMap = {};
  for (let i = 1; i <= 12; i++) {
    const key = 't' + String(i).padStart(2, '0');
    const file = 'template_' + String(i).padStart(2, '0');
    templateMap[key] = file;
  }
  if (!templateMap[templateId]) {
    console.warn('generateResume: requested templateId not found in map', templateId);
    return respond(400, { ok: false, error: 'Selected template was not found' });
  }
  const selectedTemplateFile = templateMap[templateId];
  const requestedTemplateId = templateId; // keep original for response

  // Read resume template
  let templateHtml;
  try {
    const templatePath = path.join(__dirname, 'templates', `${selectedTemplateFile}.html`);
    templateHtml = fs.readFileSync(templatePath, 'utf-8');
  } catch (readError) {
    console.error('Template read error', readError);
    return respond(500, { ok: false, error: 'Template file not found or unreadable' });
  }

  // Extract placeholder keys from templateHtml
  const tokens = templateHtml.match(/{{[A-Z0-9_]+}}/g) || [];
  const placeholderKeys = Array.from(new Set(tokens.map(t => t.slice(2, -2))));

  // Fallback resume constructor used when AI times out or fails
  function makeFallback() {
    console.log('generateResume fallback used', safeCandidateId);
    const replacements = {};
    // basic placeholders
    replacements.CANDIDATE_NAME = '';
    replacements.PROFESSIONAL_TITLE = '';
    replacements.CONTACT_INFO = '';
    replacements.PROFESSIONAL_SUMMARY = '';
    // skills list from mustIncludeSkillsList
    let skillsHtml = '<ul>' + mustIncludeSkillsList.slice(0,20).map(s => `<li>${s}</li>`).join('') + '</ul>';
    replacements.SKILLS_LIST = skillsHtml;
    // generic experience block
    let expHtml = '<div><strong>Experience</strong><ul><li>Role at Company<br>• Delivered project using ' +
                   (mustIncludeSkillsList[0] || 'relevant technologies') + '</li></ul></div>';
    replacements.EXPERIENCE_SECTION = expHtml;
    replacements.EDUCATION_SECTION = '<div><strong>Education</strong><ul><li>Degree | Institution</li></ul></div>';
    replacements.CERTIFICATIONS_SECTION = '';
    // any other placeholders blank
    placeholderKeys.forEach(k => { if (!(k in replacements)) replacements[k] = ''; });

    let resumeHtml = templateHtml;
    for (const [key, value] of Object.entries(replacements)) {
      const placeholder = `{{${key}}}`;
      resumeHtml = resumeHtml.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), String(value));
    }
    resumeHtml = resumeHtml.replace(/{{[A-Z0-9_]+}}/g, '');

    const metrics = {
      jdMatch: targetMatch,
      atsFriendliness: targetMatch,
      hrCatchiness: targetMatch,
      chancesOfShortlisting: targetMatch
    };

    return respond(200, {
      ok: true,
      filename: `fallback_${Date.now()}.pdf`,
      resumeHtml,
      roleTitle: '',
      targetMatch,
      metrics,
      addedSkills: mustIncludeSkillsList,
      templateId: requestedTemplateId,
      templateIdUsed: requestedTemplateId,
      fallbackUsed: true
    });
  }

  console.log('generateResume request', { safeCandidateId, hasJD: Boolean(jdSafe && jdSafe.trim()), targetMatch, hasMustSkills: Boolean(mustIncludeSkillsList.length > 0), placeholderKeysCount: placeholderKeys.length });

  const systemPrompt = `You are a professional resume writer. You MUST:
1. Return ONLY valid JSON (no markdown, no code blocks)
2. Include all mustIncludeSkills if provided
3. Ensure content is ATS-friendly and realistic
4. Match the job description requirements as closely as possible

JSON response must have exactly these keys:
{
  "filename": "FirstName_LastName_Role.pdf",
  "roleTitle": "string",
  "metrics": { "jdMatch": number 90-100, "atsFriendliness": number 90-100, "hrCatchiness": number 90-100, "chancesOfShortlisting": number 90-100 },
  "addedSkills": ["skill1", "skill2"],
  "targetMatch": number,
  "replacements": { "PLACEHOLDER_KEY": "value", ... }
}`;

  const userPrompt = `Generate a professional resume tailored to this job:

Company: ${companyName}
Job Description: ${jdSafe}
Target Match Score: ${targetMatch}%
Must Include Skills: ${mustIncludeSkillsList.length > 0 ? mustIncludeSkillsList.join(', ') : 'None'}
${resumeSafe ? `\nReference Resume:\n${resumeSafe}` : ''}

Available placeholders: ${placeholderKeys.join(', ')}

Requirements:
- Provide values for each placeholder key in the "replacements" object
- Ensure all mustIncludeSkills are present in the SKILLS section
- Make metrics realistic based on job fit (jdMatch should be around ${targetMatch})
- Return ONLY the JSON object, nothing else`;

  console.log('generateResume start', { safeCandidateId });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  let response;
  try {
    response = await fetch('https://api.openai.com/v1/chat/completions', {
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
        temperature: 0.2,
        max_tokens: 500
      }),
      signal: controller.signal
    });
  } catch (fetchError) {
    clearTimeout(timer);
    if (fetchError.name === 'AbortError') {
      console.log('generateResume abort timeout, using fallback', safeCandidateId);
      return makeFallback();
    }
    console.log('generateResume fetch error', fetchError);
    return makeFallback();
  }
  clearTimeout(timer);

  if (!response.ok) {
    let errorBody = '';
    try { errorBody = await response.text(); } catch(e) {}
    console.log('OpenAI API error status', response.status, errorBody);
    return makeFallback();
  }

  let data;
  try {
    data = await response.json();
  } catch (e) {
    console.log('OpenAI API returned non-JSON', e);
    return makeFallback();
  }
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

  if (!resumeData.filename || !resumeData.replacements || !resumeData.addedSkills) {
    console.log('generateResume invalid structure', resumeData);
    return respond(500, { ok: false, error: 'Invalid response structure from OpenAI' });
  }
  console.log('generateResume openai ok');

  // Construct resumeHtml by replacing placeholders
  let resumeHtml = templateHtml;
  const replacements = resumeData.replacements || {};
  for (const [key, value] of Object.entries(replacements)) {
    const placeholder = `{{${key}}}`;
    resumeHtml = resumeHtml.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), String(value));
  }
  // Remove any remaining placeholders
  resumeHtml = resumeHtml.replace(/{{[A-Z0-9_]+}}/g, '');

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
      resumeHtml: resumeHtml,
      roleTitle: resumeData.roleTitle || '',
      targetMatch,
      metrics,
      addedSkills: Array.isArray(resumeData.addedSkills) ? resumeData.addedSkills : [],
      templateId: requestedTemplateId,
      templateIdUsed: requestedTemplateId
    };

    console.log('generateResume done');
    return respond(200, responseBody);
  } catch (err) {
    console.log('generateResume error', err);
    return respond(500, { ok: false, error: 'Resume generation failed. Check Netlify function logs.' });
  }
};
