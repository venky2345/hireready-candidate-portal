# Personalized HTML Generator - Quick Start Guide

## One-Click Automation: Admin Console → Personalized structured.html

---

## 🚀 Quick Start (3 Steps)

### Step 1: Prepare Your Files
```
Your Downloads Folder Should Contain:
├── generate-candidate-html.js         ✓ (Automation script)
├── structured.html                    ✓ (Base template)
├── admin_export.json                  □ (From Admin Console export)
└── resume.pdf or resume.txt           □ (Optional - candidate resume)
```

### Step 2: Export from Admin Console
1. Open Admin Console → Candidate Details
2. Click **"Export JSON"** button
3. Save as `admin_export.json` in your downloads folder

### Step 3: Run the Script (Choose One)

#### Option A: Windows Command Prompt
```batch
cd C:\Users\HP\Downloads\New folder
node generate-candidate-html.js admin_export.json
```

#### Option B: Windows PowerShell
```powershell
cd "C:\Users\HP\Downloads\New folder"
node generate-candidate-html.js admin_export.json
```

#### Option C: With Resume File
```batch
node generate-candidate-html.js admin_export.json resume.txt
```

#### Option D: Using Example (Test It)
```batch
node generate-candidate-html.js ADMIN_CONSOLE_INTEGRATION_EXAMPLE.json
```

---

## 📋 What the Script Does

```
Input Files:
├── admin_export.json (Candidate details from Admin Console)
└── resume.txt (Optional - for skill/achievement extraction)
        │
        ▼
Automation Script:
├─ Reads Admin Console export
├─ Parses resume text
├─ Extracts skills, tools, achievements
├─ Merges both data sources
├─ Maps skills to question topics
├─ Generates personalized questions
├─ Creates personalized HTML
└─ Saves with candidate name
        │
        ▼
Output File:
└── candidate_firstname_lastname_role.html ✓
    (100% personalized, ready to use)
```

---

## ✨ Features

- ✅ **One-Click Generation** - Fully automated process
- ✅ **Intelligent Data Merging** - Combines Admin Console + Resume
- ✅ **Skill Recognition** - Automatically identifies 50+ IT/non-IT skills
- ✅ **Dynamic Topic Filtering** - Only relevant questions included
- ✅ **Smart Difficulty Calibration** - Matches candidate experience level
- ✅ **Professional Naming** - Auto-generates meaningful filenames
- ✅ **Error Handling** - Clear messages for any issues
- ✅ **Backup Creation** - Auto-backups before overwriting files

---

## 📊 What Gets Personalized

| Element | Generated From | Example |
|---------|---|---|
| **Welcome Message** | Admin Console name + role | "Welcome, Ajith! Your Senior IT Support Engineer Path" |
| **Section Intros** | Target role + experience | Tailored to their level |
| **Domain-Specific Q&A** | Skills extracted | IT Support, HR, Finance, etc. |
| **Scenario Questions** | Projects + experience | Real-world situations relevant to them |
| **Tools Section** | Skills list | ServiceNow, Remote Desktop, Active Directory, etc. |
| **Master Q&A (500)** | Filtered topics | Only questions matching their background |
| **Interview Tips** | Career goals + role | Specific to their position and goals |
| **Difficulty Level** | Years of experience | Beginner/Intermediate/Expert distribution |

---

## 📥 Example Usage

### Scenario: Generating HTML for "Ajith Kumar"

**Step 1: Get the Admin Console Export**
- Open Admin Console
- Find candidate: Ajith Kumar (CAND_AJITH_405770)
- Click "Export JSON"
- Save as `admin_ajith.json`

**Step 2: Get the Resume**
- Download resume from Admin Console
- Save as `resume_ajith.txt`

**Step 3: Run the Script**
```batch
node generate-candidate-html.js admin_ajith.json resume_ajith.txt
```

**Step 4: Output**
```
✓ GENERATION COMPLETE
========================================
Output File: candidate_ajith_kumar_senioritsupportengineer.html
Location: C:\Users\HP\Downloads\New folder\candidate_ajith_kumar_senioritsupportengineer.html
Candidate: Ajith Kumar
Role: Senior IT Support Engineer
Domain: IT Support
Experience: 5 years
Skills: 14
Topics: 12
```

**Step 5: Share**
- Open generated HTML in browser
- Send link to candidate for interview prep
- Candidate sees 100% personalized content

---

## 🔧 Script Options & Configuration

### Command Line Arguments

```
REQUIRED:
  adminConsoleJSON    Path to Admin Console export file (.json)
  
OPTIONAL:
  resumeFile          Path to resume file (.txt, .pdf, .doc)
```

### Configuration (Inside Script)

Edit `generate-candidate-html.js` to customize:

```javascript
const CONFIG = {
  baseTemplateFile: 'structured.html',        // Template to use
  outputDir: './',                            // Where to save output
  logLevel: 'info',                           // Logging detail
  validateBeforeGeneration: true,             // Strict validation
  autoBackup: true                            // Backup old files
};
```

---

## 🐛 Troubleshooting

### Error: "structured.html not found"
**Solution**: Make sure `structured.html` is in the same folder as the script

### Error: "Cannot parse JSON"
**Solution**: Verify the Admin Console export is valid JSON (not corrupted)

### Output: "No topics extracted"
**Solution**: Resume may not have clear skills section. Add skills manually or format resume with "SKILLS" header

### Output: "Wrong candidate name"
**Solution**: Check Admin Console export - fullName must be in `personalInformation` section

### Want Different Difficulty Level?
**Solution**: Script auto-detects from years of experience. Adjust this in Admin Console data

---

## 📝 File Format Requirements

### Admin Console Export (.json)
```json
{
  "adminConsoleExport": {
    "candidateDetails": {
      "recordInfo": { ... },
      "personalInformation": { ... },
      "employmentHistory": { ... },
      "certifications": [ ... ]
    },
    "resume": { ... }
  }
}
```

### Resume File (.txt)
```
PROFESSIONAL SUMMARY
[Summary text]

TECHNICAL SKILLS
• Skill 1
• Skill 2

WORK EXPERIENCE
Company Name | Position (Year - Year)

KEY ACHIEVEMENTS
• Achievement 1
• Achievement 2

CERTIFICATIONS
• Cert 1
```

---

## 🎯 Batch Processing (Multiple Candidates)

### Create a Batch File (Windows)

Save as `generate_all.bat`:
```batch
@echo off
echo Generating personalized HTML for all candidates...

node generate-candidate-html.js admin_candidate1.json resume1.txt
node generate-candidate-html.js admin_candidate2.json resume2.txt
node generate-candidate-html.js admin_candidate3.json resume3.txt

echo All candidates processed!
pause
```

### Run All at Once
```batch
cd C:\Users\HP\Downloads\New folder
generate_all.bat
```

---

## 📊 Output Examples

### IT Support Candidate
```
candidate_ajith_kumar_senioritsupportengineer.html
├── Welcome: "Your IT Support Engineer Path"
├── Skills: Windows 10, ServiceNow, Active Directory
├── Questions: 340 IT-focused questions
└── Tips: SLA, troubleshooting, escalation
```

### HR Recruiter Candidate
```
candidate_sarah_chen_hrbgvspecialist.html
├── Welcome: "Your HR BGV Specialist Path"
├── Skills: Recruitment, BGV, Compliance
├── Questions: 340 HR-focused questions
└── Tips: BGV, risk mitigation, compliance
```

### Finance Analyst Candidate
```
candidate_mike_johnson_financeanalyst.html
├── Welcome: "Your Finance Analyst Expert Path"
├── Skills: SAP, GL, Reconciliation
├── Questions: 340 Finance-focused questions
└── Tips: Accuracy, reconciliation, audit
```

---

## 🔍 How Skills Are Mapped

The script recognizes:

### IT Skills
- Windows 10/11, Linux, macOS
- ServiceNow, Active Directory, Remote Desktop
- SQL, Python, PowerShell
- DNS, DHCP, VPN, TCP/IP
- And 40+ more IT technologies

### Business Skills
- Excel, Word, PowerPoint
- Recruitment, BGV, Sales
- SAP, Accounting, Finance
- And domain-specific terms

### Smart Mapping
```
"Windows 10" → [windows-support, drivers, performance, windows-updates]
"ServiceNow" → [servicenow, sla, incident-request, escalation]
"Active Directory" → [login-profile, active-directory]
"Recruitment" → [talent-acquisition, candidate-assessment]
```

---

## ✅ Validation Checks

Before generating HTML, the script validates:

- [ ] Admin Console export has required fields
- [ ] Candidate ID exists
- [ ] Personal information complete
- [ ] Employment history present
- [ ] Skills can be extracted
- [ ] Base template exists
- [ ] No corrupted JSON

If validation fails, script shows specific error and suggests fixes.

---

## 🚦 Script Output Meaning

### Status Codes
- `✓` - Success, operation completed
- `DEBUG` - Detailed information (for troubleshooting)
- `INFO` - General information about process
- `WARN` - Something may be wrong but trying to continue
- `ERROR` - Critical issue, cannot continue

### Example Output
```
[12:34:56] INFO Reading Admin Console export...
[12:34:56] DEBUG Validating Admin Console export structure...
[12:34:56] ✓ Successfully parsed Admin_Console_Export.json
[12:34:56] INFO Parsing resume...
[12:34:56] DEBUG Extracted 14 skills from resume
[12:34:56] INFO Merging Admin Console export and resume data...
[12:34:56] ✓ Merged configuration created for Ajith Kumar
[12:34:57] INFO Generating personalized HTML...
[12:34:57] ✓ HTML generation complete
[12:34:57] INFO Saving output file...
[12:34:57] ✓ File saved: candidate_ajith_kumar_senioritsupportengineer.html

✓ GENERATION COMPLETE
========================================
```

---

## 📚 Related Documentation

For more details, see:
- `ADMIN_CONSOLE_INTEGRATION_GUIDE.md` - Complete integration guide
- `DYNAMIC_GENERATION_GUIDE.md` - Generation architecture
- `CANDIDATE_CONFIG_TEMPLATE.json` - Configuration structure
- `INSTRUCTIONS.md` - Candidate study guide

---

## 💡 Tips & Best Practices

1. **Always export** latest candidate data from Admin Console
2. **Use resume** when available for enhanced skill extraction
3. **Test with example** first (`ADMIN_CONSOLE_INTEGRATION_EXAMPLE.json`)
4. **Check output** HTML loads correctly in browser before sharing
5. **Batch process** multiple candidates using batch file
6. **Keep backups** of original structured.html (auto-created)
7. **Name systematically** - use candidate IDs if needed

---

## 🎓 For Candidates

Once their personalized HTML is generated and shared:

1. Open in any browser
2. Choose a section to study
3. Take quiz for real-time feedback
4. Review score and weak areas
5. Practice scenarios specific to their role
6. Use interview tips tailored to their position
7. Retake quizzes to improve

All content matched to their skills, experience, and target role!

---

## 📞 Support

If you encounter issues:

1. **Check console output** - look for ERROR or WARN messages
2. **Verify file paths** - ensure files exist in correct location
3. **Validate JSON** - use online JSON validator if export looks wrong
4. **Check Node.js version** - `node --version` should be 14.0 or higher
5. **Review example** - Try with `ADMIN_CONSOLE_INTEGRATION_EXAMPLE.json` first

---

## 🎯 Next Steps

1. ✅ Download `generate-candidate-html.js`
2. ✅ Place in Downloads folder with `structured.html`
3. ✅ Export candidate from Admin Console
4. ✅ Run: `node generate-candidate-html.js admin_export.json`
5. ✅ Share generated HTML with candidate
6. ✅ Candidate starts interview prep with personalized content!

---

**Version**: 1.0  
**Last Updated**: February 2026  
**Status**: Production Ready

