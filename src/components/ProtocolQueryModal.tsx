import React, { useState, useEffect } from 'react';
import { checkProtocolStatus } from '../services/api';
import { Search, X, CheckCircle2, XCircle, Clock, Loader2, AlertCircle, School, Calendar } from 'lucide-react';
import { formatDateBR } from '../utils/formatters';

interface ProtocolQueryModalProps {
  initialProtocol?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ProtocolQueryModal: React.FC<ProtocolQueryModalProps> = ({
  initialProtocol = '',
  isOpen,
  onClose,
}) => {
  const [protocol, setProtocol] = useState(initialProtocol);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    protocol: string;
    studentName: string;
    schoolName: string;
    status: 'Pendente' | 'Cadastrado' | 'Rejeitado';
    rejectionReason?: string;
    createdAt: string;
    updatedAt: string;
  } | null>(null);

  useEffect(() => {
    if (initialProtocol) {
      setProtocol(initialProtocol);
      handleSearch(initialProtocol);
    }
  }, [initialProtocol]);

  const handleSearch = async (codeToSearch?: string) => {
    const code = codeToSearch || protocol;
    if (!code.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await checkProtocolStatus(code.trim());
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Protocolo não encontrado no sistema.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-950/40 backdrop-blur-md animate-fade-in">
      <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-indigo-900/90 text-white p-5 flex items-center justify-between border-b border-white/20">
          <div className="flex items-center space-x-2.5">
            <Search className="w-5 h-5 text-amber-300" />
            <h3 className="font-extrabold text-base text-white">Consultar Solicitação de Matrícula</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-indigo-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Body */}
        <div className="p-6 space-y-6">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Digite o número do protocolo (ex: SER-2026-X8F9A)"
              value={protocol}
              onChange={(e) => setProtocol(e.target.value)}
              className="flex-1 px-4 py-3 bg-white/80 backdrop-blur-sm border border-indigo-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-600 outline-none uppercase text-indigo-950 placeholder:text-indigo-900/40 font-semibold"
            />
            <button
              type="submit"
              disabled={loading || !protocol.trim()}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-200 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-md"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Consultar</span>
            </button>
          </form>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Aviso:</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Result Card Rendering */}
          {result && (
            <div className="space-y-4 pt-2">
              {/* Approved Status */}
              {result.status === 'Cadastrado' && (
                <div className="p-5 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-emerald-950 space-y-3">
                  <div className="flex items-center space-x-2 text-emerald-700">
                    <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-600" />
                    <h4 className="font-extrabold text-lg">Aluno cadastrado com sucesso!</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed font-medium">
                    A solicitação de matrícula de <strong>{result.studentName}</strong> foi homologada pela direção da escola.
                  </p>
                  <div className="pt-2 border-t border-emerald-200/80 text-xs text-emerald-900 space-y-1">
                    <div className="flex items-center space-x-1.5">
                      <School className="w-4 h-4 text-emerald-600" />
                      <span>Escola: <strong>{result.schoolName}</strong></span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      <span>Atualizado em: {formatDateBR(result.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Rejected Status */}
              {result.status === 'Rejeitado' && (
                <div className="p-5 bg-rose-50 border-2 border-rose-300 rounded-2xl text-rose-950 space-y-3">
                  <div className="flex items-center space-x-2 text-rose-700">
                    <XCircle className="w-6 h-6 shrink-0 text-rose-600" />
                    <h4 className="font-extrabold text-lg">Cadastro Não Homologado</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-rose-800 leading-relaxed font-medium">
                    Infelizmente este cadastro não foi homologado, por favor entre em contato com a respectiva escola para mais informações.
                  </p>
                  {result.rejectionReason && (
                    <div className="p-3 bg-white/80 rounded-xl border border-rose-200 text-xs text-rose-900">
                      <strong className="block text-rose-950 mb-0.5">Motivo da não homologação:</strong>
                      <span>{result.rejectionReason}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-rose-200/80 text-xs text-rose-900 space-y-1">
                    <div className="flex items-center space-x-1.5">
                      <School className="w-4 h-4 text-rose-600" />
                      <span>Escola: <strong>{result.schoolName}</strong></span>
                    </div>
                  </div>
                </div>
              )}

              {/* Pending Status */}
              {result.status === 'Pendente' && (
                <div className="p-5 bg-amber-50 border-2 border-amber-300 rounded-2xl text-amber-950 space-y-3">
                  <div className="flex items-center space-x-2 text-amber-800">
                    <Clock className="w-6 h-6 shrink-0 text-amber-600 animate-pulse" />
                    <h4 className="font-extrabold text-lg">Solicitação ainda pendente!</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
                    Solicitação em análise pela equipe escolar. Assim que houver uma resposta da direção da escola, esta aparecerá aqui!
                  </p>
                  <div className="pt-2 border-t border-amber-200/80 text-xs text-amber-900 space-y-1">
                    <div className="flex items-center space-x-1.5">
                      <School className="w-4 h-4 text-amber-700" />
                      <span>Escola solicitada: <strong>{result.schoolName}</strong></span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-4 h-4 text-amber-700" />
                      <span>Data do envio: {formatDateBR(result.createdAt)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl text-xs transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
