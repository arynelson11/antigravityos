'use client';
import { useState, useEffect } from 'react';
import { getCardsWithInvoice } from "@/app/actions";
import { TrendingUp, Plus, Wallet } from "lucide-react";
import CardDetailModal from '@/components/CardDetailModal';
import NewCardModal from '@/components/NewCardModal';

export default function CardsPage() {
    const [cards, setCards] = useState<any[]>([]);
    const [selectedCard, setSelectedCard] = useState<any>(null);
    const [isNewCardModalOpen, setNewCardModalOpen] = useState(false);

    const loadCards = () => {
        getCardsWithInvoice().then(setCards);
    };

    useEffect(() => {
        loadCards();
    }, [isNewCardModalOpen]);

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto pb-24 bg-[#050505] min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Carteira</h1>

                <button
                    onClick={() => setNewCardModalOpen(true)}
                    className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-bold transition flex items-center gap-2 shadow-lg shadow-violet-900/20"
                >
                    <Plus size={18} /> Novo Cartão
                </button>
            </div>

            {cards.length === 0 ? (
                <div className="text-center py-20">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-violet-900/20 flex items-center justify-center">
                        <Wallet size={32} className="text-violet-500" />
                    </div>
                    <p className="text-lg text-gray-400">Nenhum cartão cadastrado</p>
                    <p className="text-sm text-gray-600 mt-1">Clique em "Novo Cartão" para adicionar</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {cards.map((card: any) => {
                        const usagePercent = Math.min((card.current_invoice / card.limit_amount) * 100, 100);
                        const getBackground = () => {
                            switch (card.color_theme) {
                                case 'violet': return 'linear-gradient(135deg, #4C1D95, #BE185D)';
                                case 'blue': return 'linear-gradient(135deg, #1e3a8a, #3b82f6)';
                                case 'green': return 'linear-gradient(135deg, #065f46, #10b981)';
                                default: return 'linear-gradient(135deg, #111, #222)';
                            }
                        };

                        return (
                            <div key={card.id} onClick={() => setSelectedCard(card)}
                                className="relative h-64 rounded-[32px] p-8 overflow-hidden group border border-white/5 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-violet-900/20 cursor-pointer"
                                style={{ background: getBackground() }}>

                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>

                                <div className="relative z-10 flex flex-col justify-between h-full">
                                    <div className="flex justify-between items-start">
                                        <TrendingUp className="text-white/80" />
                                        <div className="text-right">
                                            <p className="text-xs text-white/60 uppercase tracking-widest mb-1 font-medium">Fatura Atual</p>
                                            <p className="text-3xl font-bold text-white tracking-tight">
                                                R$ {card.current_invoice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-end mb-3">
                                            <h3 className="text-lg font-bold text-white">{card.name}</h3>
                                            <span className="text-xs text-white/80 font-medium">{Math.round(usagePercent)}%</span>
                                        </div>

                                        <div className="w-full h-1.5 bg-black/30 rounded-full mb-4 overflow-hidden backdrop-blur-sm">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ${usagePercent > 80 ? 'bg-rose-500' : 'bg-gradient-to-r from-violet-400 via-fuchsia-500 to-orange-400'}`}
                                                style={{ width: `${usagePercent}%` }}
                                            ></div>
                                        </div>

                                        <div className="flex gap-2 text-xs text-white/70">
                                            <span>Disp: R$ {card.available_limit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* MODAIS */}
            <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
            <NewCardModal isOpen={isNewCardModalOpen} onClose={() => setNewCardModalOpen(false)} />
        </div>
    );
}
