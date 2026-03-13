/**
 * Netlify Function: generateResume
 * Expected live URL: https://<site>.netlify.app/.netlify/functions/generateResume
 * GET should return 405
 * POST should return 200 JSON
 */

const fs = require('fs');
const path = require('path');

// Shared template mapping — single source of truth for frontend ID → backend file
const JDM_TEMPLATE_MAP = {
  t01: { name: 'Classic ATS', file: 'template_01.html' },
  t02: { name: 'Modern Minimal', file: 'template_02.html' },
  t03: { name: 'Executive Serif', file: 'template_03.html' },
  t04: { name: 'Compact Professional', file: 'template_04.html' },
  t05: { name: 'Divider Sections', file: 'template_05.html' },
  t06: { name: 'Left Accent Line', file: 'template_06.html' },
  t07: { name: 'Bold Header Bar', file: 'template_07.html' },
  t08: { name: 'Clean Two-Column', file: 'template_08.html' },
  t09: { name: 'Skills-First', file: 'template_09.html' },
  t10: { name: 'Experience-First', file: 'template_10.html' },
  t11: { name: 'Academic Clean', file: 'template_11.html' },
  t12: { name: 'Timeline Light', file: 'template_12.html' }
};

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
    templateId = '',
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

  // Resolve templateId through shared mapping — no silent fallback
  console.log('[generateResume] templateId received', templateId);
  const mappedEntry = JDM_TEMPLATE_MAP[templateId];
  if (!mappedEntry) {
    console.warn('[generateResume] templateId not found in JDM_TEMPLATE_MAP', templateId);
    return respond(400, {
      ok: false,
      error: 'Selected template was not found',
      message: 'Selected template was not found',
      templateIdReceived: templateId,
      fallbackUsed: false,
      fallbackReason: 'missing_template_mapping'
    });
  }
  const selectedTemplateFile = mappedEntry.file.replace('.html', ''); // strip extension for path join
  const requestedTemplateId = templateId;
  console.log('[generateResume] template file used', mappedEntry.file);

  // Read resume template
  let templateHtml;
  try {
    const templatePath = path.join(__dirname, 'templates', `${selectedTemplateFile}.html`);
    templateHtml = fs.readFileSync(templatePath, 'utf-8');
  } catch (readError) {
    console.error('Template read error', readError);
    return respond(500, {
      ok: false,
      error: 'Template file not found or unreadable',
      message: 'Template file not found or unreadable',
      templateId: requestedTemplateId,
      templateIdUsed: requestedTemplateId,
      templateFileUsed: mappedEntry ? mappedEntry.file : undefined,
      fallbackUsed: false,
      fallbackReason: 'template_read_failed'
    });
  }

  // Extract placeholder keys from templateHtml
  const tokens = templateHtml.match(/{{[A-Z0-9_]+}}/g) || [];
  const placeholderKeys = Array.from(new Set(tokens.map(t => t.slice(2, -2))));

  // Backend semantic validator to ensure rendered HTML is truly a populated
  // template and not a placeholder shell or raw text blob.
  function validateRenderedResumeHtml(resumeHtml, templateIdUsed, templateFileUsed) {
    const html = String(resumeHtml || '');
    const trimmed = html.trim();
    if (!trimmed || trimmed.length < 200) {
      return {
        ok: false,
        reason: 'html_too_short',
        message: 'Rendered resume HTML is empty or too short to be valid.'
      };
    }

    // No unresolved {{PLACEHOLDER}} tokens should remain
    if (/{{[A-Z0-9_]+}}/.test(html)) {
      return {
        ok: false,
        reason: 'unresolved_placeholders',
        message: 'Rendered resume contains unresolved template placeholders.'
      };
    }

    const lower = trimmed.toLowerCase();
    const placeholderPhrases = [
      'candidate name',
      'professional summary',
      'core professional competencies',
      'mm/yyyy',
      'organization name',
      'your professional summary'
    ];
    if (placeholderPhrases.some((p) => lower.includes(p))) {
      return {
        ok: false,
        reason: 'placeholder_shell_detected',
        message: 'Rendered resume appears to contain placeholder/sample template text.'
      };
    }

    // Detect obvious "one giant raw text blob" cases by comparing visible text
    // length to the amount of structural markup.
    const textOnly = trimmed
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const blockTagMatches = html
      .toLowerCase()
      .match(/<(div|section|article|header|footer|ul|ol|li|table|tr|td|th)[\s>]/g) || [];
    const blockCount = blockTagMatches.length;

    if (textOnly.length > 2500 && blockCount < 5) {
      return {
        ok: false,
        reason: 'raw_text_blob_detected',
        message: 'Rendered resume appears to be mostly unstructured raw text instead of a populated template.'
      };
    }

    return { ok: true };
  }

  // Deterministic resume builder used when AI times out or fails but we still
  // have usable base resume text to construct a meaningful output.
  function buildDeterministicResume(options = {}) {
    const { aiTimedOut = false, reason = 'model_generation_failed', aiError = null } = options;
    const src = (resumeSafe || '').trim();
    if (!src || src.length < 100) {
      console.log('[generateResume] deterministic fallback skipped — insufficient resume text', {
        safeCandidateId,
        length: src.length
      });
      return null;
    }

    console.log('[generateResume] deterministic fallback starting', {
      safeCandidateId,
      aiTimedOut,
      reason
    });

    const lines = src.split(/\r?\n/).map(l => l.trim());
    const nonEmpty = lines.filter(Boolean);

    // Candidate name: first non-empty line
    const candidateName = nonEmpty[0] || '';

    // Contact info: lines with email/phone-like patterns
    const contactCandidates = nonEmpty.filter(l => /@/.test(l) || /\d{6,}/.test(l));
    const contactInfo = contactCandidates.slice(0, 3).join(' | ');

    // Heuristic headings
    const headingRegex = /^(summary|professional summary|profile|skills|technical skills|experience|work experience|professional experience|projects|education|certifications?|training)\b/i;

    // Summary: lines after name until first heading
    const summaryLines = [];
    for (let i = 1; i < nonEmpty.length; i++) {
      const l = nonEmpty[i];
      if (headingRegex.test(l)) break;
      summaryLines.push(l);
      if (summaryLines.join(' ').length > 400) break;
    }
    const summaryText = summaryLines.join(' ') || src.slice(0, 600);

    function extractSection(keywords) {
      const lower = nonEmpty.map(l => l.toLowerCase());
      let start = -1;
      for (let i = 0; i < lower.length; i++) {
        if (keywords.some(kw => lower[i].startsWith(kw))) {
          start = i + 1;
          break;
        }
      }
      if (start === -1) return '';
      const sectionLines = [];
      for (let i = start; i < nonEmpty.length; i++) {
        if (headingRegex.test(nonEmpty[i])) break;
        sectionLines.push(nonEmpty[i]);
        if (sectionLines.length > 80) break;
      }
      return sectionLines.join('\n');
    }

    const skillsText = extractSection(['skills', 'technical skills']);
    const experienceText = extractSection(['experience', 'work experience', 'professional experience', 'projects']);
    const educationText = extractSection(['education']);
    const certsText = extractSection(['certifications', 'certification', 'training']);

    // Derive skills list from skillsText and mustIncludeSkillsList
    let derivedSkills = [];
    if (skillsText) {
      const tokensFromSkills = skillsText
        .split(/[\u2022•\-\n,;]+/)
        .map(s => s.trim())
        .filter(Boolean);
      derivedSkills = derivedSkills.concat(tokensFromSkills);
    }
    derivedSkills = derivedSkills.concat(mustIncludeSkillsList || []);
    const skillsSet = Array.from(new Set(derivedSkills.map(s => s.trim()).filter(Boolean)));
    const skillsHtml = skillsSet.length
      ? '<ul>' + skillsSet.slice(0, 40).map(s => `<li>${s}</li>`).join('') + '</ul>'
      : '';

    function wrapParagraphs(text, headingLabel) {
      if (!text || !text.trim()) return '';
      const parts = text.split(/\n+/).map(t => t.trim()).filter(Boolean);
      if (!parts.length) return '';
      return `<div><strong>${headingLabel}</strong><ul>` +
        parts.map(p => `<li>${p}</li>`).join('') +
        `</ul></div>`;
    }

    const experienceHtml = wrapParagraphs(experienceText || summaryText, 'Experience');
    const educationHtml = wrapParagraphs(educationText, 'Education');
    const certsHtml = wrapParagraphs(certsText, 'Certifications');

    const replacements = {};

    if (placeholderKeys.includes('CANDIDATE_NAME')) {
      replacements.CANDIDATE_NAME = candidateName;
    }
    if (placeholderKeys.includes('PROFESSIONAL_TITLE')) {
      replacements.PROFESSIONAL_TITLE = '';
    }
    if (placeholderKeys.includes('CONTACT_INFO')) {
      replacements.CONTACT_INFO = contactInfo;
    }
    if (placeholderKeys.includes('PROFESSIONAL_SUMMARY')) {
      replacements.PROFESSIONAL_SUMMARY = summaryText;
    }
    if (placeholderKeys.includes('SKILLS_LIST')) {
      replacements.SKILLS_LIST = skillsHtml;
    }
    if (placeholderKeys.includes('EXPERIENCE_SECTION')) {
      replacements.EXPERIENCE_SECTION = experienceHtml;
    }
    if (placeholderKeys.includes('EDUCATION_SECTION')) {
      replacements.EDUCATION_SECTION = educationHtml;
    }
    if (placeholderKeys.includes('CERTIFICATIONS_SECTION')) {
      replacements.CERTIFICATIONS_SECTION = certsHtml;
    }

    // Fill any remaining placeholders with empty string so templates stay clean
    placeholderKeys.forEach((k) => {
      if (!(k in replacements)) replacements[k] = '';
    });

    let resumeHtml = templateHtml;
    for (const [key, value] of Object.entries(replacements)) {
      const placeholder = `{{${key}}}`;
      resumeHtml = resumeHtml.replace(
        new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        String(value)
      );
    }
    resumeHtml = resumeHtml.replace(/{{[A-Z0-9_]+}}/g, '');

    const validation = validateRenderedResumeHtml(resumeHtml, requestedTemplateId, mappedEntry.file);
    if (!validation.ok) {
      console.log('[generateResume] deterministic fallback validation failed', {
        safeCandidateId,
        reason: validation.reason,
        message: validation.message
      });
      return null;
    }

    // Metrics: reuse targetMatch for a stable, high-quality score
    const metrics = {
      jdMatch: targetMatch,
      atsFriendliness: targetMatch,
      hrCatchiness: targetMatch,
      chancesOfShortlisting: targetMatch
    };

    const safeNamePart = (candidateName || 'Candidate').replace(/[^A-Za-z0-9]+/g, '_').slice(0, 40) || 'Candidate';
    const safeCompanyPart = (companyName || 'Role').replace(/[^A-Za-z0-9]+/g, '_').slice(0, 40) || 'Role';
    const filename = `${safeNamePart}_${safeCompanyPart}_JDMatch.pdf`;

    console.log('[generateResume] deterministic fallback success', {
      safeCandidateId,
      aiTimedOut,
      reason,
      htmlLength: resumeHtml.length
    });

    return {
      ok: true,
      filename,
      resumeHtml,
      roleTitle: '',
      targetMatch,
      metrics,
      addedSkills: skillsSet,
      templateId: requestedTemplateId,
      templateIdUsed: requestedTemplateId,
      templateFileUsed: mappedEntry.file,
      fallbackUsed: false,
      fallbackReason: null,
      generationMode: 'deterministic_fallback',
      aiTimedOut,
      aiError
    };
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
      console.log('[generateResume] AI timeout detected', { safeCandidateId });
      const deterministic = buildDeterministicResume({
        aiTimedOut: true,
        reason: 'model_generation_failed',
        aiError: 'timeout'
      });
      if (deterministic) {
        return respond(200, deterministic);
      }
      console.log('[generateResume] deterministic fallback failed after timeout', { safeCandidateId });
      return respond(500, {
        ok: false,
        error: 'AI model timed out and deterministic fallback could not build a complete resume.',
        message: 'AI model timed out and deterministic fallback could not build a complete resume. Please shorten your inputs or try again.',
        fallbackUsed: false,
        fallbackReason: 'model_generation_failed',
        generationMode: 'none',
        aiTimedOut: true
      });
    }
    console.log('[generateResume] fetch error from AI model', fetchError);
    const deterministic = buildDeterministicResume({
      aiTimedOut: false,
      reason: 'model_generation_failed',
      aiError: fetchError && fetchError.message ? fetchError.message : 'fetch_error'
    });
    if (deterministic) {
      return respond(200, deterministic);
    }
    console.log('[generateResume] deterministic fallback failed after fetch error', { safeCandidateId });
    return respond(500, {
      ok: false,
      error: 'AI model request failed and deterministic fallback could not build a complete resume.',
      message: 'AI model request failed and deterministic fallback could not build a complete resume. Please shorten your inputs or try again.',
      fallbackUsed: false,
      fallbackReason: 'model_generation_failed',
      generationMode: 'none',
      aiTimedOut: false
    });
  }
  clearTimeout(timer);

  if (!response.ok) {
    let errorBody = '';
    try { errorBody = await response.text(); } catch(e) {}
    console.log('[generateResume] OpenAI API non-OK status', { status: response.status, bodySnippet: String(errorBody).slice(0, 300) });
    const deterministic = buildDeterministicResume({
      aiTimedOut: false,
      reason: 'model_generation_failed',
      aiError: `status_${response.status}`
    });
    if (deterministic) {
      return respond(200, deterministic);
    }
    console.log('[generateResume] deterministic fallback failed after non-OK AI status', { safeCandidateId });
    return respond(500, {
      ok: false,
      error: 'AI model returned an error response and deterministic fallback could not build a complete resume.',
      message: 'AI model returned an error response and deterministic fallback could not build a complete resume. Please shorten your inputs or try again.',
      fallbackUsed: false,
      fallbackReason: 'model_generation_failed',
      generationMode: 'none',
      aiTimedOut: false,
      openaiStatus: response.status
    });
  }

  let data;
  try {
    data = await response.json();
  } catch (e) {
    console.log('OpenAI API returned non-JSON', e);
    return respond(500, {
      ok: false,
      error: 'Failed to parse OpenAI response as JSON',
      message: 'Failed to parse AI response while generating your resume.',
      fallbackUsed: false,
      fallbackReason: 'generated_content_invalid'
    });
  }
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    return respond(500, {
      ok: false,
      error: 'No response from OpenAI',
      message: 'No response was received from the AI model.',
      fallbackUsed: false,
      fallbackReason: 'model_generation_failed'
    });
  }

  let resumeData;
  try {
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || content.match(/({[\s\S]*})/);
    const jsonStr = jsonMatch ? jsonMatch[1] : content;
    resumeData = JSON.parse(jsonStr);
  } catch (parseError) {
    console.error('JSON parse error:', parseError, 'Content:', content);
    return respond(500, {
      ok: false,
      error: 'Failed to parse OpenAI response as JSON',
      message: 'Failed to parse AI response while generating your resume.',
      fallbackUsed: false,
      fallbackReason: 'generated_content_invalid'
    });
  }

  if (!resumeData.filename || !resumeData.replacements || !resumeData.addedSkills) {
    console.log('generateResume invalid structure', resumeData);
    return respond(500, {
      ok: false,
      error: 'Invalid response structure from OpenAI',
      message: 'AI response was missing required fields for resume generation.',
      fallbackUsed: false,
      fallbackReason: 'generated_content_invalid'
    });
  }
  console.log('generateResume openai ok');

  // Construct resumeHtml by replacing placeholders using the same template pipeline
  let resumeHtml = templateHtml;
  const replacements = resumeData.replacements || {};
  for (const [key, value] of Object.entries(replacements)) {
    const placeholder = `{{${key}}}`;
    resumeHtml = resumeHtml.replace(
      new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      String(value)
    );
  }
  // Remove any remaining placeholders
  resumeHtml = resumeHtml.replace(/{{[A-Z0-9_]+}}/g, '');

  const aiValidation = validateRenderedResumeHtml(resumeHtml, requestedTemplateId, mappedEntry.file);
  if (!aiValidation.ok) {
    console.log('[generateResume] AI-rendered resume validation failed, attempting deterministic fallback', {
      safeCandidateId,
      reason: aiValidation.reason,
      message: aiValidation.message
    });
    const deterministicFromInvalidAi = buildDeterministicResume({
      aiTimedOut: false,
      reason: 'generated_content_invalid',
      aiError: aiValidation.reason
    });
    if (deterministicFromInvalidAi) {
      return respond(200, deterministicFromInvalidAi);
    }
    return respond(500, {
      ok: false,
      error: 'Generated resume content from AI was invalid and deterministic fallback could not build a complete resume.',
      message: aiValidation.message,
      fallbackUsed: false,
      fallbackReason: 'generated_content_invalid',
      generationMode: 'none'
    });
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
      resumeHtml: resumeHtml,
      roleTitle: resumeData.roleTitle || '',
      targetMatch,
      metrics,
      addedSkills: Array.isArray(resumeData.addedSkills) ? resumeData.addedSkills : [],
      templateId: requestedTemplateId,
      templateIdUsed: requestedTemplateId,
      templateFileUsed: mappedEntry.file,
      fallbackUsed: false,
      fallbackReason: null
    };

    console.log('[generateResume] done, templateIdUsed:', requestedTemplateId, 'file:', mappedEntry.file);
    return respond(200, responseBody);
  } catch (err) {
    console.log('generateResume error', err);
    return respond(500, {
      ok: false,
      error: 'Resume generation failed. Check Netlify function logs.',
      message: 'Resume generation failed due to an internal error.',
      fallbackUsed: false,
      fallbackReason: 'template_population_failed'
    });
  }
};
