export const normalizeRelation = (relation: any): { name: string } | null => {
  if (!relation) return null
  if (Array.isArray(relation)) return relation[0] || null
  return relation
}
