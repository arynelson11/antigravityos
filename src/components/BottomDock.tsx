'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wallet, PieChart, Settings } from 'lucide-react';
import clsx from 'clsx';

const dockItems = [
    { icon: Home, path: '/' },
    { icon: Wallet, path: '/cards' },
    { icon: PieChart, path: '/calendar' },
    { icon: Settings, path: '/settings' },
];

export default function BottomDock() {
    const pathname = usePathname();

    return (
        <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-full px-6 py-4 flex gap-8 shadow-2xl z-50">
            {dockItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                    <Link key={item.path} href={item.path} className="relative">
                        <item.icon
                            size={24}
                            className={clsx(
                                "transition",
                                isActive ? "text-white" : "text-gray-500 hover:text-white"
                            )}
                        />
                        {isActive && (
                            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></span>
                        )}
                    </Link>
                );
            })}
        </div>
    );
}
