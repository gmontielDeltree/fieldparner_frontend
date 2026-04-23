const normalizeText = (value: unknown) =>
  typeof value === 'string' ? value.trim() : '';

export const resolveLaborServiceName = (value: unknown): string => {
  const directValue = normalizeText(value);
  if (directValue) return directValue;

  if (!value || typeof value !== 'object') {
    return '';
  }

  const serviceLike = value as Record<string, unknown>;

  return (
    normalizeText(serviceLike.service) ||
    normalizeText(serviceLike.name) ||
    normalizeText(serviceLike.displayName) ||
    normalizeText(serviceLike.description) ||
    normalizeText(serviceLike.descriptionES) ||
    normalizeText(serviceLike.descriptionPT) ||
    normalizeText(serviceLike.descriptionEN) ||
    normalizeText(serviceLike.nombre) ||
    normalizeText(serviceLike.label) ||
    ''
  );
};
