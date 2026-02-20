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

export function RichEditor({
	content,
	onChange,
	placeholder = "What's happening in school?",
	disabled = false,
}: RichEditorProps) {
	const [isMarkdownMode, setIsMarkdownMode] = React.useState(false);

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
		editorProps: {
			attributes: {
				class:
					"prose dark:prose-invert max-w-none min-h-[150px] focus:outline-none p-3",
			},
		},
		onUpdate: ({ editor }) => {
			// Get markdown from tiptap
			const markdown = (editor.storage.markdown as any).getMarkdown();
			onChange(markdown);
		},
		editable: !disabled,
	});

	// Sync content from parent if needed (e.g., when changed in Markdown mode)
	React.useEffect(() => {
		if (editor && content !== (editor.storage.markdown as any).getMarkdown()) {
			editor.commands.setContent(content, false);
		}
	}, [content, editor]);

	if (!editor) {
		return null;
	}

	const toggleMode = () => {
		setIsMarkdownMode(!isMarkdownMode);
	};

	return (
		<div className="flex flex-col border dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 transition-all focus-within:ring-2 focus-within:ring-blue-600/20">
			{/* Toolbar */}
			<div className="flex items-center justify-between p-1.5 border-b dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30">
				<div className="flex items-center gap-0.5">
					<TooltipProvider>
						<ToolbarButton
							active={editor.isActive("bold")}
							onClick={() => editor.chain().focus().toggleBold().run()}
							icon={Bold}
							tooltip="Bold (**)"
							disabled={isMarkdownMode || disabled}
						/>
						<ToolbarButton
							active={editor.isActive("italic")}
							onClick={() => editor.chain().focus().toggleItalic().run()}
							icon={Italic}
							tooltip="Italic (*)"
							disabled={isMarkdownMode || disabled}
						/>
						<ToolbarButton
							active={editor.isActive("code")}
							onClick={() => editor.chain().focus().toggleCode().run()}
							icon={Code}
							tooltip="Inline Code (`)"
							disabled={isMarkdownMode || disabled}
						/>
						<ToolbarButton
							active={editor.isActive("codeBlock")}
							onClick={() => editor.chain().focus().toggleCodeBlock().run()}
							icon={FileCode}
							tooltip="Code Block (```)"
							disabled={isMarkdownMode || disabled}
						/>
						<ToolbarButton
							active={editor.isActive("link")}
							onClick={() => {
								const url = window.prompt("Enter URL:");
								if (url) {
									editor.chain().focus().setLink({ href: url }).run();
								}
							}}
							icon={LinkIcon}
							tooltip="Link"
							disabled={isMarkdownMode || disabled}
						/>
					</TooltipProvider>
				</div>

				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={toggleMode}
					className="h-7 px-2 text-[10px] gap-1.5 font-bold uppercase tracking-wider"
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

			{/* Editor Content */}
			<div className="relative">
				{isMarkdownMode ? (
					<Textarea
						value={content}
						onChange={(e) => onChange(e.target.value)}
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
	icon: any;
	tooltip: string;
	disabled?: boolean;
}) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					type="button"
					variant={active ? "secondary" : "ghost"}
					size="icon"
					className="h-8 w-8 transition-all"
					onClick={onClick}
					disabled={disabled}
				>
					<Icon className={`h-4 w-4 ${active ? "text-blue-600" : ""}`} />
				</Button>
			</TooltipTrigger>
			<TooltipContent className="text-[10px]">{tooltip}</TooltipContent>
		</Tooltip>
	);
}
