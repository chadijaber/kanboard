import React from 'react';
import {Box, Text, useInput, useApp, useStdout} from 'ink';
import {KanboardProvider, useKanboard} from './context/KanboardContext.js';
import {
	NavigationProvider,
	useNavigation,
} from './context/NavigationContext.js';
import {Header} from './components/common/Header.js';
import {StatusBar} from './components/common/StatusBar.js';
import {ConfirmDialog} from './components/common/ConfirmDialog.js';
import {HelpOverlay} from './components/common/HelpOverlay.js';
import {BoardView} from './components/views/BoardView.js';
import {TaskDetailView} from './components/views/TaskDetailView.js';
import {TaskFormView} from './components/views/TaskFormView.js';
import {DocsView} from './components/views/DocsView.js';
import {DocViewView} from './components/views/DocViewView.js';
import {DocFormView} from './components/views/DocFormView.js';
import {CommandInputView} from './components/views/CommandInputView.js';
import type {ViewType} from './types/index.js';

function AppContent() {
	const {exit} = useApp();
	const {stdout} = useStdout();
	const {config, error, currentView, setCurrentView} = useKanboard();
	const {activeModal, setActiveModal} = useNavigation();

	const width = stdout?.columns ?? 80;

	useInput((input, key) => {
		// Don't handle global keys when in a modal
		if (activeModal !== 'none') return;

		if (input === 'q') {
			exit();
		}

		if (input === '?') {
			setActiveModal('help');
		}

		if (input === ':') {
			setActiveModal('command-input');
		}

		if (key.tab) {
			setCurrentView(currentView === 'board' ? 'docs' : 'board');
		}
	});

	if (error) {
		return (
			<Box flexDirection="column" padding={1}>
				<Text color="red">{error}</Text>
				<Text dimColor>Run "kanboard-cli init" to create a new project.</Text>
			</Box>
		);
	}

	if (!config) {
		return (
			<Box padding={1}>
				<Text>Loading...</Text>
			</Box>
		);
	}

	const renderModal = () => {
		switch (activeModal) {
			case 'task-detail':
				return <TaskDetailView />;
			case 'task-form':
				return <TaskFormView />;
			case 'doc-view':
				return <DocViewView />;
			case 'doc-form':
				return <DocFormView />;
			case 'help':
				return <HelpOverlay />;
			case 'confirm-delete':
				return <ConfirmDialog />;
			case 'command-input':
				return <CommandInputView />;
			default:
				return null;
		}
	};

	const renderView = () => {
		if (currentView === 'board') {
			return <BoardView width={width} />;
		}

		return <DocsView />;
	};

	// command-input overlays the board/docs without replacing it
	const isCommandInput = activeModal === 'command-input';
	const isOtherModal = activeModal !== 'none' && !isCommandInput;

	return (
		<Box flexDirection="column">
			<Header />
			{isOtherModal ? renderModal() : renderView()}
			{isCommandInput && <CommandInputView />}
			<StatusBar />
		</Box>
	);
}

interface AppProps {
	initialView?: ViewType | string;
}

export default function App({initialView = 'board'}: AppProps) {
	const view = (initialView === 'docs' ? 'docs' : 'board') as ViewType;

	return (
		<KanboardProvider initialView={view}>
			<NavigationProvider>
				<AppContent />
			</NavigationProvider>
		</KanboardProvider>
	);
}
