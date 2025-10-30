import { z } from "zod";

export const jobSchema = z.object({
    jobName: z.string().min(3, "Nama pekerjaan harus diisi"),
    jobType: z.string().min(1, "Tipe pekerjaan harus diisi"),
    jobDescription: z.string().min(10, "Deskripsi minimal 10 karakter"),
    numberOfCandidateNeeded: z.coerce.number().min(1, "Jumlah kandidat minimal 1"),
    minimumSalary: z.string().min(1, "Gaji minimum wajib diisi"),
    maximumSalary: z.string().min(1, "Gaji maksimum wajib diisi"),
    minimumProfileInformationRequired: z.object({
        fullName: z.enum(["mandatory", "optional", "off"]),
        photoProfile: z.enum(["mandatory", "optional", "off"]),
        gender: z.enum(["mandatory", "optional", "off"]),
        domicile: z.enum(["mandatory", "optional", "off"]),
        email: z.enum(["mandatory", "optional", "off"]),
        phoneNumber: z.enum(["mandatory", "optional", "off"]),
        linkedinLink: z.enum(["mandatory", "optional", "off"]),
        dateOfBirth: z.enum(["mandatory", "optional", "off"]),
    }),
});

export type JobFormValues = z.infer<typeof jobSchema>;
