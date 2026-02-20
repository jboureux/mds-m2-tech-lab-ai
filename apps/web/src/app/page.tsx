import { redirect } from "next/navigation";

export default function RootPage() {
	// Redirect to /feed temporarily until the landing page is ready
	redirect("/feed");
}
