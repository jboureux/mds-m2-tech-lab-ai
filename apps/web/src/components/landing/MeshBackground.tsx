"use client";

import { motion } from "framer-motion";

export function MeshBackground() {
	return (
		<div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none bg-[#020617]">
			<motion.div
				animate={{
					scale: [1, 1.2, 1],
					x: [0, 100, 0],
					y: [0, 50, 0],
				}}
				transition={{
					duration: 20,
					repeat: Infinity,
					ease: "linear",
				}}
				className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px]"
			/>
			<motion.div
				animate={{
					scale: [1, 1.1, 1],
					x: [0, -80, 0],
					y: [0, 100, 0],
				}}
				transition={{
					duration: 25,
					repeat: Infinity,
					ease: "linear",
				}}
				className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-blue-600/10 blur-[100px]"
			/>
			<motion.div
				animate={{
					scale: [1, 1.3, 1],
					x: [0, 50, 0],
					y: [0, -100, 0],
				}}
				transition={{
					duration: 18,
					repeat: Infinity,
					ease: "linear",
				}}
				className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] rounded-full bg-indigo-500/15 blur-[120px]"
			/>

			{/* Noise Texture Overlay */}
			<div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
		</div>
	);
}
