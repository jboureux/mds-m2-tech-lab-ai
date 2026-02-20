import { ArrowLeft, Home, LogOut } from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";

interface AdminLayoutProps {
	children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session || session.user.role !== "ADMIN") {
		redirect("/access-denied");
	}

	const headerList = await headers();
	const networkLocation = headerList.get("x-network-location") || "off-campus";

	return (
		<SidebarProvider>
			<AppSidebar networkLocation={networkLocation} />
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
					<SidebarTrigger className="-ml-1" />
					<Separator orientation="vertical" className="mr-2 h-4" />
					<div className="flex items-center gap-2">
						<span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
							Administration
						</span>
					</div>
					<div className="ml-auto flex items-center gap-4">
						<Button
							variant="ghost"
							size="sm"
							asChild
							className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors gap-2"
						>
							<Link href="/feed">
								<ArrowLeft className="h-3.5 w-3.5" />
								Exit Administration
							</Link>
						</Button>
					</div>
				</header>
				<main className="flex-1 overflow-auto">{children}</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
