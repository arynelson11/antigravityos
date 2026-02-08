'use client';
import { useState, useEffect, useRef } from 'react';
import { User, Shield, Moon, LogOut, Save, X, ChevronRight, Mail, Phone, Upload, RefreshCw, Smartphone } from "lucide-react";
import { getUserProfile, updateUserProfile } from "@/app/actions";
import { useRouter } from 'next/navigation';

// Fotos realistas para rotação
const REALISTIC_AVATARS = [
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400&h=400&fit=crop",
];

export default function SettingsPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [editName, setEditName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');

    const [showAccountModal, setShowAccountModal] = useState(false);
    const [showSecurityModal, setShowSecurityModal] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        getUserProfile().then((data: any) => {
            if (data) {
                setUser(data);
                setEditName(data.name);
                setAvatarUrl(data.avatar_url || REALISTIC_AVATARS[0]);
            }
        });
    }, []);

    // --- ENGINE DE COMPRESSÃO ---
    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 600;
                    const scaleSize = MAX_WIDTH / img.width;

                    const finalWidth = img.width > MAX_WIDTH ? MAX_WIDTH : img.width;
                    const finalHeight = img.width > MAX_WIDTH ? img.height * scaleSize : img.height;

                    canvas.width = finalWidth;
                    canvas.height = finalHeight;

                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, finalWidth, finalHeight);

                    // Comprime para JPEG 70%
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    resolve(compressedDataUrl);
                };
            };
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            try {
                const compressedBase64 = await compressImage(file);
                setAvatarUrl(compressedBase64);
            } catch (error) {
                console.error("Erro na compressão", error);
                alert("Erro ao processar imagem.");
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleRandomAvatar = () => {
        const random = REALISTIC_AVATARS[Math.floor(Math.random() * REALISTIC_AVATARS.length)];
        setAvatarUrl(random);
    };

    if (!user) return (
        <div className="bg-[#050505] min-h-screen p-8 flex items-center justify-center">
            <div className="text-gray-500 animate-pulse">Carregando perfil...</div>
        </div>
    );

    return (
        <div className="bg-[#050505] min-h-screen p-6 md:p-8 pb-24 md:pb-0">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-white">Ajustes</h1>

                {/* CARTÃO DE PERFIL */}
                <div className="relative overflow-hidden p-[1px] rounded-[32px] bg-gradient-to-br from-white/10 to-transparent mb-8">
                    <div className="bg-[#0A0A0A] rounded-[31px] p-8 relative z-10">
                        <div className="flex flex-col md:flex-row items-center gap-8">

                            {/* Foto */}
                            <div className="relative group">
                                <div className="w-28 h-28 rounded-full border-4 border-[#1A1A1A] shadow-2xl overflow-hidden relative flex items-center justify-center bg-black">
                                    {isUploading ? (
                                        <span className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    ) : (
                                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    )}
                                </div>

                                {isEditing && (
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="p-2 bg-violet-600 text-white rounded-full hover:scale-110 transition"
                                            disabled={isUploading}
                                            title="Upload"
                                        >
                                            <Upload size={14} />
                                        </button>
                                        <button
                                            onClick={handleRandomAvatar}
                                            className="p-2 bg-[#222] text-white rounded-full hover:scale-110 transition"
                                            title="Aleatório"
                                        >
                                            <RefreshCw size={14} />
                                        </button>
                                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                                    </div>
                                )}
                            </div>

                            {/* Dados */}
                            <div className="flex-1 text-center md:text-left w-full">
                                {isEditing ? (
                                    <form action={async (formData) => {
                                        formData.set('avatarUrl', avatarUrl);
                                        await updateUserProfile(formData);
                                        setIsEditing(false);
                                        setUser({ ...user, name: editName, avatar_url: avatarUrl });
                                        router.refresh();
                                    }} className="space-y-4">
                                        <div>
                                            <label className="text-[10px] uppercase text-gray-500 font-bold">Nome</label>
                                            <input
                                                name="name"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="w-full bg-[#151515] border-b border-white/10 py-2 text-xl font-bold text-white outline-none focus:border-violet-500"
                                            />
                                            <input type="hidden" name="avatarUrl" value={avatarUrl} />
                                        </div>
                                        <div className="flex gap-3 justify-center md:justify-start">
                                            <button
                                                type="submit"
                                                disabled={isUploading}
                                                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition disabled:opacity-50"
                                            >
                                                <Save size={16} /> Salvar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsEditing(false)}
                                                className="px-5 py-2 bg-[#1A1A1A] hover:bg-[#222] text-white rounded-xl text-sm font-bold flex items-center gap-2 transition"
                                            >
                                                <X size={16} /> Cancelar
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <h2 className="text-3xl font-bold text-white mb-2">{user.name}</h2>
                                        <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                                            <span className="px-3 py-1 bg-violet-500/10 text-violet-400 text-xs font-bold rounded-full border border-violet-500/20">Admin</span>
                                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20">Premium</span>
                                        </div>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="text-sm font-bold text-gray-400 hover:text-white underline decoration-gray-700 underline-offset-4"
                                        >
                                            Editar Perfil
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Menus */}
                <div className="space-y-4">
                    <button onClick={() => setShowAccountModal(true)} className="w-full flex items-center justify-between p-5 rounded-2xl bg-[#0A0A0A] border border-white/5 hover:bg-[#111] transition group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-[#151515] flex items-center justify-center text-gray-400 group-hover:text-white group-hover:bg-violet-600 transition">
                                <User size={22} />
                            </div>
                            <div className="text-left">
                                <span className="block font-bold text-white text-lg">Minha Conta</span>
                                <span className="text-sm text-gray-500">Dados pessoais</span>
                            </div>
                        </div>
                        <ChevronRight size={16} className="text-gray-600 group-hover:text-white" />
                    </button>

                    <button onClick={() => setShowSecurityModal(true)} className="w-full flex items-center justify-between p-5 rounded-2xl bg-[#0A0A0A] border border-white/5 hover:bg-[#111] transition group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-[#151515] flex items-center justify-center text-gray-400 group-hover:text-white group-hover:bg-emerald-500 transition">
                                <Shield size={22} />
                            </div>
                            <div className="text-left">
                                <span className="block font-bold text-white text-lg">Segurança</span>
                                <span className="text-sm text-gray-500">Senha e 2FA</span>
                            </div>
                        </div>
                        <ChevronRight size={16} className="text-gray-600 group-hover:text-white" />
                    </button>

                    <div className="w-full flex items-center justify-between p-5 rounded-2xl bg-[#0A0A0A] border border-white/5 opacity-70">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-[#151515] flex items-center justify-center text-blue-400">
                                <Moon size={22} />
                            </div>
                            <div className="text-left">
                                <span className="block font-bold text-white text-lg">Aparência</span>
                                <span className="text-sm text-gray-500">Modo Escuro</span>
                            </div>
                        </div>
                        <div className="px-3 py-1 bg-[#151515] rounded-lg text-xs font-bold text-gray-400 border border-white/5">AUTO</div>
                    </div>

                    <div className="pt-8">
                        <button
                            onClick={() => alert("Logout realizado! (Simulação)")}
                            className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border border-rose-900/30 text-rose-500 hover:bg-rose-900/10 transition font-bold"
                        >
                            <LogOut size={20} /> Sair do App
                        </button>
                        <p className="text-center text-xs text-gray-600 mt-6">Antigravity OS v3.0 • Family Edition</p>
                    </div>
                </div>

                {/* Modal: Minha Conta */}
                {showAccountModal && (
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowAccountModal(false)}>
                        <div className="bg-[#111] border border-white/10 w-full max-w-md rounded-3xl p-6 relative animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setShowAccountModal(false)} className="absolute top-4 right-4 p-2 bg-white/5 rounded-full hover:bg-white/10">
                                <X size={18} className="text-gray-400" />
                            </button>
                            <h3 className="text-xl font-bold text-white mb-6">Minha Conta</h3>
                            <div className="space-y-4">
                                <div className="bg-[#1A1A1A] p-4 rounded-2xl flex items-center gap-4">
                                    <Mail className="text-gray-500" size={20} />
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 uppercase font-bold">E-mail</p>
                                        <input type="email" defaultValue="familia@antigravity.com" className="bg-transparent text-white w-full outline-none" />
                                    </div>
                                </div>
                                <div className="bg-[#1A1A1A] p-4 rounded-2xl flex items-center gap-4">
                                    <Phone className="text-gray-500" size={20} />
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 uppercase font-bold">Telefone</p>
                                        <input type="tel" defaultValue="+55 11 99999-9999" className="bg-transparent text-white w-full outline-none" />
                                    </div>
                                </div>
                                <button onClick={() => { setShowAccountModal(false); alert("Dados salvos!"); }} className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition">
                                    Salvar Alterações
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal: Segurança */}
                {showSecurityModal && (
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowSecurityModal(false)}>
                        <div className="bg-[#111] border border-white/10 w-full max-w-md rounded-3xl p-6 relative animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setShowSecurityModal(false)} className="absolute top-4 right-4 p-2 bg-white/5 rounded-full hover:bg-white/10">
                                <X size={18} className="text-gray-400" />
                            </button>
                            <h3 className="text-xl font-bold text-white mb-6">Segurança</h3>
                            <div className="space-y-4">
                                <div className="bg-[#1A1A1A] p-4 rounded-2xl">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-3">Alterar Senha</p>
                                    <input type="password" placeholder="Senha Atual" className="w-full bg-black/30 p-3 rounded-xl text-white mb-2 outline-none border border-transparent focus:border-white/20 placeholder-gray-600" />
                                    <input type="password" placeholder="Nova Senha" className="w-full bg-black/30 p-3 rounded-xl text-white outline-none border border-transparent focus:border-white/20 placeholder-gray-600" />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-[#1A1A1A] rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <Smartphone className="text-emerald-500" size={20} />
                                        <div>
                                            <p className="font-bold text-white text-sm">2FA Ativado</p>
                                            <p className="text-xs text-gray-500">Protegido</p>
                                        </div>
                                    </div>
                                    <div className="w-10 h-6 bg-emerald-500/20 rounded-full relative cursor-pointer border border-emerald-500/50">
                                        <div className="absolute right-1 top-1 w-4 h-4 bg-emerald-500 rounded-full shadow-lg"></div>
                                    </div>
                                </div>
                                <button onClick={() => { setShowSecurityModal(false); alert("Configurações salvas!"); }} className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition">
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
