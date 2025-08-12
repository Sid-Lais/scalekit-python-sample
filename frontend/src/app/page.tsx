"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [step, setStep] = useState<"email" | "otp" | "success">("email");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [authRequestId, setAuthRequestId] = useState<string | null>(null);
	const router = useRouter();

	useEffect(() => {
		async function checkSession() {
			try {
				const res = await fetch("http://localhost:8000/api/auth/session");
				if (res.ok) {
					const data = await res.json();
					if (data.email) {
						router.replace("/dashboard");
					}
				}
			} catch {}
		}
		checkSession();
	}, [router]);

	async function handleEmailSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError(null);
		try {
			const res = await fetch("http://localhost:8000/api/auth/send-passwordless", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email }),
			});
			   const data = await res.json();
			   console.log("[DEBUG] /send-passwordless response:", data);
			   let id = data.authRequestId || data.auth_request_id;
			   if (res.ok && id) {
				   setAuthRequestId(id);
				   if (typeof window !== "undefined") {
					   localStorage.setItem("authRequestId", id);
					   console.log("[DEBUG] Saved authRequestId to localStorage:", id);
				   }
				   setStep("otp");
			   } else {
				   setError(data.error || "Failed to send magic link.");
			   }
		} catch {
			setError("Network error. Please try again.");
		} finally {
			setLoading(false);
		}
	}

	async function handleOtpSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError(null);
		if (!/^[0-9]{6}$/.test(otp)) {
			setError("OTP must be exactly 6 digits.");
			setLoading(false);
			return;
		}
		   try {
			   let finalAuthRequestId = authRequestId;
			   if ((!finalAuthRequestId || finalAuthRequestId === "undefined") && typeof window !== "undefined") {
				   finalAuthRequestId = localStorage.getItem("authRequestId");
			   }
			   if (!finalAuthRequestId || finalAuthRequestId === "undefined") {
				   setError("Session expired or missing. Please request a new code or magic link.");
				   setLoading(false);
				   return;
			   }
			   const res = await fetch("http://localhost:8000/api/auth/verify-otp", {
				   method: "POST",
				   headers: { "Content-Type": "application/json" },
				   body: JSON.stringify({ code: otp, authRequestId: finalAuthRequestId }),
			   });
			   const data = await res.json();
			   if (res.ok) {
				   setStep("success");
				   setTimeout(() => {
					   router.replace("/dashboard");
				   }, 1000);
			   } else {
				   if (data.error) {
					   if (data.error.toLowerCase().includes("auth request expired")) {
						   setError("Your login session has expired. Please request a new code or magic link.");
					} else if (data.error.toLowerCase().includes("verification failed")) {
						setError("The code you entered is incorrect or expired. Please check and try again.");
					} else {
						setError(data.error || "Invalid or expired code. Please check and try again.");
					}
				} else {
					setError("Invalid or expired code. Please check and try again.");
				}
			}
		} catch {
			setError("Network error. Please try again.");
		} finally {
			setLoading(false);
		}
	}

	return (
		   <main className="fixed inset-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0b0b10 70%, #4f5eff 100%)" }}>
			   <div className="card">
				   <div className="flex flex-col items-center mb-8 w-full">
					   <svg width="44" height="44" viewBox="0 0 48 48" fill="none" className="mb-4">
						   <circle cx="24" cy="24" r="24" fill="#232336" />
						   <path d="M16 24.5L22 30.5L32 18.5" stroke="#4f5eff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
					   </svg>
					   <h1 className="text-2xl font-extrabold mb-1 tracking-tight text-white" style={{ letterSpacing: "-0.02em" }}>Sign in</h1>
				   </div>
				   <div className="w-full flex flex-col gap-8 items-center justify-center">
					   {step === "email" && (
						   <form onSubmit={handleEmailSubmit} className="flex flex-col gap-6 w-full items-center justify-center">
							   <div className="flex flex-col gap-3 w-full">
								   <label htmlFor="email" className="text-sm font-medium text-[#b3b3c6] mb-1">Email address</label>
								   <input
									   id="email"
									   type="email"
									   required
									   value={email}
									   onChange={e => setEmail(e.target.value)}
									   className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-base mb-2"
									   placeholder="you@example.com"
									   autoComplete="email"
								   />
							   </div>
							   <button
								   type="submit"
								   className="btn-primary w-full mt-2"
								   disabled={loading}
							   >
								   {loading ? "Sending..." : "Send Magic Link"}
							   </button>
							   {error && <div className="text-error text-sm text-center mt-2">{error}</div>}
						   </form>
					   )}
					   {step === "otp" && (
						   <form onSubmit={handleOtpSubmit} className="flex flex-col gap-6 w-full items-center justify-center">
							   <div className="flex flex-col gap-3 w-full">
								   <label htmlFor="otp" className="text-sm font-medium text-[#b3b3c6] mb-1">Enter OTP code</label>
								   <input
									   id="otp"
									   type="text"
									   required
									   value={otp}
									   onChange={e => setOtp(e.target.value)}
									   className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-base mb-2"
									   placeholder="6-digit code"
									   autoComplete="one-time-code"
								   />
							   </div>
							   <button
								   type="submit"
								   className="btn-primary w-full mt-2"
								   disabled={loading}
							   >
								   {loading ? "Verifying..." : "Verify Code"}
							   </button>
							   <button
								   type="button"
								   className="w-full py-3 rounded-lg bg-[#232336] text-[#ededed] border border-[#4f5eff] hover:bg-[#18182a] transition text-base mt-2"
								   onClick={() => setStep("email")}
								   disabled={loading}
							   >
								   Back to Email
							   </button>
							   {error && <div className="text-error text-sm text-center mt-2">{error}</div>}
						   </form>
					   )}
					   {step === "success" && (
						   <div className="text-success text-center font-semibold text-lg">
							   Login successful! Redirecting to your dashboard...
						   </div>
					   )}
				   </div>
			   </div>
		   </main>
	);
}
