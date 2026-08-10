import React from 'react';
import { Lock, Mail, Phone, MapPin, Clock, Instagram } from 'lucide-react';

interface FooterProps {
  onOpenDirectorLogin: () => void;
  onOpenAdminAccess: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenDirectorLogin,
}) => {
  return (
    <footer className="bg-white/30 backdrop-blur-md text-indigo-900/90 text-sm border-t border-white/40 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Municipal Info */}
          <div>
            <div className="flex items-center space-x-3 text-indigo-950 font-bold text-base mb-3">
              <div className="w-10 h-10 bg-white rounded-xl p-1 shadow-sm border border-indigo-100 flex items-center justify-center shrink-0">
                <img
                  src="https://i.postimg.cc/G2nbJMXD/logo.png"
                  alt="Prefeitura de Serrinha"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-extrabold text-indigo-950">Secretaria Municipal de Educação</span>
                <span className="text-[11px] text-indigo-600 font-semibold">Prefeitura de Serrinha - BA</span>
              </div>
            </div>
            <p className="text-indigo-900/80 text-xs leading-relaxed mb-3 font-medium">
              Sistema oficial de cadastro e pré-matrícula escolar online da Prefeitura Municipal de Serrinha - Bahia.
            </p>
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-indigo-900 bg-indigo-50/90 px-3 py-1.5 rounded-full border border-indigo-200/60 shadow-2xs">
              <span>💙 O trabalho continua, a mudança acontece!</span>
            </div>
          </div>

          {/* Contact Details & Office Hours */}
          <div>
            <h4 className="text-indigo-950 font-bold mb-3 text-xs uppercase tracking-wider">
              Atendimento e Contato
            </h4>
            <ul className="space-y-2.5 text-xs text-indigo-900/90 font-medium">
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="font-semibold">(75) 3261-8313</span>
              </li>
              <li className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Atendimento: 08h às 12h - 14h às 17h</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>Av. Mário Andreazza - Vaquejada, Serrinha - BA, 48700-000</span>
              </li>
              <li className="flex items-center space-x-2 pt-1">
                <Instagram className="w-4 h-4 text-pink-600 shrink-0" />
                <a
                  href="https://www.instagram.com/semedsha/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-700 hover:text-indigo-900 font-bold underline decoration-indigo-300 underline-offset-2 transition-colors flex items-center gap-1"
                >
                  @semedsha (Siga nosso Instagram)
                </a>
              </li>
            </ul>
          </div>

          {/* Information Notice & Social Link */}
          <div>
            <h4 className="text-indigo-950 font-bold mb-3 text-xs uppercase tracking-wider">
              Orientações
            </h4>
            <p className="text-xs text-indigo-900/80 leading-relaxed font-medium mb-3">
              O preenchimento do formulário garante a pré-matrícula sujeita à homologação da direção da escola e disponibilidade de vagas de acordo com os critérios da rede municipal.
            </p>
            <a
              href="https://www.instagram.com/semedsha/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-xs shadow-md transition-all hover:shadow-lg"
            >
              <Instagram className="w-4 h-4 text-white" />
              <span>Acompanhe as Redes Sociais</span>
            </a>
          </div>
        </div>

        <div className="pt-6 border-t border-indigo-200/50 flex flex-col sm:flex-row items-center justify-between text-xs text-indigo-800/80 gap-4">
          <p>&copy; {new Date().getFullYear()} Prefeitura Municipal de Serrinha - BA. Todos os direitos reservados.</p>

          {/* Discreet Access Link for School Directors & Admins */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onOpenDirectorLogin}
              className="inline-flex items-center space-x-1.5 bg-white/60 hover:bg-white text-indigo-900 border border-white/80 rounded-full px-3.5 py-1 text-[11px] font-semibold transition-all shadow-xs"
              title="Acesso restrito para Diretores Escolares e Administradores do Sistema"
            >
              <Lock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Acesso Restrito (Diretores / Admins)</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
