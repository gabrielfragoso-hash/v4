"use client";

import { useActionState } from "react";
import { loginPortal } from "./actions";

export function LoginGate({ slug, clientName }: { slug: string; clientName: string }) {
  const action = loginPortal.bind(null, slug);
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "linear-gradient(160deg, #0a0a0b 0%, #18181b 55%, #2a0508 100%)",
      }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-14 h-14 flex items-center justify-center font-black text-xl mb-4"
            style={{
              background: "#e40a14",
              color: "#fff",
              clipPath: "polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)",
              boxShadow: "0 8px 32px rgba(228,10,20,0.45)",
            }}
          >
            V4
          </div>
          <h1 className="text-white font-black text-xl tracking-tight">Portal do Cliente</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>
            {clientName} · V4 Company
          </p>
        </div>

        {/* Card */}
        <form
          action={formAction}
          className="rounded-2xl p-6 space-y-4"
          style={{
            background: "#ffffff",
            boxShadow: "0 24px 64px rgba(0,0,0,0.45)",
          }}
        >
          <div>
            <label htmlFor="user" className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "#6b6b70" }}>
              Usuário
            </label>
            <input
              id="user"
              name="user"
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              required
              placeholder="nome-da-empresa"
              className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none transition-shadow focus:ring-2"
              style={{
                background: "#f6f6f7",
                border: "1px solid #e4e4e7",
                color: "#141416",
              }}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "#6b6b70" }}>
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none transition-shadow focus:ring-2"
              style={{
                background: "#f6f6f7",
                border: "1px solid #e4e4e7",
                color: "#141416",
              }}
            />
          </div>

          {state?.error && (
            <p
              className="text-xs rounded-lg px-3 py-2.5 leading-relaxed"
              style={{ background: "rgba(228,10,20,0.07)", color: "#b91c1c", border: "1px solid rgba(228,10,20,0.2)" }}
            >
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg py-3 text-sm font-black uppercase tracking-wider text-white transition-opacity disabled:opacity-60"
            style={{ background: "#e40a14", boxShadow: "0 6px 20px rgba(228,10,20,0.35)" }}
          >
            {pending ? "Entrando..." : "Acessar meu projeto"}
          </button>

          <p className="text-[11px] text-center leading-relaxed pt-1" style={{ color: "#9b9ba1" }}>
            Não tem seus dados de acesso?
            <br />
            Fale com seu estrategista V4.
          </p>
        </form>

        <p className="text-center text-[10px] mt-6 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
          V4 Company · Processo de Estruturação
        </p>
      </div>
    </main>
  );
}
