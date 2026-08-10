import React, { useState, useEffect } from 'react';
import { ModalityType, MODALITY_LABELS } from '../types';
import { Baby, GraduationCap, School, BookOpen, Search, ArrowRight, CheckCircle2, ShieldAlert, Bell, Instagram } from 'lucide-react';
import { fetchAnnouncement } from '../services/api';

interface HomeSectionsProps {
  onSelectModality: (modality: ModalityType) => void;
  onSearchProtocol: (protocol: string) => void;
}

export const HomeSections: React.FC<HomeSectionsProps> = ({
  onSelectModality,
  onSearchProtocol,
}) => {
  const [protocolInput, setProtocolInput] = useState('');
  const [announcement, setAnnouncement] = useState<{ title: string; content: string } | null>({
    title: 'Aviso Importante sobre Pré-Matrículas',
    content: 'As inscrições normalmente se iniciam nas datas próximas ao fim do ano letivo, fique atento às nossas redes sociais para mais informações!'
  });

  useEffect(() => {
    fetchAnnouncement()
      .then((data) => {
        if (data && data.title) {
          setAnnouncement(data);
        }
      })
      .catch(() => {
        // Fallback default announcement retained
      });
  }, []);

  const handleConsultSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (protocolInput.trim()) {
      onSearchProtocol(protocolInput.trim());
    }
  };

  const sections: {
    type: ModalityType;
    title: string;
    subtitle: string;
    badge: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    iconBg: string;
    badgeBg: string;
    buttonBg: string;
    accentHover: string;
  }[] = [
    {
      type: 'educacao-infantil',
      title: 'Educação Infantil',
      subtitle: 'Berçário, Maternal I e II, Pré I e II',
      badge: 'Crianças de 0 a 5 anos',
      description: 'Matrícula para creches e pré-escolas municipais. Acompanhamento pedagógico e desenvolvimento na primeira infância.',
      icon: Baby,
      iconBg: 'bg-pink-100 text-pink-600',
      badgeBg: 'bg-pink-100/80 text-pink-800 border-pink-200/60',
      buttonBg: 'bg-pink-600 hover:bg-pink-700 text-white',
      accentHover: 'hover:bg-pink-50/50 hover:border-pink-200',
    },
    {
      type: 'ensino-fundamental',
      title: 'Ensino Fundamental',
      subtitle: '1º ao 9º Ano (Anos Iniciais e Finais)',
      badge: 'A partir dos 6 anos',
      description: 'Inscrições para o ensino fundamental regular. Formação integral com matriz curricular completa da rede municipal.',
      icon: School,
      iconBg: 'bg-blue-100 text-blue-600',
      badgeBg: 'bg-blue-100/80 text-blue-800 border-blue-200/60',
      buttonBg: 'bg-blue-600 hover:bg-blue-700 text-white',
      accentHover: 'hover:bg-blue-50/50 hover:border-blue-200',
    },
    {
      type: 'ensino-medio',
      title: 'Ensino Médio',
      subtitle: '1ª, 2ª e 3ª Série do Ensino Médio',
      badge: 'Ensino Médio Regular',
      description: 'Preparação para o ENEM, vestibulares e mercado de trabalho em instituições parceiras e municipais.',
      icon: GraduationCap,
      iconBg: 'bg-teal-100 text-teal-600',
      badgeBg: 'bg-teal-100/80 text-teal-800 border-teal-200/60',
      buttonBg: 'bg-teal-600 hover:bg-teal-700 text-white',
      accentHover: 'hover:bg-teal-50/50 hover:border-teal-200',
    },
    {
      type: 'eja',
      title: 'EJA (Jovens e Adultos)',
      subtitle: 'EJA Fundamental (15+ anos) e EJA Médio (18+ anos)',
      badge: 'Jovens, Adultos e Idosos',
      description: 'Oportunidade para concluir os estudos no seu próprio ritmo com horários flexíveis e suporte pedagógico especializado.',
      icon: BookOpen,
      iconBg: 'bg-orange-100 text-orange-600',
      badgeBg: 'bg-orange-100/80 text-orange-900 border-orange-200/60',
      buttonBg: 'bg-orange-600 hover:bg-orange-700 text-white',
      accentHover: 'hover:bg-orange-50/50 hover:border-orange-200',
    },
  ];

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Banner Section - Frosted Glass Card with educacional.jpg blurred background */}
      <div className="relative overflow-hidden rounded-3xl bg-indigo-950 text-white p-8 sm:p-12 shadow-2xl border border-white/30 group">
        {/* Background Image with UX Blur Effect & Dark Overlay for optimal readability */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="https://i.postimg.cc/FKL9StVL/educacional.jpg"
            alt="Educação Serrinha"
            className="w-full h-full object-cover scale-105 filter blur-[1.5px] brightness-[0.7] contrast-[1.05] group-hover:scale-110 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/85 via-indigo-950/70 to-blue-950/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/90 via-transparent to-transparent" />
        </div>

        {/* Ambient background glows */}
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none z-0"></div>
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none z-0"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-white/15 backdrop-blur-md px-4 py-1.5 rounded-full text-indigo-100 text-xs font-bold mb-4 border border-white/30 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Inscrição 100% Online e Gratuita &bull; Ano Letivo 2026</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-3 leading-tight drop-shadow-md">
            Matrícula Escolar Online <br className="hidden sm:inline" />
            <span className="text-amber-300">Prefeitura de Serrinha - BA</span>
          </h2>
          <p className="text-indigo-100/90 text-sm sm:text-base leading-relaxed mb-8 max-w-2xl font-medium">
            Selecione a modalidade de ensino do estudante para realizar o pré-cadastro com rapidez, segurança e acompanhamento em tempo real.
          </p>

          {/* Quick Protocol Consult Box */}
          <div className="bg-white/15 backdrop-blur-xl p-5 sm:p-6 rounded-2xl border border-white/30 max-w-xl shadow-2xl">
            <label htmlFor="protocol-input-hero" className="block text-xs font-extrabold text-amber-200 mb-2 uppercase tracking-wider">
              Já fez a inscrição? Consulte o status com seu protocolo:
            </label>
            <form onSubmit={handleConsultSubmit} className="flex flex-col sm:flex-row gap-2.5">
              <input
                id="protocol-input-hero"
                type="text"
                placeholder="Ex: SER-2026-X8F9A"
                value={protocolInput}
                onChange={(e) => setProtocolInput(e.target.value)}
                className="flex-1 px-4 py-3.5 rounded-xl bg-white/20 border border-white/35 text-white placeholder:text-indigo-100/70 text-sm font-mono font-bold focus:bg-white/30 focus:ring-2 focus:ring-amber-300 outline-none uppercase transition-all shadow-inner"
              />
              <button
                type="submit"
                className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-indigo-950 font-black rounded-xl text-sm transition-all flex items-center justify-center space-x-2 shrink-0 shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                <Search className="w-4 h-4 text-indigo-950 stroke-[3]" />
                <span>Consultar</span>
              </button>
            </form>
          </div>
        </div>

        {/* Decorative branding floating badge */}
        <div className="hidden lg:flex absolute right-8 top-1/2 -translate-y-1/2 z-10 flex-col items-center justify-center p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl text-center max-w-xs shadow-xl">
          <div className="w-16 h-16 bg-white rounded-2xl p-2 mb-3 shadow-md flex items-center justify-center">
            <img
              src="https://i.postimg.cc/G2nbJMXD/logo.png"
              alt="Logo Serrinha"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="text-xs font-bold text-white uppercase tracking-wider">Rede Municipal de Ensino</span>
          <span className="text-[11px] text-amber-300 font-semibold mt-1">Garantindo o Futuro das Nossas Crianças</span>
        </div>
      </div>

      {/* Modality Section Header */}
      <div>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <h3 className="text-2xl font-extrabold text-indigo-950">
              Escolha a Modalidade de Ensino
            </h3>
            <p className="text-indigo-700/80 text-sm mt-1">
              Clique na modalidade do aluno para preencher o formulário de solicitação de vaga
            </p>
          </div>
        </div>

        {/* 4 Modalities Grid with Frosted Glass styling */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((sec) => {
            const IconComponent = sec.icon;
            return (
              <div
                key={sec.type}
                className={`bg-white/40 backdrop-blur-lg border border-white/60 p-6 sm:p-7 rounded-2xl shadow-xl transition-all duration-300 flex flex-col justify-between group ${sec.accentHover}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl ${sec.iconBg} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full border ${sec.badgeBg}`}
                    >
                      {sec.badge}
                    </span>
                  </div>

                  <h4 className="text-xl font-bold text-indigo-950 mb-1 leading-snug">
                    {sec.title}
                  </h4>
                  <p className="text-xs font-semibold text-indigo-700/90 mb-3">
                    {sec.subtitle}
                  </p>

                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">
                    {sec.description}
                  </p>
                </div>

                <button
                  onClick={() => onSelectModality(sec.type)}
                  className={`w-full py-3 px-5 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-md ${sec.buttonBg} group hover:shadow-lg`}
                >
                  <span>Realizar Inscrição</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* General Information Card Section - Frosted Glass Card with educacional.jpg blurred background */}
      <div className="relative overflow-hidden rounded-3xl bg-indigo-950 text-white p-6 sm:p-8 border border-white/30 shadow-2xl space-y-4 group">
        {/* Background Image with UX Blur Effect & Dark Overlay for optimal readability */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="https://i.postimg.cc/FKL9StVL/educacional.jpg"
            alt="Educação Serrinha"
            className="w-full h-full object-cover scale-105 filter blur-[1.5px] brightness-[0.38] contrast-[1.1] group-hover:scale-110 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/90 via-indigo-950/75 to-blue-950/60" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/20 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-indigo-950 flex items-center justify-center shadow-lg shrink-0">
              <Bell className="w-5 h-5 animate-pulse text-indigo-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 bg-white/10 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-amber-300/30">
                Informações Gerais & Comunicados
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white mt-1 drop-shadow-sm">
                {announcement?.title || 'Aviso Importante sobre Pré-Matrículas'}
              </h3>
            </div>
          </div>
          <a
            href="https://www.instagram.com/semedsha/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-bold shadow-md transition-all shrink-0 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Instagram className="w-4 h-4 text-white" />
            <span>@semedsha no Instagram</span>
          </a>
        </div>

        <div className="relative z-10 bg-white/15 backdrop-blur-md p-5 rounded-2xl border border-white/25 shadow-inner">
          <p className="text-indigo-50 text-sm sm:text-base font-medium leading-relaxed drop-shadow-xs">
            {announcement?.content || 'As inscrições normalmente se iniciam nas datas próximas ao fim do ano letivo, fique atento às nossas redes sociais para mais informações!'}
          </p>
        </div>
      </div>

      {/* Instructions & Help Banner - Frosted Glass */}
      <div className="bg-white/30 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/50 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-indigo-100/80 text-indigo-800 flex items-center justify-center shrink-0 border border-indigo-200/50 shadow-sm">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-indigo-950 mb-1">
            Informações Importantes sobre o Cadastro
          </h4>
          <p className="text-xs text-indigo-900/80 leading-relaxed">
            Tenha em mãos os documentos do aluno (RG, CPF, Comprovante de Residência e Histórico Escolar). Ao término do preenchimento, um <strong>número de protocolo</strong> será gerado e enviado para o seu e-mail para acompanhar o resultado da análise pela direção da escola.
          </p>
        </div>
      </div>
    </div>
  );
};
