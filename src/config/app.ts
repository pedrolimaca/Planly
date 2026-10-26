// Planly Application Configuration
// Change the app name here to update it throughout the application

export const APP_CONFIG = {
  name: 'Planly',
  tagline: 'Planeje, Organize e Conquiste cada dia',
  version: '2.0.0',
  defaultTimezone: 'America/Sao_Paulo',
  defaultLocale: 'pt-BR',
  defaultCurrency: 'BRL',
  defaultFirstDayOfWeek: 0, // 0 = Sunday, 1 = Monday
  defaultDayStartHour: 6,
  defaultDayEndHour: 22,
  dateFormat: 'dd/MM/yyyy',
  timeFormat: 'HH:mm',
  dateTimeFormat: 'dd/MM/yyyy HH:mm',
} as const;

export const GREETING_MESSAGES = [
  'Vamos organizar seu dia!',
  'Um dia de cada vez.',
  'Foco no que importa!',
  'Cada passo conta.',
  'Você está no caminho certo!',
  'Transforme planos em ação.',
  'Hoje é um ótimo dia para avançar.',
  'Consistência gera resultados.',
];

export function getGreeting(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Bom dia';
  if (hour >= 12 && hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function getRandomMessage(): string {
  return GREETING_MESSAGES[Math.floor(Math.random() * GREETING_MESSAGES.length)];
}
