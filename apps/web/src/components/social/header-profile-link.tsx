"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface HeaderProfileLinkProps {
	profileHref: string;
	user: {
		name: string | null;
		image?: string | null;
	};
}

export function HeaderProfileLink({
	profileHref,
	user,
}: HeaderProfileLinkProps) {
	const pathname = usePathname();
	const active =
		pathname === profileHref ||
		(profileHref !== "/profile" && pathname.startsWith(profileHref));

	return (
		<Link href={profileHref}>
			<Button
				variant="ghost"
				className={`p-0.5 rounded-full transition-all ${
					active
						? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-600"
						: "hover:bg-slate-100 dark:hover:bg-zinc-800"
				}`}
			>
				<Avatar className="h-8 w-8">
					<AvatarImage src={user.image || ""} />
					<AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
				</Avatar>
			</Button>
		</Link>
	);
}
