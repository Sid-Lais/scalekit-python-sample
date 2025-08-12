"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyMagicLinkPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const linkToken = searchParams.get("link_token");
		const authRequestId = typeof window !== "undefined" ? localStorage.getItem("authRequestId") : null;
		if (!linkToken) {
			setStatus("error");
			setError("The magic link is missing or invalid. Please use the link sent to your email.");
			return;
		}
		if (!authRequestId) {
			setStatus("error");
			setError("We couldn't find your login session. Please use the same browser and device where you requested the magic link, or request a new link.");
			return;
		}
		fetch("http://localhost:8000/api/verify-magic-link", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ linkToken, authRequestId }),
		})
			.then(async (res) => {
				if (res.ok) {
					setStatus("success");
					setTimeout(() => router.replace("/dashboard"), 1200);
				} else {
					let errorMsg = "Invalid or expired magic link.";
					try {
						const data = await res.json();
						if (data?.error) {
							if (data.error.includes("expired")) errorMsg = "This magic link has expired. Please request a new one.";
							else if (data.error.includes("auth_request_id")) errorMsg = "We couldn't verify your session. Please use the same browser and device where you requested the link.";
							else if (data.error.toLowerCase().includes("verification failed")) errorMsg = "This magic link is invalid or has already been used. Please request a new one.";
							else errorMsg = data.error;
						}
					} catch {}
					setStatus("error");
					setError(errorMsg);
				}
			})
			.catch(() => {
				setStatus("error");
				setError("A network error occurred. Please check your connection and try again.");
			});
	}, [searchParams, router]);

	   return (
		   <main className="fixed inset-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0b0b10 70%, #4f5eff 100%)" }}>
			   <div className="card">
				   {status === "verifying" && (
					   <div className="text-center text-lg text-white mb-4">Verifying magic link...</div>
				   )}
				   {status === "success" && (
					   <div className="text-success text-center font-semibold text-lg mb-4">
						   Magic link verified! Redirecting to your dashboard...
					   </div>
				   )}
				   {status === "error" && (
					   <div className="text-error text-center font-semibold text-lg mb-4">
						   {error}
					   </div>
				   )}
			   </div>
		   </main>
	   );
}
