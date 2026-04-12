import React, {useState, useRef} from 'react';
import {Box, Text, useInput} from 'ink';
import {useKanboard} from '../../context/KanboardContext.js';
import {useNavigation} from '../../context/NavigationContext.js';
import {
	TaskStatus,
	TASK_STATUS_ORDER,
	TASK_STATUS_LABELS,
	type ChecklistItem,
} from '../../types/index.js';
import {generateId} from '../../utils/id.js';

type FormField = 'name' | 'description' | 'owner' | 'deadline' | 'checklist' | 'status';

const FIELDS: FormField[] = ['name', 'description', 'owner', 'deadline', 'checklist', 'status'];

export function TaskFormView() {
	const {config, addTask, updateTask, addMember} = useKanboard();
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
	const deadlineRef = useRef(existingTask?.deadline ?? '');
	const [status, setStatus] = useState<TaskStatus>(
		existingTask?.status ?? defaultStatus,
	);
	const [activeField, setActiveField] = useState<FormField>('name');
	const [error, setError] = useState<string | null>(null);

	// Owner selector state
	const members = config?.members ?? [];
	const [ownerListIndex, setOwnerListIndex] = useState(0);
	const [addingNewMember, setAddingNewMember] = useState(false);
	const newMemberRef = useRef('');

	// Checklist state
	const [checklist, setChecklist] = useState<ChecklistItem[]>(
		existingTask?.checklist ?? [],
	);
	const [checklistItemIndex, setChecklistItemIndex] = useState(0);
	const [addingChecklistItem, setAddingChecklistItem] = useState(false);
	const newChecklistItemRef = useRef('');

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

		const deadlineValue = deadlineRef.current.trim() || null;
		if (deadlineValue && !/^\d{4}-\d{2}-\d{2}$/.test(deadlineValue)) {
			setError('Deadline must be in YYYY-MM-DD format');
			setActiveField('deadline');
			return;
		}

		try {
			if (isEditing && editingTaskId) {
				updateTask(editingTaskId, {
					name: nameRef.current.trim(),
					description: descriptionRef.current.trim(),
					owner: ownerRef.current.trim() || null,
					deadline: deadlineValue,
					checklist,
					status,
				});
			} else {
				const task = addTask(
					nameRef.current.trim(),
					descriptionRef.current.trim(),
					status,
					ownerRef.current.trim() || null,
					deadlineValue,
				);
				if (checklist.length > 0) {
					updateTask(task.id, {checklist});
				}
			}
			setActiveModal('none');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Unknown error');
		}
	};

	useInput((input, key) => {
		if (key.escape) {
			if (addingNewMember) {
				setAddingNewMember(false);
				newMemberRef.current = '';
				return;
			}
			if (addingChecklistItem) {
				setAddingChecklistItem(false);
				newChecklistItemRef.current = '';
				return;
			}
			setActiveModal('none');
			return;
		}

		if (activeField === 'owner') {
			if (addingNewMember) {
				// Handle text input for new member name
				if (key.return) {
					const name = newMemberRef.current.trim();
					if (name) {
						addMember(name);
						ownerRef.current = name;
					}
					setAddingNewMember(false);
					newMemberRef.current = '';
					moveToNextField();
					return;
				}
				if (key.backspace || key.delete) {
					newMemberRef.current = newMemberRef.current.slice(0, -1);
					return;
				}
				if (input && !key.ctrl && !key.meta && !key.tab) {
					newMemberRef.current = newMemberRef.current + input;
					return;
				}
				if (key.tab) {
					if (key.shift) moveToPrevField();
					else moveToNextField();
				}
				return;
			}

			// Owner list navigation
			const listCount = members.length + 1; // +1 for "Add new"
			if (input === 'j' || key.downArrow) {
				setOwnerListIndex(i => Math.min(i + 1, listCount - 1));
				return;
			}
			if (input === 'k' || key.upArrow) {
				setOwnerListIndex(i => Math.max(i - 1, 0));
				return;
			}
			if (key.return) {
				if (ownerListIndex === members.length) {
					// "Add new member" selected
					setAddingNewMember(true);
					newMemberRef.current = '';
				} else {
					const selected = members[ownerListIndex];
					ownerRef.current = selected ?? '';
					moveToNextField();
				}
				return;
			}
			// Allow clearing owner with delete/backspace
			if (key.backspace || key.delete) {
				ownerRef.current = '';
				return;
			}
		}

		if (activeField === 'checklist') {
			if (addingChecklistItem) {
				if (key.return) {
					const text = newChecklistItemRef.current.trim();
					if (text) {
						setChecklist(prev => [
							...prev,
							{id: generateId(), text, completed: false},
						]);
					}
					setAddingChecklistItem(false);
					newChecklistItemRef.current = '';
					return;
				}
				if (key.escape) {
					setAddingChecklistItem(false);
					newChecklistItemRef.current = '';
					return;
				}
				if (key.backspace || key.delete) {
					newChecklistItemRef.current = newChecklistItemRef.current.slice(0, -1);
					return;
				}
				if (input && !key.ctrl && !key.meta && !key.tab) {
					newChecklistItemRef.current = newChecklistItemRef.current + input;
					return;
				}
				return;
			}

			if (input === 'a') {
				newChecklistItemRef.current = '';
				setAddingChecklistItem(true);
				return;
			}
			if (input === 'd' && checklist.length > 0) {
				setChecklist(prev => prev.filter((_, i) => i !== checklistItemIndex));
				setChecklistItemIndex(i => Math.min(i, checklist.length - 2));
				return;
			}
			if (input === ' ' && checklist.length > 0) {
				setChecklist(prev =>
					prev.map((item, i) =>
						i === checklistItemIndex
							? {...item, completed: !item.completed}
							: item,
					),
				);
				return;
			}
			if ((input === 'j' || key.downArrow) && checklist.length > 0) {
				setChecklistItemIndex(i => Math.min(i + 1, checklist.length - 1));
				return;
			}
			if ((input === 'k' || key.upArrow) && checklist.length > 0) {
				setChecklistItemIndex(i => Math.max(i - 1, 0));
				return;
			}
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
	) => {
		const isActive = activeField === field;
		return (
			<Box key={field}>
				<Box width={13}>
					<Text color={isActive ? 'cyan' : undefined}>{label}:</Text>
				</Box>
				{isActive ? (
					<Box>
						<Text color="cyan">{'> '}</Text>
						<TextInputSimple
							defaultValue={ref.current}
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

	const renderOwnerField = () => {
		const isActive = activeField === 'owner';

		if (!isActive) {
			return (
				<Box key="owner">
					<Box width={13}>
						<Text>Owner:</Text>
					</Box>
					<Text dimColor={!ownerRef.current}>
						{ownerRef.current || '(none)'}
					</Text>
				</Box>
			);
		}

		if (addingNewMember) {
			return (
				<Box key="owner" flexDirection="column">
					<Box>
						<Box width={13}>
							<Text color="cyan">Owner:</Text>
						</Box>
						<Text color="cyan">{'> '}</Text>
						<TextInputSimple
							defaultValue={newMemberRef.current}
							onChange={v => {
								newMemberRef.current = v;
							}}
							onSubmit={() => {
								const name = newMemberRef.current.trim();
								if (name) {
									addMember(name);
									ownerRef.current = name;
								}
								setAddingNewMember(false);
								newMemberRef.current = '';
								moveToNextField();
							}}
						/>
					</Box>
					<Box marginLeft={13}>
						<Text dimColor>Type name + Enter to add</Text>
					</Box>
				</Box>
			);
		}

		const listItems = [...members, '+ Add new member'];
		return (
			<Box key="owner" flexDirection="column">
				<Box>
					<Box width={13}>
						<Text color="cyan">Owner:</Text>
					</Box>
					<Text dimColor={!ownerRef.current}>
						{ownerRef.current || '(none)'}
					</Text>
				</Box>
				<Box flexDirection="column" marginLeft={13} marginTop={0}>
					{listItems.map((item, i) => (
						<Box key={item}>
							<Text color={i === ownerListIndex ? 'cyan' : undefined}>
								{i === ownerListIndex ? '> ' : '  '}
								{item}
							</Text>
						</Box>
					))}
					<Text dimColor>j/k: navigate | Enter: select | Backspace: clear</Text>
				</Box>
			</Box>
		);
	};

	const renderChecklistField = () => {
		const isActive = activeField === 'checklist';
		if (!isActive) {
			return (
				<Box key="checklist">
					<Box width={13}>
						<Text>Checklist:</Text>
					</Box>
					<Text dimColor={checklist.length === 0}>
						{checklist.length === 0
							? '(none)'
							: `${checklist.filter(i => i.completed).length}/${checklist.length} done`}
					</Text>
				</Box>
			);
		}

		return (
			<Box key="checklist" flexDirection="column">
				<Box>
					<Box width={13}>
						<Text color="cyan">Checklist:</Text>
					</Box>
					<Text dimColor={checklist.length === 0}>
						{checklist.length === 0 ? '(none)' : `${checklist.length} item(s)`}
					</Text>
				</Box>
				<Box flexDirection="column" marginLeft={13}>
					{checklist.map((item, i) => (
						<Text
							key={item.id}
							color={i === checklistItemIndex ? 'cyan' : undefined}
						>
							{i === checklistItemIndex ? '>' : ' '} {item.completed ? '[x]' : '[ ]'}{' '}
							{item.text}
						</Text>
					))}
					{addingChecklistItem && (
						<Box>
							<Text color="cyan">{'> [ ] '}</Text>
							<TextInputSimple
								defaultValue={newChecklistItemRef.current}
								onChange={v => {
									newChecklistItemRef.current = v;
								}}
								onSubmit={() => {
									const text = newChecklistItemRef.current.trim();
									if (text) {
										setChecklist(prev => [
											...prev,
											{id: generateId(), text, completed: false},
										]);
									}
									setAddingChecklistItem(false);
									newChecklistItemRef.current = '';
								}}
							/>
						</Box>
					)}
					<Text dimColor>
						a: add | d: delete | Space: toggle | j/k: navigate
					</Text>
				</Box>
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
				{renderTextField('name', 'Name', nameRef)}
				{renderTextField('description', 'Description', descriptionRef)}
				{renderOwnerField()}
				{renderTextField('deadline', 'Deadline', deadlineRef)}
				{renderChecklistField()}

				<Box>
					<Box width={13}>
						<Text color={activeField === 'status' ? 'cyan' : undefined}>
							Status:
						</Text>
					</Box>
					<Box>
						{activeField === 'status' && <Text color="yellow">{'< '}</Text>}
						<Text bold={activeField === 'status'}>
							{TASK_STATUS_LABELS[status]}
						</Text>
						{activeField === 'status' && <Text color="yellow">{' >'}</Text>}
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

		if (input && !key.ctrl && !key.meta && !key.tab) {
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
