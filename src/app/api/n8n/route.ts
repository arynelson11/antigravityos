
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
    // 1. Auth Check
    const authHeader = req.headers.get('authorization');
    if (authHeader !== 'Bearer antigravity_secret_key_123') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { action, payload } = body;

        console.log(`🔌 API N8N received: ${action}`, payload);

        if (action === 'add_transaction') {
            const { description, amount, type, category, paymentMethod, cardId } = payload;
            const finalAmount = type === 'expense' ? -Math.abs(Number(amount)) : Math.abs(Number(amount));
            const cat = category || 'Geral';
            const safeType = type || 'expense';

            await db.transaction.create({
                data: {
                    description,
                    amount: finalAmount,
                    date: new Date(),
                    category: cat,
                    type: safeType,
                    card_id: paymentMethod === 'credit' && cardId ? parseInt(cardId) : null,
                }
            });

            revalidatePath('/');
            return NextResponse.json({ success: true, message: 'Transaction added' });
        }

        else if (action === 'add_task') {
            const { title, priority } = payload;
            const prio = priority || 'medium';

            await db.task.create({
                data: { title, is_done: false, priority: prio }
            });
            revalidatePath('/tasks');
            return NextResponse.json({ success: true, message: 'Task created' });
        }

        else if (action === 'add_event') {
            const { title, startTime, isAllDay } = payload;

            await db.event.create({
                data: {
                    title,
                    start_time: new Date(startTime),
                    is_all_day: isAllDay === true || isAllDay === 'true',
                }
            });
            revalidatePath('/calendar');
            return NextResponse.json({ success: true, message: 'Event added' });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('API N8N Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 });
    }
}
