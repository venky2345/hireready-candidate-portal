# HireReady Services - Setup Guide

## 🎯 Overview

This project implements a premium admin-to-candidate flow for HireReady services with 5 core features:

1. **JD Match Resume Builder** - ATS-optimized resumes
2. **Call Script Assistant** - Interview preparation scripts
3. **Mock Interview Practice** - Practice questions and guidance
4. **Live Interview Assistant** - Real-time interview support
5. **SmartApply Assistant** - Pre-filled application answers

## 📁 Project Structure

```
├── admin.html           # Admin Console (existing, updated with new button)
├── index.html           # Original user/admin page (kept as-is)
├── services.html        # NEW: Admin services editor
├── user.html            # NEW: Candidate portal with Firebase Auth
├── firestore.rules      # NEW: Firestore security rules
└── README.md            # This file
```

## 🚀 Quick Start

### 1. Deploy to Netlify

Your site is already on Netlify. Simply push these new files:

```bash
git add admin.html services.html user.html firestore.rules README.md
git commit -m "Add HireReady Services flow"
git push
```

Netlify will automatically deploy the updates.

### 2. Configure Firebase Security Rules

**Important:** Deploy the Firestore security rules to protect your data.

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy the rules
firebase deploy --only firestore:rules
```

### 3. **CRITICAL: Enable Firebase Anonymous Authentication**

This app requires Firebase Anonymous Auth because Firestore rules enforce `request.auth != null`. **Without this, candidates will see "Missing or insufficient permissions" errors.**

1. Go to **Firebase Console** → **Authentication** → **Sign-in method**
2. Find **Anonymous** 
3. Click the toggle to **Enable**
4. Click **Save**

If Anonymous Auth is disabled, the app will show a clear message: *"Enable Anonymous sign-in in Firebase Console → Authentication → Sign-in method."*

### 4. Set Up Admin Access

**Option A: Email Allowlist (Quick & Simple)**

Edit both `services.html` and the `firestore.rules` file, update the admin email list:

```javascript
const ADMIN_EMAILS = [
  "your-admin-email@example.com",
  "another-admin@example.com"
];
```

**Option B: Custom Claims (Recommended for Production)**

Use Firebase Admin SDK to set admin claims:

```javascript
const admin = require('firebase-admin');
admin.initializeApp();

// Set admin claim for a user
const uid = 'USER_UID_HERE';
admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => console.log('Admin claim set'));
```

### 5. Create Candidate Portal Users

For each candidate who needs portal access:

1. **Create Firebase Auth account:**
   - Go to Firebase Console → Authentication → Users
   - Click "Add User"
   - Enter email and password
   - Note the UID

2. **Create user profile mapping:**
   - Go to Firestore Database
   - Create collection: `userProfiles`
   - Add document with UID as document ID:
   
   ```json
   {
     "candidateId": "CANDIDATE_ID_FROM_ADMIN",
     "email": "candidate@example.com",
     "createdAt": [Firestore Timestamp]
   }
   ```

## 📋 Usage Workflow

### For Admins

1. **Open Admin Console** (`admin.html`)
2. **Load or create a candidate** record
3. **Click "HireReady Services"** button → Opens `services.html` in new tab
4. **Fill in service data** for the candidate:
   - Add JD and resume
   - Prepare call scripts
   - Set up mock interview questions
   - Configure live assistant data
   - Add SmartApply templates
5. **Save changes** (per-service or Save All)

### For Candidates

1. **Open Candidate Portal** (`user.html`)
2. **Login** with provided credentials
3. **View dashboard** with:
   - Readiness score
   - Service completion status
   - Last updated time
4. **Access service data:**
   - Click "View Details" to see full information
   - Click "Copy" buttons to copy content
5. **All data is read-only** for candidates

## 🔒 Security Features

### Data Access Control

- **Admin users:** Full read/write access to all candidate services
- **Candidate users:** Read-only access to their own service data
- **Mapping:** User authentication tied to specific candidateId via `userProfiles` collection
- **No URL manipulation:** Candidates cannot access other candidates' data even if they modify the URL

### Firestore Rules

The security rules ensure:
- Admins can write to `candidate_services/*`
- Candidates can only read their own mapped `candidate_services/{candidateId}`
- User profiles are protected (users can only read their own)
- All other access is denied by default

## 🗄️ Data Model

### Collections

#### `candidate_services/{candidateId}`

```javascript
{
  meta: {
    updatedAt: Timestamp,
    updatedByUid: "admin-uid",
    statusByService: {
      resume: "completed" | "draft" | "not-started",
      callscript: "completed" | "draft" | "not-started",
      mock: "completed" | "draft" | "not-started",
      live: "completed" | "draft" | "not-started",
      smartapply: "completed" | "draft" | "not-started"
    }
  },
  resumeBuilder: {
    jdText: string,
    targetRole: string,
    matchScore: number (0-100),
    missingKeywords: string,
    resumeHtmlOrText: string
  },
  callScript: {
    confidenceLevel: "95" | "80" | "65" | "50",
    scripts: {
      aboutMe: string,
      experience: string,
      changeReason: string,
      salary: string,
      notice: string,
      strengthsWeaknesses: string
    }
  },
  mockInterview: {
    track: "hr" | "technical" | "managerial",
    questions: string,
    guidance: string,
    readinessScore: number (0-100)
  },
  liveAssistant: {
    talkingPoints: string,
    answerStructures: string,
    riskFlags: string
  },
  smartApply: {
    copyReadyAnswers: string,
    templates: string,
    mappings: string
  }
}
```

#### `userProfiles/{uid}`

```javascript
{
  candidateId: string,    // Links to candidate_services document
  email: string,
  createdAt: Timestamp
}
```

## 🎨 UI Features

### Premium Design

- **Modern typography** with Inter font family
- **CSS variables** for consistent theming
- **Responsive layout** that works on desktop and mobile
- **Smooth animations** and transitions
- **Professional color palette** with blue accent

### Interactive Elements

- **Status pills** showing completion status
- **Toast notifications** for user feedback
- **Loading skeletons** while fetching data
- **Modal dialogs** for detailed views
- **Accordion sections** for organized content
- **Copy-to-clipboard** functionality

### Keyboard Shortcuts

- **Ctrl/Cmd + S:** Save all services (in services.html)

## 🧪 Testing Checklist

### Admin Flow
- [ ] Login to Admin Console
- [ ] Load a candidate record
- [ ] Click "HireReady Services" button
- [ ] Verify services.html opens with correct candidate
- [ ] Fill in resume data and save
- [ ] Fill in call script data and save
- [ ] Fill in other services and save
- [ ] Verify last saved timestamp updates
- [ ] Verify status pills update correctly

### Candidate Flow
- [ ] Login to user.html with candidate credentials
- [ ] Verify dashboard shows correct candidate name
- [ ] Check that all 5 service cards are visible
- [ ] Verify status pills match admin data
- [ ] Click "View Details" on each service
- [ ] Test "Copy" functionality
- [ ] Verify data is read-only (no edit fields)
- [ ] Test logout functionality

### Security Testing
- [ ] Try accessing services.html without admin email
- [ ] Try accessing user.html without login
- [ ] Verify candidate cannot access another candidate's data
- [ ] Test Firestore rules in Firebase Console Rules Playground

## 🐛 Troubleshooting

### "Access Denied" in services.html

**Solution:** Add your email to the `ADMIN_EMAILS` array in services.html

### "No Candidate Profile Linked" in user.html

**Solution:** Create a `userProfiles/{uid}` document with the correct `candidateId`

### Permission Denied Errors

**Solution:** Deploy the Firestore rules: `firebase deploy --only firestore:rules`

### Data Not Loading

**Solution:** 
1. Check browser console for errors
2. Verify Firebase configuration is correct
3. Check that Firestore collections exist
4. Verify user has proper authentication

### "HireReady Services" Button Not Working

**Solution:**
1. Ensure a candidate is loaded (candidateId field has value)
2. Check browser console for JavaScript errors
3. Verify services.html file exists in same directory

## 🔄 Future Enhancements

### Planned Features
- [ ] Real-time collaboration (multiple admins editing)
- [ ] Version history for service data
- [ ] Email notifications when services are updated
- [ ] PDF export for candidate service data
- [ ] Advanced analytics dashboard
- [ ] Mobile app for candidates

### Admin Claim Setup (Production)
- [ ] Implement Firebase Functions for admin claim management
- [ ] Create admin management UI
- [ ] Add role-based permissions (super admin, admin, editor)

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Firebase Console for errors
3. Check browser console for JavaScript errors
4. Verify Firestore rules are correctly deployed

---

## ✅ FIREBASE SETUP CHECKLIST (REQUIRED)

**Project:** hirereadyservices-9a8de

### A) Firebase Authentication Setup
- [ ] Go to [Firebase Console](https://console.firebase.google.com) → Select project **hirereadyservices-9a8de**
- [ ] Navigate to **Authentication** → **Sign-in method**
- [ ] Enable **Email/Password** provider
- [ ] Go to **Settings** tab → **Authorized domains**
- [ ] Add your Netlify domain: `jolly-capybara-569c32.netlify.app`
- [ ] Add `localhost` for local testing
- [ ] Add any custom domains you use

### B) Firestore Database Setup
- [ ] Go to **Firestore Database** in Firebase Console
- [ ] Click **Create database** (if not already created)
- [ ] Choose **Production mode** or **Test mode** (will be overridden by rules)
- [ ] Select your preferred region
- [ ] Navigate to **Rules** tab
- [ ] Copy the entire content of `firestore.rules` from this project
- [ ] Paste into the Firebase Console Rules editor
- [ ] Click **Publish** button
- [ ] Verify the rules show your admin email: `ducktales048@gmail.com`

**Alternative: Deploy Rules via Firebase CLI**
```bash
npm install -g firebase-tools
firebase login
firebase use hirereadyservices-9a8de
firebase deploy --only firestore:rules
```

### C) Create Admin User Account
- [ ] In Firebase Console → **Authentication** → **Users** tab
- [ ] Click **Add user**
- [ ] Email: `ducktales048@gmail.com`
- [ ] Password: (choose a secure password)
- [ ] Click **Add user**
- [ ] Verify user appears in the users list

**Alternative: Use existing admin login**
- [ ] If you already have an admin account, just log in once on admin.html
- [ ] Verify the email matches exactly: `ducktales048@gmail.com`

### D) Test the Complete Flow
1. **Deploy to Netlify:**
   - Push all updated files to your git repository
   - Netlify will auto-deploy (wait for build to complete)
   - Go to your Netlify URL: `https://jolly-capybara-569c32.netlify.app/admin.html`

2. **Test Admin Console Login:**
   - Open `admin.html` in browser
   - Press `F12` to open DevTools → **Console** tab
   - Login with: `ducktales048@gmail.com` and your password
   - **Verify console logs:**
     ```
     FIREBASE_PROJECT_OK hirereadyservices-9a8de
     AUTH_STATE ducktales048@gmail.com
     ```
   - If you see these logs ✅ Firebase auth is working

3. **Test Candidates List (Firestore Read):**
   - In admin.html, click **Refresh** or **Sync from Cloud** button
   - **Expected:** Candidates list loads from Firestore
   - **If error popup appears:** "Missing or insufficient permissions"
     - ❌ Firestore rules not deployed correctly
     - Go back to Step B and re-deploy rules
     - Make sure your email in rules matches login email exactly

4. **Test HireReady Services Button:**
   - Load or create a candidate in admin.html
   - Verify candidate ID field is filled (e.g., `CAND_JMF_919063`)
   - Click **HireReady Services** button
   - New tab opens: `services.html?cid=CAND_JMF_919063`
   - Press `F12` → **Console** tab
   - **Verify console logs:**
     ```
     FIREBASE_PROJECT_OK hirereadyservices-9a8de
     AUTH_STATE ducktales048@gmail.com
     SERVICES_ADMIN_CHECK { email: "ducktales048@gmail.com", isAdmin: true }
     SERVICES_FLOW Admin + candidate ID -> showing editor
     ```
   - **Expected:** Services editor page loads (NOT "Access Denied")
   - **If "Access Denied" appears:**
     - Check console logs - look for `isAdmin: false`
     - Verify ADMIN_EMAILS in services.html includes your email
     - Sign out and back in to refresh auth token

5. **Test Service Save (Firestore Write):**
   - In services.html editor, type something in any service field
   - Click **Save** button for that service
   - **Verify console shows:** `SERVICES_SAVE_SERVICE { serviceKey: "...", cid: "..." }`
   - **Expected:** Success toast appears: "Service saved successfully"
   - **If permission error:**
     - Firestore rules may not allow write for your email
     - Verify rules isAdminByEmail() includes your email
     - Re-publish rules in Firebase Console

### E) Verify Console Logs (Debugging)

**Expected logs in admin.html console:**
```
FIREBASE_PROJECT_OK hirereadyservices-9a8de
AUTH_STATE ducktales048@gmail.com
syncFromCloud_START
syncFromCloud_QUERY_OK { docCount: X }
```

**Expected logs in services.html console:**
```
FIREBASE_PROJECT_OK hirereadyservices-9a8de
SERVICES_FIREBASE_INIT_OK
SERVICES_CID { cidFromUrl: "CAND_...", finalCid: "CAND_..." }
AUTH_STATE ducktales048@gmail.com
SERVICES_AUTH_STATE { email: "ducktales048@gmail.com", hasUser: true }
SERVICES_ADMIN_CHECK { email: "ducktales048@gmail.com", isAdmin: true }
SERVICES_FLOW Admin + candidate ID -> showing editor
```

**If any log shows wrong project ID:**
- ❌ File still has old Firebase config
- Search for `galvanic-augury` in the file and replace with new config

**If AUTH_STATE shows null:**
- ❌ Not logged in - Firebase auth session not preserved
- Log in again on admin.html
- Check "Authorized domains" in Firebase Console includes your Netlify URL

**If isAdmin shows false:**
- ❌ Email not in ADMIN_EMAILS allowlist
- Edit services.html line ~967: add your email to ADMIN_EMAILS array
- OR edit firestore.rules line ~15: add email to isAdminByEmail() function

---

## 📄 License

Proprietary - HireReady Services Platform

---

**Version:** 1.0.0  
**Last Updated:** February 17, 2026  
**Firebase Project:** hirereadyservices-9a8de  
**Compatibility:** Firebase 10.12.5, Modern browsers (Chrome, Firefox, Safari, Edge)
