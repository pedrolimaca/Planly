import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDataRefresh } from '../../hooks/useDataRefresh';
import { getAllItems } from '../../services/storage';
import Card from './Card';
export default function AIUsageInfo() {
  const {user}=useAuth();const [,refresh]=useState(0);useDataRefresh(()=>refresh(v=>v+1));
  const usage=user?getAllItems<{id:string;total_tokens:number;input_tokens:number;output_tokens:number;model:string}>('ai_usage',user.id):[];
  return <Card title="IA: funcionamento e consumo"><p>Notícias, liturgia, catálogo musical e comandos locais por regras não chamam a OpenAI e não gastam tokens de IA.</p><p>O agente remoto envia sua mensagem e o contexto autorizado à OpenAI pelo servidor Supabase. O modelo padrão no código é gpt-4o-mini; o servidor pode configurar outro. A geração da proposta já consome tokens, mesmo que você cancele as ações depois.</p><p>A conta/projeto da OpenAI associada à chave do servidor é responsável pelo consumo. O Planly não consegue identificar aqui o titular, o cartão ou o saldo dessa conta. Limites de solicitações não são créditos gratuitos.</p><p><strong>{usage.length} consultas registradas neste navegador • {usage.reduce((n,u)=>n+u.total_tokens,0).toLocaleString('pt-BR')} tokens informados pelo provedor.</strong></p><p>Este registro começa nesta versão, depende da função atualizada e não é uma fatura nem prova de ausência de gastos anteriores. Valores e histórico completo devem ser conferidos no painel do projeto.</p><a href="https://platform.openai.com/usage" target="_blank" rel="noreferrer">Abrir painel de uso da OpenAI</a></Card>;
}
