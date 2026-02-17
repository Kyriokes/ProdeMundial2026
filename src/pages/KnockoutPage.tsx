import React, { useMemo } from 'react';
import { useTournamentStore } from '../store/useTournamentStore';
import { countries } from '../data/countries';
import { KnockoutMatchCard } from '../components/KnockoutMatchCard';
import { MatchResult, KnockoutMatch } from '../types';
import { useNavigate } from 'react-router-dom';
import { FlagIcon } from '../components/FlagIcon';
import { useBracketData } from '../hooks/useBracketData';
import { MobileKnockoutView } from '../components/MobileKnockoutView';

export const KnockoutPage: React.FC = () => {
  const { setKnockoutMatch } = useTournamentStore();
  const navigate = useNavigate();

  // 1. Reconstruct group stage state to determine qualifiers
  const bracketData = useBracketData();

  if (bracketData.length === 0) {
      return <div className="p-8 text-center">Cargando o faltan datos...</div>;
  }

  const handleUpdate = (matchId: string, result: MatchResult & { winner?: string }) => {
    setKnockoutMatch(matchId, result);
  };

  // Group matches by round
  const rounds = {
      roundOf32: bracketData.filter(m => m.round === 'roundOf32'),
      roundOf16: bracketData.filter(m => m.round === 'roundOf16'),
      quarterFinals: bracketData.filter(m => m.round === 'quarterFinals'),
      semiFinals: bracketData.filter(m => m.round === 'semiFinals'),
      final: bracketData.filter(m => m.round === 'final')
  };

  // Split into Left and Right
  const leftSide = {
      r32: rounds.roundOf32.slice(0, 8),
      r16: rounds.roundOf16.slice(0, 4),
      qf: rounds.quarterFinals.slice(0, 2),
      sf: rounds.semiFinals[0]
  };

  const rightSide = {
      r32: rounds.roundOf32.slice(8, 16),
      r16: rounds.roundOf16.slice(4, 8),
      qf: rounds.quarterFinals.slice(2, 4),
      sf: rounds.semiFinals[1]
  };

  const finalMatch = rounds.final[0];
  const championCode = finalMatch?.winner;
  const champion = championCode ? countries[championCode] : null;

  const renderColumn = (matches: KnockoutMatch[], title: string) => {
    const heightPercent = matches.length > 0 ? 100 / matches.length : 0;

    return (
      <div className="flex flex-col h-full items-center relative transition-all duration-300 shrink-0 z-0">
          <div className="h-8 flex items-center justify-center w-full relative z-10">
              <h3 className="font-bold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-tight bg-gray-50/90 dark:bg-gray-800/90 px-2 py-0.5 rounded backdrop-blur-sm whitespace-nowrap border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">{title}</h3>
          </div>
          
          <div className="flex-1 w-36 py-1 flex flex-col">
              {matches.map((m) => (
                  <div 
                    key={m.id} 
                    className="flex flex-col justify-center items-center w-full relative"
                    style={{ height: `${heightPercent}%` }}
                  >
                      {/* Connector Lines Logic could go here, but for now just the card */}
                      <div className="relative transition-transform duration-200 hover:scale-105 z-20">
                          <KnockoutMatchCard match={m} onUpdate={(r) => handleUpdate(m.id, r)} />
                      </div>
                  </div>
              ))}
          </div>
      </div>
    );
  };

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-300 ">
      <div className="flex-none py-3 px-4 bg-white dark:bg-gray-800 shadow-sm z-30 relative transition-colors">
          <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100">Fase Eliminatoria</h1>
      </div>
      
      <div className="lg:hidden flex-1 overflow-hidden">
        <MobileKnockoutView rounds={rounds} onUpdate={handleUpdate} champion={champion} />
      </div>

      <div className="hidden lg:flex flex-1 w-full overflow-auto bg-slate-50 dark:bg-gray-900 transition-colors relative">
        <div className="h-full w-max min-w-full flex justify-center items-stretch mx-auto p-4">
            {/* LEFT SIDE (16 -> 8 -> 4 -> Semi) */}
            <div className="flex space-x-4 xl:space-x-8 transition-all duration-300 items-stretch flex-1 justify-end">
                {renderColumn(leftSide.r32, '16avos')}
                {renderColumn(leftSide.r16, '8avos')}
                {renderColumn(leftSide.qf, 'Cuartos')}
                
                {/* Left Semi */}
                {renderColumn(leftSide.sf ? [leftSide.sf] : [], 'Semifinal')}
            </div>

            {/* CENTER - FINAL & CHAMPION */}
            <div className={`flex flex-col h-full px-8 mx-4 lg:mx-8 border-x border-gray-200 dark:border-gray-700 bg-white/40 dark:bg-gray-800/40 rounded-3xl min-w-[320px] z-10 relative shrink-0 shadow-sm backdrop-blur-sm justify-center transition-all duration-300 overflow-hidden`}>
                {/* Background Flag with Blur */}
                {champion && (
                    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 dark:opacity-10 blur-0">
                             <span className={`fi fi-${champion.flag} text-[20rem]`} style={{ fontSize: '20rem' }} />
                        </div>
                    </div>
                )}

                <div className="flex-none h-16 flex items-end justify-center w-full mb-4 relative z-10">
                    <h3 className="font-black text-blue-900 dark:text-blue-400 text-xl uppercase tracking-widest border-b-2 border-blue-900/20 dark:border-blue-400/20 pb-1 transition-colors">Gran Final</h3>
                </div>
                
                <div className="flex-1 flex flex-col justify-center items-center pb-20 relative z-10">
                    {finalMatch && (
                        <div className="transform scale-125 mb-12 shadow-2xl rounded-lg bg-white dark:bg-gray-800 relative z-20 ring-4 ring-gray-100 dark:ring-gray-700 transition-colors">
                             <KnockoutMatchCard match={finalMatch} onUpdate={(r) => handleUpdate(finalMatch.id, r)} />
                        </div>
                    )}
                    
                    {champion ? (
                        <div className="text-center animate-fade-in-up transform transition-all duration-500 hover:scale-110 cursor-default">
                            <div className="text-5xl mb-4 drop-shadow-xl animate-bounce">🏆</div>
                            <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-2">Campeón del Mundo</h2>
                            <div className="flex flex-col items-center bg-white/80 dark:bg-gray-800/80 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transition-colors backdrop-blur-sm">
                                 <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter leading-none whitespace-nowrap bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                                    {champion.name}
                                 </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center opacity-40 grayscale dark:opacity-30">
                            <div className="text-5xl mb-4">🏆</div>
                            <h2 className="text-xl font-bold dark:text-gray-300 tracking-widest">POR DEFINIR</h2>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT SIDE (Semi <- 4 <- 8 <- 16) */}
            <div className="flex space-x-4 xl:space-x-8 transition-all duration-300 items-stretch flex-1 justify-start">
                {/* Right Semi */}
                {renderColumn(rightSide.sf ? [rightSide.sf] : [], 'Semifinal')}
                {renderColumn(rightSide.qf, 'Cuartos')}
                {renderColumn(rightSide.r16, '8avos')}
                {renderColumn(rightSide.r32, '16avos')}
            </div>
        </div>
      </div>
    </div>
  );
};
