import { z } from "zod";

export const employerJobSchema = z.object({
    jobName: z.string().min(3, "Job name must be at least 3 characters"),
    jobType: z.string().min(1, "Job type is required"),
    jobDescription: z.string().min(10, "Description must be at least 10 characters"),
    numberOfCandidateNeeded: z.coerce.number().min(1, "At least 1 candidate needed"),
    minimumSalary: z.string().min(1, "Minimum salary is required"),
    maximumSalary: z.string().min(1, "Maximum salary is required"),
});

export type EmployerJobFormValues = z.infer<typeof employerJobSchema>;
