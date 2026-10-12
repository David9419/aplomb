# Baron Conseil Bâtiment

Site vitrine : conseil technique, suivi de chantier, construction, rénovation et réalisation de travaux à Paris et en Île-de-France (75, 92, 93, 94, 95, 91). Dans le bâtiment depuis 2005.

## Pages
- `/` — accueil : visite 3D au défilement, deux possibilités, prestations, photos de chantiers, particuliers / pros, depuis 2005, secteur, FAQ, contact
- `/experience` — parcours, spécialité, approche, engagement
- `/tarifs` — 100 € HT / h, déplacement 50 € HT (offert dès 3 h), décompte à la minute, simulateur de prix

## Modifier le site
- **Tous les textes, prix, numéro** : `src/content/site.ts` (textes du client repris mot pour mot).
- **Photos** : `public/images/` (référencées dans `field.photos` de `site.ts`).
- **Logo** : `src/components/Logo.tsx`, favicon : `src/app/icon.svg`.
- **Visite 3D** : `src/components/three/HouseScene.tsx` (maison d'illustration 12 × 8 m) et `src/components/sections/Tour.tsx` (textes et étapes).
- Composants shadcn : `src/components/ui/`.

Lancer en local : `npm install` puis `npm run dev` → http://localhost:3000

Stack : Next.js 16 (App Router) + TypeScript + Tailwind v4 + shadcn/ui (Radix) + Motion + Lenis + React Three Fiber.

## À compléter (TODO)
- Adresse e-mail, SIRET, assurance, page « Mentions légales »
- Domaine définitif (provisoire dans le code : baron-conseil-batiment.fr)
