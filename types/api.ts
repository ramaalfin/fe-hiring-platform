// Standardized API Response Types
export interface ApiSuccessResponse<T = any> {
    success: true;
    message?: string;
    data: T;
    meta?: PaginationMeta;
}

export interface ApiErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        field?: string;
        details?: any;
    };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

// User Types
export interface User {
    id: string;
    fullName: string;
    email: string;
    role: "ADMIN" | "CANDIDATE";
    verified: boolean;
    createdAt: string;
    updatedAt: string;
}

// Job Types
export type ProfileFieldStatus = "MANDATORY" | "OPTIONAL" | "OFF";

export interface ProfileRequirements {
    fullName: ProfileFieldStatus;
    photoProfile: ProfileFieldStatus;
    gender: ProfileFieldStatus;
    domicile: ProfileFieldStatus;
    email: ProfileFieldStatus;
    phoneNumber: ProfileFieldStatus;
    linkedinLink: ProfileFieldStatus;
    dateOfBirth: ProfileFieldStatus;
}

export interface Job {
    id: string;
    jobName: string;
    jobType: string;
    jobDescription: string;
    numberOfCandidateNeeded: number;
    minimumSalary: string;
    maximumSalary: string;
    minimumProfileInformationRequired: ProfileRequirements;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    createdByUser?: {
        id: string;
        fullName: string;
        email: string;
    };
    hasApplied?: boolean;
    _count?: {
        applications: number;
    };
}

export interface CreateJobDTO {
    jobName: string;
    jobType: string;
    jobDescription: string;
    numberOfCandidateNeeded: number;
    minimumSalary: string;
    maximumSalary: string;
    minimumProfileInformationRequired: ProfileRequirements;
}

// Application Types
export interface ResumeData {
    fullName?: string;
    photoProfile?: string;
    gender?: string;
    domicile?: string;
    email?: string;
    phoneNumber?: string;
    linkedinLink?: string;
    dateOfBirth?: string;
    [key: string]: any;
}

export interface Application {
    id: string;
    jobId: string;
    userId: string;
    resume: ResumeData;
    createdAt: string;
    job?: {
        id: string;
        jobName: string;
        jobType: string;
        minimumSalary: string;
        maximumSalary: string;
    };
    user?: {
        id: string;
        fullName: string;
        email: string;
    };
}

// Auth Types
export interface LoginDTO {
    email: string;
    password: string;
}

export interface RegisterDTO {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface AuthResponse {
    user: User;
    access_token: string;
    refresh_token: string;
}

// Error Codes
export enum ErrorCode {
    VALIDATION_ERROR = "VALIDATION_ERROR",
    UNAUTHORIZED = "UNAUTHORIZED",
    FORBIDDEN = "FORBIDDEN",
    NOT_FOUND = "NOT_FOUND",
    CONFLICT = "CONFLICT",
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
}
