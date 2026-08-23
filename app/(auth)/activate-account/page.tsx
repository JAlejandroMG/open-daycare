import Link from "next/link";

export default function ActivateAccountPage() {
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

        {/* Child card */}
        <div className="flex items-center gap-3.5 bg-white border-[1.5px] border-border-soft rounded-[16px] py-3.5 px-4 mb-[22px]">
          <div className="flex-none w-11 h-11 rounded-full bg-avatar-soft text-avatar-soft-text font-heading font-semibold text-[19px] flex items-center justify-center">
            M
          </div>
          <div>
            <div className="text-[13px] text-text-secondary">
              Te invitaron a seguir a
            </div>
            <div className="font-heading font-semibold text-[17px] text-foreground">
              Mateo · Sala Soles
            </div>
          </div>
        </div>

        {/* Invitation code */}
        <label className="block text-xs font-bold tracking-[0.7px] text-text-secondary mb-2">
          CÓDIGO DE INVITACIÓN
        </label>
        <input
          defaultValue="7K4P9"
          className="w-full px-4 py-3.5 rounded-[14px] border-[1.5px] border-border-soft bg-white text-[18px] tracking-[3px] font-bold text-foreground mb-[18px] font-heading focus:outline-none"
        />

        {/* Email */}
        <label className="block text-xs font-bold tracking-[0.7px] text-text-secondary mb-2">
          EMAIL
        </label>
        <input
          type="email"
          defaultValue="lucia.fernandez@gmail.com"
          className="w-full px-4 py-3.5 rounded-[14px] border-[1.5px] border-border-soft bg-white text-[15px] text-foreground mb-[18px] focus:outline-none"
        />

        {/* Password */}
        <label className="block text-xs font-bold tracking-[0.7px] text-text-secondary mb-2">
          CREAR CONTRASEÑA
        </label>
        <input
          type="password"
          defaultValue="contraseña"
          className="w-full px-4 py-3.5 rounded-[14px] border-[1.5px] border-coral-400 bg-white text-[15px] text-foreground mb-[18px] focus:outline-none"
        />

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

        {/* Activate button */}
        <button className="block w-full text-center py-[15px] rounded-[15px] bg-gradient-to-b from-coral-300 to-coral-500 text-white font-extrabold text-base shadow-[0_10px_22px_-8px_rgba(238,129,100,0.7)]">
          Activar mi cuenta
        </button>

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
