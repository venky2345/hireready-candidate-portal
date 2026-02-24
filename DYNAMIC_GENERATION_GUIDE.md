# Dynamic HTML Generation Guide
## Personalized structured.html for Any Candidate

---

## Table of Contents
1. [Overview](#overview)
2. [How It Works](#how-it-works)
3. [Step-by-Step Generation Process](#step-by-step-generation-process)
4. [Configuration Mapping](#configuration-mapping)
5. [Customization Examples](#customization-examples)
6. [Implementation Code](#implementation-code)
7. [Testing & Validation](#testing--validation)

---

## Overview

### The Problem
Currently, `structured.html` is generic with:
- Pre-defined content for IT Support only
- Fixed 500 Q&A questions
- No personalization for candidate skills/experience
- Same content regardless of role or background

### The Solution
Create a **dynamic generation system** where:
- Input: Candidate configuration (JSON/YAML) + resume data
- Output: Personalized `structured.html` with custom content
- Same design & functionality, different content
- Works for ANY domain, ANY skill set, ANY experience level

### What Stays the Same
✅ Visual design and CSS
✅ Quiz functionality and interactivity
✅ Navigation structure (9 sections)
✅ Premium features and scorecards
✅ All UI elements and animations

### What Changes
🔄 Section 2: Domain-specific Q&A (tailored to candidate's field)
🔄 Section 3: Scenario-based questions (relevant to their experience)
🔄 Section 4: Project-based questions (matching their project experience)
🔄 Section 5: Tool-based questions (using tools they know)
🔄 Section 6: Master Q&A list (filtered by skills and tools)
🔄 Section 1 & 7: Personalized welcome and tips

---

## How It Works

### Data Flow Architecture

```
┌─────────────────────────────────────────────┐
│   Candidate Information                     │
│   - Resume                                  │
│   - Skills                                  │
│   - Tools                                   │
│   - Experience                              │
│   - Target Role                             │
└──────────┬──────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────┐
│   Configuration Generator                   │
│   - Parse resume                            │
│   - Extract skills, tools                   │
│   - Map to TOPICS matching data             │
│   - Generate CANDIDATE_CONFIG.json          │
└──────────┬──────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────┐
│   Content Generator                         │
│   - Read CANDIDATE_CONFIG.json              │
│   - Filter TOPICS by includeTopics          │
│   - Generate Q&A for each section           │
│   - Create personalized TOPICS array        │
└──────────┬──────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────┐
│   HTML Generator                            │
│   - Take base template                      │
│   - Insert personalized content             │
│   - Update JavaScript with filtered TOPICS  │
│   - Generate candidate_john_doe.html        │
└──────────┬──────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────┐
│   Output                                    │
│   - Personalized HTML file                  │
│   - Ready to use immediately                │
│   - Candidate-specific URL naming           │
└─────────────────────────────────────────────┘
```

---

## Step-by-Step Generation Process

### Step 1: Collect Candidate Information

**Input Format: Candidate Resume**
```
Name: John Doe
Email: john.doe@example.com
Phone: +1-555-0123

PROFESSIONAL SUMMARY
4 years IT support experience, focusing on desktop and network support

SKILLS
- Operating Systems: Windows 10 (Expert), Windows 11 (Intermediate), macOS (Beginner)
- Networking: TCP/IP, DNS, Active Directory, VPN
- Tools: ServiceNow, Remote Desktop, Task Manager, Event Viewer
- Certifications: CompTIA A+, Microsoft AZ-900

EXPERIENCE
Current: IT Support Technician L1 (2022-Present) - Tech Solutions Inc
- 150+ user support
- ServiceNow ticket management
- Network troubleshooting
- Windows migration projects

Previous: Help Desk Support (2020-2021) - ABC Corporation

TARGET ROLE: L2 Support Engineer
```

### Step 2: Parse Resume & Create Configuration

**What to Extract:**

| Resume Section | → | Config Field | Example |
|---|---|---|---|
| SKILLS | → | technicalSkills | Windows 10, DNS, ServiceNow |
| YEARS OF EXPERIENCE | → | yearsOfExperience | 4 |
| TOOLS USED | → | technicalSkills[].name | Remote Desktop, Task Manager |
| CERTIFICATIONS | → | experienceLevel.certifications | CompTIA A+ |
| JOB TITLES | → | workExperience[].position | IT Support Technician |
| TARGET ROLE | → | targetRole.title | L2 Support Engineer |
| KEY ACHIEVEMENTS | → | projectExperience[] | Improved FCR from 65% to 82% |

**Configuration Created (CANDIDATE_CONFIG_TEMPLATE.json)**
```json
{
  "candidate": {
    "personalInfo": {
      "firstName": "John",
      "lastName": "Doe",
      "title": "IT Support Technician",
      "yearsOfExperience": 4
    },
    "targetRole": {
      "title": "L2 Support Engineer",
      "domain": "IT Support",
      "level": "intermediate"
    },
    "technicalSkills": [
      {
        "category": "Operating Systems",
        "skills": [
          {"name": "Windows 10", "proficiency": "expert"},
          {"name": "Windows 11", "proficiency": "intermediate"}
        ]
      }
    ],
    "customQuestionFilters": {
      "includeTopics": [
        "windows-support",
        "dns",
        "active-directory",
        "servicenow"
      ],
      "excludeTopics": ["linux", "macOS"]
    }
  }
}
```

### Step 3: Map Skills to TOPICS

**Topic Matching Logic:**

For each skill in candidate's resume, find matching TOPICS:

```javascript
// Candidate has "Windows 10" skill
// Maps to topics: windows-support, drivers, performance, windows-updates

// Candidate has "Active Directory" skill
// Maps to topics: login-profile, active-directory

// Candidate has "ServiceNow" skill
// Maps to topics: servicenow, sla, incident-request

// Candidate has "Excel Expert" skill
// Maps to topics: spreadsheet-advanced, data-analysis

// Candidate has "Sales domain" experience
// Maps to topics: customer-communication, sales-processes, objection-handling
```

### Step 4: Generate Custom Q&A Content

**For Each Section, Generate Questions Based on:**

```
Section 2 (Domain-Specific):
- Candidate's primary domain (IT Support) → IT Support Q&A
- Their years of experience (4 years) → Intermediate+Expert difficulty
- Their tools (ServiceNow, AD) → Focus questions on these tools
- Result: 40 questions tailored to their background

Section 3 (Scenario-Based):
- Their experience level → Realistic scenarios for L2 engineer
- Their tools/skills → Scenarios involving tools they know
- Result: 30 real-world scenarios relevant to their level

Section 4 (Project-Based):
- Their project experience → Questions about Windows 11 migration, printer support
- Their achievements → Build on their strengths
- Result: 25 questions based on actual project experience

Section 5 (Tool-Based):
- Tools they know: ServiceNow, Remote Desktop, Task Manager
- Tools to learn: PowerShell, SCCM
- Result: 35 questions covering known + aspirational tools

Section 6 (Master List - 500 Q&A):
- Filter all 500 questions by includeTopics
- Sort by:
  - Ticketing: Questions with servicenow, sla, incident-request
  - Troubleshooting: All Windows, networking, AD related
  - Scenario: Real situations for support engineers
  - Technical: Relevant abbreviations (DNS, DHCP, RDP, VPN, SLA, etc.)
- Result: Personalized 500-question list
```

### Step 5: Inject Personalization into HTML

**JavaScript Variables to Update:**

```javascript
// Before (Generic):
const TOPICS = [allTopics...]; // 40+ topics for everyone

// After (Personalized for John Doe):
const CANDIDATE_CONFIG = {
  firstName: "John",
  targetRole: "L2 Support Engineer",
  domain: "IT Support"
};

const TOPICS = [
  // Only topics matching John's skills + level
  windows-support,
  login-profile,
  performance,
  servicenow,
  sla,
  active-directory,
  lan-wifi,
  dns,
  escalation,
  // ... filtered list
];

const CUSTOM_QUESTIONS = {
  section2: [...John's IT support questions],
  section3: [...John's L2-level scenarios],
  section4: [...John's project experience],
  section5: [...John's tools]
};
```

### Step 6: Update Section Headers & Names

**Personalize Each Section:**

```html
<!-- Generic -->
<h1>Welcome to Our Quiz Platform</h1>

<!-- Personalized for John -->
<h1>Welcome, John! Your L2 Support Engineer Path</h1>
<p>Personalized learning for IT Support with focus on ServiceNow, Active Directory, and Advanced Troubleshooting</p>

<!-- Section 2 -->
<!-- Generic -->
<h2>02 - 24 HR/BGV Questions and Answers</h2>

<!-- Personalized -->
<h2>02 - IT Support Fundamentals (40 Questions - Your Domain)</h2>
<p>Windows, Networking, and Ticketing based on your 4 years of experience</p>

<!-- Section 5 -->
<!-- Generic -->
<h2>05 - 45 Tool-Based Questions and Answers</h2>

<!-- Personalized -->
<h2>05 - Your Tools & Technologies (35 Questions)</h2>
<p>ServiceNow, Remote Desktop, Active Directory, Windows 10/11, and more</p>
```

---

## Configuration Mapping

### How Candidate Data Maps to HTML Content

#### Mapping Table

| Candidate Config | → | HTML Element | Content |
|---|---|---|---|
| firstName, lastName | → | Welcome message | "Welcome, John Doe!" |
| targetRole.title | → | Section headers | "L2 Support Engineer Path" |
| targetRole.domain | → | Domain focus | "IT Support Domain" |
| yearsOfExperience | → | Difficulty level | Intermediate+Expert questions |
| technicalSkills.category | → | Section 5 heading | "Your Tools & Technologies" |
| technicalSkills[].name | → | Question generation | Questions about those specific skills |
| customQuestionFilters.includeTopics | → | TOPICS filtering | Only relevant topics included |
| workExperience[].keyResponsibilities | → | Section 4 intro | Maps to project experience |
| strengths | → | Interview tips | Tips that play to their strengths |
| weaknesses | → | Focus areas | Recommendations for improvement |
| careerGoals.focusAreas | → | Section 7 tips | Tailored to their growth path |

#### Example Mappings

**For IT Support Professional (John Doe):**
```
technicalSkills: [Windows 10, Windows 11, Active Directory, ServiceNow]
↓
- Section 2: IT Support Q&A (Windows, AD, Ticketing)
- Section 3: Scenarios about network, OS, user management
- Section 5: Tools = ServiceNow, Remote Desktop, Task Manager
- Section 6: Master list filtered to IT topics
- Section 7: Tips about SLA, troubleshooting, escalation
```

**For HR Recruiter (Different Candidate - Sarah):**
```
technicalSkills: [Recruitment, BGV, Onboarding, Excel, LinkedIn]
↓
- Section 2: HR/Recruitment Q&A (BGV, background check, verification)
- Section 3: Scenarios about hiring decisions, fraud detection
- Section 5: Tools = ATS, BGV platforms, Excel
- Section 6: Master list filtered to HR topics
- Section 7: Tips about compliance, risk mitigation
```

**For Finance Analyst (Different Candidate - Mike):**
```
technicalSkills: [Accounting, SAP, Excel, Financial Analysis, Reconciliation]
↓
- Section 2: Finance Q&A (GL, reconciliation, compliance)
- Section 3: Scenarios about discrepancies, audit, compliance
- Section 5: Tools = SAP, Excel, QuickBooks
- Section 6: Master list filtered to Finance topics
- Section 7: Tips about accuracy, documentation, audit readiness
```

---

## Customization Examples

### Example 1: John Doe - L2 IT Support Engineer

**Input (Resume):**
```
Name: John Doe
Experience: 4 years IT Support
Skills: Windows 10/11, Active Directory, ServiceNow, Remote Desktop
Target Role: L2 Support Engineer
Current Role: IT Support Technician L1
Certifications: CompTIA A+, Microsoft AZ-900
```

**Generated Output:**
```
File: candidate_john_doe_l2support.html

Section 1: Welcome John! Your L2 Support Engineer Path
Section 2: IT Support Fundamentals (40 Questions)
  Focus: Windows, Networking, Active Directory, ServiceNow
  Difficulty: Intermediate to Expert

Section 3: Real-World L2 Scenarios (30 Questions)
  Focus: Complex troubleshooting, SLA breaches, escalations

Section 4: Your Project Experience (25 Questions)
  Focus: Windows 11 migration, printer support initiatives

Section 5: Your Tools (35 Questions)
  Tools: ServiceNow, Remote Desktop, Task Manager, Active Directory
  To Learn: PowerShell, SCCM

Section 6: Master Q&A List (500 Questions)
  Ticketing: 100 (ServiceNow, SLA, Incident Management)
  Troubleshooting: 200 (Windows, Networking, AD)
  Scenario-Based: 150 (L2-level situations)
  Technical: 50 (IT abbreviations - RDP, VPN, SLA, etc.)

Section 7: Interview Tips for L2 Support Engineer
  - Discussing escalation procedures
  - Demonstrating troubleshooting methodology
  - Explaining SLA management
  - Showing continuous learning (recent certifications)
```

### Example 2: Sarah Chen - HR Recruiter (BGV Specialist)

**Input (Resume):**
```
Name: Sarah Chen
Experience: 6 years HR Recruitment
Skills: Talent acquisition, BGV, Onboarding, Excel, ATS systems
Target Role: BGV Specialist / Senior Recruiter
Current Role: HR Recruiter
Certifications: SHRM-CP
```

**Generated Output:**
```
File: candidate_sarah_chen_bgv.html

Section 1: Welcome Sarah! Your HR Recruiter Excellence Path
Section 2: HR Recruitment & BGV Fundamentals (40 Questions)
  Focus: Background verification, compliance, candidate assessment
  Difficulty: Intermediate to Expert

Section 3: Real-World Recruitment Scenarios (30 Questions)
  Focus: Fraud detection, compliance issues, candidate dilemmas

Section 4: Your HR Projects (25 Questions)
  Focus: Successful hires, large-scale recruitment campaigns

Section 5: Your HR Tools (35 Questions)
  Tools: ATS, LinkedIn, BGV platforms, Excel
  To Learn: HRIS systems, Automation tools

Section 6: Master Q&A List (500 Questions)
  Ticketing: 100 (Recruitment process, offer management, onboarding)
  Troubleshooting: 200 (BGV issues, document verification, compliance)
  Scenario-Based: 150 (Ethical dilemmas, red flags, decision-making)
  Technical: 50 (HR abbreviations - BGV, ATS, HRIS, EEO, etc.)

Section 7: Interview Tips for HR Recruiters
  - Discussing compliance and risk mitigation
  - Explaining BGV process
  - Handling difficult candidate situations
```

### Example 3: Mike Johnson - Finance Analyst

**Input (Resume):**
```
Name: Mike Johnson
Experience: 5 years Finance & Accounting
Skills: SAP, Excel, Financial Analysis, GL, Reconciliation
Target Role: Senior Finance Analyst
Current Role: Finance Analyst
Certifications: CPA (In Progress)
```

**Generated Output:**
```
File: candidate_mike_johnson_finance.html

Section 1: Welcome Mike! Your Finance Analyst Expert Path
Section 2: Finance & Accounting Fundamentals (40 Questions)
  Focus: GL accounting, reconciliation, compliance, internal controls
  Difficulty: Intermediate to Expert

Section 3: Real-World Finance Scenarios (30 Questions)
  Focus: Reconciliation deadlines, compliance audits, discrepancies

Section 4: Your Finance Projects (25 Questions)
  Focus: Month-end close, system migrations, audit preparations

Section 5: Your Finance Tools (35 Questions)
  Tools: SAP, Excel, QuickBooks, Reconciliation software
  To Learn: Python for automation, BI tools

Section 6: Master Q&A List (500 Questions)
  Ticketing: 100 (Invoice processing, GL posting, compliance)
  Troubleshooting: 200 (Reconciliation issues, error correction, audit prep)
  Scenario-Based: 150 (Deadline pressures, audit situations, errors)
  Technical: 50 (Finance abbreviations - GL, AR, AP, COA, etc.)

Section 7: Interview Tips for Finance Analysts
  - Discussing accuracy and attention to detail
  - Explaining reconciliation methodology
  - Handling high-pressure periods
```

---

## Implementation Code

### Step 1: Create Configuration Parser

```javascript
// Parse candidate resume and create JSON config
function parseResumeAndCreateConfig(resumeText, targetRole) {
  const config = {
    candidate: {
      personalInfo: extractPersonalInfo(resumeText),
      targetRole: parseTargetRole(targetRole),
      technicalSkills: extractSkills(resumeText),
      workExperience: extractWorkExperience(resumeText),
      customQuestionFilters: mapSkillsToTopics(extractSkills(resumeText))
    }
  };
  return config;
}

// Extract skills and map to TOPICS
function mapSkillsToTopics(skillsList) {
  const SKILL_TO_TOPICS_MAP = {
    "Windows 10": ["windows-support", "drivers", "performance"],
    "Windows 11": ["windows-support", "windows-updates"],
    "Active Directory": ["login-profile", "active-directory"],
    "ServiceNow": ["servicenow", "sla", "incident-request"],
    "Remote Desktop": ["rdp"],
    "Task Manager": ["performance", "windows-support"],
    "Excel": ["spreadsheet-basic", "spreadsheet-advanced"],
    "Python": ["programming", "automation"],
    "SQL": ["database-basics", "database-advanced"],
    "BGV": ["bgv-process", "compliance", "ethics"],
    "Recruitment": ["talent-acquisition", "candidate-assessment"],
    "SAP": ["sap-finance", "erp-systems"],
    "Accounting": ["general-ledger", "reconciliation"],
    "Sales": ["sales-process", "objection-handling", "negotiation"]
  };

  const includeTopics = [];
  skillsList.forEach(skill => {
    if (SKILL_TO_TOPICS_MAP[skill.name]) {
      includeTopics.push(...SKILL_TO_TOPICS_MAP[skill.name]);
    }
  });

  return {
    includeTopics: [...new Set(includeTopics)], // Remove duplicates
    excludeTopics: identifyExcludedTopics(skillsList),
    emphasizeAreas: extractEmphasisAreas(skillsList),
    difficultyDistribution: calculateDifficulty(skillsList)
  };
}
```

### Step 2: Content Generator

```javascript
// Generate personalized questions for each section
function generatePersonalizedContent(config) {
  const personalizedContent = {
    section2: generateDomainSpecificQA(
      config.targetRole.domain,
      config.customQuestionFilters.includeTopics,
      config.candidate.yearsOfExperience
    ),
    section3: generateScenarioBasedQA(
      config.customQuestionFilters.includeTopics,
      config.candidate.workExperience
    ),
    section4: generateProjectBasedQA(
      config.candidate.projectExperience,
      config.customQuestionFilters.includeTopics
    ),
    section5: generateToolBasedQA(
      config.candidate.technicalSkills,
      config.customQuestionFilters.includeTopics
    ),
    section6: generateMasterList(
      config.customQuestionFilters.includeTopics,
      config.candidate.yearsOfExperience
    )
  };
  return personalizedContent;
}

// Filter and customize TOPICS array
function filterTopicsForCandidate(allTopics, includeTopics, excludeTopics) {
  return allTopics.filter(topic => 
    includeTopics.includes(topic.id) && 
    !excludeTopics.includes(topic.id)
  );
}

// Generate section-specific intro text
function generateSectionIntro(sectionNumber, config) {
  const intros = {
    1: `Welcome, ${config.candidate.personalInfo.firstName}! Your ${config.targetRole.title} Interview Preparation`,
    2: `${config.targetRole.domain} Fundamentals - Based on your ${config.candidate.yearsOfExperience} years of experience`,
    3: `Real-World Scenarios for ${config.targetRole.title} role`,
    4: `Your Project Experience & Achievements`,
    5: `Your Tools & Technologies: ${config.candidate.technicalSkills.map(s => s.name).join(', ')}`,
    6: `Comprehensive Q&A - 500 Questions Curated for Your Path`,
    7: `Interview Strategies for ${config.targetRole.title}`,
    8: `Mock Interview - ${config.targetRole.title} Scenario`,
    9: `Live Support for ${config.targetRole.domain}`
  };
  return intros[sectionNumber];
}
```

### Step 3: HTML Generator

```javascript
// Generate personalized HTML file
function generatePersonalizedHTML(config, personalizedContent) {
  // Read base template (structured.html)
  const baseHTML = fs.readFileSync('structured.html', 'utf8');
  
  // Replace placeholders with personalized content
  let customHTML = baseHTML;
  
  // 1. Update hero section
  customHTML = customHTML.replace(
    '{{WELCOME_MESSAGE}}',
    `Welcome, ${config.candidate.personalInfo.firstName}! Your ${config.targetRole.title} Path`
  );
  
  // 2. Update section content
  customHTML = customHTML.replace(
    '{{SECTION_2_CONTENT}}',
    generateSectionHTML(personalizedContent.section2, 2)
  );
  
  customHTML = customHTML.replace(
    '{{SECTION_3_CONTENT}}',
    generateSectionHTML(personalizedContent.section3, 3)
  );
  
  // ... Similar for other sections
  
  // 3. Update JavaScript TOPICS array
  const filteredTopics = filterTopicsForCandidate(
    TOPICS,
    config.customQuestionFilters.includeTopics,
    config.customQuestionFilters.excludeTopics
  );
  
  const topicsScript = `const TOPICS = ${JSON.stringify(filteredTopics)};`;
  customHTML = customHTML.replace('const TOPICS = [', topicsScript);
  
  // 4. Add candidate metadata
  const metadataScript = `
    const CANDIDATE_CONFIG = ${JSON.stringify(config.candidate.personalInfo)};
    const TARGET_ROLE = "${config.targetRole.title}";
    const DOMAIN = "${config.targetRole.domain}";
  `;
  
  customHTML = customHTML.replace(
    '<!-- METADATA -->',
    `<script>${metadataScript}</script>`
  );
  
  // 5. Save with candidate-specific filename
  const filename = `candidate_${config.candidate.personalInfo.firstName.toLowerCase()}_${config.candidate.personalInfo.lastName.toLowerCase()}_${config.targetRole.title.toLowerCase().replace(/\s+/g, '')}.html`;
  
  fs.writeFileSync(filename, customHTML);
  
  return filename;
}
```

### Step 4: One-Click Generation Function

```javascript
// This is what you call - one function that does everything
function generateCandidateHTML(resumeText, targetRole) {
  console.log(`📋 Starting generation for ${targetRole}...`);
  
  // Step 1: Parse resume and create config
  console.log("📝 Parsing resume...");
  const config = parseResumeAndCreateConfig(resumeText, targetRole);
  
  // Step 2: Generate personalized content
  console.log("📚 Generating personalized Q&A...");
  const personalizedContent = generatePersonalizedContent(config);
  
  // Step 3: Generate HTML
  console.log("🎨 Creating personalized HTML...");
  const filename = generatePersonalizedHTML(config, personalizedContent);
  
  console.log(`✅ Complete! Generated: ${filename}`);
  console.log(`📊 Content Summary:`);
  console.log(`   - Candidate: ${config.candidate.personalInfo.firstName} ${config.candidate.personalInfo.lastName}`);
  console.log(`   - Target Role: ${config.targetRole.title}`);
  console.log(`   - Domain: ${config.targetRole.domain}`);
  console.log(`   - Topics Covered: ${config.customQuestionFilters.includeTopics.length}`);
  console.log(`   - Questions Generated: ${personalizedContent.section2.length + personalizedContent.section3.length + personalizedContent.section4.length + personalizedContent.section5.length + personalizedContent.section6.length}`);
  
  return filename;
}

// Usage
const resumeFile = fs.readFileSync('john_doe_resume.txt', 'utf8');
const htmlFile = generateCandidateHTML(resumeFile, "L2 Support Engineer");
// Output: candidate_john_doe_l2supportengineer.html
```

---

## Testing & Validation

### Validation Checklist

Before delivering personalized HTML, verify:

- [ ] **Personal Info**: Candidate name, role, and level correctly displayed
- [ ] **Section 1**: Welcome message personalized with candidate name and target role
- [ ] **Section 2**: Domain-specific Q&A matches candidate's field (IT, HR, Finance, etc.)
- [ ] **Section 3**: Scenarios are relevant to their experience level
- [ ] **Section 4**: Project experience questions match their actual projects
- [ ] **Section 5**: Tools listed are skills they actually have
- [ ] **Section 6**: Master Q&A filtered by their skills (no irrelevant questions)
- [ ] **Section 7**: Interview tips tailored to their target role
- [ ] **Question Count**: Correct number per section (40, 30, 25, 35, 500)
- [ ] **Difficulty Distribution**: Matches their experience level
- [ ] **No Generic Content**: No reference to other domains or roles
- [ ] **Styling**: CSS and design identical to original
- [ ] **Functionality**: Quiz, scoring, and features work correctly
- [ ] **Navigation**: All 9 sections accessible and titled correctly

### Test Cases

**Test Case 1: IT Support Engineer (John Doe)**
```
Input: John Doe resume with 4 years IT support
Expected:
- Sections mention Windows, Networking, ServiceNow
- No HR or Finance content
- Intermediate difficulty with Expert scenarios
- 500-question master list filtered to IT topics
Status: PASS / FAIL
```

**Test Case 2: HR Recruiter (Sarah Chen)**
```
Input: Sarah Chen resume with 6 years HR experience
Expected:
- Sections mention Recruitment, BGV, Compliance
- No IT or Finance content
- Focus on people and processes
- 500-question master list filtered to HR topics
Status: PASS / FAIL
```

**Test Case 3: Finance Analyst (Mike Johnson)**
```
Input: Mike Johnson resume with 5 years accounting
Expected:
- Sections mention GL, Reconciliation, SAP
- No IT or HR content
- Advanced difficulty with compliance focus
- 500-question master list filtered to Finance topics
Status: PASS / FAIL
```

### Performance Metrics

Track these for each generated HTML:

| Metric | Target | Status |
|--------|--------|--------|
| Generation Time | < 5 seconds | - |
| File Size | < 500 KB | - |
| Questions Personalized | 100% | - |
| Content Relevance | 95%+ | - |
| Design Fidelity | 100% | - |
| User Satisfaction | 90%+ | - |

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1)
- [ ] Create CANDIDATE_CONFIG_TEMPLATE.json
- [ ] Document mapping logic
- [ ] Build configuration parser

### Phase 2: Content Generation (Week 2)
- [ ] Implement content generator functions
- [ ] Create question filtering logic
- [ ] Build section-specific generators

### Phase 3: HTML Generation (Week 3)
- [ ] Implement HTML template processor
- [ ] Create personalization injector
- [ ] Build file naming and saving logic

### Phase 4: Testing & Refinement (Week 4)
- [ ] Test with multiple candidate types
- [ ] Refine question generation logic
- [ ] Build quality validation checks

### Phase 5: Automation (Week 5)
- [ ] Create one-click generation script
- [ ] Build web UI for file upload
- [ ] Add batch processing capability

---

## Quick Start

### To Generate a Personalized HTML:

1. **Gather Resume Information**
   ```
   Candidate name, experience, skills, target role
   ```

2. **Create Configuration**
   ```json
   {
     "candidate": {...},
     "targetRole": {...},
     "customQuestionFilters": {...}
   }
   ```

3. **Run Generation**
   ```javascript
   generateCandidateHTML(resumeText, targetRole);
   ```

4. **Output**
   ```
   candidate_john_doe_l2supportengineer.html
   ```

5. **Share**
   ```
   Send to candidate for interview prep
   ```

---

**Version**: 1.0
**Last Updated**: February 2026
**Status**: Ready for Implementation

