# 🚨 GitGuardian Security Alert - Fix Guide

## What GitGuardian Detected

**Alert:** "Generic High Entropy Secret exposed"
**Date:** January 3rd, 2026
**Repo:** dizondavid13-alt/techmayne

---

## ⚠️ What This Means

GitGuardian detected a **high-entropy string** in your GitHub commits that looks like an API key, password, or secret token. This could be:

1. Supabase API key (`eyJ...` JWT token)
2. Resend API key (`re_...`)
3. Google Sheets credentials
4. Database password
5. Any other sensitive credential

---

## 🔍 Step 1: Identify What Was Exposed

Run this command to check commit history:

```bash
# Check commits around January 3rd, 2026
git log --since="2026-01-02" --until="2026-01-04" --all --source --full-history

# Search for potential secrets in those commits
git show <commit-hash> | grep -E "(SUPABASE_|API_KEY|SECRET|PASSWORD|eyJ|re_|sk_|pk_)"
```

Common culprits:
- `.env` file accidentally committed
- Hardcoded API key in a demo HTML file
- Credentials in a test file
- Example config with real keys

---

## 🛡️ Step 2: Immediate Actions (CRITICAL)

### A. Rotate ALL Potentially Exposed Keys

#### 1. **Supabase Keys**
Go to: https://supabase.com/dashboard → Your Project → Settings → API

**Rotate:**
- ❌ Old anon/public key → ✅ New anon/public key
- ❌ Old service role key → ✅ New service role key

**Update in Railway:**
1. Go to https://railway.app → Your Project → Variables
2. Update `SUPABASE_KEY` with new service_role key
3. Click "Deploy"

#### 2. **Resend API Key** (if exposed)
Go to: https://resend.com/api-keys

1. Delete old API key
2. Create new API key
3. Update Railway variable: `RESEND_API_KEY`

#### 3. **Google Sheets Credentials** (if exposed)
Go to: https://console.cloud.google.com

1. Revoke old service account
2. Create new service account
3. Update Railway variable: `GOOGLE_SHEETS_CREDENTIALS`

---

### B. Remove Secrets from Git History

**⚠️ WARNING:** This rewrites git history. Coordinate with team members.

```bash
# 1. Install git-filter-repo (if not installed)
# macOS:
brew install git-filter-repo

# 2. Backup your repo first!
git clone https://github.com/dizondavid13-alt/techmayne.git techmayne-backup

# 3. Remove the exposed file from ALL commits
cd techmayne
git filter-repo --path backend/.env --invert-paths

# 4. Force push (⚠️ DESTRUCTIVE!)
git push origin --force --all
git push origin --force --tags
```

**Alternative (Safer):** Use GitHub's tool:
https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository

---

## ✅ Step 3: Verify Security

### A. Confirm .gitignore is Working

```bash
# Check .gitignore
cat .gitignore | grep -E "\.env"

# Should show:
# .env
# *.env
# .env.local
```

### B. Verify .env is NOT in Repo

```bash
# This should return NOTHING
git ls-files | grep "\.env$"

# If it returns .env, it's tracked! Remove it:
git rm --cached backend/.env
git commit -m "Remove .env from tracking"
git push
```

### C. Check for Hardcoded Secrets

```bash
# Search all files for potential secrets
grep -r "eyJ\|SUPABASE_URL\|re_\|sk_\|pk_" --include="*.js" --include="*.html" . | grep -v node_modules
```

---

## 🔐 Step 4: Best Practices Going Forward

### 1. **Never Commit Secrets**

✅ **Good:**
```javascript
// backend/config/supabase.js
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);
```

❌ **Bad:**
```javascript
const supabase = createClient(
  'https://yourproject.supabase.co',
  'eyJhbGciOiJIUzI1...' // NEVER DO THIS!
);
```

### 2. **Use .env Files Properly**

```bash
# Local development
cp backend/.env.example backend/.env
# Edit .env with your LOCAL keys (NEVER commit!)

# Production
# Use Railway environment variables dashboard
```

### 3. **Use .env.example**

```bash
# backend/.env.example (safe to commit)
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_key_here
RESEND_API_KEY=your_resend_key_here

# backend/.env (NEVER commit - in .gitignore)
SUPABASE_URL=https://abc.supabase.co
SUPABASE_KEY=eyJhbGciOi...real_key_here
RESEND_API_KEY=re_abc123...real_key_here
```

### 4. **Pre-Commit Hook to Prevent Leaks**

```bash
# Install git-secrets
brew install git-secrets

# Set up for your repo
cd techmayne
git secrets --install
git secrets --register-aws

# Add custom patterns
git secrets --add 'eyJ[A-Za-z0-9_-]*'
git secrets --add 're_[A-Za-z0-9_-]*'
git secrets --add 'sk_[A-Za-z0-9_-]*'
```

---

## 📋 Checklist

- [ ] Identified which secret was exposed
- [ ] Rotated Supabase keys
- [ ] Rotated Resend API key (if needed)
- [ ] Rotated Google Sheets credentials (if needed)
- [ ] Updated Railway environment variables
- [ ] Removed secrets from git history
- [ ] Verified .env is in .gitignore
- [ ] Confirmed .env is NOT tracked in git
- [ ] Tested application still works with new keys
- [ ] Installed git-secrets for future protection

---

## 🆘 If You're Unsure

**Don't panic!** Here's what to do:

1. **Immediate:** Rotate ALL API keys (better safe than sorry)
2. **Check Railway logs** for suspicious activity
3. **Check Supabase logs** for unauthorized access
4. **Monitor your credit cards** for unexpected charges

**Need help?**
- GitHub Support: https://support.github.com
- Supabase Support: https://supabase.com/support
- Railway Support: https://railway.app/help

---

## 📊 Risk Assessment

**If the exposed key was:**

| Key Type | Risk Level | Action Required |
|----------|-----------|-----------------|
| Supabase Anon Key | 🟡 Medium | Rotate immediately, check RLS policies |
| Supabase Service Role | 🔴 HIGH | Rotate NOW, audit all DB changes |
| Resend API Key | 🟡 Medium | Rotate immediately, check email logs |
| Google Sheets Creds | 🟢 Low | Rotate, sheets are likely not sensitive |
| Database Password | 🔴 HIGH | Change immediately, audit connections |

---

## ✅ After Fix

Once you've rotated keys and removed from git history:

1. GitGuardian alert will auto-resolve (or you can mark as resolved)
2. Monitor your services for 48 hours for any unusual activity
3. Consider enabling 2FA on all services:
   - GitHub: https://github.com/settings/security
   - Supabase: Project settings
   - Railway: Account settings

**Your security is now improved!** 🛡️
