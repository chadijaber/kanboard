export function daysUntilDeadline(deadline: string): number {
	const deadlineDate = new Date(deadline);
	deadlineDate.setHours(23, 59, 59, 999);
	const diffMs = deadlineDate.getTime() - Date.now();
	return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function formatDeadlineShort(deadline: string): string {
	const date = new Date(deadline);
	const now = new Date();
	const sameYear = date.getFullYear() === now.getFullYear();
	return date.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		...(sameYear ? {} : {year: 'numeric'}),
	});
}

export function formatCreatedDate(isoString: string): string {
	const date = new Date(isoString);
	return date.toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
}

export function relativeTime(isoString: string): string {
	const diffMs = Date.now() - new Date(isoString).getTime();
	const seconds = Math.floor(diffMs / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);
	const months = Math.floor(days / 30);
	const years = Math.floor(days / 365);

	if (years >= 1) return years === 1 ? '1 year ago' : `${years} years ago`;
	if (months >= 1) return months === 1 ? '1 month ago' : `${months} months ago`;
	if (days >= 1) return days === 1 ? '1 day ago' : `${days} days ago`;
	if (hours >= 1) return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
	if (minutes >= 1) return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
	return seconds === 1 ? '1 second ago' : `${seconds} seconds ago`;
}
