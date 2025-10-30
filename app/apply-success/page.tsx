import Image from "next/image";
import Link from "next/link";

export default function ApplySuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="rounded-xl p-8 max-w-md text-center">
        <Image
          src="/assets/illustration/success.svg"
          alt="Success"
          width={96}
          height={96}
          className="mx-auto mb-4"
        />
        <h1 className="text-2xl font-semibold mb-2">
          🎉 Your application was sent!
        </h1>
        <p className="text-neutral-90 text-sm mb-6">
          Congratulations! You've taken the first step towards a rewarding
          career at GetJob. We look forward to learning more about you during
          the application process.
        </p>
        <Link href="/">
          <button className="px-6 py-2 bg-primary text-white rounded-md hover:bg-hover-90">
            Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
}
