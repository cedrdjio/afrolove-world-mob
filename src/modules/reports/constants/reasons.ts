export const REPORT_REASONS = [
  { key: 'fake', label: 'Faux profil', description: 'Photos ou informations trompeuses' },
  { key: 'inappropriate', label: 'Contenu inapproprié', description: 'Photos ou messages choquants' },
  { key: 'harassment', label: 'Harcèlement', description: 'Comportement abusif ou menaçant' },
  { key: 'scam', label: 'Arnaque', description: 'Demande d\'argent ou tentative de fraude' },
  { key: 'underage', label: 'Profil mineur', description: 'Cette personne semble avoir moins de 18 ans' },
  { key: 'other', label: 'Autre', description: 'Une autre raison non listée' },
] as const;
