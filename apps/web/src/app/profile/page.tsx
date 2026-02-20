import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AsidePanel } from "@/components/social/aside-panel";
import { SocialHeader } from "@/components/social/header";
import { ProfileForm } from "@/components/social/profile-form";
import { SocialSidebar } from "@/components/social/sidebar";
import { auth } from "@/lib/auth";

export default async function ProfilePage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/");
	}

	return (
		<div className="flex min-h-screen flex-col bg-[#F4F2EE] dark:bg-[#000000] font-sans selection:bg-blue-100 dark:selection:bg-blue-900/40">
			<SocialHeader />

			<div className="container mx-auto max-w-7xl px-4 py-8 flex items-start gap-6 lg:gap-8">
				<SocialSidebar />

				<main className="flex-1 max-w-2xl mx-auto lg:mx-0 space-y-6">
					<ProfileForm user={session.user} />
				</main>

				<AsidePanel />
			</div>
		</div>
	);
}
