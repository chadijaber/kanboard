import type {Doc, KanboardConfig, DocTreeNode} from '../types/index.js';
import {generateId} from './id.js';
import {readConfig, writeConfig} from './config.js';

export interface CreateDocInput {
	path: string;
	title: string;
	content?: string;
}

export function createDoc(input: CreateDocInput): Doc {
	const config = readConfig();
	if (!config) {
		throw new Error('No kanboard project found. Run "kanboard init" first.');
	}

	// Normalize path
	const normalizedPath = input.path.startsWith('/')
		? input.path.slice(1)
		: input.path;

	// Check if path already exists
	const existing = config.docs.find(d => d.path === normalizedPath);
	if (existing) {
		throw new Error(`Doc already exists at path: ${normalizedPath}`);
	}

	const now = new Date().toISOString();

	const doc: Doc = {
		id: generateId(),
		path: normalizedPath,
		title: input.title,
		content: input.content ?? '',
		createdAt: now,
		updatedAt: now,
	};

	config.docs.push(doc);
	writeConfig(config);

	return doc;
}

export interface UpdateDocInput {
	title?: string;
	content?: string;
}

export function updateDoc(path: string, input: UpdateDocInput): Doc {
	const config = readConfig();
	if (!config) {
		throw new Error('No kanboard project found. Run "kanboard init" first.');
	}

	const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
	const docIndex = config.docs.findIndex(
		d => d.path === normalizedPath || d.path.startsWith(normalizedPath),
	);
	if (docIndex === -1) {
		throw new Error(`Doc not found: ${path}`);
	}

	const doc = config.docs[docIndex]!;
	const now = new Date().toISOString();

	if (input.title !== undefined) doc.title = input.title;
	if (input.content !== undefined) doc.content = input.content;
	doc.updatedAt = now;

	writeConfig(config);
	return doc;
}

export function deleteDoc(path: string): Doc {
	const config = readConfig();
	if (!config) {
		throw new Error('No kanboard project found. Run "kanboard init" first.');
	}

	const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
	const docIndex = config.docs.findIndex(d => d.path === normalizedPath);
	if (docIndex === -1) {
		throw new Error(`Doc not found: ${path}`);
	}

	const doc = config.docs[docIndex]!;
	config.docs.splice(docIndex, 1);
	writeConfig(config);

	return doc;
}

export function getDoc(path: string): Doc | null {
	const config = readConfig();
	if (!config) {
		return null;
	}

	const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
	return config.docs.find(d => d.path === normalizedPath) ?? null;
}

export function listDocs(config: KanboardConfig): Doc[] {
	return [...config.docs].sort((a, b) => a.path.localeCompare(b.path));
}

export function buildDocTree(docs: Doc[]): DocTreeNode[] {
	const root: DocTreeNode[] = [];
	const nodeMap = new Map<string, DocTreeNode>();

	// Sort docs by path to ensure parents are processed before children
	const sortedDocs = [...docs].sort((a, b) => a.path.localeCompare(b.path));

	for (const doc of sortedDocs) {
		const parts = doc.path.split('/');
		let currentPath = '';
		let currentLevel = root;

		for (let i = 0; i < parts.length; i++) {
			const part = parts[i]!;
			const isLast = i === parts.length - 1;
			currentPath = currentPath ? `${currentPath}/${part}` : part;

			let node = nodeMap.get(currentPath);

			if (!node) {
				node = {
					id: isLast ? doc.id : currentPath,
					path: currentPath,
					title: isLast ? doc.title : part,
					isDirectory: !isLast,
					children: [],
					doc: isLast ? doc : undefined,
				};
				nodeMap.set(currentPath, node);
				currentLevel.push(node);
			}

			if (isLast) {
				node.doc = doc;
				node.title = doc.title;
				node.isDirectory = false;
			}

			currentLevel = node.children;
		}
	}

	return root;
}

export function flattenDocTree(
	nodes: DocTreeNode[],
	depth = 0,
): Array<{node: DocTreeNode; depth: number}> {
	const result: Array<{node: DocTreeNode; depth: number}> = [];

	for (const node of nodes) {
		result.push({node, depth});
		if (node.children.length > 0) {
			result.push(...flattenDocTree(node.children, depth + 1));
		}
	}

	return result;
}
