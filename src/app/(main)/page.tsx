'use client'
import { useState, useEffect } from "react";
import { getBalance, getTransactions, getUserProfile, getMonthlyExpenses } from "@/app/actions";
import NewTransactionModal from "@/components/NewTransactionModal";
import ExpenseChart from "@/components/ExpenseChart";
import { Bell, TrendingUp, ArrowUpRight, ArrowDownLeft, Search, X } from "lucide-react";
import Link from 'next/link';

export default function Dashboard() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [monthlyExpenses, setMonthlyExpenses] = useState({ total: 0, percentChange: 0 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('expense');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setBalance(await getBalance());
      setTransactions(await getTransactions() as any[]);
      setUser(await getUserProfile());
      setMonthlyExpenses(await getMonthlyExpenses());
    };
    loadData();
  }, [isModalOpen]);


  const filteredTransactions = transactions.filter(tx =>
    tx.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const defaultAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop";

  return (
    <div className="pb-24 md:pb-0 md:h-screen md:overflow-y-auto bg-[#050505] relative">

      {/* HEADER */}
      <header className="flex justify-between items-center p-6 md:p-8 md:border-b md:border-white/5 sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-md">
        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Avatar Mobile */}
          <Link href="/settings" className="md:hidden w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-600 p-[1px] shrink-0">
            <div className="w-full h-full rounded-full bg-[#111] overflow-hidden">
              <img src={user?.avatar_url || defaultAvatar} className="w-full h-full object-cover" alt="Avatar" />
            </div>
          </Link>

          <h1 className="text-2xl font-bold hidden md:block">Visão Geral</h1>

          {/* Barra de Busca */}
          <div className="flex items-center bg-[#111] border border-white/10 rounded-full px-4 py-2 w-full md:w-64 focus-within:border-violet-500 transition">
            <Search size={16} className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Buscar..."
              className="bg-transparent text-sm outline-none w-full text-white placeholder-gray-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && <button onClick={() => setSearchTerm('')}><X size={14} className="text-gray-500 hover:text-white" /></button>}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Notificações */}
          <div className="relative">
            <button onClick={() => setShowNotifs(!showNotifs)} className={`p-2 rounded-full transition ${showNotifs ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}>
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
            </button>
            {showNotifs && (
              <div className="absolute right-0 top-12 w-72 bg-[#111] border border-white/10 rounded-2xl p-4 z-50 shadow-xl animate-in fade-in zoom-in-95">
                <div className="flex justify-between items-center mb-3">
                  <p className="font-bold text-sm">Notificações</p>
                  <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-gray-400">2 Novas</span>
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2 items-start p-2 hover:bg-white/5 rounded-lg cursor-pointer">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-rose-500"></div>
                    <div>
                      <p className="text-sm text-gray-200">Fatura vence amanhã</p>
                      <p className="text-xs text-gray-500">R$ 1.250,00</p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-start p-2 hover:bg-white/5 rounded-lg cursor-pointer">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-emerald-500"></div>
                    <div>
                      <p className="text-sm text-gray-200">Meta atingida! 🎉</p>
                      <p className="text-xs text-gray-500">Viagem</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AVATAR DESKTOP */}
          <Link href="/settings" className="hidden md:block w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-600 p-[1px] hover:scale-110 transition">
            <div className="w-full h-full rounded-full bg-[#111] overflow-hidden">
              <img src={user?.avatar_url || defaultAvatar} className="w-full h-full object-cover" alt="Avatar" />
            </div>
          </Link>
        </div>
      </header>

      {/* Click outside to close notifs */}
      {showNotifs && <div className="fixed inset-0 z-30" onClick={() => setShowNotifs(false)} />}

      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ESQUERDA */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Saldo */}
              <div className="space-y-6">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Patrimônio Total</p>
                  <h2 className="text-5xl font-bold tracking-tight mt-2 text-white">
                    {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </h2>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setModalType('income'); setIsModalOpen(true); }} className="flex-1 py-3.5 rounded-2xl bg-white text-black font-bold hover:bg-gray-200 transition flex items-center justify-center gap-2">
                    <ArrowDownLeft size={18} /> Receber
                  </button>
                  <button onClick={() => { setModalType('expense'); setIsModalOpen(true); }} className="flex-1 py-3.5 rounded-2xl bg-[#1A1A1A] border border-white/10 text-white font-bold hover:bg-white/5 transition flex items-center justify-center gap-2">
                    <ArrowUpRight size={18} /> Pagar
                  </button>
                </div>
              </div>

              {/* CARTÃO VISUAL DINÂMICO */}
              <div className="h-56 rounded-[32px] p-6 bg-gradient-to-br from-[#6D28D9] via-[#7C3AED] to-[#EC4899] relative overflow-hidden shadow-2xl shadow-violet-900/20 group hover:scale-[1.02] transition-transform duration-500">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="flex flex-col justify-between h-full relative z-10">
                  <div className="flex justify-between items-start">
                    <TrendingUp className="text-white" />
                    <span className="text-lg font-bold italic text-white/90">VISA</span>
                  </div>
                  <div className="space-y-1">
                    <p className="font-mono text-xl tracking-widest text-white">**** **** **** 3507</p>
                    <div className="flex justify-between text-xs font-medium text-white/80 uppercase">
                      {/* NOME DINÂMICO DO USUÁRIO */}
                      <span>{user?.name || 'Carregando...'}</span>
                      <span>02/30</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* LISTA DE TRANSAÇÕES */}
            <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6 min-h-[400px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  {searchTerm ? `Buscando "${searchTerm}"` : 'Extrato Recente'}
                  {searchTerm && <span className="bg-white/10 text-[10px] px-2 py-1 rounded-full text-gray-400">{filteredTransactions.length}</span>}
                </h3>
                <Link href="/transactions" className="text-xs text-gray-500 hover:text-white transition font-bold">Ver tudo →</Link>
              </div>
              <div className="space-y-4">
                {filteredTransactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-600">
                    <Search size={32} className="mb-2 opacity-50" />
                    <p>{searchTerm ? 'Nada encontrado.' : 'Nenhuma transação.'}</p>
                  </div>
                ) : filteredTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between group cursor-pointer hover:bg-[#111] p-2 rounded-xl -mx-2 transition">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {tx.type === 'income' ? '💰' : '🛍️'}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-200 group-hover:text-white transition">{tx.description}</p>
                        <p className="text-xs text-gray-500">{tx.category} • {new Date(tx.date).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <span className={`font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                      {tx.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* DIREITA */}
          <div className="space-y-6">
            <div className="p-6 rounded-[32px] bg-[#0A0A0A] border border-white/5 relative overflow-hidden">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-gray-200">Gastos do Mês</h3>
                <span className={`text-xs px-2 py-1 rounded-lg ${monthlyExpenses.percentChange <= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  {monthlyExpenses.percentChange > 0 ? '+' : ''}{monthlyExpenses.percentChange}%
                </span>
              </div>
              <h2 className="text-3xl font-bold mb-4">
                {monthlyExpenses.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </h2>
              <ExpenseChart />
            </div>
          </div>
        </div>
      </div>

      <NewTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} type={modalType} />
    </div>
  );
}
