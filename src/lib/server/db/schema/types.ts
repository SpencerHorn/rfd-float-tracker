export const assignmentTypes = [
	'regular',
	'temporary',
	'administrative',
	'training',
	'unassigned'
] as const;

export type AssignmentType = (typeof assignmentTypes)[number];
