import React from 'react';
import { X, Trophy, ListOrdered, GitBranch, ArrowRight, Dices, Eraser, Share2, Coffee, LayoutGrid } from 'lucide-react';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const mainFlow = [
    {
      icon: <ListOrdered className="text-blue-500" size={24} />,
      title: "1. Clasificación",
      description: "Define los cupos de repechaje para completar los 48 equipos."
    },
    {
      icon: <GitBranch className="text-green-500" size={24} />,
      title: "2. Fase de Grupos",
      description: "Simula partidos manual o aleatoriamente. Las tablas se actualizan solas."
    },
    {
      icon: <Trophy className="text-yellow-500" size={24} />,
      title: "3. Fase Eliminatoria",
      description: "Avanza por el cuadro final hasta consagrar al Campeón 2026."
    }
  ];

  const tools = [
    {
      icon: <Dices className="text-purple-500" size={20} />,
      title: "Aleatoriedad",
      description: "Usa el dado general para simular todo el torneo o el dado por partido para sorpresas."
    },
    {
      icon: <Share2 className="text-indigo-500" size={20} />,
      title: "Guardar y Compartir",
      description: "¡Todo se guarda en la URL! Copia el enlace para guardar tu progreso o compartirlo."
    },
    {
      icon: <Eraser className="text-red-500" size={20} />,
      title: "Gestión",
      description: "Usa la goma de borrar para reiniciar todo el torneo desde cero."
    },
    {
      icon: <Coffee className="text-orange-500" size={20} />,
      title: "Soporte",
      description: "Si te gusta el proyecto, puedes invitarme un cafecito desde el pie de página."
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh] border border-gray-200 dark:border-gray-700">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white shrink-0 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <X size={20} />
          </button>
          <h2 className="text-2xl font-bold mb-1">¡Bienvenido al Prode 2026!</h2>
          <p className="text-blue-100 text-sm">Tu simulador interactivo del próximo mundial.</p>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column: Main Flow */}
            <div>
              <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                Flujo del Torneo
              </h3>
              <div className="space-y-4">
                {mainFlow.map((step, index) => (
                  <div key={index} className="flex items-start gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700/50">
                    <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shrink-0 shadow-sm">
                      {step.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-0.5">{step.title}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Tools & Tips */}
            <div>
              <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                Herramientas Útiles
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {tools.map((tool, index) => (
                  <div key={index} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-md shrink-0 text-gray-600 dark:text-gray-300">
                      {tool.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm mb-0.5">{tool.title}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="group flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 active:scale-95"
          >
            Comenzar a Simular
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </div>
  );
};
