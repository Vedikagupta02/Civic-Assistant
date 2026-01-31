## Packages
framer-motion | Animations for chat and page transitions
date-fns | Date formatting utilities
@tanstack/react-query | Client-side caching for Firestore data/hooks
wouter | Lightweight routing
firebase | Auth + Firestore client SDK
leaflet + react-leaflet | Maps and markers
shadcn/ui + Radix UI | UI primitives and components

## Notes
- The app is served via the Express dev server at `http://localhost:5000/` (not just Vite).
- Community Forum data is stored in `localStorage` (no backend required).
- Role override for testing is supported via `?role=admin|worker|user` or localStorage key `role`.
