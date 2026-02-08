'use client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Sem 1', uv: 4000 },
    { name: 'Sem 2', uv: 3000 },
    { name: 'Sem 3', uv: 2000 },
    { name: 'Sem 4', uv: 2780 },
    { name: 'Sem 5', uv: 1890 },
];

export default function ExpenseChart() {
    return (
        <div className="w-full h-[200px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis dataKey="name" hide />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="uv" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorUv)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
