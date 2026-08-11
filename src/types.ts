export type ModalityType =
  | 'educacao-infantil'
  | 'ensino-fundamental'
  | 'ensino-medio'
  | 'eja';

export type ApplicationStatus = 'Pendente' | 'Cadastrado' | 'Rejeitado' | 'Lista de Espera';

export interface School {
  id: string;
  name: string;
  modalities: ModalityType[];
  directorUsername: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  directorName: string;
  createdAt: string;
}

export interface StudentApplication {
  protocol: string;
  modality: ModalityType;
  schoolId: string;
  schoolName: string;
  studentName: string;
  lastGradeCompleted: string;
  enteringGrade: string;
  birthDate: string;
  age: number;
  gender: 'Masculino' | 'Feminino' | 'Não Binário';
  raceColor: 'Preta' | 'Parda' | 'Branca' | 'Amarela' | 'Indígena';
  motherName: string;
  fatherName: string;
  motherCpf: string;
  fatherCpf: string;
  rgDocumentUrl?: string;
  rgDocumentName?: string;
  useResponsibleRg: boolean;
  transcriptUrl?: string;
  transcriptName?: string;
  phone: string;
  email: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  income: string;
  bolsaFamilia: boolean;
  status: ApplicationStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  isMaster: boolean;
  status: 'active' | 'pending' | 'rejected';
  createdAt: string;
  expiresAt?: string;
}

export interface AuthSession {
  role: 'master_admin' | 'admin' | 'director';
  username: string;
  schoolId?: string;
  schoolName?: string;
  token?: string;
}

export const MODALITY_LABELS: Record<ModalityType, string> = {
  'educacao-infantil': 'Educação infantil',
  'ensino-fundamental': 'Ensino Fundamental',
  'ensino-medio': 'Ensino Médio',
  'eja': 'EDUCAÇÃO DE JOVENS E ADULTOS (EJA)'
};

export const ENTERING_GRADES: Record<ModalityType, string[]> = {
  'educacao-infantil': [
    'Berçário',
    'Maternal I',
    'Maternal II',
    'Pré I (Jardim I)',
    'Pré II (Jardim II)'
  ],
  'ensino-fundamental': [
    '1º ano',
    '2º ano',
    '3º ano',
    '4º ano',
    '5º ano',
    '6º ano',
    '7º ano',
    '8º ano',
    '9º ano'
  ],
  'ensino-medio': [
    '1ª do Ens. Médio',
    '2ª do Ens. Médio',
    '3ª do Ens. Médio'
  ],
  'eja': [
    'Ensino Fundamental: Para quem tem 15 anos ou mais',
    'Ensino Médio: Para quem tem 18 anos ou mais'
  ]
};

// Sequência geral (do mais inicial ao mais avançado) da educação básica,
// usada para calcular quais séries são "anteriores" a uma determinada série de ingresso.
export const SCHOOLING_LEVELS_SEQUENCE: string[] = [
  'Berçário',
  'Maternal I',
  'Maternal II',
  'Pré I (Jardim I)',
  'Pré II (Jardim II)',
  '1º ano',
  '2º ano',
  '3º ano',
  '4º ano',
  '5º ano',
  '6º ano',
  '7º ano',
  '8º ano',
  '9º ano',
  '1ª do Ens. Médio',
  '2ª do Ens. Médio',
  '3ª do Ens. Médio'
];

export const NO_PRIOR_SCHOOLING_OPTION = 'Nenhuma / Não se aplica (primeira etapa escolar)';

// Para o EJA, as opções de ingresso são faixas amplas; mapeamos cada uma para o
// ponto equivalente (exclusivo) na sequência geral, para saber o que conta como "anterior".
// EJA Fundamental: quem já concluiu até o 8º ano (não concluiu o 9º) pode ingressar.
// EJA Médio: quem já concluiu até a 2ª série do Médio (não concluiu a 3ª) pode ingressar.
const EJA_ENTRY_EQUIVALENT_LEVEL: Record<string, string> = {
  'Ensino Fundamental: Para quem tem 15 anos ou mais': '9º ano',
  'Ensino Médio: Para quem tem 18 anos ou mais': '3ª do Ens. Médio'
};

/**
 * Retorna as opções válidas de "última série / escolaridade concluída" para uma
 * determinada modalidade e série de ingresso: sempre uma etapa estritamente
 * anterior à série pretendida, na ordem real da educação básica.
 */
export function getPriorSchoolingOptions(modality: ModalityType, enteringGrade: string): string[] {
  if (!enteringGrade) return [NO_PRIOR_SCHOOLING_OPTION];

  const referenceLevel = modality === 'eja'
    ? EJA_ENTRY_EQUIVALENT_LEVEL[enteringGrade]
    : enteringGrade;

  const thresholdIndex = referenceLevel ? SCHOOLING_LEVELS_SEQUENCE.indexOf(referenceLevel) : -1;

  if (thresholdIndex <= 0) {
    return [NO_PRIOR_SCHOOLING_OPTION];
  }

  const priorLevels = SCHOOLING_LEVELS_SEQUENCE.slice(0, thresholdIndex);
  return [NO_PRIOR_SCHOOLING_OPTION, ...priorLevels];
}
