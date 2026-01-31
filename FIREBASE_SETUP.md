# Firebase Configuration Setup

This document explains how to set up Firebase for the Nagrik Seva application.

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `nagrik-seva`
4. Continue with setup steps
5. Enable Google Analytics (optional)

## 2. Enable Authentication

1. In Firebase Console, go to Authentication → Sign-in method
2. Enable **Google** provider:
   - Enable toggle
   - Add your project domain to authorized domains
   - Save
3. Enable **Phone** provider:
   - Enable toggle
   - Add your project domain to authorized domains
   - Save

## 3. Set up Firestore Database

1. Go to Firestore Database → Create database
2. Choose Start in test mode (for development)
3. Select a location (choose closest to your users)
4. Create database

## 4. Get Firebase Configuration

1. Go to Project Settings → General → Your apps
2. Click Web app (</>) to add a new web app
3. Copy the configuration object
4. Update the values in `client/src/lib/firebase.ts`

## 5. Update Firebase Configuration

Replace the placeholder values in `client/src/lib/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "nagrik-seva.firebaseapp.com",
  projectId: "nagrik-seva",
  storageBucket: "nagrik-seva.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## 6. Firestore Security Rules

For production, update Firestore security rules in Firestore Rules tab:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own documents
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Issues can be read by anyone (public data) but only created by authenticated users
    match /issues/{issueId} {
      allow read: if true; // Public read access for aggregated views
      allow create: if request.auth != null && request.auth.uid == resource.data.userId;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

## 7. Environment Variables (Optional)

For better security, you can use environment variables:

1. Create `.env.local` file in client directory:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

2. Update `client/src/lib/firebase.ts` to use environment variables.

## 8. Testing

Once configured, test the authentication:

1. Start the development server
2. Try signing in with Google
3. Try signing in with Phone (OTP)
4. Create an issue and verify it appears in "My Issues"
5. Check that public views show aggregated data without personal information

## 9. Deployment Considerations

For production deployment:

1. Update Firestore security rules to be more restrictive
2. Enable Firebase App Check if needed
3. Set up proper error monitoring
4. Configure Firebase Analytics for usage tracking
5. Consider using Firebase Functions for server-side logic
