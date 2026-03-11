import { ReactRenderer } from "@tiptap/react";
import tippy, { type Instance } from "tippy.js";
import { MentionList } from "./mention-list";

export const suggestion = {
	items: async ({ query }: { query: string }) => {
		const response = await fetch(`/api/users/search?q=${query}`);
		if (!response.ok) {
			return [];
		}
		const data = await response.json();
		return data;
	},

	render: () => {
		// biome-ignore lint/suspicious/noExplicitAny: Required by tiptap ReactRenderer
		let component: ReactRenderer<any>;
		let popup: Instance[];

		return {
			// biome-ignore lint/suspicious/noExplicitAny: Required by tiptap
			onStart: (props: any) => {
				component = new ReactRenderer(MentionList, {
					props,
					editor: props.editor,
				});

				if (!props.clientRect) {
					return;
				}

				popup = tippy("body", {
					getReferenceClientRect: props.clientRect,
					appendTo: () => document.body,
					content: component.element,
					showOnCreate: true,
					interactive: true,
					trigger: "manual",
					placement: "bottom-start",
					maxWidth: "none",
					role: "listbox",
					// Completely disable default tippy styling
					arrow: false,
					interactiveBorder: 0,
					offset: [0, 4],
					theme: "none", // Use a non-existent theme to avoid default styles
				});
			},

			// biome-ignore lint/suspicious/noExplicitAny: Required by tiptap
			onUpdate(props: any) {
				component.updateProps(props);

				if (!props.clientRect || !popup?.[0]) {
					return;
				}

				popup[0].setProps({
					getReferenceClientRect: props.clientRect,
				});
			},

			// biome-ignore lint/suspicious/noExplicitAny: Required by tiptap
			onKeyDown(props: any) {
				if (props.event.key === "Escape") {
					popup?.[0]?.hide();

					return true;
				}

				// biome-ignore lint/suspicious/noExplicitAny: Required by tiptap
				return (component.ref as any)?.onKeyDown(props);
			},

			onExit() {
				popup?.[0]?.destroy();
				component.destroy();
			},
		};
	},
};
