import React, {useState, useRef} from 'react';
import {Box, Text, useInput} from 'ink';
import {useKanboard} from '../../context/KanboardContext.js';
import {useNavigation} from '../../context/NavigationContext.js';
import {type SprintStatus, type ChecklistItem} from '../../types/index.js';
import {generateId} from '../../utils/id.js';

type FormField =
	| 'name'
	| 'description'
	| 'startDate'
	| 'endDate'
	| 'status'
	| 'milestones';

const FIELDS: FormField[] = [
	'name',
	'description',
	'startDate',
	'endDate',
	'status',
	'milestones',
];

const SPRINT_STATUS_VALUES: SprintStatus[] = [
	'planning',
	'active',
	'completed',
];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function SprintFormView() {
	const {config, addSprint, updateSprint} = useKanboard();
	const {setActiveModal, editingSprintId} = useNavigation();

	const existing = editingSprintId
		? config?.sprints.find(s => s.id === editingSprintId)
		: null;
	const isEditing = !!existing;

	const nameRef = useRef(existing?.name ?? '');
	const descriptionRef = useRef(existing?.description ?? '');
	const startRef = useRef(existing?.startDate ?? '');
	const endRef = useRef(existing?.endDate ?? '');
	const [status, setStatus] = useState<SprintStatus>(
		existing?.status ?? 'planning',
	);
	const [milestones, setMilestones] = useState<ChecklistItem[]>(
		existing?.milestones ?? [],
	);
	const [activeField, setActiveField] = useState<FormField>('name');
	const [error, setError] = useState<string | null>(null);

	const [milestoneIndex, setMilestoneIndex] = useState(0);
	const [addingMilestone, setAddingMilestone] = useState(false);
	const newMilestoneRef = useRef('');
	const [, force] = useState({});
	const rerender = () => force({});

	const moveToNextField = () => {
		const i = FIELDS.indexOf(activeField);
		if (i < FIELDS.length - 1) setActiveField(FIELDS[i + 1]!);
	};
	const moveToPrevField = () => {
		const i = FIELDS.indexOf(activeField);
		if (i > 0) setActiveField(FIELDS[i - 1]!);
	};

	const cycleStatus = (dir: 1 | -1) => {
		const i = SPRINT_STATUS_VALUES.indexOf(status);
		const next =
			(i + dir + SPRINT_STATUS_VALUES.length) % SPRINT_STATUS_VALUES.length;
		setStatus(SPRINT_STATUS_VALUES[next]!);
	};

	const handleSubmit = () => {
		if (!nameRef.current.trim()) {
			setError('Name is required');
			setActiveField('name');
			return;
		}
		const start = startRef.current.trim() || null;
		if (start && !DATE_RE.test(start)) {
			setError('Start date must be YYYY-MM-DD');
			setActiveField('startDate');
			return;
		}
		const end = endRef.current.trim() || null;
		if (end && !DATE_RE.test(end)) {
			setError('End date must be YYYY-MM-DD');
			setActiveField('endDate');
			return;
		}

		try {
			if (isEditing && existing) {
				updateSprint(existing.id, {
					name: nameRef.current.trim(),
					description: descriptionRef.current,
					startDate: start,
					endDate: end,
					status,
					milestones,
				});
			} else {
				addSprint(
					nameRef.current.trim(),
					descriptionRef.current,
					start,
					end,
					milestones,
					status,
				);
			}
			setActiveModal('none');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Unknown error');
		}
	};

	useInput((input, key) => {
		if (addingMilestone) {
			if (key.escape) {
				setAddingMilestone(false);
				newMilestoneRef.current = '';
				rerender();
				return;
			}
			if (key.return) {
				const text = newMilestoneRef.current.trim();
				if (text) {
					setMilestones(prev => [
						...prev,
						{id: generateId(), text, completed: false},
					]);
				}
				newMilestoneRef.current = '';
				setAddingMilestone(false);
				rerender();
				return;
			}
			if (key.backspace || key.delete) {
				newMilestoneRef.current = newMilestoneRef.current.slice(0, -1);
				rerender();
				return;
			}
			if (input && !key.ctrl && !key.meta) {
				newMilestoneRef.current += input;
				rerender();
			}
			return;
		}

		if (key.escape) {
			setActiveModal('none');
			return;
		}
		if (key.tab && key.shift) {
			moveToPrevField();
			return;
		}
		if (key.tab) {
			moveToNextField();
			return;
		}
		if (key.return) {
			if (activeField === 'milestones') {
				// Enter on milestones field submits the form
				handleSubmit();
				return;
			}
			handleSubmit();
			return;
		}

		if (activeField === 'status') {
			if (input === 'h' || key.leftArrow) {
				cycleStatus(-1);
				return;
			}
			if (input === 'l' || key.rightArrow) {
				cycleStatus(1);
				return;
			}
			return;
		}

		if (activeField === 'milestones') {
			const list = milestones;
			if (input === 'a') {
				setAddingMilestone(true);
				newMilestoneRef.current = '';
				rerender();
				return;
			}
			if (input === 'x' && list.length > 0) {
				setMilestones(list.filter((_, i) => i !== milestoneIndex));
				setMilestoneIndex(i => Math.max(0, Math.min(i, list.length - 2)));
				return;
			}
			if (input === ' ' && list.length > 0) {
				setMilestones(
					list.map((m, i) =>
						i === milestoneIndex ? {...m, completed: !m.completed} : m,
					),
				);
				return;
			}
			if ((input === 'j' || key.downArrow) && list.length > 0) {
				setMilestoneIndex(i => Math.min(i + 1, list.length - 1));
				return;
			}
			if ((input === 'k' || key.upArrow) && list.length > 0) {
				setMilestoneIndex(i => Math.max(0, i - 1));
				return;
			}
			return;
		}

		// Text field input
		const refByField: Record<string, React.MutableRefObject<string>> = {
			name: nameRef,
			description: descriptionRef,
			startDate: startRef,
			endDate: endRef,
		};
		const ref = refByField[activeField];
		if (!ref) return;

		if (key.backspace || key.delete) {
			ref.current = ref.current.slice(0, -1);
			rerender();
			return;
		}
		if (input && !key.ctrl && !key.meta) {
			ref.current += input;
			rerender();
		}
	});

	const renderField = (label: string, value: string, field: FormField) => (
		<Box>
			<Box width={14}>
				<Text color={activeField === field ? 'cyan' : undefined}>
					{activeField === field ? '› ' : '  '}
					{label}:
				</Text>
			</Box>
			<Text>{value || ' '}</Text>
			{activeField === field && <Text color="cyan">_</Text>}
		</Box>
	);

	return (
		<Box
			flexDirection="column"
			borderStyle="round"
			borderColor="cyan"
			padding={1}
			marginY={1}
		>
			<Text bold color="cyan">
				{isEditing ? 'Edit Sprint' : 'New Sprint'}
			</Text>
			<Box marginTop={1} flexDirection="column">
				{renderField('Name', nameRef.current, 'name')}
				{renderField('Description', descriptionRef.current, 'description')}
				{renderField('Start (YYYY-MM-DD)', startRef.current, 'startDate')}
				{renderField('End (YYYY-MM-DD)', endRef.current, 'endDate')}
				<Box>
					<Box width={14}>
						<Text color={activeField === 'status' ? 'cyan' : undefined}>
							{activeField === 'status' ? '› ' : '  '}Status:
						</Text>
					</Box>
					<Text>{status}</Text>
					{activeField === 'status' && <Text dimColor> (h/l to cycle)</Text>}
				</Box>
				<Box flexDirection="column">
					<Box>
						<Box width={14}>
							<Text color={activeField === 'milestones' ? 'cyan' : undefined}>
								{activeField === 'milestones' ? '› ' : '  '}Milestones:
							</Text>
						</Box>
						<Text dimColor>
							{milestones.length} item{milestones.length === 1 ? '' : 's'}
							{activeField === 'milestones' &&
								' (a:add x:remove space:toggle j/k:nav)'}
						</Text>
					</Box>
					{milestones.map((m, i) => (
						<Box key={m.id}>
							<Box width={14}>
								<Text> </Text>
							</Box>
							<Text
								color={
									activeField === 'milestones' && i === milestoneIndex
										? 'cyan'
										: undefined
								}
							>
								{activeField === 'milestones' && i === milestoneIndex
									? '› '
									: '  '}
								{m.completed ? '☑' : '☐'} {m.text}
							</Text>
						</Box>
					))}
					{addingMilestone && (
						<Box>
							<Box width={14}>
								<Text> </Text>
							</Box>
							<Text color="cyan">
								+ {newMilestoneRef.current}
								<Text>_</Text>
							</Text>
						</Box>
					)}
				</Box>
			</Box>
			{error && (
				<Box marginTop={1}>
					<Text color="red">{error}</Text>
				</Box>
			)}
			<Box marginTop={1}>
				<Text dimColor>
					Tab:next · Shift+Tab:prev · Enter:submit · Esc:cancel
				</Text>
			</Box>
		</Box>
	);
}
