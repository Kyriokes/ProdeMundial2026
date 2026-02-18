import React, { useState } from 'react';
import { Match, MatchResult } from '../types';
import { countries } from '../data/countries';
import { FlagIcon } from './FlagIcon';
import { generateMatchResult } from '../utils/randomizer';

interface MatchRowProps {
  match: Match;
  result?: MatchResult;
  onUpdate: (updates: Partial<MatchResult>) => void;
}

const RED_CARD_ICON = "https://ssl.gstatic.com/onebox/sports/soccer_timeline/red-card-right.svg";
const YELLOW_CARD_ICON = "https://ssl.gstatic.com/onebox/sports/soccer_timeline/yellow-card-right.svg";
const DICE_ICON = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-500 hover:rotate-180 hover:scale-110 drop-shadow-sm">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 8h.01"></path>
        <path d="M8 8h.01"></path>
        <path d="M8 16h.01"></path>
        <path d="M16 16h.01"></path>
        <path d="M12 12h.01"></path>
    </svg>
);

const AnimatedDoubleYellow = () => (
    <div className="relative w-6 h-4 flex justify-center items-center">
        <style>{`
            @keyframes mergeLeft {
                0%, 25% { transform: translateX(0); opacity: 1; }
                50%, 90% { transform: translateX(6px); opacity: 0; }
                100% { transform: translateX(0); opacity: 1; }
            }
            @keyframes mergeRight {
                0%, 25% { transform: translateX(0); opacity: 1; }
                50%, 90% { transform: translateX(-6px); opacity: 0; }
                100% { transform: translateX(0); opacity: 1; }
            }
            @keyframes redAppear {
                0%, 45% { transform: scale(0.5); opacity: 0; }
                55%, 90% { transform: scale(1); opacity: 1; }
                100% { transform: scale(0.5); opacity: 0; }
            }
        `}</style>
        <img 
            src={YELLOW_CARD_ICON} 
            className="w-3 h-3 absolute left-0" 
            style={{ animation: 'mergeLeft 4s infinite ease-in-out' }}
            alt="" 
        />
        <img 
            src={YELLOW_CARD_ICON} 
            className="w-3 h-3 absolute right-0" 
            style={{ animation: 'mergeRight 4s infinite ease-in-out' }}
            alt="" 
        />
        <img 
            src={RED_CARD_ICON} 
            className="w-3 h-3 absolute" 
            style={{ animation: 'redAppear 4s infinite ease-in-out' }}
            alt="" 
        />
    </div>
);

export const MatchRow: React.FC<MatchRowProps> = ({ match, result, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const homeTeam = countries[match.homeTeam];
  const awayTeam = countries[match.awayTeam];

  const handleHomeGoalsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onUpdate({ homeGoals: val === '' ? undefined : parseInt(val) });
  };

  const handleAwayGoalsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onUpdate({ awayGoals: val === '' ? undefined : parseInt(val) });
  };

  const updateCards = (team: 'home' | 'away', type: 'Yellow' | 'DoubleYellow' | 'DirectRed', delta: number) => {
    const field = `${team}${type}` as keyof MatchResult;
    const currentVal = (result?.[field] as number) || 0;
    const newVal = Math.max(0, currentVal + delta);
    
    // Validation
    if (type === 'Yellow' && newVal > 12) return;

    if (team === 'home') {
       const dy = type === 'DoubleYellow' ? newVal : ((result?.homeDoubleYellow as number) || 0);
       const dr = type === 'DirectRed' ? newVal : ((result?.homeDirectRed as number) || 0);
       if (dy + dr > 4) return; // Constraint
    } else {
       const dy = type === 'DoubleYellow' ? newVal : ((result?.awayDoubleYellow as number) || 0);
       const dr = type === 'DirectRed' ? newVal : ((result?.awayDirectRed as number) || 0);
       if (dy + dr > 4) return; // Constraint
    }

    onUpdate({ [field]: newVal });
  };

  if (!homeTeam || !awayTeam) return null;

  const CardCounter = ({ 
    count, 
    onIncrement, 
    onDecrement
  }: { 
    count: number, 
    onIncrement: () => void, 
    onDecrement: () => void
  }) => (
      <div className="flex flex-col items-center bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 overflow-hidden w-7">
        <button 
          onClick={onIncrement}
          className="w-full h-5 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-xs"
        >
          +
        </button>
        <span className="w-full text-center text-xs font-medium dark:text-white border-y border-gray-100 dark:border-gray-600 py-0.5 bg-gray-50 dark:bg-gray-800/50">{count}</span>
        <button 
          onClick={onDecrement}
          className="w-full h-5 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-xs"
        >
          -
        </button>
      </div>
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, field: 'home' | 'away') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (!form) {
        // Fallback: try to find next input in the document
        const inputs = Array.from(document.querySelectorAll('input[type="number"]:not([disabled])'));
        const index = inputs.indexOf(e.currentTarget);
        if (index > -1 && index < inputs.length - 1) {
          (inputs[index + 1] as HTMLElement).focus();
        }
      }
    }
  };

  const handleRandomize = () => {
    const randomResult = generateMatchResult(match.homeTeam, match.awayTeam, false);
    onUpdate(randomResult);
  };

  return (
    <div className="border-b last:border-0 border-gray-100 dark:border-gray-700 transition-colors">
      <div className="flex items-center justify-between py-2 relative">
        {/* Home Team */}
        <div className="flex items-center flex-1 justify-end space-x-2 relative">
          {/* Random Dice Button - Left of Home Team */}
          <button
              onClick={handleRandomize}
              className="absolute left-0 p-1.5 rounded transition-colors text-blue-900/60 hover:text-purple-500 dark:text-blue-400/60 dark:hover:text-purple-400"
              title="Generar Resultado Aleatorio"
          >
              {DICE_ICON}
          </button>
          
          <span className="text-sm font-medium hidden lg:inline text-right text-gray-700 dark:text-gray-300">{homeTeam.name}</span>
          <span className="text-sm font-medium lg:hidden text-gray-700 dark:text-gray-300">{homeTeam.code}</span>
          <FlagIcon code={homeTeam.flag} size="md" />
        </div>

        {/* Score Inputs */}
        <div className="flex items-center justify-center space-x-2 px-2 w-32">
          <input
            type="number"
            min="0"
            value={result?.homeGoals ?? ''}
            onChange={handleHomeGoalsChange}
            onKeyDown={(e) => handleKeyDown(e, 'home')}
            className="w-10 h-8 text-center border rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none no-spinner bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
          />
          <span className="text-gray-400 dark:text-gray-500">-</span>
          <input
            type="number"
            min="0"
            value={result?.awayGoals ?? ''}
            onChange={handleAwayGoalsChange}
            onKeyDown={(e) => handleKeyDown(e, 'away')}
            className="w-10 h-8 text-center border rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none no-spinner bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
          />
        </div>

        {/* Away Team */}
        <div className="flex items-center flex-1 justify-start space-x-2">
          <FlagIcon code={awayTeam.flag} size="md" />
          <span className="text-sm font-medium hidden lg:inline text-gray-700 dark:text-gray-300">{awayTeam.name}</span>
          <span className="text-sm font-medium lg:hidden text-gray-700 dark:text-gray-300">{awayTeam.code}</span>
        </div>

        {/* Cards Toggle Button - Positioned absolutely to the right */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className={`absolute right-0 p-1.5 rounded transition-colors ${isExpanded ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
          title="Tarjetas"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="6" width="13" height="16" rx="2" ry="2" className="text-yellow-400 fill-current stroke-none"></rect>
            <rect x="9" y="2" width="13" height="16" rx="2" ry="2" className="text-red-500 fill-current stroke-white dark:stroke-gray-800" strokeWidth="2"></rect>
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 text-sm animate-in slide-in-from-top-2 duration-200 border-t border-gray-100 dark:border-gray-700">
            {/* Split layout for Home and Away cards */}
            <div className="flex justify-center gap-4 sm:gap-8">
                
                {/* Home Team Cards */}
                <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2 sm:gap-4 text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <div className="flex flex-col items-center w-8 sm:w-10">
                            <img src={YELLOW_CARD_ICON} className="w-3 h-3 mb-1" alt="Amarilla" title="Amarilla (-1)" />
                        </div>
                        <div className="flex flex-col items-center w-8 sm:w-10">
                            <AnimatedDoubleYellow />
                        </div>
                        <div className="flex flex-col items-center w-8 sm:w-10">
                            <img src={RED_CARD_ICON} className="w-3 h-3 mb-1" alt="Roja" title="Roja Directa (-4)" />
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="w-8 sm:w-10 flex justify-center">
                            <CardCounter 
                                count={result?.homeYellow || 0} 
                                onDecrement={() => updateCards('home', 'Yellow', -1)} 
                                onIncrement={() => updateCards('home', 'Yellow', 1)} 
                            />
                        </div>
                        <div className="w-8 sm:w-10 flex justify-center">
                            <CardCounter 
                                count={result?.homeDoubleYellow || 0} 
                                onDecrement={() => updateCards('home', 'DoubleYellow', -1)} 
                                onIncrement={() => updateCards('home', 'DoubleYellow', 1)} 
                            />
                        </div>
                        <div className="w-8 sm:w-10 flex justify-center">
                            <CardCounter 
                                count={result?.homeDirectRed || 0} 
                                onDecrement={() => updateCards('home', 'DirectRed', -1)} 
                                onIncrement={() => updateCards('home', 'DirectRed', 1)} 
                            />
                        </div>
                    </div>
                </div>

                {/* Vertical Divider */}
                <div className="w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>

                {/* Away Team Cards */}
                <div className="flex flex-col items-start gap-2">
                    <div className="flex items-center gap-2 sm:gap-4 text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <div className="flex flex-col items-center w-8 sm:w-10">
                            <img src={YELLOW_CARD_ICON} className="w-3 h-3 mb-1" alt="Amarilla" title="Amarilla (-1)" />
                        </div>
                        <div className="flex flex-col items-center w-8 sm:w-10">
                            <AnimatedDoubleYellow />
                        </div>
                        <div className="flex flex-col items-center w-8 sm:w-10">
                            <img src={RED_CARD_ICON} className="w-3 h-3 mb-1" alt="Roja" title="Roja Directa (-4)" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="w-8 sm:w-10 flex justify-center">
                            <CardCounter 
                                count={result?.awayYellow || 0} 
                                onDecrement={() => updateCards('away', 'Yellow', -1)} 
                                onIncrement={() => updateCards('away', 'Yellow', 1)} 
                            />
                        </div>
                        <div className="w-8 sm:w-10 flex justify-center">
                            <CardCounter 
                                count={result?.awayDoubleYellow || 0} 
                                onDecrement={() => updateCards('away', 'DoubleYellow', -1)} 
                                onIncrement={() => updateCards('away', 'DoubleYellow', 1)} 
                            />
                        </div>
                        <div className="w-8 sm:w-10 flex justify-center">
                            <CardCounter 
                                count={result?.awayDirectRed || 0} 
                                onDecrement={() => updateCards('away', 'DirectRed', -1)} 
                                onIncrement={() => updateCards('away', 'DirectRed', 1)} 
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
      )}
    </div>
  );
};
