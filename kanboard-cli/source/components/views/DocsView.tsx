import React, {useMemo} from 'react';
import {Box, Text, useInput} from 'ink';
import {useKanboard} from '../../context/KanboardContext.js';
import {useNavigation} from '../../context/NavigationContext.js';
import {buildDocTree} from '../../utils/docs.js';
import {DocTree, flattenTree} from '../docs/DocTree.js';

export function DocsView() {
	const {config, deleteDoc, setSelectedDocPath} = useKanboard();
	const {
		docsExpandedPaths,
		toggleDocExpanded,
		selectedDocIndex,
		setSelectedDocIndex,
		setActiveModal,
		setEditingDocPath,
		setConfirmAction,
		setConfirmMessage,
	} = useNavigation();

	const tree = useMemo(() => {
		if (!config) return [];
		return buildDocTree(config.docs);
	}, [config]);

	const flatList = useMemo(() => {
		return flattenTree(tree, docsExpandedPaths);
	}, [tree, docsExpandedPaths]);

	const selectedNode = flatList[selectedDocIndex]?.node;

	useInput((input, key) => {
		if (!config) return;

		// Navigation
		if (input === 'j' || key.downArrow) {
			setSelectedDocIndex(Math.min(flatList.length - 1, selectedDocIndex + 1));
		} else if (input === 'k' || key.upArrow) {
			setSelectedDocIndex(Math.max(0, selectedDocIndex - 1));
		}

		// Expand/collapse
		if (input === 'h' && selectedNode?.isDirectory) {
			if (docsExpandedPaths.has(selectedNode.path)) {
				toggleDocExpanded(selectedNode.path);
			}
		}

		if (key.return && selectedNode) {
			if (selectedNode.isDirectory) {
				toggleDocExpanded(selectedNode.path);
			} else {
				setSelectedDocPath(selectedNode.path);
				setActiveModal('doc-view');
			}
		}

		// Actions
		if (input === 'n') {
			setEditingDocPath(null);
			setActiveModal('doc-form');
		}

		if (input === 'e' && selectedNode && !selectedNode.isDirectory) {
			setEditingDocPath(selectedNode.path);
			setActiveModal('doc-form');
		}

		if (input === 'd' && selectedNode && !selectedNode.isDirectory) {
			setConfirmMessage(`Delete doc "${selectedNode.title}"?`);
			setConfirmAction(() => () => {
				deleteDoc(selectedNode.path);
				if (selectedDocIndex >= flatList.length - 1) {
					setSelectedDocIndex(Math.max(0, selectedDocIndex - 1));
				}
			});
			setActiveModal('confirm-delete');
		}
	});

	if (!config) {
		return <Text color="red">No config loaded</Text>;
	}

	if (config.docs.length === 0) {
		return (
			<Box flexDirection="column" padding={1}>
				<Text dimColor>No docs yet. Press </Text>
				<Text color="yellow">n</Text>
				<Text dimColor> to create one.</Text>
			</Box>
		);
	}

	return (
		<Box
			flexDirection="column"
			borderStyle="single"
			borderColor="gray"
			padding={1}
		>
			<Box marginBottom={1}>
				<Text bold>Documents</Text>
			</Box>
			<DocTree
				nodes={tree}
				expandedPaths={docsExpandedPaths}
				selectedIndex={selectedDocIndex}
				flatList={flatList}
			/>
		</Box>
	);
}
