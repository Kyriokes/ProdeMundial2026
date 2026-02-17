import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { QualifiersPage } from './pages/QualifiersPage';
import { GroupsPage } from './pages/GroupsPage';
import { KnockoutPage } from './pages/KnockoutPage';
import { StatsPage } from './pages/StatsPage';
import { RouteSync } from './components/RouteSync';
import { Share2, Moon, Sun, Dices, Eraser, BarChart2, Trophy } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { BallIcon } from './components/BallIcon';
import { KofiButton } from './components/KofiButton';
import { useTournamentStore } from './store/useTournamentStore';
import { randomizeTournament } from './utils/randomizer';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const currentStage = pathname.split('/')[1];
  const { setFullState } = useTournamentStore();

  const [isDark, setIsDark] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Enlace copiado al portapapeles!');
  };

  const handleRandomize = () => {
    toast.custom((t) => (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-w-sm w-full">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 shrink-0">
            <Dices size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
              ¿Randomizar torneo?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">
              Se generarán resultados aleatorios y se perderán los cambios actuales.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => toast.dismiss(t)}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  toast.dismiss(t);
                  const newState = randomizeTournament();
                  setFullState(newState);
                  navigate('/knockout');
                  toast.success('¡Torneo randomizado con éxito!');
                }}
                className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-sm"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      </div>
    ), {
      duration: 5000,
    });
  };

  const handleReset = () => {
    toast.custom((t) => (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-w-sm w-full">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400 shrink-0">
            <Eraser size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
              ¿Borrar todo?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">
              Se eliminarán todos los resultados ingresados y se reiniciará el torneo.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => toast.dismiss(t)}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  toast.dismiss(t);
                  // Reload the page to clear the state and start fresh
                  window.location.href = '/';
                  toast.success('¡Torneo reiniciado!');
                }}
                className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors shadow-sm"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      </div>
    ), {
      duration: 5000,
    });
  };

  return (
    <div className="h-screen bg-gray-100 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300 flex flex-col overflow-hidden">
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-300 flex-none">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BallIcon size={28} className="text-blue-900 dark:text-blue-400" />
            <span className="font-bold text-xl tracking-tight text-blue-900 dark:text-blue-400">Prode Mundial 2026</span>
          </div>
          
          <div className="hidden md:flex space-x-1 items-center">
            <Link 
              to="/qualifiers" 
              className={`px-4 py-2 rounded-md transition-colors ${currentStage === 'qualifiers' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
            >
              1. Clasificación
            </Link>
            <span className="self-center text-gray-300 dark:text-gray-600">/</span>
            <Link 
              to="/groups" 
              className={`px-4 py-2 rounded-md transition-colors ${currentStage === 'groups' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
            >
              2. Grupos
            </Link>
            <span className="self-center text-gray-300 dark:text-gray-600">/</span>
            <Link 
              to="/knockout" 
              className={`px-4 py-2 rounded-md transition-colors ${currentStage === 'knockout' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
            >
              3. Eliminatorias
            </Link>
            <span className="self-center text-gray-300 dark:text-gray-600">/</span>
            <Link 
              to="/stats" 
              className={`px-4 py-2 rounded-md transition-colors ${currentStage === 'stats' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
            >
              <span className="flex items-center gap-1.5">
                <Trophy size={16} />
                Tabla
              </span>
            </Link>
            <button
                onClick={handleRandomize}
                className="ml-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                title="Randomizar Todo"
            >
                <Dices size={20} />
            </button>
            <button
                onClick={handleReset}
                className="ml-1 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                title="Borrar Todo"
            >
                <Eraser size={20} />
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={handleShare}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Share2 size={18} />
              <span className="hidden sm:inline">Compartir</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 relative z-0 flex flex-col overflow-y-auto">
        {children}
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 transition-colors duration-300 flex-none z-10 relative">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500 dark:text-gray-400 text-sm">
          <div className="text-center md:text-left">
            <span className="font-medium">Prode Mundial 2026</span> - Simulador No Oficial
            <span className="hidden md:inline mx-2">•</span>
            <span className="block md:inline">Este sitio no está afiliado a la FIFA. Es una herramienta de fans para fans.</span>
          </div>
          <KofiButton color="#72a4f2" text="Support me on Ko-fi" kofiId="R5R21UFJBX" />
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <RouteSync />
      <Toaster richColors position="top-center" />
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/qualifiers" replace />} />
          <Route path="/qualifiers/*" element={<QualifiersPage />} />
          <Route path="/groups/*" element={<GroupsPage />} />
          <Route path="/knockout/*" element={<KnockoutPage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
