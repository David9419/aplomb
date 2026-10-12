// Source unique de tous les textes du site Aplomb.
// Pour modifier un texte, un numéro ou une prestation : c'est ici, et nulle part ailleurs.

export const site = {
  name: "Aplomb",
  baseline: "Conseil & expertise bâtiment",
  title: "Aplomb — Conseil & expertise bâtiment à Paris et en Île-de-France",
  description:
    "Conseil technique, diagnostic des pathologies du bâtiment et suivi de chantier à Paris, dans le 92, le 94 et le 91. Un expert indépendant qui ne réalise aucuns travaux.",
  url: "https://www.aplomb-conseil.fr", // TODO : domaine définitif à acheter
};

export const contact = {
  phoneDisplay: "07 44 98 17 75",
  phoneHref: "tel:+33744981775",
  smsHref:
    "sms:+33744981775?&body=" +
    encodeURIComponent("Bonjour, je souhaite un avis sur mon bâtiment : "),
  email: "", // TODO : adresse e-mail du client
};

export const nav = [
  { label: "Prestations", href: "#prestations" },
  { label: "Pathologies", href: "#pathologies" },
  { label: "Méthode", href: "#methode" },
  { label: "Secteur", href: "#secteur" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export const hero = {
  badge: "Expert bâtiment indépendant · Paris & Île-de-France",
  eyebrow: "Conseil technique · Diagnostic · Suivi de chantier",
  titleStart: "Un regard d'expert sur votre bâtiment,",
  titleAccent: "sans rien vous vendre.",
  lead: "J'analyse, je conseille et je contrôle. Je ne réalise aucuns travaux : mes recommandations ne dépendent que de l'état de votre bâtiment et de votre intérêt.",
  ctaPrimary: "Appeler",
  ctaSecondary: "Voir les prestations",
  pledgeTitle: "Ce que je fais, ce que je ne fais pas",
  does: [
    "Diagnostic des désordres et recherche des causes",
    "Conseil technique et aide à la conception",
    "Suivi de chantier et contrôle des entreprises",
  ],
  doesNot: [
    "Aucune réalisation de travaux",
    "Aucune commission sur les devis d'entreprises",
  ],
};

export const services = {
  eyebrow: "Prestations",
  title: "Quatre missions, un seul objectif : un bâtiment sain et bien construit.",
  lead: "Chaque mission peut être commandée seule ou combinée, de l'avis ponctuel à l'accompagnement complet d'une rénovation.",
  items: [
    {
      ref: "Mission A",
      tag: "Ponctuel",
      title: "Conseil technique",
      text: "Un avis clair avant de décider : achat, rénovation, extension ou devis à comparer.",
      points: [
        "Visite conseil avant achat",
        "Analyse et comparaison de devis",
        "Choix des matériaux et des techniques",
      ],
    },
    {
      ref: "Mission B",
      tag: "Rapport écrit",
      title: "Diagnostic & pathologie",
      text: "Comprendre l'origine d'un désordre avant de le traiter, pour ne pas payer deux fois.",
      points: [
        "Fissures, humidité, infiltrations",
        "Recherche des causes, pas seulement des symptômes",
        "Préconisations classées par priorité",
      ],
    },
    {
      ref: "Mission C",
      tag: "Sur la durée",
      title: "Suivi de chantier",
      text: "Un professionnel à vos côtés face aux entreprises, du démarrage à la réception.",
      points: [
        "Visites de chantier et comptes rendus",
        "Contrôle de la conformité et de la qualité",
        "Assistance à la réception et levée des réserves",
      ],
    },
    {
      ref: "Mission D",
      tag: "Conception",
      title: "Technique & design du bâtiment",
      text: "Penser l'espace et la technique ensemble : un projet beau, réaliste et durable.",
      points: [
        "Étude de faisabilité et d'aménagement",
        "Principes constructifs et détails techniques",
        "Cahier des charges pour consulter les entreprises",
      ],
    },
  ],
};

export const pathologies = {
  eyebrow: "Pathologies du bâtiment",
  title: "Vous constatez un désordre ? Il a une cause.",
  lead: "Les symptômes les plus fréquents que je diagnostique. Le bon traitement dépend toujours de la cause, rarement visible au premier coup d'œil.",
  items: [
    { code: "Structure", title: "Fissures", text: "Façades, murs porteurs, dallage : distinguer la fissure sans gravité du désordre qui évolue." },
    { code: "Humidité", title: "Remontées capillaires", text: "Salpêtre, enduits qui cloquent, odeur de cave en pied de mur." },
    { code: "Enveloppe", title: "Infiltrations", text: "Toiture, terrasse, menuiseries, façades : localiser l'entrée d'eau réelle." },
    { code: "Air", title: "Condensation & moisissures", text: "Ventilation insuffisante, ponts thermiques, isolation mal posée." },
    { code: "Bois", title: "Charpentes & planchers", text: "Affaissements, attaques d'insectes ou de champignons, surcharges." },
    { code: "Finitions", title: "Malfaçons", text: "Carrelage qui sonne creux, enduits décollés, défauts après travaux." },
  ],
};

export const finder = {
  eyebrow: "Par où commencer",
  question: "Quelle est votre situation ?",
  cta: "Demander cette mission",
  options: [
    {
      key: "achat",
      label: "J'achète un bien et je veux savoir où je mets les pieds",
      mission: "Mission A · Conseil technique",
      title: "Visite conseil avant achat",
      text: "Une visite du bien avec vous, avant la signature, pour repérer les points faibles et anticiper les travaux.",
      steps: ["Visite du bien avec vous", "Points de vigilance expliqués sur place", "Synthèse écrite pour décider ou négocier"],
    },
    {
      key: "desordre",
      label: "J'ai un désordre : fissure, humidité, infiltration",
      mission: "Mission B · Diagnostic & pathologie",
      title: "Diagnostic du désordre",
      text: "Trouver la cause avant de traiter, pour une réparation qui tient dans le temps.",
      steps: ["Observation et relevés sur site", "Analyse des causes probables", "Rapport avec solutions classées par priorité"],
    },
    {
      key: "travaux",
      label: "Je lance des travaux et je veux être accompagné",
      mission: "Mission C · Suivi de chantier",
      title: "Accompagnement de chantier",
      text: "Un professionnel de votre côté pendant toute la durée des travaux.",
      steps: ["Analyse des devis et choix des entreprises", "Visites régulières et comptes rendus", "Réception des travaux et levée des réserves"],
    },
    {
      key: "projet",
      label: "J'ai un projet à concevoir ou à repenser",
      mission: "Mission D · Technique & design",
      title: "Conception du projet",
      text: "Un projet pensé dans son ensemble : usage, esthétique et technique.",
      steps: ["Étude de faisabilité", "Principes d'aménagement et choix techniques", "Cahier des charges pour consulter les entreprises"],
    },
  ],
};

export const method = {
  eyebrow: "Méthode",
  title: "Une démarche simple, en quatre phases.",
  lead: "Vous savez à chaque étape ce qui est fait, pourquoi, et ce que cela vous coûte.",
  steps: [
    { title: "Premier échange", text: "Vous décrivez la situation, photos à l'appui. Je vous dis si et comment je peux vous aider." },
    { title: "Visite sur site", text: "Observation, relevés et mesures. Rien n'est conclu sans avoir vu le bâtiment." },
    { title: "Rapport & préconisations", text: "Causes identifiées, solutions classées par priorité, écrites pour être comprises." },
    { title: "Accompagnement", text: "Si vous le souhaitez : consultation des entreprises, suivi du chantier, réception." },
  ],
};

export const independence = {
  eyebrow: "Indépendance",
  quote: "Je ne fais pas les travaux. Je n'ai donc aucun intérêt à vous en conseiller plus que nécessaire.",
  columns: ["Question", "Entreprise de travaux", "Conseil indépendant"],
  rows: [
    { q: "Qui recommande les travaux ?", them: "Celui qui va les facturer", us: "Un tiers sans intérêt", usRest: " dans les travaux" },
    { q: "Qui contrôle le chantier ?", them: "L'entreprise elle-même", us: "Un regard extérieur", usRest: ", de votre côté" },
    { q: "À la réception ?", them: "Vous seul face à l'entreprise", us: "Un professionnel", usRest: " qui relève les réserves" },
  ],
};

export const area = {
  eyebrow: "Secteur d'intervention",
  title: "Paris et sa proche banlieue sud et ouest.",
  lead: "J'interviens à Paris, dans les Hauts-de-Seine, le Val-de-Marne, l'Essonne et les communes alentour. Un doute sur votre adresse ? Appelez-moi.",
  zones: [
    { code: "75", name: "Paris" },
    { code: "92", name: "Hauts-de-Seine" },
    { code: "94", name: "Val-de-Marne" },
    { code: "91", name: "Essonne" },
  ],
  more: "et alentours",
};

export const contactSection = {
  eyebrow: "Contact",
  title: "Parlons de votre bâtiment.",
  lead: "Appelez-moi ou envoyez un SMS avec quelques mots sur votre situation, et si possible des photos. Je vous rappelle pour fixer un premier échange.",
  call: "Appeler",
  sms: "Envoyer un SMS",
  areaLabel: "Paris · 92 · 94 · 91 et alentours",
};

export const marquee = [
  "Fissures",
  "Humidité",
  "Infiltrations",
  "Suivi de chantier",
  "Conseil avant achat",
  "Analyse de devis",
  "Réception des travaux",
  "Pathologies du bâtiment",
  "Condensation",
  "Charpentes",
];

// ⚠️ À VALIDER avec le client : réponses rédigées d'après son message vocal,
// sans prix ni délais (à ajouter s'il le souhaite).
export const faq = {
  eyebrow: "Questions fréquentes",
  title: "Ce que l'on me demande souvent.",
  items: [
    {
      q: "Réalisez-vous aussi les travaux ?",
      a: "Non. Je me consacre uniquement au conseil, au diagnostic et au suivi de chantier. C'est ce qui garantit que mes recommandations ne dépendent que de l'état de votre bâtiment, et jamais d'un chantier à vendre.",
    },
    {
      q: "Pouvez-vous intervenir pour un simple avis ?",
      a: "Oui. Une visite conseil ponctuelle suffit souvent : avant un achat, pour comparer des devis, ou pour savoir si une fissure ou une tache d'humidité mérite qu'on s'en inquiète.",
    },
    {
      q: "Que contient un diagnostic ?",
      a: "Une visite sur place avec observations et relevés, la recherche des causes du désordre, puis un rapport écrit qui explique ce qui se passe et propose des solutions classées par priorité.",
    },
    {
      q: "Comment se passe le suivi de chantier ?",
      a: "Je vous représente face aux entreprises : visites régulières, comptes rendus, contrôle de la qualité et de la conformité, puis assistance à la réception des travaux et à la levée des réserves.",
    },
    {
      q: "Dans quels secteurs intervenez-vous ?",
      a: "À Paris, dans les Hauts-de-Seine (92), le Val-de-Marne (94), l'Essonne (91) et les communes alentour. En cas de doute sur votre adresse, appelez-moi.",
    },
  ],
};

export const footer = {
  copyright: "© 2026 Aplomb. Tous droits réservés.",
  tagline: "Conseil & expertise bâtiment indépendant",
  legal: "Mentions légales", // TODO : page à créer (SIRET, assurance, hébergeur)
};
