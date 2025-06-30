/**
 * Converte uma data JavaScript para o formato "YYYY-MM-DD",
 * compatível com DateOnly no back-end .NET.
 *
 * @param value - Pode ser um objeto Date ou uma string ISO.
 * @returns string no formato "YYYY-MM-DD" ou null se inválido.
 */
export function toDateOnly(
  value: Date | string | null | undefined
): string | null {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);

  if (isNaN(date.getTime())) return null; // data inválida

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // mês é 0-based
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
