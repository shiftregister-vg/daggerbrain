<script lang="ts">
	import Bold from '@lucide/svelte/icons/bold';
	import Code from '@lucide/svelte/icons/code';
	import Heading2 from '@lucide/svelte/icons/heading-2';
	import Italic from '@lucide/svelte/icons/italic';
	import LinkIcon from '@lucide/svelte/icons/link';
	import List from '@lucide/svelte/icons/list';
	import ListOrdered from '@lucide/svelte/icons/list-ordered';
	import Quote from '@lucide/svelte/icons/quote';
	import Columns3 from '@lucide/svelte/icons/columns-3';
	import Rows3 from '@lucide/svelte/icons/rows-3';
	import TableIcon from '@lucide/svelte/icons/table';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import { Editor } from '@tiptap/core';
	import Link from '@tiptap/extension-link';
	import { Table } from '@tiptap/extension-table';
	import { TableCell } from '@tiptap/extension-table-cell';
	import { TableHeader } from '@tiptap/extension-table-header';
	import { TableRow } from '@tiptap/extension-table-row';
	import { Markdown } from '@tiptap/markdown';
	import StarterKit from '@tiptap/starter-kit';
	import { onDestroy, onMount, tick } from 'svelte';

	let {
		value = $bindable(''),
		placeholder = '',
		class: className = '',
		ariaLabel = '',
		onchangeValue
	}: {
		value?: string;
		placeholder?: string;
		class?: string;
		ariaLabel?: string;
		onchangeValue?: (value: string) => void;
	} = $props();

	let editorElement: HTMLDivElement;
	let editor = $state<Editor | null>(null);
	let toolbarVersion = $state(0);
	let lastMarkdown = '';
	let isApplyingExternalValue = false;

	const isInTable = $derived.by(() => {
		toolbarVersion;
		return Boolean(editor?.isActive('table'));
	});

	function syncValue(nextMarkdown: string) {
		lastMarkdown = nextMarkdown;
		value = nextMarkdown;
		onchangeValue?.(nextMarkdown);
	}

	function setEditorMarkdown(nextMarkdown: string) {
		if (!editor || nextMarkdown === lastMarkdown) return;
		isApplyingExternalValue = true;
		editor.commands.setContent(nextMarkdown || '', { contentType: 'markdown' });
		lastMarkdown = nextMarkdown;
		isApplyingExternalValue = false;
	}

	function buttonClass(active: boolean) {
		return active ? 'toolbar-button active' : 'toolbar-button';
	}

	function tableButtonDisabled() {
		return !isInTable;
	}

	function refreshToolbar() {
		toolbarVersion += 1;
	}

	function toggleLink() {
		if (!editor) return;
		const previousUrl = editor.getAttributes('link').href as string | undefined;
		const url = prompt('Link URL', previousUrl ?? '');
		if (url === null) return;
		if (url.trim() === '') {
			editor.chain().focus().unsetLink().run();
			return;
		}
		editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
	}

	onMount(() => {
		lastMarkdown = value ?? '';
		editor = new Editor({
			element: editorElement,
			extensions: [
				StarterKit,
				Link.configure({
					openOnClick: false,
					autolink: true,
					linkOnPaste: true
				}),
				Table.configure({
					resizable: true
				}),
				TableRow,
				TableHeader,
				TableCell,
				Markdown.configure({
					markedOptions: { gfm: true }
				})
			],
			content: lastMarkdown,
			contentType: 'markdown',
			editorProps: {
				attributes: {
					class: `markdown-editor-content ${className}`,
					'aria-label': ariaLabel || placeholder || 'Markdown editor'
				}
			},
			onUpdate: ({ editor: currentEditor }) => {
				refreshToolbar();
				if (isApplyingExternalValue) return;
				syncValue(currentEditor.getMarkdown());
			},
			onSelectionUpdate: refreshToolbar,
			onTransaction: refreshToolbar
		});
	});

	onDestroy(() => {
		editor?.destroy();
	});

	$effect(() => {
		const nextValue = value ?? '';
		tick().then(() => setEditorMarkdown(nextValue));
	});
</script>

<div class="markdown-editor">
	<div class="toolbar" aria-label="Formatting toolbar">
		<button
			type="button"
			class={buttonClass(Boolean(editor?.isActive('bold')))}
			title="Bold"
			aria-label="Bold"
			onclick={() => editor?.chain().focus().toggleBold().run()}
		>
			<Bold class="size-4" />
		</button>
		<button
			type="button"
			class={buttonClass(Boolean(editor?.isActive('italic')))}
			title="Italic"
			aria-label="Italic"
			onclick={() => editor?.chain().focus().toggleItalic().run()}
		>
			<Italic class="size-4" />
		</button>
		<button
			type="button"
			class={buttonClass(Boolean(editor?.isActive('code')))}
			title="Inline code"
			aria-label="Inline code"
			onclick={() => editor?.chain().focus().toggleCode().run()}
		>
			<Code class="size-4" />
		</button>
		<button
			type="button"
			class={buttonClass(Boolean(editor?.isActive('heading', { level: 2 })))}
			title="Heading"
			aria-label="Heading"
			onclick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
		>
			<Heading2 class="size-4" />
		</button>
		<button
			type="button"
			class={buttonClass(Boolean(editor?.isActive('bulletList')))}
			title="Bullet list"
			aria-label="Bullet list"
			onclick={() => editor?.chain().focus().toggleBulletList().run()}
		>
			<List class="size-4" />
		</button>
		<button
			type="button"
			class={buttonClass(Boolean(editor?.isActive('orderedList')))}
			title="Numbered list"
			aria-label="Numbered list"
			onclick={() => editor?.chain().focus().toggleOrderedList().run()}
		>
			<ListOrdered class="size-4" />
		</button>
		<button
			type="button"
			class={buttonClass(Boolean(editor?.isActive('blockquote')))}
			title="Quote"
			aria-label="Quote"
			onclick={() => editor?.chain().focus().toggleBlockquote().run()}
		>
			<Quote class="size-4" />
		</button>
		<button
			type="button"
			class={buttonClass(Boolean(editor?.isActive('link')))}
			title="Link"
			aria-label="Link"
			onclick={toggleLink}
		>
			<LinkIcon class="size-4" />
		</button>
		<div class="toolbar-divider"></div>
		<button
			type="button"
			class={buttonClass(isInTable)}
			title="Insert table"
			aria-label="Insert table"
			onclick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
		>
			<TableIcon class="size-4" />
		</button>
		<button
			type="button"
			class="toolbar-button"
			title="Add row"
			aria-label="Add row"
			disabled={tableButtonDisabled()}
			onclick={() => editor?.chain().focus().addRowAfter().run()}
		>
			<Rows3 class="size-4" />
			<span class="toolbar-action-mark">+</span>
		</button>
		<button
			type="button"
			class="toolbar-button"
			title="Delete row"
			aria-label="Delete row"
			disabled={tableButtonDisabled()}
			onclick={() => editor?.chain().focus().deleteRow().run()}
		>
			<Rows3 class="size-4" />
			<span class="toolbar-action-mark">-</span>
		</button>
		<button
			type="button"
			class="toolbar-button"
			title="Add column"
			aria-label="Add column"
			disabled={tableButtonDisabled()}
			onclick={() => editor?.chain().focus().addColumnAfter().run()}
		>
			<Columns3 class="size-4" />
			<span class="toolbar-action-mark">+</span>
		</button>
		<button
			type="button"
			class="toolbar-button"
			title="Delete column"
			aria-label="Delete column"
			disabled={tableButtonDisabled()}
			onclick={() => editor?.chain().focus().deleteColumn().run()}
		>
			<Columns3 class="size-4" />
			<span class="toolbar-action-mark">-</span>
		</button>
		<button
			type="button"
			class="toolbar-button"
			title="Delete table"
			aria-label="Delete table"
			disabled={tableButtonDisabled()}
			onclick={() => editor?.chain().focus().deleteTable().run()}
		>
			<Trash2 class="size-4" />
		</button>
	</div>
	<div class="editor-shell {className}">
		{#if !value && placeholder}
			<p class="placeholder">{placeholder}</p>
		{/if}
		<div bind:this={editorElement}></div>
	</div>
</div>

<style>
	.markdown-editor {
		display: grid;
		gap: 0;
		width: 100%;
		overflow: hidden;
		border-radius: 0.375rem;
		border: 1px solid #5a4b78;
		background: #16121f;
		box-shadow:
			inset 0 0 0 1px rgb(255 255 255 / 0.04),
			0 1px 0 rgb(255 255 255 / 0.03);
	}

	.markdown-editor:focus-within {
		border-color: #bca4ff;
		box-shadow:
			0 0 0 2px rgb(188 164 255 / 0.28),
			inset 0 0 0 1px rgb(255 255 255 / 0.06);
	}

	.toolbar {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		border-bottom: 1px solid #3d3151;
		background: #211a2c;
		padding: 0.375rem;
	}

	.toolbar-button {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: 0.25rem;
		color: hsl(var(--muted-foreground));
		transition:
			background-color 120ms ease,
			color 120ms ease;
	}

	.toolbar-button:hover,
	.toolbar-button.active {
		background: hsl(var(--primary) / 0.35);
		color: hsl(var(--foreground));
	}

	.toolbar-button:disabled {
		cursor: not-allowed;
		opacity: 0.35;
	}

	.toolbar-button:disabled:hover {
		background: transparent;
		color: hsl(var(--muted-foreground));
	}

	.toolbar-divider {
		width: 1px;
		align-self: stretch;
		background: #3d3151;
		margin: 0 0.125rem;
	}

	.toolbar-action-mark {
		position: absolute;
		right: 0.2rem;
		bottom: 0.05rem;
		font-size: 0.75rem;
		font-weight: 800;
		line-height: 1;
	}

	.editor-shell {
		position: relative;
		min-height: 7rem;
	}

	.editor-shell.question-input {
		min-height: 4.75rem;
	}

	.placeholder {
		pointer-events: none;
		position: absolute;
		top: 0.75rem;
		left: 0.75rem;
		color: hsl(var(--muted-foreground) / 0.75);
		font-size: 0.875rem;
	}

	:global(.markdown-editor-content) {
		min-height: 7rem;
		width: 100%;
		padding: 0.75rem;
		color: #f4f0ff;
		font-size: 0.875rem;
		line-height: 1.45;
		outline: none;
	}

	:global(.markdown-editor-content.question-input) {
		min-height: 4.75rem;
	}

	:global(.markdown-editor-content p) {
		margin: 0 0 0.75rem;
	}

	:global(.markdown-editor-content p:last-child) {
		margin-bottom: 0;
	}

	:global(.markdown-editor-content strong) {
		font-weight: 800;
	}

	:global(.markdown-editor-content em) {
		font-style: italic;
	}

	:global(.markdown-editor-content h2) {
		margin: 0 0 0.75rem;
		color: hsl(var(--foreground));
		font-size: 1.125rem;
		font-weight: 800;
	}

	:global(.markdown-editor-content ul),
	:global(.markdown-editor-content ol) {
		margin: 0 0 0.75rem 1.25rem;
		padding: 0;
	}

	:global(.markdown-editor-content ul) {
		list-style: disc;
	}

	:global(.markdown-editor-content ol) {
		list-style: decimal;
	}

	:global(.markdown-editor-content blockquote) {
		margin: 0 0 0.75rem;
		border-left: 3px solid hsl(var(--primary));
		padding-left: 0.75rem;
		color: hsl(var(--muted-foreground));
	}

	:global(.markdown-editor-content code) {
		border-radius: 0.25rem;
		background: hsl(var(--muted) / 0.6);
		padding: 0.1rem 0.25rem;
	}

	:global(.markdown-editor-content a) {
		color: hsl(var(--accent));
		text-decoration: underline;
	}

	:global(.markdown-editor-content table) {
		width: 100%;
		border-collapse: collapse;
		margin: 0 0 0.75rem;
		table-layout: fixed;
	}

	:global(.markdown-editor-content th),
	:global(.markdown-editor-content td) {
		position: relative;
		min-width: 1em;
		border: 1px solid #5a4b78;
		padding: 0.4rem 0.5rem;
		vertical-align: top;
	}

	:global(.markdown-editor-content th) {
		background: hsl(var(--primary) / 0.22);
		color: hsl(var(--foreground));
		font-weight: 700;
	}

	:global(.markdown-editor-content td) {
		background: rgb(255 255 255 / 0.03);
	}

	:global(.markdown-editor-content th p),
	:global(.markdown-editor-content td p) {
		margin: 0;
	}

	:global(.markdown-editor-content .selectedCell::after) {
		content: '';
		pointer-events: none;
		position: absolute;
		inset: 0;
		background: hsl(var(--primary) / 0.18);
	}

	:global(.markdown-editor-content .column-resize-handle) {
		pointer-events: none;
		position: absolute;
		top: 0;
		right: -2px;
		bottom: -2px;
		width: 4px;
		background: hsl(var(--accent));
	}

	:global(.markdown-editor-content.resize-cursor) {
		cursor: ew-resize;
	}
</style>
