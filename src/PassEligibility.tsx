import { useState } from 'react';
import { BadgeCheck, Bell, CalendarDays, GraduationCap, RefreshCw, ShieldCheck, Wallet } from 'lucide-react';

type Scenario = 'eligible' | 'near-limit' | 'validation' | 'ineligible' | 'paid';
const scenarios: { id: Scenario; label: string }[] = [
  { id: 'eligible', label: 'Elegível' }, { id: 'near-limit', label: 'Elegibilidade próxima do fim' },
  { id: 'validation', label: 'Validação necessária' }, { id: 'ineligible', label: 'Não elegível' }, { id: 'paid', label: 'Passe pago' },
];

export default function PassEligibility() {
  const [scenario, setScenario] = useState<Scenario>('eligible');
  const [renewed, setRenewed] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [notice, setNotice] = useState('');
  const free = scenario !== 'paid';
  const renewFree = () => { setRenewed(true); setNotice('Passe gratuito renovado na demonstração. Não foi solicitado qualquer pagamento.'); };
  return <section className="pass-area" aria-labelledby="pass-area-title">
    <header className="pass-area-heading"><div><div className="section-kicker">PASSES E BENEFÍCIOS</div><h2 id="pass-area-title">O meu passe</h2><p>Consulta o estado, a elegibilidade e as condições do teu passe.</p></div><span className="pass-demo-pill">DEMONSTRAÇÃO</span></header>
    <label className="pass-scenario">Cenário de demonstração<select value={scenario} onChange={e => { setScenario(e.target.value as Scenario); setRenewed(false); setRequestSent(false); setNotice(''); }} aria-label="Escolher cenário de demonstração">{scenarios.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
    <article className={'pass-card ' + (scenario === 'ineligible' ? 'pass-ineligible' : '')}>
      <div className="pass-card-top"><span className="pass-icon">{free ? <GraduationCap size={20}/> : <Wallet size={20}/>}</span><div><small>MEU PASSE</small><h3>{free ? 'Passe Gratuito' : 'Passe Mensal'}</h3></div><b className="pass-price">{free ? '0,00 €' : '30,00 €'}</b></div>
      <div className="pass-state-row"><span>Estado</span><b className={'pass-state '+(scenario==='validation'?'pending':scenario==='ineligible'?'inactive':'')}>{scenario==='eligible'||scenario==='near-limit'?(renewed?'Renovado · demonstração':'Ativo · elegível'):scenario==='validation'?(requestSent?'Pedido de validação enviado':'A aguardar validação'):scenario==='ineligible'?'Benefício indisponível':'Ativo · pago'}</b></div>
      <div className="pass-details-grid"><div><small>Motivo</small><b>{free?'Utilizador até aos 25 anos (regra simulada)':'Passe mensal adquirido'}</b></div><div><small>Validade do passe</small><b>{renewed?'31/01/2027':scenario==='paid'?'31/10/2026':'30/09/2026'}</b></div><div><small>Elegibilidade até</small><b>{scenario==='near-limit'?'30/09/2026':'31/12/2026 · exemplo'}</b></div><div><small>Documentação / pedidos</small><b>{scenario==='validation'?(requestSent?'Pedido enviado · em análise':'Comprovativo de elegibilidade necessário'):'Sem documentação pendente'}</b></div></div>
      {scenario==='eligible'&&<div className="pass-message success"><BadgeCheck size={17}/><div><b>Passe gratuito · elegível</b><span>Renovação a €0,00. Não é necessário efetuar qualquer pagamento.</span></div></div>}
      {scenario==='near-limit'&&<div className="pass-message info"><CalendarDays size={17}/><div><b>A elegibilidade atual termina em breve</b><span>Confirma os requisitos oficiais para saber se podes continuar a beneficiar. Não aplicamos automaticamente um limite de idade.</span></div></div>}
      {scenario==='validation'&&<div className="pass-message pending"><ShieldCheck size={17}/><div><b>É necessária uma atualização dos teus dados</b><span>Precisamos de confirmar que continuas a cumprir os critérios. Os documentos e critérios oficiais ainda não estão ligados.</span></div></div>}
      {scenario==='ineligible'&&<div className="pass-message warning"><Bell size={17}/><div><b>O teu passe gratuito já não está disponível</b><span>Os critérios deixaram de estar cumpridos segundo este cenário simulado. Consulta as opções de transporte disponíveis.</span></div></div>}
      {scenario==='paid'&&<div className="pass-message info"><Wallet size={17}/><div><b>Passe pago</b><span>Preço ilustrativo: 30,00 €. Um fluxo de pagamento só será apresentado quando houver integração oficial.</span></div></div>}
      <div className="pass-actions">{scenario==='eligible'&&<button className="primary-btn" onClick={renewFree}><RefreshCw size={15}/>{renewed?'Passe renovado':'Renovar passe · €0,00'}</button>}{scenario==='near-limit'&&<button className="secondary-btn" onClick={()=>setNotice('Informação oficial sobre a continuidade do benefício ainda não está disponível na demonstração.')} >Consultar requisitos</button>}{scenario==='validation'&&<button className="primary-btn" onClick={()=>{setRequestSent(true);setNotice('Pedido de atualização guardado localmente para demonstração.')}}>{requestSent?'Pedido enviado':'Atualizar dados / enviar documentação'}</button>}{scenario==='ineligible'&&<button className="secondary-btn" onClick={()=>setNotice('Consulta os passes e tarifas ilustrativos na área Bilhetes.')}>Ver outros passes e tarifas</button>}{scenario==='paid'&&<button className="secondary-btn" onClick={()=>setNotice('A renovação paga não está ligada a um sistema de pagamento.')}>Renovar passe pago</button>}</div>
      {notice&&<p className="pass-notice" role="status">{notice}</p>}
    </article>
    <aside className="pass-official-note"><ShieldCheck size={16}/><span>Elegibilidade, validade, renovação e notificações são dados fictícios neste protótipo. A decisão e qualquer passe real têm de ser confirmados pelos sistemas oficiais da entidade responsável. As notificações abaixo são apresentadas nesta página; não são enviadas por push.</span></aside>
    <div className="pass-notification-list"><h3><Bell size={16}/> Notificações do passe</h3><p>🎉 Elegibilidade confirmada · O passe gratuito está ativo.</p><p>🎫 Renovação disponível · Podes renovar diretamente na aplicação.</p><p>⚠️ Validação necessária · Confirma os teus dados para manter o benefício.</p><p>ℹ️ Elegibilidade próxima do fim · Consulta as condições oficiais.</p></div>
  </section>;
}
