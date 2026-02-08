'use client';
import { useState } from 'react';
import { Calendar as CalendarIcon, Plus, Clock, X } from "lucide-react";

function NewEventModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-[#111] border border-white/10 w-full max-w-md rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">Novo Compromisso 📅</h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] uppercase text-gray-500 font-bold tracking-wider block mb-1">Título</label>
                        <input className="w-full bg-[#1A1A1A] rounded-xl px-4 py-3 text-white border border-transparent focus:border-violet-500 outline-none transition" placeholder="Ex: Dentista, Reunião..." />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] uppercase text-gray-500 font-bold tracking-wider block mb-1">Data</label>
                            <input type="date" className="w-full bg-[#1A1A1A] rounded-xl px-4 py-3 text-white outline-none border border-transparent focus:border-violet-500 transition" />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase text-gray-500 font-bold tracking-wider block mb-1">Hora</label>
                            <input type="time" className="w-full bg-[#1A1A1A] rounded-xl px-4 py-3 text-white outline-none border border-transparent focus:border-violet-500 transition" />
                        </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button onClick={onClose} className="flex-1 py-3 bg-white/5 rounded-xl text-white hover:bg-white/10 transition">Cancelar</button>
                        <button onClick={onClose} className="flex-1 py-3 bg-violet-600 rounded-xl text-white font-bold hover:bg-violet-500 transition">Salvar</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function CalendarPage() {
    const [isEventModalOpen, setEventModalOpen] = useState(false);
    const today = new Date();
    const currentMonth = today.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    const currentDay = today.getDate();

    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

    const upcomingEvents = [
        { day: '10', title: 'Fatura Nubank', type: 'bill', val: 'R$ 1.250,00' },
        { day: '15', title: 'Conta de Luz', type: 'bill', val: 'R$ 180,00' },
        { day: '20', title: 'Salário', type: 'income', val: 'R$ 12.000,00' },
    ];

    return (
        <div className="p-6 md:p-8 max-w-6xl mx-auto pb-24">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Agenda</h1>
                <button onClick={() => setEventModalOpen(true)} className="px-4 py-2 bg-violet-600 rounded-xl text-sm font-bold hover:bg-violet-500 transition flex items-center gap-2">
                    <Plus size={16} /> Novo Evento
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Calendário Mensal */}
                <div className="lg:col-span-2 bg-[#0A0A0A] border border-white/5 rounded-3xl p-6">
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-bold capitalize">{currentMonth}</h2>
                    </div>

                    <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-500 mb-2 font-bold uppercase">
                        <div>D</div><div>S</div><div>T</div><div>Q</div><div>Q</div><div>S</div><div>S</div>
                    </div>

                    <div className="grid grid-cols-7 gap-2 text-center">
                        {Array.from({ length: firstDayOfMonth }, (_, i) => (
                            <div key={`empty-${i}`} className="p-2"></div>
                        ))}

                        {Array.from({ length: daysInMonth }, (_, i) => {
                            const day = i + 1;
                            const isToday = day === currentDay;
                            const hasEvent = upcomingEvents.some(e => parseInt(e.day) === day);

                            return (
                                <div
                                    key={day}
                                    className={`p-3 rounded-xl text-sm cursor-pointer transition relative ${isToday
                                            ? 'bg-violet-600 text-white font-bold'
                                            : 'hover:bg-white/5 text-gray-300'
                                        }`}
                                >
                                    {day}
                                    {hasEvent && !isToday && (
                                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Lista Lateral */}
                <div className="space-y-6">
                    <div>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Hoje</h3>
                        <div className="bg-[#111] p-4 rounded-2xl border-l-4 border-blue-500 mb-3">
                            <h4 className="font-bold text-white">Reunião de Projeto</h4>
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1"><Clock size={12} /> 14:00 - 15:00</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Próximos Vencimentos</h3>
                        {upcomingEvents.map((ev, i) => (
                            <div key={i} className={`p-4 rounded-2xl mb-3 border-l-4 ${ev.type === 'income' ? 'bg-emerald-900/10 border-emerald-500' : 'bg-[#111] border-rose-500'}`}>
                                <h4 className="font-bold text-white">{ev.title}</h4>
                                <p className="text-xs text-gray-400">Dia {ev.day} • {ev.val}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <NewEventModal isOpen={isEventModalOpen} onClose={() => setEventModalOpen(false)} />
        </div>
    );
}
