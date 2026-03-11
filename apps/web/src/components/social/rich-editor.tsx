"use client";

import Mention from "@tiptap/extension-mention";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { type Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import "tippy.js/dist/tippy.css";
import {
	Bold,
	Check,
	Code,
	FileCode,
	Italic,
	Link as LinkIcon,
	Terminal,
	Type,
	X,
} from "lucide-react";
import * as React from "react";
import { Markdown as TiptapMarkdown } from "tiptap-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { suggestion } from "./mention-suggestion";

// --- Types ---

type FormatType = "bold" | "italic" | "code" | "codeBlock" | "link";

interface EditorState {
	bold: boolean;
	italic: boolean;
	code: boolean;
	codeBlock: boolean;
	link: boolean;
}

interface RichEditorProps {
	content: string;
	onChange: (content: string) => void;
	placeholder?: string;
	disabled?: boolean;
}

// --- Utils ---

const MARKDOWN_DELIMITERS: Record<FormatType, string> = {
	bold: "**",
	italic: "*",
	code: "`",
	codeBlock: "```",
	link: "[",
};

function getMarkdownState(
	textarea: HTMLTextAreaElement,
	content: string,
): EditorState {
	const start = textarea.selectionStart;
	const end = textarea.selectionEnd;
	const before = content.substring(0, start);
	const after = content.substring(end);
	const selected = content.substring(start, end);

	const isWrapped = (delim: string) => {
		if (
			selected.length >= delim.length * 2 &&
			selected.startsWith(delim) &&
			selected.endsWith(delim)
		)
			return true;
		const lastOpen = before.lastIndexOf(delim);
		const nextClose = after.indexOf(delim);
		if (lastOpen === -1 || nextClose === -1) return false;
		const inBetweenBefore = before.substring(lastOpen + delim.length);
		const inBetweenAfter = after.substring(0, nextClose);
		return !inBetweenBefore.includes(delim) && !inBetweenAfter.includes(delim);
	};

	return {
		bold: isWrapped("**") || isWrapped("__"),
		italic: isWrapped("*") || isWrapped("_"),
		code: isWrapped("`"),
		codeBlock: isWrapped("```"),
		link: isWrapped("[") && isWrapped("]"),
	};
}

// --- Component ---

export function RichEditor({
	content,
	onChange,
	placeholder = "What's happening in school?",
	disabled = false,
}: RichEditorProps) {
	const [isMarkdownMode, setIsMarkdownMode] = React.useState(false);
	const [showLinkInput, setShowLinkInput] = React.useState(false);
	const [linkUrl, setLinkUrl] = React.useState("");
	const [activeStyles, setActiveStyles] = React.useState<EditorState>({
		bold: false,
		italic: false,
		code: false,
		codeBlock: false,
		link: false,
	});

	const textareaRef = React.useRef<HTMLTextAreaElement>(null);

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				codeBlock: {
					HTMLAttributes: {
						class: "rounded-md bg-zinc-900 text-zinc-100 p-4 font-mono text-sm",
					},
				},
			}),
			Link.configure({
				openOnClick: false,
				HTMLAttributes: { class: "text-blue-600 underline cursor-pointer" },
			}),
			Mention.configure({
				HTMLAttributes: {
					class: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-md px-1 py-0.5 font-medium",
				},
				suggestion,
			}),
			TiptapMarkdown.configure({
				html: true,
				tightLists: true,
				linkify: true,
				breaks: true,
			}),
			Placeholder.configure({ placeholder }),
		],
		content,
		immediatelyRender: false,
		editorProps: {
			attributes: {
				class:
					"prose dark:prose-invert max-w-none min-h-[150px] focus:outline-none p-4",
			},
		},
		onUpdate: ({ editor }) => {
			onChange((editor.storage as any).markdown.getMarkdown());
		},
		onSelectionUpdate: ({ editor }) => updateVisualState(editor),
		onTransaction: ({ editor }) => updateVisualState(editor),
		editable: !disabled,
	});

	const updateVisualState = (editor: Editor) => {
		setActiveStyles({
			bold: editor.isActive("bold"),
			italic: editor.isActive("italic"),
			code: editor.isActive("code"),
			codeBlock: editor.isActive("codeBlock"),
			link: editor.isActive("link"),
		});
	};

	const updateMarkdownState = () => {
		if (!textareaRef.current) return;
		setActiveStyles(getMarkdownState(textareaRef.current, content));
	};

	React.useEffect(() => {
		if (editor && content !== (editor.storage as any).markdown.getMarkdown()) {
			editor.commands.setContent(content, { emitUpdate: false });
		}
	}, [content, editor]);

	const handleFormat = (type: FormatType) => {
		if (type === "link") {
			if (activeStyles.link) {
				// TOGGLE OFF: Remove link
				if (isMarkdownMode && textareaRef.current) {
					removeMarkdownLink();
				} else if (editor) {
					editor.chain().focus().unsetLink().run();
				}
				return;
			}
			// TOGGLE ON: Show custom input
			setShowLinkInput(true);
			return;
		}

		if (isMarkdownMode && textareaRef.current) {
			applyMarkdownFormat(type);
		} else if (editor) {
			const chain = editor.chain().focus();
			if (type === "bold") chain.toggleBold().run();
			if (type === "italic") chain.toggleItalic().run();
			if (type === "code") chain.toggleCode().run();
			if (type === "codeBlock") chain.toggleCodeBlock().run();
		}
	};

	const setLink = () => {
		if (!linkUrl) {
			setShowLinkInput(false);
			return;
		}

		if (isMarkdownMode && textareaRef.current) {
			const textarea = textareaRef.current;
			const start = textarea.selectionStart;
			const end = textarea.selectionEnd;
			const selectedText = content.substring(start, end) || "link text";
			const formatted = `[${selectedText}](${linkUrl})`;
			const newContent =
				content.substring(0, start) + formatted + content.substring(end);
			onChange(newContent);
			setTimeout(() => {
				textarea.focus();
				textarea.setSelectionRange(
					start + formatted.length,
					start + formatted.length,
				);
				updateMarkdownState();
			}, 0);
		} else if (editor) {
			editor.chain().focus().setLink({ href: linkUrl }).run();
		}

		setLinkUrl("");
		setShowLinkInput(false);
	};

	const removeMarkdownLink = () => {
		const textarea = textareaRef.current!;
		const start = textarea.selectionStart;
		const before = content.substring(0, start);
		const after = content.substring(start);

		// Find the link boundaries around cursor
		const openBracket = before.lastIndexOf("[");
		const closeParen = after.indexOf(")");

		if (openBracket !== -1 && closeParen !== -1) {
			const fullLink = content.substring(openBracket, start + closeParen + 1);
			const match = fullLink.match(/\[(.*?)\]\(.*?\)/);
			if (match) {
				const textOnly = match[1];
				const newContent =
					content.substring(0, openBracket) +
					textOnly +
					content.substring(start + closeParen + 1);
				onChange(newContent);
				setTimeout(() => {
					textarea.setSelectionRange(
						openBracket,
						openBracket + textOnly.length,
					);
					updateMarkdownState();
				}, 0);
			}
		}
	};

	const applyMarkdownFormat = (type: FormatType) => {
		const textarea = textareaRef.current!;
		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const delim = MARKDOWN_DELIMITERS[type];
		const selectedText = content.substring(start, end);

		if (selectedText) {
			const isAlreadyWrapped =
				selectedText.startsWith(delim) && selectedText.endsWith(delim);
			const formatted = isAlreadyWrapped
				? selectedText.substring(
						delim.length,
						selectedText.length - delim.length,
					)
				: `${delim}${selectedText}${delim}`;
			onChange(
				content.substring(0, start) + formatted + content.substring(end),
			);
			setTimeout(() => {
				textarea.focus();
				textarea.setSelectionRange(start, start + formatted.length);
				updateMarkdownState();
			}, 0);
		} else {
			if (activeStyles[type]) {
				const after = content.substring(start);
				const closeIdx = after.indexOf(delim);
				const newPos = start + (closeIdx !== -1 ? closeIdx + delim.length : 0);
				setTimeout(() => {
					textarea.setSelectionRange(newPos, newPos);
					updateMarkdownState();
				}, 0);
			} else {
				const insert =
					type === "codeBlock"
						? "\n```javascript\n\n```\n"
						: `${delim}${delim}`;
				onChange(content.substring(0, start) + insert + content.substring(end));
				setTimeout(() => {
					textarea.setSelectionRange(
						start + (type === "codeBlock" ? 14 : delim.length),
						start + (type === "codeBlock" ? 14 : delim.length),
					);
					updateMarkdownState();
				}, 0);
			}
		}
	};

	if (!editor)
		return (
			<div className="w-full h-[150px] bg-slate-50 dark:bg-zinc-800/50 rounded-xl animate-pulse border" />
		);

	return (
		<div className="flex flex-col border dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 transition-all focus-within:ring-2 focus-within:ring-blue-600/20">
			<div className="flex items-center justify-between p-2 border-b dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 min-h-[48px]">
				{showLinkInput ? (
					<div className="flex items-center gap-2 flex-1 animate-in slide-in-from-left-2 duration-200">
						<Input
							autoFocus
							placeholder="https://example.com"
							value={linkUrl}
							onChange={(e) => setLinkUrl(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && setLink()}
							className="h-8 text-xs"
						/>
						<Button
							size="icon"
							variant="ghost"
							className="h-8 w-8 text-emerald-600"
							onClick={setLink}
						>
							<Check className="h-4 w-4" />
						</Button>
						<Button
							size="icon"
							variant="ghost"
							className="h-8 w-8 text-red-600"
							onClick={() => setShowLinkInput(false)}
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
				) : (
					<div className="flex items-center gap-1">
						<ToolbarButton
							active={activeStyles.bold}
							onClick={() => handleFormat("bold")}
							icon={Bold}
							tooltip="Bold"
							disabled={disabled}
						/>
						<ToolbarButton
							active={activeStyles.italic}
							onClick={() => handleFormat("italic")}
							icon={Italic}
							tooltip="Italic"
							disabled={disabled}
						/>
						<ToolbarButton
							active={activeStyles.code}
							onClick={() => handleFormat("code")}
							icon={Code}
							tooltip="Inline Code"
							disabled={disabled}
						/>
						<ToolbarButton
							active={activeStyles.codeBlock}
							onClick={() => handleFormat("codeBlock")}
							icon={FileCode}
							tooltip="Code Block"
							disabled={disabled}
						/>
						<ToolbarButton
							active={activeStyles.link}
							onClick={() => handleFormat("link")}
							icon={LinkIcon}
							tooltip="Link"
							disabled={disabled}
						/>
					</div>
				)}

				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => setIsMarkdownMode(!isMarkdownMode)}
					className="h-7 px-2 text-[10px] gap-1.5 font-bold uppercase tracking-wider text-muted-foreground hover:text-blue-600 transition-colors"
				>
					{isMarkdownMode ? (
						<>
							<Terminal className="h-3 w-3" /> Visual Mode
						</>
					) : (
						<>
							<Type className="h-3 w-3" /> Markdown Mode
						</>
					)}
				</Button>
			</div>

			<div className="relative">
				{isMarkdownMode ? (
					<Textarea
						ref={textareaRef}
						value={content}
						onChange={(e) => onChange(e.target.value)}
						onSelect={updateMarkdownState}
						onKeyUp={updateMarkdownState}
						onMouseUp={updateMarkdownState}
						placeholder="Raw Markdown editing..."
						disabled={disabled}
						className="min-h-[150px] resize-none bg-transparent border-none focus-visible:ring-0 p-4 font-mono text-sm leading-relaxed"
					/>
				) : (
					<div className="min-h-[150px] cursor-text">
						<EditorContent editor={editor} />
					</div>
				)}
			</div>
		</div>
	);
}

function ToolbarButton({
	active,
	onClick,
	icon: Icon,
	tooltip,
	disabled,
}: {
	active: boolean;
	onClick: () => void;
	icon: React.ElementType;
	tooltip: string;
	disabled?: boolean;
}) {
	return (
		<TooltipProvider delayDuration={300}>
			<Tooltip>
				<TooltipTrigger asChild>
					<button
						type="button"
						onClick={onClick}
						disabled={disabled}
						className={`h-8 w-8 flex items-center justify-center rounded-md transition-all border border-transparent ${
							active
								? "bg-blue-600 text-white shadow-sm"
								: "text-slate-500 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
						} disabled:opacity-30`}
					>
						<Icon className="h-4 w-4" />
					</button>
				</TooltipTrigger>
				<TooltipContent className="text-[10px] font-black border-none bg-zinc-900 text-white shadow-lg">
					{tooltip}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
