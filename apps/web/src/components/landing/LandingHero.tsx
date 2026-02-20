"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function LandingHero() {
	return (
		<section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-20 pb-20 md:pt-0 md:pb-0 overflow-hidden">
			<div className="container px-4 mx-auto relative z-10">
				<div className="max-w-5xl mx-auto text-center">
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.8, ease: "easeOut" }}
						className="flex justify-center mb-8"
					>
						<Badge
							variant="outline"
							className="px-6 py-2 border-primary/20 bg-primary/5 backdrop-blur-xl text-primary font-mono tracking-widest text-[10px] uppercase rounded-full shadow-[0_0_20px_rgba(59,130,246,0.1)]"
						>
							<Sparkles className="h-3 w-3 mr-2 animate-pulse" />
							<span>School Social. Reimagined.</span>
						</Badge>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
					>
						<h1 className="text-6xl md:text-8xl lg:text-[10rem] font-serif italic font-light tracking-tighter leading-[0.85] mb-12">
							The{" "}
							<span className="font-sans font-black not-italic tracking-[-0.05em] text-primary">
								Scoop
							</span>{" "}
							<br />
							<span className="opacity-50">Just Got</span> <br />
							Digital.
						</h1>
					</motion.div>

					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 1.5, delay: 0.5 }}
						className="max-w-xl mx-auto text-lg md:text-xl text-muted-foreground/80 font-medium mb-16 leading-relaxed"
					>
						A private ecosystem where academia meets the future. Your school's
						heartbeat, localized and decentralized.
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
							className="rounded-full px-12 h-16 text-lg font-bold bg-primary hover:bg-primary/90 shadow-[0_0_40px_rgba(59,130,246,0.2)] hover:shadow-[0_0_60px_rgba(59,130,246,0.3)] transition-all duration-500 group"
						>
							<Link href="/login" className="flex items-center gap-3">
								Join the Network
								<ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-500" />
							</Link>
						</Button>
						<Link
							href="#features"
							className="text-sm font-bold uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors py-4 px-2"
						>
							Explore Logic
						</Link>
					</motion.div>
				</div>
			</div>

			{/* Sculptural Background Element */}
			<motion.div
				animate={{
					rotate: [0, 10, 0],
					scale: [1, 1.1, 1],
				}}
				transition={{
					duration: 20,
					repeat: Infinity,
					ease: "easeInOut",
				}}
				className="absolute -right-40 top-1/4 w-[600px] h-[600px] border border-primary/10 rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%] pointer-events-none -z-10 blur-[1px]"
			/>
		</section>
	);
}
