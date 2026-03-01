export const paginate = <T extends { id: string }>(
  items: T[],
  limit: number,
): { result: T[]; nextCursor: string | null } => {
  const hasMore = items.length > limit;
  const result = hasMore ? items.slice(0, -1) : items;
  const nextCursor = hasMore ? (result[result.length - 1]?.id ?? null) : null;

  return { result, nextCursor };
};
