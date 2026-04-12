import React, {useState, useRef, useEffect} from 'react';
import {Box, Text, useInput} from 'ink';
import {useKanboard} from '../../context/KanboardContext.js';
import {useNavigation} from '../../context/NavigationContext.js';
import {TaskStatus, TASK_STATUS_ORDER, TASK_STATUS_LABELS} from '../../types/index.js';
import {parseCommand} from '../../utils/commandParser.js';
import {shortId} from '../../utils/id.js';

interface CommandResult {
	success: boolean;
	message: string;
	lines?: string[];
}

export function CommandInputView() {
	const {config, addTask, updateTask, deleteTask, moveTask, addMember} =
		useKanboard();
	const {setActiveModal} = useNavigation();

	const inputRef = useRef('');
	const [displayInput, setDisplayInput] = useState('');
	const [result, setResult] = useState<CommandResult | null>(null);
	const [submitted, setSubmitted] = useState(false);

	// Auto-close after showing result
	useEffect(() => {
		if (submitted && result) {
			const timer = setTimeout(() => {
				setActiveModal('none');
			}, 2000);
			return () => {
				clearTimeout(timer);
			};
		}
		return undefined;
	}, [submitted, result, setActiveModal]);

	const runCommand = (cmdStr: string): CommandResult => {
		if (!config) return {success: false, message: 'No project loaded'};

		const {command, subcommand, args, flags} = parseCommand(cmdStr.trim());

		if (!command) return {success: false, message: 'No command entered'};

		// status
		if (command === 'status') {
			const counts: Record<string, number> = {};
			for (const s of TASK_STATUS_ORDER) counts[s] = 0;
			for (const task of config.tasks) counts[task.status]!++;
			const lines = TASK_STATUS_ORDER.map(
				s => `  ${TASK_STATUS_LABELS[s]}: ${counts[s]}`,
			);
			return {
				success: true,
				message: `Total: ${config.tasks.length} tasks`,
				lines,
			};
		}

		// task subcommands
		if (command === 'task') {
			switch (subcommand) {
				case 'add': {
					const name = String(flags['name'] ?? flags['n'] ?? '');
					if (!name)
						return {success: false, message: 'task add requires --name'};
					const description = String(flags['description'] ?? flags['d'] ?? '');
					const owner = flags['owner'] ?? flags['o'];
					const ownerStr = owner ? String(owner) : null;
					const statusFlag = String(flags['status'] ?? flags['s'] ?? 'backlog');
					const validStatus = TASK_STATUS_ORDER.find(s => s === statusFlag);
					const taskStatus: TaskStatus = validStatus ?? TaskStatus.BACKLOG;
					if (ownerStr && !config.members.includes(ownerStr)) {
						addMember(ownerStr);
					}
					const task = addTask(name, description, taskStatus, ownerStr);
					return {
						success: true,
						message: `Task created: ${task.name} [${task.status}]`,
					};
				}

				case 'list': {
					const statusFilter = flags['status'] ?? flags['s'];
					const ownerFilter = flags['owner'] ?? flags['o'];
					let tasks = [...config.tasks];
					if (statusFilter) tasks = tasks.filter(t => t.status === statusFilter);
					if (ownerFilter) tasks = tasks.filter(t => t.owner === ownerFilter);
					if (tasks.length === 0)
						return {success: true, message: 'No tasks found', lines: []};
					const lines = tasks.map(
						t =>
							`  [${t.status}] ${t.name}${t.owner ? ' @' + t.owner : ''} (${shortId(t.id)})`,
					);
					return {
						success: true,
						message: `${tasks.length} task(s):`,
						lines,
					};
				}

				case 'show': {
					const id = args[0];
					if (!id)
						return {success: false, message: 'task show requires <id>'};
					const task = config.tasks.find(
						t => t.id.startsWith(id) || shortId(t.id) === id,
					);
					if (!task)
						return {success: false, message: `Task not found: ${id}`};
					return {
						success: true,
						message: task.name,
						lines: [
							`  ID:     ${shortId(task.id)}`,
							`  Status: ${TASK_STATUS_LABELS[task.status]}`,
							`  Owner:  ${task.owner ?? '(none)'}`,
							`  Desc:   ${task.description || '(none)'}`,
						],
					};
				}

				case 'move': {
					const id = args[0];
					const newStatus = args[1];
					if (!id || !newStatus)
						return {
							success: false,
							message: 'task move requires <id> <status>',
						};
					const task = config.tasks.find(
						t => t.id.startsWith(id) || shortId(t.id) === id,
					);
					if (!task)
						return {success: false, message: `Task not found: ${id}`};
					const validSt = TASK_STATUS_ORDER.find(s => s === newStatus);
					if (!validSt)
						return {
							success: false,
							message: `Invalid status: ${newStatus}. Valid: ${TASK_STATUS_ORDER.join(', ')}`,
						};
					moveTask(task.id, validSt);
					return {
						success: true,
						message: `Moved "${task.name}" to ${TASK_STATUS_LABELS[validSt]}`,
					};
				}

				case 'delete': {
					const id = args[0];
					if (!id)
						return {success: false, message: 'task delete requires <id>'};
					const task = config.tasks.find(
						t => t.id.startsWith(id) || shortId(t.id) === id,
					);
					if (!task)
						return {success: false, message: `Task not found: ${id}`};
					deleteTask(task.id);
					return {success: true, message: `Deleted "${task.name}"`};
				}

				case 'update': {
					const id = args[0];
					if (!id)
						return {success: false, message: 'task update requires <id>'};
					const task = config.tasks.find(
						t => t.id.startsWith(id) || shortId(t.id) === id,
					);
					if (!task)
						return {success: false, message: `Task not found: ${id}`};
					const updates: Parameters<typeof updateTask>[1] = {};
					if (flags['name'] ?? flags['n'])
						updates.name = String(flags['name'] ?? flags['n']);
					if (flags['description'] ?? flags['d'])
						updates.description = String(flags['description'] ?? flags['d']);
					if (flags['owner'] ?? flags['o'])
						updates.owner = String(flags['owner'] ?? flags['o']);
					if (flags['status'] ?? flags['s']) {
						const st = String(flags['status'] ?? flags['s']);
						const validSt = TASK_STATUS_ORDER.find(s => s === st);
						if (validSt) updates.status = validSt;
					}
					updateTask(task.id, updates);
					return {success: true, message: `Updated "${task.name}"`};
				}

				default:
					return {
						success: false,
						message: `Unknown task subcommand: ${subcommand ?? '(none)'}. Try: add, list, show, move, delete, update`,
					};
			}
		}

		return {
			success: false,
			message: `Unknown command: ${command}. Try: task add/list/show/move/delete, status`,
		};
	};

	useInput((input, key) => {
		if (submitted) return;

		if (key.escape) {
			setActiveModal('none');
			return;
		}

		if (key.return) {
			const cmdResult = runCommand(inputRef.current);
			setResult(cmdResult);
			setSubmitted(true);
			return;
		}

		if (key.backspace || key.delete) {
			const newVal = inputRef.current.slice(0, -1);
			inputRef.current = newVal;
			setDisplayInput(newVal);
			return;
		}

		if (input && !key.ctrl && !key.meta && !key.tab) {
			const newVal = inputRef.current + input;
			inputRef.current = newVal;
			setDisplayInput(newVal);
		}
	});

	return (
		<Box
			flexDirection="column"
			borderStyle="round"
			borderColor="cyan"
			paddingX={1}
			paddingY={0}
			marginTop={1}
		>
			<Box>
				<Text color="cyan" bold>
					{'CMD '}
				</Text>
				<Text color="cyan">{': '}</Text>
				{submitted ? (
					<Text dimColor>{displayInput}</Text>
				) : (
					<Text>
						{displayInput}
						<Text color="cyan">|</Text>
					</Text>
				)}
			</Box>

			{result && (
				<Box flexDirection="column" marginTop={0}>
					<Text color={result.success ? 'green' : 'red'}>
						{result.success ? '  v ' : '  x '} {result.message}
					</Text>
					{result.lines?.map((line, i) => (
						<Text key={i} dimColor>
							{line}
						</Text>
					))}
					<Text dimColor>  (closing in 2s...)</Text>
				</Box>
			)}

			{!submitted && (
				<Text dimColor>
					{'  Enter: run | Esc: cancel | e.g. task add --name "My task" --status todo'}
				</Text>
			)}
		</Box>
	);
}
