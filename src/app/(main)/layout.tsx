
import Sidebar from "@/components/Sidebar";
import BottomDock from "@/components/BottomDock";

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex min-h-screen">
            {/* Sidebar fixa para todo o app (Desktop) */}
            <Sidebar />

            {/* Conteúdo das páginas */}
            <div className="flex-1 min-h-screen">
                {children}
            </div>

            {/* Bottom Dock (Mobile) */}
            <BottomDock />
        </div>
    );
}
