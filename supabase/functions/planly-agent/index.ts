const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type AgentAction = {
  kind: 'task' | 'event' | 'reminder' | 'finance' | 'goal' | 'spiritual' | 'health' | 'workout' | 'note' | 'none';
  title: string;
  description: string | null;
  date: string | null;
  time: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'personal' | 'work' | 'health' | 'study' | 'spiritual' | 'fitness' | 'finance' | 'food' | 'other';
  amount: number | null;
  finance_type: 'income' | 'expense' | null;
  finance_category: string | null;
  payment_method: string | null;
  finance_status: 'pending' | 'paid' | 'received' | 'overdue' | null;
  location: string | null;
  name: string | null;
  frequency: 'daily' | 'weekly' | 'custom' | null;
  notes: string | null;
};

const schema = {
  type: 'object', additionalProperties: false,
  required: ['message', 'actions'],
  properties: {
    message: { type: 'string' },
    actions: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        required: ['kind', 'title', 'description', 'date', 'time', 'priority', 'category', 'amount', 'finance_type', 'finance_category', 'payment_method', 'finance_status', 'location', 'name', 'frequency', 'notes'],
        properties: {
          kind: { type: 'string', enum: ['task', 'event', 'reminder', 'finance', 'goal', 'spiritual', 'health', 'workout', 'note', 'none'] },
          title: { type: 'string' }, description: { type: ['string', 'null'] }, date: { type: ['string', 'null'] }, time: { type: ['string', 'null'] },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
          category: { type: 'string', enum: ['personal', 'work', 'health', 'study', 'spiritual', 'fitness', 'finance', 'food', 'other'] },
          amount: { type: ['number', 'null'] }, finance_type: { type: ['string', 'null'], enum: ['income', 'expense', null] },
          finance_category: { type: ['string', 'null'] }, payment_method: { type: ['string', 'null'] }, finance_status: { type: ['string', 'null'], enum: ['pending', 'paid', 'received', 'overdue', null] },
          location: { type: ['string', 'null'] }, name: { type: ['string', 'null'] }, frequency: { type: ['string', 'null'], enum: ['daily', 'weekly', 'custom', null] }, notes: { type: ['string', 'null'] },
        },
      },
    },
  },
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) throw new Error('OPENAI_API_KEY não foi configurada nos secrets da Edge Function.');
    const { message, attachment } = await request.json();
    if (!message && !attachment) throw new Error('Envie uma mensagem ou um arquivo.');
    const content: unknown[] = [{ type: 'input_text', text: String(message || 'Analise o arquivo enviado e execute as ações necessárias.') }];
    if (attachment?.content?.startsWith('data:')) {
      content.push({ type: 'input_file', filename: attachment.name || 'arquivo', file_data: attachment.content });
    } else if (attachment?.content) {
      content.push({ type: 'input_text', text: 'Conteúdo do arquivo "' + (attachment.name || 'anexo') + '":\n' + attachment.content.slice(0, 60000) });
    }
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        instructions: 'Você é o agente do Planly. Entenda português brasileiro e converta pedidos em ações reais. Extraia e preserve TODOS os detalhes literais. Se houver descrição, detalhes, observações ou notas, description e/ou notes nunca podem ser null ou vazios. Tarefas: title, description, priority, category e date. Finanças: finance_type, amount, finance_category, description, payment_method e finance_status. Eventos: title, description, date, time e location. Hábitos: name, frequency e notes. Para arquivos de treino, crie ações workout ou task para cada treino útil. Para oração, use spiritual. Não invente dados: use null quando não informado. Retorne uma confirmação curta e acolhedora.',
        input: [{ role: 'user', content }],
        text: { format: { type: 'json_schema', name: 'planly_agent_actions', strict: true, schema } },
      }),
    });
    if (!response.ok) throw new Error('Falha da OpenAI: ' + await response.text());
    const result = await response.json();
    return new Response(result.output_text, { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Erro ao processar agente.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
