import React, {useState, useEffect, useRef} from 'react';
import {Box, Text, useInput} from 'ink';
import {useKanboard} from '../../context/KanboardContext.js';
import {useNavigation} from '../../context/NavigationContext.js';
import {
	TaskStatus,
	TASK_STATUS_ORDER,
	TASK_STATUS_LABELS,
} from '../../types/index.js';

type FormField = 'name' | 'description' | 'owner' | 'status';

const FIELDS: FormField[] = ['name', 'description', 'owner', 'status'];

export function TaskFormView() {
	const {config, addTask, updateTask} = useKanboard();
	const {setActiveModal, editingTaskId, getStatusForColumn, selectedColumn} =
		useNavigation();

	const existingTask = editingTaskId
		? config?.tasks.find(t => t.id === editingTaskId)
		: null;
	const isEditing = !!existingTask;

	const defaultStatus = getStatusForColumn(selectedColumn);

	const nameRef = useRef(existingTask?.name ?? '');
	const descriptionRef = useRef(existingTask?.description ?? '');
	const ownerRef = useRef(existingTask?.owner ?? '');
	const [status, setStatus] = useState<TaskStatus>(
		existingTask?.status ?? defaultStatus,
	);
	const [activeField, setActiveField] = useState<FormField>('name');
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (existingTask) {
			nameRef.current = existingTask.name;
			descriptionRef.current = existingTask.description;
			ownerRef.current = existingTask.owner ?? '';
			setStatus(existingTask.status);
		}
	}, [existingTask]);

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

	const cycleStatus = (direction: 1 | -1) => {
		const currentIndex = TASK_STATUS_ORDER.indexOf(status);
		const newIndex =
			(currentIndex + direction + TASK_STATUS_ORDER.length) %
			TASK_STATUS_ORDER.length;
		setStatus(TASK_STATUS_ORDER[newIndex]!);
	};

	const handleSubmit = () => {
		if (!nameRef.current.trim()) {
			setError('Name is required');
			setActiveField('name');
			return;
		}

		try {
			if (isEditing && editingTaskId) {
				updateTask(editingTaskId, {
					name: nameRef.current.trim(),
					description: descriptionRef.current.trim(),
					owner: ownerRef.current.trim() || null,
					status,
				});
			} else {
				addTask(nameRef.current.trim(), descriptionRef.current.trim(), status);
			}
			setActiveModal('none');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Unknown error');
		}
	};

	useInput((input, key) => {
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

		if (activeField === 'status') {
			if (input === 'h' || key.leftArrow) {
				cycleStatus(-1);
			} else if (input === 'l' || key.rightArrow) {
				cycleStatus(1);
			} else if (key.return) {
				handleSubmit();
			}
		}
	});

	const renderTextField = (
		field: FormField,
		label: string,
		ref: React.MutableRefObject<string>,
		defaultValue: string,
	) => {
		const isActive = activeField === field;
		return (
			<Box key={field}>
				<Box width={12}>
					<Text color={isActive ? 'cyan' : undefined}>{label}:</Text>
				</Box>
				{isActive ? (
					<Box>
						<Text color="cyan">\u25B6 </Text>
						<TextInputSimple
							defaultValue={defaultValue}
							onChange={v => {
								ref.current = v;
							}}
							onSubmit={moveToNextField}
						/>
					</Box>
				) : (
					<Text dimColor={!ref.current}>{ref.current || '(empty)'}</Text>
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
				{isEditing ? 'Edit Task' : 'New Task'}
			</Text>
			{error && (
				<Box marginY={1}>
					<Text color="red">{error}</Text>
				</Box>
			)}
			<Box flexDirection="column" marginTop={1} gap={1}>
				{renderTextField('name', 'Name', nameRef, existingTask?.name ?? '')}
				{renderTextField(
					'description',
					'Description',
					descriptionRef,
					existingTask?.description ?? '',
				)}
				{renderTextField('owner', 'Owner', ownerRef, existingTask?.owner ?? '')}

				<Box>
					<Box width={12}>
						<Text color={activeField === 'status' ? 'cyan' : undefined}>
							Status:
						</Text>
					</Box>
					<Box>
						{activeField === 'status' && <Text color="yellow">\u25C0 </Text>}
						<Text bold={activeField === 'status'}>
							{TASK_STATUS_LABELS[status]}
						</Text>
						{activeField === 'status' && <Text color="yellow"> \u25B6</Text>}
					</Box>
				</Box>
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
