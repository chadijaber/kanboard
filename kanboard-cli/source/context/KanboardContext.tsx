import React, {
	createContext,
	useContext,
	useState,
	useCallback,
	useEffect,
	type ReactNode,
} from 'react';
import type {
	KanboardConfig,
	Task,
	Doc,
	TaskStatus,
	ViewType,
} from '../types/index.js';
import {readConfig, writeConfig} from '../utils/config.js';
import {generateId} from '../utils/id.js';

interface KanboardContextValue {
	config: KanboardConfig | null;
	error: string | null;
	reload: () => void;

	// Members
	addMember: (name: string) => void;

	// Tasks
	addTask: (name: string, description?: string, status?: TaskStatus, owner?: string | null) => Task;
	updateTask: (
		id: string,
		updates: Partial<
			Pick<
				Task,
				'name' | 'description' | 'owner' | 'requirements' | 'status' | 'order'
			>
		>,
	) => void;
	deleteTask: (id: string) => void;
	moveTask: (id: string, status: TaskStatus) => void;

	// Docs
	addDoc: (path: string, title: string, content?: string) => Doc;
	updateDoc: (
		path: string,
		updates: Partial<Pick<Doc, 'title' | 'content'>>,
	) => void;
	deleteDoc: (path: string) => void;

	// Navigation
	currentView: ViewType;
	setCurrentView: (view: ViewType) => void;
	selectedTaskId: string | null;
	setSelectedTaskId: (id: string | null) => void;
	selectedDocPath: string | null;
	setSelectedDocPath: (path: string | null) => void;
}

const KanboardContext = createContext<KanboardContextValue | null>(null);

interface KanboardProviderProps {
	children: ReactNode;
	initialView?: ViewType;
}

export function KanboardProvider({
	children,
	initialView = 'board',
}: KanboardProviderProps) {
	const [config, setConfig] = useState<KanboardConfig | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [currentView, setCurrentView] = useState<ViewType>(initialView);
	const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
	const [selectedDocPath, setSelectedDocPath] = useState<string | null>(null);

	const reload = useCallback(() => {
		const loaded = readConfig();
		if (loaded) {
			setConfig(loaded);
			setError(null);
		} else {
			setError('No kanboard project found. Run "kanboard-cli init" first.');
		}
	}, []);

	useEffect(() => {
		reload();
	}, [reload]);

	const saveConfig = useCallback((newConfig: KanboardConfig) => {
		writeConfig(newConfig);
		setConfig(newConfig);
	}, []);

	const addMember = useCallback(
		(name: string) => {
			if (!config) return;
			const trimmed = name.trim();
			if (!trimmed || config.members.includes(trimmed)) return;
			saveConfig({...config, members: [...config.members, trimmed]});
		},
		[config, saveConfig],
	);

	const addTask = useCallback(
		(
			name: string,
			description = '',
			status: TaskStatus = 'backlog' as TaskStatus,
			owner: string | null = null,
		): Task => {
			if (!config) throw new Error('No config loaded');

			const now = new Date().toISOString();
			const tasksInStatus = config.tasks.filter(t => t.status === status);
			const maxOrder = tasksInStatus.reduce(
				(max, t) => Math.max(max, t.order),
				-1,
			);

			const task: Task = {
				id: generateId(),
				name,
				description,
				owner,
				requirements: [],
				status,
				createdAt: now,
				updatedAt: now,
				order: maxOrder + 1,
			};

			const newConfig = {
				...config,
				tasks: [...config.tasks, task],
			};
			saveConfig(newConfig);
			return task;
		},
		[config, saveConfig],
	);

	const updateTask = useCallback(
		(
			id: string,
			updates: Partial<
				Pick<
					Task,
					'name' | 'description' | 'owner' | 'requirements' | 'status' | 'order'
				>
			>,
		) => {
			if (!config) return;

			const newTasks = config.tasks.map(task => {
				if (task.id === id) {
					return {
						...task,
						...updates,
						updatedAt: new Date().toISOString(),
					};
				}
				return task;
			});

			saveConfig({...config, tasks: newTasks});
		},
		[config, saveConfig],
	);

	const deleteTask = useCallback(
		(id: string) => {
			if (!config) return;

			const newTasks = config.tasks.filter(task => task.id !== id);
			saveConfig({...config, tasks: newTasks});
		},
		[config, saveConfig],
	);

	const moveTask = useCallback(
		(id: string, status: TaskStatus) => {
			if (!config) return;

			const task = config.tasks.find(t => t.id === id);
			if (!task) return;

			const tasksInNewStatus = config.tasks.filter(
				t => t.status === status && t.id !== id,
			);
			const maxOrder = tasksInNewStatus.reduce(
				(max, t) => Math.max(max, t.order),
				-1,
			);

			const newTasks = config.tasks.map(t => {
				if (t.id === id) {
					return {
						...t,
						status,
						order: maxOrder + 1,
						updatedAt: new Date().toISOString(),
					};
				}
				return t;
			});

			saveConfig({...config, tasks: newTasks});
		},
		[config, saveConfig],
	);

	const addDoc = useCallback(
		(path: string, title: string, content = ''): Doc => {
			if (!config) throw new Error('No config loaded');

			const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
			const existing = config.docs.find(d => d.path === normalizedPath);
			if (existing) {
				throw new Error(`Doc already exists at path: ${normalizedPath}`);
			}

			const now = new Date().toISOString();
			const doc: Doc = {
				id: generateId(),
				path: normalizedPath,
				title,
				content,
				createdAt: now,
				updatedAt: now,
			};

			saveConfig({...config, docs: [...config.docs, doc]});
			return doc;
		},
		[config, saveConfig],
	);

	const updateDoc = useCallback(
		(path: string, updates: Partial<Pick<Doc, 'title' | 'content'>>) => {
			if (!config) return;

			const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
			const newDocs = config.docs.map(doc => {
				if (doc.path === normalizedPath) {
					return {
						...doc,
						...updates,
						updatedAt: new Date().toISOString(),
					};
				}
				return doc;
			});

			saveConfig({...config, docs: newDocs});
		},
		[config, saveConfig],
	);

	const deleteDoc = useCallback(
		(path: string) => {
			if (!config) return;

			const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
			const newDocs = config.docs.filter(doc => doc.path !== normalizedPath);
			saveConfig({...config, docs: newDocs});
		},
		[config, saveConfig],
	);

	const value: KanboardContextValue = {
		config,
		error,
		reload,
		addMember,
		addTask,
		updateTask,
		deleteTask,
		moveTask,
		addDoc,
		updateDoc,
		deleteDoc,
		currentView,
		setCurrentView,
		selectedTaskId,
		setSelectedTaskId,
		selectedDocPath,
		setSelectedDocPath,
	};

	return (
		<KanboardContext.Provider value={value}>
			{children}
		</KanboardContext.Provider>
	);
}

export function useKanboard(): KanboardContextValue {
	const context = useContext(KanboardContext);
	if (!context) {
		throw new Error('useKanboard must be used within a KanboardProvider');
	}
	return context;
}
