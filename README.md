# Civic-Assistant (Nagrik Seva)

## 🚀 Quick Start (Windows/macOS/Linux)

```bash
git clone https://github.com/Vedikagupta02/Civic-Assistant.git
cd Civic-Assistant
npm install
npm run dev
```

Open:

- **App (API + Frontend):** http://localhost:5000/

## 📦 Core Dependencies

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS + shadcn/ui
- React Query (state management)
- Firebase (auth + database)
- Leaflet (maps)

### Backend  
- Express.js + TypeScript
- Firebase Admin SDK
- Zod (validation)

## 🔑 Configuration

- **Firebase config is currently embedded** in `client/src/lib/firebase.ts`.
- If you want to use your own Firebase project, update the values in that file.
- Optional environment variables:

```env
PORT=5000
NODE_ENV=development
```

## 📞 Delhi Helplines

- **Waste:** MCD - 155305
- **Water:** DJB - 1916  
- **Air:** DPCC - 011-42200500
- **Transport:** Traffic Police - 1075
- **Electricity:** DISCOMs - 1912

## 🏗️ Project Structure

```
client/
├── src/
│   ├── components/     # UI components
│   ├── pages/         # Page components
│   ├── hooks/         # Custom hooks
│   ├── lib/           # Utilities (Firebase)
│   ├── contexts/      # React contexts
│   └── config/        # Configuration files
server/
├── routes.ts          # API endpoints
├── storage.ts         # Mock data
└── delhi-helplines.ts # Helpline config
```

## 🔥 Firebase Setup

1. **Authentication:** Enable Google + Phone OTP
2. **Firestore:** Create database with security rules
3. **Indexes:** Create composite index on `issues` collection
4. **Rules:** See REQUIREMENTS.md for complete rules

## 🎯 Features

✅ User Authentication (Google + Phone)  
✅ Issue Classification (AI-powered)  
✅ Real Delhi Helplines  
✅ User Issue Tracking  
✅ Public Area Overview  
✅ Location Detection  
✅ Photo Upload  
✅ Responsive Design  
✅ Community Forum (inside User Dashboard)  
✅ Admin Dashboard (role-based)  
✅ Worker Dashboard (role-based)  

## 📱 Key Routes

- **Home (chat):** `http://localhost:5000/`
- **User Dashboard (My Issues + Forum):** `http://localhost:5000/my-issues`
- **Admin Dashboard:** `http://localhost:5000/admin?role=admin`
- **Worker Dashboard:** `http://localhost:5000/worker?role=worker`

Role override is supported for testing:

- **URL:** `?role=admin|worker|user`
- **LocalStorage:** set `role` to `admin|worker|user`

## 🐛 Common Issues

1. **Port 5000 already in use (EADDRINUSE):** stop the other process using port 5000, then run `npm run dev` again.
2. **Firebase Permission Denied:** check Firestore rules.
3. **Location Not Working:** enable browser geolocation.

## 📚 Documentation

- **Full Requirements:** See `REQUIREMENTS.md`
- **Firebase Setup:** See `FIREBASE_SETUP.md`
- **API Documentation:** See `server/routes.ts`

---

*For detailed requirements, architecture, and deployment guide, see the main [REQUIREMENTS.md](./REQUIREMENTS.md) file.*
