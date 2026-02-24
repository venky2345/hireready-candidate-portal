# VS Code Extension Installation Guide
## GitHub Copilot Chat - Candidate HTML Generator

---

## 📦 Installation Options

### **Option 1: Manual Installation (Recommended)**

#### Step 1: Locate VS Code Extensions Folder

**Windows:**
```powershell
%USERPROFILE%\.vscode\extensions
```
or
```powershell
C:\Users\[YourUsername]\.vscode\extensions
```

**Mac:**
```bash
~/.vscode/extensions
```

**Linux:**
```bash
~/.vscode/extensions
```

#### Step 2: Create Extension Directory

**Windows PowerShell:**
```powershell
mkdir "$env:USERPROFILE\.vscode\extensions\candidate-html-generator"
```

**Mac/Linux:**
```bash
mkdir -p ~/.vscode/extensions/candidate-html-generator
```

#### Step 3: Copy Extension Files

Copy these 4 files to the new directory:

```
candidate-html-generator/
├── package.json
├── extension.js
├── generate-candidate-html.js
└── generate-candidate-html.py
```

**Windows (PowerShell):**
```powershell
$extDir = "$env:USERPROFILE\.vscode\extensions\candidate-html-generator"
Copy-Item "package.json" $extDir/
Copy-Item "extension.js" $extDir/
Copy-Item "generate-candidate-html.js" $extDir/
Copy-Item "generate-candidate-html.py" $extDir/
```

**Mac/Linux (Bash):**
```bash
cp package.json ~/.vscode/extensions/candidate-html-generator/
cp extension.js ~/.vscode/extensions/candidate-html-generator/
cp generate-candidate-html.js ~/.vscode/extensions/candidate-html-generator/
cp generate-candidate-html.py ~/.vscode/extensions/candidate-html-generator/
```

#### Step 4: Reload VS Code

1. Close all editors in VS Code
2. Close VS Code completely
3. Reopen VS Code
4. Looking for message: "Extension installed successfully" (may appear briefly)

#### Step 5: Verify Installation

**In VS Code:**
1. Press `Ctrl+Shift+X` (Extensions panel)
2. Search for "Candidate HTML Generator"
3. Should see it listed (if not, scroll to "Installed")

---

### **Option 2: Using Command Palette**

#### Step 1: Open Command Palette

**Windows/Linux:** `Ctrl+Shift+P`  
**Mac:** `Cmd+Shift+P`

#### Step 2: Type Command

```
Developer: Install Extension from vsix
```

#### Step 3: Select File

Navigate to where you saved the extension files  
Select `package.json` or any file from the folder

#### Step 4: Wait for Installation

VS Code will register the extension

#### Step 5: Reload

Press `Ctrl+R` (Cmd+R on Mac) to reload

---

### **Option 3: Script-Based Installation**

**Windows Batch Script** - Save as `install-extension.bat`:

```batch
@echo off
setlocal enabledelayedexpansion

set "VSCODE_EXT_DIR=%USERPROFILE%\.vscode\extensions\candidate-html-generator"

echo Creating directory...
mkdir "%VSCODE_EXT_DIR%" 2>nul

echo Copying files...
copy /Y "package.json" "%VSCODE_EXT_DIR%\" >nul
copy /Y "extension.js" "%VSCODE_EXT_DIR%\" >nul
copy /Y "generate-candidate-html.js" "%VSCODE_EXT_DIR%\" >nul
copy /Y "generate-candidate-html.py" "%VSCODE_EXT_DIR%\" >nul

echo.
echo Installation complete!
echo Please restart VS Code for changes to take effect.
pause
```

**Run:** Double-click `install-extension.bat`

---

**Mac/Linux Shell Script** - Save as `install-extension.sh`:

```bash
#!/bin/bash

VSCODE_EXT_DIR=~/.vscode/extensions/candidate-html-generator

echo "Creating directory..."
mkdir -p "$VSCODE_EXT_DIR"

echo "Copying files..."
cp package.json "$VSCODE_EXT_DIR/"
cp extension.js "$VSCODE_EXT_DIR/"
cp generate-candidate-html.js "$VSCODE_EXT_DIR/"
cp generate-candidate-html.py "$VSCODE_EXT_DIR/"

echo ""
echo "Installation complete!"
echo "Please restart VS Code for changes to take effect."
```

**Run:**
```bash
chmod +x install-extension.sh
./install-extension.sh
```

---

## ✅ Verification Checklist

After installation:

- [ ] Extension folder exists at `~/.vscode/extensions/candidate-html-generator`
- [ ] All 4 files present: `package.json`, `extension.js`, `generate-candidate-html.js`, `generate-candidate-html.py`
- [ ] VS Code reload completed
- [ ] GitHub Copilot Chat is open (`Ctrl+Alt+I`)
- [ ] Type `@candidateGenerator help` shows response
- [ ] Status bar shows "$(file-code) Generate HTML" item

---

## 🔍 Troubleshooting Installation

### Problem: "Extension not showing in Extensions list"

**Solutions:**
1. Check extension folder path is exactly: `~/.vscode/extensions/candidate-html-generator`
2. Verify all 4 files are present
3. Delete the folder and reinstall
4. Close VS Code completely (not just reload)

### Problem: "@candidateGenerator not recognized or chat"

**Solutions:**
1. Reload VS Code: `Ctrl+R`
2. Close and reopen GitHub Copilot Chat: `Ctrl+Alt+I`
3. Check VS Code version: Should be 1.85 or higher
4. Make sure GitHub Copilot extension is installed

### Problem: "Permission denied" when copying files

**Windows:** Run Command Prompt as Administrator  
**Mac/Linux:** Use `sudo` or check folder permissions:

```bash
chmod 755 ~/.vscode/extensions/candidate-html-generator
chmod 644 ~/.vscode/extensions/candidate-html-generator/*
```

### Problem: "Script not found" when running command

**Solutions:**
1. Verify `generate-candidate-html.js` is in extension folder
2. Check Node.js installed: `node --version`
3. Or ensure Python installed: `python --version`
4. Clear VS Code cache: Delete `~/.vscode` and reinstall

---

## 🚀 First Run

### Step 1: Prepare Test Files

In your workspace, create test files:

**admin_export.json** (minimal):
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

**resume.txt** (minimal):
```
JOHN DOE
Senior IT Support Engineer
Email: john@example.com

SKILLS
- Windows Server Administration
- Network Troubleshooting
- Active Directory Management
- Microsoft Teams Support

EXPERIENCE
ABC Company (2019-2024) - Senior IT Support Engineer
- Managed 50+ user IT support tickets
- Resolved network connectivity issues
```

### Step 2: Open Chat

Press `Ctrl+Alt+I` (or `Cmd+Option+I` on Mac)

### Step 3: Run Command

Type in chat:
```
@candidateGenerator quick generate
```

### Step 4: Verify Success

You should see:
```
✅ Success! Generated: candidate_test_user_itsupportengineer.html
```

---

## 🔧 Troubleshooting First Run

### Error: "admin_export.json not found"

**Solution:** Make sure files are in workspace root (the folder you opened in VS Code)

### Error: "Command failed"

**Solutions:**
1. Check Node.js/Python installed
2. Review extension.js for path issues
3. Check file permissions
4. Look at VS Code Output panel for error details

### Error: "Invalid JSON"

**Solution:** Make sure `admin_export.json` has valid JSON syntax (use online JSON validator)

---

## 📊 Extension Details

| Property | Value |
|---|---|
| **Name** | Candidate HTML Generator |
| **ID** | candidate-html-generator |
| **Version** | 1.0.0 |
| **Publisher** | HireReady |
| **License** | MIT |
| **Repository** | Internal |
| **Min VS Code** | 1.85.0 |
| **Category** | Productivity |

---

## 📁 Extension Structure

```
~/.vscode/extensions/candidate-html-generator/
├── package.json              # Extension manifest
├── extension.js              # Main implementation
├── generate-candidate-html.js  # Node.js generation script
└── generate-candidate-html.py  # Python alternative script
```

---

## 🔐 Requirements

Before installation, verify you have:

✅ **VS Code 1.85+**  
   Check: Help → About  
   Or: https://code.visualstudio.com

✅ **GitHub Copilot Chat**  
   Install: Extensions → Search "GitHub Copilot Chat" → Install

✅ **GitHub Account**  
   Sign into VS Code with GitHub account

✅ **Node.js OR Python**  
   - Node.js 14+ (check: `node --version`)
   - OR Python 3.6+ (check: `python --version`)

✅ **Workspace Folder**  
   Open a folder in VS Code first: File → Open Folder

---

## 🚨 After Installation Checklist

- [ ] All 4 files copied to `~/.vscode/extensions/candidate-html-generator`
- [ ] VS Code restarted
- [ ] No errors in VS Code Output panel
- [ ] GitHub Copilot Chat working
- [ ] First test run successful (see "First Run" section)
- [ ] `@candidateGenerator help` command works
- [ ] `admin_export.json` and `resume.txt` ready in workspace

---

## 🆘 Still Having Issues?

### Check 1: Extension Log

1. Press `Ctrl+Shift+U` (Output panel)
2. Select "Extension Host" from dropdown
3. Look for error messages

### Check 2: VS Code Log

1. Help → Toggle Developer Tools
2. Press `F12`
3. Check Console tab for errors

### Check 3: Manual Verification

**Windows PowerShell:**
```powershell
Test-Path "$env:USERPROFILE\.vscode\extensions\candidate-html-generator\package.json"
# Should return: True
```

**Mac/Linux:**
```bash
ls ~/.vscode/extensions/candidate-html-generator/package.json
# Should show the file path
```

### Check 4: Dependencies

```
Node.js: node --version  (should show version)
Python: python --version  (should show version)
Git: git --version  (optional)
```

---

## 🔄 Uninstallation

If you need to remove the extension:

**Windows:**
```powershell
Remove-Item -Path "$env:USERPROFILE\.vscode\extensions\candidate-html-generator" -Recurse
```

**Mac/Linux:**
```bash
rm -rf ~/.vscode/extensions/candidate-html-generator
```

Then reload VS Code.

---

## 📞 Support

For issues:

1. Check this guide's troubleshooting section
2. Review VS Code Output panel for errors
3. Verify all dependencies installed
4. Try manual reinstallation
5. Check internet connection (for GitHub Copilot)

---

## 🎉 Success!

After installation, you can:

```
@candidateGenerator quick generate
```

This will generate personalized HTML for any candidate in your workspace!

---

**Installation Complete? Ready to use the chat commands!**

See: `COPILOT_CHAT_INTEGRATION.md` for usage guide

---

**Version:** 1.0  
**Platform:** Windows, Mac, Linux  
**Last Updated:** February 2026

