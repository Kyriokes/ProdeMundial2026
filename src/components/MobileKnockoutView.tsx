import React, { useState } from 'react';
import { KnockoutMatch, MatchResult, Country } from '../types';
import { KnockoutMatchCard } from './KnockoutMatchCard';
import clsx from 'clsx';

interface MobileKnockoutViewProps {
  rounds: {
    roundOf32: KnockoutMatch[];
    roundOf16: KnockoutMatch[];
    quarterFinals: KnockoutMatch[];
    semiFinals: KnockoutMatch[];
    final: KnockoutMatch[];
  };
  onUpdate: (matchId: string, result: MatchResult & { winner?: string }) => void;
  champion: Country | null;
}

type RoundKey = 'roundOf32' | 'roundOf16' | 'quarterFinals' | 'finalStages';

export const MobileKnockoutView: React.FC<MobileKnockoutViewProps> = ({ rounds, onUpdate, champion }) => {
  const [activeRound, setActiveRound] = useState<RoundKey>('roundOf32');

  const tabs: { key: RoundKey; label: string }[] = [
    { key: 'roundOf32', label: '16avos' },
    { key: 'roundOf16', label: '8avos' },
    { key: 'quarterFinals', label: 'Cuartos' },
    { key: 'finalStages', label: 'Definición' },
  ];

  const getOrderedMatches = (matches: KnockoutMatch[]) => {
    if (matches.length === 0) return [];
    
    // Interleave left and right side matches to create a column-major visual order in a 2-column grid
    const mid = Math.ceil(matches.length / 2);
    const firstHalf = matches.slice(0, mid);
    const secondHalf = matches.slice(mid);
    
    const ordered: KnockoutMatch[] = [];
    
    for (let i = 0; i < mid; i++) {
        if (firstHalf[i]) ordered.push(firstHalf[i]);
        if (secondHalf[i]) ordered.push(secondHalf[i]);
    }
    
    return ordered;
  };

  const currentMatches = activeRound === 'finalStages' ? [] : getOrderedMatches(rounds[activeRound]);

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-gray-900">
      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveRound(tab.key)}
            className={clsx(
              "flex-1 min-w-[80px] py-3 text-sm font-medium whitespace-nowrap transition-colors relative",
              activeRound === tab.key
                ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            )}
          >
            {tab.label}
            {activeRound === tab.key && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400" />
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        
        {activeRound === 'finalStages' ? (
          /* Final Stages View (Semis + Final) */
          <div className="flex flex-col items-center space-y-8">
            {/* Semifinals Section */}
            <div className="w-full">
              <h3 className="text-center font-bold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-widest mb-4">Semifinales</h3>
              <div className="flex flex-wrap justify-center gap-4">
                {rounds.semiFinals.length > 0 ? (
                   rounds.semiFinals.map((match) => (
                      <div key={match.id} className="transform transition-all duration-300">
                          <KnockoutMatchCard match={match} onUpdate={(r) => onUpdate(match.id, r)} />
                      </div>
                   ))
                ) : (
                  <div className="text-center text-gray-400 dark:text-gray-500 italic text-sm">Por definir</div>
                )}
              </div>
            </div>

            {/* Final Section */}
            <div className="w-full">
              <h3 className="text-center font-bold text-blue-600 dark:text-blue-400 text-sm uppercase tracking-widest mb-4">Gran Final</h3>
              <div className="flex justify-center">
                 {rounds.final.length > 0 ? (
                    <div className="transform scale-110 shadow-lg rounded-lg">
                      <KnockoutMatchCard match={rounds.final[0]} onUpdate={(r) => onUpdate(rounds.final[0].id, r)} />
                    </div>
                 ) : (
                    <div className="text-center text-gray-400 dark:text-gray-500 italic text-sm">Por definir</div>
                 )}
              </div>
            </div>

            {/* Champion Section */}
            {champion && (
               <div className="mt-4 text-center animate-fade-in-up w-full">
                  <div className="text-5xl mb-4 drop-shadow-xl animate-bounce">🏆</div>
                  <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-2">Campeón</h2>
                  <div className="flex flex-col items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 mx-4">
                       <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter leading-none whitespace-nowrap bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                          {champion.name}
                       </div>
                  </div>
              </div>
            )}
          </div>
        ) : (
          /* Grid Layout for Earlier Rounds */
          <div className="grid grid-cols-1 min-[350px]:grid-cols-2 gap-x-2 gap-y-4 justify-items-center">
            {currentMatches.length === 0 ? (
              <div className="col-span-2 text-center text-gray-400 dark:text-gray-500 py-8">
                No hay partidos disponibles para esta ronda.
              </div>
            ) : (
              currentMatches.map((match) => (
                <div key={match.id} className="w-auto transform transition-all duration-300">
                   <KnockoutMatchCard match={match} onUpdate={(r) => onUpdate(match.id, r)} />
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
};
