import { Suspense } from "react";
import VerifyMagicLinkPage from "./VerifyMagicLinkPage";

export default function Page() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<VerifyMagicLinkPage />
		</Suspense>
	);
}
