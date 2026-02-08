'use client';
import { useState, useEffect } from 'react';
import { getTasks, addTask, toggleTask } from "@/app/actions";
import { Plus, Check, Flag, Trash2, ChevronDown } from "lucide-react";

export default function TasksPage() {
    const [tasks, setTasks] = useState<any[]>([]);

    useEffect(() => {
        getTasks().then(setTasks);
    }, []);

    return (
        <div className="bg-[#050505] min-h-screen p-6 md:p-8 pb-24 md:pb-0">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">Tarefas & Metas</h1>
                    <span className="bg-white/5 px-3 py-1 rounded-full text-xs font-bold text-gray-400">{tasks.filter(t => !t.is_done).length} Pendentes</span>
                </div>

                {/* Input Premium */}
                <form action={async (formData) => {
                    await addTask(formData);
                    getTasks().then(setTasks);
                }} className="mb-8 p-2 bg-[#111] border border-white/10 rounded-2xl flex items-center shadow-2xl focus-within:border-violet-500/50 transition">
                    <div className="p-3 bg-violet-500/10 rounded-xl mr-3">
                        <Plus size={20} className="text-violet-400" />
                    </div>
                    <input name="title" type="text" placeholder="Adicionar nova tarefa..." className="flex-1 bg-transparent text-white outline-none placeholder-gray-600" required />

                    {/* Select de Prioridade Estilizado */}
                    <div className="relative mr-2">
                        <select name="priority" className="bg-[#050505] appearance-none text-gray-300 text-xs font-bold rounded-lg pl-3 pr-8 py-2 outline-none border border-white/10 focus:border-violet-500 cursor-pointer transition">
                            <option value="low">🟢 Baixa</option>
                            <option value="medium">🟡 Média</option>
                            <option value="high">🔴 Alta</option>
                        </select>
                        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>

                    <button type="submit" className="hidden">Salvar</button>
                </form>

                <div className="space-y-3">
                    {tasks.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                            <p className="text-lg">Nenhuma tarefa pendente 🎉</p>
                            <p className="text-sm mt-2">Adicione uma nova tarefa acima</p>
                        </div>
                    ) : (
                        tasks.map((task) => (
                            <div key={task.id} className={`group flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 ${task.is_done ? 'bg-[#0A0A0A] border-transparent opacity-40' : 'bg-[#111] border-white/5 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-900/10'}`}>
                                <button onClick={async () => {
                                    await toggleTask(task.id, !task.is_done);
                                    getTasks().then(setTasks);
                                }} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition shrink-0 ${task.is_done ? 'bg-emerald-500 border-emerald-500' : 'border-gray-600 hover:border-emerald-500'}`}>
                                    {task.is_done && <Check size={14} className="text-black stroke-[3px]" />}
                                </button>

                                <div className="flex-1 min-w-0">
                                    <p className={`font-medium truncate ${task.is_done ? 'line-through text-gray-500' : 'text-white'}`}>{task.title}</p>
                                </div>

                                {/* Priority Badge - Always visible */}
                                {!task.is_done && (
                                    <>
                                        {task.priority === 'high' && <span className="flex items-center gap-1 text-[10px] bg-rose-500/10 text-rose-500 px-2 py-1 rounded font-bold tracking-wider shrink-0"><Flag size={10} /> ALTA</span>}
                                        {task.priority === 'medium' && <span className="flex items-center gap-1 text-[10px] bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded font-bold tracking-wider shrink-0"><Flag size={10} /> MÉDIA</span>}
                                        {task.priority === 'low' && <span className="flex items-center gap-1 text-[10px] bg-gray-500/10 text-gray-400 px-2 py-1 rounded font-bold tracking-wider shrink-0"><Flag size={10} /> BAIXA</span>}
                                    </>
                                )}

                                <button className="text-gray-600 hover:text-rose-500 transition opacity-0 group-hover:opacity-100 shrink-0"><Trash2 size={16} /></button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
