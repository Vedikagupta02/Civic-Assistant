# Nagrik Seva - Requirements & Setup Guide

## 📋 Project Overview

Nagrik Seva is a civic assistant web application that helps Delhi residents report and track civic issues. The app provides real-time issue classification, official helpline information, and user-specific issue tracking.

## 🏗️ Architecture

### Frontend (Client)
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** TailwindCSS + shadcn/ui components
- **State Management:** React Query + React Context
- **Maps:** Leaflet + OpenStreetMap

### Backend (Server)
- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth (Google + Phone OTP)

In development, the Express server starts Vite and serves both the API and the frontend from a single URL.

### External Services
- **Firebase:** Authentication, Database, Storage
- **Maps:** OpenStreetMap (free)
- **Deployment:** Vercel (Frontend) + Railway/Heroku (Backend)

## 🔧 Technical Requirements

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project
- Git

### Environment Variables

#### Firebase configuration
Firebase client configuration is currently stored directly in:

- `client/src/lib/firebase.ts`

If you want to run the app using your own Firebase project, replace the config values in that file.

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
```

## 📦 Dependencies

### Frontend Dependencies
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.48.2",
    "@hookform/resolvers": "^3.3.2",
    "zod": "^3.22.4",
    "@tanstack/react-query": "^5.8.4",
    "wouter": "^2.11.0",
    "lucide-react": "^0.294.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "framer-motion": "^10.16.16",
    "firebase": "^10.7.1",
    "react-firebase-hooks": "^5.1.1",
    "leaflet": "^1.9.4",
    "react-leaflet": "^4.2.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@types/leaflet": "^1.9.8",
    "@vitejs/plugin-react": "^4.1.1",
    "typescript": "^5.2.2",
    "vite": "^5.0.0",
    "tailwindcss": "^3.3.6",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31"
  }
}
```

### Backend Dependencies
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "zod": "^3.22.4",
    "firebase-admin": "^12.0.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "tsx": "^4.6.2",
    "typescript": "^5.2.2"
  }
}
```

## 🔥 Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project: "nagrik-seva"
3. Enable Authentication (Google + Phone)
4. Enable Firestore Database
5. Configure security rules

### 2. Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /issues/{issueId} {
      allow read: if true;
      allow create: if request.auth != null;
      // Demo-friendly rule:
      // The Admin/Worker dashboards are role-based in the UI (not Firebase custom claims).
      // To allow assignment and resolution updates in demo mode, permit any signed-in user to update.
      // For production, tighten this rule using Firebase Custom Claims / server-side validation.
      allow update: if request.auth != null;
      allow delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

### 3. Firestore Indexes
Create composite indexes for:
- Collection: `issues`
- Fields: `userId` (Ascending) + `createdAt` (Descending)

## 📞 Delhi Helplines Configuration

### Official Helplines Integrated
- **Waste Management:** MCD Sanitation - `155305`
- **Water Supply:** Delhi Jal Board - `1916`
- **Air Pollution:** DPCC - `011-42200500`
- **Transport/Traffic:** Delhi Traffic Police - `1075`
- **Electricity:** Delhi DISCOMs - `1912`
- **General:** Delhi Government - `1076`

### Category Mapping
```typescript
const CATEGORY_TO_HELPLINE = {
  'Waste': 'waste',
  'Water': 'water', 
  'Air': 'air',
  'Transport': 'transport',
  'Energy': 'energy',
  'Electricity': 'energy',
  'Power': 'energy',
  'Street Light': 'energy',
  'Sanitation': 'waste',
  'Garbage': 'waste',
  'Traffic': 'transport',
  'Pollution': 'air'
};
```

## 🚀 Installation & Setup

### 1. Clone Repository
```bash
git clone https://github.com/Vedikagupta02/Civic-Assistant.git
cd Civic-Assistant
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
# Optional: set PORT if you need a non-default port
# (default is 5000)
```

### 4. Start Development Server
```bash
# Starts the Express server which also serves the Vite frontend
npm run dev

# Optional (for troubleshooting)
npm run dev:client  # Vite-only frontend on http://localhost:5173
npm run dev:server  # API + frontend on http://localhost:5000
```

Open:

- `http://localhost:5000/`

## 🏛️ Core Features

### 1. User Authentication
- **Google OAuth:** Sign in with Google account
- **Phone OTP:** Sign in with phone number + SMS verification
- **User Profiles:** Store user information in Firestore
- **Session Management:** Persistent login state

### 2. Issue Reporting
- **AI Classification:** Automatic category detection (Waste, Water, Air, Transport, Energy)
- **Real Helplines:** Official Delhi government contact numbers
- **Location Detection:** GPS-based issue location
- **Photo Upload:** Visual evidence for issues

### 3. Issue Tracking
- **"My Issues":** Personal dashboard for user's reported issues
- **Status Updates:** Track issue resolution progress
- **Area Overview:** Public heatmap of civic issues
- **Anonymous Public Views:** Aggregated data without personal info

### 4. Community & Role-Based Workflow (Additions)
- **Community Forum:** Area-based posts, comments, and upvotes (stored in localStorage)
- **Admin Dashboard:** Monitor issues, filter, and assign workers
- **Worker Dashboard:** View assigned issues, simulate location updates, and submit resolution

Role override (testing):

- `http://localhost:5000/admin?role=admin`
- `http://localhost:5000/worker?role=worker`

### 4. Smart Features
- **Actionable Guidance:** Step-by-step instructions for each issue type
- **Risk Assessment:** High/Medium/Low risk classification
- **Official Contacts:** Verified helpline numbers and departments
- **Real-time Updates:** Live status tracking

## 📱 Responsive Design

### Mobile-First Approach
- **Bottom Navigation:** Mobile-optimized navigation bar
- **Touch-Friendly:** Large buttons and touch targets
- **Progressive Web App:** Installable on mobile devices
- **Offline Support:** Basic functionality without internet

### Desktop Experience
- **Sidebar Navigation:** Traditional desktop layout
- **Hover States:** Desktop-specific interactions
- **Keyboard Navigation:** Full keyboard accessibility
- **Large Screen Optimization:** Better use of screen real estate

## 🔒 Security Considerations

### Authentication Security
- **Firebase Auth:** Enterprise-grade authentication
- **Session Tokens:** Secure JWT-based sessions
- **Phone Verification:** SMS-based identity verification
- **OAuth 2.0:** Industry-standard Google authentication

### Data Security
- **Firestore Rules:** Granular access control
- **User Isolation:** Users can only access their own data
- **Public Anonymization:** Personal data hidden in public views
- **Input Validation:** Zod schema validation throughout

### API Security
- **CORS Configuration:** Proper cross-origin resource sharing
- **Rate Limiting:** Prevent abuse of API endpoints
- **Input Sanitization:** Protection against injection attacks
- **Error Handling:** Secure error responses

## 📊 Performance Requirements

### Frontend Performance
- **Bundle Size:** < 2MB initial load
- **First Contentful Paint:** < 2 seconds
- **Lighthouse Score:** > 90 performance score
- **Mobile Performance:** Optimized for 3G networks

### Backend Performance
- **API Response Time:** < 500ms average
- **Database Queries:** Optimized Firestore queries
- **Caching Strategy:** React Query for data caching
- **Scalability:** Handle 1000+ concurrent users

## 🧪 Testing Requirements

### Unit Testing
- **Component Tests:** React component testing
- **Utility Tests:** Helper function testing
- **API Tests:** Backend endpoint testing
- **Coverage:** > 80% code coverage

### Integration Testing
- **User Flows:** End-to-end user journey testing
- **Firebase Integration:** Database and auth testing
- **API Integration:** Frontend-backend communication
- **Cross-browser Testing:** Chrome, Firefox, Safari testing

## 🚀 Deployment Requirements

### Production Environment
- **Frontend:** Vercel (static hosting)
- **Backend:** Railway/Heroku (Node.js server)
- **Database:** Firebase Firestore (managed)
- **CDN:** Vercel Edge Network

### Environment Variables
- **Production:** Separate production Firebase project
- **Staging:** Staging environment for testing
- **Development:** Local development configuration
- **Security:** No sensitive data in code

## 📈 Monitoring & Analytics

### Performance Monitoring
- **Error Tracking:** Sentry or similar
- **Performance Metrics:** Core Web Vitals
- **User Analytics:** Anonymous usage statistics
- **Uptime Monitoring:** Service availability tracking

### Business Metrics
- **User Registration:** New user sign-ups
- **Issue Reports:** Number of issues reported
- **Resolution Rate:** Percentage of resolved issues
- **User Engagement:** Active user metrics

## 🔄 Maintenance Requirements

### Regular Updates
- **Dependencies:** Monthly security updates
- **Firebase Rules:** Quarterly review
- **Helpline Numbers:** Annual verification
- **Content Updates:** As needed for civic information

### Backup & Recovery
- **Database Backups:** Automated Firestore backups
- **Code Repository:** Git version control
- **Deployment Rollback:** Quick rollback capability
- **Disaster Recovery:** Business continuity plan

## 📞 Support & Contact

### Technical Support
- **Documentation:** Comprehensive setup guides
- **Issue Tracking:** GitHub issues for bugs
- **Community Support:** User forums and discussions
- **Developer Contact:** Technical team contact information

### Civic Support
- **Helpline Updates:** Regular verification of official numbers
- **Department Contacts:** Maintaining government relationships
- **User Feedback:** Continuous improvement based on user input
- **Feature Requests:** Community-driven feature development

---

## 🎯 Success Criteria

### User Experience
- ✅ Easy issue reporting (< 3 minutes)
- ✅ Accurate category classification (> 90% accuracy)
- ✅ Real helpline information (100% verified)
- ✅ Mobile-responsive design

### Technical Excellence
- ✅ Zero-downtime deployments
- ✅ 99.9% uptime availability
- ✅ Sub-2 second load times
- ✅ Secure user data handling

### Civic Impact
- ✅ Increased civic engagement
- ✅ Faster issue resolution
- ✅ Improved government transparency
- ✅ Better community outcomes

---

*This requirements document serves as the comprehensive guide for the Nagrik Seva project development, deployment, and maintenance.*
