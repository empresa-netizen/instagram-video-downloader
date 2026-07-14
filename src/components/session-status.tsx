"use client";

export function SessionStatus() {
  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <div className="absolute top-5 right-5 z-10 flex items-center gap-3 rounded-full border border-[#a8cdb7] bg-white/90 px-3 py-2 text-xs font-semibold text-[#24332d] shadow-sm backdrop-blur">
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        Você está logado
      </span>
      <button onClick={logout} className="text-[#4a564f] underline hover:text-[#24332d]">
        Sair
      </button>
    </div>
  );
}
