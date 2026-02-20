"use client";

import { motion } from "framer-motion";
import { Lock, ShieldCheck, Wifi } from "lucide-react";
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
		title: "Network-Aware Access",
		description:
			"Your physical presence matters. Post only when you're on-campus. Read-only from home.",
		icon: <Wifi className="h-8 w-8 text-primary" />,
		badge: "Location-Smart",
		className: "md:col-span-2 md:row-span-1",
		delay: 0.1,
	},
	{
		title: "AI Moderation",
		description:
			"A safe, respectful environment powered by real-time TensorFlow.js toxicity detection.",
		icon: <ShieldCheck className="h-8 w-8 text-primary" />,
		badge: "AI Guarded",
		className: "md:col-span-1 md:row-span-2",
		delay: 0.2,
	},
	{
		title: "Closed Community",
		description:
			"Exclusive to your school. No outsiders, no bots. Just your genuine community.",
		icon: <Users className="h-8 w-8 text-primary" />,
		badge: "Private",
		className: "md:col-span-1 md:row-span-1",
		delay: 0.3,
	},
	{
		title: "Physical Safety",
		description:
			"Digital presence, physical impact. We prioritize real-world school safety above all.",
		icon: <Lock className="h-8 w-8 text-primary" />,
		badge: "Secure",
		className: "md:col-span-1 md:row-span-1",
		delay: 0.4,
	},
];

function Users({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			role="img"
			aria-labelledby="users-icon-title"
		>
			<title id="users-icon-title">Users Icon</title>
			<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
			<circle cx="9" cy="7" r="4" />
			<path d="M22 21v-2a4 4 0 0 0-3-3.87" />
			<path d="M16 3.13a4 4 0 0 1 0 7.75" />
		</svg>
	);
}

export function FeatureBento() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-fr">
			{features.map((feature) => (
				<motion.div
					key={feature.title}
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5, delay: feature.delay }}
					className={cn("flex flex-col", feature.className)}
				>
					<Card className="flex-1 flex flex-col overflow-hidden border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm hover:shadow-xl transition-all duration-500 group">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<div className="p-2 bg-primary/5 rounded-lg group-hover:scale-110 transition-transform duration-500">
								{feature.icon}
							</div>
							<Badge
								variant="secondary"
								className="font-mono text-[10px] tracking-tighter uppercase opacity-80 group-hover:opacity-100 transition-opacity"
							>
								{feature.badge}
							</Badge>
						</CardHeader>
						<CardContent className="mt-4 flex flex-col flex-1">
							<CardTitle className="text-xl font-bold tracking-tight mb-2 group-hover:text-primary transition-colors">
								{feature.title}
							</CardTitle>
							<CardDescription className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
								{feature.description}
							</CardDescription>
							<div className="mt-auto pt-6 flex justify-end">
								<div className="w-8 h-1 bg-primary/10 rounded-full group-hover:w-full transition-all duration-700" />
							</div>
						</CardContent>
					</Card>
				</motion.div>
			))}
		</div>
	);
}
