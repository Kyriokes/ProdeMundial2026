import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { QualifiersPage } from './pages/QualifiersPage';
import { GroupsPage } from './pages/GroupsPage';
import { KnockoutPage } from './pages/KnockoutPage';
import { RouteSync } from './components/RouteSync';
import { Share2, Moon, Sun } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  const currentStage = pathname.split('/')[1];
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
    alert('Enlace copiado al portapapeles!');
  };

  return (
    <div className="h-screen bg-gray-100 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300 flex flex-col overflow-hidden">
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-300 flex-none">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">⚽</span>
            <span className="font-bold text-xl tracking-tight text-blue-900 dark:text-blue-400">Prode Mundial 2026</span>
          </div>
          
          <div className="hidden md:flex space-x-1">
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

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8 transition-colors duration-300 flex-none z-10 relative">
        <div className="container mx-auto px-4 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>Prode Mundial 2026 - Simulador No Oficial</p>
          <p className="mt-2">Desarrollado con React, TypeScript y Zustand.</p>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <RouteSync />
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/qualifiers" replace />} />
          <Route path="/qualifiers/*" element={<QualifiersPage />} />
          <Route path="/groups/*" element={<GroupsPage />} />
          <Route path="/knockout/*" element={<KnockoutPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
