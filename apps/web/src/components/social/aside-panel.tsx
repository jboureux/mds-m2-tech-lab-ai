import { Info, Wifi, WifiOff } from "lucide-react";
import { headers } from "next/headers";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function AsidePanel({ hideCard = false }: { hideCard?: boolean }) {
	const h = await headers();
	const networkLocation = h.get("x-network-location") || "off-campus";
	const isOnCampus = networkLocation === "on-campus";

	return (
		<div className="hidden xl:flex flex-col gap-4 w-72 shrink-0 h-fit sticky top-20">
			{!hideCard && (
				<Card className="border-none shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
					<CardHeader className="p-4 pb-2">
						<div className="flex items-center justify-between">
							<CardTitle className="text-sm font-bold flex items-center gap-2">
								Network Status
								<Info className="h-3.5 w-3.5 text-muted-foreground" />
							</CardTitle>
							<Badge
								variant={isOnCampus ? "default" : "secondary"}
								className={`text-[10px] uppercase ${isOnCampus ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-amber-100 text-amber-700 hover:bg-amber-100"}`}
							>
								{isOnCampus ? (
									<Wifi className="h-3 w-3 mr-1 inline" />
								) : (
									<WifiOff className="h-3 w-3 mr-1 inline" />
								)}
								{isOnCampus ? "On Campus" : "Off Campus"}
							</Badge>
						</div>
					</CardHeader>
					<CardContent className="p-4 pt-2">
						<p className="text-xs text-muted-foreground leading-relaxed">
							{isOnCampus
								? "You are connected to the School Wi-Fi. You have full access to all features, including posting."
								: "You are off-campus. Some features like posting are restricted to ensure local-only interactions."}
						</p>
					</CardContent>
				</Card>
			)}

			<div className="px-4 text-[10px] text-muted-foreground space-y-1">
				<div className="flex flex-wrap gap-x-2 gap-y-1">
					<a href="/" className="hover:underline">
						About
					</a>
					<a href="/" className="hover:underline">
						Accessibility
					</a>
					<a href="/" className="hover:underline">
						Help Center
					</a>
					<a href="/" className="hover:underline">
						Privacy & Terms
					</a>
				</div>
				<p className="pt-2 font-medium">My Digital Scoop © 2026</p>
			</div>
		</div>
	);
}
