import { z } from 'zod';
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(s => !Number.isNaN(Date.parse(s)) && new Date(s).toISOString().startsWith(s)).nullable();
export const remoteActionSchema = z.object({
  workout: z.object({
    muscle_groups: z.array(z.string().max(100)).max(30),
    days_of_week: z.array(z.number().int().min(0).max(6)).max(7),
    duration_minutes: z.number().int().positive().max(1440).nullable(),
    exercises: z.array(z.object({
      name: z.string().trim().min(1).max(300), sets: z.number().int().positive().max(100).nullable(),
      reps: z.string().max(200).nullable(), weight: z.number().nonnegative().max(2000).nullable(),
      rest_seconds: z.number().int().nonnegative().max(3600).nullable(), notes: z.string().max(5000).nullable(),
    })).max(100),
  }).nullable().optional(),
  kind: z.enum(['task','event','reminder','finance','habit','goal','spiritual','health','workout','note','none']),
  title: z.string().trim().min(1).max(300), description: z.string().max(10000).nullable(), date,
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).nullable(),
  priority: z.enum(['low','medium','high','urgent']), category: z.enum(['personal','work','health','study','spiritual','fitness','finance','food','other']),
  amount: z.number().finite().positive().nullable(), finance_type: z.enum(['income','expense']).nullable(),
  finance_category: z.string().max(100).nullable(), payment_method: z.string().max(100).nullable(),
  finance_status: z.enum(['pending','paid','received','overdue']).nullable(), location: z.string().max(500).nullable(),
  name: z.string().max(300).nullable(), frequency: z.enum(['daily','weekly','custom']).nullable(), notes: z.string().max(10000).nullable(),
}).refine(a => a.kind !== 'workout' || a.workout != null, 'Treino sem dados estruturados. Atualize a função de IA.').refine(a => a.kind !== 'finance' || (a.amount !== null && a.finance_type !== null), 'Informe valor e tipo da transação');
export const remoteResultSchema = z.object({ message: z.string().max(12000), actions: z.array(remoteActionSchema).max(20), usage: z.object({ input_tokens:z.number().int().nonnegative(), output_tokens:z.number().int().nonnegative(), total_tokens:z.number().int().nonnegative(), model:z.string() }).optional() });
export type RemoteResult = z.infer<typeof remoteResultSchema>;
export function validateAttachment(file: { name: string; size: number; type: string }) {
  if (file.size <= 0 || file.size > 5 * 1024 * 1024) throw new Error('Envie um arquivo não vazio de até 5 MB.');
  if (!/\.(txt|md|csv|json|pdf|png|jpe?g|webp)$/i.test(file.name)) throw new Error('Formatos aceitos: TXT, MD, CSV, JSON, PDF, PNG, JPEG e WebP. DOCX ainda não está disponível.');
  if (file.type && !/^(text\/|application\/(pdf|json)$|image\/(png|jpeg|webp)$)/.test(file.type)) throw new Error('Tipo de arquivo não permitido.');
}
