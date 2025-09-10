# Firebase Storage Setup Guide

## Issue: Photo Upload Not Working

The photo upload is failing due to multiple potential issues. I've identified and fixed the main problem:

## ✅ FIXED: Storage Bucket URL

**The main issue was an incorrect storage bucket URL in the Firebase configuration.**

**Before (incorrect):**
```javascript
storageBucket: "money-tracker-applicatio-2f730.firebasestorage.app"
```

**After (correct):**
```javascript
storageBucket: "money-tracker-applicatio-2f730.appspot.com"
```

This has been fixed in `frontend/src/firebase.js`.

## Next Steps: Firebase Storage Rules

The storage bucket URL is now correct, but you still need to set up Firebase Storage rules:

## Step 1: Check Firebase Storage Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `money-tracker-applicatio-2f730`
3. Go to **Storage** in the left sidebar
4. Click on **Rules** tab

## Step 2: Update Storage Rules

Replace the default rules with these rules that allow authenticated users to upload:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload to their own avatar folder
    match /avatars/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to upload test files
    match /test/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
    
    // Default rule - deny all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## Step 3: Publish Rules

1. Click **Publish** button
2. Confirm the changes

## Step 4: Test Again

1. Go back to your app
2. Try uploading a photo
3. Use the "Test Storage Connection" button in the debug section

## Alternative: Temporary Open Rules (NOT RECOMMENDED FOR PRODUCTION)

If you want to test quickly, you can temporarily use these open rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ WARNING: These rules allow anyone to upload/delete files. Only use for testing!**

## Common Error Codes

- `storage/unauthorized`: Storage rules are blocking the operation
- `storage/bucket-not-found`: Storage bucket doesn't exist
- `storage/network-request-failed`: Network connectivity issues
- `storage/object-not-found`: File doesn't exist in storage

## Debug Information

The debug section in the profile dropdown shows:
- User ID: Your Firebase Auth UID
- Storage: Whether Firebase Storage is connected
- Auth: Whether you're authenticated

If any of these show "Not Connected" or "Not Authenticated", that's the issue.
