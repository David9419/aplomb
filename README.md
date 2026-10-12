# Baron Conseil Bâtiment

Site vitrine : conseil technique, suivi de chantier, construction, rénovation et réalisation de travaux à Paris et en Île-de-France (75, 92, 93, 94, 95, 91). Dans le bâtiment depuis 2005.

## Pages
- `/` — accueil : visite 3D au défilement, deux possibilités, prestations, photos de chantiers, particuliers / pros, depuis 2005, secteur, FAQ, contact
- `/experience` — parcours, spécialité, approche, engagement
- `/tarifs` — 100 € HT / h, déplacement 50 € HT (offert dès 3 h), décompte à la minute, simulateur de prix
- `/mentions-legales` et `/confidentialite` — textes dans `site.ts` (`legalNotice`, `privacy`) ; les éléments entre crochets [ … ] sont à compléter

## Modifier le site
- **Tous les textes, prix, numéro** : `src/content/site.ts` (textes du client repris mot pour mot).
- **Photos** : `public/images/` (référencées dans `field.photos` de `site.ts`).
- **Logo officiel** : `public/images/logo-*.png` (fond transparent ; versions `-light` pour fonds sombres), favicon : `src/app/icon.png` et `apple-icon.png`.
- **Visite 3D** : `src/components/three/RealHouse.tsx` (maison d'illustration 135 m² + garage, jardin, piscine, intérieur meublé ; textures générées dans `textures.ts`) et `src/components/sections/Tour.tsx` (textes et étapes).
- **Écran d'ouverture** : `src/components/site/Loader.tsx` (attend que la 3D soit prête).
- Composants shadcn : `src/components/ui/`.

Lancer en local : `npm install` puis `npm run dev` → http://localhost:3000

Stack : Next.js 16 (App Router) + TypeScript + Tailwind v4 + shadcn/ui (Radix) + Motion + Lenis + React Three Fiber.

## À compléter (TODO)
- Adresse e-mail, SIRET, forme juridique, adresse, assurances (RC pro, décennale), médiateur de la consommation
- Domaine définitif (provisoire dans le code : baron-conseil-batiment.fr)
