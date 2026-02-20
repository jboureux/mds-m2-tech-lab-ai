"use client";

import type { User } from "better-auth";
import {
	FileText,
	Loader2,
	LogOut,
	Mail,
	Shield,
	ShieldAlert,
	User as UserIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type * as React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { signOut } from "@/lib/auth-client";

export function ProfileForm({ user }: { user: User }) {
	const router = useRouter();

	const isStandardMember = user.role === "USER";
	const [isEditing, setIsEditing] = useState(false);
	const [name, setName] = useState(user.name || "");
	const [username, setUsername] = useState(user.username || "");
	const [bio, setBio] = useState(user.bio || "");
	const [isUpdating, setIsUpdating] = useState(false);

	const handleUpdate = async (e: React.FormEvent) => {
		e.preventDefault();

		setIsUpdating(true);
		try {
			const updateData: { bio: string; name?: string; username?: string } = {
				bio: bio,
			};

			// Only non-standard members can update their name and username
			if (!isStandardMember) {
				updateData.name = name;
				updateData.username = username;
			}

			const response = await fetch("/api/user/profile", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(updateData),
			});

			const result = await response.json();

			if (!response.ok) {
				toast.error(result.error || "Failed to update profile");
			} else {
				toast.success("Profile updated successfully");
				setIsEditing(false);

				// If username changed and we are on a profile page, redirect to new URL
				if (result.user.username && result.user.username !== user.username) {
					router.push(`/u/${result.user.username}`);
				} else {
					router.refresh();
				}
			}
		} catch (_err) {
			toast.error("An error occurred while updating profile");
		} finally {
			setIsUpdating(false);
		}
	};

	const handleSignOut = async () => {
		await signOut({
			fetchOptions: {
				onSuccess: () => {
					router.push("/");
				},
			},
		});
	};

	return (
		<div className="space-y-6">
			<Card className="border-none shadow-sm overflow-hidden bg-white dark:bg-zinc-900">
				<div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
					<div className="absolute -bottom-12 left-8 p-1 rounded-full bg-white dark:bg-zinc-900 shadow-md">
						<Avatar className="h-24 w-24 border-2 border-white dark:border-zinc-900">
							<AvatarImage src={user.image || ""} />
							<AvatarFallback className="text-2xl font-bold bg-blue-100 text-blue-700">
								{user.name?.charAt(0) || "U"}
							</AvatarFallback>
						</Avatar>
					</div>
				</div>
				<CardHeader className="pt-16 pb-4 px-8">
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-2xl font-black flex items-center gap-2">
								{user.name}
								{user.username && (
									<span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
										@{user.username}
									</span>
								)}
							</CardTitle>
							<CardDescription className="flex items-center gap-2 mt-1">
								<Badge
									variant="secondary"
									className="text-[10px] font-black uppercase bg-blue-50 text-blue-700 border-none"
								>
									{user.role}
								</Badge>
								<span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
									<Mail className="h-3 w-3" /> {user.email}
								</span>
							</CardDescription>
						</div>
						{!isEditing && (
							<Button
								variant="outline"
								size="sm"
								onClick={() => setIsEditing(true)}
								className="rounded-lg font-bold text-xs"
							>
								Edit Profile
							</Button>
						)}
					</div>
				</CardHeader>
				<CardContent className="px-8 pb-8 space-y-6">
					{isEditing ? (
						<form onSubmit={handleUpdate} className="space-y-4">
							<div className="space-y-2">
								<Label
									htmlFor="name"
									className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70"
								>
									Display Name
								</Label>
								<div className="relative group">
									<UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-blue-600 transition-colors" />
									<Input
										id="name"
										value={name}
										onChange={(e) => setName(e.target.value)}
										placeholder="Your Name"
										disabled={isStandardMember}
										className="pl-10 h-11 bg-slate-50 dark:bg-zinc-800 border-none ring-0 focus-visible:ring-2 focus-visible:ring-blue-600/50 transition-all rounded-xl"
									/>
									{isStandardMember && (
										<p className="text-[10px] text-muted-foreground mt-1 ml-1 italic">
											Standard accounts cannot change their display name.
										</p>
									)}
								</div>
							</div>

							{!isStandardMember && (
								<div className="space-y-2">
									<Label
										htmlFor="username"
										className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70"
									>
										Handle (@username)
									</Label>
									<div className="relative group">
										<span className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground font-bold flex items-center justify-center">
											@
										</span>
										<Input
											id="username"
											value={username}
											onChange={(e) => setUsername(e.target.value)}
											placeholder="username"
											className="pl-10 h-11 bg-slate-50 dark:bg-zinc-800 border-none ring-0 focus-visible:ring-2 focus-visible:ring-blue-600/50 transition-all rounded-xl"
										/>
									</div>
								</div>
							)}

							<div className="space-y-2">
								<Label
									htmlFor="bio"
									className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70"
								>
									Biography
								</Label>
								<div className="relative group">
									<FileText className="absolute left-3 top-4 h-4 w-4 text-muted-foreground group-focus-within:text-blue-600 transition-colors" />
									<Textarea
										id="bio"
										value={bio}
										onChange={(e) => setBio(e.target.value)}
										placeholder="Tell us a bit about yourself..."
										className="pl-10 min-h-[100px] bg-slate-50 dark:bg-zinc-800 border-none ring-0 focus-visible:ring-2 focus-visible:ring-blue-600/50 transition-all rounded-xl resize-none"
									/>
								</div>
							</div>

							<div className="flex gap-2 justify-end pt-2">
								<Button
									type="button"
									variant="ghost"
									onClick={() => {
										setIsEditing(false);
										setName(user.name || "");
										setUsername(user.username || "");
										setBio(user.bio || "");
									}}
									className="text-xs font-bold"
								>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={isUpdating}
									className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 rounded-xl text-xs"
								>
									{isUpdating ? (
										<Loader2 className="h-4 w-4 animate-spin mr-2" />
									) : null}
									Save Changes
								</Button>
							</div>
						</form>
					) : (
						<div className="space-y-6">
							{user.bio ? (
								<div className="space-y-1">
									<p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70">
										Biography
									</p>
									<p className="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed italic">
										"{user.bio}"
									</p>
								</div>
							) : (
								<div className="space-y-1">
									<p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70">
										Biography
									</p>
									<p className="text-xs text-muted-foreground italic">
										No bio provided yet. Click "Edit Profile" to add one!
									</p>
								</div>
							)}

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
								<div className="space-y-1">
									<p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70">
										Role
									</p>
									<div className="flex items-center gap-2">
										<Shield className="h-4 w-4 text-blue-600" />
										<p className="text-sm font-semibold">{user.role}</p>
									</div>
								</div>
								<div className="space-y-1">
									<p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70">
										Account ID
									</p>
									<p className="text-xs font-mono text-muted-foreground truncate">
										{user.id}
									</p>
								</div>

								{user.username && (
									<div className="space-y-1">
										<p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70">
											Handle
										</p>
										<p className="text-sm font-semibold text-blue-600">
											@{user.username}
										</p>
									</div>
								)}

								{isStandardMember && (
									<div className="col-span-full mt-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30">
										<div className="flex items-start gap-3">
											<ShieldAlert className="h-5 w-5 text-blue-600 shrink-0" />
											<div className="space-y-1">
												<p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-tight">
													Standard Membership
												</p>
												<p className="text-[11px] text-blue-600 dark:text-blue-300 leading-relaxed font-medium">
													Your profile is partially managed by your school
													institution. Standard accounts can only update their
													biography.
												</p>
											</div>
										</div>
									</div>
								)}
							</div>
						</div>
					)}
				</CardContent>
				<CardFooter className="border-t px-8 py-4 bg-slate-50/50 dark:bg-zinc-800/30">
					<Button
						variant="ghost"
						size="sm"
						onClick={handleSignOut}
						className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold gap-2 text-xs"
					>
						<LogOut className="h-4 w-4" />
						Sign Out
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
