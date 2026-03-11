import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AtSign, User } from "lucide-react";
import React, {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";

export interface MentionListProps {
	items: any[];
	command: (item: any) => void;
}

export const MentionList = forwardRef((props: MentionListProps, ref) => {
	const [selectedIndex, setSelectedIndex] = useState(0);
	const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);

	// --- Effects ---

	// Auto-scroll the selected item into view
	useEffect(() => {
		const selectedElement = itemsRef.current[selectedIndex];
		if (selectedElement) {
			const timeoutId = setTimeout(() => {
				selectedElement.scrollIntoView({
					block: "nearest",
					behavior: "auto",
				});
			}, 10);
			return () => clearTimeout(timeoutId);
		}
	}, [selectedIndex]);

	// Reset selection when items change
	useEffect(() => {
		setSelectedIndex(0);
	}, [props.items]);

	// --- Handlers ---

	const selectItem = (index: number) => {
		const item = props.items[index];
		if (item) {
			props.command({ id: item.id, label: item.username });
		}
	};

	const upHandler = () => {
		setSelectedIndex(
			(selectedIndex + props.items.length - 1) % props.items.length,
		);
	};

	const downHandler = () => {
		setSelectedIndex((selectedIndex + 1) % props.items.length);
	};

	const enterHandler = () => {
		selectItem(selectedIndex);
	};

	// --- Imperative API for TipTap ---

	useImperativeHandle(ref, () => ({
		onKeyDown: ({ event }: { event: KeyboardEvent }) => {
			if (event.key === "ArrowUp") {
				upHandler();
				return true;
			}

			if (event.key === "ArrowDown") {
				downHandler();
				return true;
			}

			if (event.key === "Enter") {
				enterHandler();
				return true;
			}

			return false;
		},
	}));

	if (props.items.length === 0) {
		return null;
	}

	return (
		<div 
			className="z-50 min-w-[260px] flex flex-col overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-xl animate-in fade-in-0 zoom-in-95 max-h-[400px]"
			onWheel={(e) => e.stopPropagation()}
		>
			{/* Header */}
			<div className="shrink-0 px-3 py-1.5 border-b bg-muted/30 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<AtSign className="h-3 w-3 text-muted-foreground" />
					<span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
						Suggestions
					</span>
				</div>
				<span className="text-[9px] text-muted-foreground bg-background px-1.5 py-0.5 rounded border">
					{props.items.length}
				</span>
			</div>

			{/* List */}
			<div className="flex-1 overflow-y-auto overflow-x-hidden p-1 max-h-[280px]">
				<div className="flex flex-col gap-0.5">
					{props.items.map((item, index) => {
						const isSelected = index === selectedIndex;
						return (
							<Button
								key={item.id}
								ref={(el) => {
									itemsRef.current[index] = el;
								}}
								variant="ghost"
								className={cn(
									"group relative flex w-full items-center justify-start gap-3 p-2 h-auto text-sm font-normal rounded-lg transition-colors border-none",
									isSelected
										? "bg-primary text-primary-foreground shadow-sm"
										: "hover:bg-accent hover:text-accent-foreground",
								)}
								onClick={() => selectItem(index)}
							>
								<Avatar className={cn(
									"h-8 w-8 border transition-transform duration-200",
									isSelected ? "border-primary-foreground/20 scale-105" : "border-transparent"
								)}>
									<AvatarImage src={item.image} />
									<AvatarFallback className="text-[10px] font-bold">
										{item.username?.slice(0, 1).toUpperCase()}
									</AvatarFallback>
								</Avatar>

								<div className="flex flex-col items-start overflow-hidden flex-1 text-left">
									<div className="flex items-center gap-1.5 w-full">
										<span className={cn(
											"font-semibold truncate transition-colors",
											isSelected ? "text-primary-foreground" : "text-foreground"
										)}>
											@{item.username}
										</span>
										{item.role && item.role !== "USER" && (
											<span className={cn(
												"text-[7px] font-black uppercase px-1 rounded border",
												isSelected ? "bg-white/20 border-white/30 text-white" : "bg-muted text-muted-foreground"
											)}>
												{item.role}
											</span>
										)}
									</div>
									<span className={cn(
										"text-[10px] truncate w-full",
										isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
									)}>
										{item.name || "Student"}
									</span>
								</div>

								{isSelected && (
									<div className="shrink-0 bg-primary-foreground/20 rounded-full p-1 text-primary-foreground">
										<User className="h-2.5 w-2.5" />
									</div>
								)}
							</Button>
						);
					})}
				</div>
			</div>

			{/* Helper Footer */}
			<div className="shrink-0 p-1.5 bg-muted/20 border-t flex items-center justify-center">
				<div className="flex items-center gap-3 text-[8px] font-medium text-muted-foreground uppercase tracking-widest">
					<span className="flex items-center gap-1">
						<kbd className="bg-background border px-1 rounded shadow-sm text-[7px] font-mono">↑↓</kbd> 
						Navigate
					</span>
					<span className="flex items-center gap-1">
						<kbd className="bg-background border px-1 rounded shadow-sm text-[7px] font-mono">ENTER</kbd> 
						Select
					</span>
				</div>
			</div>
		</div>
	);
});

MentionList.displayName = "MentionList";
