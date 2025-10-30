// lib/api.ts
import API from "./axios-client";

type LoginType = {
  email: string;
  password: string;
};

type RegisterType = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type ForgotPasswordType = {
  email: string;
};

type ResetPasswordType = {
  password: string;
  verificationCode: string;
};

type VerifyEmailType = {
  code: string;
};

type SessionType = {
  id: string;
  userId: string;
  userAgent: string;
  expiresAt: string;
  createdAt: string;
  isCurrent: boolean;
};

type SessionResponseType = {
  message: string;
  sessions: SessionType[];
};

/* ========================
   AUTHENTICATION
======================== */

export const loginMutationFn = async (data: LoginType) => {
  const response = await API.post("/auth/login", data);
  return response.data; // berisi { message, user, token? }
};

export const magicLoginMutationFn = async (data: { email: string }) => {
  const response = await API.post("/auth/magic-login", data);
  return response.data;
};

export const verifyMagicLoginMutationFn = async ({ code }: { code: string }) => {
  const response = await API.get("/auth/magic-login/verify", {
    params: { code },
    headers: {
      "x-skip-refresh": "1",
    },
  });
  return response.data; // { message, user }
};

export const registerMutationFn = async (data: RegisterType) => {
  const response = await API.post("/auth/register", data);
  return response.data;
};

export const magicRegisterMutationFn = async (data: { email: string }) => {
  const response = await API.post("/auth/magic-register", data);
  return response.data;
};

export const verifyMagicRegisterMutationFn = async ({ code }: { code: string }) => {
  const response = await API.get("/auth/magic-register/verify", {
    params: { code },
    headers: {
      "x-skip-refresh": "1",
    },
  });
  return response.data;
};

export const forgotPasswordMutationFn = async (data: ForgotPasswordType) => {
  const response = await API.post("/auth/password/forgot", data);
  return response.data;
};

export const resetPasswordMutationFn = async (data: ResetPasswordType) => {
  const response = await API.post("/auth/password/reset", data);
  return response.data;
};

export const verifyEmailMutationFn = async (data: VerifyEmailType) => {
  const response = await API.post("/auth/email/verify", data);
  return response.data;
};

export const getUserSessionQueryFn = async () => {
  const response = await API.get("/sessions");
  return response.data.user;
};

export const sessionQueryFn = async () => {
  const response = await API.get<SessionResponseType>("/sessions/all");
  return response.data;
};

export const sessionDeleteMutationFn = async (id: string) => {
  const response = await API.delete(`/sessions/${id}`);
  return response.data;
};

export const logoutMutationFn = async () => {
  const response = await API.get("/auth/logout");
  return response.data;
};

/* ========================
   JOB MANAGEMENT
======================== */

export const createJobMutationFn = async (data: any, token: string) => {
  const response = await API.post("/jobs", data, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updateJobMutationFn = async (id: string, data: any) => {
  const response = await API.patch(`/jobs/${id}`, data);
  return response.data;
};

export const deleteJobMutationFn = async (id: string) => {
  const response = await API.delete(`/jobs/${id}`);
  return response.data;
};

export const getJobByIdQueryFn = async (id: string) => {
  const response = await API.get(`/jobs/${id}`);
  return response.data;
};

export const getAllJobsQueryFn = async (token: string) => {
  const response = await API.get("/jobs", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getAdminJobsFn = async (adminId: string, token: string) => {
  const response = await API.get(`/jobs/admin/${adminId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.data;
};

export const applyJobMutationFn = async (
  jobId: string,
  formData: FormData,
  token: string
) => {
  const res = await API.post(`/applications/${jobId}/apply`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const getApplicationsByAdminFn = async (adminId: string, token: string) => {
  const res = await API.get(`/applications/admin/${adminId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.applications;
};
