import { Country } from '../types';

export const countries: Record<string, Country> = {
  // Ruta A
  WAL: { code: 'WAL', name: 'Gales', flag: 'gb-wls', fifaRanking: 29, fairPlay: 6 },
  BIH: { code: 'BIH', name: 'Bosnia y Herzegovina', flag: 'ba', fifaRanking: 62, fairPlay: 5 },
  ITA: { code: 'ITA', name: 'Italia', flag: 'it', fifaRanking: 9, fairPlay: 4 },
  NIR: { code: 'NIR', name: 'Irlanda del Norte', flag: 'gb-nir', fifaRanking: 74, fairPlay: 6 },

  // Ruta B
  UKR: { code: 'UKR', name: 'Ucrania', flag: 'ua', fifaRanking: 24, fairPlay: 5 },
  SWE: { code: 'SWE', name: 'Suecia', flag: 'se', fifaRanking: 27, fairPlay: 3 },
  POL: { code: 'POL', name: 'Polonia', flag: 'pl', fifaRanking: 30, fairPlay: 5 },
  ALB: { code: 'ALB', name: 'Albania', flag: 'al', fifaRanking: 66, fairPlay: 6 },

  // Ruta C
  SVK: { code: 'SVK', name: 'Eslovaquia', flag: 'sk', fifaRanking: 48, fairPlay: 5 },
  KOS: { code: 'KOS', name: 'Kosovo', flag: 'xk', fifaRanking: 102, fairPlay: 6 },
  TUR: { code: 'TUR', name: 'Turquía', flag: 'tr', fifaRanking: 35, fairPlay: 7 },
  ROU: { code: 'ROU', name: 'Rumania', flag: 'ro', fifaRanking: 46, fairPlay: 5 },

  // Ruta D
  CZE: { code: 'CZE', name: 'República Checa', flag: 'cz', fifaRanking: 36, fairPlay: 5 },
  IRL: { code: 'IRL', name: 'Irlanda', flag: 'ie', fifaRanking: 60, fairPlay: 4 },
  DEN: { code: 'DEN', name: 'Dinamarca', flag: 'dk', fifaRanking: 21, fairPlay: 3 },
  MKD: { code: 'MKD', name: 'Macedonia del Norte', flag: 'mk', fifaRanking: 68, fairPlay: 6 },

  // Llave A
  COD: { code: 'COD', name: 'República Democrática del Congo', flag: 'cd', fifaRanking: 63, fairPlay: 7 },
  NCL: { code: 'NCL', name: 'Nueva Caledonia', flag: 'nc', fifaRanking: 160, fairPlay: 8 },
  JAM: { code: 'JAM', name: 'Jamaica', flag: 'jm', fifaRanking: 55, fairPlay: 6 },

  // Llave B
  IRQ: { code: 'IRQ', name: 'Irak', flag: 'iq', fifaRanking: 58, fairPlay: 7 },
  BOL: { code: 'BOL', name: 'Bolivia', flag: 'bo', fifaRanking: 85, fairPlay: 8 },
  SUR: { code: 'SUR', name: 'Surinam', flag: 'sr', fifaRanking: 144, fairPlay: 7 },

  // Group A
  MEX: { code: 'MEX', name: 'México', flag: 'mx', fifaRanking: 15, fairPlay: 8 },
  RSA: { code: 'RSA', name: 'Sudáfrica', flag: 'za', fifaRanking: 59, fairPlay: 6 },
  KOR: { code: 'KOR', name: 'Corea del Sur', flag: 'kr', fifaRanking: 23, fairPlay: 5 },

  // Group B
  CAN: { code: 'CAN', name: 'Canadá', flag: 'ca', fifaRanking: 49, fairPlay: 5 },
  QAT: { code: 'QAT', name: 'Catar', flag: 'qa', fifaRanking: 34, fairPlay: 6 },
  SUI: { code: 'SUI', name: 'Suiza', flag: 'ch', fifaRanking: 19, fairPlay: 4 },

  // Group C
  BRA: { code: 'BRA', name: 'Brasil', flag: 'br', fifaRanking: 5, fairPlay: 7 },
  MAR: { code: 'MAR', name: 'Marruecos', flag: 'ma', fifaRanking: 13, fairPlay: 6 },
  HAI: { code: 'HAI', name: 'Haití', flag: 'ht', fifaRanking: 90, fairPlay: 8 },
  SCO: { code: 'SCO', name: 'Escocia', flag: 'gb-sct', fifaRanking: 39, fairPlay: 5 },

  // Group D
  USA: { code: 'USA', name: 'Estados Unidos', flag: 'us', fifaRanking: 11, fairPlay: 5 },
  PAR: { code: 'PAR', name: 'Paraguay', flag: 'py', fifaRanking: 56, fairPlay: 7 },
  AUS: { code: 'AUS', name: 'Australia', flag: 'au', fifaRanking: 24, fairPlay: 5 },

  // Group E
  GER: { code: 'GER', name: 'Alemania', flag: 'de', fifaRanking: 16, fairPlay: 4 },
  CUW: { code: 'CUW', name: 'Curazao', flag: 'cw', fifaRanking: 91, fairPlay: 6 },
  CIV: { code: 'CIV', name: 'Costa de Marfil', flag: 'ci', fifaRanking: 38, fairPlay: 6 },
  ECU: { code: 'ECU', name: 'Ecuador', flag: 'ec', fifaRanking: 31, fairPlay: 6 },

  // Group F
  NED: { code: 'NED', name: 'Países Bajos', flag: 'nl', fifaRanking: 7, fairPlay: 4 },
  JPN: { code: 'JPN', name: 'Japón', flag: 'jp', fifaRanking: 18, fairPlay: 3 },
  TUN: { code: 'TUN', name: 'Túnez', flag: 'tn', fifaRanking: 41, fairPlay: 6 },

  // Group G
  BEL: { code: 'BEL', name: 'Bélgica', flag: 'be', fifaRanking: 4, fairPlay: 4 },
  EGY: { code: 'EGY', name: 'Egipto', flag: 'eg', fifaRanking: 37, fairPlay: 6 },
  IRN: { code: 'IRN', name: 'Irán', flag: 'ir', fifaRanking: 20, fairPlay: 6 },
  NZL: { code: 'NZL', name: 'Nueva Zelanda', flag: 'nz', fifaRanking: 104, fairPlay: 5 },

  // Group H
  ESP: { code: 'ESP', name: 'España', flag: 'es', fifaRanking: 8, fairPlay: 4 },
  CPV: { code: 'CPV', name: 'Cabo Verde', flag: 'cv', fifaRanking: 65, fairPlay: 6 },
  KSA: { code: 'KSA', name: 'Arabia Saudita', flag: 'sa', fifaRanking: 53, fairPlay: 6 },
  URU: { code: 'URU', name: 'Uruguay', flag: 'uy', fifaRanking: 14, fairPlay: 7 },

  // Group I
  FRA: { code: 'FRA', name: 'Francia', flag: 'fr', fifaRanking: 2, fairPlay: 5 },
  SEN: { code: 'SEN', name: 'Senegal', flag: 'sn', fifaRanking: 17, fairPlay: 6 },
  NOR: { code: 'NOR', name: 'Noruega', flag: 'no', fifaRanking: 47, fairPlay: 4 },

  // Group J
  ARG: { code: 'ARG', name: 'Argentina', flag: 'ar', fifaRanking: 1, fairPlay: 6 },
  ALG: { code: 'ALG', name: 'Argelia', flag: 'dz', fifaRanking: 43, fairPlay: 6 },
  AUT: { code: 'AUT', name: 'Austria', flag: 'at', fifaRanking: 25, fairPlay: 4 },
  JOR: { code: 'JOR', name: 'Jordania', flag: 'jo', fifaRanking: 71, fairPlay: 6 },

  // Group K
  POR: { code: 'POR', name: 'Portugal', flag: 'pt', fifaRanking: 6, fairPlay: 5 },
  UZB: { code: 'UZB', name: 'Uzbekistán', flag: 'uz', fifaRanking: 64, fairPlay: 6 },
  COL: { code: 'COL', name: 'Colombia', flag: 'co', fifaRanking: 12, fairPlay: 7 },

  // Group L
  ENG: { code: 'ENG', name: 'Inglaterra', flag: 'gb-eng', fifaRanking: 3, fairPlay: 4 },
  CRO: { code: 'CRO', name: 'Croacia', flag: 'hr', fifaRanking: 10, fairPlay: 5 },
  GHA: { code: 'GHA', name: 'Ghana', flag: 'gh', fifaRanking: 61, fairPlay: 7 },
  PAN: { code: 'PAN', name: 'Panamá', flag: 'pa', fifaRanking: 44, fairPlay: 6 },
};
