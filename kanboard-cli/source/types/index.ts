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

export interface ChecklistItem {
	id: string;
	text: string;
	completed: boolean;
}

export type TagColor = 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan';
export const TAG_COLOR_PALETTE: TagColor[] = [
	'cyan',
	'green',
	'yellow',
	'magenta',
	'red',
	'blue',
];

export interface Tag {
	id: string;
	name: string;
	color: TagColor;
}

export interface Task {
	id: string;
	name: string;
	description: string;
	owner: string | null;
	tagIds: string[];
	requirements: string[];
	checklist: ChecklistItem[];
	deadline: string | null;
	status: TaskStatus;
	sprintId: string | null;
	createdAt: string;
	updatedAt: string;
	order: number;
}

export type SprintStatus = 'planning' | 'active' | 'completed';

export const SPRINT_STATUS_LABELS: Record<SprintStatus, string> = {
	planning: 'Planning',
	active: 'Active',
	completed: 'Completed',
};

export interface Sprint {
	id: string;
	name: string;
	description: string;
	startDate: string | null;
	endDate: string | null;
	milestones: ChecklistItem[];
	status: SprintStatus;
	createdAt: string;
	updatedAt: string;
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
	members: string[];
	tags: Tag[];
	tasks: Task[];
	docs: Doc[];
	sprints: Sprint[];
	activeSprintId: string | null;
}

export type ViewType = 'board' | 'docs' | 'sprints' | 'sprint-detail';

export interface DocTreeNode {
	id: string;
	path: string;
	title: string;
	isDirectory: boolean;
	children: DocTreeNode[];
	doc?: Doc;
}
