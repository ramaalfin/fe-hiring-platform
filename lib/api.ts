// lib/api.ts
import API from "./axios-client";
import Cookies from "js-cookie";

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
  const response = await API.post("/auth/login", data, {
    withCredentials: true,
  });

  const { access_token, refresh_token } = response.data;

  // ✅ simpan manual ke cookies FE (bukan HttpOnly)
  if (access_token) {
    Cookies.set("access_token", access_token, {
      secure: false,
      sameSite: "Lax",
      path: "/",
    });
  }

  if (refresh_token) {
    Cookies.set("refresh_token", refresh_token, {
      secure: false,
      sameSite: "Lax",
      path: "/",
    });
  }

  return response.data; // berisi { message, user, token? }
};

export const magicLoginMutationFn = async (data: { email: string }) => {
  const response = await API.post("/auth/magic-login", data, {
    withCredentials: true,
  });
  return response.data;
};

export const verifyMagicLoginMutationFn = async ({
  code,
}: {
  code: string;
}) => {
  const response = await API.get("/auth/magic-login/verify", {
    params: { code },
    headers: {
      "x-skip-refresh": "1",
    },
    withCredentials: true,
  });
  return response.data; // { message, user }
};

export const registerMutationFn = async (data: RegisterType) => {
  const response = await API.post("/auth/register", data, {
    withCredentials: true,
  });
  return response.data;
};

export const magicRegisterMutationFn = async (data: { email: string }) => {
  const response = await API.post("/auth/magic-register", data, {
    withCredentials: true,
  });
  return response.data;
};

export const verifyMagicRegisterMutationFn = async ({
  code,
}: {
  code: string;
}) => {
  const response = await API.get("/auth/magic-register/verify", {
    params: { code },
    headers: {
      "x-skip-refresh": "1",
    },
    withCredentials: true,
  });
  return response.data;
};

export const forgotPasswordMutationFn = async (data: ForgotPasswordType) => {
  const response = await API.post("/auth/password/forgot", data, {
    withCredentials: true,
  });
  return response.data;
};

export const resetPasswordMutationFn = async (data: ResetPasswordType) => {
  const response = await API.post("/auth/password/reset", data, {
    withCredentials: true,
  });
  return response.data;
};

export const verifyEmailMutationFn = async (data: VerifyEmailType) => {
  const response = await API.post("/auth/email/verify", data, {
    withCredentials: true,
  });
  return response.data;
};

export const getUserSessionQueryFn = async () => {
  const response = await API.get("/auth/me", {
    withCredentials: true,
  });
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
  const accessToken = Cookies.get("access_token");

  const response = await API.get("/auth/logout", {
    headers: {
      Authorization: accessToken ? `Bearer ${accessToken}` : "",
      "x-skip-refresh": "1",
    },
    withCredentials: true,
  });

  // Hapus token dari FE
  Cookies.remove("access_token", { path: "/" });
  Cookies.remove("refresh_token", { path: "/" });

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

export const getApplicationsByAdminFn = async (
  adminId: string,
  token: string
) => {
  const res = await API.get(`/applications/admin/${adminId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.applications;
};
