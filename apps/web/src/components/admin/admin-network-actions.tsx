"use client";

import { Plus, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useModalStore } from "@/store/modal-store";
import { AddNetworkRangeForm } from "./add-network-range-form";

/**
 * Action buttons for the Admin Network Management page.
 */
export function AdminNetworkActions() {
	const { onOpen } = useModalStore();
	const router = useRouter();
	const [isRefreshing, setIsRefreshing] = useState(false);

	const handleAddCIDR = () => {
		onOpen({
			title: "Authorize New Network Range",
			description:
				"Register institutional CIDR ranges to enable location-aware posting permissions.",
			body: <AddNetworkRangeForm />,
		});
	};

	const handlePurgeCache = async () => {
		setIsRefreshing(true);
		try {
			const response = await fetch("/api/admin/network", {
				method: "PATCH",
			});

			if (!response.ok) {
				throw new Error("Failed to revalidate cache");
			}

			router.refresh();
			toast.success("Network registry successfully revalidated");
		} catch (_error) {
			toast.error("Failed to sync network registry");
		} finally {
			setTimeout(() => setIsRefreshing(false), 500);
		}
	};

	return (
		<div className="flex items-center gap-3">
			<Button
				variant="outline"
				size="sm"
				onClick={handlePurgeCache}
				disabled={isRefreshing}
				className="h-10 rounded-xl px-4 font-bold text-xs gap-2 border-border/50 hover:bg-muted/50 hidden sm:flex"
			>
				<RefreshCw
					className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
				/>
				Sync Registry
			</Button>

			<Button
				onClick={handleAddCIDR}
				size="sm"
				className="h-10 rounded-xl px-5 font-bold text-xs gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-95 transition-all"
			>
				<Plus className="h-4 w-4" />
				<span className="hidden xs:inline">Add CIDR Range</span>
				<span className="xs:hidden">Add</span>
			</Button>
		</div>
	);
}
