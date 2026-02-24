# GitHub Copilot Chat Integration - Troubleshooting Guide
## Debug Common Issues & Solutions

---

## 🔴 Critical Issues

### Issue 1: Chat Command Not Recognized

**Symptom:** Type `@candidateGenerator` and nothing happens

**Diagnosis Steps:**
1. Is GitHub Copilot Chat open?
2. Do you see `@candidateGenerator` in autocomplete?
3. Did extension installation complete?

**Solutions:**

**Solution A: Reload Extension**
```
Ctrl+R (Windows/Linux) or Cmd+R (Mac)
Wait for VS Code to fully reload
Try command again
```

**Solution B: Reinstall Extension**
```
1. Delete folder: ~/.vscode/extensions/candidate-html-generator
2. Reinstall following guide: VS_CODE_EXTENSION_INSTALLATION.md
3. Restart VS Code completely (close all windows)
```

**Solution C: Check Activation Events**
```
Ctrl+Shift+U (Open Output panel)
Select "Extension Host" from dropdown
Look for: "Extension activated"
If not there, extension failed to activate
```

**Solution D: Verify GitHub Copilot Chat**
```
1. Open Extensions: Ctrl+Shift+X
2. Search for "GitHub Copilot Chat"
3. If not installed, install it first
4. Sign into GitHub: Accounts button in VS Code
5. Then reload
```

---

### Issue 2: Script Execution Fails

**Symptom:** Command runs but says "Script not found" or execution error

**Error Message Examples:**
- "Cannot find Node.js"
- "Python not configured"
- "generate-candidate-html.js not found"

**Diagnosis:**

**Step 1: Check Node.js**
```powershell
# Windows
node --version

# Should output: v14.0.0 or higher
```

**Step 2: Check Python**
```powershell
python --version
# or
python3 --version

# Should output: Python 3.6 or higher
```

**Step 3: Check Script Location**
```
Open extension folder: ~/.vscode/extensions/candidate-html-generator
Verify these files exist:
✓ generate-candidate-html.js
✓ generate-candidate-html.py
```

**Solutions:**

**If Node.js Missing:**
1. Download: https://nodejs.org/ (LTS version)
2. Install completely
3. Restart VS Code
4. Try command again

**If Python Missing:**
1. Download: https://www.python.org/
2. Install with "Add to PATH" checked
3. Restart VS Code
4. Try command again

**If Scripts Missing:**
1. Verify files in workspace root (not in extension folder)
2. Or ensure extension folder has the files
3. Reinstall extension if missing

---

### Issue 3: Generated HTML File Not Created

**Symptom:** Command completes but no file appears in workspace

**Diagnosis:**

**Step 1: Check Working Directory**
```
What folder is open in VS Code?
File → Open Recent → Should show current workspace
```

**Step 2: Check Output Directory**
```
VS Code Settings (Ctrl+,)
Search: candidateHtmlGenerator.outputDirectory
Note the path (default: "./")
```

**Step 3: Check File Naming**
```
Sometimes file is created with different name
Look in workspace for any .html files
Filter by date modified (should be recent)
```

**Solutions:**

**Solution A: Check Output Directory Setting**
```
1. Ctrl+, (Settings)
2. Search: "candidateHtmlGenerator.outputDirectory"
3. Set to: "./" (current folder)
4. Reload: Ctrl+R
5. Try again
```

**Solution B: Create Output Folder**
```
If outputDirectory set to "./output/"

Windows PowerShell:
mkdir output

Or manually create in VS Code:
File Explorer → Right-click → New Folder → "output"
```

**Solution C: Check File Permissions**
```powershell
# Windows - Verify folder is writable
$folder = Get-Item "."
$acl = Get-Acl $folder
$acl.Access | Format-Table

# Should show: System, Administrators, Users have write permissions
```

---

## 🟡 Moderate Issues

### Issue 4: Admin Export File Not Found

**Symptom:** Command says "admin_export.json not found"

**Solutions:**

**Solution A: Create Test File**

Create test file in workspace root:

**admin_export.json:**
```json
{
  "candidate": {
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "currentRole": "IT Support Engineer",
    "experience": "5",
    "skills": ["Windows", "Networking", "Active Directory"]
  }
}
```

**Solution B: Export from Admin Console**
```
1. Open Admin Console
2. Find candidate
3. Click "Export to JSON"
4. Save in VS Code workspace root
5. Filename should be: admin_export.json
```

**Solution C: Use Different Filename**
```
If your file is named differently:

@candidateGenerator generate-files myfile.json resume.txt
```

---

### Issue 5: Resume Not Extracted Properly

**Symptom:** Generated HTML has missing skills or experience doesn't match resume

**Causes:**
- Resume format not recognized
- Skills section not found
- Different naming conventions

**Debug Steps:**

**Step 1: Check Resume Format**

Resume should have clear sections:
```
SKILLS
- Windows Server
- Active Directory
- ...

EXPERIENCE
Company (2020-2024) - Role
- Achievement 1
- Achievement 2
```

**Step 2: Enable Debug Logging**

In chat:
```
@candidateGenerator generate-files admin.json resume.txt --debug
```

**Check Output:**
- Look for line: "Resume parsing: Found X skills"
- Compare to actual resume

**Solutions:**

**Solution A: Fix Resume Format**

Ensure resume has these exact headers:
- `SKILLS` (not "Qualifications" or "Competencies")
- `EXPERIENCE` (not "Work History" or "Employment")
- `ACHIEVEMENTS` (optional, for highlights)

**Solution B: Create Properly Formatted Resume**

```
[RESUME FORMAT - Save as resume.txt]

JOHN DOE
Senior IT Support Engineer

SKILLS
- Windows Server Administration
- Active Directory
- Microsoft Teams Support
- Network Troubleshooting

EXPERIENCE
ABC Company (2020-2024) - Senior IT Support Engineer
- Managed 100+ support tickets monthly
- Implemented Active Directory policies

XYZ Company (2018-2020) - IT Support Technician
- Provided first-line technical support
- Managed helpdesk queue
```

**Solution C: Use Admin Console Data Only**

If resume causes issues, use just admin export:
```
@candidateGenerator quick generate
# Or
@candidateGenerator generate-files admin.json
```

---

### Issue 6: Data Merge Conflicts

**Symptom:** Generated HTML has weird data or missing information

**Possible Causes:**
- Conflicting data between admin export and resume
- Duplicate entries from both sources
- Data format mismatch

**Debug Steps:**

**Step 1: Enable Debug Output**
```
In chat: @candidateGenerator quick generate --verbose
```

**Step 2: Review Output**
- Look for "Merging admin data with resume"
- Check for "Duplicate skill found"
- Check for "Conflict resolved by taking (admin/resume)"

**Solutions:**

**Solution A: Use Admin Data Only**
```
@candidateGenerator generate-files admin.json
# Doesn't parse resume, uses only admin export
```

**Solution B: Use Resume Only**
```
# Manually edit admin_export.json to have minimal data
# Or create custom config with --config flag
```

**Solution C: Manual Inspection**
```
1. Check admin_export.json for typos
2. Check resume.txt for formatting
3. Look for duplicate skills
4. Remove conflicting entries
5. Try again
```

---

## 🟢 Minor Issues

### Issue 7: Slow Generation

**Symptom:** Command takes longer than expected

**Typical Times:**
- Quick generate: 2-5 seconds
- With parsing: 5-10 seconds
- With batch processing: 10-30 seconds

**If Taking Longer:**

**Check Current Load:**
```powershell
# Windows - Check CPU/Memory
Get-Process | Sort-Object CPU -Descending | Select -First 5
```

**Solutions:**
1. Close other applications
2. Clear temporary files
3. Restart VS Code
4. Restart computer

---

### Issue 8: Chat Output Truncated

**Symptom:** Chat response is cut off or incomplete

**Solution:**

The chat window has a character limit. Full status available in:

```
1. Look at generated HTML file
2. Check VS Code Output panel
3. Run: @candidateGenerator show-status
```

---

### Issue 9: Generated HTML Has Wrong Name

**Symptom:** File created but name doesn't match expectation

**Example:** Expected `candidate_john_doe.html` but got `candidate_johndoe.html`

**Causes:**
- Multi-word names processed differently
- Special characters removed
- Spaces replaced with underscores

**Solution:**

Manually rename file in VS Code:
1. Right-click file
2. Select "Rename"
3. Type new name
4. Done

---

## 🔴 Advanced Debugging

### Enable Debug Mode

**In extension.js**, change:

```javascript
// Line ~20 (approximately)
const DEBUG = false;  // Change to: true
```

Then reload: `Ctrl+R`

Debug output will show in Output panel.

---

### Check VS Code Extension Logs

**Windows:**
```powershell
$logFile = "$env:APPDATA\Code\logs"
Get-ChildItem $logFile -Recurse -Filter "*.log" | Sort-Object -Property LastWriteTime -Descending | Select -First 5
```

**Mac:**
```bash
~/Library/Logs/Code/
```

---

### Check Node.js/Python PATH

**Windows PowerShell:**
```powershell
$env:Path -split ";" | Where-Object {$_ -like "*node*" -or $_ -like "*python*"}
```

**Mac/Linux Bash:**
```bash
echo $PATH
which node
which python3
```

---

### Test Script Directly

**Windows PowerShell:**
```powershell
# Test Node.js version
node --version

# Test script directly
node generate-candidate-html.js
```

**Mac/Linux:**
```bash
# Test Python
python3 --version

# Test script
python3 generate-candidate-html.py
```

---

## 📋 Common Error Messages

### "Extension Host Connection Timeout"

**Cause:** Extension taking too long to start  
**Solution:** 
1. Restart VS Code
2. Check for conflicting extensions

### "Cannot read property 'send' of undefined"

**Cause:** Chat API not properly initialized  
**Solution:**
1. Reload: Ctrl+R
2. Reinstall extension

### "Workspace root not found"

**Cause:** No folder open in VS Code  
**Solution:**
1. File → Open Folder
2. Select a workspace
3. Try again

### "Invalid JSON in admin_export.json"

**Cause:** JSON syntax error  
**Solution:**
1. Copy JSON content
2. Paste into: https://jsonlint.com
3. Fix errors
4. Save file
5. Try again

---

## ✅ Verification Tests

### Test 1: Basic Setup

Run these in chat:
```
@candidateGenerator help
```

**Expected:** Shows command list

---

### Test 2: Status Check

```
@candidateGenerator status
```

**Expected:** Shows configuration and system info

---

### Test 3: Dry Run (No Generation)

```
@candidateGenerator validate admin_export.json
```

**Expected:** Validates file without generating

---

### Test 4: Quick Generation

```
@candidateGenerator quick generate
```

**Expected:**
- Creates file with candidate name
- Shows success message
- File appears in workspace

---

### Test 5: Custom Config

Create test file: `custom_config.json`

```json
{
  "adminFile": "admin_export.json",
  "resumeFile": "resume.txt",
  "emphasizeAreas": ["Troubleshooting", "SLA"],
  "difficultyLevel": "intermediate"
}
```

```
@candidateGenerator generate-custom custom_config.json
```

**Expected:** Uses custom config for generation

---

## 🆘 If Nothing Works

### Nuclear Option: Complete Reinstall

**Step 1: Backup**
```powershell
# Windows
Copy-Item "$env:USERPROFILE\.vscode" "$env:USERPROFILE\.vscode.backup"
```

**Step 2: Remove**
```powershell
# Remove extension
Remove-Item "$env:USERPROFILE\.vscode\extensions\candidate-html-generator" -Recurse

# Close VS Code completely
taskkill /IM Code.exe /F
```

**Step 3: Reinstall**

Follow: `VS_CODE_EXTENSION_INSTALLATION.md`

**Step 4: Verify**

Run all tests from "Verification Tests" section

---

### Contact Support

If issues persist, collect:

1. ✓ VS Code version (Help → About)
2. ✓ Extension version
3. ✓ Error message (from Output panel)
4. ✓ Log files (from troubleshooting section)
5. ✓ Steps to reproduce
6. ✓ Sample admin_export.json (without sensitive data)

---

## 📞 Quick Reference

| Issue | Quick Fix |
|---|---|
| Command not found | Reload: Ctrl+R |
| Script error | Check: node --version, python --version |
| File not created | Check: outputDirectory setting |
| Slow generation | Close other apps |
| Extension not activated | Reinstall extension |
| Chat not responding | Restart GitHub Copilot Chat |

---

**Version:** 1.0  
**Last Updated:** February 2026  
**Status:** Complete

For usage: See `COPILOT_CHAT_INTEGRATION.md`  
For installation: See `VS_CODE_EXTENSION_INSTALLATION.md`

