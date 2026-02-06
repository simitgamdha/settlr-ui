import { Link } from 'react-router-dom';

export function AuthLayout({ children }) {
    return (
        <div className="min-h-screen w-full lg:grid lg:grid-cols-2 app-bg text-slate-100 overflow-y-auto">
            {/* Left Column - Auth Form */}
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto w-full max-w-[480px]">
                    {children}
                </div>
            </div>

            {/* Right Column - Branding */}
            <div className="hidden lg:flex flex-col items-center justify-center p-10 text-white relative overflow-hidden bg-ink-900/90">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/40 via-ink-900 to-ink-900 opacity-100"></div>
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#ffffff22_1px,transparent_1px)] [background-size:18px_18px]"></div>

                <div className="relative z-10 max-w-md text-center space-y-6">
                    <div className="flex justify-center mb-6">
                        <div className="rounded-2xl bg-gradient-to-br from-accent-pink to-accent-purple p-4 shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wallet text-white"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V4" /><path d="M3 15h18" /></svg>
                        </div>
                    </div>
                    <div className="flex items-center justify-center space-x-3 bg-white/10 py-2 px-4 rounded-full backdrop-blur-sm border border-white/10 mx-auto w-fit">
                        <span className="h-2 w-2 rounded-full bg-accent-pink animate-pulse"></span>
                        <span className="text-sm font-medium tracking-wide">Split expenses in seconds</span>
                    </div>

                    <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
                        Settle expenses without the friction.
                    </h1>

                    <p className="text-lg text-slate-300 leading-relaxed">
                        Keep your groups aligned with shared expenses, smart balances, and instant clarity.
                    </p>

                    <div className="pt-8">
                        <button className="bg-white text-ink-950 px-6 py-2 rounded-lg font-bold flex items-center mx-auto hover:opacity-90 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play mr-2"><polygon points="6 3 20 12 6 21 6 3" /></svg>
                            Watch Demo
                        </button>
                    </div>
                </div>
                <div className="absolute bottom-10 text-sm text-slate-400">
                    &copy; {new Date().getFullYear()} Settlr Inc.
                </div>
            </div>
        </div>
    );
}
