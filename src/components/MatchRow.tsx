import React from 'react';
import { Match, MatchResult, Country } from '../types';
import { countries } from '../data/countries';
import { FlagIcon } from './FlagIcon';

interface MatchRowProps {
  match: Match;
  result?: MatchResult;
  onUpdate: (homeGoals: number | undefined, awayGoals: number | undefined) => void;
}

export const MatchRow: React.FC<MatchRowProps> = ({ match, result, onUpdate }) => {
  const homeTeam = countries[match.homeTeam];
  const awayTeam = countries[match.awayTeam];

  const handleHomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onUpdate(val === '' ? undefined : parseInt(val), result?.awayGoals);
  };

  const handleAwayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onUpdate(result?.homeGoals, val === '' ? undefined : parseInt(val));
  };

  if (!homeTeam || !awayTeam) return null;

  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0 border-gray-100">
      <div className="flex items-center flex-1 justify-end space-x-2">
        <span className="text-sm font-medium hidden sm:inline text-right">{homeTeam.name}</span>
        <span className="text-sm font-medium sm:hidden">{homeTeam.code}</span>
        <FlagIcon code={homeTeam.flag} size="md" />
      </div>

      <div className="flex items-center space-x-2 px-2">
        <input
          type="number"
          min="0"
          value={result?.homeGoals ?? ''}
          onChange={handleHomeChange}
          className="w-10 h-8 text-center border rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
        <span className="text-gray-400">-</span>
        <input
          type="number"
          min="0"
          value={result?.awayGoals ?? ''}
          onChange={handleAwayChange}
          className="w-10 h-8 text-center border rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div className="flex items-center flex-1 justify-start space-x-2">
        <FlagIcon code={awayTeam.flag} size="md" />
        <span className="text-sm font-medium hidden sm:inline">{awayTeam.name}</span>
        <span className="text-sm font-medium sm:hidden">{awayTeam.code}</span>
      </div>
    </div>
  );
};
