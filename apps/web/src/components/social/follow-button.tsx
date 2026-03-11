"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

interface FollowButtonProps {
	userId: string;
	className?: string;
}

export function FollowButton({ userId, className }: FollowButtonProps) {
	const queryClient = useQueryClient();
	const session = authClient.useSession();
	const currentUserId = session.data?.user?.id;

	const { data: followingList, isLoading: isFollowingLoading } = useQuery({
		queryKey: ["following"],
		queryFn: async () => {
			const res = await fetch("/api/user/following");
			if (!res.ok) throw new Error("Failed to fetch following list");
			return res.json() as Promise<{ id: string }[]>;
		},
		enabled: !!currentUserId,
	});

	const isFollowing = followingList?.some((user) => user.id === userId);

	const followMutation = useMutation({
		mutationFn: async () => {
			const res = await fetch(`/api/users/${userId}/follow`, {
				method: "POST",
			});
			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.error || "Failed to follow user");
			}
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["following"] });
			toast.success("User followed");
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	const unfollowMutation = useMutation({
		mutationFn: async () => {
			const res = await fetch(`/api/users/${userId}/follow`, {
				method: "DELETE",
			});
			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.error || "Failed to unfollow user");
			}
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["following"] });
			toast.success("User unfollowed");
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	if (!currentUserId || currentUserId === userId) {
		return null;
	}

	const isLoading = isFollowingLoading || followMutation.isPending || unfollowMutation.isPending;

	if (isFollowing) {
		return (
			<Button
				variant="secondary"
				size="sm"
				className={className}
				disabled={isLoading}
				onClick={() => unfollowMutation.mutate()}
			>
				{isLoading ? (
					<Loader2 className="h-4 w-4 animate-spin mr-2" />
				) : (
					<UserMinus className="h-4 w-4 mr-2" />
				)}
				Unfollow
			</Button>
		);
	}

	return (
		<Button
			variant="outline"
			size="sm"
			className={className}
			disabled={isLoading}
			onClick={() => followMutation.mutate()}
		>
			{isLoading ? (
				<Loader2 className="h-4 w-4 animate-spin mr-2" />
			) : (
				<UserPlus className="h-4 w-4 mr-2" />
			)}
			Follow
		</Button>
	);
}
