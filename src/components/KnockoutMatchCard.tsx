import React from 'react';
import { KnockoutMatch, MatchResult } from '../types';
import { countries } from '../data/countries';
import { FlagIcon } from './FlagIcon';
import clsx from 'clsx';

interface KnockoutMatchCardProps {
  match: KnockoutMatch;
  onUpdate: (result: MatchResult & { winner?: string }) => void;
}

export const KnockoutMatchCard: React.FC<KnockoutMatchCardProps> = ({ match, onUpdate }) => {
  const homeTeam = match.homeTeam ? countries[match.homeTeam] : null;
  const awayTeam = match.awayTeam ? countries[match.awayTeam] : null;

  const handleScoreChange = (side: 'home' | 'away', value: string) => {
    const num = value === '' ? undefined : parseInt(value);
    const newResult = {
      ...match.result,
      [side === 'home' ? 'homeGoals' : 'awayGoals']: num
    };

    // Auto-determine winner if scores distinct
    let winner = undefined;
    if (newResult.homeGoals !== undefined && newResult.awayGoals !== undefined) {
      if (newResult.homeGoals > newResult.awayGoals) winner = match.homeTeam!;
      else if (newResult.awayGoals > newResult.homeGoals) winner = match.awayTeam!;
      else {
        // Draw - check penalties
        if (match.result?.penaltyWinner) winner = match.result.penaltyWinner === 'home' ? match.homeTeam! : match.awayTeam!;
      }
    }
    
    onUpdate({ ...newResult, winner });
  };

  const handlePenaltyChange = (winnerSide: 'home' | 'away') => {
    const winner = winnerSide === 'home' ? match.homeTeam! : match.awayTeam!;
    onUpdate({
      ...match.result!,
      isPenalty: true,
      penaltyWinner: winnerSide,
      winner
    });
  };

  const isDraw = match.result?.homeGoals !== undefined && 
                 match.result?.awayGoals !== undefined && 
                 match.result.homeGoals === match.result.awayGoals;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-2 w-64 my-2">
      <div className="text-xs text-gray-400 mb-1 font-mono">{match.id}</div>
      
      {/* Home Team */}
      <div className={clsx("flex items-center justify-between p-1 rounded", match.winner === match.homeTeam && "bg-green-50")}>
        <div className="flex items-center space-x-2 overflow-hidden">
          {homeTeam ? (
            <>
              <FlagIcon code={homeTeam.flag} size="sm" />
              <span className={clsx("text-sm truncate", match.winner === match.homeTeam ? "font-bold text-green-700" : "text-gray-700")}>
                {homeTeam.name}
              </span>
            </>
          ) : (
            <span className="text-sm text-gray-400 italic">TBD</span>
          )}
        </div>
        <input
          type="number"
          min="0"
          className="w-8 h-6 text-center border rounded text-sm ml-2"
          value={match.result?.homeGoals ?? ''}
          onChange={(e) => handleScoreChange('home', e.target.value)}
          disabled={!homeTeam || !awayTeam}
        />
      </div>

      {/* Away Team */}
      <div className={clsx("flex items-center justify-between p-1 rounded mt-1", match.winner === match.awayTeam && "bg-green-50")}>
        <div className="flex items-center space-x-2 overflow-hidden">
          {awayTeam ? (
            <>
              <FlagIcon code={awayTeam.flag} size="sm" />
              <span className={clsx("text-sm truncate", match.winner === match.awayTeam ? "font-bold text-green-700" : "text-gray-700")}>
                {awayTeam.name}
              </span>
            </>
          ) : (
            <span className="text-sm text-gray-400 italic">TBD</span>
          )}
        </div>
        <input
          type="number"
          min="0"
          className="w-8 h-6 text-center border rounded text-sm ml-2"
          value={match.result?.awayGoals ?? ''}
          onChange={(e) => handleScoreChange('away', e.target.value)}
          disabled={!homeTeam || !awayTeam}
        />
      </div>

      {/* Penalties UI */}
      {isDraw && (
        <div className="mt-2 pt-2 border-t border-gray-100 flex justify-center items-center space-x-2">
          <span className="text-xs text-gray-500">Penales:</span>
          <button
            onClick={() => handlePenaltyChange('home')}
            className={clsx("px-2 py-0.5 text-xs rounded border", match.result?.penaltyWinner === 'home' ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-gray-300")}
          >
            Local
          </button>
          <button
            onClick={() => handlePenaltyChange('away')}
            className={clsx("px-2 py-0.5 text-xs rounded border", match.result?.penaltyWinner === 'away' ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-gray-300")}
          >
            Visita
          </button>
        </div>
      )}
    </div>
  );
};
