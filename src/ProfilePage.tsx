import { useState } from 'react';
import { Bus, Bell, MapPin, Star, Palette, RotateCcw, X, Check, Route, Clock } from 'lucide-react';
import { usePreferences } from './preferences/PreferencesContext';
import { useTransportData } from './services/TransportContext';
import TravelHistory from './TravelHistory';
import { MyTickets } from './TicketsPage';
import PassEligibility from './PassEligibility';

const avatars = ['🙂','👩🏻','👨🏽','🧑🏿','👩🏽','🧔🏻'];
const themes = [{id:'green', label:'Verde suave', color:'#19a879'}, {id:'blue', label:'Azul suave', color:'#4c8dff'}, {id:'pink', label:'Rosa suave', color:'#f28bc8'}] as const;
const colors = [{label:'Verde',value:'#19a879'}, {label:'Azul',value:'#4c8dff'}, {label:'Rosa',value:'#f28bc8'}];

export default function ProfilePage({ notify }: { notify:(text:string)=>void }) {
  const {preferences:p, update, toggleLine, toggleStop, reset} = usePreferences();
  const { routes, stops } = useTransportData();
  const [editing,setEditing]=useState(false), [confirmReset,setConfirmReset]=useState(false), [draftName,setDraftName]=useState(p.name), [draftAvatar,setDraftAvatar]=useState(p.avatar);
  const [approach,setApproach]=[p.notifications.approaching,(v:boolean)=>update({notifications:{...p.notifications,approaching:v}})] as const;
  const [changes,setChanges]=[p.notifications.serviceChanges,(v:boolean)=>update({notifications:{...p.notifications,serviceChanges:v}})] as const;
  const [reminders,setReminders]=[p.notifications.favoriteReminders,(v:boolean)=>update({notifications:{...p.notifications,favoriteReminders:v}})] as const;
  const [favoritesOnly,setFavoritesOnly]=[p.mobilityPreferences.favoritesOnly,(v:boolean)=>update({mobilityPreferences:{...p.mobilityPreferences,favoritesOnly:v}})] as const;
  const [nearby,setNearby]=[p.mobilityPreferences.nearbyStops,(v:boolean)=>update({mobilityPreferences:{...p.mobilityPreferences,nearbyStops:v}})] as const;
  const [eta,setEta]=[p.mobilityPreferences.showEta,(v:boolean)=>update({mobilityPreferences:{...p.mobilityPreferences,showEta:v}})] as const;
  const [location,setLocation]=[p.mobilityPreferences.showLocation,(v:boolean)=>update({mobilityPreferences:{...p.mobilityPreferences,showLocation:v}})] as const;
  const toggle = (label:string, checked:boolean, change:(v:boolean)=>void) => <label className="pref-toggle"><span>{label}</span><input type="checkbox" checked={checked} onChange={e=>change(e.target.checked)}/><i aria-hidden="true"/></label>;
  return <section className="page-panel profile-page">
    <div className="eyebrow">O TEU ESPAÇO</div><h1>Este é o teu <em>Bus Track.</em></h1><p>Olá, {p.name}. Personaliza a aplicação ao teu ritmo.</p>
    <div className="profile-identity"><div className="avatar-large">{p.avatar}</div><div><h2>{p.name}</h2><p>As tuas escolhas ficam guardadas neste dispositivo.</p></div><button className="secondary-btn" onClick={()=>{setDraftName(p.name);setDraftAvatar(p.avatar);setEditing(true)}}>Editar perfil</button></div>
    <PassEligibility />
    <div className="profile-grid">
      <section className="pref-card"><h2>O teu avatar</h2><p>Escolhe a imagem que te representa.</p><div className="avatar-picker">{avatars.map(a=><button aria-label={`Escolher avatar ${a}`} className={p.avatar===a?'chosen-avatar':''} onClick={()=>{update({avatar:a});notify('Avatar atualizado.')}} key={a}>{a}</button>)}</div></section>
      <section className="pref-card"><h2>Cor do teu autocarro</h2><p>Uma preferência pessoal, só tua.</p><div className="color-picker">{colors.map(c=><button className={p.busColor===c.value?'picked':''} onClick={()=>{update({busColor:c.value});notify('Cor pessoal atualizada.')}} key={c.value}><i style={{background:c.value}}/>{c.label}{p.busColor===c.value&&<Check size={15}/>}</button>)}</div><div className="live-preview"><span className="preview-avatar">{p.avatar}</span><span className="preview-bus" style={{background:p.busColor}}><Bus size={19}/></span><div><b>Linha 12</b><small>Rodoviária → Hospital</small></div><strong><Clock size={14}/> 4 min</strong></div></section>
      <section className="pref-card"><h2><Palette size={17}/> Tema da aplicação</h2><p>Uma tonalidade suave para toda a aplicação.</p><div className="theme-options">{themes.map(t=><button className={p.theme===t.id?'selected':''} onClick={()=>update({theme:t.id})} key={t.id}><i style={{background:t.color}}/>{t.label}{p.theme===t.id&&<Check size={15}/>}</button>)}</div></section>
      <section className="pref-card"><h2><Star size={17}/> As tuas linhas</h2><p>Guarda as linhas que queres acompanhar.</p><div className="choice-list">{routes.map(line=><label key={line.id}><input type="checkbox" checked={p.favoriteLines.includes(line.id)} onChange={()=>toggleLine(line.id)}/><i style={{background:line.color}}/><span>{line.name}<small>{line.displayRoute}</small></span></label>)}</div></section>
      <section className="pref-card"><h2><MapPin size={17}/> Paragens favoritas</h2><p>Paragens guardadas para acesso rápido.</p><div className="choice-list stops-choice">{stops.map(stop=><label key={stop.id}><input type="checkbox" checked={p.favoriteStops.includes(stop.id)} onChange={()=>toggleStop(stop.id)}/><span>{stop.name}</span></label>)}</div></section>
      <section className="pref-card"><h2><Bell size={17}/> Alertas</h2><p>Escolhe os avisos que queres receber na aplicação.</p>{toggle('Autocarro a aproximar-se',approach,setApproach)}{toggle('Alterações de serviço',changes,setChanges)}{toggle('Lembretes das linhas favoritas',reminders,setReminders)}<small className="pref-hint">Os alertas são preferências locais; não são enviadas notificações push.</small></section>
      <section className="pref-card"><h2><Route size={17}/> Preferências de mobilidade</h2><p>Decide o que aparece no mapa e nos resultados.</p>{toggle('Mostrar apenas linhas favoritas',favoritesOnly,setFavoritesOnly)}{toggle('Mostrar paragens próximas',nearby,setNearby)}{toggle('Mostrar tempos de chegada',eta,setEta)}{toggle('Mostrar localização de demonstração',location,setLocation)}</section>
      <section className="pref-card"><h2>Unidade de distância</h2><p>Escolhe a unidade usada pela aplicação.</p><div className="unit-choice"><button className={p.distanceUnit==='km'?'selected':''} onClick={()=>update({distanceUnit:'km'})}>Quilómetros (km)</button><button className={p.distanceUnit==='m'?'selected':''} onClick={()=>update({distanceUnit:'m'})}>Metros (m)</button></div></section>
    </div>
    <button className="reset-link" onClick={()=>setConfirmReset(true)}><RotateCcw size={15}/> Repor todas as preferências</button>
    <TravelHistory />
    <MyTickets />
    {editing&&<div className="profile-modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setEditing(false)}}><section className="profile-modal" role="dialog" aria-modal="true" aria-labelledby="edit-profile-title"><button className="modal-close" aria-label="Fechar" onClick={()=>setEditing(false)}><X size={18}/></button><h2 id="edit-profile-title">Editar perfil</h2><label className="name-field">O teu nome<input maxLength={36} value={draftName} onChange={e=>setDraftName(e.target.value)} placeholder="Como te chamamos?"/></label><div className="avatar-picker">{avatars.map(a=><button className={draftAvatar===a?'chosen-avatar':''} onClick={()=>setDraftAvatar(a)} key={a}>{a}</button>)}</div><div className="modal-actions"><button className="secondary-btn" onClick={()=>setEditing(false)}>Cancelar</button><button className="primary-btn" onClick={()=>{update({name:draftName.trim()||'Viajante',avatar:draftAvatar});setEditing(false);notify('Perfil guardado.')}}>Guardar alterações</button></div></section></div>}
    {confirmReset&&<div className="profile-modal-backdrop"><section className="profile-modal" role="alertdialog" aria-modal="true"><h2>Repor preferências?</h2><p>O nome, avatar, tema, cores, favoritos e opções voltarão aos valores iniciais.</p><div className="modal-actions"><button className="secondary-btn" onClick={()=>setConfirmReset(false)}>Cancelar</button><button className="danger-btn" onClick={()=>{reset();setConfirmReset(false);notify('Preferências repostas.')}}>Repor tudo</button></div></section></div>}
  </section>;
}
