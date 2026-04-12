/**
 * Parses a command string into tokens, respecting quoted strings.
 * e.g. `task add --name "My task" --status todo`
 *   => ['task', 'add', '--name', 'My task', '--status', 'todo']
 */
export function tokenize(input: string): string[] {
	const tokens: string[] = [];
	let current = '';
	let inQuote = false;
	let quoteChar = '';

	for (const ch of input.trim()) {
		if (inQuote) {
			if (ch === quoteChar) {
				inQuote = false;
			} else {
				current += ch;
			}
		} else if (ch === '"' || ch === "'") {
			inQuote = true;
			quoteChar = ch;
		} else if (ch === ' ') {
			if (current.length > 0) {
				tokens.push(current);
				current = '';
			}
		} else {
			current += ch;
		}
	}

	if (current.length > 0) {
		tokens.push(current);
	}

	return tokens;
}

export interface ParsedCommand {
	command: string;
	subcommand: string | undefined;
	args: string[];
	flags: Record<string, string | boolean>;
}

/**
 * Parses tokenized args into a structured command object.
 */
export function parseCommand(input: string): ParsedCommand {
	const tokens = tokenize(input);
	const [command, ...rest] = tokens;

	let subcommand: string | undefined;
	const positional: string[] = [];
	const flags: Record<string, string | boolean> = {};

	// Determine if second token is a subcommand (not a flag)
	if (rest.length > 0 && rest[0] && !rest[0].startsWith('-')) {
		subcommand = rest[0];
		rest.shift();
	}

	// Parse remaining flags and positional args
	let i = 0;
	while (i < rest.length) {
		const token = rest[i]!;
		if (token.startsWith('--')) {
			const key = token.slice(2);
			const next = rest[i + 1];
			if (next && !next.startsWith('-')) {
				flags[key] = next;
				i += 2;
			} else {
				flags[key] = true;
				i += 1;
			}
		} else if (token.startsWith('-') && token.length === 2) {
			const key = token.slice(1);
			const next = rest[i + 1];
			if (next && !next.startsWith('-')) {
				flags[key] = next;
				i += 2;
			} else {
				flags[key] = true;
				i += 1;
			}
		} else {
			positional.push(token);
			i += 1;
		}
	}

	return {
		command: command ?? '',
		subcommand,
		args: positional,
		flags,
	};
}
