import React, {
	createContext,
	useContext,
	useState,
	useCallback,
	type ReactNode,
} from 'react';
import {TaskStatus, TASK_STATUS_ORDER} from '../types/index.js';

export type ModalType =
	| 'none'
	| 'task-form'
	| 'task-detail'
	| 'doc-form'
	| 'doc-view'
	| 'help'
	| 'confirm-delete'
	| 'command-input'
	| 'deadline-warning';

interface NavigationContextValue {
	// Board navigation
	selectedColumn: number;
	setSelectedColumn: (col: number) => void;
	selectedRow: number;
	setSelectedRow: (row: number) => void;

	// Modal state
	activeModal: ModalType;
	setActiveModal: (modal: ModalType) => void;

	// Helper functions
	getStatusForColumn: (col: number) => TaskStatus;
	getColumnForStatus: (status: TaskStatus) => number;
	moveColumnLeft: () => void;
	moveColumnRight: () => void;
	moveRowUp: () => void;
	moveRowDown: (maxRows: number) => void;

	// Docs navigation
	docsExpandedPaths: Set<string>;
	toggleDocExpanded: (path: string) => void;
	selectedDocIndex: number;
	setSelectedDocIndex: (idx: number) => void;

	// Editing state
	editingTaskId: string | null;
	setEditingTaskId: (id: string | null) => void;
	editingDocPath: string | null;
	setEditingDocPath: (path: string | null) => void;

	// Confirm dialog
	confirmAction: (() => void) | null;
	setConfirmAction: (action: (() => void) | null) => void;
	confirmMessage: string;
	setConfirmMessage: (msg: string) => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

interface NavigationProviderProps {
	children: ReactNode;
}

export function NavigationProvider({children}: NavigationProviderProps) {
	const [selectedColumn, setSelectedColumn] = useState(0);
	const [selectedRow, setSelectedRow] = useState(0);
	const [activeModal, setActiveModal] = useState<ModalType>('none');
	const [docsExpandedPaths, setDocsExpandedPaths] = useState<Set<string>>(
		new Set(),
	);
	const [selectedDocIndex, setSelectedDocIndex] = useState(0);
	const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
	const [editingDocPath, setEditingDocPath] = useState<string | null>(null);
	const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
	const [confirmMessage, setConfirmMessage] = useState('');

	const getStatusForColumn = useCallback((col: number): TaskStatus => {
		return TASK_STATUS_ORDER[col] ?? TaskStatus.BACKLOG;
	}, []);

	const getColumnForStatus = useCallback((status: TaskStatus): number => {
		return TASK_STATUS_ORDER.indexOf(status);
	}, []);

	const moveColumnLeft = useCallback(() => {
		setSelectedColumn(col => Math.max(0, col - 1));
		setSelectedRow(0);
	}, []);

	const moveColumnRight = useCallback(() => {
		setSelectedColumn(col => Math.min(TASK_STATUS_ORDER.length - 1, col + 1));
		setSelectedRow(0);
	}, []);

	const moveRowUp = useCallback(() => {
		setSelectedRow(row => Math.max(0, row - 1));
	}, []);

	const moveRowDown = useCallback((maxRows: number) => {
		setSelectedRow(row => Math.min(maxRows - 1, row + 1));
	}, []);

	const toggleDocExpanded = useCallback((path: string) => {
		setDocsExpandedPaths(prev => {
			const next = new Set(prev);
			if (next.has(path)) {
				next.delete(path);
			} else {
				next.add(path);
			}
			return next;
		});
	}, []);

	const value: NavigationContextValue = {
		selectedColumn,
		setSelectedColumn,
		selectedRow,
		setSelectedRow,
		activeModal,
		setActiveModal,
		getStatusForColumn,
		getColumnForStatus,
		moveColumnLeft,
		moveColumnRight,
		moveRowUp,
		moveRowDown,
		docsExpandedPaths,
		toggleDocExpanded,
		selectedDocIndex,
		setSelectedDocIndex,
		editingTaskId,
		setEditingTaskId,
		editingDocPath,
		setEditingDocPath,
		confirmAction,
		setConfirmAction,
		confirmMessage,
		setConfirmMessage,
	};

	return (
		<NavigationContext.Provider value={value}>
			{children}
		</NavigationContext.Provider>
	);
}

export function useNavigation(): NavigationContextValue {
	const context = useContext(NavigationContext);
	if (!context) {
		throw new Error('useNavigation must be used within a NavigationProvider');
	}
	return context;
}
