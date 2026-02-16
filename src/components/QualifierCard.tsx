import React from 'react';
import { QualifierOption } from '../types';
import { countries } from '../data/countries';
import { FlagIcon } from './FlagIcon';
import clsx from 'clsx';

interface QualifierCardProps {
  option: QualifierOption;
  selectedTeamCode?: string;
  onSelect: (teamCode: string) => void;
}

export const QualifierCard: React.FC<QualifierCardProps> = ({ option, selectedTeamCode, onSelect }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">{option.name}</h3>
      <div className="space-y-2">
        {option.teams.map((teamCode) => {
          const country = countries[teamCode];
          const isSelected = selectedTeamCode === teamCode;
          
          return (
            <button
              key={teamCode}
              onClick={() => onSelect(teamCode)}
              className={clsx(
                "w-full flex items-center p-3 rounded-md transition-all duration-200 border",
                isSelected 
                  ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500" 
                  : "bg-gray-50 border-gray-200 hover:bg-gray-100"
              )}
            >
              <div className="flex items-center space-x-3 flex-1">
                <FlagIcon code={country.flag} size="lg" />
                <span className={clsx("font-medium", isSelected ? "text-blue-700" : "text-gray-700")}>
                  {country.name}
                </span>
              </div>
              {isSelected && (
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
