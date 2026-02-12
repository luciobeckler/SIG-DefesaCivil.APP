import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { isValid, parse } from 'date-fns';

/**
 * Converte uma data JavaScript para o formato "YYYY-MM-DD",
 * compatível com DateOnly no back-end .NET.
 *
 * @param value - Pode ser um objeto Date ou uma string ISO.
 * @returns string no formato "YYYY-MM-DD" ou null se inválido.
 */
export function toDateOnly(
  value: Date | string | null | undefined,
): string | null {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);

  if (isNaN(date.getTime())) return null; // data inválida

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // mês é 0-based
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Valida se um CPF é válido.
 *
 * @param cpf - String contendo o CPF a ser validado.
 * @returns true se o CPF for válido, false caso contrário.
 */
export function isCpfValido(cpf: string): boolean {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(10))) return false;
  return true;
}

/**
 * Valida se um telefone é válido.
 *
 * @param telefone - String contendo o telefone a ser validado.
 * @returns true se o telefone for válido, false caso contrário.
 */
export function isTelefoneValido(telefone: string): boolean {
  const tel = telefone.replace(/\D/g, '');
  return tel.length >= 10 && tel.length <= 11;
}

export function formatarLabel(valor: string): string {
  return valor.replace(/([A-Z])/g, ' $1').trim();
}

export function dateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const date = parse(value, 'dd/MM/yyyy HH:mm', new Date());

    if (!isValid(date) || date.getFullYear() < 1900) {
      return { invalidDate: true };
    }

    return null;
  };
}

export function converterParaISO(dataBR: string): string | null {
  if (!dataBR || dataBR.length !== 10) return null;
  const partes = dataBR.split('/');
  if (partes.length !== 3) return null;
  return `${partes[2]}-${partes[1]}-${partes[0]}`;
}
