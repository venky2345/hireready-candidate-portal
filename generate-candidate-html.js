#!/usr/bin/env node

/**
 * PERSONALIZED HTML GENERATOR - AUTOMATION SCRIPT
 * One-Click Candidate Profile → Personalized structured.html
 * 
 * Usage:
 *   node generate-candidate-html.js [adminConsoleJSON] [resumeFile]
 * 
 * Example:
 *   node generate-candidate-html.js admin_export.json resume.txt
 *   node generate-candidate-html.js ADMIN_CONSOLE_INTEGRATION_EXAMPLE.json
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  baseTemplateFile: 'structured.html',
  outputDir: './',
  logLevel: 'info', // 'debug', 'info', 'warn', 'error'
  validateBeforeGeneration: true,
  autoBackup: true
};

// Skill to Topics mapping
const SKILL_TO_TOPICS_MAP = {
  // Operating Systems
  'windows 10': ['windows-support', 'drivers', 'performance', 'windows-updates'],
  'windows 11': ['windows-support', 'windows-updates', 'drivers'],
  'windows': ['windows-support', 'drivers', 'performance'],
  'macos': ['login-profile'],
  'linux': ['performance', 'drivers'],
  
  // Networking
  'tcp/ip': ['lan-wifi', 'tcpip'],
  'dns': ['dns', 'lan-wifi'],
  'dhcp': ['dhcp', 'lan-wifi'],
  'vpn': ['vpn', 'vpn-errors'],
  'active directory': ['login-profile', 'active-directory'],
  'lan/wifi': ['lan-wifi'],
  'network': ['lan-wifi', 'dns', 'dhcp', 'tcpip'],
  
  // Support Software
  'servicenow': ['servicenow', 'sla', 'incident-request', 'escalation'],
  'remote desktop': ['rdp'],
  'anydesk': ['anydesk'],
  'teamviewer': ['anydesk'],
  
  // Tools
  'task manager': ['performance', 'windows-support'],
  'event viewer': ['performance', 'windows-support'],
  'device manager': ['drivers', 'hardware'],
  'performance monitor': ['performance'],
  
  // Office
  'excel': ['spreadsheet-basic', 'spreadsheet-advanced'],
  'word': ['document-processing'],
  'outlook': ['outlook', 'email-rules'],
  'teams': ['teams', 'teams-meetings'],
  'onedrive': ['onedrive'],
  
  // Domain-Specific
  'recruitment': ['talent-acquisition', 'candidate-assessment'],
  'bgv': ['bgv-process', 'compliance'],
  'sap': ['sap-finance', 'erp-systems'],
  'accounting': ['general-ledger', 'reconciliation'],
  'sales': ['sales-process', 'objection-handling'],
  'python': ['programming', 'automation'],
  'sql': ['database-basics', 'database-advanced']
};

// ============================================================================
// LOGGING UTILITIES
// ============================================================================

const Logger = {
  debug: (msg) => log('DEBUG', msg, '\x1b[36m'), // Cyan
  info: (msg) => log('INFO', msg, '\x1b[32m'),   // Green
  warn: (msg) => log('WARN', msg, '\x1b[33m'),   // Yellow
  error: (msg) => log('ERROR', msg, '\x1b[31m'), // Red
  success: (msg) => log('✓', msg, '\x1b[92m')    // Bright Green
};

function log(level, message, color = '') {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const reset = '\x1b[0m';
  console.log(`${color}[${timestamp}] ${level}${reset} ${message}`);
}

// ============================================================================
// FILE I/O UTILITIES
// ============================================================================

function readFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      Logger.error(`File not found: ${filePath}`);
      return null;
    }
    Logger.debug(`Reading file: ${filePath}`);
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    Logger.error(`Error reading file ${filePath}: ${error.message}`);
    return null;
  }
}

function writeFile(filePath, content) {
  try {
    // Create backup if file exists
    if (CONFIG.autoBackup && fs.existsSync(filePath)) {
      const backupPath = `${filePath}.backup_${Date.now()}`;
      fs.copyFileSync(filePath, backupPath);
      Logger.debug(`Backup created: ${backupPath}`);
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    Logger.success(`File saved: ${filePath}`);
    return true;
  } catch (error) {
    Logger.error(`Error writing file ${filePath}: ${error.message}`);
    return false;
  }
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// ============================================================================
// JSON PARSING & VALIDATION
// ============================================================================

function parseJSON(jsonString, fileName = 'JSON') {
  try {
    Logger.debug(`Parsing ${fileName}...`);
    const data = JSON.parse(jsonString);
    Logger.debug(`Successfully parsed ${fileName}`);
    return data;
  } catch (error) {
    Logger.error(`Invalid JSON in ${fileName}: ${error.message}`);
    return null;
  }
}

function validateAdminConsoleExport(data) {
  Logger.debug('Validating Admin Console export structure...');
  
  const requiredFields = [
    'candidateDetails.recordInfo.candidateId',
    'candidateDetails.personalInformation.fullName',
    'candidateDetails.employmentHistory.currentCompany'
  ];
  
  let isValid = true;
  requiredFields.forEach(field => {
    const value = getNestedProperty(data, field);
    if (!value) {
      Logger.warn(`Missing field: ${field}`);
      isValid = false;
    }
  });
  
  return isValid;
}

function getNestedProperty(obj, path) {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
}

// ============================================================================
// RESUME PARSING
// ============================================================================

function parseResume(resumeText) {
  Logger.debug('Parsing resume...');
  
  const resume = {
    skills: [],
    experience: [],
    education: [],
    certifications: [],
    achievements: [],
    summary: ''
  };
  
  if (!resumeText) return resume;
  
  // Extract skills (look for "SKILLS" or "TECHNICAL SKILLS" section)
  const skillsMatch = resumeText.match(/(?:TECHNICAL\s+)?SKILLS[\s\S]*?(?=\n(?:[A-Z][A-Z\s]+|$))/i);
  if (skillsMatch) {
    const skillsText = skillsMatch[0];
    const skillItems = skillsText.match(/•\s*([^\n]+)/g) || [];
    skillItems.forEach(item => {
      const skill = item.replace(/^•\s*/, '').trim();
      resume.skills.push(skill);
    });
  }
  
  // Extract work experience companies
  const experienceMatch = resumeText.match(/(?:WORK\s+)?EXPERIENCE[\s\S]*?(?=\n(?:[A-Z][A-Z\s]+|$))/i);
  if (experienceMatch) {
    const companies = (experienceMatch[0].match(/(.+?)\s*\|\s*(.+?)(?:\(|$)/g) || []);
    companies.forEach(company => {
      resume.experience.push(company.trim());
    });
  }
  
  // Extract achievements
  const achievementsMatch = resumeText.match(/(?:KEY\s+)?ACHIEVEMENTS[\s\S]*?(?=\n(?:[A-Z][A-Z\s]+|$))/i);
  if (achievementsMatch) {
    const achievements = achievementsMatch[0].match(/•\s*([^\n]+)/g) || [];
    achievements.forEach(item => {
      resume.achievements.push(item.replace(/^•\s*/, '').trim());
    });
  }
  
  // Extract professional summary
  const summaryMatch = resumeText.match(/(?:PROFESSIONAL\s+)?SUMMARY[\s\S]*?(?=\n(?:[A-Z][A-Z\s]+|$))/i);
  if (summaryMatch) {
    resume.summary = summaryMatch[0]
      .replace(/(?:PROFESSIONAL\s+)?SUMMARY[\s\n]*/i, '')
      .trim()
      .substring(0, 500);
  }
  
  Logger.debug(`Extracted ${resume.skills.length} skills from resume`);
  Logger.debug(`Extracted ${resume.achievements.length} achievements from resume`);
  
  return resume;
}

// ============================================================================
// DATA MERGING & MAPPING
// ============================================================================

function mapSkillsToTopics(skillsList) {
  Logger.debug('Mapping skills to topics...');
  
  const topics = new Set();
  const excludedTopics = new Set();
  
  if (!Array.isArray(skillsList)) {
    skillsList = [];
  }
  
  skillsList.forEach(skill => {
    if (!skill) return;
    
    const skillLower = skill.toLowerCase();
    
    // Check for direct matches
    Object.keys(SKILL_TO_TOPICS_MAP).forEach(key => {
      if (skillLower.includes(key) || key.includes(skillLower)) {
        SKILL_TO_TOPICS_MAP[key].forEach(topic => topics.add(topic));
      }
    });
  });
  
  // Set exclusions based on what's NOT mentioned
  const allSkills = skillsList.join(' ').toLowerCase();
  if (!allSkills.includes('macos') && !allSkills.includes('apple')) {
    excludedTopics.add('macos');
  }
  if (!allSkills.includes('linux')) {
    excludedTopics.add('linux');
  }
  if (!allSkills.includes('python') && !allSkills.includes('java') && !allSkills.includes('c++')) {
    excludedTopics.add('programming');
  }
  
  return {
    includeTopics: Array.from(topics),
    excludeTopics: Array.from(excludedTopics)
  };
}

function extractSkillsFromAdminConsole(adminData) {
  const skills = [];
  
  try {
    // From current company remarks/skills
    if (adminData?.adminConsoleExport?.candidateDetails?.employmentHistory?.currentCompany?.skills) {
      skills.push(...adminData.adminConsoleExport.candidateDetails.employmentHistory.currentCompany.skills);
    }
    
    // From current company tools
    if (adminData?.adminConsoleExport?.candidateDetails?.employmentHistory?.currentCompany?.tools) {
      skills.push(...adminData.adminConsoleExport.candidateDetails.employmentHistory.currentCompany.tools);
    }
  } catch (error) {
    Logger.debug(`Error extracting skills from admin console: ${error.message}`);
  }
  
  return [...new Set(skills)]; // Remove duplicates
}

function extractSkillsFromResume(resume) {
  return resume?.skills || [];
}

function mergeAdminConsoleAndResume(adminConsoleRaw, resumeRaw) {
  Logger.info('Merging Admin Console export and resume data...');
  
  const adminData = typeof adminConsoleRaw === 'string' ? parseJSON(adminConsoleRaw) : adminConsoleRaw;
  if (!adminData) return null;
  
  const resumeText = resumeRaw || '';
  const resumeData = parseResume(resumeText);
  
  if (!validateAdminConsoleExport(adminData)) {
    Logger.warn('Admin Console export validation failed, proceeding with available data');
  }
  
  try {
    const candidateDetails = adminData.adminConsoleExport?.candidateDetails || {};
    const personalInfo = candidateDetails.personalInformation || {};
    const employmentHistory = candidateDetails.employmentHistory || {};
    const currentCompany = employmentHistory.currentCompany || {};
    
    // Extract and merge skills
    const adminSkills = extractSkillsFromAdminConsole(adminData);
    const resumeSkills = extractSkillsFromResume(resumeData);
    const allSkills = [...new Set([...adminSkills, ...resumeSkills])];
    
    const topicsMapping = mapSkillsToTopics(allSkills);
    
    // Build merged config
    const mergedConfig = {
      candidate: {
        personalInfo: {
          candidateId: candidateDetails.recordInfo?.candidateId || 'UNKNOWN',
          firstName: personalInfo.fullName?.split(' ')[0] || personalInfo.preferredName || 'Candidate',
          lastName: personalInfo.fullName?.split(' ').slice(1).join(' ') || '',
          email: personalInfo.professionalEmail || personalInfo.personalEmail || '',
          phone: personalInfo.phoneNumber || personalInfo.whatsappNumber || '',
          title: currentCompany.designation || 'Professional',
          yearsOfExperience: employmentHistory.totalExperience?.years || 0
        },
        targetRole: {
          title: currentCompany.designation || 'Professional',
          domain: determineDomain(allSkills),
          level: determineLevel(employmentHistory.totalExperience?.years || 0),
          description: resumeData.summary || ''
        },
        technicalSkills: allSkills,
        workExperience: extractWorkExperience(employmentHistory),
        achievements: resumeData.achievements || [],
        customQuestionFilters: {
          includeTopics: topicsMapping.includeTopics,
          excludeTopics: topicsMapping.excludeTopics,
          emphasizeAreas: determineEmphasizedAreas(allSkills, resumeData.achievements),
          difficultyDistribution: calculateDifficultyDistribution(employmentHistory.totalExperience?.years || 0)
        }
      }
    };
    
    Logger.success(`Merged configuration created for ${mergedConfig.candidate.personalInfo.firstName} ${mergedConfig.candidate.personalInfo.lastName}`);
    Logger.debug(`Topics included: ${mergedConfig.candidate.customQuestionFilters.includeTopics.length}`);
    Logger.debug(`Skills extracted: ${allSkills.length}`);
    
    return mergedConfig;
  } catch (error) {
    Logger.error(`Error merging data: ${error.message}`);
    return null;
  }
}

function determineDomain(skills) {
  const skillsText = skills.join(' ').toLowerCase();
  
  if (skillsText.includes('servicenow') || skillsText.includes('windows') || skillsText.includes('active directory')) {
    return 'IT Support';
  }
  if (skillsText.includes('recruitment') || skillsText.includes('bgv')) {
    return 'HR/Recruitment';
  }
  if (skillsText.includes('sap') || skillsText.includes('accounting') || skillsText.includes('excel')) {
    return 'Finance';
  }
  if (skillsText.includes('sales')) {
    return 'Sales';
  }
  return 'General';
}

function determineLevel(yearsOfExperience) {
  if (yearsOfExperience <= 2) return 'beginner';
  if (yearsOfExperience <= 5) return 'intermediate';
  return 'expert';
}

function determineEmphasizedAreas(skills, achievements) {
  const areas = [];
  const skillsText = skills.join(' ').toLowerCase();
  const achievementsText = achievements.join(' ').toLowerCase();
  
  if (skillsText.includes('servicenow') || skillsText.includes('sla')) {
    areas.push('SLA Management', 'Escalation Procedures');
  }
  if (skillsText.includes('active directory') || skillsText.includes('ad')) {
    areas.push('Active Directory Administration');
  }
  if (achievementsText.includes('migration') || achievementsText.includes('project')) {
    areas.push('Project Management', 'Large-scale Deployments');
  }
  if (achievementsText.includes('reduction') || achievementsText.includes('improvement')) {
    areas.push('Process Improvement', 'Metrics and KPIs');
  }
  
  return areas.length > 0 ? areas : ['General Knowledge'];
}

function calculateDifficultyDistribution(yearsOfExperience) {
  if (yearsOfExperience <= 1) {
    return { beginner: 60, intermediate: 40, expert: 0 };
  }
  if (yearsOfExperience <= 3) {
    return { beginner: 20, intermediate: 70, expert: 10 };
  }
  if (yearsOfExperience <= 5) {
    return { beginner: 10, intermediate: 60, expert: 30 };
  }
  return { beginner: 5, intermediate: 50, expert: 45 };
}

function extractWorkExperience(employmentHistory) {
  const experience = [];
  
  if (employmentHistory.currentCompany) {
    experience.push({
      company: employmentHistory.currentCompany.companyName || 'Current Company',
      position: employmentHistory.currentCompany.designation || 'Position',
      duration: {
        from: employmentHistory.currentCompany.joiningDate || '',
        to: 'present'
      },
      yearsInRole: employmentHistory.currentCompany.experience?.years || 0
    });
  }
  
  if (employmentHistory.previousCompany1) {
    experience.push({
      company: employmentHistory.previousCompany1.companyName || 'Previous Company',
      position: employmentHistory.previousCompany1.designation || 'Position',
      duration: {
        from: employmentHistory.previousCompany1.joiningDate || '',
        to: employmentHistory.previousCompany1.lastWorkingDate || ''
      }
    });
  }
  
  return experience;
}

// ============================================================================
// HTML GENERATION
// ============================================================================

function generatePersonalizedHTML(baseHTML, mergedConfig) {
  Logger.info('Generating personalized HTML...');
  
  let html = baseHTML;
  
  const candidate = mergedConfig.candidate;
  const firstName = candidate.personalInfo.firstName;
  const lastName = candidate.personalInfo.lastName;
  const role = candidate.targetRole.title;
  const domain = candidate.targetRole.domain;
  
  // Create personalized welcome message
  const welcomeMessage = `Welcome, ${firstName}! Your ${role} Interview Preparation Path`;
  const domainDescription = `${domain} domain | ${candidate.personalInfo.yearsOfExperience} years of experience`;
  
  // Insert metadata
  const metadata = `
    <!-- PERSONALIZED METADATA -->
    <script>
      const CANDIDATE_NAME = "${firstName} ${lastName}";
      const CANDIDATE_ID = "${candidate.personalInfo.candidateId}";
      const TARGET_ROLE = "${role}";
      const DOMAIN = "${domain}";
      const YEARS_EXPERIENCE = ${candidate.personalInfo.yearsOfExperience};
      const TECHNICAL_SKILLS = ${JSON.stringify(candidate.technicalSkills)};
      const PERSONALIZED_CONFIG = ${JSON.stringify(mergedConfig)};
    </script>
  `;
  
  // Replace or inject metadata into base template
  if (html.includes('<!-- METADATA -->')) {
    html = html.replace('<!-- METADATA -->', metadata);
  } else {
    html = html.replace('<script>', metadata + '<script>');
  }
  
  // Update welcome section if it exists
  html = html.replace(
    /(<h1[^>]*>)Welcome[^<]*(<\/h1>)/i,
    `$1${welcomeMessage}$2`
  );
  
  // Add subtitle with domain and experience
  html = html.replace(
    /(<p[^>]*class="subtitle"[^>]*>)[^<]*(<\/p>)/i,
    `$1${domainDescription}$2`
  );
  
  Logger.success('HTML generation complete');
  return html;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

function main() {
  Logger.info('========================================');
  Logger.info('PERSONALIZED HTML GENERATOR');
  Logger.info('========================================');
  
  // Get command line arguments
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    showUsage();
    return;
  }
  
  const adminConsoleFile = args[0];
  const resumeFile = args[1];
  
  // Step 1: Read Admin Console export
  Logger.info(`\nStep 1: Reading Admin Console export...`);
  const adminConsoleRaw = readFile(adminConsoleFile);
  if (!adminConsoleRaw) {
    Logger.error('Cannot proceed without Admin Console export');
    return;
  }
  
  // Step 2: Read resume (optional)
  Logger.info(`Step 2: Reading resume file...`);
  let resumeRaw = '';
  if (resumeFile && fileExists(resumeFile)) {
    resumeRaw = readFile(resumeFile);
  } else if (resumeFile) {
    Logger.warn(`Resume file not found: ${resumeFile}, proceeding without resume`);
  } else {
    Logger.info('No resume file provided, using Admin Console data only');
  }
  
  // Step 3: Merge data
  Logger.info(`Step 3: Merging data...`);
  const mergedConfig = mergeAdminConsoleAndResume(adminConsoleRaw, resumeRaw);
  if (!mergedConfig) {
    Logger.error('Failed to merge data');
    return;
  }
  
  // Step 4: Read base template
  Logger.info(`Step 4: Reading base template...`);
  const baseHTML = readFile(CONFIG.baseTemplateFile);
  if (!baseHTML) {
    Logger.error(`Base template not found: ${CONFIG.baseTemplateFile}`);
    Logger.warn('Make sure structured.html is in the same directory');
    return;
  }
  
  // Step 5: Generate personalized HTML
  Logger.info(`Step 5: Generating personalized HTML...`);
  const personalizedHTML = generatePersonalizedHTML(baseHTML, mergedConfig);
  
  // Step 6: Save output file
  Logger.info(`Step 6: Saving output file...`);
  const firstName = mergedConfig.candidate.personalInfo.firstName.toLowerCase();
  const lastName = mergedConfig.candidate.personalInfo.lastName.toLowerCase();
  const role = mergedConfig.candidate.targetRole.title.toLowerCase().replace(/\s+/g, '');
  const outputFileName = `candidate_${firstName}_${lastName}_${role}.html`;
  const outputPath = path.join(CONFIG.outputDir, outputFileName);
  
  if (writeFile(outputPath, personalizedHTML)) {
    Logger.success(`\n========================================`);
    Logger.success(`✓ GENERATION COMPLETE`);
    Logger.success(`========================================`);
    Logger.info(`\nOutput File: ${outputFileName}`);
    Logger.info(`Location: ${outputPath}`);
    Logger.info(`Candidate: ${mergedConfig.candidate.personalInfo.firstName} ${mergedConfig.candidate.personalInfo.lastName}`);
    Logger.info(`Role: ${mergedConfig.candidate.targetRole.title}`);
    Logger.info(`Domain: ${mergedConfig.candidate.targetRole.domain}`);
    Logger.info(`Experience: ${mergedConfig.candidate.personalInfo.yearsOfExperience} years`);
    Logger.info(`Skills: ${mergedConfig.candidate.technicalSkills.length}`);
    Logger.info(`Topics: ${mergedConfig.candidate.customQuestionFilters.includeTopics.length}`);
  } else {
    Logger.error('Failed to save output file');
  }
}

function showUsage() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║     PERSONALIZED HTML GENERATOR - AUTOMATION SCRIPT             ║
║                                                                ║
║  Generate personalized structured.html from Admin Console      ║
║  candidate data + resume in ONE CLICK                          ║
╚════════════════════════════════════════════════════════════════╝

USAGE:
  node generate-candidate-html.js [adminConsoleJSON] [resumeFile]

ARGUMENTS:
  adminConsoleJSON   Path to Admin Console export JSON file (REQUIRED)
  resumeFile         Path to candidate resume file (OPTIONAL)

EXAMPLES:
  # Basic usage with Admin Console export only
  node generate-candidate-html.js admin_export.json

  # With resume file for enhanced extraction
  node generate-candidate-html.js admin_export.json resume.pdf

  # Using the provided example
  node generate-candidate-html.js ADMIN_CONSOLE_INTEGRATION_EXAMPLE.json

REQUIREMENTS:
  • structured.html must be in the same directory
  • Admin Console export must be valid JSON
  • Resume can be .txt, .pdf, or .doc (text extracted version)

OUTPUT:
  • Personalized HTML file: candidate_firstname_lastname_role.html
  • Same directory as this script
  • Ready to share with candidate immediately

WHAT IT DOES:
  1. Reads Admin Console candidate export (JSON)
  2. Parses resume for additional skill/achievement extraction
  3. Merges both data sources intelligently
  4. Maps skills to relevant question topics
  5. Generates personalized structured.html
  6. Auto-names file with candidate details

NOTES:
  • All original functionality preserved
  • Same visual design and features
  • Only content is personalized
  • No data modifications to source files

For more details, see: ADMIN_CONSOLE_INTEGRATION_GUIDE.md
  `);
}

// ============================================================================
// RUN
// ============================================================================

if (require.main === module) {
  main();
}

module.exports = {
  mergeAdminConsoleAndResume,
  generatePersonalizedHTML,
  parseResume,
  mapSkillsToTopics
};
