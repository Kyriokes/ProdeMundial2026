import { QualifierOption } from '../types';

export const uefaPaths: QualifierOption[] = [
  {
    id: 'pathA',
    name: 'Ruta A (UEFA)',
    teams: ['WAL', 'BIH', 'ITA', 'NIR']
  },
  {
    id: 'pathB',
    name: 'Ruta B (UEFA)',
    teams: ['UKR', 'SWE', 'POL', 'ALB']
  },
  {
    id: 'pathC',
    name: 'Ruta C (UEFA)',
    teams: ['SVK', 'KOS', 'TUR', 'ROU']
  },
  {
    id: 'pathD',
    name: 'Ruta D (UEFA)',
    teams: ['CZE', 'IRL', 'DEN', 'MKD']
  }
];

export const intercontinentalKeys: QualifierOption[] = [
  {
    id: 'keyA',
    name: 'Llave A (Intercontinental)',
    teams: ['COD', 'NCL', 'JAM']
  },
  {
    id: 'keyB',
    name: 'Llave B (Intercontinental)',
    teams: ['IRQ', 'BOL', 'SUR']
  }
];
