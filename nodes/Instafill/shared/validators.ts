const OBJECT_ID_REGEX = /^[a-f0-9]{24}$/i;

export function validateObjectId(value: string, fieldName: string): string {
	const trimmed = value.trim();

	if (!OBJECT_ID_REGEX.test(trimmed)) {
		throw new Error(
			`The ${fieldName} must be a 24-character identifier. Please check the value and try again.`,
		);
	}

	return trimmed;
}
