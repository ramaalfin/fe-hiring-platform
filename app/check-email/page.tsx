import Image from "next/image";

export default function CheckEmailPage() {
  return (
    <div className="flex flex-col justify-center items-center w-full h-full min-h-screen bg-[#FAFAFA]">
      <div className="w-full max-w-[600px] mx-auto px-4">
        <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white">
          <h1 className="text-2xl font-semibold mb-2 text-neutral-90">
            Periksa Email Anda
          </h1>
          <p className="text-neutral-700 max-w-md text-sm">
            Kami sudah mengirimkan link login ke email anda yang berlaku dalam 5
            menit
          </p>
          <Image
            src="/assets/illustration/Container.svg"
            alt="Check Email Illustration"
            width={240}
            height={240}
            className="mt-6"
          />
        </div>
      </div>
    </div>
  );
}
