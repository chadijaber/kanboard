import React from 'react';
import {Box, Text} from 'ink';
import type {DocTreeNode as DocTreeNodeType} from '../../types/index.js';

interface DocTreeNodeProps {
	node: DocTreeNodeType;
	depth: number;
	isSelected: boolean;
	isExpanded: boolean;
}

export function DocTreeNode({
	node,
	depth,
	isSelected,
	isExpanded,
}: DocTreeNodeProps) {
	const indent = '  '.repeat(depth);
	const icon = node.isDirectory
		? isExpanded
			? '\u{1F4C2}'
			: '\u{1F4C1}'
		: '\u{1F4C4}';

	return (
		<Box>
			<Text color={isSelected ? 'cyan' : undefined} bold={isSelected}>
				{indent}
				{icon} {node.title}
			</Text>
			{isSelected && <Text color="cyan"> \u25C0</Text>}
		</Box>
	);
}
