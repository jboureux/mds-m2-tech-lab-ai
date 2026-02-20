"use client";

import { Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModalStore } from "@/store/modal-store";
import { EditUserForm } from "./edit-user-form";

interface UserRowActionsProps {
	user: {
		id: string;
		name: string | null;
		username: string | null;
		bio: string | null;
		email: string;
	};
}

export function UserRowActions({ user }: UserRowActionsProps) {
	const { onOpen } = useModalStore();

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={() =>
				onOpen({
					title: `Edit Profile: ${user.name || user.email}`,
					description:
						"Administrators can update member names, usernames, and biographies to maintain registry accuracy.",
					body: <EditUserForm user={user} />,
				})
			}
			className="h-8 w-8 text-muted-foreground hover:text-primary rounded-lg"
		>
			<Edit2 className="h-4 w-4" />
		</Button>
	);
}
