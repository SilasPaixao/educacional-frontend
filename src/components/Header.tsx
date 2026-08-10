import React from 'react';
import { Search, Home, Lock } from 'lucide-react';

interface HeaderProps {
  onGoHome: () => void;
  onOpenConsult: () => void;
  onOpenDirectorLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onGoHome,
  onOpenConsult,
  onOpenDirectorLogin,
}) => {
  return (
    <header className="bg-white/50 backdrop-blur-md border-b border-white/60 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & City Title */}
          <button
            onClick={onGoHome}
            className="flex items-center space-x-3 text-left focus:outline-none group hover:opacity-95 transition-opacity"
          >
            <div className="w-12 h-12 bg-white rounded-2xl p-1.5 flex items-center justify-center shadow-md border border-indigo-100 group-hover:scale-105 transition-transform shrink-0">
              <img
                src="https://i.postimg.cc/G2nbJMXD/logo.png"
                alt="Logo Prefeitura de Serrinha"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50/90 px-2.5 py-0.5 rounded-full border border-indigo-200/60 shadow-2xs">
                  Serrinha - BA
                </span>
                <span className="text-xs text-indigo-600 font-semibold">Rede Municipal de Ensino</span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-indigo-950 flex items-center gap-2">
                Secretaria Municipal de Educação
              </h1>
            </div>
          </button>

          {/* Header Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3 w-full md:w-auto justify-end">
            <button
              onClick={onGoHome}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-white/70 hover:bg-white/95 text-indigo-900 border border-indigo-100/90 text-sm font-semibold shadow-sm transition-all"
            >
              <Home className="w-4 h-4 text-indigo-600" />
              <span>Início</span>
            </button>

            <button
              onClick={onOpenConsult}
              className="inline-flex items-center space-x-2 px-5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              <Search className="w-4 h-4 text-white" />
              <span>Consultar Solicitação</span>
            </button>

            <button
              onClick={onOpenDirectorLogin}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              title="Acesso para Diretores e Administradores"
            >
              <Lock className="w-3.5 h-3.5 text-amber-300" />
              <span>Acesso Restrito</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
