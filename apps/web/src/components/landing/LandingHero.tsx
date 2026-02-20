"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function LandingHero() {
	return (
		<section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
			{/* Background Glow */}
			<div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-primary/20 blur-[120px] rounded-full -z-10 opacity-50 dark:opacity-30" />

			<div className="container px-4 mx-auto text-center relative z-10">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="flex justify-center mb-6"
				>
					<Badge
						variant="outline"
						className="px-4 py-1.5 border-primary/20 bg-primary/5 backdrop-blur-md text-primary font-medium flex items-center gap-2 rounded-full animate-in fade-in slide-in-from-bottom-3 duration-1000"
					>
						<Sparkles className="h-3.5 w-3.5" />
						<span>The internal school network is live</span>
					</Badge>
				</motion.div>

				<motion.h1
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.1 }}
					className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[1.1] mb-8 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70"
				>
					The Scoop <br className="hidden md:block" />
					<span className="text-primary">Just Got Digital.</span>
				</motion.h1>

				<motion.p
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed"
				>
					The exclusive space for students and staff to share, connect, and stay
					updated. Smart, safe, and strictly on-campus when it matters.
				</motion.p>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.3 }}
					className="flex flex-col sm:flex-row items-center justify-center gap-4"
				>
					<Button
						asChild
						size="lg"
						className="rounded-full px-8 h-14 text-lg font-bold shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 group"
					>
						<Link href="/login" className="flex items-center gap-2">
							Enter the Scoop
							<ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
						</Link>
					</Button>
					<Button
						asChild
						variant="ghost"
						size="lg"
						className="rounded-full px-8 h-14 text-lg font-medium hover:bg-primary/5"
					>
						<Link href="#features">Learn More</Link>
					</Button>
				</motion.div>
			</div>

			{/* Decorative Elements */}
			<div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-64 h-64 border border-primary/10 rounded-full blur-3xl -z-10" />
			<div className="absolute right-0 top-1/4 translate-x-1/2 w-96 h-96 border border-primary/5 rounded-full blur-3xl -z-10" />
		</section>
	);
}
