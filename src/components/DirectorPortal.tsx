import React, { useState, useEffect } from 'react';
import { AuthSession, StudentApplication, MODALITY_LABELS } from '../types';
import {
  loginDirector,
  recoverDirectorPassword,
  updateDirectorEmail,
  fetchDirectorApplications,
  updateApplicationStatus,
} from '../services/api';
import { formatDateBR } from '../utils/formatters';
import { AdminPortal } from './AdminPortal';
import {
  Lock,
  User,
  Mail,
  School,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  FileText,
  Send,
  Loader2,
  AlertCircle,
  LogOut,
  RefreshCw,
  Search,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface DirectorPortalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DirectorPortal: React.FC<DirectorPortalProps> = ({ isOpen, onClose }) => {
  const [session, setSession] = useState<AuthSession | null>(null);

  // Login Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Recovery Modal States
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryMsg, setRecoveryMsg] = useState<string | null>(null);
  const [recoveryErr, setRecoveryErr] = useState<string | null>(null);

  // Dashboard Data
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailMsg, setEmailMsg] = useState<string | null>(null);

  // Selected App for Modal Review
  const [selectedApp, setSelectedApp] = useState<StudentApplication | null>(null);
  const [rejectReasonType, setRejectReasonType] = useState<'inconsistency' | 'no_vacancy'>('inconsistency');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  // Solicitações já decididas (Cadastrado/Rejeitado) ficam travadas por padrão;
  // o diretor precisa clicar em "Mudar decisão" para reabrir as opções de homologar/rejeitar.
  const [changingDecision, setChangingDecision] = useState(false);
  const [filterTab, setFilterTab] = useState<'pending' | 'history'>('pending');

  useEffect(() => {
    if (session && session.schoolId) {
      loadSchoolApplications(session.schoolId);
      if (session.contactEmail) setEmailInput(session.contactEmail);
    }
  }, [session]);

  const loadSchoolApplications = async (schoolId: string) => {
    setLoadingApps(true);
    try {
      const data = await fetchDirectorApplications(schoolId);
      setApplications(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingApps(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      const res = await loginDirector(username, password);
      setSession(res);
    } catch (err: any) {
      setLoginError(err.message || 'Falha na autenticação do diretor.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail.trim()) return;
    setRecoveryLoading(true);
    setRecoveryErr(null);
    setRecoveryMsg(null);
    try {
      const res = await recoverDirectorPassword(recoveryEmail.trim());
      setRecoveryMsg(res.message);
    } catch (err: any) {
      setRecoveryErr(err.message);
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleSaveDirectorEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.schoolId || !emailInput.trim()) return;
    setSavingEmail(true);
    try {
      await updateDirectorEmail(session.schoolId, emailInput.trim());
      setEmailMsg('E-mail de notificação atualizado com sucesso!');
      setTimeout(() => setEmailMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar e-mail.');
    } finally {
      setSavingEmail(false);
    }
  };

  const handleStatusDecision = async (
    status: 'Cadastrado' | 'Rejeitado',
    customReason?: string
  ) => {
    if (!selectedApp || !session?.schoolId) return;

    let reason = customReason;
    if (status === 'Rejeitado' && !reason) {
      reason =
        rejectReasonType === 'inconsistency'
          ? 'Inconsistência nos dados fornecidos'
          : 'Falta de vaga na instituição escolar';
    }

    setUpdatingStatus(true);
    try {
      await updateApplicationStatus(selectedApp.protocol, status, reason);
      setSelectedApp(null);
      setChangingDecision(false);
      await loadSchoolApplications(session.schoolId);
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar status do pedido.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (!isOpen) return null;

  // Render Admin Portal if logged in as admin
  if (session && session.role === 'admin') {
    return (
      <AdminPortal
        isOpen={isOpen}
        externalSession={session}
        onClose={() => {
          setSession(null);
          onClose();
        }}
      />
    );
  }

  // Render Login & Recovery View if not logged in
  if (!session) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-950/40 backdrop-blur-md">
        <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 w-full max-w-md overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-900/90 text-white p-6 text-center border-b border-white/20">
            <div className="w-14 h-14 rounded-2xl bg-white p-1.5 mx-auto flex items-center justify-center mb-2 border border-white/30 shadow-md">
              <img
                src="https://i.postimg.cc/G2nbJMXD/logo.png"
                alt="Logo Serrinha"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <h3 className="text-xl font-bold">Portal de Acesso Restrito</h3>
            <p className="text-indigo-200 text-xs mt-1">Acesso para Diretores Escolares e Administradores</p>
          </div>

          <div className="p-6">
            {!showRecovery ? (
              /* Director & Admin Login Form */
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {loginError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome de Usuário (Diretor ou Administrador)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Ex: dir.ivone ou master"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none font-medium"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Senha</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRecovery(true);
                      setRecoveryMsg(null);
                      setRecoveryErr(null);
                    }}
                    className="text-blue-700 hover:underline font-medium"
                  >
                    Esqueceu seu login ou senha?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 bg-blue-800 hover:bg-blue-900 text-white font-bold rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center space-x-2"
                >
                  {loginLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Entrar no Painel</span>
                  )}
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-slate-500 hover:text-slate-700 text-xs"
                  >
                    Voltar para o site principal
                  </button>
                </div>
              </form>
            ) : (
              /* Recovery Form */
              <form onSubmit={handleRecoverySubmit} className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Recuperar Acesso de Direção
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Informe o e-mail cadastrado da escola para receber o seu nome de usuário.
                </p>

                {recoveryMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium">
                    {recoveryMsg}
                  </div>
                )}

                {recoveryErr && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs">
                    {recoveryErr}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    E-mail do Diretor / Escola
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="escola@serrinha.ba.gov.br"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <p className="text-[11px] text-slate-500 italic leading-relaxed">
                  Se você não cadastrou este e-mail ou não se lembra, entre em contato com a Secretaria de Educação para que os administradores possam reinformar seu login.
                </p>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRecovery(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg"
                  >
                    Voltar ao Login
                  </button>
                  <button
                    type="submit"
                    disabled={recoveryLoading}
                    className="flex-1 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg flex items-center justify-center space-x-1"
                  >
                    {recoveryLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Enviar Acesso</span>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Filtered Applications for Dashboard
  const pendingList = applications.filter((a) => a.status === 'Pendente');
  const historyList = applications.filter((a) => a.status !== 'Pendente');

  return (
    <div className="fixed inset-0 z-50 bg-indigo-950/40 backdrop-blur-md overflow-y-auto p-4 sm:p-6">
      <div className="max-w-6xl mx-auto bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 overflow-hidden my-6">
        {/* Top Director Bar */}
        <div className="bg-slate-900 text-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-white p-1 flex items-center justify-center border border-slate-700 shadow-md shrink-0">
              <img
                src="https://i.postimg.cc/G2nbJMXD/logo.png"
                alt="Logo Serrinha"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                Painel da Direção Escolar &bull; Serrinha
              </span>
              <h2 className="text-lg font-extrabold text-white">{session.schoolName}</h2>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => loadSchoolApplications(session.schoolId!)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs flex items-center gap-1 transition-colors"
              title="Atualizar lista"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Atualizar</span>
            </button>
            <button
              onClick={() => setSession(null)}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Dashboard Main Content */}
        <div className="p-6 space-y-8">
          {/* Director Notification Email Settings Bar */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <form onSubmit={handleSaveDirectorEmail} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-blue-600" />
                  E-mail para Notificações da Direção
                </h4>
                <p className="text-xs text-slate-500">
                  Cadastre o e-mail oficial para eventual reenvio e suporte da Secretaria.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  required
                  placeholder="direcao@escola.ba.gov.br"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs w-64 outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button
                  type="submit"
                  disabled={savingEmail}
                  className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold transition-colors shrink-0"
                >
                  {savingEmail ? 'Salvando...' : 'Atualizar E-mail'}
                </button>
              </div>
            </form>
            {emailMsg && <p className="text-xs text-emerald-700 font-medium mt-2">{emailMsg}</p>}
          </div>

          {/* Applications Tabs */}
          <div>
            <div className="flex border-b border-slate-200 mb-6">
              <button
                onClick={() => setFilterTab('pending')}
                className={`pb-3 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-colors ${
                  filterTab === 'pending'
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Solicitações Pendentes</span>
                <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full">
                  {pendingList.length}
                </span>
              </button>

              <button
                onClick={() => setFilterTab('history')}
                className={`pb-3 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-colors ${
                  filterTab === 'history'
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Histórico (Homologados & Rejeitados 3 meses)</span>
                <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-full">
                  {historyList.length}
                </span>
              </button>
            </div>

            {loadingApps ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                <span>Carregando solicitações da escola...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 uppercase font-bold text-[11px]">
                      <th className="p-3">Protocolo</th>
                      <th className="p-3">Aluno</th>
                      <th className="p-3">Série Ingressando</th>
                      <th className="p-3">Responsável</th>
                      <th className="p-3">Contato</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(filterTab === 'pending' ? pendingList : historyList).length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                          Nenhuma solicitação encontrada nesta aba.
                        </td>
                      </tr>
                    ) : (
                      (filterTab === 'pending' ? pendingList : historyList).map((appItem) => (
                        <tr key={appItem.protocol} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-mono font-bold text-blue-900">{appItem.protocol}</td>
                          <td className="p-3 font-bold text-slate-900">{appItem.studentName}</td>
                          <td className="p-3 font-medium text-slate-700">{appItem.enteringGrade}</td>
                          <td className="p-3 text-slate-600">{appItem.motherName}</td>
                          <td className="p-3 text-slate-600 font-mono">{appItem.phone}</td>
                          <td className="p-3">
                            {appItem.status === 'Cadastrado' && (
                              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                                <CheckCircle className="w-3 h-3 text-emerald-600" /> Cadastrado
                              </span>
                            )}
                            {appItem.status === 'Rejeitado' && (
                              <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                                <XCircle className="w-3 h-3 text-rose-600" /> Rejeitado
                              </span>
                            )}
                            {appItem.status === 'Pendente' && (
                              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                                <Clock className="w-3 h-3 text-amber-600" /> Pendente
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedApp(appItem);
                                setChangingDecision(false);
                              }}
                              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold rounded-lg text-xs transition-colors inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Analisar</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Review Modal for Director */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-blue-900 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-300 font-mono font-bold">{selectedApp.protocol}</span>
                <h3 className="font-bold text-lg text-white">Análise da Solicitação de Matrícula</h3>
              </div>
              <button
                onClick={() => {
                  setSelectedApp(null);
                  setChangingDecision(false);
                }}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
              {/* Student info */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 font-semibold block">Nome do Aluno:</span>
                  <span className="font-bold text-sm text-slate-900">{selectedApp.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Modalidade / Série:</span>
                  <span className="font-semibold text-slate-800">{MODALITY_LABELS[selectedApp.modality]} - {selectedApp.enteringGrade}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Nascimento / Idade:</span>
                  <span className="text-slate-800">{formatDateBR(selectedApp.birthDate)} ({selectedApp.age} anos)</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Mãe / Responsável:</span>
                  <span className="text-slate-800">{selectedApp.motherName} (CPF: {selectedApp.motherCpf || 'N/A'})</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Contato:</span>
                  <span className="font-mono text-slate-800">{selectedApp.phone} | {selectedApp.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Endereço:</span>
                  <span className="text-slate-800">{selectedApp.street}, {selectedApp.number} - {selectedApp.neighborhood}, {selectedApp.city}</span>
                </div>
              </div>

              {/* Attachments Section */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
                  Documentação Anexada
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 border rounded-xl bg-slate-50 flex items-center justify-between">
                    <div>
                      <span className="font-bold block text-slate-800">
                        {selectedApp.useResponsibleRg ? 'RG do Responsável' : 'RG do Aluno'}
                      </span>
                      {selectedApp.useResponsibleRg && (
                        <span className="text-[10px] text-amber-700 font-medium">Usando RG do Responsável</span>
                      )}
                    </div>
                    {selectedApp.rgDocumentUrl ? (
                      <a
                        href={selectedApp.rgDocumentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-xs inline-flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Ver Anexo
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">Não enviado</span>
                    )}
                  </div>

                  <div className="p-3 border rounded-xl bg-slate-50 flex items-center justify-between">
                    <div>
                      <span className="font-bold block text-slate-800">Histórico Escolar</span>
                      <span className="text-[10px] text-slate-500">Documento de transferência</span>
                    </div>
                    {selectedApp.transcriptUrl ? (
                      <a
                        href={selectedApp.transcriptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-xs inline-flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Ver Anexo
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">Não enviado</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Decision Form */}
              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 space-y-4 pt-4">
                <h4 className="font-bold text-slate-900 text-xs">
                  Decisão da Direção Escolar
                </h4>

                {selectedApp.status !== 'Pendente' && !changingDecision ? (
                  // Solicitação já decidida: mostra o resultado e trava as opções de homologar/rejeitar
                  <div className="space-y-3">
                    <div
                      className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                        selectedApp.status === 'Cadastrado'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {selectedApp.status === 'Cadastrado' ? (
                        <CheckCircle className="w-4 h-4 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 shrink-0" />
                      )}
                      <span>
                        Esta solicitação já foi{' '}
                        {selectedApp.status === 'Cadastrado' ? 'homologada' : 'rejeitada'}.
                        {selectedApp.status === 'Rejeitado' && selectedApp.rejectionReason
                          ? ` Motivo: ${selectedApp.rejectionReason}.`
                          : ''}
                      </span>
                    </div>
                    <button
                      onClick={() => setChangingDecision(true)}
                      className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Mudar decisão</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedApp.status !== 'Pendente' && changingDecision && (
                      <div className="p-3 rounded-lg text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>
                          Você está alterando uma decisão já tomada (status atual:{' '}
                          <strong>{selectedApp.status}</strong>). A nova decisão substituirá a
                          anterior e um novo e-mail de atualização será enviado ao responsável.
                        </span>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => handleStatusDecision('Cadastrado')}
                        disabled={updatingStatus}
                        className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Homologar e Cadastrar Aluno</span>
                      </button>

                      <div className="flex-1 flex flex-col gap-2">
                        <select
                          value={rejectReasonType}
                          onChange={(e) => setRejectReasonType(e.target.value as any)}
                          className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white"
                        >
                          <option value="inconsistency">Motivo: Inconsistência nos dados fornecidos</option>
                          <option value="no_vacancy">Motivo: Falta de vaga na instituição</option>
                        </select>

                        <button
                          onClick={() => handleStatusDecision('Rejeitado')}
                          disabled={updatingStatus}
                          className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-sm"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Rejeitar Solicitação</span>
                        </button>
                      </div>
                    </div>

                    {selectedApp.status !== 'Pendente' && changingDecision && (
                      <button
                        onClick={() => setChangingDecision(false)}
                        disabled={updatingStatus}
                        className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
                      >
                        Cancelar alteração
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => {
                  setSelectedApp(null);
                  setChangingDecision(false);
                }}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg text-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
