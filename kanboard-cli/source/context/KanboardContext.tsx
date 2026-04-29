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
	ChecklistItem,
	Sprint,
	SprintStatus,
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
	addTask: (
		name: string,
		description?: string,
		status?: TaskStatus,
		owner?: string | null,
		deadline?: string | null,
		checklist?: ChecklistItem[],
		requirements?: string[],
		sprintId?: string | null,
	) => Task;
	updateTask: (
		id: string,
		updates: Partial<
			Pick<
				Task,
				| 'name'
				| 'description'
				| 'owner'
				| 'requirements'
				| 'checklist'
				| 'deadline'
				| 'status'
				| 'order'
				| 'sprintId'
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

	// Sprints
	addSprint: (
		name: string,
		description?: string,
		startDate?: string | null,
		endDate?: string | null,
		milestones?: ChecklistItem[],
		status?: SprintStatus,
	) => Sprint;
	updateSprint: (
		id: string,
		updates: Partial<
			Pick<
				Sprint,
				| 'name'
				| 'description'
				| 'startDate'
				| 'endDate'
				| 'milestones'
				| 'status'
			>
		>,
	) => void;
	deleteSprint: (id: string) => void;
	setActiveSprint: (id: string | null) => void;
	assignTaskToSprint: (taskId: string, sprintId: string | null) => void;

	// Navigation
	currentView: ViewType;
	setCurrentView: (view: ViewType) => void;
	selectedTaskId: string | null;
	setSelectedTaskId: (id: string | null) => void;
	selectedDocPath: string | null;
	setSelectedDocPath: (path: string | null) => void;
	selectedSprintId: string | null;
	setSelectedSprintId: (id: string | null) => void;
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
	const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);

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

	const addMember = useCallback((name: string) => {
		const trimmed = name.trim();
		if (!trimmed) return;

		setConfig(prev => {
			if (!prev || prev.members.includes(trimmed)) return prev;
			const next = {...prev, members: [...prev.members, trimmed]};
			writeConfig(next);
			return next;
		});
	}, []);

	const addTask = useCallback(
		(
			name: string,
			description = '',
			status: TaskStatus = 'backlog' as TaskStatus,
			owner: string | null = null,
			deadline: string | null = null,
			checklist: ChecklistItem[] = [],
			requirements: string[] = [],
			sprintId: string | null = null,
		): Task => {
			const id = generateId();
			const now = new Date().toISOString();
			let createdTask: Task;

			setConfig(prev => {
				if (!prev) throw new Error('No config loaded');

				// Apply invariants:
				// - sprintId === null → status forced to 'backlog'
				// - sprintId !== null → if caller passed 'backlog', upgrade to 'todo'
				let resolvedStatus: TaskStatus = status;
				if (sprintId === null) {
					resolvedStatus = 'backlog' as TaskStatus;
				} else if (status === ('backlog' as TaskStatus)) {
					resolvedStatus = 'todo' as TaskStatus;
				}

				const tasksInStatus = prev.tasks.filter(
					t => t.status === resolvedStatus,
				);
				const maxOrder = tasksInStatus.reduce(
					(max, t) => Math.max(max, t.order),
					-1,
				);

				createdTask = {
					id,
					name,
					description,
					owner,
					requirements,
					checklist,
					deadline,
					status: resolvedStatus,
					sprintId,
					createdAt: now,
					updatedAt: now,
					order: maxOrder + 1,
				};

				const next = {
					...prev,
					tasks: [...prev.tasks, createdTask],
				};
				writeConfig(next);
				return next;
			});

			return createdTask!;
		},
		[],
	);

	const updateTask = useCallback(
		(
			id: string,
			updates: Partial<
				Pick<
					Task,
					| 'name'
					| 'description'
					| 'owner'
					| 'requirements'
					| 'checklist'
					| 'deadline'
					| 'status'
					| 'order'
					| 'sprintId'
				>
			>,
		) => {
			setConfig(prev => {
				if (!prev) return prev;

				const newTasks = prev.tasks.map(task => {
					if (task.id !== id) return task;
					const merged: Task = {
						...task,
						...updates,
						updatedAt: new Date().toISOString(),
					};
					// Enforce invariant after the merge.
					if (merged.sprintId === null) {
						merged.status = 'backlog' as TaskStatus;
					} else if (merged.status === ('backlog' as TaskStatus)) {
						merged.status = 'todo' as TaskStatus;
					}
					return merged;
				});

				const next = {...prev, tasks: newTasks};
				writeConfig(next);
				return next;
			});
		},
		[],
	);

	const deleteTask = useCallback((id: string) => {
		setConfig(prev => {
			if (!prev) return prev;
			const newTasks = prev.tasks.filter(task => task.id !== id);
			const next = {...prev, tasks: newTasks};
			writeConfig(next);
			return next;
		});
	}, []);

	const moveTask = useCallback((id: string, status: TaskStatus) => {
		setConfig(prev => {
			if (!prev) return prev;

			const task = prev.tasks.find(t => t.id === id);
			if (!task) return prev;

			// Enforce sprint invariant on move.
			let nextSprintId: string | null = task.sprintId;
			if (status === 'backlog') {
				nextSprintId = null;
			} else if (!nextSprintId) {
				if (!prev.activeSprintId) {
					// No sprint to assign to; refuse the move silently.
					return prev;
				}
				nextSprintId = prev.activeSprintId;
			}

			const tasksInNewStatus = prev.tasks.filter(
				t => t.status === status && t.id !== id,
			);
			const maxOrder = tasksInNewStatus.reduce(
				(max, t) => Math.max(max, t.order),
				-1,
			);

			const updates: Partial<Task> = {
				status,
				sprintId: nextSprintId,
				order: maxOrder + 1,
				updatedAt: new Date().toISOString(),
			};

			// When moving to Done, replace deadline with completion date
			if (status === 'done') {
				updates.deadline = new Date().toISOString();
			}

			const newTasks = prev.tasks.map(t => {
				if (t.id === id) {
					return {
						...t,
						...updates,
					};
				}
				return t;
			});

			const next = {...prev, tasks: newTasks};
			writeConfig(next);
			return next;
		});
	}, []);

	const addDoc = useCallback(
		(path: string, title: string, content = ''): Doc => {
			const id = generateId();
			const now = new Date().toISOString();
			const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
			let createdDoc: Doc;

			setConfig(prev => {
				if (!prev) throw new Error('No config loaded');

				const existing = prev.docs.find(d => d.path === normalizedPath);
				if (existing) {
					throw new Error(`Doc already exists at path: ${normalizedPath}`);
				}

				createdDoc = {
					id,
					path: normalizedPath,
					title,
					content,
					createdAt: now,
					updatedAt: now,
				};

				const next = {...prev, docs: [...prev.docs, createdDoc]};
				writeConfig(next);
				return next;
			});

			return createdDoc!;
		},
		[],
	);

	const updateDoc = useCallback(
		(path: string, updates: Partial<Pick<Doc, 'title' | 'content'>>) => {
			const normalizedPath = path.startsWith('/') ? path.slice(1) : path;

			setConfig(prev => {
				if (!prev) return prev;

				const newDocs = prev.docs.map(doc => {
					if (doc.path === normalizedPath) {
						return {
							...doc,
							...updates,
							updatedAt: new Date().toISOString(),
						};
					}
					return doc;
				});

				const next = {...prev, docs: newDocs};
				writeConfig(next);
				return next;
			});
		},
		[],
	);

	const deleteDoc = useCallback((path: string) => {
		const normalizedPath = path.startsWith('/') ? path.slice(1) : path;

		setConfig(prev => {
			if (!prev) return prev;
			const newDocs = prev.docs.filter(doc => doc.path !== normalizedPath);
			const next = {...prev, docs: newDocs};
			writeConfig(next);
			return next;
		});
	}, []);

	const addSprint = useCallback(
		(
			name: string,
			description = '',
			startDate: string | null = null,
			endDate: string | null = null,
			milestones: ChecklistItem[] = [],
			status: SprintStatus = 'planning',
		): Sprint => {
			const id = generateId();
			const now = new Date().toISOString();
			let createdSprint: Sprint;

			setConfig(prev => {
				if (!prev) throw new Error('No config loaded');

				createdSprint = {
					id,
					name,
					description,
					startDate,
					endDate,
					milestones,
					status,
					createdAt: now,
					updatedAt: now,
				};

				const next = {
					...prev,
					sprints: [...prev.sprints, createdSprint],
				};
				writeConfig(next);
				return next;
			});

			return createdSprint!;
		},
		[],
	);

	const updateSprint = useCallback(
		(
			id: string,
			updates: Partial<
				Pick<
					Sprint,
					| 'name'
					| 'description'
					| 'startDate'
					| 'endDate'
					| 'milestones'
					| 'status'
				>
			>,
		) => {
			setConfig(prev => {
				if (!prev) return prev;
				const newSprints = prev.sprints.map(sprint => {
					if (sprint.id !== id) return sprint;
					return {
						...sprint,
						...updates,
						updatedAt: new Date().toISOString(),
					};
				});
				const next = {...prev, sprints: newSprints};
				writeConfig(next);
				return next;
			});
		},
		[],
	);

	const deleteSprint = useCallback((id: string) => {
		setConfig(prev => {
			if (!prev) return prev;
			const now = new Date().toISOString();
			// Move tasks of this sprint back to backlog.
			const newTasks = prev.tasks.map(task => {
				if (task.sprintId !== id) return task;
				return {
					...task,
					sprintId: null,
					status: 'backlog' as TaskStatus,
					updatedAt: now,
				};
			});
			const next = {
				...prev,
				sprints: prev.sprints.filter(s => s.id !== id),
				tasks: newTasks,
				activeSprintId: prev.activeSprintId === id ? null : prev.activeSprintId,
			};
			writeConfig(next);
			return next;
		});
	}, []);

	const setActiveSprint = useCallback((id: string | null) => {
		setConfig(prev => {
			if (!prev) return prev;
			let sprints = prev.sprints;
			if (id !== null) {
				const sprint = prev.sprints.find(s => s.id === id);
				if (!sprint) return prev;
				if (sprint.status === 'planning') {
					sprints = prev.sprints.map(s =>
						s.id === id
							? {
									...s,
									status: 'active' as SprintStatus,
									updatedAt: new Date().toISOString(),
							  }
							: s,
					);
				}
			}
			const next = {...prev, sprints, activeSprintId: id};
			writeConfig(next);
			return next;
		});
	}, []);

	const assignTaskToSprint = useCallback(
		(taskId: string, sprintId: string | null) => {
			setConfig(prev => {
				if (!prev) return prev;
				if (sprintId !== null) {
					const exists = prev.sprints.some(s => s.id === sprintId);
					if (!exists) return prev;
				}
				const now = new Date().toISOString();
				const newTasks = prev.tasks.map(task => {
					if (task.id !== taskId) return task;
					const next: Task = {
						...task,
						sprintId,
						updatedAt: now,
					};
					if (sprintId === null) {
						next.status = 'backlog' as TaskStatus;
					} else if (task.status === ('backlog' as TaskStatus)) {
						next.status = 'todo' as TaskStatus;
					}
					return next;
				});
				const nextConfig = {...prev, tasks: newTasks};
				writeConfig(nextConfig);
				return nextConfig;
			});
		},
		[],
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
		addSprint,
		updateSprint,
		deleteSprint,
		setActiveSprint,
		assignTaskToSprint,
		currentView,
		setCurrentView,
		selectedTaskId,
		setSelectedTaskId,
		selectedDocPath,
		setSelectedDocPath,
		selectedSprintId,
		setSelectedSprintId,
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
