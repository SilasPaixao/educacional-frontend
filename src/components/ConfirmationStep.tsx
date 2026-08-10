import React, { useState } from 'react';
import { StudentApplication } from '../types';
import { CheckCircle2, Copy, Search, Mail, ArrowRight, ShieldCheck, Home } from 'lucide-react';

interface ConfirmationStepProps {
  protocol: string;
  application: StudentApplication;
  onGoHome: () => void;
  onConsultNow: (protocol: string) => void;
}

export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  protocol,
  application,
  onGoHome,
  onConsultNow,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(protocol);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto pb-16">
      <div className="bg-white/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/70 overflow-hidden text-indigo-950">
        {/* Top Success Banner */}
        <div className="bg-emerald-800/90 backdrop-blur-md text-white p-8 sm:p-10 text-center border-b border-white/20">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mx-auto flex items-center justify-center mb-4 text-emerald-200 shadow-inner">
            <CheckCircle2 className="w-10 h-10 text-emerald-300" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Solicitação enviada com sucesso!
          </h2>
          <p className="text-emerald-100 text-sm max-w-lg mx-auto">
            Sua solicitação de pré-matrícula para a instituição <strong className="text-white">{application.schoolName}</strong> foi recebida e está aguardando homologação da direção escolar.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-10 space-y-8">
          {/* Protocol Card Box - Frosted */}
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border-2 border-dashed border-indigo-200 p-6 sm:p-8 text-center space-y-3 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-700">
              Seu Número de Protocolo
            </span>
            <div className="flex items-center justify-center space-x-3">
              <span className="text-3xl sm:text-4xl font-extrabold text-indigo-950 tracking-wider font-mono select-all">
                {protocol}
              </span>
              <button
                onClick={handleCopy}
                className="p-2.5 bg-indigo-100/80 hover:bg-indigo-200/80 text-indigo-900 rounded-xl transition-colors shadow-sm border border-indigo-200/50"
                title="Copiar Protocolo"
              >
                {copied ? (
                  <span className="text-xs font-bold text-emerald-700">Copiado!</span>
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs sm:text-sm text-indigo-900/80 leading-relaxed font-medium pt-2">
              Utilize o número de protocolo para consultar o status da sua solicitação.
              <br />
              <span className="text-amber-800 font-bold bg-amber-100/80 border border-amber-200/80 px-3 py-1 rounded-full inline-block mt-2 shadow-xs">
                É importante salvar este número de protocolo para futuras consultas!
              </span>
            </p>
          </div>

          {/* Email Confirmation Notice */}
          <div className="flex items-start space-x-3 p-4 bg-indigo-50/80 backdrop-blur-md rounded-2xl border border-indigo-200/60 text-indigo-950 text-xs sm:text-sm">
            <Mail className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-0.5">Confirmação enviada por e-mail!</p>
              <p className="text-indigo-900/80">
                Uma cópia dos detalhes desta inscrição e o número de protocolo foram enviados para <strong className="text-indigo-950">{application.email}</strong>.
              </p>
            </div>
          </div>

          {/* Screenshot / Highlight Graphic of Home Page Search */}
          <div className="space-y-3 pt-2">
            <p className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
              Onde consultar o resultado na Página Inicial:
            </p>
            <div className="relative rounded-2xl border border-white/20 bg-indigo-950/90 backdrop-blur-xl p-5 text-white overflow-hidden shadow-xl">
              <div className="absolute top-2 right-2 bg-amber-400 text-indigo-950 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full shadow">
                DESTAQUE NA PÁGINA INICIAL
              </div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-200 mb-2">
                <Search className="w-4 h-4 text-amber-300" />
                <span>Consultar Solicitação de Vaga</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/20">
                <span className="text-xs text-indigo-200 font-mono flex-1">Digite seu protocolo ({protocol})...</span>
                <span className="bg-amber-400 text-indigo-950 text-xs font-bold px-3 py-1 rounded-lg">Consultar</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-indigo-100">
            <button
              onClick={() => onConsultNow(protocol)}
              className="flex-1 py-3 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
            >
              <Search className="w-4 h-4" />
              <span>Consultar Status Agora</span>
            </button>

            <button
              onClick={onGoHome}
              className="py-3 px-6 bg-white/80 hover:bg-white text-indigo-950 font-bold rounded-xl text-sm transition-all flex items-center justify-center space-x-2 border border-white shadow-sm"
            >
              <Home className="w-4 h-4" />
              <span>Voltar ao Início</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
