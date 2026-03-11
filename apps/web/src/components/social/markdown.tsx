"use client";

import { useTheme } from "next-themes";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
	oneDark,
	oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

interface MarkdownProps {
	content: string;
	className?: string;
}

// Extend default schema to allow style attribute with color for span
const schema = {
	...defaultSchema,
	attributes: {
		...defaultSchema.attributes,
		span: ["style"], // Allow style on span
	},
};

export function Markdown({ content, className }: MarkdownProps) {
	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === "dark";

	return (
		<div className={`markdown-content ${className || ""}`}>
			<ReactMarkdown
				rehypePlugins={[rehypeRaw, [rehypeSanitize, schema]]}
				components={{
					code: (
						// biome-ignore lint/suspicious/noExplicitAny: react-markdown component props are complex
						{ node, inline, className: codeClassName, children, ...props }: any,
					) => {
						const match = /language-(\w+)/.exec(codeClassName || "");
						return !inline && match ? (
							<div className="rounded-lg overflow-hidden my-4 shadow-sm border dark:border-zinc-800">
								<SyntaxHighlighter
									style={isDark ? oneDark : oneLight}
									language={match[1]}
									PreTag="div"
									customStyle={{
										margin: 0,
										padding: "1rem",
										fontSize: "0.875rem",
										background: isDark ? "#18181b" : "#f8fafc",
									}}
									{...props}
								>
									{String(children).replace(/\n$/, "")}
								</SyntaxHighlighter>
							</div>
						) : (
							<code
								className={`px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-mono text-xs ${
									codeClassName || ""
								}`}
								{...props}
							>
								{children}
							</code>
						);
					},
					p: ({ children }) => (
						<p className="mb-4 last:mb-0 leading-relaxed whitespace-pre-wrap">
							{children}
						</p>
					),
					h1: ({ children }) => (
						<h1 className="text-xl font-bold mb-4 mt-6 first:mt-0">
							{children}
						</h1>
					),
					h2: ({ children }) => (
						<h2 className="text-lg font-bold mb-3 mt-5 first:mt-0">
							{children}
						</h2>
					),
					h3: ({ children }) => (
						<h3 className="text-base font-bold mb-2 mt-4 first:mt-0">
							{children}
						</h3>
					),
					ul: ({ children }) => (
						<ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>
					),
					ol: ({ children }) => (
						<ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>
					),
					li: ({ children }) => <li className="leading-relaxed">{children}</li>,
					a: ({ children, href }) => (
						<a
							href={href}
							target="_blank"
							rel="noopener noreferrer"
							className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
						>
							{children}
						</a>
					),
					blockquote: ({ children }) => (
						<blockquote className="border-l-4 border-slate-200 dark:border-zinc-700 pl-4 italic my-4 text-muted-foreground">
							{children}
						</blockquote>
					),
					table: ({ children }) => (
						<div className="overflow-x-auto my-4 rounded-lg border dark:border-zinc-800">
							<table className="min-w-full divide-y divide-slate-200 dark:divide-zinc-800">
								{children}
							</table>
						</div>
					),
					thead: ({ children }) => (
						<thead className="bg-slate-50 dark:bg-zinc-800/50">
							{children}
						</thead>
					),
					th: ({ children }) => (
						<th className="px-4 py-2 text-left text-xs font-bold uppercase tracking-wider">
							{children}
						</th>
					),
					td: ({ children }) => (
						<td className="px-4 py-2 text-sm border-t dark:border-zinc-800">
							{children}
						</td>
					),
				}}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
}
