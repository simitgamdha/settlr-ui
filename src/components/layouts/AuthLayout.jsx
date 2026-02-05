import { Link } from 'react-router-dom';

export function AuthLayout({ children }) {
    return (
        <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
            {/* Left Column - Auth Form */}
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-brand-dark">
                <div className="mx-auto w-full max-w-[480px]">
                    {children}
                </div>
            </div>

            {/* Right Column - Branding */}
            <div className="hidden lg:flex flex-col items-center justify-center p-10 text-white relative overflow-hidden bg-brand-dark">
                {/* Gradient Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-dark via-indigo-900 to-purple-900 opacity-90"></div>
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:16px_16px]"></div>

                <div className="relative z-10 max-w-md text-center space-y-6">
                    <div className="flex justify-center mb-6">
                        <div className="rounded-full bg-white/10 p-4">
                            {/* Yellow Logo Icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wallet text-primary"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V4" /><path d="M3 15h18" /></svg>
                        </div>
                    </div>
                    <div className="flex items-center justify-center space-x-3 bg-white/10 py-2 px-4 rounded-full backdrop-blur-sm border border-white/10 mx-auto w-fit">
                        <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                        <span className="text-sm font-medium tracking-wide">Trusted by 10,000+ users</span>
                    </div>

                    <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200">
                        Settle expenses without the friction.
                    </h1>

                    <p className="text-lg text-gray-300 leading-relaxed">
                        Join millions of people who use Settlr to manage shared expenses with roommates, partners, and friends.
                    </p>

                    <div className="pt-8">
                        <button className="bg-primary text-brand-dark px-6 py-2 rounded-lg font-bold flex items-center mx-auto hover:bg-primary-hover transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play mr-2"><polygon points="6 3 20 12 6 21 6 3" /></svg>
                            Watch Demo
                        </button>
                    </div>
                </div>
                <div className="absolute bottom-10 text-sm text-indigo-200">
                    &copy; {new Date().getFullYear()} Settlr Inc.
                </div>
            </div>
        </div>
    );
}
