import Logo from "@/components/logo";
import { Toaster } from "@/components/ui/toaster";
import Image from "next/image";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen w-full bg-slate-50 relative overflow-hidden">
      {/* Decorative Background Accents */}
      <div className="absolute top-[-15%] right-[-5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[600px] h-[600px] bg-secondary/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-6xl w-full mx-auto flex h-full z-10 relative">

        {/* Left Visual Pane (Hidden on Mobile) */}
        <div className="hidden lg:flex flex-col justify-between w-1/2 p-20 pt-24 h-full relative z-10">
          <div>
            <div className="mb-12">
              <Logo size="48px" fontSize="28px" />
            </div>
            <h1 className="text-5xl font-extrabold text-neutral-1000 mb-6 leading-[1.15] tracking-tight text-balance">
              Masa Depan Karir Anda Ada di Sini
            </h1>
            <p className="text-lg text-neutral-60 leading-relaxed max-w-md">
              Platform karir terdepan yang menghubungkan talenta terbaik dengan peluang kerja luar biasa di ekosistem modern.
            </p>
          </div>
          
          {/* Trust Badge */}
          <div className="flex items-center gap-4 text-sm font-medium text-neutral-50 bg-neutral-1000/90 py-3 px-6 rounded-full w-fit shadow-md">
            <span className="flex h-2 w-2 rounded-full bg-green-400 border border-green-200"></span>
            Bergabung dengan puluhan ribu profesional
          </div>
        </div>

        {/* Right Content Pane (Form) */}
        <div className="w-full lg:w-1/2 h-full flex flex-col justify-center items-center p-4 sm:p-8 lg:p-16">
          <div className="w-full max-w-[440px]">
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-8">
              <Logo size="44px" fontSize="26px" />
            </div>
            
            {/* Card Wrapper for Form */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl p-6 sm:p-10 w-full relative z-20">
              {children}
            </div>
          </div>
        </div>

      </div>
      <Toaster />
    </div>
  );
}
