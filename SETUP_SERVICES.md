# HireReady Services - Quick Setup Guide

## 🚨 CRITICAL FIRST STEP: Update Admin Email

Before testing, **YOU MUST** update the admin email allowlist in `services.html`:

### Edit services.html (around line 967)

```javascript
const ADMIN_EMAILS = [
  "YOUR_ACTUAL_ADMIN_EMAIL@example.com",  // ← CHANGE THIS!
  "admin@hireready.com"
].map(e => e.toLowerCase());
```

**Replace with the EXACT email you use to login to admin.html**

## 🧪 Testing Steps

### 1. Deploy to Netlify or Use Live Server
```bash
# Do NOT use file:// protocol
# Option A: Deploy to Netlify (recommended)
git push  # Netlify auto-deploys

# Option B: Use VS Code Live Server
# Install "Live Server" extension
# Right-click admin.html → "Open with Live Server"
```

### 2. Login to Admin Console
1. Open `admin.html` via Netlify URL or `http://localhost:5500/admin.html`
2. Login with your Firebase Auth credentials
3. Load a candidate record (or create one)

### 3. Open HireReady Services
1. Click the **"HireReady Services"** button (green button in toolbar)
2. New tab opens with `services.html?cid=CANDIDATE_ID`

### 4. Expected Behavior

**If services.html shows "Checking access..."**
✅ Good! Auth is initializing

**Then one of these will happen:**

**A) Login Screen Appears**
- Enter your admin email (must match ADMIN_EMAILS array)
- Enter your password
- Click "Sign In as Admin"
- After login → Services editor appears

**B) Services Editor Appears Directly**
- You're already logged in from admin.html
- Session persisted across tabs
- Editor loads candidate data

**C) "Access Denied" Appears**
❌ Your email is NOT in ADMIN_EMAILS array
→ Go back and update services.html with your actual email

**D) "No Candidate Selected" Appears**
❌ Candidate ID missing
→ Click the button from admin.html (don't manually navigate to services.html)

## 🐛 Debugging with Console Logs

Open Browser DevTools (F12) and check Console for these logs:

```
SERVICES_FIREBASE_INIT_OK
SERVICES_AUTH_PERSISTENCE_SET LOCAL
SERVICES_CID { cidFromUrl: "CAND_...", cidFromSession: "CAND_...", finalCid: "CAND_..." }
SERVICES_AUTH_STATE { email: "your@email.com", uid: "abc123", hasUser: true }
SERVICES_ADMIN_CHECK { email: "your@email.com", isAdmin: true, allowlist: [...] }
SERVICES_FLOW "Admin + candidate ID -> showing editor"
```

**If isAdmin is false:**
→ Your email doesn't match ADMIN_EMAILS

**If email is null:**
→ You're not logged in → Login screen should appear

## 🔧 Common Issues

### Issue: "Access Denied" immediately
**Cause:** Your email not in ADMIN_EMAILS  
**Fix:** Update services.html line 967 with your email

### Issue: Login form not working
**Cause:** Wrong email/password or Firebase Auth issue  
**Fix:** 
- Check console for SERVICES_LOGIN_ERROR
- Verify email/password are correct
- Check Firebase Console → Authentication

### Issue: "No candidate selected"
**Cause:** CandidateId not passed correctly  
**Fix:** 
- Always use the button from admin.html
- Don't manually type services.html URL
- Check console: SERVICES_CID should show finalCid

### Issue: Data not saving
**Cause:** Firestore rules or Firebase connection  
**Fix:**
- Deploy firestore.rules
- Check console for SERVICES_SAVE_ERROR
- Verify Firestore rules allow write for admins

## ✅ Testing Checklist

- [ ] Updated ADMIN_EMAILS with my actual email
- [ ] Deployed to Netlify or running on Live Server (not file://)
- [ ] Logged into admin.html successfully
- [ ] Loaded a candidate in admin.html
- [ ] Clicked "HireReady Services" button
- [ ] services.html opened in new tab
- [ ] Either login appeared OR editor appeared directly
- [ ] After login, editor loads correctly
- [ ] Can edit service fields
- [ ] Save works and shows toast notification
- [ ] Status pills update correctly

## 📊 Architecture Overview

```
admin.html (Admin Console)
  ↓ User clicks "HireReady Services"
  ↓ Sets sessionStorage('hr_active_cid', candidateId)
  ↓ Opens new tab
  ↓
services.html (Admin Editor)
  ↓ Check auth state
  ↓ If not logged in → Show login
  ↓ If logged in → Check admin allowlist
  ↓ If admin → Load candidate_services/{cid}
  ↓ Show editor with 5 services
  ↓ Save to Firestore with merge: true
```

## 🔐 Security Notes

- Login persists across tabs (Firebase LOCAL persistence)
- Admin check happens on every page load
- Firestore rules provide server-side security
- Email allowlist is case-insensitive
- Never shows "Access Denied" before auth state is known

## 📝 Next Steps

1. **Test the flow end-to-end**
2. **Create candidate portal users** using `setup-users.html`
3. **Deploy Firestore rules** with `firebase deploy --only firestore:rules`
4. **Update ADMIN_EMAILS** for all your admin users
5. **For production:** Replace email allowlist with Firebase custom claims

---

**Need Help?**
Check browser console for debug logs with prefix `SERVICES_`
All auth and save operations are logged for debugging
