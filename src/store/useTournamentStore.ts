import { create } from 'zustand';
import { TournamentState, QualifiersState, GroupsState, KnockoutState, MatchResult } from '../types';

interface TournamentStore extends TournamentState {
  setQualifier: (pathId: string, countryCode: string, isIntercontinental?: boolean) => void;
  setGroupMatch: (matchId: string, result: MatchResult) => void;
  setKnockoutMatch: (matchId: string, result: MatchResult & { winner?: string }) => void;
  setFullState: (state: Partial<TournamentState>) => void;
  reset: () => void;
}

const initialState: TournamentState = {
  qualifiers: {
    uefaPaths: {
      pathA: 'BIH',
      pathB: 'SWE',
      pathC: 'TUR',
      pathD: 'CZE'
    },
    intercontinentalKeys: {
      keyA: 'COD',
      keyB: 'IRQ'
    }
  },
  groups: {
    matches: {}
  },
  knockout: {
    matches: {}
  }
};

export const useTournamentStore = create<TournamentStore>((set) => ({
  ...initialState,

  setQualifier: (pathId, countryCode, isIntercontinental = false) => {
    set((state) => {
      const newQualifiers = { ...state.qualifiers };
      if (isIntercontinental) {
        newQualifiers.intercontinentalKeys = {
          ...newQualifiers.intercontinentalKeys,
          [pathId]: countryCode
        };
      } else {
        newQualifiers.uefaPaths = {
          ...newQualifiers.uefaPaths,
          [pathId]: countryCode
        };
      }
      return { qualifiers: newQualifiers };
    });
  },

  setGroupMatch: (matchId, result) => {
    set((state) => ({
      groups: {
        ...state.groups,
        matches: {
          ...state.groups.matches,
          [matchId]: result
        }
      }
    }));
  },

  setKnockoutMatch: (matchId, result) => {
    set((state) => ({
      knockout: {
        ...state.knockout,
        matches: {
          ...state.knockout.matches,
          [matchId]: result
        }
      }
    }));
  },

  setFullState: (newState) => {
    set((state) => {
      // Importante: Para el knockout, queremos reemplazar completamente el objeto de matches
      // con el hidratado de la URL, no solo "mezclarlo", ya que de lo contrario podríamos
      // retener basura o no limpiar estados borrados.
      const updatedKnockout = newState.knockout 
          ? { matches: { ...newState.knockout.matches } } 
          : { ...state.knockout };
          
      return {
        ...state,
        ...newState,
        qualifiers: { ...state.qualifiers, ...(newState.qualifiers || {}) },
        groups: { ...state.groups, ...(newState.groups || {}) },
        knockout: updatedKnockout
      };
    });
  },

  reset: () => set(initialState)
}));
