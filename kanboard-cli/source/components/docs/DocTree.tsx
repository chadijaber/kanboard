import React from 'react';
import {Box} from 'ink';
import type {DocTreeNode as DocTreeNodeType} from '../../types/index.js';
import {DocTreeNode} from './DocTreeNode.js';

interface FlatNode {
	node: DocTreeNodeType;
	depth: number;
}

interface DocTreeProps {
	nodes: DocTreeNodeType[];
	expandedPaths: Set<string>;
	selectedIndex: number;
	flatList: FlatNode[];
}

export function DocTree({flatList, selectedIndex}: DocTreeProps) {
	return (
		<Box flexDirection="column">
			{flatList.map(({node, depth}, index) => (
				<DocTreeNode
					key={node.path}
					node={node}
					depth={depth}
					isSelected={index === selectedIndex}
					isExpanded={true}
				/>
			))}
		</Box>
	);
}

export function flattenTree(
	nodes: DocTreeNodeType[],
	expandedPaths: Set<string>,
	depth = 0,
): FlatNode[] {
	const result: FlatNode[] = [];

	for (const node of nodes) {
		result.push({node, depth});

		if (
			node.isDirectory &&
			expandedPaths.has(node.path) &&
			node.children.length > 0
		) {
			result.push(...flattenTree(node.children, expandedPaths, depth + 1));
		}
	}

	return result;
}
