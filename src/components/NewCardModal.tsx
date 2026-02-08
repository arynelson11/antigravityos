'use client';
import { X, Check } from 'lucide-react';
import { useState } from 'react';
import { addCard } from '@/app/actions';
import { useRouter } from 'next/navigation';

export default function NewCardModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const router = useRouter();
    const [selectedTheme, setSelectedTheme] = useState('violet');

    if (!isOpen) return null;

    const handleSubmit = async (formData: FormData) => {
        await addCard(formData);
        onClose();
        router.refresh();
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-md rounded-3xl p-6 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>

                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        Novo Cartão 💳
                    </h3>
                    <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition"><X size={20} className="text-gray-400" /></button>
                </div>

                <form action={handleSubmit} className="space-y-5">

                    {/* Nome do Cartão */}
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Nome do Cartão</label>
                        <input name="name" type="text" required autoFocus className="w-full bg-[#151515] rounded-xl px-4 py-3 text-white outline-none border border-transparent focus:border-violet-500/50 transition placeholder-gray-600" placeholder="Ex: Nubank Ultravioleta" />
                    </div>

                    {/* Limite */}
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Limite Total (R$)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                            <input name="limit" type="number" step="0.01" required className="w-full bg-[#151515] rounded-xl pl-10 pr-4 py-3 text-white outline-none border border-transparent focus:border-violet-500/50 transition font-bold text-lg" placeholder="0,00" />
                        </div>
                    </div>

                    {/* Datas (Fechamento e Vencimento) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Dia Fechamento</label>
                            <input name="closingDay" type="number" min="1" max="31" required className="w-full bg-[#151515] rounded-xl px-4 py-3 text-white outline-none text-center font-bold border border-transparent focus:border-violet-500/50" placeholder="DD" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Dia Vencimento</label>
                            <input name="dueDay" type="number" min="1" max="31" required className="w-full bg-[#151515] rounded-xl px-4 py-3 text-white outline-none text-center font-bold border border-transparent focus:border-violet-500/50" placeholder="DD" />
                        </div>
                    </div>

                    {/* Seletor de Tema Visual */}
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Cor do Cartão</label>
                        <div className="flex gap-3">
                            {[
                                { id: 'violet', bg: 'linear-gradient(135deg, #4C1D95, #BE185D)' },
                                { id: 'black', bg: 'linear-gradient(135deg, #111, #333)' },
                                { id: 'blue', bg: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' },
                                { id: 'green', bg: 'linear-gradient(135deg, #065f46, #10b981)' },
                            ].map((theme) => (
                                <div key={theme.id}
                                    onClick={() => setSelectedTheme(theme.id)}
                                    className={`w-12 h-12 rounded-full cursor-pointer transition-transform hover:scale-110 flex items-center justify-center border-2 ${selectedTheme === theme.id ? 'border-white' : 'border-transparent'}`}
                                    style={{ background: theme.bg }}>
                                    {selectedTheme === theme.id && <Check size={16} className="text-white drop-shadow-md" />}
                                </div>
                            ))}
                            <input type="hidden" name="theme" value={selectedTheme} />
                        </div>
                    </div>

                    <button type="submit" className="w-full py-4 rounded-2xl font-bold text-black bg-white hover:bg-gray-200 transition transform active:scale-95 shadow-lg mt-4">
                        Criar Cartão
                    </button>
                </form>
            </div>
        </div>
    );
}
