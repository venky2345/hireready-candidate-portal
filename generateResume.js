const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const {
      candidateId,
      companyName,
      jobDescription,
      targetMatchMode = 'AUTO',
      targetMatchValue = 85,
      mustIncludeSkills = []
    } = JSON.parse(event.body);

    // Validate required fields
    if (!candidateId || !companyName || !jobDescription) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: candidateId, companyName, jobDescription' })
      };
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'OPENAI_API_KEY not configured' })
      };
    }

    // Calculate target match
    let targetMatch = targetMatchValue;
    if (targetMatchMode === 'AUTO') {
      targetMatch = Math.floor(Math.random() * 6) + 90; // 90-95
    } else {
      targetMatch = Math.max(70, Math.min(100, targetMatchValue)); // Clamp 70-100
    }

    // Read resume template
    const templatePath = path.join(__dirname, 'templates', 'resume_template_locked.html');
    const templateHtml = fs.readFileSync(templatePath, 'utf-8');

    // Build the prompt for OpenAI
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
  "metrics": { "jdMatch": number 70-100, "ats": number 70-100, "hrCatchiness": number 70-100, "shortlistChance": number 70-100 },
  "addedSkills": ["skill1", "skill2"],
  "targetMatch": number,
  "roleTitle": "string"
}`;

    const userPrompt = `Generate a professional resume tailored to this job:

Company: ${companyName}
Job Description: ${jobDescription}
Target Match Score: ${targetMatch}%
Must Include Skills: ${mustIncludeSkills.length > 0 ? mustIncludeSkills.join(', ') : 'None'}

Template to fill:
${templateHtml}

Requirements:
- Fill in the placeholders ({{CANDIDATE_NAME}}, {{CURRENT_ROLE}}, etc.)
- Ensure all mustIncludeSkills are present in the SKILLS section
- Make metrics realistic based on job fit (jdMatch should be around ${targetMatch})
- Return ONLY the JSON object, nothing else`;

    // Call OpenAI API
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
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'OpenAI API error: ' + (error.error?.message || 'Unknown error') })
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'No response from OpenAI' })
      };
    }

    // Parse the JSON response
    let resumeData;
    try {
      // Try to extract JSON if wrapped in markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || content.match(/({[\s\S]*})/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      resumeData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Content:', content);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to parse OpenAI response as JSON' })
      };
    }

    // Validate response structure
    if (!resumeData.filename || !resumeData.resumeHtml || !resumeData.metrics || !resumeData.addedSkills) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Invalid response structure from OpenAI' })
      };
    }

    // Ensure metrics are numbers
    resumeData.metrics.jdMatch = Math.max(70, Math.min(100, parseInt(resumeData.metrics.jdMatch) || targetMatch));
    resumeData.metrics.ats = Math.max(70, Math.min(100, parseInt(resumeData.metrics.ats) || 85));
    resumeData.metrics.hrCatchiness = Math.max(70, Math.min(100, parseInt(resumeData.metrics.hrCatchiness) || 80));
    resumeData.metrics.shortlistChance = Math.max(70, Math.min(100, parseInt(resumeData.metrics.shortlistChance) || 82));

    resumeData.targetMatch = targetMatch;

    return {
      statusCode: 200,
      body: JSON.stringify(resumeData)
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error: ' + error.message })
    };
  }
};
