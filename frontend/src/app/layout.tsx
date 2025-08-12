import "./globals.css";

export const metadata = {
	title: "Scalekit Passwordless Auth",
	description: "Passwordless authentication demo with Scalekit and FastAPI",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0b0b10 70%, #4f5eff 100%)" }}>
				   {children}
			</body>
		</html>
	);
}
