"use client";

import { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import GestureCameraModal from "./GestureCameraModal";
import Image from "next/image";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { applyJobMutationFn } from "@/lib/api";
import { useRouter } from "next/navigation";
import { buildSchema } from "@/utils/buildSchema";
import { toast } from "@/hooks/use-toast";

const dummyLocations = [
  "Jakarta",
  "Bandung",
  "Surabaya",
  "Medan",
  "Yogyakarta",
];
const countryCodes = [
  { code: "+62", label: "Indonesia", flag: "/assets/flags/id.png" },
  { code: "+1", label: "United States", flag: "/assets/flags/us.png" },
];

export default function ApplyForm({
  token,
  jobId,
  profileRequirements = {},
}: {
  token?: string;
  jobId: string;
  profileRequirements?: Record<string, string>;
}) {
  const router = useRouter();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [country, setCountry] = useState(countryCodes[0]);
  const [errorMsg, setErrorMsg] = useState("");

  const schema = useMemo(
    () => buildSchema(profileRequirements),
    [profileRequirements]
  );
  type ApplyFormValues = z.infer<typeof schema>;

  const form = useForm<ApplyFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {},
  });

  const { mutate, isPending } = useMutation({
    mutationFn: ({ jobId, data }: { jobId: string; data: any }) =>
      applyJobMutationFn(jobId, data, token!),
    onSuccess: () => {
      form.reset();
      setCapturedImage(null);
      router.push("/apply-success");
    },
    onError: (error: any) => {
      // Ambil message dari response API jika ada
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Terjadi kesalahan. Silakan coba lagi.";

      setErrorMsg(message);
    },
  });

  const onSubmit = (values: ApplyFormValues) => {
    const payload: any = { ...values };
    if ("phoneNumber" in payload && payload.phoneNumber) {
      payload.phoneNumber = `${payload.countryCode || "+62"}${
        payload.phoneNumber
      }`;
      delete payload.countryCode;
    }
    if (capturedImage) payload.photoProfile = capturedImage;
    mutate({ jobId, data: payload });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-6">
        {/* 1. Photo Profile */}
        {profileRequirements?.photoProfile !== "off" && (
          <Controller
            name="photoProfile"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Photo Profile{" "}
                  {profileRequirements.photoProfile === "mandatory" && "*"}
                </FormLabel>
                <FormControl>
                  <div className="flex flex-col gap-4 items-start">
                    {!capturedImage && (
                      <Image
                        src="/assets/illustration/dummy.png"
                        alt="photo"
                        width={100}
                        height={100}
                        className="w-32"
                      />
                    )}
                    {capturedImage && (
                      <img
                        src={capturedImage}
                        alt="Captured"
                        className="rounded-md border w-48 h-48 object-cover shadow-md"
                      />
                    )}
                    <GestureCameraModal
                      onCapture={(img) => {
                        setCapturedImage(img);
                        field.onChange(img);
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* 2. Full Name */}
        {profileRequirements?.fullName !== "off" && (
          <Controller
            name="fullName"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Full Name{" "}
                  {profileRequirements.fullName === "mandatory" && "*"}
                </FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* 3. Date of Birth */}
        {profileRequirements?.dateOfBirth !== "off" && (
          <Controller
            name="dateOfBirth"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Date of Birth{" "}
                  {profileRequirements.dateOfBirth === "mandatory" && "*"}
                </FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* 4. Pronoun / Gender */}
        {profileRequirements?.gender !== "off" && (
          <Controller
            name="gender"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Gender {profileRequirements.gender === "mandatory" && "*"}
                </FormLabel>
                <FormControl className="flex gap-4">
                  <div className="flex">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="Male"
                        checked={field.value === "Male"}
                        onChange={() => field.onChange("Male")}
                      />
                      Male
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="Female"
                        checked={field.value === "Female"}
                        onChange={() => field.onChange("Female")}
                      />
                      Female
                    </label>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* 5. Domicile */}
        {profileRequirements?.domicile !== "off" && (
          <Controller
            name="domicile"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Domicile {profileRequirements.domicile === "mandatory" && "*"}
                </FormLabel>
                <FormControl>
                  <Select {...field} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your domicile" />
                    </SelectTrigger>
                    <SelectContent>
                      {dummyLocations.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* 6. Phone Number */}
        {profileRequirements?.phoneNumber !== "off" && (
          <Controller
            name="phoneNumber"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Phone Number{" "}
                  {profileRequirements.phoneNumber === "mandatory" && "*"}
                </FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Select
                      value={country.code}
                      onValueChange={(val) => {
                        const selected = countryCodes.find(
                          (c) => c.code === val
                        );
                        if (selected) setCountry(selected);
                        field.onChange(
                          val + field.value?.replace(/^\+?\d+/, "") || ""
                        );
                      }}
                    >
                      <SelectTrigger className="w-28 flex items-center gap-2">
                        <Image
                          src={country.flag}
                          alt={country.label}
                          width={24}
                          height={16}
                        />
                        <span>{country.code}</span>
                      </SelectTrigger>
                      <SelectContent>
                        {countryCodes.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            <div className="flex items-center gap-2">
                              <Image
                                src={c.flag}
                                alt={c.label}
                                width={24}
                                height={16}
                              />
                              <span>{c.code}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="tel"
                      placeholder="8123456789"
                      {...field}
                      className="flex-1"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* 7. Email */}
        {profileRequirements?.email !== "off" && (
          <Controller
            name="email"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Email {profileRequirements.email === "mandatory" && "*"}
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="example@email.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* 8. LinkedIn URL */}
        {profileRequirements?.linkedinLink !== "off" && (
          <Controller
            name="linkedinLink"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  LinkedIn URL{" "}
                  {profileRequirements.linkedinLink === "mandatory" && "*"}
                </FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Submit */}
        <div className="pt-4 border-t">
          {errorMsg && <p className="text-red-500">{errorMsg}</p>}
          <Button
            type="submit"
            className="ml-auto block hover:bg-opacity-90"
            disabled={isPending || errorMsg !== ""}
          >
            {isPending ? "Submitting..." : "Submit Application"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
