export const formatUserLabel = (
  id: string | null | undefined = "",
  name?: string | null
): string => {
  if (name) return name;
  if (!id) return "Unknown user";
  return `User ${String(id).slice(-4).toUpperCase()}`;
};
