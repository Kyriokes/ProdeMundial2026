import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { QualifiersPage } from './pages/QualifiersPage';
import { GroupsPage } from './pages/GroupsPage';
import { KnockoutPage } from './pages/KnockoutPage';
import { RouteSync } from './components/RouteSync';
import { Share2 } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  const currentStage = pathname.split('/')[1];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Enlace copiado al portapapeles!');
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">⚽</span>
            <span className="font-bold text-xl tracking-tight text-blue-900">Prode Mundial 2026</span>
          </div>
          
          <div className="hidden md:flex space-x-1">
            <Link 
              to="/qualifiers" 
              className={`px-4 py-2 rounded-md transition-colors ${currentStage === 'qualifiers' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
            >
              1. Clasificación
            </Link>
            <span className="self-center text-gray-300">/</span>
            <Link 
              to="/groups" 
              className={`px-4 py-2 rounded-md transition-colors ${currentStage === 'groups' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
            >
              2. Grupos
            </Link>
            <span className="self-center text-gray-300">/</span>
            <Link 
              to="/knockout" 
              className={`px-4 py-2 rounded-md transition-colors ${currentStage === 'knockout' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
            >
              3. Eliminatorias
            </Link>
          </div>

          <button 
            onClick={handleShare}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Share2 size={18} />
            <span className="hidden sm:inline">Compartir</span>
          </button>
        </div>
      </nav>

      <main>
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
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
