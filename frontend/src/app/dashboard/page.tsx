"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
	const [email, setEmail] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	useEffect(() => {
		async function fetchSession() {
			try {
				const res = await fetch("http://localhost:8000/api/auth/session");
				if (res.ok) {
					const data = await res.json();
					setEmail(data.email || null);
				} else {
					setEmail(null);
				}
			} catch {
				setEmail(null);
			}
		}
		fetchSession();
	}, []);

	const handleLogout = async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch("http://localhost:8000/api/auth/logout", { method: "POST" });
			if (res.ok) {
				router.replace("/");
			} else {
				setError("Logout failed. Please try again.");
			}
		} catch {
			setError("Logout failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	   return (
		   <main className="fixed inset-0 flex bg-[#0b0b10]">
			   {/* Sidebar */}
			   <aside className="hidden md:flex flex-col w-64 bg-[#18182a] border-r border-[#232336] p-8 justify-between min-h-screen">
				   <div>
					   <div className="flex flex-col items-center gap-3 mb-10">
						   <Image src="/scalekit.png" alt="Scalekit Logo" width={128} height={40} className="w-32 h-auto" priority />
						   <span className="text-xl font-bold text-[#ededed] tracking-tight">Scalekit Demo</span>
					   </div>
					   <nav className="mt-8">
						   <div className="text-[#b3b3c6] text-sm font-medium mb-2">Navigation</div>
						   <ul className="space-y-2">
							   <li className="text-[#4f5eff] font-semibold">Dashboard</li>
						   </ul>
					   </nav>
				   </div>
				   <div>
					   <button
						   className="btn-primary w-full"
						   onClick={handleLogout}
						   disabled={loading}
					   >
						   {loading ? "Logging out..." : "Logout"}
					   </button>
					   {error && <div className="text-error text-sm text-center mt-2">{error}</div>}
				   </div>
			   </aside>
			   {/* Main content */}
			   <section className="flex-1 flex items-center justify-center min-h-screen">
				   <div className="card">
					   <h1 className="text-2xl font-extrabold mb-4 tracking-tight text-white text-center" style={{ letterSpacing: "-0.02em" }}>
						   Welcome{email ? `, ${email}` : ""}!
					   </h1>
					   <p className="text-[#b3b3c6] mb-6 text-center">You are logged in with passwordless authentication powered by Scalekit and FastAPI.</p>
				   </div>
			   </section>
		   </main>
	   );
}
