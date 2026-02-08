
"use client";

import { useState } from "react";
import { StepCard } from "@/components/ui/step-card";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState<string | null>(null);

    const handleLogin = async (provider: 'google' | 'apple') => {
        setLoading(provider);
        const supabase = createClient();
        await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        // Loading state persists until redirect happens
    };

    return (
        <div className="min-h-screen bg-black text-white grid lg:grid-cols-2 font-sans selection:bg-purple-500/30">

            {/* Coluna Esquerda: Branding & Steps */}
            <div className="relative hidden lg:flex flex-col justify-center p-12 overflow-hidden bg-black">
                {/* Gradiente Atmosférico */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#7c3aed] via-[#4c1d95] to-black opacity-80" />

                {/* Glow Effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-500/20 blur-[100px] rounded-full" />

                <div className="relative z-10 max-w-md mx-auto w-full space-y-12">

                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                            <div className="w-5 h-5 bg-black rounded-full" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">Antigravity</span>
                    </div>

                    {/* Título Principal */}
                    <div className="space-y-4">
                        <h1 className="text-5xl font-bold leading-tight tracking-tight">
                            Comece sua jornada <br />
                            <span className="text-purple-200">financeira hoje.</span>
                        </h1>
                        <p className="text-lg text-purple-200/60 max-w-sm">
                            Organize suas finanças, planeje o futuro e alcance a liberdade com a ajuda da IA.
                        </p>
                    </div>

                    {/* Steps Component */}
                    <div className="space-y-4">
                        <StepCard
                            step={1}
                            title="Crie sua conta"
                            description="Acesso imediato ao assistente."
                            active={true}
                        />
                        <StepCard
                            step={2}
                            title="Configure seu perfil"
                            description="Personalize suas metas."
                        />
                        <StepCard
                            step={3}
                            title="Conecte suas contas"
                            description="Sincronização automática."
                        />
                    </div>

                    {/* Footer Branding */}
                    <div className="pt-8 border-t border-white/10 flex items-center gap-4 text-xs text-purple-200/40">
                        <span>© 2026 Antigravity OS</span>
                        <span className="w-1 h-1 rounded-full bg-purple-500" />
                        <span>Made with AI</span>
                    </div>

                </div>
            </div>

            {/* Coluna Direita: Formulário */}
            <div className="flex flex-col justify-center p-8 lg:p-24 bg-black relative">

                <div className="max-w-md w-full mx-auto space-y-8">

                    {/* Header Mobile (Logo visaibilidade) */}
                    <div className="lg:hidden flex items-center gap-2 mb-8 text-purple-500">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                            <div className="w-4 h-4 bg-black rounded-full" />
                        </div>
                        <span className="text-lg font-bold text-white">Antigravity</span>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight">Crie sua conta</h2>
                        <p className="text-gray-400">Entre com seus dados para acessar o sistema.</p>
                    </div>

                    {/* Social Login */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => handleLogin('google')}
                            disabled={!!loading}
                            className="flex items-center justify-center gap-2 h-12 rounded-lg border border-zinc-800 hover:bg-zinc-900 transition-colors text-sm font-medium text-gray-300 disabled:opacity-50"
                        >
                            {loading === 'google' ? (
                                <span className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full" />
                            ) : (
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.333.533 12S5.867 24 12.48 24c3.44 0 6.04-1.133 8.16-3.293 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.12H12.48z" />
                                </svg>
                            )}
                            Google
                        </button>
                        <button
                            onClick={() => handleLogin('apple')}
                            disabled={!!loading}
                            className="flex items-center justify-center gap-2 h-12 rounded-lg border border-zinc-800 hover:bg-zinc-900 transition-colors text-sm font-medium text-gray-300 disabled:opacity-50"
                        >
                            {loading === 'apple' ? (
                                <span className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full" />
                            ) : (
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z" />
                                </svg>
                            )}
                            Apple
                        </button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-zinc-800"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-black px-2 text-zinc-500">Ou continue com email</span>
                        </div>
                    </div>

                    {/* Form */}
                    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-400 ml-1">Nome</label>
                                <input
                                    type="text"
                                    placeholder="Ex: João"
                                    className="w-full h-11 px-4 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-400 ml-1">Sobrenome</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Silva"
                                    className="w-full h-11 px-4 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-400 ml-1">Email</label>
                            <input
                                type="email"
                                placeholder="exemplo@email.com"
                                className="w-full h-11 px-4 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-400 ml-1">Senha</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="No mínimo 8 caracteres"
                                    className="w-full h-11 px-4 pr-10 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button className="w-full h-12 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 group">
                                Criar Conta
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                    </form>

                    {/* Footer Link */}
                    <p className="text-center text-sm text-zinc-500">
                        Já tem uma conta?{" "}
                        <Link href="/login" className="text-white font-bold hover:underline">
                            Entrar
                        </Link>
                    </p>

                </div>
            </div>

        </div>
    );
}
