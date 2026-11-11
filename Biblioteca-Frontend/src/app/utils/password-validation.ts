const passwordRules = [
  { label: 'La primera letra es mayúscula', cumple: (password: string) => /^\p{Lu}/u.test(password) },
  { label: 'Al menos 8 caracteres', cumple: (password: string) => password.length >= 8 },
  { label: 'Al menos 1 dígito', cumple: (password: string) => /\p{N}/u.test(password) },
  { label: 'Al menos 1 letra minúscula', cumple: (password: string) => /\p{Ll}/u.test(password) },
  { label: 'Al menos 1 símbolo especial', cumple: (password: string) => /[^\p{L}\p{N}\s]/u.test(password) }
];

export function getPasswordRequirements(password: string) {
  return passwordRules.map(rule => ({
    label: rule.label,
    cumple: rule.cumple(password)
  }));
}

export function isPasswordValid(password: string): boolean {
  return passwordRules.every(rule => rule.cumple(password));
}
