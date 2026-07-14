"use client";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [password, setPassword] = useState(""); const [error, setError] = useState("");
  async function submit(event: FormEvent) { event.preventDefault(); const response = await fetch("/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) }); if (response.ok) window.location.href = "/"; else setError("Senha inválida."); }
  return <main className="flex min-h-screen items-center justify-center bg-[#f6f5f0] p-6"><form onSubmit={submit} className="w-full max-w-sm space-y-4 border border-[#a8cdb7] bg-white p-8 shadow-xl"><p className="font-serif text-3xl text-[#24332d]">MGTEAM Downloader</p><p className="text-sm text-[#4a564f]">Área privada</p><input className="w-full border p-3" value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Senha" autoFocus required /><button className="w-full bg-[#24332d] p-3 font-bold text-white">Entrar</button>{error && <p className="text-sm text-red-600">{error}</p>}</form></main>;
}
