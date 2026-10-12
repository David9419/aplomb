// Source unique de tous les textes du site Baron Conseil Bâtiment.
// Les textes viennent du client (accueil, expérience, tarifs) et sont repris mot pour mot.
// Pour modifier un texte, un prix ou le numéro : c'est ici, et nulle part ailleurs.

export const site = {
  name: "Baron Conseil Bâtiment",
  shortName: "Baron",
  baseline: "Conseil bâtiment",
  title: "Baron Conseil Bâtiment — Conseil technique, suivi de chantier et travaux en Île-de-France",
  description:
    "Conseil technique, suivi de chantier, construction, rénovation et réalisation de travaux à Paris et en Île-de-France. L'expérience du terrain depuis 2005.",
  url: "https://www.baron-conseil-batiment.fr", // TODO : domaine définitif à acheter
};

export const contact = {
  phoneDisplay: "07 44 98 17 75",
  phoneHref: "tel:+33744981775",
  smsHref:
    "sms:+33744981775?&body=" +
    encodeURIComponent("Bonjour, je vous contacte au sujet de mon projet : "),
  email: "", // TODO : adresse e-mail du client
};

export const nav = [
  { label: "Accueil", href: "/" },
  { label: "Prestations", href: "/#prestations" },
  { label: "Mon expérience", href: "/experience" },
  { label: "Tarifs", href: "/tarifs" },
  { label: "Contact", href: "/#contact" },
];

export const tagline = "Conseil technique · Suivi de chantier · Construction · Rénovation · Solutions travaux · Design";

/* ========================================================================== */
/*  ACCUEIL                                                                   */
/* ========================================================================== */

export const hero = {
  badge: "Bâtiment depuis 2005 · Paris & Île-de-France",
  titleStart: "Vos travaux,",
  titleAccent: "notre expertise du terrain.",
  lead: "Vous construisez, vous rénovez ou vous rencontrez une difficulté technique ? Depuis 2005, je mets mon expérience du bâtiment au service de vos projets, avec une approche concrète, technique et orientée vers les solutions.",
  cta: "Parlons de votre projet",
};

// Visite 3D d'ouverture : chaque étape s'affiche pendant le défilement.
// La maison est un plan d'illustration (pas le bien d'un client).
export const intro = {
  scrollHint: "Faites défiler pour visiter",
  note: "Maquette d'illustration",
  steps: [
    {
      key: "plan",
      index: "01",
      label: "Le plan",
      title: "Prises de cotes,",
      accent: "agencement.",
      text: "Réflexion sur l'agencement, choix techniques et préparation des travaux : transformer vos idées en un projet cohérent.",
    },
    {
      key: "sejour",
      index: "02",
      label: "Le séjour",
      title: "Les bons choix,",
      accent: "au bon moment.",
      text: "Matériaux, finitions, mise en œuvre : des conseils concrets pour éviter les erreurs et faire les bons choix.",
    },
    {
      key: "cuisine",
      index: "03",
      label: "La cuisine",
      title: "Les mesures",
      accent: "justes.",
      text: "Un chantier demande de l'anticipation, de la méthode et une bonne compréhension des contraintes de mise en œuvre.",
    },
    {
      key: "structure",
      index: "04",
      label: "Du sol au toit",
      title: "Un problème ?",
      accent: "Une solution.",
      text: "Un imprévu ou une difficulté de mise en œuvre : j'analyse la situation et recherche une solution dans le respect des règles de l'art.",
    },
  ],
  outro: {
    title: "Votre projet mérite",
    accent: "ce regard.",
    cta: "Découvrir les prestations",
  },
};

export const marquee = [
  "Conseil technique",
  "Suivi de chantier",
  "Construction",
  "Rénovation",
  "Solutions travaux",
  "Design",
  "Prises de cotes",
  "Réception des travaux",
];

export const options = {
  eyebrow: "Deux possibilités",
  title: "Deux possibilités, selon votre projet.",
  lead: "Que vous souhaitiez être conseillé, accompagné avec votre propre équipe ou confier la réalisation des travaux, je vous propose une intervention adaptée à vos besoins.",
  items: [
    {
      tag: "Accompagnement",
      title: "Avec l'équipe de votre choix",
      text: "Je vous accompagne dans la réalisation de vos travaux avec l'équipe de votre choix, en vous apportant mon expertise technique et mes conseils pour mener votre projet dans les meilleures conditions.",
    },
    {
      tag: "Réalisation",
      title: "Je réalise vos travaux",
      text: "Je peux, à votre demande, réaliser vos travaux, après définition du périmètre et des conditions d'intervention.",
    },
  ],
  cta: "Parlons de votre projet",
};

export const services = {
  eyebrow: "Prestations",
  title: "Un interlocuteur pour vos projets de travaux.",
  lead: "Du conseil ponctuel à la réalisation, une intervention adaptée à chaque projet.",
  items: [
    {
      title: "Conseil technique indépendant",
      text: "Vous avez déjà vos artisans, mais vous souhaitez bénéficier d'un regard expérimenté ? Je vous accompagne dans vos décisions techniques, l'analyse des solutions proposées et la résolution des difficultés rencontrées.",
    },
    {
      title: "Suivi et accompagnement de chantier",
      text: "Je vous accompagne lors de visites et de réunions de chantier pour vous aider à anticiper les problèmes, comprendre les choix techniques et suivre les étapes importantes de votre projet.",
    },
    {
      title: "Recherche de solutions techniques",
      text: "Un imprévu, une difficulté de mise en œuvre ou une solution qui ne semble pas adaptée ? J'analyse la situation et vous aide à identifier les solutions envisageables dans le respect des règles de l'art.",
    },
    {
      title: "Réalisation de travaux",
      text: "Vous préférez confier directement vos travaux à un professionnel ? Selon la nature du projet, je peux également prendre en charge leur réalisation, après définition du périmètre et des conditions d'intervention.",
    },
    {
      title: "Aménagement et préparation de projet",
      text: "Prises de cotes, réflexion sur l'agencement, choix techniques et préparation des travaux : je vous aide à transformer vos idées en un projet cohérent.",
    },
    {
      title: "Assistance à la réception",
      text: "Je peux vous accompagner dans l'examen visuel des travaux réalisés, le repérage des défauts apparents et la préparation de vos observations.",
    },
  ],
};

// Photos envoyées par le client.
export const field = {
  eyebrow: "Sur le terrain",
  title: "Des chantiers concrets.",
  lead: "Construction, rénovation, suivi de chantier : une expérience polyvalente, acquise chantier après chantier. Cliquez sur une photo pour l'agrandir.",
  photos: [
    {
      src: "/images/chantier-sejour-cuisine.jpg",
      width: 1600,
      height: 1200,
      alt: "Pièce de vie rénovée sous les toits : cuisine équipée blanche, parquet en chêne clair et poutres anciennes apparentes",
      caption: "Pièce de vie sous les toits",
      detail: "Cuisine, parquet chêne, poutres apparentes",
    },
    {
      src: "/images/chantier-entree.jpg",
      width: 1200,
      height: 1600,
      alt: "Couloir d'entrée : carreaux hexagonaux noir et beige qui se fondent dans un parquet en chêne, plafond noir avec spots encastrés",
      caption: "Entrée et couloir",
      detail: "Carreaux hexagonaux, parquet, plafond noir",
    },
    {
      src: "/images/chantier-salle-eau-vasque.jpg",
      width: 1200,
      height: 1600,
      alt: "Salle d'eau : faïence cannelée blanche, meuble vasque en bois suspendu, miroir rond et suspensions noires",
      caption: "Salle d'eau",
      detail: "Faïence cannelée, meuble bois",
    },
    {
      src: "/images/chantier-local-commercial.jpg",
      width: 1600,
      height: 1201,
      alt: "Local commercial aménagé : étagères rétroéclairées, meubles bas, îlot à plateau marbré et comptoir rose",
      caption: "Local commercial",
      detail: "Étagères rétroéclairées, îlot, comptoir",
    },
    {
      src: "/images/chantier-salle-eau-douche.jpg",
      width: 1200,
      height: 1600,
      alt: "Douche avec faïence cannelée claire, colonne de douche noire et receveur blanc",
      caption: "Douche",
      detail: "Robinetterie noire, faïence cannelée",
    },
    {
      src: "/images/chantier-salle-de-bain.jpg",
      width: 1200,
      height: 1600,
      alt: "Salle d'eau rénovée : douche à l'italienne avec paroi vitrée, grands carreaux beiges, meuble vasque suspendu",
      caption: "Salle d'eau",
      detail: "Douche à l'italienne, grand format",
    },
  ],
};

export const audiences = {
  eyebrow: "Pour qui",
  title: "Vous êtes un particulier ou un professionnel ?",
  items: [
    {
      tag: "Particuliers",
      title: "Pour les particuliers",
      text: "Vous souhaitez rénover votre maison ou votre appartement, éviter les erreurs et faire les bons choix. Je vous apporte des conseils concrets et un accompagnement adapté à votre projet.",
    },
    {
      tag: "Professionnels",
      title: "Pour les entreprises du bâtiment",
      text: "Vous avez besoin d'un appui technique ponctuel, d'un regard extérieur ou d'aide pour résoudre un problème sur un chantier. Je mets mon expérience du terrain à votre disposition.",
    },
  ],
};

export const since = {
  eyebrow: "Depuis 2005",
  title: "L'expérience du terrain depuis 2005.",
  text: "Construction de maisons, rénovation, suivi de chantier et résolution de problèmes techniques : mon expérience me permet d'aborder vos projets avec pragmatisme et de rechercher des solutions adaptées aux contraintes réelles du bâtiment.",
  cta: "Découvrir mon parcours",
};

export const area = {
  eyebrow: "Secteur d'intervention",
  title: "Paris et toute l'Île-de-France proche.",
  lead: "J'interviens à Paris, dans les Hauts-de-Seine, la Seine-Saint-Denis, le Val-de-Marne, le Val-d'Oise, l'Essonne et les communes alentour. Un doute sur votre adresse ? Appelez-moi.",
  zones: [
    { code: "75", name: "Paris" },
    { code: "92", name: "Hauts-de-Seine" },
    { code: "93", name: "Seine-Saint-Denis" },
    { code: "94", name: "Val-de-Marne" },
    { code: "95", name: "Val-d'Oise" },
    { code: "91", name: "Essonne" },
  ],
  more: "et alentours",
};

// Réponses tirées uniquement des textes et tarifs fournis par le client.
export const faq = {
  eyebrow: "Questions fréquentes",
  title: "Ce que l'on me demande souvent.",
  items: [
    {
      q: "Pouvez-vous réaliser les travaux ?",
      a: "Oui. Selon la nature du projet, je peux prendre en charge la réalisation des travaux, après définition du périmètre et des conditions d'intervention. Un devis spécifique est alors établi avant le commencement des travaux.",
    },
    {
      q: "J'ai déjà mes artisans, pouvez-vous m'accompagner ?",
      a: "Oui. Je peux intervenir en tant que conseiller technique, vous accompagner lors des réunions de chantier et vous aider à analyser les difficultés rencontrées.",
    },
    {
      q: "Combien coûte une intervention ?",
      a: "Le conseil et l'assistance technique sont facturés 100 € HT de l'heure, avec un minimum d'une heure. Au-delà, le temps est décompté à la minute. Le déplacement en Île-de-France est de 50 € HT, offert à partir de 3 heures sur site.",
    },
    {
      q: "Travaillez-vous avec les entreprises du bâtiment ?",
      a: "Oui. J'apporte un appui technique ponctuel, un regard extérieur ou une aide pour résoudre un problème sur un chantier. Pour un accompagnement régulier, des conditions tarifaires préférentielles peuvent être étudiées.",
    },
    {
      q: "Dans quels secteurs intervenez-vous ?",
      a: "À Paris, dans les Hauts-de-Seine (92), la Seine-Saint-Denis (93), le Val-de-Marne (94), le Val-d'Oise (95), l'Essonne (91) et les communes alentour.",
    },
  ],
};

export const contactSection = {
  eyebrow: "Contact",
  title: "Parlons de votre projet.",
  lead: "Un projet, une question technique ou des travaux à réaliser ? Contactez-moi pour définir ensemble la prestation qui correspond à vos besoins.",
  call: "Appeler",
  sms: "Envoyer un SMS",
  areaLabel: "Paris · 92 · 93 · 94 · 95 · 91 et alentours",
};

/* ========================================================================== */
/*  PAGE « MON EXPÉRIENCE »                                                    */
/* ========================================================================== */

export const experience = {
  meta: {
    title: "Mon expérience",
    description:
      "Dans le bâtiment depuis 2005 : construction, rénovation, suivi de chantier et pose. Diplôme d'État de poseur-installateur en menuiserie extérieure.",
  },
  eyebrow: "Mon expérience",
  title: "Une expérience construite",
  titleAccent: "sur le terrain.",
  tags: ["Bâtiment depuis 2005", "Construction", "Rénovation", "Suivi de chantier", "Pose"],
  intro: {
    eyebrow: "Mon expérience du bâtiment",
    title: "Plus de 20 ans au service de vos projets.",
    paragraphs: [
      "Je travaille dans le bâtiment depuis 2005. Au fil des années, j'ai développé une expérience polyvalente grâce à la construction de plusieurs maisons et à la réalisation de nombreux chantiers de rénovation.",
      "Titulaire d'un diplôme d'État de poseur-installateur en menuiserie extérieure, j'ai acquis une connaissance concrète des travaux, des contraintes techniques et des difficultés qui peuvent apparaître à chaque étape d'un chantier.",
      "Aujourd'hui, je propose cette expérience aux particuliers et aux professionnels, aussi bien pour le conseil que pour l'accompagnement ou la réalisation de travaux.",
    ],
    facts: [
      { value: "2005", label: "Dans le bâtiment depuis" },
      { value: "20+", label: "Années d'expérience" },
      { value: "Diplôme d'État", label: "Poseur-installateur en menuiserie extérieure" },
    ],
  },
  specialty: {
    eyebrow: "Ma spécialité",
    title: "Le suivi de chantier et la recherche de solutions.",
    paragraphs: [
      "Au cours de mon parcours, j'ai particulièrement développé deux compétences : le suivi des travaux et la résolution des problèmes techniques.",
      "Un chantier demande de l'anticipation, de la méthode et une bonne compréhension des contraintes de mise en œuvre. Lorsqu'un problème survient, il faut savoir analyser la situation, examiner les possibilités et trouver une solution cohérente.",
      "C'est cette approche pragmatique que je souhaite mettre au service de mes clients.",
    ],
  },
  pillars: [
    {
      title: "Comprendre les difficultés",
      text: "Analyser les contraintes du chantier, identifier les points sensibles et comprendre les causes possibles d'un problème avant de décider de la suite.",
    },
    {
      title: "Trouver des solutions adaptées",
      text: "Étudier les solutions envisageables en tenant compte des contraintes techniques, de la faisabilité et des règles de l'art applicables.",
    },
    {
      title: "Accompagner la réalisation",
      text: "Aider le client à suivre les étapes importantes, à anticiper les difficultés et à faire les bons choix tout au long de son projet.",
    },
  ],
  approach: {
    eyebrow: "Une approche adaptée à chaque client",
    title: "Plusieurs façons de travailler, selon vos besoins.",
    items: [
      {
        q: "Vous avez déjà votre équipe ?",
        a: "Je peux intervenir en tant que conseiller technique, vous accompagner lors des réunions de chantier et vous aider à analyser les difficultés rencontrées.",
      },
      {
        q: "Vous souhaitez confier vos travaux à un professionnel ?",
        a: "Selon la nature du projet, je peux également vous proposer la réalisation des travaux, dans un cadre défini à l'avance.",
      },
      {
        q: "Vous souhaitez être accompagné de la préparation à la fin du chantier ?",
        a: "Nous pouvons étudier une mission adaptée, allant du conseil ponctuel à un accompagnement plus complet, selon le périmètre et les responsabilités convenus.",
      },
    ],
  },
  commitment: {
    eyebrow: "Mon engagement",
    title: "Une approche directe, pragmatique et fondée sur l'expérience du terrain.",
    text: "Mon objectif est de vous aider à prendre des décisions éclairées, de rechercher des solutions pertinentes et de contribuer au bon déroulement de vos travaux.",
    signature: "L'expérience du terrain au service de vos projets.",
  },
};

/* ========================================================================== */
/*  PAGE « TARIFS »                                                            */
/* ========================================================================== */

export const pricing = {
  meta: {
    title: "Tarifs",
    description:
      "Conseil et assistance technique : 100 € HT de l'heure. Déplacement en Île-de-France : 50 € HT, offert dès 3 heures sur site.",
  },
  eyebrow: "Tarifs",
  title: "Des tarifs clairs",
  titleAccent: "et transparents.",
  lead: "Conseil technique et accompagnement de chantier : tarifs et conditions d'intervention.",
  hourly: {
    label: "Conseil et assistance technique",
    price: 100,
    unit: "€ HT / heure",
    intro: "Ce tarif s'applique notamment aux prestations suivantes :",
    items: [
      "Visites et réunions de chantier.",
      "Conseil technique avant et pendant les travaux.",
      "Suivi ponctuel de chantier.",
      "Recherche de solutions aux difficultés rencontrées.",
      "Prises de cotes et relevés sur site.",
      "Accompagnement lors de la réception des travaux.",
    ],
  },
  travel: {
    label: "Déplacement en Île-de-France",
    price: 50,
    unit: "€ HT par intervention",
    note: "Le forfait de déplacement est offert à partir de 3 heures de présence sur site lors d'une même intervention.",
  },
  minimum: {
    label: "Minimum de facturation",
    text: "Toute intervention est facturée sur une base minimale d'une heure, soit 100 € HT, hors déplacement lorsqu'il est facturable.",
    detail: "Au-delà de la première heure, le temps supplémentaire est décompté à la minute, sur la base de 100 € HT pour 60 minutes, soit 1,6667 € HT par minute.",
    examples: [
      { duration: "1 heure", price: "100 € HT" },
      { duration: "1 h 15", price: "125 € HT" },
      { duration: "1 h 30", price: "150 € HT" },
      { duration: "2 heures", price: "200 € HT" },
      { duration: "3 heures", price: "300 € HT, déplacement offert" },
    ],
  },
  calculator: {
    title: "Estimez votre intervention",
    note: "Estimation indicative, hors recherches techniques, plans et documents. Montants hors taxes.",
  },
  others: [
    {
      title: "Recherches techniques et résolution de problèmes",
      paragraphs: [
        "Les recherches techniques approfondies et le travail nécessaire à l'élaboration de solutions spécifiques sont facturés séparément, sur la base de 100 € HT / heure.",
        "Cela comprend notamment le temps consacré à l'analyse du problème, aux recherches documentaires, à l'étude des solutions envisageables et à la préparation de recommandations techniques.",
        "Le temps est décompté à la minute, après accord préalable sur la mission.",
      ],
    },
    {
      title: "Plans et rédaction de documents",
      paragraphs: [
        "La réalisation ou la modification de plans, leur mise au propre ainsi que la rédaction de notes techniques détaillées et de documents spécifiques ne sont pas comprises dans le tarif des interventions sur site.",
        "Ces prestations font l'objet d'un devis ou d'un accord préalable précisant le contenu de la prestation et son coût.",
      ],
    },
    {
      title: "Réalisation de travaux",
      paragraphs: [
        "Lorsque vous souhaitez me confier directement vos travaux, les prestations sont définies selon la nature du projet, les travaux concernés et les contraintes du chantier.",
        "Un devis spécifique est alors établi avant le commencement des travaux.",
      ],
    },
    {
      title: "Accompagnement régulier et tarifs préférentiels",
      paragraphs: [
        "Pour les entreprises et les clients qui souhaitent un accompagnement régulier, des conditions tarifaires préférentielles peuvent être étudiées en fonction du volume d'interventions, de leur fréquence et des prestations demandées.",
      ],
    },
  ],
  cta: {
    title: "Parlons de votre projet.",
    text: "Vous avez besoin d'un conseil technique, d'un accompagnement de chantier ou souhaitez faire réaliser des travaux ? Contactez-moi pour définir votre besoin et obtenir une proposition adaptée.",
  },
};

export const footer = {
  copyright: "© 2026 Baron Conseil Bâtiment. Tous droits réservés.",
  tagline: "Conseil, accompagnement et réalisation de travaux.",
  legal: "Mentions légales", // TODO : page à créer (SIRET, assurance, hébergeur)
};
