"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
      return;
    }

    router.push("/");
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_1fr] bg-background">
      {/* Left panel — coral gradient, hidden on mobile */}
      <div className="relative hidden overflow-hidden lg:flex flex-col justify-between p-14 text-white bg-gradient-to-br from-coral-300 via-coral-400 to-coral-500">
        {/* Decorative circles */}
        <div className="absolute w-[420px] h-[420px] rounded-full bg-white/12 top-[-140px] right-[-120px]" />
        <div className="absolute w-[300px] h-[300px] rounded-full bg-white/10 bottom-[-110px] left-[-80px]" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex items-center justify-center w-[46px] h-[46px] rounded-[14px] bg-white/22">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          </div>
          <span className="font-heading font-semibold text-[21px] tracking-wide">
            OpenDayCare
          </span>
        </div>

        {/* Heading */}
        <div className="relative">
          <h1 className="font-heading font-semibold text-[42px] leading-[1.12] mb-[18px]">
            El día de cada niño,
            <br />
            compartido con su familia.
          </h1>
          <p className="text-[17px] leading-relaxed max-w-[430px] text-white/90">
            Publicá momentos, gestioná las salas y mantené a las familias cerca,
            desde un solo lugar.
          </p>
        </div>

        {/* Nursery name */}
        <div className="relative text-sm text-white/90">
          🌿 Guardería Sala Soles
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex items-center justify-center p-10">
        <form onSubmit={handleSubmit} className="w-full max-w-[392px]">
          <h2 className="font-heading font-semibold text-[30px] mb-1.5 text-foreground">
            Iniciar sesión
          </h2>
          <p className="mb-7 text-text-secondary text-[15px]">
            Ingresá para ver el día de hoy.
          </p>

          {/* Email */}
          <label className="block text-xs font-bold tracking-[0.7px] text-text-secondary mb-2">
            EMAIL
          </label>
          <input
            type="email"
            placeholder="caro@opendaycare.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3.5 rounded-[14px] border-[1.5px] border-border-soft bg-white text-[15px] text-foreground mb-[18px] focus:outline-none placeholder:text-text-muted"
          />

          {/* Password */}
          <label className="block text-xs font-bold tracking-[0.7px] text-text-secondary mb-2">
            CONTRASEÑA
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3.5 rounded-[14px] border-[1.5px] border-border-soft bg-white text-[15px] text-foreground mb-2.5 focus:outline-none placeholder:text-text-muted"
          />

          {/* Forgot password */}
          <div className="text-right mb-5">
            <span className="text-coral-800 text-[13.5px] font-bold cursor-pointer">
              ¿Olvidaste tu contraseña?
            </span>
          </div>

          {/* Login button */}
          <button
            type="submit"
            disabled={isLoading}
            className="block w-full text-center py-[15px] rounded-[15px] bg-gradient-to-b from-coral-300 to-coral-500 text-white font-extrabold text-base cursor-pointer shadow-[0_10px_22px_-8px_rgba(238,129,100,0.7)] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Ingresando…" : "Iniciar sesión"}
          </button>

          {/* Error message */}
          {error ? (
            <p className="mt-3 text-center text-sm font-semibold text-red-600">
              {error}
            </p>
          ) : null}

          {/* Link to activate account */}
          <p className="text-center mt-6 text-text-secondary text-[14.5px]">
            ¿Te invitó la guardería?{" "}
            <Link
              href="/activate-account"
              className="text-coral-800 font-extrabold"
            >
              Activá tu cuenta
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
