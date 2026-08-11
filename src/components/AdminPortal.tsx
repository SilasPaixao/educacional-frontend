import React, { useState, useEffect } from 'react';
import { AuthSession, ModalityType, School, AdminUser, StudentApplication, MODALITY_LABELS } from '../types';
import {
  registerAdmin,
  loginAdmin,
  recoverAdminPassword,
  fetchPendingAdmins,
  decidePendingAdmin,
  registerSchool,
  fetchSchools,
  deleteSchool,
  fetchAllApplications,
  fetchAnnouncement,
  updateAnnouncement,
  fetchEnrollmentStatus,
  setEnrollmentLock,
} from '../services/api';
import {
  ShieldCheck,
  Building2,
  Users,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Mail,
  UserCheck,
  UserX,
  School as SchoolIcon,
  Loader2,
  AlertCircle,
  LogOut,
  RefreshCw,
  Search,
  Eye,
  BarChart3,
  Bell,
  Megaphone,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
  externalSession?: AuthSession | null;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ isOpen, onClose, externalSession }) => {
  const [session, setSession] = useState<AuthSession | null>(externalSession || null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'register_admin' | 'recovery' | 'login' | 'dashboard'>('register_admin');

  useEffect(() => {
    if (externalSession) {
      setSession(externalSession);
      setActiveTab('dashboard');
    }
  }, [externalSession]);

  // Login Form States
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Admin Recovery States
  const [showAdminRecovery, setShowAdminRecovery] = useState(false);
  const [adminRecoveryEmail, setAdminRecoveryEmail] = useState('');
  const [adminRecoveryLoading, setAdminRecoveryLoading] = useState(false);
  const [adminRecoveryMsg, setAdminRecoveryMsg] = useState<string | null>(null);
  const [adminRecoveryErr, setAdminRecoveryErr] = useState<string | null>(null);

  // Admin Registration Form States
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regMessage, setRegMessage] = useState<string | null>(null);
  const [regError, setRegError] = useState<string | null>(null);

  // Dashboard Data
  const [schools, setSchools] = useState<School[]>([]);
  const [pendingAdmins, setPendingAdmins] = useState<AdminUser[]>([]);
  const [allApplications, setAllApplications] = useState<StudentApplication[]>([]);
  const [statsPage, setStatsPage] = useState(1);
  const STATS_PAGE_SIZE = 20;
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [dashboardTab, setDashboardTab] = useState<'announcement' | 'schools' | 'pending_admins' | 'stats' | 'enrollment'>('announcement');

  // Enrollment Lock (Período de Matrículas) States
  const [enrollmentLocked, setEnrollmentLockedState] = useState(false);
  const [loadingEnrollmentLock, setLoadingEnrollmentLock] = useState(false);
  const [savingEnrollmentLock, setSavingEnrollmentLock] = useState(false);
  const [enrollmentLockMsg, setEnrollmentLockMsg] = useState<string | null>(null);
  const [enrollmentLockErr, setEnrollmentLockErr] = useState<string | null>(null);

  // Announcement States
  const [announcementTitle, setAnnouncementTitle] = useState('Aviso Importante sobre Pré-Matrículas');
  const [announcementContent, setAnnouncementContent] = useState(
    'As inscrições normalmente se iniciam nas datas próximas ao fim do ano letivo, fique atento às nossas redes sociais para mais informações!'
  );
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);
  const [announcementMsg, setAnnouncementMsg] = useState<string | null>(null);
  const [announcementErr, setAnnouncementErr] = useState<string | null>(null);

  // School Registration Form States
  const [schName, setSchName] = useState('');
  const [schModalities, setSchModalities] = useState<ModalityType[]>([
    'educacao-infantil',
    'ensino-fundamental',
  ]);
  const [schDirectorUsername, setSchDirectorUsername] = useState('');
  const [schDirectorPassword, setSchDirectorPassword] = useState('');
  const [schDirectorName, setSchDirectorName] = useState('');
  const [schPhone, setSchPhone] = useState('');
  const [schEmail, setSchEmail] = useState('');
  const [schAddress, setSchAddress] = useState('');
  const [creatingSchool, setCreatingSchool] = useState(false);
  const [schoolMsg, setSchoolMsg] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      loadDashboardData();
    }
  }, [session]);

  const loadDashboardData = async () => {
    setLoadingDashboard(true);
    try {
      const [schList, appList, annData] = await Promise.all([
        fetchSchools(),
        fetchAllApplications(),
        fetchAnnouncement().catch(() => null)
      ]);
      setSchools(schList);
      setAllApplications(appList);
      setStatsPage(1);
      if (annData) {
        if (annData.title) setAnnouncementTitle(annData.title);
        if (annData.content) setAnnouncementContent(annData.content);
      }

      if (session?.isMaster) {
        const pending = await fetchPendingAdmins();
        setPendingAdmins(pending);
      }

      setLoadingEnrollmentLock(true);
      try {
        const lockData = await fetchEnrollmentStatus();
        setEnrollmentLockedState(!!lockData.locked);
      } catch {
        // Silencioso: a aba mostra o estado padrão (aberto) se a checagem falhar
      } finally {
        setLoadingEnrollmentLock(false);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingDashboard(false);
    }
  };

  const handleToggleEnrollmentLock = async () => {
    setEnrollmentLockMsg(null);
    setEnrollmentLockErr(null);
    setSavingEnrollmentLock(true);
    try {
      const result = await setEnrollmentLock(!enrollmentLocked);
      setEnrollmentLockedState(result.locked);
      setEnrollmentLockMsg(
        result.locked
          ? 'Matrículas encerradas para todas as escolas. A partir de agora, quem tentar se inscrever verá o aviso de período encerrado.'
          : 'Matrículas reabertas! As famílias já podem realizar novas inscrições normalmente.'
      );
    } catch (err: any) {
      setEnrollmentLockErr(err.message || 'Erro ao atualizar o status das matrículas.');
    } finally {
      setSavingEnrollmentLock(false);
    }
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnnouncementMsg(null);
    setAnnouncementErr(null);

    if (!announcementTitle.trim() || !announcementContent.trim()) {
      setAnnouncementErr('Preencha o título e o texto do comunicado.');
      return;
    }

    if (announcementContent.length > 250) {
      setAnnouncementErr('O texto do comunicado deve ter no máximo 250 caracteres.');
      return;
    }

    setSavingAnnouncement(true);
    try {
      await updateAnnouncement({
        title: announcementTitle.trim(),
        content: announcementContent.trim()
      });
      setAnnouncementMsg('Comunicado publicado e atualizado com sucesso na página inicial!');
    } catch (err: any) {
      setAnnouncementErr(err.message || 'Erro ao salvar comunicado.');
    } finally {
      setSavingAnnouncement(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      const res = await loginAdmin(loginUsername, loginPassword);
      setSession(res);
      setActiveTab('dashboard');
    } catch (err: any) {
      setLoginError(err.message || 'Erro de login do administrador.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleAdminRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminRecoveryLoading(true);
    setAdminRecoveryMsg(null);
    setAdminRecoveryErr(null);
    try {
      const res = await recoverAdminPassword(adminRecoveryEmail);
      setAdminRecoveryMsg(res.message);
    } catch (err: any) {
      setAdminRecoveryErr(err.message || 'Erro ao recuperar dados de login.');
    } finally {
      setAdminRecoveryLoading(false);
    }
  };

  const handleAdminRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError(null);
    setRegMessage(null);
    try {
      const res = await registerAdmin({
        username: regUsername,
        password: regPassword,
        email: regEmail,
      });
      setRegMessage(res.message);
      setRegUsername('');
      setRegPassword('');
      setRegEmail('');
    } catch (err: any) {
      setRegError(err.message || 'Erro ao registrar conta de administrador.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (schModalities.length === 0) {
      alert('Selecione pelo menos uma modalidade aceita pela escola.');
      return;
    }
    setCreatingSchool(true);
    setSchoolMsg(null);
    try {
      await registerSchool({
        name: schName,
        modalities: schModalities,
        directorUsername: schDirectorUsername,
        directorPassword: schDirectorPassword,
        directorName: schDirectorName,
        contactPhone: schPhone,
        contactEmail: schEmail,
        address: schAddress,
      });
      setSchoolMsg('Escola cadastrada com sucesso!');
      setSchName('');
      setSchDirectorUsername('');
      setSchDirectorPassword('');
      setSchDirectorName('');
      setSchPhone('');
      setSchEmail('');
      setSchAddress('');
      await loadDashboardData();
    } catch (err: any) {
      alert(err.message || 'Erro ao cadastrar escola.');
    } finally {
      setCreatingSchool(false);
    }
  };

  const handleDeleteSchool = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta escola?')) return;
    try {
      await deleteSchool(id);
      await loadDashboardData();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir escola.');
    }
  };

  const handleDecideAdmin = async (id: string, action: 'approve' | 'reject') => {
    try {
      await decidePendingAdmin(id, action);
      await loadDashboardData();
    } catch (err: any) {
      alert(err.message || 'Erro ao decidir solicitação.');
    }
  };

  const toggleModality = (mod: ModalityType) => {
    if (schModalities.includes(mod)) {
      setSchModalities(schModalities.filter((m) => m !== mod));
    } else {
      setSchModalities([...schModalities, mod]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md overflow-y-auto p-4 sm:p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Top Header Bar */}
        <div className="bg-slate-950 text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800">
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
              <span className="text-xs text-amber-400 font-extrabold uppercase tracking-widest">
                /adminaccess &bull; Gestão do Sistema Serrinha
              </span>
              <h2 className="text-xl font-extrabold text-white">Painel Geral de Administração</h2>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {session && (
              <button
                onClick={() => setSession(null)}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" /> Sair
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Not Logged In View */}
        {!session ? (
          <div className="p-8 max-w-lg mx-auto space-y-6">
            {/* Login / Register Toggle Tabs */}
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 pb-3 text-center font-bold text-sm border-b-2 transition-colors ${
                  activeTab === 'login'
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Entrar no Admin
              </button>
              <button
                onClick={() => setActiveTab('register_admin')}
                className={`flex-1 pb-3 text-center font-bold text-sm border-b-2 transition-colors ${
                  activeTab === 'register_admin'
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Cadastrar Novo Admin
              </button>
            </div>

            {activeTab === 'login' ? (
              showAdminRecovery ? (
                /* Admin Recovery Form */
                <form onSubmit={handleAdminRecovery} className="space-y-4">
                  <div className="border-b border-slate-100 pb-2">
                    <h4 className="text-sm font-bold text-slate-900">
                      Recuperar Login de Administrador
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Informe o e-mail informado no momento do cadastro para receber seus dados de acesso (usuário e senha cadastrados).
                    </p>
                  </div>

                  {adminRecoveryMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium">
                      {adminRecoveryMsg}
                    </div>
                  )}

                  {adminRecoveryErr && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs font-medium">
                      {adminRecoveryErr}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      E-mail do Administrador
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        placeholder="admin@serrinha.ba.gov.br"
                        value={adminRecoveryEmail}
                        onChange={(e) => setAdminRecoveryEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={adminRecoveryLoading}
                    className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center space-x-2"
                  >
                    {adminRecoveryLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>Enviar Login por E-mail</span>
                    )}
                  </button>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAdminRecovery(false);
                        setAdminRecoveryMsg(null);
                        setAdminRecoveryErr(null);
                      }}
                      className="text-slate-500 hover:text-slate-700 text-xs font-medium"
                    >
                      Voltar para a tela de login
                    </button>
                  </div>
                </form>
              ) : (
                /* Admin Login Form */
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  {loginError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nome de Usuário
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: master ou admin"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Senha</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAdminRecovery(true);
                        setAdminRecoveryMsg(null);
                        setAdminRecoveryErr(null);
                      }}
                      className="text-blue-700 hover:underline font-medium"
                    >
                      Esqueceu seu login ou senha?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center space-x-2"
                  >
                    {loginLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Acessar Painel Admin</span>}
                  </button>
                </form>
              )
            ) : (
              /* New Admin Registration Form */
              <form onSubmit={handleAdminRegister} className="space-y-4">
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs leading-relaxed">
                  <strong>Regra de Cadastro:</strong> O primeiro administrador registrado se tornará o <strong>Admin Master</strong> automaticamente. Todos os admins subsequentes necessitarão de aprovação do Admin Master.
                </div>

                {regMessage && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium">
                    {regMessage}
                  </div>
                )}

                {regError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs">
                    {regError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome de Usuário
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Digite o login desejado"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    E-mail do Administrador
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="admin@serrinha.ba.gov.br"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Senha</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center space-x-2"
                >
                  {regLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Solicitar Cadastro Admin</span>}
                </button>
              </form>
            )}
          </div>
        ) : (
          /* Admin Logged In Dashboard */
          <div className="p-6 space-y-8">
            {/* Navigation sub-tabs */}
            <div className="flex flex-wrap border-b border-slate-200">
              <button
                onClick={() => setDashboardTab('announcement')}
                className={`pb-3 px-5 font-bold text-sm border-b-2 flex items-center gap-2 transition-colors ${
                  dashboardTab === 'announcement'
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Bell className="w-4 h-4" />
                <span>Card de Comunicado</span>
              </button>

              <button
                onClick={() => setDashboardTab('schools')}
                className={`pb-3 px-5 font-bold text-sm border-b-2 flex items-center gap-2 transition-colors ${
                  dashboardTab === 'schools'
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Cadastro e Lista de Escolas</span>
              </button>

              {session.isMaster && (
                <button
                  onClick={() => setDashboardTab('pending_admins')}
                  className={`pb-3 px-5 font-bold text-sm border-b-2 flex items-center gap-2 transition-colors ${
                    dashboardTab === 'pending_admins'
                      ? 'border-blue-600 text-blue-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Aprovação de Admins</span>
                  {pendingAdmins.length > 0 && (
                    <span className="bg-amber-500 text-slate-950 font-bold text-xs px-2 py-0.5 rounded-full">
                      {pendingAdmins.length}
                    </span>
                  )}
                </button>
              )}

              <button
                onClick={() => setDashboardTab('stats')}
                className={`pb-3 px-5 font-bold text-sm border-b-2 flex items-center gap-2 transition-colors ${
                  dashboardTab === 'stats'
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Estatísticas de Matrículas</span>
              </button>

              <button
                onClick={() => setDashboardTab('enrollment')}
                className={`pb-3 px-5 font-bold text-sm border-b-2 flex items-center gap-2 transition-colors ${
                  dashboardTab === 'enrollment'
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Período de Matrículas</span>
                {enrollmentLocked && (
                  <span className="bg-rose-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
                    Encerrado
                  </span>
                )}
              </button>
            </div>

            {/* TAB: PERÍODO DE MATRÍCULAS (bloqueio geral do sistema) */}
            {dashboardTab === 'enrollment' && (
              <div className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-6">
                  <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
                    <Lock className="w-5 h-5 text-indigo-700" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                        Período de Matrículas
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Controla, para todas as escolas ao mesmo tempo, se novas solicitações de matrícula
                        podem ser enviadas pela página inicial.
                      </p>
                    </div>
                  </div>

                  {enrollmentLockMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>{enrollmentLockMsg}</span>
                    </div>
                  )}

                  {enrollmentLockErr && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{enrollmentLockErr}</span>
                    </div>
                  )}

                  {loadingEnrollmentLock ? (
                    <div className="py-6 text-center text-slate-500 text-sm">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-600 mb-2" />
                      <span>Carregando status atual...</span>
                    </div>
                  ) : (
                    <div
                      className={`p-5 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        enrollmentLocked
                          ? 'bg-rose-50 border-rose-300'
                          : 'bg-emerald-50 border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                            enrollmentLocked ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
                          }`}
                        >
                          {enrollmentLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className={`font-extrabold text-sm ${enrollmentLocked ? 'text-rose-900' : 'text-emerald-900'}`}>
                            {enrollmentLocked ? 'Matrículas Encerradas' : 'Matrículas Abertas'}
                          </p>
                          <p className={`text-xs mt-0.5 ${enrollmentLocked ? 'text-rose-700' : 'text-emerald-700'}`}>
                            {enrollmentLocked
                              ? 'Ninguém consegue enviar novas solicitações no momento.'
                              : 'As famílias podem enviar novas solicitações normalmente.'}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={handleToggleEnrollmentLock}
                        disabled={savingEnrollmentLock}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors disabled:opacity-60 ${
                          enrollmentLocked
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-rose-600 hover:bg-rose-700 text-white'
                        }`}
                      >
                        {savingEnrollmentLock ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : enrollmentLocked ? (
                          <Unlock className="w-4 h-4" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                        <span>{enrollmentLocked ? 'Reabrir Matrículas' : 'Encerrar Matrículas'}</span>
                      </button>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Quando encerrado, quem clicar em "Realizar Inscrição" na página inicial verá o aviso:{' '}
                    <span className="italic">
                      "Período de Matrículas encerrado (para mais informações entre em contato com a escola ou
                      a Secretaria de Educação. Obrigado!)"
                    </span>
                    . Solicitações já enviadas continuam disponíveis para análise normalmente pelos diretores.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 0: ANNOUNCEMENT / CARD DE INFORMAÇÕES GERAIS */}
            {dashboardTab === 'announcement' && (
              <div className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-6">
                  <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
                    <Bell className="w-5 h-5 text-indigo-700" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                        Gerenciar Manchete e Informações Gerais
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Defina o comunicado exibido em destaque na página inicial do portal.
                      </p>
                    </div>
                  </div>

                  {announcementMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>{announcementMsg}</span>
                    </div>
                  )}

                  {announcementErr && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{announcementErr}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveAnnouncement} className="space-y-4">
                    {/* Title Input */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Título do Comunicado (Manchete) <span className="text-red-500">*</span>
                        </label>
                        <span className={`text-[11px] font-mono font-semibold ${announcementTitle.length > 80 ? 'text-red-600' : 'text-slate-500'}`}>
                          {announcementTitle.length}/80
                        </span>
                      </div>
                      <input
                        type="text"
                        required
                        maxLength={80}
                        value={announcementTitle}
                        onChange={(e) => setAnnouncementTitle(e.target.value)}
                        placeholder="Ex: Aviso Importante sobre Pré-Matrículas"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                      />
                    </div>

                    {/* Content Textarea */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Texto Informativo do Card <span className="text-red-500">*</span>
                        </label>
                        <span className={`text-[11px] font-mono font-semibold ${announcementContent.length > 250 ? 'text-red-600 font-bold' : 'text-slate-500'}`}>
                          {announcementContent.length}/250 caracteres
                        </span>
                      </div>
                      <textarea
                        required
                        rows={4}
                        maxLength={250}
                        value={announcementContent}
                        onChange={(e) => setAnnouncementContent(e.target.value)}
                        placeholder="Ex: As inscrições normalmente se iniciam nas datas próximas ao fim do ano letivo, fique atento às nossas redes sociais para mais informações!"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-600 bg-white resize-none"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        Recomendado texto objetivo e direto. Limite estrito de 250 caracteres.
                      </p>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={savingAnnouncement}
                        className="px-6 py-2.5 bg-indigo-900 hover:bg-indigo-950 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center space-x-2"
                      >
                        {savingAnnouncement ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Salvando...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span>Publicar Comunicado</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Live Preview Box */}
                <div className="p-6 bg-slate-900 text-white rounded-2xl space-y-3 shadow-md border border-slate-800">
                  <div className="flex items-center space-x-2 text-amber-400">
                    <Eye className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Pré-visualização ao vivo na Página Inicial</span>
                  </div>
                  <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700">
                    <h4 className="font-extrabold text-base text-amber-300 mb-1">{announcementTitle || 'Título do Comunicado'}</h4>
                    <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">{announcementContent || 'Conteúdo do comunicado...'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 1: SCHOOLS MANAGEMENT */}
            {dashboardTab === 'schools' && (
              <div className="space-y-8">
                {/* Form to Register School */}
                <form
                  onSubmit={handleCreateSchool}
                  className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-6"
                >
                  <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
                    <Plus className="w-5 h-5 text-blue-700" />
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Cadastrar Nova Escola Municipal
                    </h3>
                  </div>

                  {schoolMsg && (
                    <p className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold">
                      {schoolMsg}
                    </p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nome da Escola */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nome da Escola <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Escola Municipal Ivone Gonçalves"
                        value={schName}
                        onChange={(e) => setSchName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    {/* Modalidades Aceitas (Checkboxes) */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-2">
                        Modalidades Aceitas na Escola (Marque todas que se aplicam) <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        {(
                          [
                            'educacao-infantil',
                            'ensino-fundamental',
                            'ensino-medio',
                            'eja',
                          ] as ModalityType[]
                        ).map((mod) => (
                          <label
                            key={mod}
                            className={`p-3 rounded-xl border flex items-center space-x-2.5 cursor-pointer text-xs font-semibold transition-colors ${
                              schModalities.includes(mod)
                                ? 'bg-blue-50 border-blue-400 text-blue-900'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={schModalities.includes(mod)}
                              onChange={() => toggleModality(mod)}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <span>{MODALITY_LABELS[mod]}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Diretor Login Username & Password */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Usuário de Login da Escola (Para o Diretor) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: dir.ivone"
                        value={schDirectorUsername}
                        onChange={(e) => setSchDirectorUsername(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Senha de Acesso do Diretor <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={schDirectorPassword}
                        onChange={(e) => setSchDirectorPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    {/* Contact details */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nome do Diretor(a)
                      </label>
                      <input
                        type="text"
                        placeholder="Profa. Maria Silva"
                        value={schDirectorName}
                        onChange={(e) => setSchDirectorName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Telefone de Contato
                      </label>
                      <input
                        type="text"
                        placeholder="(75) 98800-0000"
                        value={schPhone}
                        onChange={(e) => setSchPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        E-mail de Notificação do Diretor
                      </label>
                      <input
                        type="email"
                        placeholder="escola@serrinha.ba.gov.br"
                        value={schEmail}
                        onChange={(e) => setSchEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Endereço Completo
                      </label>
                      <input
                        type="text"
                        placeholder="Rua, número, bairro - Serrinha-BA"
                        value={schAddress}
                        onChange={(e) => setSchAddress(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={creatingSchool}
                      className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center space-x-1.5"
                    >
                      {creatingSchool ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Cadastrar Escola</span>}
                    </button>
                  </div>
                </form>

                {/* Registered Schools Table */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Escolas Cadastradas ({schools.length})
                  </h3>
                  <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="w-full text-left text-xs text-slate-700 border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 uppercase font-bold text-[11px]">
                          <th className="p-3">Escola</th>
                          <th className="p-3">Modalidades</th>
                          <th className="p-3">Login Diretor</th>
                          <th className="p-3">Contato</th>
                          <th className="p-3 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {schools.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-6 text-center text-slate-400 italic">
                              Nenhuma escola cadastrada ainda.
                            </td>
                          </tr>
                        ) : (
                          schools.map((sch) => (
                            <tr key={sch.id} className="hover:bg-slate-50 transition-colors">
                              <td className="p-3">
                                <span className="font-bold text-slate-900 block">{sch.name}</span>
                                <span className="text-[11px] text-slate-500">{sch.address}</span>
                              </td>
                              <td className="p-3">
                                <div className="flex flex-wrap gap-1">
                                  {sch.modalities?.map((m) => (
                                    <span
                                      key={m}
                                      className="bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-semibold px-2 py-0.5 rounded-md"
                                    >
                                      {MODALITY_LABELS[m]}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="p-3 font-mono font-bold text-slate-800">
                                {sch.directorUsername}
                              </td>
                              <td className="p-3 text-slate-600">
                                {sch.contactPhone} <br />
                                <span className="text-[10px] text-slate-500">{sch.contactEmail}</span>
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => handleDeleteSchool(sch.id)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Excluir escola"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PENDING ADMINS APPROVAL (MASTER ADMIN ONLY) */}
            {dashboardTab === 'pending_admins' && session.isMaster && (
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs leading-relaxed">
                  <strong>Painel do Admin Master:</strong> Abaixo estão as solicitações de novos administradores. Solicitações não respondidas dentro do prazo de 3 dias (72 horas) são rejeitadas e removidas do banco de dados automaticamente.
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-left text-xs text-slate-700 border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 uppercase font-bold text-[11px]">
                        <th className="p-3">Usuário</th>
                        <th className="p-3">E-mail</th>
                        <th className="p-3">Data do Pedido</th>
                        <th className="p-3 text-right">Decisão</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pendingAdmins.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-slate-500 italic">
                            Nenhuma solicitação de administrador pendente no momento.
                          </td>
                        </tr>
                      ) : (
                        pendingAdmins.map((adm) => (
                          <tr key={adm.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3 font-bold text-slate-900">{adm.username}</td>
                            <td className="p-3 text-slate-600">{adm.email}</td>
                            <td className="p-3 text-slate-500">{new Date(adm.createdAt).toLocaleString('pt-BR')}</td>
                            <td className="p-3 text-right space-x-2">
                              <button
                                onClick={() => handleDecideAdmin(adm.id, 'approve')}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors inline-flex items-center gap-1"
                              >
                                <UserCheck className="w-3.5 h-3.5" /> Aprovar
                              </button>
                              <button
                                onClick={() => handleDecideAdmin(adm.id, 'reject')}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition-colors inline-flex items-center gap-1"
                              >
                                <UserX className="w-3.5 h-3.5" /> Recusar
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: GLOBAL MATRICULAS STATS */}
            {dashboardTab === 'stats' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 bg-blue-50 border border-blue-200 rounded-2xl text-blue-900">
                    <span className="text-xs font-semibold uppercase text-blue-700">Total de Inscrições</span>
                    <p className="text-3xl font-extrabold text-blue-950 mt-1">{allApplications.length}</p>
                  </div>

                  <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900">
                    <span className="text-xs font-semibold uppercase text-emerald-700">Homologados / Cadastrados</span>
                    <p className="text-3xl font-extrabold text-emerald-950 mt-1">
                      {allApplications.filter((a) => a.status === 'Cadastrado').length}
                    </p>
                  </div>

                  <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900">
                    <span className="text-xs font-semibold uppercase text-amber-700">Pendentes de Análise</span>
                    <p className="text-3xl font-extrabold text-amber-950 mt-1">
                      {allApplications.filter((a) => a.status === 'Pendente').length}
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-left text-xs text-slate-700 border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 uppercase font-bold text-[11px]">
                        <th className="p-3">Protocolo</th>
                        <th className="p-3">Aluno</th>
                        <th className="p-3">Escola</th>
                        <th className="p-3">Modalidade</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {allApplications.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-500 italic">
                            Nenhuma matrícula registrada até o momento.
                          </td>
                        </tr>
                      ) : (
                        allApplications
                          .slice((statsPage - 1) * STATS_PAGE_SIZE, statsPage * STATS_PAGE_SIZE)
                          .map((app) => (
                            <tr key={app.protocol}>
                              <td className="p-3 font-mono font-bold text-blue-900">{app.protocol}</td>
                              <td className="p-3 font-bold text-slate-900">{app.studentName}</td>
                              <td className="p-3 text-slate-700">{app.schoolName}</td>
                              <td className="p-3 text-slate-600">{MODALITY_LABELS[app.modality]}</td>
                              <td className="p-3">
                                <span className="font-semibold">{app.status}</span>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>

                  {allApplications.length > STATS_PAGE_SIZE && (() => {
                    const totalPages = Math.ceil(allApplications.length / STATS_PAGE_SIZE);
                    const rangeStart = (statsPage - 1) * STATS_PAGE_SIZE + 1;
                    const rangeEnd = Math.min(statsPage * STATS_PAGE_SIZE, allApplications.length);
                    return (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-50 border-t border-slate-200 text-xs">
                        <span className="text-slate-600 font-medium">
                          Exibindo {rangeStart}–{rangeEnd} de {allApplications.length} matrículas
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setStatsPage((p) => Math.max(1, p - 1))}
                            disabled={statsPage === 1}
                            className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <span className="font-bold text-slate-800 px-2">
                            Página {statsPage} de {totalPages}
                          </span>
                          <button
                            onClick={() => setStatsPage((p) => Math.min(totalPages, p + 1))}
                            disabled={statsPage === totalPages}
                            className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
