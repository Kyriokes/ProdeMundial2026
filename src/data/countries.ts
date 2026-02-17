import { Country } from '../types';

export const countries: Record<string, Country> = {
  // Ruta A
  WAL: { code: 'WAL', name: 'Gales', flag: 'gb-wls', fifaRanking: 35, fairPlay: 0 },
  BIH: { code: 'BIH', name: 'Bosnia y Herzegovina', flag: 'ba', fifaRanking: 71, fairPlay: 0 },
  ITA: { code: 'ITA', name: 'Italia', flag: 'it', fifaRanking: 13, fairPlay: 0 },
  NIR: { code: 'NIR', name: 'Irlanda del Norte', flag: 'gb-nir', fifaRanking: 69, fairPlay: 0 },

  // Ruta B
  UKR: { code: 'UKR', name: 'Ucrania', flag: 'ua', fifaRanking: 30, fairPlay: 0 },
  SWE: { code: 'SWE', name: 'Suecia', flag: 'se', fifaRanking: 42, fairPlay: 0 },
  POL: { code: 'POL', name: 'Polonia', flag: 'pl', fifaRanking: 34, fairPlay: 0 },
  ALB: { code: 'ALB', name: 'Albania', flag: 'al', fifaRanking: 63, fairPlay: 0 },

  // Ruta C
  SVK: { code: 'SVK', name: 'Eslovaquia', flag: 'sk', fifaRanking: 44, fairPlay: 0 },
  KOS: { code: 'KOS', name: 'Kosovo', flag: 'xk', fifaRanking: 79, fairPlay: 0 },
  TUR: { code: 'TUR', name: 'Turquía', flag: 'tr', fifaRanking: 25, fairPlay: 0 },
  ROU: { code: 'ROU', name: 'Rumania', flag: 'ro', fifaRanking: 49, fairPlay: 0 },

  // Ruta D
  CZE: { code: 'CZE', name: 'República Checa', flag: 'cz', fifaRanking: 43, fairPlay: 0 },
  IRL: { code: 'IRL', name: 'Irlanda', flag: 'ie', fifaRanking: 59, fairPlay: 0 },
  DEN: { code: 'DEN', name: 'Dinamarca', flag: 'dk', fifaRanking: 21, fairPlay: 0 },
  MKD: { code: 'MKD', name: 'Macedonia del Norte', flag: 'mk', fifaRanking: 66, fairPlay: 0 },

  // Llave A
  COD: { code: 'COD', name: 'R.D. Congo', flag: 'cd', fifaRanking: 48, fairPlay: 0 },
  NCL: { code: 'NCL', name: 'Nueva Caledonia', flag: 'nc', fifaRanking: 150, fairPlay: 0 },
  JAM: { code: 'JAM', name: 'Jamaica', flag: 'jm', fifaRanking: 70, fairPlay: 0 },

  // Llave B
  IRQ: { code: 'IRQ', name: 'Irak', flag: 'iq', fifaRanking: 58, fairPlay: 0 },
  BOL: { code: 'BOL', name: 'Bolivia', flag: 'bo', fifaRanking: 76, fairPlay: 0 },
  SUR: { code: 'SUR', name: 'Surinam', flag: 'sr', fifaRanking: 123, fairPlay: 0 },

  // Group A
  MEX: { code: 'MEX', name: 'México', flag: 'mx', fifaRanking: 16, fairPlay: 0 },
  RSA: { code: 'RSA', name: 'Sudáfrica', flag: 'za', fifaRanking: 60, fairPlay: 0 },
  KOR: { code: 'KOR', name: 'Corea del Sur', flag: 'kr', fifaRanking: 22, fairPlay: 0 },

  // Group B
  CAN: { code: 'CAN', name: 'Canadá', flag: 'ca', fifaRanking: 29, fairPlay: 0 },
  QAT: { code: 'QAT', name: 'Catar', flag: 'qa', fifaRanking: 56, fairPlay: 0 },
  SUI: { code: 'SUI', name: 'Suiza', flag: 'ch', fifaRanking: 18, fairPlay: 0 },

  // Group C
  BRA: { code: 'BRA', name: 'Brasil', flag: 'br', fifaRanking: 5, fairPlay: 0 },
  MAR: { code: 'MAR', name: 'Marruecos', flag: 'ma', fifaRanking: 8, fairPlay: 0 },
  HAI: { code: 'HAI', name: 'Haití', flag: 'ht', fifaRanking: 83, fairPlay: 0 },
  SCO: { code: 'SCO', name: 'Escocia', flag: 'gb-sct', fifaRanking: 38, fairPlay: 0 },

  // Group D
  USA: { code: 'USA', name: 'Estados Unidos', flag: 'us', fifaRanking: 15, fairPlay: 0 },
  PAR: { code: 'PAR', name: 'Paraguay', flag: 'py', fifaRanking: 40, fairPlay: 0 },
  AUS: { code: 'AUS', name: 'Australia', flag: 'au', fifaRanking: 27, fairPlay: 0 },

  // Group E
  GER: { code: 'GER', name: 'Alemania', flag: 'de', fifaRanking: 10, fairPlay: 0 },
  CUW: { code: 'CUW', name: 'Curazao', flag: 'cw', fifaRanking: 81, fairPlay: 0 },
  CIV: { code: 'CIV', name: 'Costa de Marfil', flag: 'ci', fifaRanking: 37, fairPlay: 0 },
  ECU: { code: 'ECU', name: 'Ecuador', flag: 'ec', fifaRanking: 23, fairPlay: 0 },

  // Group F
  NED: { code: 'NED', name: 'Países Bajos', flag: 'nl', fifaRanking: 7, fairPlay: 0 },
  JPN: { code: 'JPN', name: 'Japón', flag: 'jp', fifaRanking: 19, fairPlay: 0 },
  TUN: { code: 'TUN', name: 'Túnez', flag: 'tn', fifaRanking: 47, fairPlay: 0 },

  // Group G
  BEL: { code: 'BEL', name: 'Bélgica', flag: 'be', fifaRanking: 9, fairPlay: 0 },
  EGY: { code: 'EGY', name: 'Egipto', flag: 'eg', fifaRanking: 31, fairPlay: 0 },
  IRN: { code: 'IRN', name: 'Irán', flag: 'ir', fifaRanking: 20, fairPlay: 0 },
  NZL: { code: 'NZL', name: 'Nueva Zelanda', flag: 'nz', fifaRanking: 85, fairPlay: 0 },

  // Group H
  ESP: { code: 'ESP', name: 'España', flag: 'es', fifaRanking: 1, fairPlay: 0 },
  CPV: { code: 'CPV', name: 'Cabo Verde', flag: 'cv', fifaRanking: 67, fairPlay: 0 },
  KSA: { code: 'KSA', name: 'Arabia Saudita', flag: 'sa', fifaRanking: 61, fairPlay: 0 },
  URU: { code: 'URU', name: 'Uruguay', flag: 'uy', fifaRanking: 17, fairPlay: 0 },

  // Group I
  FRA: { code: 'FRA', name: 'Francia', flag: 'fr', fifaRanking: 3, fairPlay: 0 },
  SEN: { code: 'SEN', name: 'Senegal', flag: 'sn', fifaRanking: 12, fairPlay: 0 },
  NOR: { code: 'NOR', name: 'Noruega', flag: 'no', fifaRanking: 32, fairPlay: 0 },

  // Group J
  ARG: { code: 'ARG', name: 'Argentina', flag: 'ar', fifaRanking: 2, fairPlay: 0 },
  ALG: { code: 'ALG', name: 'Argelia', flag: 'dz', fifaRanking: 28, fairPlay: 0 },
  AUT: { code: 'AUT', name: 'Austria', flag: 'at', fifaRanking: 24, fairPlay: 0 },
  JOR: { code: 'JOR', name: 'Jordania', flag: 'jo', fifaRanking: 64, fairPlay: 0 },

  // Group K
  POR: { code: 'POR', name: 'Portugal', flag: 'pt', fifaRanking: 6, fairPlay: 0 },
  UZB: { code: 'UZB', name: 'Uzbekistán', flag: 'uz', fifaRanking: 52, fairPlay: 0 },
  COL: { code: 'COL', name: 'Colombia', flag: 'co', fifaRanking: 14, fairPlay: 0 },

  // Group L
  ENG: { code: 'ENG', name: 'Inglaterra', flag: 'gb-eng', fifaRanking: 4, fairPlay: 0 },
  CRO: { code: 'CRO', name: 'Croacia', flag: 'hr', fifaRanking: 11, fairPlay: 0 },
  GHA: { code: 'GHA', name: 'Ghana', flag: 'gh', fifaRanking: 72, fairPlay: 0 },
  PAN: { code: 'PAN', name: 'Panamá', flag: 'pa', fifaRanking: 33, fairPlay: 0 },
};
