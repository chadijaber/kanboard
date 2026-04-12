import React from 'react';
import {Box, Text} from 'ink';
import {useKanboard} from '../../context/KanboardContext.js';
import {useNavigation} from '../../context/NavigationContext.js';

interface KeyBinding {
	key: string;
	label: string;
}

export function StatusBar() {
	const {currentView} = useKanboard();
	const {activeModal} = useNavigation();

	let bindings: KeyBinding[] = [];

	if (activeModal === 'confirm-delete') {
		bindings = [
			{key: 'y', label: 'Confirm'},
			{key: 'n/Esc', label: 'Cancel'},
		];
	} else if (activeModal === 'task-form' || activeModal === 'doc-form') {
		bindings = [
			{key: 'Tab', label: 'Next field'},
			{key: 'Enter', label: 'Submit'},
			{key: 'Esc', label: 'Cancel'},
		];
	} else if (activeModal === 'task-detail' || activeModal === 'doc-view') {
		bindings = [
			{key: 'e', label: 'Edit'},
			{key: 'Esc', label: 'Close'},
		];
	} else if (activeModal === 'help') {
		bindings = [{key: 'Esc/?', label: 'Close'}];
	} else if (currentView === 'board') {
		bindings = [
			{key: 'h/l', label: 'Columns'},
			{key: 'j/k', label: 'Tasks'},
			{key: 'Enter', label: 'Open'},
			{key: 'n', label: 'New'},
			{key: 'm', label: 'Move'},
			{key: 'd', label: 'Delete'},
			{key: 'Tab', label: 'Docs'},
			{key: '?', label: 'Help'},
			{key: 'q', label: 'Quit'},
		];
	} else {
		bindings = [
			{key: 'j/k', label: 'Navigate'},
			{key: 'Enter', label: 'Open/Expand'},
			{key: 'h', label: 'Collapse'},
			{key: 'n', label: 'New'},
			{key: 'd', label: 'Delete'},
			{key: 'Tab', label: 'Board'},
			{key: '?', label: 'Help'},
			{key: 'q', label: 'Quit'},
		];
	}

	return (
		<Box borderStyle="single" borderColor="gray" paddingX={1} marginTop={1}>
			{bindings.map((binding, index) => (
				<Box key={binding.key} marginRight={2}>
					<Text color="yellow">{binding.key}</Text>
					<Text dimColor>:{binding.label}</Text>
					{index < bindings.length - 1 && <Text dimColor> </Text>}
				</Box>
			))}
		</Box>
	);
}
