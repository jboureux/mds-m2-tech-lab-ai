"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { GraduationCap, Lock, ShieldCheck, Wifi } from "lucide-react";
import { useRef } from "react";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const features = [
	{
		title: "Contextual Logic",
		description:
			"Your school's borders are digital. Post only on-campus, read anywhere. Simple, physical, secure.",
		icon: <Wifi className="h-6 w-6" />,
		badge: "Spatial",
		className: "md:col-span-2 md:row-span-1",
		delay: 0.1,
	},
	{
		title: "Algorithmic Integrity",
		description:
			"A safe, respectful environment powered by our localized TensorFlow.js toxicity engine.",
		icon: <ShieldCheck className="h-6 w-6" />,
		badge: "Moderated",
		className: "md:col-span-1 md:row-span-2",
		delay: 0.2,
	},
	{
		title: "Pure Community",
		description:
			"An exclusive hub. Verified students and staff only. Zero bots, pure interaction.",
		icon: <GraduationCap className="h-6 w-6" />,
		badge: "Verified",
		className: "md:col-span-1 md:row-span-1",
		delay: 0.3,
	},
	{
		title: "Physical Layer",
		description:
			"Bridging digital connection with real-world presence. Security that stays within walls.",
		icon: <Lock className="h-6 w-6" />,
		badge: "Hardened",
		className: "md:col-span-1 md:row-span-1",
		delay: 0.4,
	},
];

export function FeatureBento() {
	const containerRef = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start end", "end start"],
	});

	const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

	return (
		<div
			ref={containerRef}
			className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr"
		>
			{features.map((feature) => (
				<motion.div
					key={feature.title}
					style={{ y: feature.className.includes("row-span-2") ? 0 : y }}
					initial={{ opacity: 0, y: 40 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: "-100px" }}
					transition={{ duration: 0.8, delay: feature.delay }}
					className={cn("flex flex-col", feature.className)}
				>
					<Card className="flex-1 flex flex-col overflow-hidden border-primary/5 bg-zinc-900/40 backdrop-blur-3xl hover:bg-zinc-900/60 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-primary/10 transition-all duration-700 group cursor-default">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
							<div className="p-3 bg-primary/10 rounded-2xl group-hover:bg-primary/20 transition-colors duration-500">
								{feature.icon}
							</div>
							<Badge
								variant="outline"
								className="font-mono text-[9px] tracking-widest uppercase opacity-40 group-hover:opacity-100 border-primary/20 transition-all duration-500"
							>
								{feature.badge}
							</Badge>
						</CardHeader>
						<CardContent className="mt-4 flex flex-col flex-1">
							<CardTitle className="text-2xl font-serif italic font-light tracking-tight mb-4 group-hover:text-primary transition-colors duration-500">
								{feature.title}
							</CardTitle>
							<CardDescription className="text-sm text-muted-foreground/70 leading-relaxed font-medium">
								{feature.description}
							</CardDescription>

							<div className="mt-auto pt-10">
								<div className="flex gap-1.5 overflow-hidden">
									{[1, 2, 3].map((i) => (
										<motion.div
											key={i}
											initial={{ x: -20, opacity: 0 }}
											whileInView={{ x: 0, opacity: 1 }}
											transition={{ delay: 0.5 + i * 0.1 }}
											className="h-[2px] w-6 bg-primary/20 rounded-full"
										/>
									))}
								</div>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			))}
		</div>
	);
}
