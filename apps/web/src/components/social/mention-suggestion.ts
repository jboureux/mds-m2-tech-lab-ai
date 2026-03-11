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
		let component: ReactRenderer<any>;
		let popup: Instance[];

		return {
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
					// Ensure no interference from default tippy themes
					offset: [0, 8],
				});
			},

			onUpdate(props: any) {
				component.updateProps(props);

				if (!props.clientRect || !popup?.[0]) {
					return;
				}

				popup[0].setProps({
					getReferenceClientRect: props.clientRect,
				});
			},

			onKeyDown(props: any) {
				if (props.event.key === "Escape") {
					popup?.[0]?.hide();

					return true;
				}

				return (component.ref as any)?.onKeyDown(props);
			},

			onExit() {
				popup?.[0]?.destroy();
				component.destroy();
			},
		};
	},
};
