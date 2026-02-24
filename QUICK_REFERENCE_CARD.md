# GitHub Copilot Chat Integration - Quick Reference Card

> **TL;DR Version** - Save this page for quick lookups

---

## 🚀 30-Second Quick Start

1. **Open Chat:** `Ctrl+Alt+I` (or `Cmd+Option+I` Mac)
2. **Type Command:** `@candidateGenerator quick generate`
3. **Done!** HTML file created in workspace

---

## ⚡ Common Commands

### Generate Instantly
```
@candidateGenerator quick generate
```
*(Looks for admin_export.json & resume.txt in workspace root)*

### Generate from Specific Files
```
@candidateGenerator generate-files /path/to/admin.json /path/to/resume.txt
```

### Interactive Setup
```
@candidateGenerator interactive setup
```
*(Chat guides you through entering candidate data)*

### Show Help
```
@candidateGenerator help
```

### Check Status
```
@candidateGenerator status
```

---

## 📁 Required Files

### For Quick Generation
```
Workspace Root/
├── admin_export.json   (from Admin Console export)
└── resume.txt          (candidate resume text)
```

### File Structure - admin_export.json
```json
{
  "candidate": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "currentRole": "IT Support Engineer",
    "experience": "5",
    "skills": ["Windows", "Networking", "Active Directory"]
  }
}
```

### File Structure - resume.txt
```
JOHN DOE

SKILLS
- Windows Server
- Active Directory
- Network Troubleshooting

EXPERIENCE
Company (2020-2024) - Senior IT Support Engineer
- Managed 100+ tickets
```

---

## 🔧 Installation (3 Steps)

**Step 1:** Get extension files
```
- package.json
- extension.js
- generate-candidate-html.js
- generate-candidate-html.py
```

**Step 2:** Copy to extensions folder
```
Windows: C:\Users\[YOU]\.vscode\extensions\candidate-html-generator\
Mac: ~/.vscode/extensions/candidate-html-generator/
Linux: ~/.vscode/extensions/candidate-html-generator/
```

**Step 3:** Reload VS Code
```
Ctrl+R (or Cmd+R on Mac)
```

Done! ✅

---

## ✅ Verification

| Check | Command | Expected |
|---|---|---|
| **Extension Active** | See status bar: "Generate HTML" | ✓ Visible |
| **Chat Ready** | `@candidateGenerator help` | ✓ Response |
| **Files Exist** | Look in workspace | ✓ admin_export.json, resume.txt |
| **Generation Works** | `@candidateGenerator quick generate` | ✓ HTML created |

---

## 🆘 Quick Fixes

| Problem | Fix |
|---|---|
| Chat command not recognized | Reload: `Ctrl+R` |
| Files not found | Ensure in workspace root with correct names |
| Script fails | Check: `node --version` or `python3 --version` |
| Slow execution | Close other applications |
| Extension not installed | Follow installation steps above |

---

## 📤 Example Output in Chat

```
@candidateGenerator quick generate

⏳ Processing...

Looking for files:
- admin_export.json ✓
- resume.txt ✓

Extracting data...
- Candidate: John Doe
- Experience: 5 years
- Skills found: 14
- Topics: 12

✅ Success! Generated: candidate_john_doe_itsupportengineer.html

File saved to: ./candidate_john_doe_itsupportengineer.html
Ready to share! 🎉
```

---

## 🎯 Workflow Template

```
1. Admin Console → Export JSON → Save as admin_export.json
2. Admin Console → Download Resume → Save as resume.txt
3. VS Code → Open Chat (Ctrl+Alt+I)
4. Chat → Type: @candidateGenerator quick generate
5. Wait → HTML file created automatically
6. Share → Send HTML to candidate
```

---

## 📋 File Naming

Generated files follow pattern:
```
candidate_[FIRSTNAME]_[LASTNAME]_[ROLE].html

Examples:
- candidate_john_doe_itsupportengineer.html
- candidate_sarah_chen_hrrecruiter.html
- candidate_mike_johnson_financeanalyst.html
```

---

## 🎓 Chat Commands Cheat Sheet

```
Help & Status:
@candidateGenerator help          → Show all commands
@candidateGenerator status        → Show config
@candidateGenerator validate FILE → Validate without generating

Generation:
@candidateGenerator quick generate                     → Quick mode
@candidateGenerator generate-files FILE1 FILE2        → Custom files
@candidateGenerator interactive setup                  → Step-by-step
@candidateGenerator batch BATCH_FILE                   → Multiple candidates

Advanced:
@candidateGenerator generate-custom CONFIG_FILE       → Custom config
@candidateGenerator show-defaults                      → Show defaults
@candidateGenerator clear-cache                        → Clear temporary files
```

---

## ⚙️ Configuration Defaults

| Setting | Value | Where to Change |
|---|---|---|
| Base Template | structured.html | VS Code Settings |
| Output Directory | ./ | VS Code Settings |
| Auto Backup | true | VS Code Settings |
| Log Level | info | extension.js |

**To Change:**
- Press `Ctrl+,` → Search "candidateHtmlGenerator"

---

## 📞 Emergency Contacts

| Need | Do This |
|---|---|
| Extension not showing | Delete folder & reinstall |
| Chat unresponsive | Reload: `Ctrl+R` |
| Permission denied | Run VS Code as Admin |
| Can't find files | Check file names (case-sensitive on Mac/Linux) |
| Still stuck | See GITHUB_COPILOT_TROUBLESHOOTING.md |

---

## 💡 Pro Tips

✨ **Tip 1:** Save chat history
```
Ctrl+A (select all in chat)
Ctrl+C (copy)
Paste into .txt file
```

✨ **Tip 2:** Quick access to chat
```
Ctrl+Alt+I (Windows/Linux)
Cmd+Option+I (Mac)
```

✨ **Tip 3:** Check generated files
```
View → Explorer
Look for .html files with candidate names
```

✨ **Tip 4:** Batch generate
```
Create multiple admin_export.json files
Use: @candidateGenerator batch-generate
```

✨ **Tip 5:** Debug mode
```
If having issues, add --debug flag:
@candidateGenerator quick generate --debug
```

---

## 📚 Full Documentation

For complete details, see:

- **Installation:** `VS_CODE_EXTENSION_INSTALLATION.md`
- **Chat Usage:** `COPILOT_CHAT_INTEGRATION.md`
- **Troubleshooting:** `GITHUB_COPILOT_TROUBLESHOOTING.md`
- **Terminal Guide:** `QUICK_START_GUIDE.md`

---

## ⏱️ Performance Expectations

| Operation | Time |
|---|---|
| Quick generate | 2-5 seconds |
| With resume parsing | 5-10 seconds |
| Batch (5 candidates) | 20-30 seconds |
| Interactive setup | 2-3 minutes |

---

## ✅ Pre-Generation Checklist

Before running generation:

- [ ] VS Code extensions installed
- [ ] GitHub Copilot Chat active
- [ ] Workspace folder open
- [ ] admin_export.json in workspace root
- [ ] resume.txt in workspace root (optional)
- [ ] Node.js or Python installed
- [ ] Internet connection (for Copilot)

---

## 🟢 Success Indicators

Know it worked when you see:
1. ✅ Chat responds with "Success!"
2. ✅ HTML file appears in VS Code Explorer
3. ✅ File name contains candidate details
4. ✅ File opens in browser (try double-click)

---

## 🎯 Next Steps After Generation

1. **Open File:** Double-click HTML file in Explorer
2. **Test:** Answer a few questions to verify content
3. **Review:** Check all sections loaded correctly
4. **Share:** Send file link to candidate
5. **Track:** Monitor candidate's progress

---

## 🔗 Quick Links

Gen Chat Documentation Path in Workspace:
```
COPILOT_CHAT_INTEGRATION.md ← Start here
VS_CODE_EXTENSION_INSTALLATION.md ← Installation help
GITHUB_COPILOT_TROUBLESHOOTING.md ← If issues
QUICK_START_GUIDE.md ← Terminal alternative
ADMIN_CONSOLE_INTEGRATION_GUIDE.md ← Data mapping
DYNAMIC_GENERATION_GUIDE.md ← Technical details
INSTRUCTIONS.md ← Candidate study guide
```

---

## 📊 Command Decision Tree

```
Need to generate?
├─ Files ready (admin.json + resume.txt)?
│  ├─ Yes → @candidateGenerator quick generate
│  └─ No → Create files first (see section above)
│
├─ Files at custom path?
│  └─ @candidateGenerator generate-files PATH1 PATH2
│
├─ Want to enter data in chat?
│  └─ @candidateGenerator interactive setup
│
├─ Multiple candidates?
│  └─ @candidateGenerator batch batchfile.json
│
└─ Just need help?
   └─ @candidateGenerator help
```

---

## 🚫 Common Mistakes to Avoid

❌ **Wrong:** Putting files in deep nested folder  
✅ **Right:** Put admin_export.json in workspace root

❌ **Wrong:** Using different file names  
✅ **Right:** Exactly: `admin_export.json` and `resume.txt`

❌ **Wrong:** Invalid JSON format  
✅ **Right:** Use JSON validator before running

❌ **Wrong:** Chat closed when running command  
✅ **Right:** Keep chat window open

❌ **Wrong:** No Node.js/Python installed  
✅ **Right:** Install at least one first

---

## 📱 Mobile Friendly Reference

**On Phone/Tablet?** Just remember:

**3 Commands:**
1. `help` - See options
2. `quick generate` - Create HTML
3. `status` - Check everything

**2 Files Needed:**
1. admin_export.json
2. resume.txt

**1 Step:** `@candidateGenerator quick generate`

---

## 🆔 Version Info

- **Extension Version:** 1.0.0
- **VS Code Min:** 1.85.0
- **Copilot Chat:** Required
- **Node.js/Python:** One required
- **Last Updated:** February 2026

---

<div align="center">

## 🎉 You're Ready!

**Next Action:** Open chat with `Ctrl+Alt+I` and type your first command!

Questions? See full guides linked above.

</div>

---

**Print This Page** for quick offline reference!

**Bookmark This File** in VS Code for fast access.

---

*Keep this reference card handy while using the extension!*

