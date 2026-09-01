"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { registerParentWithInvitation } from "@/app/actions/activate-account";

type FormErrors = {
  code?: string;
  fullName?: string;
  email?: string;
  password?: string;
};

export default function ActivateAccountPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const codeParam = searchParams.get("code");
  const showCodeField = !!codeParam;

  const [code, setCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function validate(): FormErrors {
    const newErrors: FormErrors = {};

    if (showCodeField && !code.trim()) {
      newErrors.code = "El código es obligatorio";
    }
    if (!fullName.trim()) {
      newErrors.fullName = "El nombre es obligatorio";
    }
    if (!email.trim()) {
      newErrors.email = "El email es obligatorio";
    }
    if (!password.trim()) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    return newErrors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);

    const result = await registerParentWithInvitation(
      showCodeField ? code : "",
      email,
      password,
      fullName
    );

    setIsSubmitting(false);

    if (!result.success) {
      setSubmitError(result.error);
      return;
    }

    router.push("/login?registered=true");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-10">
      <div className="w-full max-w-[440px]">
        {/* Logo icon */}
        <div className="w-[58px] h-[58px] rounded-[18px] bg-gradient-to-br from-coral-100 to-coral-400 flex items-center justify-center mb-[22px] shadow-[0_12px_26px_-10px_rgba(238,129,100,0.65)]">
          <svg
            width="30"
            height="30"
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

        {/* Title */}
        <h1 className="font-heading font-semibold text-[32px] leading-[1.15] mb-2 text-foreground">
          Bienvenida a OpenDayCare
        </h1>
        <p className="mb-[26px] text-text-secondary text-[15.5px] leading-[1.55]">
          Te invitaron a seguir el día de tu hijo. Creá tu contraseña para
          activar la cuenta.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Invitation code — only shown when ?code= is present */}
          {showCodeField && (
            <div>
              <label className="block text-xs font-bold tracking-[0.7px] text-text-secondary mb-2">
                CÓDIGO DE INVITACIÓN
              </label>
              <input
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  if (errors.code) setErrors((prev) => ({ ...prev, code: undefined }));
                }}
                placeholder="Ej. 7K4P9"
                maxLength={5}
                className={`w-full px-4 py-3.5 rounded-[14px] border-[1.5px] bg-white text-[18px] tracking-[3px] font-bold text-foreground mb-1 font-heading focus:outline-none ${
                  errors.code ? "border-red-400" : "border-border-soft"
                }`}
              />
              {errors.code && (
                <p className="mb-[14px] text-[13px] text-red-500">{errors.code}</p>
              )}
              {!errors.code && <div className="mb-[18px]" />}
            </div>
          )}

          {/* Full name */}
          <label className="block text-xs font-bold tracking-[0.7px] text-text-secondary mb-2">
            NOMBRE COMPLETO
          </label>
          <input
            type="text"
            placeholder="Ej. Lucía Fernández"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
            }}
            className={`w-full px-4 py-3.5 rounded-[14px] border-[1.5px] bg-white text-[15px] text-foreground mb-1 focus:outline-none placeholder:text-text-muted ${
              errors.fullName ? "border-red-400" : "border-border-soft"
            }`}
          />
          {errors.fullName && (
            <p className="mb-[14px] text-[13px] text-red-500">{errors.fullName}</p>
          )}
          {!errors.fullName && <div className="mb-[18px]" />}

          {/* Email */}
          <label className="block text-xs font-bold tracking-[0.7px] text-text-secondary mb-2">
            EMAIL
          </label>
          <input
            type="email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            className={`w-full px-4 py-3.5 rounded-[14px] border-[1.5px] bg-white text-[15px] text-foreground mb-1 focus:outline-none placeholder:text-text-muted ${
              errors.email ? "border-red-400" : "border-border-soft"
            }`}
          />
          {errors.email && (
            <p className="mb-[14px] text-[13px] text-red-500">{errors.email}</p>
          )}
          {!errors.email && <div className="mb-[18px]" />}

          {/* Password */}
          <label className="block text-xs font-bold tracking-[0.7px] text-text-secondary mb-2">
            CREAR CONTRASEÑA
          </label>
          <input
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            className={`w-full px-4 py-3.5 rounded-[14px] border-[1.5px] bg-white text-[15px] text-foreground mb-1 focus:outline-none placeholder:text-text-muted ${
              errors.password ? "border-red-400" : "border-border-soft"
            }`}
          />
          {errors.password && (
            <p className="mb-[14px] text-[13px] text-red-500">{errors.password}</p>
          )}
          {!errors.password && <div className="mb-[18px]" />}

          {/* Authorization checkbox */}
          <label className="flex items-start gap-3 bg-[#FBF1D6] rounded-[14px] py-3.5 px-4 mb-6 cursor-pointer">
            <span className="flex-none w-6 h-6 rounded-lg bg-[#5FB97E] flex items-center justify-center mt-px">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <span className="text-sm text-[#8A7234] leading-[1.45]">
              Autorizo a la guardería a tomar y compartir fotos de mi hijo dentro
              de la app.
            </span>
          </label>

          {/* Submit error */}
          {submitError && (
            <p className="mb-4 text-center text-[13px] text-red-500">{submitError}</p>
          )}

          {/* Activate button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="block w-full text-center py-[15px] rounded-[15px] bg-gradient-to-b from-coral-300 to-coral-500 text-white font-extrabold text-base shadow-[0_10px_22px_-8px_rgba(238,129,100,0.7)] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Activando..." : "Activar mi cuenta"}
          </button>
        </form>

        {/* Link to login */}
        <p className="text-center mt-[22px] text-text-secondary text-[14.5px]">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="text-coral-800 font-extrabold">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
