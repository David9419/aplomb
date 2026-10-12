# Aplomb — Conseil & expertise bâtiment

Site vitrine d'un conseiller indépendant en bâtiment (conseil technique, pathologie, suivi de chantier) à Paris, 92, 94, 91.

- **Modifier un texte, le téléphone, une prestation** : tout est dans `src/content/site.ts`.
- **Logo** : `src/components/Logo.tsx` (fil à plomb dans un « A »), favicon : `src/app/icon.svg`.
- **Maquette 3D** du hero : `src/components/three/BuildingScene.tsx` (Three.js / React Three Fiber).
- **Sections** : `src/components/sections/`, composants shadcn : `src/components/ui/`.
- Lancer en local : `npm install` puis `npm run dev` → http://localhost:3000

Stack : Next.js 16 (App Router) + TypeScript + Tailwind v4 + shadcn/ui (Radix) + Motion + Lenis + React Three Fiber. Déploiement prévu : GitHub → Vercel.

## À compléter (TODO)
- Adresse e-mail du client, SIRET, assurance, page « Mentions légales »
- Domaine définitif (provisoire : aplomb-conseil.fr)
- Photos de chantiers / du client
- FAQ (`faq` dans `site.ts`) : réponses rédigées d'après son vocal, à faire valider
