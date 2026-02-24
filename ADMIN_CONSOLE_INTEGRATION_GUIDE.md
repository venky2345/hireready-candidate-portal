# Admin Console Integration Guide
## Extract Candidate Data + Generate Personalized structured.html

---

## Overview

This guide explains how to use data from your **HireReady Services Admin Console** (candidate details form + resume) to automatically generate personalized `structured.html` files for interview preparation.

### What You Have:
1. **Admin Console Candidate Details Form** - Personal info, employment history, education, certifications
2. **Resume File** - Skills, experience, achievements, certifications
3. **Our Generation System** - Personalized HTML creator

### What You'll Get:
✅ Personalized `structured.html` with candidate-specific content
✅ Questions matching their skills and experience
✅ Scenarios relevant to their job role and level
✅ Interview tips tailored to their background

---

## Data Flow Architecture

```
┌──────────────────────────────────────────────────┐
│  HireReady Admin Console                         │
│  - Candidate Details Form                        │
│  - Employment History                            │
│  - Education & Certifications                    │
└──────────────┬───────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────┐
│  Export as JSON                                  │
│  (Admin Console Export Function)                 │
└──────────────┬───────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────┐
│  +                                               │
└──────────────┬───────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────┐
│  Resume File (PDF/TXT)                           │
│  - Upload from Admin Console                     │
└──────────────┬───────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────┐
│  Resume Parser                                   │
│  - Extract skills, experience, tools             │
│  - Extract achievements and projects             │
│  - Extract certifications                        │
└──────────────┬───────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────┐
│  Data Merger & Mapper                            │
│  - Combine Admin Console Export + Resume Data    │
│  - Map to CANDIDATE_CONFIG format                │
│  - Create extraction JSON                        │
└──────────────┬───────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────┐
│  Content Generator                               │
│  - Filter TOPICS by candidate skills             │
│  - Generate personalized Q&A per section         │
│  - Create section introductions                  │
└──────────────┬───────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────┐
│  HTML Generator                                  │
│  - Take structured.html base template            │
│  - Inject personalized content                   │
│  - Update with candidate metadata                │
└──────────────┬───────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────┐
│  Output                                          │
│  candidate_ajith_kumar_senioritsupportengineer   │
│            .html                                 │
│  - Ready to use immediately                      │
│  - 100% personalized for Ajith                   │
└──────────────────────────────────────────────────┘
```

---

## Step 1: Extract Data from Admin Console

### From Candidate Details Form, Collect:

**Personal Information Section:**
```
✓ Full Name
✓ Preferred Name
✓ Gender
✓ Date of Birth
✓ Contact (Phone, Email, WhatsApp)
✓ Professional Email
```

**Employment History Section:**
```
✓ Total Experience (Years + Months)
✓ Current Company Name
✓ Designation (Current)
✓ Joining Date (Current)
✓ CTC & In-Hand Salary
✓ Type of Skills: [Extract from "Remarks" or Skills field]
✓ Tools Used: [Extract from job description]
✓ Previous Company Names & Roles
✓ Experience at each company
```

**Education Section:**
```
✓ Highest Degree & Field of Study
✓ College & University Names
✓ Percentage / CGPA
✓ Year of Completion
✓ Intermediate/Diploma details
✓ 10th Standard details
```

**Certifications Section:**
```
✓ Certification Names
✓ Issuing Bodies
✓ Issue & Expiry Dates
✓ Status (Active/Expired)
```

**Other Details:**
```
✓ Candidate ID
✓ Status
✓ Last Updated
✓ Family Details (for context)
```

### Export As JSON:

Your Admin Console should provide an **Export as JSON** button that creates:

```json
{
  "adminConsoleExport": {
    "candidateDetails": {
      "recordInfo": {...},
      "personalInformation": {...},
      "employmentHistory": {...},
      "educationHistory": {...},
      "certifications": [...]
    }
  }
}
```

**Location**: `Admin Console → Edit Candidate → Export JSON`

---

## Step 2: Extract Data from Resume

### Resume Upload & Extraction:

Your Admin Console stores resume files. Extract/upload these files and parse them to get:

**From Resume, Extract:**

1. **Professional Summary**
   - Current role/level
   - Years of experience claimed
   - Specialty areas

2. **Technical Skills**
   - List of skills with proficiency levels (Expert/Intermediate/Beginner)
   - Programming languages, tools, platforms
   - Operating systems and networking knowledge

3. **Work Experience**
   - Company names and dates
   - Job titles and roles
   - Key responsibilities
   - Achievements and metrics (e.g., "improved FCR by 17%")
   - Tools and technologies used

4. **Projects**
   - Project names and descriptions
   - Role and responsibilities
   - Technologies used
   - Outcomes/achievements

5. **Certifications**
   - Names, dates, status
   - Relevant to job domain

6. **Education**
   - Degrees, colleges, specializations
   - CGPA/Percentage

7. **Key Achievements**
   - Metrics and quantifiable results
   - Notable projects or accomplishments

### Resume Extraction Methods:

#### Option A: Manual Parsing
- Read resume from Admin Console
- Manually extract skills, tools, experience
- Create structured data

#### Option B: Automated Parsing
```javascript
// Use resume parser library
const resumeParser = require('resume-parser');

const extractedResume = resumeParser.parse(resumeFile);

// Returns:
{
  name: "Ajith Kumar",
  summary: "5 years of IT Support experience...",
  skills: ["Windows 10", "ServiceNow", "Active Directory", ...],
  experience: [...],
  education: [...],
  certifications: [...]
}
```

#### Option C: OCR for PDF
```javascript
const pdf = require('pdf-parse');

const extractText = (pdfFile) => {
  return pdf(fs.readFileSync(pdfFile))
    .then(data => {
      // Returns readable text from PDF
      return data.text;
    });
};
```

---

## Step 3: Merge & Map Data

### Data Mapping Process:

```
Admin Console Fields          →    CANDIDATE_CONFIG Fields
───────────────────────────────────────────────────────
fullName                      →    personalInfo.firstName + lastName
professionalEmail             →    personalInfo.email
dateOfBirth + age             →    personalInfo.age
currentCompany.designation    →    personalInfo.title
totalExperience.years+months  →    personalInfo.yearsOfExperience
currentCompany.skills[]       →    technicalSkills[]
resume.extractedText.skills   →    technicalSkills[] (merge)
currentCompany.joiningDate    →    workExperience[0].duration.from
currentCompany.tools          →    technicalSkills[].name
resume achievements           →    workExperience[].achievementHighlights
certifications[]              →    experienceLevel.certifications[]
previousCompany1, 2...        →    workExperience[1], [2]...
```

### Implementation:

```javascript
function mergeAdminConsoleAndResume(adminConsoleJSON, resumeText) {
  // Parse both sources
  const adminData = JSON.parse(adminConsoleJSON);
  const resumeData = parseResume(resumeText);
  
  // Merge and create config
  const mergedConfig = {
    candidate: {
      personalInfo: {
        candidateId: adminData.candidateDetails.recordInfo.candidateId,
        firstName: adminData.candidateDetails.personalInformation.fullName.split(' ')[0],
        lastName: adminData.candidateDetails.personalInformation.fullName.split(' ')[1],
        email: adminData.candidateDetails.personalInformation.professionalEmail,
        phone: adminData.candidateDetails.personalInformation.phoneNumber,
        title: adminData.candidateDetails.employmentHistory.currentCompany.designation,
        yearsOfExperience: adminData.candidateDetails.employmentHistory.totalExperience.years
      },
      technicalSkills: [
        ...extractSkillsFromAdminConsole(adminData),
        ...extractSkillsFromResume(resumeData)  // Merge and deduplicate
      ],
      workExperience: [
        ...extractWorkExperienceFromAdminConsole(adminData),
        ...extractWorkExperienceFromResume(resumeData)
      ],
      certifications: extractCertificationsFromAdminConsole(adminData),
      projectExperience: extractProjectsFromResume(resumeData),
      strengths: extractStrengthsFromResume(resumeData),
      weaknesses: identifyWeaknessesFromData(adminData, resumeData)
    }
  };
  
  return mergedConfig;
}
```

---

## Step 4: Create Extraction JSON

### Output Format:

Save the merged data as `ADMIN_CONSOLE_INTEGRATION_EXAMPLE.json` containing:

```json
{
  "adminConsoleExport": {
    "candidateDetails": { ... },
    "resume": {
      "fileName": "...",
      "extractedText": "..."
    }
  },
  "extractedCandidateConfig": {
    "candidate": {
      "personalInfo": { ... },
      "technicalSkills": [ ... ],
      "workExperience": [ ... ],
      "customQuestionFilters": { ... }
    }
  }
}
```

This becomes your **reference document** for generating personalized HTML.

---

## Step 5: Generate Personalized structured.html

### Using the Extraction JSON:

```javascript
function generateFromAdminConsoleData(integrationJSON) {
  const config = integrationJSON.extractedCandidateConfig;
  
  // Step 1: Filter TOPICS for this candidate
  const candidateTopics = filterTopicsForCandidate(
    TOPICS,
    config.candidate.customQuestionFilters.includeTopics,
    config.candidate.customQuestionFilters.excludeTopics
  );
  
  // Step 2: Generate personalized content for each section
  const personalizedContent = {
    section2: generateDomainSpecificQA(config),
    section3: generateScenarioBasedQA(config),
    section4: generateProjectBasedQA(config),
    section5: generateToolBasedQA(config),
    section6: generateMasterList(config)
  };
  
  // Step 3: Inject into template
  const htmlFile = injectContentIntoTemplate(
    'structured.html',
    config,
    personalizedContent,
    candidateTopics
  );
  
  // Step 4: Save with candidate-specific name
  const filename = `candidate_${config.candidate.personalInfo.firstName.toLowerCase()}_${config.candidate.personalInfo.lastName.toLowerCase()}.html`;
  saveHTMLFile(filename, htmlFile);
  
  return filename;
}

// Usage:
const integrationData = JSON.parse(fs.readFileSync('ADMIN_CONSOLE_INTEGRATION_EXAMPLE.json'));
const outputFile = generateFromAdminConsoleData(integrationData);
console.log(`Generated: ${outputFile}`);
```

---

## Data Extraction Examples

### Example 1: From Admin Console - Employment History

**Input (Admin Console Form):**
```
Current Company: Tech Solutions Pvt Ltd
Designation: Senior IT Support Engineer
Joining Date: Oct 14, 2019
CTC: 500000
Experience: 4 Years 11 Months
Remarks: Good performer, SLA compliant, Strong in Windows & ServiceNow
Tools Used: ServiceNow, Remote Desktop, Windows 10/11, Active Directory
```

**Extracted:**
```json
{
  "workExperience": [
    {
      "company": "Tech Solutions Pvt Ltd",
      "position": "Senior IT Support Engineer",
      "yearsInRole": 4.92,
      "toolsUsed": ["ServiceNow", "Remote Desktop", "Windows 10", "Windows 11", "Active Directory"],
      "achievements": ["SLA compliant", "Strong performer"]
    }
  ]
}
```

### Example 2: From Resume - Skills & Achievements

**Input (Resume Text):**
```
TECHNICAL SKILLS
• Windows 10 (Expert)
• Windows 11 (Intermediate)
• ServiceNow (Intermediate)
• Active Directory (Intermediate)
• Remote Desktop (Expert)

KEY ACHIEVEMENTS
• Improved FCR from 65% to 82%
• Reduced MTTR from 120 to 85 minutes
• Successfully migrated 150 users to Windows 11 with zero data loss
```

**Extracted:**
```json
{
  "technicalSkills": [
    { "name": "Windows 10", "proficiency": "expert" },
    { "name": "Windows 11", "proficiency": "intermediate" },
    { "name": "ServiceNow", "proficiency": "intermediate" }
  ],
  "strengths": [
    "Expert Windows 10 troubleshooting",
    "Improved FCR by 17%",
    "Reduced resolution time by 25%",
    "Successful large-scale migrations"
  ]
}
```

### Example 3: Question Generation Based on Data

**Input:**
```json
{
  "candidate": {
    "title": "Senior IT Support Engineer",
    "yearsOfExperience": 5,
    "technicalSkills": ["Windows 10", "Windows 11", "ServiceNow", "Active Directory"]
  }
}
```

**Generated Questions for Section 2:**

```
Q1. As a Senior IT Support Engineer with 5 years at Tech Solutions, 
    describe your approach to maintaining 92% SLA compliance while 
    supporting 200+ users.
Answer Expected: Discussion of ticketing strategy, prioritization, 
    escalation procedures, team coordination

Q2. Describe the Windows 11 migration project where you successfully 
    migrated 150 users with zero data loss.
Answer Expected: Project planning, communication, change management, 
    technical considerations, outcome metrics

Q3. What are the key steps in your troubleshooting methodology, and how 
    do you document findings in ServiceNow for future reference?
Answer Expected: Systematic approach, documentation standards, 
    knowledge base contribution
```

---

## Customization Fields by Domain

### IT Support Domain (Like Ajith):
```json
{
  "includeTopics": [
    "windows-support",
    "servicenow",
    "active-directory",
    "network-troubleshooting",
    "sla",
    "escalation"
  ],
  "emphasizeAreas": [
    "Team leadership",
    "SLA management",
    "Advanced troubleshooting",
    "Mentoring"
  ]
}
```

### HR Recruitment Domain:
```json
{
  "includeTopics": [
    "recruitment-process",
    "bgv",
    "compliance",
    "candidate-assessment",
    "offer-management"
  ],
  "emphasizeAreas": [
    "BGV accuracy",
    "Compliance",
    "Ethical decision-making",
    "Risk mitigation"
  ]
}
```

### Finance Domain:
```json
{
  "includeTopics": [
    "general-ledger",
    "reconciliation",
    "internal-controls",
    "audit",
    "reporting"
  ],
  "emphasizeAreas": [
    "Accuracy and attention to detail",
    "Deadline management",
    "Audit readiness",
    "Compliance"
  ]
}
```

---

## Complete Process Flowchart

```
START
  │
  ├─→ Open Admin Console
  │   ├─→ Candidate Details Form
  │   └─→ Export as JSON
  │
  ├─→ GET Admin Console JSON
  │   {
  │      personalInfo: {...},
  │      employmentHistory: {...},
  │      educationHistory: {...},
  │      certifications: [...]
  │   }
  │
  ├─→ GET Resume from Admin Console
  │   ├─→ Upload or Link Resume File
  │   └─→ Extract Text/Parse
  │
  ├─→ PARSE Resume
  │   ├─→ Extract Skills
  │   ├─→ Extract Experience
  │   ├─→ Extract Achievements
  │   └─→ Extract Certifications
  │
  ├─→ MERGE Both Sources
  │   ├─→ Combine skills from both
  │   ├─→ Deduplicate data
  │   └─→ Enrich with resume details
  │
  ├─→ CREATE CANDIDATE_CONFIG
  │   {
  │      personalInfo: {...},
  │      technicalSkills: [...],
  │      workExperience: [...],
  │      customQuestionFilters: {...}
  │   }
  │
  ├─→ FILTER TOPICS
  │   └─→ Based on includeTopics/excludeTopics
  │
  ├─→ GENERATE CUSTOM Q&A
  │   ├─→ Section 2: Domain-specific
  │   ├─→ Section 3: Scenarios
  │   ├─→ Section 4: Projects
  │   ├─→ Section 5: Tools
  │   └─→ Section 6: Master list (500 Q&A)
  │
  ├─→ CREATE HTML
  │   ├─→ Load base template (structured.html)
  │   ├─→ Inject personalized content
  │   ├─→ Update section headers
  │   └─→ Insert filtered TOPICS into JavaScript
  │
  ├─→ SAVE FILE
  │   └─→ candidate_firstname_lastname.html
  │
  └─→ END
     Output: Personalized structured.html for interview prep
```

---

## Validation & Quality Checks

Before generating the final HTML, verify:

- [ ] All candidate personal info extracted correctly
- [ ] All skills from both Admin Console and Resume included
- [ ] Experience dates align between sources
- [ ] Certifications properly categorized (Active/Expired)
- [ ] No duplicate data in merged config
- [ ] Skills map to the right topics
- [ ] Difficulty distribution matches experience level
- [ ] Output filename follows pattern: candidate_firstname_lastname.html
- [ ] HTML file opens without errors
- [ ] All 9 sections visible with personalized content
- [ ] Questions are relevant to candidate's skills and role

---

## Quick Reference: What Gets Generated

| Section | Generated From | Content Example |
|---------|---|---|
| Welcome (01) | Admin Console Name + Title | "Welcome Ajith! Your Senior IT Support Path" |
| Domain Q&A (02) | Resume Skills + Work History | "40 IT Support questions matching your Windows and ServiceNow expertise" |
| Scenarios (03) | Experience Level + Projects | "Real-world escalation scenarios for senior engineers" |
| Projects (04) | Work Experience Achievements | "Questions about Windows 11 migration, printer optimization" |
| Tools (05) | Extracted Skills List | "ServiceNow, Remote Desktop, Active Directory, Task Manager" |
| Master List (06) | Filtered TOPICS + All Skills | "500 Q&A filtered to IT topics only" |
| Tips (07) | Career Goals + Role | "Tips for senior engineer interviews, team leadership" |
| Mock (08) | Experience Level | "45-minute timed scenarios at senior level" |
| Support (09) | Domain | "Chat support for IT support candidates" |

---

## Implementation Checklist

- [ ] Admin Console export functionality working
- [ ] Resume parser implemented (manual or automated)
- [ ] Data merger function created
- [ ] CANDIDATE_CONFIG template updated
- [ ] Content generator functions built
- [ ] HTML template injector created
- [ ] File naming convention established
- [ ] Validation checks implemented
- [ ] Error handling added
- [ ] Test with sample candidate (Ajith Kumar example provided)
- [ ] Document for users created
- [ ] One-click generation script working

---

**Version**: 2.0
**Last Updated**: February 2026
**Status**: Ready for Admin Console Integration
**Example File**: ADMIN_CONSOLE_INTEGRATION_EXAMPLE.json

