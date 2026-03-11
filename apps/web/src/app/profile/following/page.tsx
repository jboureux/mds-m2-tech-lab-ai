import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AsidePanel } from "@/components/social/server/aside-panel";
import { FollowingList } from "@/components/social/following-list";
import { SocialHeader } from "@/components/social/server/header";
import { SocialSidebar } from "@/components/social/server/sidebar";
import { auth } from "@/lib/auth";

export default async function FollowingPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/");
	}

	return (
		<div className="flex min-h-screen flex-col bg-[#F4F2EE] dark:bg-[#000000] font-sans">
			<SocialHeader />

			<div className="container mx-auto max-w-7xl px-4 py-8 flex items-start gap-6 lg:gap-8">
				<SocialSidebar />

				<main className="flex-1 max-w-2xl mx-auto lg:mx-0 space-y-6">
					<FollowingList currentUserId={session.user.id} />
				</main>

				<AsidePanel />
			</div>
		</div>
	);
}
