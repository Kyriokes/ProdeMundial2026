import React from 'react';
import { KnockoutMatch, MatchResult } from '../types';
import { countries } from '../data/countries';
import { FlagIcon } from './FlagIcon';
import clsx from 'clsx';
import { generateMatchResult } from '../utils/randomizer';

interface KnockoutMatchCardProps {
  match: KnockoutMatch;
  onUpdate: (result: MatchResult & { winner?: string }) => void;
}

const DICE_ICON = (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-500 hover:rotate-180 hover:scale-110 drop-shadow-sm">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 8h.01"></path>
        <path d="M8 8h.01"></path>
        <path d="M8 16h.01"></path>
        <path d="M16 16h.01"></path>
        <path d="M12 12h.01"></path>
    </svg>
);

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

  const handleRandomize = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!match.homeTeam || !match.awayTeam) return;
    const randomResult = generateMatchResult(match.homeTeam, match.awayTeam, true);
    onUpdate(randomResult);
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-1 w-36 my-0.5 transition-colors duration-200 relative group">
      <div className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-mono leading-none flex justify-between items-center h-3">
          <span>{match.id}</span>
          {match.homeTeam && match.awayTeam && (
              <button
                  onClick={handleRandomize}
                  className="p-0.5 rounded text-blue-900/60 hover:text-purple-500 dark:text-blue-400/60 dark:hover:text-purple-400 transition-colors"
                  title="Resultado Aleatorio"
              >
                  {DICE_ICON}
              </button>
          )}
      </div>
      
      {/* Home Team */}
      <div className={clsx("flex items-center justify-between p-0.5 rounded transition-colors", match.winner === match.homeTeam ? "bg-green-50 dark:bg-green-900/30" : "")}>
        <div className="flex items-center space-x-1 overflow-hidden flex-1 min-w-0">
          {homeTeam ? (
            <>
              <FlagIcon code={homeTeam.flag} size="sm" />
              <span className={clsx("text-xs truncate flex-1 min-w-0", match.winner === match.homeTeam ? "font-bold text-green-700 dark:text-green-400" : "text-gray-700 dark:text-gray-200")}>
                {homeTeam.name}
              </span>
            </>
          ) : (
            <span className="text-xs text-gray-400 dark:text-gray-600 italic">TBD</span>
          )}
        </div>
        <div className="flex items-center space-x-1 ml-1 flex-none">
          <input
            type="number"
            min="0"
            className="w-5 h-5 text-center border rounded text-[10px] bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white flex-none no-spinner"
            value={match.result?.homeGoals ?? ''}
            onChange={(e) => handleScoreChange('home', e.target.value)}
            disabled={!homeTeam || !awayTeam}
          />
          {isDraw && (
            <button
              onClick={() => handlePenaltyChange('home')}
              title="Ganador por penales"
              className={clsx(
                "w-4 h-4 flex items-center justify-center rounded-full text-[8px] font-bold border transition-all",
                match.result?.penaltyWinner === 'home'
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-300 dark:border-gray-600 hover:border-green-500 hover:text-green-500"
              )}
            >
              P
            </button>
          )}
        </div>
      </div>

      {/* Away Team */}
      <div className={clsx("flex items-center justify-between p-0.5 rounded mt-0.5 transition-colors", match.winner === match.awayTeam && "bg-green-50 dark:bg-green-900/30")}>
        <div className="flex items-center space-x-1 overflow-hidden flex-1 min-w-0">
          {awayTeam ? (
            <>
              <FlagIcon code={awayTeam.flag} size="sm" />
              <span className={clsx("text-xs truncate flex-1 min-w-0", match.winner === match.awayTeam ? "font-bold text-green-700 dark:text-green-400" : "text-gray-700 dark:text-gray-200")}>
                {awayTeam.name}
              </span>
            </>
          ) : (
            <span className="text-xs text-gray-400 dark:text-gray-600 italic">TBD</span>
          )}
        </div>
        <div className="flex items-center space-x-1 ml-1 flex-none">
          <input
            type="number"
            min="0"
            className="w-5 h-5 text-center border rounded text-[10px] bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white flex-none no-spinner"
            value={match.result?.awayGoals ?? ''}
            onChange={(e) => handleScoreChange('away', e.target.value)}
            disabled={!homeTeam || !awayTeam}
          />
          {isDraw && (
            <button
              onClick={() => handlePenaltyChange('away')}
              title="Ganador por penales"
              className={clsx(
                "w-4 h-4 flex items-center justify-center rounded-full text-[8px] font-bold border transition-all",
                match.result?.penaltyWinner === 'away'
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-300 dark:border-gray-600 hover:border-green-500 hover:text-green-500"
              )}
            >
              P
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
