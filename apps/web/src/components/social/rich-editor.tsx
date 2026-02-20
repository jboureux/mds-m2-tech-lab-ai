"use client";

import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
	Bold,
	Code,
	FileCode,
	Italic,
	Link as LinkIcon,
	Terminal,
	Type,
} from "lucide-react";
import * as React from "react";
import { Markdown as TiptapMarkdown } from "tiptap-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface RichEditorProps {
	content: string;
	onChange: (content: string) => void;
	placeholder?: string;
	disabled?: boolean;
}

// Extension of Tiptap storage to include markdown support
interface MarkdownStorage {
	markdown: {
		getMarkdown: () => string;
	};
}

export function RichEditor({
	content,
	onChange,
	placeholder = "What's happening in school?",
	disabled = false,
}: RichEditorProps) {
	const [isMarkdownMode, setIsMarkdownMode] = React.useState(false);
	const [mdActiveStyles, setMdActiveStyles] = React.useState({
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
				HTMLAttributes: {
					class: "text-blue-600 dark:text-blue-400 underline cursor-pointer",
				},
			}),
			Placeholder.configure({
				placeholder,
			}),
			TiptapMarkdown,
		],
		content,
		immediatelyRender: false,
		editorProps: {
			attributes: {
				class:
					"prose dark:prose-invert max-w-none min-h-[150px] focus:outline-none p-3",
			},
		},
		onUpdate: ({ editor }) => {
			const storage = editor.storage as MarkdownStorage;
			const markdown = storage.markdown.getMarkdown();
			onChange(markdown);
		},
		editable: !disabled,
	});

	const checkMarkdownStyles = React.useCallback(() => {
		if (!textareaRef.current) return;

		const textarea = textareaRef.current;
		const start = textarea.selectionStart;
		const before = content.substring(0, start);
		const after = content.substring(start);

		// Robust detection using simple string matching
		const isWrapped = (delim: string) => {
			return before.includes(delim) && after.includes(delim);
		};

		const styles = {
			bold: isWrapped("**") || isWrapped("__"),
			italic: isWrapped("*") || isWrapped("_"),
			code: isWrapped("`"),
			codeBlock: isWrapped("```"),
			link: isWrapped("[") && isWrapped("]"),
		};

		setMdActiveStyles(styles);
	}, [content]);

	// Sync content from parent
	React.useEffect(() => {
		if (editor) {
			const storage = editor.storage as MarkdownStorage;
			if (content !== storage.markdown.getMarkdown()) {
				editor.commands.setContent(content, false);
			}
		}
	}, [content, editor]);

	if (!editor) {
		return null;
	}

	const toggleMode = () => {
		setIsMarkdownMode(!isMarkdownMode);
	};

	const handleFormat = (type: string) => {
		if (isMarkdownMode && textareaRef.current) {
			const textarea = textareaRef.current;
			const start = textarea.selectionStart;
			const end = textarea.selectionEnd;
			const selectedText = content.substring(start, end);
			let formattedText = "";
			let cursorOffset = 0;

			switch (type) {
				case "bold":
					formattedText = `**${selectedText || "bold text"}**`;
					cursorOffset = selectedText ? 0 : -2;
					break;
				case "italic":
					formattedText = `*${selectedText || "italic text"}*`;
					cursorOffset = selectedText ? 0 : -1;
					break;
				case "code":
					formattedText = `\`${selectedText || "code text"}\``;
					break;
				case "codeBlock":
					formattedText = `\n\`\`\`javascript\n${selectedText || "code"}\n\`\`\`\n`;
					break;
				case "link":
					formattedText = `[${selectedText || "link text"}](https://)`;
					cursorOffset = -1;
					break;
			}

			const newContent =
				content.substring(0, start) + formattedText + content.substring(end);
			onChange(newContent);

			setTimeout(() => {
				textarea.focus();
				if (!selectedText) {
					const newPos = start + formattedText.length + cursorOffset;
					textarea.setSelectionRange(newPos, newPos);
				}
				checkMarkdownStyles();
			}, 0);
		} else {
			// Tiptap commands
			switch (type) {
				case "bold":
					editor.chain().focus().toggleBold().run();
					break;
				case "italic":
					editor.chain().focus().toggleItalic().run();
					break;
				case "code":
					editor.chain().focus().toggleCode().run();
					break;
				case "codeBlock":
					editor.chain().focus().toggleCodeBlock().run();
					break;
				case "link": {
					const url = window.prompt("Enter URL:");
					if (url) {
						editor.chain().focus().setLink({ href: url }).run();
					}
					break;
				}
			}
		}
	};

	const isStyleActive = (type: string) => {
		if (isMarkdownMode) {
			return (mdActiveStyles as Record<string, boolean>)[type];
		}
		if (type === "codeBlock") return editor.isActive("codeBlock");
		return editor.isActive(type);
	};

	return (
		<div className="flex flex-col border dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 transition-all focus-within:ring-2 focus-within:ring-blue-600/20">
			<div className="flex items-center justify-between p-1.5 border-b dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30">
				<div className="flex items-center gap-0.5">
					<ToolbarButton
						active={isStyleActive("bold")}
						onClick={() => handleFormat("bold")}
						icon={Bold}
						tooltip="Bold (**)"
						disabled={disabled}
					/>
					<ToolbarButton
						active={isStyleActive("italic")}
						onClick={() => handleFormat("italic")}
						icon={Italic}
						tooltip="Italic (*)"
						disabled={disabled}
					/>
					<ToolbarButton
						active={isStyleActive("code")}
						onClick={() => handleFormat("code")}
						icon={Code}
						tooltip="Inline Code (`)"
						disabled={disabled}
					/>
					<ToolbarButton
						active={isStyleActive("codeBlock")}
						onClick={() => handleFormat("codeBlock")}
						icon={FileCode}
						tooltip="Code Block (```)"
						disabled={disabled}
					/>
					<ToolbarButton
						active={isStyleActive("link")}
						onClick={() => handleFormat("link")}
						icon={LinkIcon}
						tooltip="Link"
						disabled={disabled}
					/>
				</div>

				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={toggleMode}
					className="h-7 px-2 text-[10px] gap-1.5 font-bold uppercase tracking-wider text-muted-foreground hover:text-blue-600"
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
						onChange={(e) => {
							onChange(e.target.value);
							setTimeout(checkMarkdownStyles, 0);
						}}
						onSelect={checkMarkdownStyles}
						onKeyUp={checkMarkdownStyles}
						onMouseUp={checkMarkdownStyles}
						placeholder="Raw Markdown editing..."
						disabled={disabled}
						className="min-h-[150px] resize-none bg-transparent border-none focus-visible:ring-0 p-3 font-mono text-sm leading-relaxed"
					/>
				) : (
					<EditorContent editor={editor} className="min-h-[150px]" />
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
	active?: boolean;
	onClick: () => void;
	// biome-ignore lint/suspicious/noExplicitAny: lucide icon type
	icon: any;
	tooltip: string;
	disabled?: boolean;
}) {
	return (
		<TooltipProvider delayDuration={300}>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className={`h-8 w-8 transition-all ${
							active
								? "bg-slate-200 dark:bg-zinc-700 text-blue-600 shadow-inner"
								: "text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-zinc-800"
						}`}
						onClick={onClick}
						disabled={disabled}
					>
						<Icon className="h-4 w-4" />
					</Button>
				</TooltipTrigger>
				<TooltipContent className="text-[10px] font-black border-none bg-blue-600 text-white shadow-lg">
					{tooltip}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
