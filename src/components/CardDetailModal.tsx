'use client';
import { X, TrendingUp } from 'lucide-react';

interface CardDetailModalProps {
    card: any | null;
    onClose: () => void;
}

export default function CardDetailModal({ card, onClose }: CardDetailModalProps) {
    if (!card) return null;

    const usagePercent = Math.min((card.current_invoice / card.limit_amount) * 100, 100);

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>

                {/* Card Preview Header */}
                <div className="h-40 p-6 relative overflow-hidden"
                    style={{ background: card.color_theme === 'violet' ? 'linear-gradient(135deg, #4C1D95, #BE185D)' : (card.color_theme === 'blue' ? 'linear-gradient(135deg, #1e3a8a, #3b82f6)' : (card.color_theme === 'green' ? 'linear-gradient(135deg, #065f46, #10b981)' : 'linear-gradient(135deg, #111, #333)')) }}>
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="relative z-10 flex items-start justify-between">
                        <TrendingUp className="text-white/80" />
                        <button onClick={onClose} className="p-2 bg-black/20 rounded-full hover:bg-black/40 transition">
                            <X size={18} className="text-white" />
                        </button>
                    </div>
                    <div className="absolute bottom-6 left-6 right-6">
                        <h2 className="text-xl font-bold text-white">{card.name}</h2>
                    </div>
                </div>

                {/* Card Info */}
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#151515] rounded-xl p-4">
                            <p className="text-[10px] uppercase text-gray-500 mb-1">Fatura Atual</p>
                            <p className="text-xl font-bold text-white">R$ {card.current_invoice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div className="bg-[#151515] rounded-xl p-4">
                            <p className="text-[10px] uppercase text-gray-500 mb-1">Disponível</p>
                            <p className="text-xl font-bold text-emerald-400">R$ {card.available_limit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                        <div className="flex justify-between text-xs text-gray-500 mb-2">
                            <span>Uso do limite</span>
                            <span className={usagePercent > 80 ? 'text-rose-500' : ''}>{Math.round(usagePercent)}%</span>
                        </div>
                        <div className="w-full h-2 bg-[#151515] rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all ${usagePercent > 80 ? 'bg-rose-500' : 'bg-violet-500'}`}
                                style={{ width: `${usagePercent}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="bg-[#151515] rounded-xl py-3">
                            <p className="text-[9px] uppercase text-gray-600 mb-1">Limite</p>
                            <p className="text-sm font-bold text-white">R$ {card.limit_amount.toLocaleString('pt-BR')}</p>
                        </div>
                        <div className="bg-[#151515] rounded-xl py-3">
                            <p className="text-[9px] uppercase text-gray-600 mb-1">Fecha</p>
                            <p className="text-sm font-bold text-white">Dia {card.closing_day}</p>
                        </div>
                        <div className="bg-[#151515] rounded-xl py-3">
                            <p className="text-[9px] uppercase text-gray-600 mb-1">Vence</p>
                            <p className="text-sm font-bold text-white">Dia {card.due_day}</p>
                        </div>
                    </div>

                    <button className="w-full py-3 rounded-xl text-rose-500 bg-rose-500/10 font-bold hover:bg-rose-500/20 transition">
                        Ver Extrato Completo
                    </button>
                </div>
            </div>
        </div>
    );
}
