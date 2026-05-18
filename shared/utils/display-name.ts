export const getDisplayName = (
  name: string | null | undefined,
  email: string | null | undefined
): string => {
  return name ?? email?.split('@')[0] ?? 'Other';
};
