import { School, StudentApplication, ModalityType, AdminUser, AuthSession } from '../types';

const API_BASE = '/api';

export async function fetchSchools(modality?: ModalityType): Promise<School[]> {
  const url = modality ? `${API_BASE}/schools?modality=${modality}` : `${API_BASE}/schools`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erro ao carregar lista de escolas.');
  return res.json();
}

export async function uploadDocument(file: File): Promise<{ url: string; filename: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao enviar o arquivo.');
  }

  return res.json();
}

export async function submitApplication(data: Partial<StudentApplication>): Promise<{
  message: string;
  protocol: string;
  application: StudentApplication;
}> {
  const res = await fetch(`${API_BASE}/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao enviar pré-matrícula.');
  }

  return res.json();
}

export async function checkProtocolStatus(protocol: string): Promise<{
  protocol: string;
  studentName: string;
  schoolName: string;
  status: 'Pendente' | 'Cadastrado' | 'Rejeitado' | 'Lista de Espera';
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}> {
  const res = await fetch(`${API_BASE}/applications/protocol/${encodeURIComponent(protocol)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Protocolo não encontrado.');
  }
  return res.json();
}

export async function loginDirector(username: string, password: string): Promise<AuthSession> {
  const res = await fetch(`${API_BASE}/auth/director/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Falha na autenticação do diretor.');
  }

  return res.json();
}

export async function recoverDirectorPassword(email: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/auth/director/recover-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'E-mail não encontrado.');
  }

  return res.json();
}

export async function updateDirectorEmail(schoolId: string, email: string): Promise<void> {
  const res = await fetch(`${API_BASE}/director/email`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ schoolId, email })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao atualizar e-mail.');
  }
}

export async function fetchDirectorApplications(schoolId: string): Promise<StudentApplication[]> {
  const res = await fetch(`${API_BASE}/director/applications/${schoolId}`);
  if (!res.ok) throw new Error('Erro ao buscar solicitações da escola.');
  return res.json();
}

export async function updateApplicationStatus(
  protocol: string,
  status: 'Cadastrado' | 'Rejeitado' | 'Lista de Espera',
  rejectionReason?: string
): Promise<StudentApplication> {
  const res = await fetch(`${API_BASE}/director/applications/${protocol}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, rejectionReason })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao atualizar status.');
  }

  const json = await res.json();
  return json.application;
}

export async function registerAdmin(data: { username: string; password: string; email: string }): Promise<{
  message: string;
  admin: AdminUser;
}> {
  const res = await fetch(`${API_BASE}/admin/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro no cadastro de administrador.');
  }

  return res.json();
}

export async function loginAdmin(username: string, password: string): Promise<AuthSession> {
  const res = await fetch(`${API_BASE}/auth/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro de autenticação do administrador.');
  }

  return res.json();
}

export async function recoverAdminPassword(email: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/auth/admin/recover-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'E-mail de administrador não encontrado.');
  }

  return res.json();
}

export async function fetchPendingAdmins(): Promise<AdminUser[]> {
  const res = await fetch(`${API_BASE}/admin/pending`);
  if (!res.ok) throw new Error('Erro ao carregar lista de administradores pendentes.');
  return res.json();
}

export async function decidePendingAdmin(id: string, action: 'approve' | 'reject'): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/pending/${id}/decide`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao processar solicitação.');
  }
}

export async function registerSchool(schoolData: any): Promise<{ school: School }> {
  const res = await fetch(`${API_BASE}/admin/schools`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(schoolData)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao cadastrar escola.');
  }

  return res.json();
}

export async function deleteSchool(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/schools/${id}`, {
    method: 'DELETE'
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao excluir escola.');
  }
}

export async function fetchAllApplications(): Promise<StudentApplication[]> {
  const res = await fetch(`${API_BASE}/admin/applications`);
  if (!res.ok) throw new Error('Erro ao buscar lista geral de matrículas.');
  return res.json();
}

export async function fetchAnnouncement(): Promise<{ title: string; content: string; updatedAt: string }> {
  const res = await fetch(`${API_BASE}/announcement`);
  if (!res.ok) throw new Error('Erro ao carregar comunicado.');
  return res.json();
}

export async function updateAnnouncement(data: { title: string; content: string }): Promise<{ title: string; content: string; updatedAt: string }> {
  const res = await fetch(`${API_BASE}/admin/announcement`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao atualizar comunicado.');
  }

  return res.json();
}

export async function fetchEnrollmentStatus(): Promise<{ locked: boolean; message: string | null }> {
  const res = await fetch(`${API_BASE}/enrollment-status`);
  if (!res.ok) throw new Error('Erro ao verificar status das matrículas.');
  return res.json();
}

export async function setEnrollmentLock(locked: boolean): Promise<{ locked: boolean; message: string | null }> {
  const res = await fetch(`${API_BASE}/admin/enrollment-lock`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ locked })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao atualizar status das matrículas.');
  }

  return res.json();
}
