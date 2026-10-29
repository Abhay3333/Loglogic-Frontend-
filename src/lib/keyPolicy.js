export const parseCidrInput = (text) => text.split(/[\s,]+/).map((entry) => entry.trim()).filter(Boolean);
