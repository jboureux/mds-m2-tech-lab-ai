"use client";

import { Upload, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModalStore } from "@/store/modal-store";
import { CreateUserForm } from "./create-user-form";
import { ImportUsersForm } from "./import-users-form";

/**
 * Client component to handle user management actions in the admin dashboard.
 * Separated to keep the parent page as a Server Component.
 */
export function AdminUserActions() {
	const { onOpen } = useModalStore();

	return (
		<div className="flex gap-3">
			<Button
				variant="outline"
				onClick={() =>
					onOpen({
						title: "Identity Pool Utility",
						description:
							"Pre-register members by importing a structured CSV file. This will grant immediate access permissions based on assigned roles.",
						body: <ImportUsersForm />,
					})
				}
				className="hidden md:flex gap-2 shadow-sm border-border/50 hover:bg-muted/50 font-bold transition-all active:scale-95"
			>
				<Upload className="h-4 w-4" />
				Batch Import
			</Button>
			<Button
				onClick={() =>
					onOpen({
						title: "Grant Access",
						description:
							"Manually add a member to the authorized identity pool. They will be able to sign in using their school email.",
						body: <CreateUserForm />,
					})
				}
				className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 border-none shadow-lg shadow-primary/20 active:scale-95 transition-all font-bold px-6"
			>
				<UserPlus className="h-4 w-4" />
				Authorize Member
			</Button>
		</div>
	);
}
