import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { FeatureBento } from "@/components/landing/FeatureBento";
import { LandingHero } from "@/components/landing/LandingHero";
import { auth } from "@/lib/auth";

export default async function LandingPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (session) {
		redirect("/feed");
	}

	return (
		<main className="flex min-h-screen flex-col items-center bg-zinc-50 dark:bg-zinc-950 text-foreground antialiased selection:bg-primary/20 selection:text-primary overflow-x-hidden">
			<div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<LandingHero />

				<section id="features" className="py-24 md:py-32">
					<div className="text-center mb-16 space-y-4">
						<h2 className="text-3xl md:text-5xl font-bold tracking-tight">
							Designed for our school.
						</h2>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							Experience a social network built with safety, privacy, and
							community at its heart.
						</p>
					</div>

					<FeatureBento />
				</section>
			</div>

			<footer className="w-full py-12 border-t border-zinc-200 dark:border-zinc-800 bg-white/30 dark:bg-zinc-900/30 backdrop-blur-md">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
					<div className="flex flex-col items-center md:items-start gap-2">
						<span className="text-xl font-black tracking-tighter text-primary">
							MDS
						</span>
						<p className="text-sm text-muted-foreground font-medium">
							&copy; {new Date().getFullYear()} My Digital Scoop. Internal
							school network.
						</p>
					</div>

					<div className="flex gap-8 text-sm font-semibold text-muted-foreground">
						<a href="/privacy" className="hover:text-primary transition-colors">
							Privacy
						</a>
						<a href="/terms" className="hover:text-primary transition-colors">
							Terms
						</a>
						<a href="/support" className="hover:text-primary transition-colors">
							Support
						</a>
					</div>
				</div>
			</footer>
		</main>
	);
}
