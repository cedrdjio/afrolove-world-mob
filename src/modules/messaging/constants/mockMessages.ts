export interface MockMessage {
  id: string;
  text: string;
  fromMe: boolean;
  timestamp: string;
}

export const INITIAL_MESSAGES: MockMessage[] = [
  { id: '1', text: 'Bonjour ! 😊 Tu viens aussi de Lagos ?', fromMe: false, timestamp: '15:40' },
  { id: '2', text: 'Oui ! Depuis 2 ans maintenant 🌍', fromMe: true, timestamp: '15:41' },
  { id: '3', text: 'Super ! On devrait se retrouver pour un café ☕', fromMe: false, timestamp: '15:42' },
  { id: '4', text: 'Avec plaisir ! Ce weekend ? 🌟', fromMe: true, timestamp: '15:44' },
];
