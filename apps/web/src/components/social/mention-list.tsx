import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
	const scrollAreaRef = useRef<HTMLDivElement>(null);
	const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);

	// --- Effects ---

	// Auto-scroll the selected item into view
	useEffect(() => {
		const selectedElement = itemsRef.current[selectedIndex];
		if (selectedElement) {
			// Use a small timeout to ensure the element is rendered and positioned
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
		<div className="z-50 min-w-[280px] flex flex-col overflow-hidden rounded-2xl border-2 border-blue-600/10 bg-white dark:bg-zinc-950 p-2 text-popover-foreground shadow-[0_20px_50px_rgba(8,_112,_184,_0.15)] animate-in fade-in-0 zoom-in-95 backdrop-blur-xl max-h-[450px]">
			{/* Header - Fixed at top */}
			<div className="shrink-0 px-3 py-2 border-b border-slate-100 dark:border-zinc-800 mb-2 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div className="bg-blue-600/10 p-1.5 rounded-lg">
						<AtSign className="h-3.5 w-3.5 text-blue-600" />
					</div>
					<span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
						Tag a Schoolmate
					</span>
				</div>
				<span className="text-[9px] text-muted-foreground font-medium bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
					{props.items.length}
				</span>
			</div>

			{/* List - Scrollable middle part */}
			<div className="flex-1 overflow-y-auto custom-scrollbar px-1 mb-2 max-h-[300px]">
				<div className="flex flex-col gap-1">
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
									"group relative flex w-full items-center justify-start gap-3 p-2.5 h-auto text-sm font-normal rounded-xl transition-all duration-200 border-2 border-transparent",
									isSelected
										? "bg-blue-50 dark:bg-blue-600/10 border-blue-600/20 shadow-sm"
										: "hover:bg-slate-50 dark:hover:bg-zinc-900",
								)}
								onClick={() => selectItem(index)}
							>
								{/* Selection indicator pill */}
								{isSelected && (
									<div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-full" />
								)}

								<Avatar className={cn(
									"h-10 w-10 border-2 transition-transform duration-300",
									isSelected ? "border-blue-600 scale-110" : "border-transparent group-hover:scale-105"
								)}>
									<AvatarImage src={item.image} />
									<AvatarFallback className="bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-bold">
										{item.username?.slice(0, 1).toUpperCase()}
									</AvatarFallback>
								</Avatar>

								<div className="flex flex-col items-start overflow-hidden flex-1 text-left">
									<div className="flex items-center gap-1.5 w-full">
										<span className={cn(
											"font-bold truncate transition-colors",
											isSelected ? "text-blue-600" : "text-slate-900 dark:text-zinc-100"
										)}>
											@{item.username}
										</span>
										{item.role && item.role !== "USER" && (
											<span className="text-[8px] font-black uppercase bg-amber-100 dark:bg-amber-900/30 text-amber-600 px-1 rounded">
												{item.role}
											</span>
										)}
									</div>
									<span className="text-[11px] text-muted-foreground font-medium truncate w-full">
										{item.name || "Student"}
									</span>
								</div>

								<div className={cn(
									"transition-all duration-300 opacity-0 transform translate-x-2 group-hover:opacity-100 group-hover:translate-x-0",
									isSelected && "opacity-100 translate-x-0"
								)}>
									<div className="bg-blue-600 rounded-full p-1 text-white shadow-lg">
										<User className="h-3 w-3" />
									</div>
								</div>
							</Button>
						);
					})}
				</div>
			</div>

			{/* Helper - Fixed at bottom */}
			<div className="shrink-0 mt-auto p-2 bg-slate-50/50 dark:bg-zinc-900/50 rounded-xl border border-slate-100 dark:border-zinc-800 flex items-center justify-center">
				<p className="text-[9px] text-muted-foreground flex items-center gap-1.5 font-bold uppercase tracking-widest">
					<kbd className="bg-white dark:bg-zinc-800 border px-1 rounded shadow-sm text-blue-600 font-black">↑↓</kbd> 
					<span>to navigate</span>
					<kbd className="bg-white dark:bg-zinc-800 border px-1 rounded shadow-sm ms-2 text-blue-600 font-black">ENTER</kbd> 
					<span>to tag</span>
				</p>
			</div>
		</div>
	);
});

MentionList.displayName = "MentionList";
