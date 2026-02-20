import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { FeatureBento } from "@/components/landing/FeatureBento";
import { LandingHero } from "@/components/landing/LandingHero";
import { MeshBackground } from "@/components/landing/MeshBackground";
import { auth } from "@/lib/auth";

export default async function Page() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (session) {
		redirect("/feed");
	}

	return (
		<main className="relative min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary overflow-x-hidden">
			<MeshBackground />

			<div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
				<LandingHero />

				<section id="features" className="py-32 md:py-48 relative">
					{/* Section Header */}
					<div className="mb-24 space-y-8 relative">
						<div className="absolute -left-10 top-0 w-[1px] h-32 bg-gradient-to-b from-primary/50 to-transparent" />
						<h2 className="text-4xl md:text-6xl font-serif italic tracking-tighter leading-tight max-w-xl text-foreground">
							Built on the{" "}
							<span className="not-italic font-sans font-black text-primary">
								Physical
							</span>{" "}
							Layer of Connection.
						</h2>
						<p className="text-lg md:text-xl text-muted-foreground dark:text-muted-foreground/60 max-w-2xl font-medium">
							Experience a social network that respects your space, protects
							your data, and prioritizes real-world community safety.
						</p>
					</div>

					<FeatureBento />
				</section>
			</div>

			<footer className="relative z-10 w-full py-24 mt-20 bg-gradient-to-t from-zinc-50 dark:from-zinc-950 to-transparent">
				<div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 border-t border-primary/5 pt-16 flex flex-col md:flex-row justify-between items-start gap-12">
					<div className="space-y-6">
						<span className="text-3xl font-black tracking-tighter text-primary">
							MDS
						</span>
						<p className="text-sm text-muted-foreground/50 max-w-xs font-mono tracking-tight leading-relaxed">
							The My Digital Scoop initiative. A research-driven social
							architecture for modern academic environments.
						</p>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-3 gap-16 md:gap-24">
						<div className="space-y-4">
							<h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/40">
								Protocol
							</h4>
							<nav className="flex flex-col gap-3 text-sm font-semibold text-muted-foreground/60">
								<a
									href="/privacy"
									className="hover:text-primary transition-all duration-300"
								>
									Privacy
								</a>
								<a
									href="/terms"
									className="hover:text-primary transition-all duration-300"
								>
									Terms
								</a>
							</nav>
						</div>
						<div className="space-y-4">
							<h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/40">
								Access
							</h4>
							<nav className="flex flex-col gap-3 text-sm font-semibold text-muted-foreground/60">
								<a
									href="/login"
									className="hover:text-primary transition-all duration-300"
								>
									Login
								</a>
								<a
									href="/support"
									className="hover:text-primary transition-all duration-300"
								>
									Support
								</a>
							</nav>
						</div>
						<div className="space-y-4 col-span-2 md:col-span-1">
							<p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/40">
								Established
							</p>
							<p className="text-sm font-mono text-muted-foreground/30 italic">
								MMXXVI &copy; MDS
							</p>
						</div>
					</div>
				</div>
			</footer>
		</main>
	);
}
