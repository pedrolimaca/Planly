import { useState } from 'react';
import { format } from 'date-fns';
import { allRosaryMysteries, getDailyCatholicContext } from '../../services/transformationContent';
import { useAuth } from '../../contexts/AuthContext';
import { createItem, getAllItems, updateItem } from '../../services/storage';
import type { SpiritualActivity } from '../../types';
import Card from './Card';
import Button from './Button';
export default function RosaryGuide() {
  const { user } = useAuth(); const [mystery, setMystery] = useState('today');
  const [step, setStep] = useState(0); const [message, setMessage] = useState('');
  const rosary = mystery === 'today' ? getDailyCatholicContext().rosary : allRosaryMysteries[mystery];
  const steps = ['Sinal da Cruz: Em nome do Pai, do Filho e do Espírito Santo. Amém.', 'Reze o Credo.', 'Reze um Pai-Nosso.', 'Reze três Ave-Marias, pela fé, esperança e caridade.', 'Reze o Glória ao Pai.', ...rosary.mysteries.flatMap(m => [`${m.title}. ${m.contemplation}`, 'Reze um Pai-Nosso.', ...Array.from({length: 10}, (_, i) => `Ave-Maria ${i+1} de 10.`), 'Reze o Glória ao Pai.']), 'Reze a Salve-Rainha e conclua com o Sinal da Cruz.'];
  const save = () => {
    if (!user) return;
    const date = format(new Date(), 'yyyy-MM-dd');
    const existing = getAllItems<SpiritualActivity>('spiritual', user.id).find(a => a.type === 'rosary' && a.date === date && a.title === rosary.mysteryName);
    if (existing) updateItem<SpiritualActivity>('spiritual', user.id, existing.id, { completed: true });
    else createItem<SpiritualActivity>('spiritual', user.id, { user_id: user.id, type: 'rosary', title: rosary.mysteryName, date, completed: true, private: true });
    setMessage('Terço registrado no diário espiritual.');
  };
  return <Card title="Guia do Santo Rosário" subtitle={rosary.mysteryName}>
    <label className="rosary-selection">Mistérios <select className="input" value={mystery} onChange={e => { setMystery(e.target.value); setStep(0); setMessage(''); }}><option value="today">Tradicionais de hoje</option>{Object.keys(allRosaryMysteries).map(k => <option key={k} value={k}>{allRosaryMysteries[k].mysteryName}</option>)}</select></label>
    <p aria-live="polite">Etapa {step+1} de {steps.length}: {steps[step]}</p><progress value={step+1} max={steps.length} aria-label="Progresso da oração" />
    <details><summary>Textos das orações</summary>
      <p><strong>Pai-Nosso:</strong> Pai nosso que estais nos céus, santificado seja o vosso nome; venha a nós o vosso reino; seja feita a vossa vontade, assim na terra como no céu. O pão nosso de cada dia nos dai hoje; perdoai-nos as nossas ofensas, assim como nós perdoamos a quem nos tem ofendido; e não nos deixeis cair em tentação, mas livrai-nos do mal. Amém.</p>
      <p><strong>Ave-Maria:</strong> Ave Maria, cheia de graça, o Senhor é convosco. Bendita sois vós entre as mulheres, e bendito é o fruto do vosso ventre, Jesus. Santa Maria, Mãe de Deus, rogai por nós, pecadores, agora e na hora de nossa morte. Amém.</p>
      <p><strong>Glória:</strong> Glória ao Pai, ao Filho e ao Espírito Santo. Como era no princípio, agora e sempre. Amém.</p>
      <p><strong>Credo:</strong> Creio em Deus Pai todo-poderoso, criador do céu e da terra. E em Jesus Cristo, seu único Filho, nosso Senhor, que foi concebido pelo poder do Espírito Santo; nasceu da Virgem Maria; padeceu sob Pôncio Pilatos, foi crucificado, morto e sepultado; desceu à mansão dos mortos; ressuscitou ao terceiro dia; subiu aos céus; está sentado à direita de Deus Pai todo-poderoso, donde há de vir a julgar os vivos e os mortos. Creio no Espírito Santo; na santa Igreja Católica; na comunhão dos santos; na remissão dos pecados; na ressurreição da carne; na vida eterna. Amém.</p>
      <p><strong>Salve-Rainha:</strong> Salve, Rainha, mãe de misericórdia, vida, doçura e esperança nossa, salve! A vós bradamos, os degredados filhos de Eva. A vós suspiramos, gemendo e chorando neste vale de lágrimas. Eia, pois, advogada nossa, esses vossos olhos misericordiosos a nós volvei. E depois deste desterro, mostrai-nos Jesus, bendito fruto do vosso ventre. Ó clemente, ó piedosa, ó doce sempre Virgem Maria. Rogai por nós, santa Mãe de Deus, para que sejamos dignos das promessas de Cristo. Amém.</p>
    </details>
    <div className="smart-actions"><Button variant="outline" disabled={step === 0} onClick={() => setStep(s => s-1)}>Anterior</Button>{step < steps.length-1 ? <Button onClick={() => setStep(s => s+1)}>Próxima conta</Button> : <Button onClick={save}>Concluir e registrar</Button>}<Button variant="ghost" onClick={() => { setStep(0); setMessage(''); }}>Recomeçar</Button></div><p role="status">{message}</p>
  </Card>;
}
