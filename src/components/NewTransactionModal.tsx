'use client';
import { X, CreditCard, Calendar, Wallet, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { addTransaction } from '@/app/actions';
import { useRouter } from 'next/navigation';

export default function NewTransactionModal({ isOpen, onClose, type }: { isOpen: boolean; onClose: () => void; type: 'income' | 'expense' }) {
    const router = useRouter();
    const [method, setMethod] = useState<'debit' | 'credit'>('debit');

    if (!isOpen) return null;

    const handleSubmit = async (formData: FormData) => {
        await addTransaction(formData);
        onClose();
        router.refresh();
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
            <div className="bg-[#0A0A0A] border-t md:border border-white/10 w-full max-w-lg rounded-t-3xl md:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300" onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        {type === 'income' ? <span className="text-emerald-500">Receita 💰</span> : <span className="text-rose-500">Nova Despesa 💸</span>}
                    </h3>
                    <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition"><X size={20} className="text-gray-400" /></button>
                </div>

                <form action={handleSubmit} className="space-y-6">
                    <input type="hidden" name="type" value={type} />

                    {/* Input Valor Gigante */}
                    <div className="relative">
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 text-lg">R$</span>
                        <input name="amount" type="number" step="0.01" required autoFocus
                            className="w-full bg-transparent border-b border-white/10 text-5xl font-bold py-2 pl-8 focus:outline-none focus:border-violet-500 text-white placeholder-gray-800 transition-colors"
                            placeholder="0,00"
                        />
                    </div>

                    {/* Descrição & Categoria */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Descrição</label>
                            <input name="description" type="text" required className="w-full bg-[#151515] rounded-xl px-4 py-3.5 text-white outline-none border border-transparent focus:border-violet-500/50 transition" placeholder="Ex: Mercado" />
                        </div>
                        <div className="space-y-1 relative">
                            <label className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Categoria</label>
                            <div className="relative">
                                <select name="category" className="w-full bg-[#151515] appearance-none rounded-xl px-4 py-3.5 text-white outline-none border border-transparent focus:border-violet-500/50 transition cursor-pointer">
                                    <option value="Geral">Geral</option>
                                    <option value="Alimentação">🍔 Alimentação</option>
                                    <option value="Transporte">🚗 Transporte</option>
                                    <option value="Casa">🏠 Casa</option>
                                    <option value="Lazer">🎮 Lazer</option>
                                    <option value="Saúde">💊 Saúde</option>
                                    <option value="Eletrônicos">📱 Eletrônicos</option>
                                </select>
                                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Lógica de Crédito/Débito (Segmented Control Premium) */}
                    {type === 'expense' && (
                        <div className="p-1 bg-[#151515] rounded-2xl flex relative">
                            <div className={`absolute top-1 bottom-1 w-[48%] bg-[#2A2A2A] rounded-xl transition-all duration-300 shadow-lg ${method === 'credit' ? 'translate-x-[104%]' : 'translate-x-1'}`}></div>

                            <button type="button" onClick={() => setMethod('debit')} className={`flex-1 py-3 rounded-xl text-sm font-bold z-10 transition-colors flex items-center justify-center gap-2 ${method === 'debit' ? 'text-white' : 'text-gray-500'}`}>
                                <Wallet size={16} /> Débito / Pix
                            </button>
                            <button type="button" onClick={() => setMethod('credit')} className={`flex-1 py-3 rounded-xl text-sm font-bold z-10 transition-colors flex items-center justify-center gap-2 ${method === 'credit' ? 'text-white' : 'text-gray-500'}`}>
                                <CreditCard size={16} /> Cartão Crédito
                            </button>
                            <input type="hidden" name="paymentMethod" value={method} />
                        </div>
                    )}

                    {/* Opções de Cartão (Só aparece se Crédito) */}
                    {type === 'expense' && method === 'credit' && (
                        <div className="animate-in fade-in slide-in-from-top-2 space-y-4 pt-2">
                            <div className="space-y-1 relative">
                                <label className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Selecionar Cartão</label>
                                <div className="relative">
                                    <select name="cardId" required className="w-full bg-[#151515] appearance-none rounded-xl px-4 py-3.5 text-white outline-none border border-transparent focus:border-violet-500/50 transition cursor-pointer">
                                        <option value="">Selecione...</option>
                                        <option value="1">🟣 Nubank Ultravioleta</option>
                                        <option value="2">⚫ XP Visa Infinite</option>
                                    </select>
                                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                </div>
                            </div>

                            <div className="space-y-1 relative">
                                <label className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Parcelamento</label>
                                <div className="relative">
                                    <select name="installments" className="w-full bg-[#151515] appearance-none rounded-xl px-4 py-3.5 text-white outline-none border border-transparent focus:border-violet-500/50 transition cursor-pointer">
                                        <option value="1">À vista (1x)</option>
                                        {[2, 3, 4, 5, 6, 7, 8, 9, 10, 12].map(num => (
                                            <option key={num} value={num}>{num}x Sem Juros</option>
                                        ))}
                                    </select>
                                    <Calendar size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    )}

                    <button type="submit" className={`w-full py-4 rounded-2xl font-bold transition transform active:scale-95 ${type === 'income' ? 'bg-emerald-500 text-black hover:bg-emerald-400' : 'bg-white text-black hover:bg-gray-200'} shadow-[0_0_20px_rgba(255,255,255,0.15)]`}>
                        Confirmar Lançamento
                    </button>
                </form>
            </div>
        </div>
    );
}
