import React, { useState, useEffect } from 'react';
import {
  ModalityType,
  School,
  MODALITY_LABELS,
  ENTERING_GRADES,
  getPriorSchoolingOptions,
  NO_PRIOR_SCHOOLING_OPTION,
  StudentApplication
} from '../types';
import { fetchSchools, uploadDocument, submitApplication } from '../services/api';
import { formatCPF, formatPhone, calculateAge } from '../utils/formatters';
import {
  ArrowLeft,
  Upload,
  CheckCircle,
  FileText,
  AlertCircle,
  User,
  Calendar,
  Home,
  Phone,
  Mail,
  School as SchoolIcon,
  ShieldCheck,
  Loader2,
  Copy,
  ExternalLink
} from 'lucide-react';

interface EnrollmentFormProps {
  modality: ModalityType;
  onBack: () => void;
  onSuccess: (result: { protocol: string; application: StudentApplication }) => void;
}

export const EnrollmentForm: React.FC<EnrollmentFormProps> = ({
  modality,
  onBack,
  onSuccess,
}) => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Fields
  const [schoolId, setSchoolId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [lastGradeCompleted, setLastGradeCompleted] = useState('');
  const [enteringGrade, setEnteringGrade] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'Masculino' | 'Feminino' | 'Não Binário'>('Feminino');
  const [raceColor, setRaceColor] = useState<'Preta' | 'Parda' | 'Branca' | 'Amarela' | 'Indígena'>('Parda');
  const [motherName, setMotherName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherCpf, setMotherCpf] = useState('');
  const [fatherCpf, setFatherCpf] = useState('');
  const [useResponsibleRg, setUseResponsibleRg] = useState(modality === 'educacao-infantil');
  const [rgFile, setRgFile] = useState<File | null>(null);
  const [rgDocUrl, setRgDocUrl] = useState<string>('');
  const [rgDocName, setRgDocName] = useState<string>('');
  const [rgUploading, setRgUploading] = useState(false);

  const [transcriptFile, setTranscriptFile] = useState<File | null>(null);
  const [transcriptUrl, setTranscriptUrl] = useState<string>('');
  const [transcriptName, setTranscriptName] = useState<string>('');
  const [transcriptUploading, setTranscriptUploading] = useState(false);

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city] = useState('Serrinha-BA');
  const [income, setIncome] = useState('');
  const [bolsaFamilia, setBolsaFamilia] = useState(false);

  // Load available schools for selected modality
  useEffect(() => {
    setLoadingSchools(true);
    fetchSchools(modality)
      .then((data) => {
        setSchools(data);
        if (data.length > 0) setSchoolId(data[0].id);
      })
      .catch((err) => setErrorMessage(err.message))
      .finally(() => setLoadingSchools(false));
  }, [modality]);

  // Set default entering grade based on modality
  useEffect(() => {
    const grades = ENTERING_GRADES[modality];
    if (grades && grades.length > 0) {
      setEnteringGrade(grades[0]);
    }
  }, [modality]);

  // Opções válidas de "última série concluída": sempre etapas anteriores à série de ingresso
  const priorSchoolingOptions = getPriorSchoolingOptions(modality, enteringGrade);

  // Se a série de ingresso mudar e a última série concluída selecionada deixar de ser válida
  // (ex: era posterior/igual à nova série de ingresso), reseta para a primeira opção válida
  useEffect(() => {
    if (!priorSchoolingOptions.includes(lastGradeCompleted)) {
      setLastGradeCompleted(priorSchoolingOptions[0] || NO_PRIOR_SCHOOLING_OPTION);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enteringGrade, modality]);

  // Enforce "Usar RG do responsável" disabled checkbox for Educação Infantil
  useEffect(() => {
    if (modality === 'educacao-infantil') {
      setUseResponsibleRg(true);
    }
  }, [modality]);

  // Age calculation and EJA Validation
  const currentAge = calculateAge(birthDate);
  let ejaAgeError: string | null = null;

  // Data de nascimento não pode ser hoje nem no futuro (data incompatível com uma matrícula real)
  let birthDateError: string | null = null;
  if (birthDate) {
    const parsedBirthDate = new Date(`${birthDate}T00:00:00`);
    const todayAtMidnight = new Date();
    todayAtMidnight.setHours(0, 0, 0, 0);
    if (isNaN(parsedBirthDate.getTime())) {
      birthDateError = 'Data de nascimento inválida.';
    } else if (parsedBirthDate >= todayAtMidnight) {
      birthDateError = 'A data de nascimento não pode ser hoje nem uma data futura. Verifique o dia, mês e ano informados.';
    }
  }

  if (modality === 'eja' && birthDate) {
    if (enteringGrade.includes('Fundamental') && currentAge < 15) {
      ejaAgeError = `Inscrição não permitida: Para o EJA Ensino Fundamental é necessário ter no mínimo 15 anos completos (idade identificada: ${currentAge} ano${currentAge === 1 ? '' : 's'}).`;
    } else if (enteringGrade.includes('Médio') && currentAge < 18) {
      ejaAgeError = `Inscrição não permitida: Para o EJA Ensino Médio é necessário ter no mínimo 18 anos completos (idade identificada: ${currentAge} ano${currentAge === 1 ? '' : 's'}).`;
    }
  }

  // Handle RG File Upload
  const handleRgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRgFile(file);
    setRgUploading(true);
    try {
      const res = await uploadDocument(file);
      setRgDocUrl(res.url);
      setRgDocName(res.filename);
    } catch (err: any) {
      alert(err.message || 'Erro ao fazer upload do documento RG.');
    } finally {
      setRgUploading(false);
    }
  };

  // Handle Transcript File Upload
  const handleTranscriptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTranscriptFile(file);
    setTranscriptUploading(true);
    try {
      const res = await uploadDocument(file);
      setTranscriptUrl(res.url);
      setTranscriptName(res.filename);
    } catch (err: any) {
      alert(err.message || 'Erro ao fazer upload do histórico escolar.');
    } finally {
      setTranscriptUploading(false);
    }
  };

  // Check if form is ready
  const isFormValid =
    schoolId.trim() !== '' &&
    studentName.trim().length >= 3 &&
    birthDate !== '' &&
    !birthDateError &&
    motherName.trim() !== '' &&
    phone.trim().length >= 10 &&
    email.trim() !== '' &&
    street.trim() !== '' &&
    neighborhood.trim() !== '' &&
    !ejaAgeError &&
    !rgUploading &&
    !transcriptUploading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const payload: Partial<StudentApplication> = {
        modality,
        schoolId,
        studentName,
        lastGradeCompleted,
        enteringGrade,
        birthDate,
        age: currentAge,
        gender,
        raceColor,
        motherName,
        fatherName,
        motherCpf,
        fatherCpf,
        useResponsibleRg,
        rgDocumentUrl: rgDocUrl || undefined,
        rgDocumentName: rgDocName || undefined,
        transcriptUrl: transcriptUrl || undefined,
        transcriptName: transcriptName || undefined,
        phone,
        email,
        street,
        number,
        neighborhood,
        city,
        income,
        bolsaFamilia,
      };

      const result = await submitApplication(payload);
      onSuccess(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Ocorreu um erro ao enviar a inscrição.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Top Navigation */}
      <button
        onClick={onBack}
        className="inline-flex items-center space-x-2 text-slate-600 hover:text-slate-900 font-medium text-sm mb-6 group transition-colors"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Voltar para a seleção de modalidades</span>
      </button>

      {/* Main Form Container */}
      <div className="bg-white/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/70 overflow-hidden">
        {/* Form Title Banner */}
        <div className="bg-indigo-900/90 text-white p-6 sm:p-8 backdrop-blur-md border-b border-white/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider bg-amber-400 text-indigo-950 px-3 py-1 rounded-full inline-block mb-2 shadow-sm">
                Formulário de Pré-Matrícula
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight text-white">
                {MODALITY_LABELS[modality]}
              </h2>
              <p className="text-indigo-200 text-xs sm:text-sm mt-1">
                Preencha as informações abaixo com atenção para solicitar a vaga escolar em Serrinha-BA.
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <FileText className="w-6 h-6 text-amber-300" />
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="m-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-800 rounded-r-lg text-sm flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Atenção!</p>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          {/* Section 1: Modality & School Selection */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
              <SchoolIcon className="w-5 h-5 text-blue-700" />
              <span>1. Modalidade e Escolha da Escola</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Modalidade (Disabled) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Modalidade / Ensino
                </label>
                <input
                  type="text"
                  disabled
                  value={MODALITY_LABELS[modality]}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-300 text-slate-600 font-medium rounded-lg text-sm cursor-not-allowed"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Esta opção vem marcada de acordo com a seção selecionada.
                </p>
              </div>

              {/* Escola (Filtered Dropdown) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Escola Desejada <span className="text-red-500">*</span>
                </label>
                {loadingSchools ? (
                  <div className="flex items-center space-x-2 py-2 text-slate-500 text-xs">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span>Carregando escolas da modalidade...</span>
                  </div>
                ) : (
                  <select
                    required
                    value={schoolId}
                    onChange={(e) => setSchoolId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                  >
                    {schools.length === 0 ? (
                      <option value="">Nenhuma escola encontrada para esta modalidade</option>
                    ) : (
                      schools.map((sch) => (
                        <option key={sch.id} value={sch.id}>
                          {sch.name} - ({sch.address})
                        </option>
                      ))
                    )}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Student Identification & Academic Level */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-700" />
              <span>2. Dados do Aluno</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome Completo */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo do Aluno <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Digite o nome completo conforme certidão/documento"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              {/* Data de Nascimento */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Data de Nascimento <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={birthDate}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className={`w-full px-3.5 py-2.5 border rounded-lg text-sm focus:ring-2 outline-none ${
                    birthDateError
                      ? 'border-red-400 focus:ring-red-500'
                      : 'border-slate-300 focus:ring-blue-600'
                  }`}
                />
                {birthDateError ? (
                  <p className="text-xs font-semibold text-red-600 mt-1">{birthDateError}</p>
                ) : (
                  birthDate && (
                    <p className="text-xs font-medium text-blue-700 mt-1">
                      Idade identificada: {currentAge} anos
                    </p>
                  )
                )}
              </div>

              {/* Escolaridade na qual está ingressando */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Escolaridade / Série na qual está ingressando <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={enteringGrade}
                  onChange={(e) => setEnteringGrade(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none bg-white font-medium text-slate-900"
                >
                  {ENTERING_GRADES[modality].map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </div>

              {/* Escolaridade / Última série concluída (sempre anterior à série de ingresso) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Última Série / Escolaridade Concluída <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={lastGradeCompleted}
                  onChange={(e) => setLastGradeCompleted(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none bg-white font-medium text-slate-900"
                >
                  {priorSchoolingOptions.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Mostra apenas etapas anteriores à série de ingresso selecionada acima.
                </p>
              </div>


              {/* EJA Age Alert Message */}
              {ejaAgeError && (
                <div className="md:col-span-2 p-4 bg-red-100 border border-red-300 text-red-800 rounded-xl text-sm flex items-start space-x-3 animate-pulse">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Restrição de Idade no EJA:</span>
                    <span>{ejaAgeError}</span>
                  </div>
                </div>
              )}

              {/* Gênero */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gênero <span className="text-red-500">*</span>
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm bg-white outline-none"
                >
                  <option value="Feminino">Feminino</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Não Binário">Não Binário</option>
                </select>
              </div>

              {/* Cor / Raça */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cor / Raça <span className="text-red-500">*</span>
                </label>
                <select
                  value={raceColor}
                  onChange={(e) => setRaceColor(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm bg-white outline-none"
                >
                  <option value="Parda">Parda</option>
                  <option value="Preta">Preta</option>
                  <option value="Branca">Branca</option>
                  <option value="Amarela">Amarela</option>
                  <option value="Indígena">Indígena</option>
                </select>
              </div>
            </div>

            {/* Document Attachments (RG & History) */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Documentação do Aluno (Anexos)
              </h4>

              {/* RG Checkbox toggle & File Upload */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="useResponsibleRg"
                    disabled={modality === 'educacao-infantil'}
                    checked={useResponsibleRg}
                    onChange={(e) => setUseResponsibleRg(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 disabled:opacity-60"
                  />
                  <label htmlFor="useResponsibleRg" className="text-xs font-semibold text-slate-800">
                    Usar RG do Responsável
                  </label>
                  {modality === 'educacao-infantil' && (
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium">
                      Obrigatório para Educação Infantil
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {useResponsibleRg ? 'Anexo do RG do Responsável (Frente e Verso)' : 'Anexo do RG do Aluno (Frente e Verso)'}
                  </label>
                  <div className="flex items-center space-x-3">
                    <label className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 transition-colors shadow-sm">
                      <Upload className="w-4 h-4 text-blue-600" />
                      <span>{rgDocName ? 'Substituir RG' : 'Anexar RG (PDF/Foto)'}</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleRgUpload}
                        className="hidden"
                      />
                    </label>
                    {rgUploading && (
                      <span className="text-xs text-blue-600 flex items-center gap-1">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Enviando...
                      </span>
                    )}
                    {rgDocName && !rgUploading && (
                      <span className="text-xs text-emerald-700 flex items-center gap-1 font-medium">
                        <CheckCircle className="w-4 h-4 text-emerald-600" /> {rgDocName}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Anexo Histórico Escolar */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Anexo do Histórico Escolar ou Declaração de Transferência (PDF ou Foto)
                </label>
                <div className="flex items-center space-x-3">
                  <label className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 transition-colors shadow-sm">
                    <Upload className="w-4 h-4 text-blue-600" />
                    <span>{transcriptName ? 'Substituir Histórico' : 'Anexar Histórico (PDF/Foto)'}</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleTranscriptUpload}
                      className="hidden"
                    />
                  </label>
                  {transcriptUploading && (
                    <span className="text-xs text-blue-600 flex items-center gap-1">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Enviando...
                    </span>
                  )}
                  {transcriptName && !transcriptUploading && (
                    <span className="text-xs text-emerald-700 flex items-center gap-1 font-medium">
                      <CheckCircle className="w-4 h-4 text-emerald-600" /> {transcriptName}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Parents & Contacts */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Phone className="w-5 h-5 text-blue-700" />
              <span>3. Filiação e Contatos</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mãe */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo da Mãe <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={motherName}
                  onChange={(e) => setMotherName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              {/* CPF Mãe */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  CPF da Mãe
                </label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={motherCpf}
                  onChange={(e) => setMotherCpf(formatCPF(e.target.value))}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none font-mono"
                />
              </div>

              {/* Pai */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo do Pai
                </label>
                <input
                  type="text"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              {/* CPF Pai */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  CPF do Pai
                </label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={fatherCpf}
                  onChange={(e) => setFatherCpf(formatCPF(e.target.value))}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none font-mono"
                />
              </div>

              {/* Telefone / Contato */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Telefone de Contato / Celular <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="(75) 90000-0000"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none font-mono"
                />
              </div>

              {/* E-mail */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  E-mail para Notificações de Status <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  O número de protocolo e avisos de aprovação serão enviados para este e-mail.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Address & Socioeconomic */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Home className="w-5 h-5 text-blue-700" />
              <span>4. Endereço e Informações Socioeconômicas</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Logradouro / Rua <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Rua Luiz Viana"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Número <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 120 ou S/N"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bairro <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Centro, Cidade Nova"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cidade / Estado
                </label>
                <input
                  type="text"
                  disabled
                  value={city}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-300 text-slate-600 font-semibold rounded-lg text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Renda Familiar Aproximada
                </label>
                <input
                  type="text"
                  placeholder="Ex: R$ 1.500,00"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Beneficiário do Bolsa Família?
                </label>
                <div className="flex items-center space-x-4 py-2">
                  <label className="flex items-center space-x-2 text-sm text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="bolsaFamilia"
                      checked={bolsaFamilia}
                      onChange={() => setBolsaFamilia(true)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span>Sim</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="bolsaFamilia"
                      checked={!bolsaFamilia}
                      onChange={() => setBolsaFamilia(false)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span>Não</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Submission Action Bar */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-2.5 text-slate-600 hover:text-slate-900 font-semibold text-sm transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={!isFormValid || submitting}
              className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center space-x-2 transition-all shadow-md ${
                isFormValid && !submitting
                  ? 'bg-blue-700 hover:bg-blue-800 shadow-blue-700/20 active:scale-[0.98]'
                  : 'bg-slate-300 cursor-not-allowed text-slate-500'
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Enviando solicitação...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Prosseguir e Confirmar Inscrição</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
