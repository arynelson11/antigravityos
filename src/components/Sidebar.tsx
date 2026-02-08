'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CheckSquare, CreditCard, Calendar, Settings, LogOut, Receipt } from 'lucide-react';

const menuItems = [
    { name: 'Visão Geral', icon: LayoutDashboard, path: '/' },
    { name: 'Extrato', icon: Receipt, path: '/transactions' },
    { name: 'Tarefas', icon: CheckSquare, path: '/tasks' },
    { name: 'Carteira', icon: CreditCard, path: '/cards' },
    { name: 'Agenda', icon: Calendar, path: '/calendar' },
    { name: 'Ajustes', icon: Settings, path: '/settings' },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden md:flex flex-col w-64 border-r border-white/5 p-6 h-screen sticky top-0 bg-[#050505]">
            <div className="flex items-center gap-2 mb-10">
                <div className="w-8 h-8 bg-gradient-to-tr from-violet-600 to-fuchsia-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-violet-900/30">A</div>
                <span className="text-xl font-bold tracking-tight text-white">Antigravity</span>
            </div>

            <nav className="space-y-2 flex-1">
                {menuItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${isActive
                                    ? "bg-white/10 text-white border border-white/5 shadow-lg shadow-violet-500/10"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <item.icon size={20} className={isActive ? "text-violet-400" : ""} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Botão Sair */}
            <button
                onClick={() => alert("Logout realizado! (Simulação)")}
                className="flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-500/10 rounded-xl transition font-medium mt-auto border border-transparent hover:border-rose-500/20"
            >
                <LogOut size={20} />
                Sair da Conta
            </button>
        </aside>
    );
}
