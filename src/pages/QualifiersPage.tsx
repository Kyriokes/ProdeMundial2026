import React from 'react';
import { uefaPaths, intercontinentalKeys } from '../data/qualifiers';
import { QualifierCard } from '../components/QualifierCard';
import { useTournamentStore } from '../store/useTournamentStore';
import { useNavigate } from 'react-router-dom';

export const QualifiersPage: React.FC = () => {
  const { qualifiers, setQualifier } = useTournamentStore();
  const navigate = useNavigate();

  const handleSelectUefa = (pathId: string, teamCode: string) => {
    setQualifier(pathId, teamCode, false);
  };

  const handleSelectIntercontinental = (keyId: string, teamCode: string) => {
    setQualifier(keyId, teamCode, true);
  };

  const isComplete = 
    uefaPaths.every(p => qualifiers.uefaPaths[p.id]) &&
    intercontinentalKeys.every(k => qualifiers.intercontinentalKeys[k.id]);

  const handleContinue = () => {
    if (isComplete) {
      navigate('/groups');
    }
  };

  return (
    <div className="h-full overflow-y-auto container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-2 text-gray-800 dark:text-gray-100">Fase de Clasificación</h1>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-8">Selecciona los ganadores de los repechajes para completar los grupos.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {uefaPaths.map(path => (
          <QualifierCard
            key={path.id}
            option={path}
            selectedTeamCode={qualifiers.uefaPaths[path.id]}
            onSelect={(code) => handleSelectUefa(path.id, code)}
          />
        ))}
        {intercontinentalKeys.map(key => (
          <QualifierCard
            key={key.id}
            option={key}
            selectedTeamCode={qualifiers.intercontinentalKeys[key.id]}
            onSelect={(code) => handleSelectIntercontinental(key.id, code)}
          />
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <button
          onClick={handleContinue}
          disabled={!isComplete}
          className={`
            px-8 py-3 rounded-full font-bold text-lg shadow-lg transition-all transform
            ${isComplete 
              ? 'bg-green-600 text-white hover:bg-green-700 hover:scale-105 dark:bg-green-700 dark:hover:bg-green-600' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'}
          `}
        >
          Continuar a Fase de Grupos
        </button>
      </div>
    </div>
  );
};
