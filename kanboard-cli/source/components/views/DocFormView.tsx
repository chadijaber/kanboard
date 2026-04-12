import React, {useState, useEffect, useRef} from 'react';
import {Box, Text, useInput} from 'ink';
import {useKanboard} from '../../context/KanboardContext.js';
import {useNavigation} from '../../context/NavigationContext.js';

type FormField = 'path' | 'title' | 'content';

const FIELDS: FormField[] = ['path', 'title', 'content'];

export function DocFormView() {
	const {config, addDoc, updateDoc} = useKanboard();
	const {setActiveModal, editingDocPath} = useNavigation();

	const existingDoc = editingDocPath
		? config?.docs.find(d => d.path === editingDocPath)
		: null;
	const isEditing = !!existingDoc;

	const pathRef = useRef(existingDoc?.path ?? '');
	const titleRef = useRef(existingDoc?.title ?? '');
	const contentRef = useRef(existingDoc?.content ?? '');
	const [activeField, setActiveField] = useState<FormField>(
		isEditing ? 'title' : 'path',
	);
	const [error, setError] = useState<string | null>(null);
	const [, forceUpdate] = useState({});

	useEffect(() => {
		if (existingDoc) {
			pathRef.current = existingDoc.path;
			titleRef.current = existingDoc.title;
			contentRef.current = existingDoc.content;
		}
	}, [existingDoc]);

	const moveToNextField = () => {
		const currentIndex = FIELDS.indexOf(activeField);
		if (currentIndex < FIELDS.length - 1) {
			setActiveField(FIELDS[currentIndex + 1]!);
		}
	};

	const moveToPrevField = () => {
		const currentIndex = FIELDS.indexOf(activeField);
		if (currentIndex > 0) {
			setActiveField(FIELDS[currentIndex - 1]!);
		}
	};

	const handleSubmit = () => {
		if (!pathRef.current.trim()) {
			setError('Path is required');
			setActiveField('path');
			return;
		}

		if (!titleRef.current.trim()) {
			setError('Title is required');
			setActiveField('title');
			return;
		}

		try {
			if (isEditing && editingDocPath) {
				updateDoc(editingDocPath, {
					title: titleRef.current.trim(),
					content: contentRef.current.trim(),
				});
			} else {
				addDoc(
					pathRef.current.trim(),
					titleRef.current.trim(),
					contentRef.current.trim(),
				);
			}
			setActiveModal('none');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Unknown error');
		}
	};

	useInput((_, key) => {
		if (key.escape) {
			setActiveModal('none');
			return;
		}

		if (key.tab) {
			if (key.shift) {
				moveToPrevField();
			} else {
				moveToNextField();
			}
			return;
		}

		// Submit on Ctrl+Enter
		if (key.ctrl && key.return) {
			handleSubmit();
		}
	});

	const renderTextField = (
		field: FormField,
		label: string,
		ref: React.MutableRefObject<string>,
		defaultValue: string,
		disabled = false,
	) => {
		const isActive = activeField === field;
		return (
			<Box key={field}>
				<Box width={10}>
					<Text color={isActive ? 'cyan' : undefined}>{label}:</Text>
				</Box>
				{isActive && !disabled ? (
					<Box>
						<Text color="cyan">\u25B6 </Text>
						<TextInputSimple
							defaultValue={defaultValue}
							onChange={v => {
								ref.current = v;
								forceUpdate({});
							}}
							onSubmit={() => {
								if (field === 'content') {
									handleSubmit();
								} else {
									moveToNextField();
								}
							}}
						/>
					</Box>
				) : (
					<Text dimColor={!ref.current || disabled}>
						{ref.current || '(empty)'}
					</Text>
				)}
			</Box>
		);
	};

	return (
		<Box
			flexDirection="column"
			borderStyle="round"
			borderColor="cyan"
			padding={1}
			marginY={1}
		>
			<Text bold color="cyan">
				{isEditing ? 'Edit Doc' : 'New Doc'}
			</Text>
			{error && (
				<Box marginY={1}>
					<Text color="red">{error}</Text>
				</Box>
			)}
			<Box flexDirection="column" marginTop={1} gap={1}>
				{renderTextField(
					'path',
					'Path',
					pathRef,
					existingDoc?.path ?? '',
					isEditing,
				)}
				{renderTextField('title', 'Title', titleRef, existingDoc?.title ?? '')}
				{renderTextField(
					'content',
					'Content',
					contentRef,
					existingDoc?.content ?? '',
				)}
			</Box>

			<Box marginTop={1}>
				<Text dimColor>Tab: next field | Enter: submit | Esc: cancel</Text>
			</Box>
		</Box>
	);
}

// Simple inline text input component using ink's useInput
function TextInputSimple({
	defaultValue,
	onChange,
	onSubmit,
}: {
	defaultValue: string;
	onChange: (v: string) => void;
	onSubmit: () => void;
}) {
	const [value, setValue] = useState(defaultValue);

	useInput((input, key) => {
		if (key.return) {
			onSubmit();
			return;
		}

		if (key.backspace || key.delete) {
			const newValue = value.slice(0, -1);
			setValue(newValue);
			onChange(newValue);
			return;
		}

		if (input && !key.ctrl && !key.meta) {
			const newValue = value + input;
			setValue(newValue);
			onChange(newValue);
		}
	});

	return (
		<Text>
			{value}
			<Text color="cyan">|</Text>
		</Text>
	);
}
