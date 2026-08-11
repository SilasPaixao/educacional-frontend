import React, { useState, useEffect } from 'react';
import { ModalityType } from '../types';
import { Baby, Search, ArrowRight, CheckCircle2, ShieldAlert, Bell, Instagram, Sparkles, HeartHandshake, Users, Lock } from 'lucide-react';
import { fetchAnnouncement, fetchEnrollmentStatus } from '../services/api';

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
  const [enrollmentLocked, setEnrollmentLocked] = useState(false);
  const [enrollmentLockedMsg, setEnrollmentLockedMsg] = useState(
    'Período de Matrículas encerrado (para mais informações entre em contato com a escola ou a Secretaria de Educação. Obrigado!)'
  );
  const [showClosedModal, setShowClosedModal] = useState(false);

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

    fetchEnrollmentStatus()
      .then((data) => {
        setEnrollmentLocked(!!data.locked);
        if (data.message) setEnrollmentLockedMsg(data.message);
      })
      .catch(() => {
        // Se a checagem falhar, não bloqueia a home; o backend ainda valida no envio do formulário
      });
  }, []);

  const handleModalitySelect = (modality: ModalityType) => {
    if (enrollmentLocked) {
      setShowClosedModal(true);
      return;
    }
    onSelectModality(modality);
  };

  const handleConsultSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (protocolInput.trim()) {
      onSearchProtocol(protocolInput.trim());
    }
  };

  // Sistema de matrícula online focado, no momento, apenas na Educação Infantil.
  const infantil = {
    type: 'educacao-infantil' as ModalityType,
    grades: ['Berçário', 'Maternal I', 'Maternal II', 'Pré I', 'Pré II'],
    ageRange: 'Crianças de 0 a 5 anos',
  };

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
            <span>Inscrição 100% Online e Gratuita &bull; Ano Letivo {new Date().getFullYear()}</span>
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

      {/* Modality Spotlight Section — foco exclusivo em Educação Infantil */}
      <div>
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-pink-700 bg-pink-100 px-3.5 py-1.5 rounded-full border border-pink-200">
            <Sparkles className="w-3.5 h-3.5" />
            Inscrições online
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-indigo-950 mt-4">
            Matrícula para Educação Infantil
          </h3>
          <p className="text-indigo-700/80 text-sm mt-2 leading-relaxed">
            No momento, as inscrições on-line da Rede Municipal de Ensino estão disponíveis
            para a Educação Infantil. Preencha o pré-cadastro abaixo para solicitar a vaga.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="relative overflow-hidden bg-white/50 backdrop-blur-xl border border-white/70 rounded-[2rem] shadow-2xl">
            {/* Decorative ambient glows to keep the single card visually rich */}
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-pink-300/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-amber-300/25 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-5">
              {/* Left: main content */}
              <div className="md:col-span-3 p-8 sm:p-10 flex flex-col">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center shadow-md shrink-0">
                    <Baby className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-pink-100/80 text-pink-800 border-pink-200/60 inline-block mb-1.5">
                      {infantil.ageRange}
                    </span>
                    <h4 className="text-2xl font-black text-indigo-950 leading-tight">
                      Educação Infantil
                    </h4>
                  </div>
                </div>

                <p className="text-slate-600 text-sm sm:text-[15px] leading-relaxed mb-6">
                  Matrícula para creches e pré-escolas municipais, com acompanhamento
                  pedagógico dedicado ao desenvolvimento e cuidado na primeira infância.
                </p>

                {/* Grade chips */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {infantil.grades.map((g) => (
                    <span
                      key={g}
                      className="px-3.5 py-1.5 rounded-full bg-white border border-pink-200 text-xs font-bold text-pink-700 shadow-sm"
                    >
                      {g}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => handleModalitySelect(infantil.type)}
                  className={`w-full sm:w-auto self-start py-3.5 px-8 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] ${
                    enrollmentLocked
                      ? 'bg-slate-400 hover:bg-slate-500 text-white'
                      : 'bg-pink-600 hover:bg-pink-700 text-white hover:shadow-xl'
                  }`}
                >
                  {enrollmentLocked ? (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Matrículas Encerradas</span>
                    </>
                  ) : (
                    <>
                      <span>Realizar Inscrição</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Right: supporting highlights panel */}
              <div className="md:col-span-2 bg-indigo-950/95 text-white p-8 sm:p-10 flex flex-col justify-center gap-6">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/15">
                    <HeartHandshake className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Cuidado e acolhimento</p>
                    <p className="text-[11px] text-indigo-200/80 mt-0.5 leading-relaxed">
                      Equipe pedagógica preparada para o desenvolvimento infantil.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/15">
                    <Users className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Rede municipal completa</p>
                    <p className="text-[11px] text-indigo-200/80 mt-0.5 leading-relaxed">
                      Creches e pré-escolas em toda a cidade de Serrinha.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/15">
                    <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Processo 100% on-line</p>
                    <p className="text-[11px] text-indigo-200/80 mt-0.5 leading-relaxed">
                      Protocolo de acompanhamento gerado na hora.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
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

      {/* Modal: Período de Matrículas Encerrado */}
      {showClosedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-950/40 backdrop-blur-md animate-fade-in">
          <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 w-full max-w-md overflow-hidden">
            <div className="p-6 sm:p-8 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center shadow-sm mb-4">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-indigo-950 mb-2">Matrículas Encerradas</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {enrollmentLockedMsg}
              </p>
              <button
                onClick={() => setShowClosedModal(false)}
                className="mt-6 w-full py-3 px-6 rounded-xl bg-indigo-900 hover:bg-indigo-950 text-white font-bold text-sm transition-colors"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
