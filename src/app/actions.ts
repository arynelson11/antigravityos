'use server'
import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

// --- TIPOS ---
export interface Transaction {
    id: number;
    description: string;
    amount: number;
    date: string;
    category: string;
    type: 'income' | 'expense';
    user_id?: string;
    card_id?: number;
    installment_number?: number;
    total_installments?: number;
}

export interface Task {
    id: number;
    title: string;
    is_done: boolean;
    priority: 'high' | 'medium' | 'low';
    user_id?: string;
}

export interface CreditCardWithInvoice {
    id: number;
    name: string;
    closing_day: number;
    due_day: number;
    limit_amount: number;
    color_theme: string;
    user_id: string;
    current_invoice: number;
    available_limit: number;
}

// --- DASHBOARD ---
export async function getBalance() {
    try {
        const result = await db.account.aggregate({
            _sum: { balance: true },
        });
        return result._sum.balance || 0;
    } catch (error) {
        console.error('Error fetching balance:', error);
        return 0;
    }
}

export async function getTransactions() {
    try {
        const transactions = await db.transaction.findMany({
            orderBy: { date: 'desc' },
            take: 7,
        });
        return transactions.map(t => ({
            ...t,
            date: t.date.toISOString(),
            type: t.type as 'income' | 'expense',
        })) as Transaction[];
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }
}

export async function getMonthlyData() {
    try {
        // Using raw query for grouping by month
        const result = await db.$queryRaw<{ name: string; value: number }[]>`
            SELECT TO_CHAR(date, 'MM') as name, SUM(ABS(amount)) as value
            FROM transactions
            WHERE type = 'expense'
            GROUP BY TO_CHAR(date, 'MM')
            ORDER BY MIN(date) ASC
            LIMIT 6
        `;
        return result;
    } catch (error) {
        console.error('Error fetching monthly data:', error);
        return [];
    }
}

// --- TRANSAÇÕES & MOTOR DE PARCELAMENTO ---
export async function addTransaction(formData: FormData) {
    const type = formData.get('type') as string;
    const desc = formData.get('description') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const category = formData.get('category') as string || 'Geral';
    const paymentMethod = formData.get('paymentMethod') as string || 'debit';
    const installments = parseInt(formData.get('installments') as string) || 1;
    const cardId = formData.get('cardId') ? parseInt(formData.get('cardId') as string) : null;

    const finalAmount = type === 'expense' ? -Math.abs(amount) : Math.abs(amount);
    const date = new Date();

    if (paymentMethod === 'credit' && installments > 1 && cardId) {
        // ⚙️ MOTOR DE PARCELAMENTO
        const installmentValue = finalAmount / installments;
        const transactionPromises = [];

        for (let i = 0; i < installments; i++) {
            const nextDate = new Date(date);
            nextDate.setMonth(date.getMonth() + i);

            transactionPromises.push(
                db.transaction.create({
                    data: {
                        description: `${desc} (${i + 1}/${installments})`,
                        amount: installmentValue,
                        date: nextDate,
                        category,
                        type,
                        card_id: cardId,
                        installment_number: i + 1,
                        total_installments: installments,
                    },
                })
            );
        }
        await Promise.all(transactionPromises);
        console.log(`✅ Parcelamento criado: ${desc} em ${installments}x`);
    } else if (paymentMethod === 'credit' && cardId) {
        // Compra única no crédito
        await db.transaction.create({
            data: {
                description: desc,
                amount: finalAmount,
                date: new Date(),
                category,
                type,
                card_id: cardId,
            },
        });
    } else {
        // Transação simples (débito/dinheiro)
        await db.transaction.create({
            data: {
                description: desc,
                amount: finalAmount,
                date: new Date(),
                category,
                type,
            },
        });
    }

    revalidatePath('/');
    revalidatePath('/cards');
}

// --- CARTÕES COM FATURA INTELIGENTE ---
export async function getCards() {
    try {
        return await db.creditCard.findMany();
    } catch (error) {
        console.error('Error fetching cards:', error);
        return [];
    }
}

export async function getCardsWithInvoice(): Promise<CreditCardWithInvoice[]> {
    try {
        const cards = await db.creditCard.findMany();
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const cardsWithData = await Promise.all(
            cards.map(async (card) => {
                const invoiceResult = await db.transaction.aggregate({
                    where: {
                        card_id: card.id,
                        type: 'expense',
                        date: {
                            gte: startOfMonth,
                            lte: endOfMonth,
                        },
                    },
                    _sum: { amount: true },
                });

                const currentInvoice = Math.abs(invoiceResult._sum.amount || 0);

                return {
                    ...card,
                    current_invoice: currentInvoice,
                    available_limit: card.limit_amount - currentInvoice,
                };
            })
        );

        return cardsWithData;
    } catch (error) {
        console.error('Error fetching cards with invoice:', error);
        return [];
    }
}

// --- TAREFAS COM PRIORIDADE ---
export async function getTasks() {
    try {
        const tasks = await db.task.findMany({
            orderBy: [
                { is_done: 'asc' },
                { id: 'desc' },
            ],
        });
        // Custom sort for priority
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        return tasks.sort((a, b) => {
            if (a.is_done !== b.is_done) return a.is_done ? 1 : -1;
            const priorityA = priorityOrder[a.priority as keyof typeof priorityOrder] || 3;
            const priorityB = priorityOrder[b.priority as keyof typeof priorityOrder] || 3;
            return priorityA - priorityB;
        }) as Task[];
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return [];
    }
}

export async function addTask(formData: FormData) {
    const title = formData.get('title') as string;
    const priority = formData.get('priority') as string || 'low';
    if (!title) return;

    await db.task.create({
        data: { title, is_done: false, priority },
    });
    revalidatePath('/tasks');
}

export async function toggleTask(id: number, is_done: boolean) {
    await db.task.update({
        where: { id },
        data: { is_done },
    });
    revalidatePath('/tasks');
}

export async function deleteTask(id: number) {
    await db.task.delete({ where: { id } });
    revalidatePath('/tasks');
}

export async function updateTaskPriority(id: number, priority: string) {
    await db.task.update({
        where: { id },
        data: { priority },
    });
    revalidatePath('/tasks');
}

// --- EVENTOS/AGENDA ---
export async function getEvents() {
    try {
        return await db.event.findMany({
            orderBy: { start_time: 'asc' },
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        return [];
    }
}

export async function addEvent(formData: FormData) {
    const title = formData.get('title') as string;
    const startTime = formData.get('startTime') as string;
    const isAllDay = formData.get('isAllDay') === 'true';

    if (!title || !startTime) return;

    await db.event.create({
        data: {
            title,
            start_time: new Date(startTime),
            is_all_day: isAllDay,
        },
    });

    revalidatePath('/calendar');
}

export async function getUpcomingBills() {
    try {
        return await db.transaction.findMany({
            where: {
                type: 'expense',
                is_paid: false,
                date: { gte: new Date() },
            },
            orderBy: { date: 'asc' },
            take: 5,
        });
    } catch (error) {
        console.error('Error fetching bills:', error);
        return [];
    }
}

// --- CRUD CARTÕES ---
export async function addCard(formData: FormData) {
    const name = formData.get('name') as string;
    const limit = parseFloat(formData.get('limit') as string);
    const closingDay = parseInt(formData.get('closingDay') as string);
    const dueDay = parseInt(formData.get('dueDay') as string);
    const colorTheme = formData.get('theme') as string || 'black';

    if (!name || !limit) return;

    // NOTE: user_id should come from auth session in production
    // Using a placeholder UUID for now
    await db.creditCard.create({
        data: {
            name,
            limit_amount: limit,
            closing_day: closingDay,
            due_day: dueDay,
            color_theme: colorTheme,
            user_id: '00000000-0000-0000-0000-000000000000', // Placeholder
        },
    });

    console.log(`✅ Novo cartão criado: ${name}`);
    revalidatePath('/cards');
}

// --- EXTRATO COMPLETO ---
export async function getAllTransactions() {
    try {
        const transactions = await db.transaction.findMany({
            orderBy: { date: 'desc' },
        });
        return transactions.map(t => ({
            ...t,
            date: t.date.toISOString(),
            type: t.type as 'income' | 'expense',
        })) as Transaction[];
    } catch (error) {
        console.error('Error fetching all transactions:', error);
        return [];
    }
}

// --- USER SYSTEM ---
export async function getUserProfile() {
    try {
        // NOTE: In production, get user ID from auth session
        const user = await db.profile.findFirst();
        return user || { name: 'Usuário', avatar_url: '', email: '' };
    } catch (error) {
        console.error("Erro ao buscar user:", error);
        return { name: 'Usuário', avatar_url: '', email: '' };
    }
}

export async function updateUserProfile(formData: FormData) {
    const name = formData.get('name') as string;
    const avatarUrl = formData.get('avatarUrl') as string;

    if (!name) return { success: false, error: 'Nome é obrigatório' };

    try {
        // NOTE: In production, get user ID from auth session
        const existingProfile = await db.profile.findFirst();

        if (existingProfile) {
            await db.profile.update({
                where: { id: existingProfile.id },
                data: { name, avatar_url: avatarUrl },
            });
        }
        console.log(`✅ Perfil atualizado: ${name}`);

        revalidatePath('/');
        revalidatePath('/settings');
        return { success: true };
    } catch (error) {
        console.error("Erro ao atualizar:", error);
        return { success: false, error: 'Erro ao salvar no banco' };
    }
}
