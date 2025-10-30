import { z } from "zod";

export const buildSchema = (req: Record<string, string> = {}) => {
    const getField = (key: string, base: z.ZodTypeAny) => {
        const status = req?.[key];

        if (status === "mandatory") return base.min(1, `${key} wajib diisi`);
        if (status === "off") return z.string().optional();
        if (status === "optional") return base.optional().nullable();
        return base.optional();
    };

    return z.object({
        fullName: getField("fullName", z.string()),
        email: getField("email", z.string().email("Format email tidak valid")),
        gender: getField("gender", z.string()),
        domicile: getField("domicile", z.string()),
        dateOfBirth: getField("dateOfBirth", z.string()),
        phoneNumber: getField("phoneNumber", z.string()),
        linkedinLink: getField("linkedinLink", z.string().url("URL tidak valid")),
        photoProfile: getField("photoProfile", z.string()),
    });
};
