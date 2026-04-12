export enum TaskStatus {
	BACKLOG = 'backlog',
	TODO = 'todo',
	IN_PROGRESS = 'in_progress',
	REVIEW = 'review',
	DONE = 'done',
}

export const TASK_STATUS_ORDER: TaskStatus[] = [
	TaskStatus.BACKLOG,
	TaskStatus.TODO,
	TaskStatus.IN_PROGRESS,
	TaskStatus.REVIEW,
	TaskStatus.DONE,
];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
	[TaskStatus.BACKLOG]: 'Backlog',
	[TaskStatus.TODO]: 'Todo',
	[TaskStatus.IN_PROGRESS]: 'In Progress',
	[TaskStatus.REVIEW]: 'Review',
	[TaskStatus.DONE]: 'Done',
};

export interface Task {
	id: string;
	name: string;
	description: string;
	owner: string | null;
	requirements: string[];
	status: TaskStatus;
	createdAt: string;
	updatedAt: string;
	order: number;
}

export interface Doc {
	id: string;
	path: string;
	title: string;
	content: string;
	createdAt: string;
	updatedAt: string;
}

export interface Project {
	name: string;
	description: string;
	githubUrl: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface KanboardConfig {
	version: '1.0';
	project: Project;
	tasks: Task[];
	docs: Doc[];
}

export type ViewType = 'board' | 'docs';

export interface DocTreeNode {
	id: string;
	path: string;
	title: string;
	isDirectory: boolean;
	children: DocTreeNode[];
	doc?: Doc;
}
