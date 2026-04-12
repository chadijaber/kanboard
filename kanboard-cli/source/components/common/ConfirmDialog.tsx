import React from 'react';
import {Box, Text, useInput} from 'ink';
import {useNavigation} from '../../context/NavigationContext.js';

export function ConfirmDialog() {
	const {
		activeModal,
		setActiveModal,
		confirmMessage,
		confirmAction,
		setConfirmAction,
	} = useNavigation();

	useInput((input, key) => {
		if (activeModal !== 'confirm-delete') return;

		if (input === 'y' || input === 'Y') {
			if (confirmAction) {
				confirmAction();
			}
			setActiveModal('none');
			setConfirmAction(null);
		} else if (input === 'n' || input === 'N' || key.escape) {
			setActiveModal('none');
			setConfirmAction(null);
		}
	});

	if (activeModal !== 'confirm-delete') {
		return null;
	}

	return (
		<Box
			flexDirection="column"
			borderStyle="round"
			borderColor="red"
			padding={1}
			marginY={1}
		>
			<Text color="red" bold>
				Confirm Delete
			</Text>
			<Text>{confirmMessage}</Text>
			<Box marginTop={1}>
				<Text color="green">[y]</Text>
				<Text> Yes </Text>
				<Text color="red">[n]</Text>
				<Text> No</Text>
			</Box>
		</Box>
	);
}
