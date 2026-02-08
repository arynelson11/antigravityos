import { getAllTransactions } from "@/app/actions";
import Link from 'next/link';
import { ArrowLeft, Search, Filter } from "lucide-react";

export default async function TransactionsPage() {
    const transactions = await getAllTransactions();

    // Agrupa transações por mês
    const groupedTxs: { [key: string]: any[] } = {};
    transactions.forEach((tx: any) => {
        const date = new Date(tx.date);
        const monthYear = date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
        if (!groupedTxs[monthYear]) groupedTxs[monthYear] = [];
        groupedTxs[monthYear].push(tx);
    });

    return (
        <div className="bg-[#050505] min-h-screen p-6 md:p-8 pb-24 md:pb-0">
            <div className="max-w-4xl mx-auto">

                {/* Header com Voltar */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/" className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition">
                        <ArrowLeft size={20} className="text-gray-400" />
                    </Link>
                    <h1 className="text-3xl font-bold">Extrato Completo</h1>
                </div>

                {/* Barra de Filtro */}
                <div className="flex gap-3 mb-8">
                    <div className="flex-1 flex items-center bg-[#111] border border-white/10 rounded-2xl px-4 py-3">
                        <Search size={18} className="text-gray-500 mr-3" />
                        <input type="text" placeholder="Buscar transações..." className="bg-transparent outline-none text-white placeholder-gray-600 w-full" />
                    </div>
                    <button className="p-3 bg-[#111] border border-white/10 rounded-2xl text-gray-400 hover:text-white transition">
                        <Filter size={20} />
                    </button>
                </div>

                {/* Lista Agrupada por Mês */}
                <div className="space-y-8">
                    {Object.keys(groupedTxs).length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                            <p className="text-lg">Nenhuma transação encontrada</p>
                            <p className="text-sm mt-1">Adicione sua primeira transação no Dashboard</p>
                        </div>
                    ) : Object.keys(groupedTxs).map((month) => (
                        <div key={month}>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 ml-2 sticky top-0 bg-[#050505] py-2 z-10 capitalize">{month}</h3>
                            <div className="space-y-3">
                                {groupedTxs[month].map((tx: any) => (
                                    <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl bg-[#111] border border-white/5 hover:bg-[#151515] transition group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                {tx.type === 'income' ? '💰' : '🛍️'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-sm text-gray-200 group-hover:text-white transition truncate">{tx.description}</p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(tx.date).toLocaleDateString('pt-BR')} • {tx.category}
                                                    {tx.total_installments && ` • Parcela ${tx.installment_number}/${tx.total_installments}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className={`font-bold block ${tx.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                                                {tx.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </span>
                                            {tx.card_id && <span className="text-[10px] text-gray-500">Crédito</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
