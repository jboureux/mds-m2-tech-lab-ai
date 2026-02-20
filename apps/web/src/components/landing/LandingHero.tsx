"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function LandingHero() {
	return (
		<section className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden">
			<div className="container px-4 mx-auto relative z-10">
				<div className="max-w-4xl mx-auto text-center">
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, ease: "easeOut" }}
						className="flex justify-center mb-10"
					>
						<Badge
							variant="outline"
							className="px-5 py-1.5 border-primary/20 bg-primary/5 backdrop-blur-xl text-primary font-mono tracking-[0.2em] text-[9px] uppercase rounded-full"
						>
							<Sparkles className="h-3 w-3 mr-2 animate-pulse" />
							<span>Academic Social Architecture</span>
						</Badge>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
					>
						<h1 className="text-5xl md:text-7xl lg:text-8xl font-serif italic font-light tracking-tighter leading-[0.95] mb-10 text-foreground">
							The{" "}
							<span className="font-sans font-black not-italic tracking-[-0.05em] text-primary">
								Scoop
							</span>{" "}
							<br />
							<span className="opacity-30 dark:opacity-40">Just Got</span>{" "}
							<br />
							Digital.
						</h1>
					</motion.div>

					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 1.2, delay: 0.5 }}
						className="max-w-lg mx-auto text-base md:text-lg text-muted-foreground dark:text-muted-foreground/70 font-medium mb-12 leading-relaxed"
					>
						A localized ecosystem where academia meets the future. Your school's
						heartbeat, decentralized and secure.
					</motion.p>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.8 }}
						className="flex flex-col sm:flex-row items-center justify-center gap-8"
					>
						<Button
							asChild
							size="lg"
							className="rounded-full px-10 h-14 text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/10 transition-all duration-500 group"
						>
							<Link href="/login" className="flex items-center gap-3">
								Enter the Network
								<ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform duration-500" />
							</Link>
						</Button>
						<Link
							href="#features"
							className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors py-4 px-2"
						>
							View Protocol
						</Link>
					</motion.div>
				</div>
			</div>

			{/* Refined Background Element */}
			<motion.div
				animate={{
					rotate: [0, 15, 0],
					scale: [1, 1.05, 1],
				}}
				transition={{
					duration: 25,
					repeat: Infinity,
					ease: "easeInOut",
				}}
				className="absolute -right-20 top-1/4 w-[500px] h-[500px] border border-black/5 dark:border-primary/5 rounded-full pointer-events-none -z-10 blur-[2px]"
			/>
		</section>
	);
}
