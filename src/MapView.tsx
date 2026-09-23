import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { BusRoute, LatLng, RouteStop, routes } from './data/routes';
import { MapContainer, Marker, Polyline, Popup, TileLayer, CircleMarker, ZoomControl, ScaleControl, useMap } from 'react-leaflet';
import { ArrowUpRight, LocateFixed, X } from 'lucide-react';

const DEMO_LOCATION: LatLng = [39.2364, -8.6848];
const initialView: LatLng = [39.2358, -8.6828];

function routeDistance(a: LatLng, b: LatLng) {
  const rad = Math.PI / 180;
  const dLat = (b[0] - a[0]) * rad;
  const dLng = (b[1] - a[1]) * rad;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat + Math.cos(a[0] * rad) * Math.cos(b[0] * rad) * sinLng * sinLng;
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function makeBusIcon(color: string, selected: boolean) {
  return L.divIcon({
    className: 'bus-track-leaflet-icon',
    html: `<span class="map-bus-glyph${selected?' is-selected':''}" style="--bus-color:${color}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 17V6.8C5 5.25 6.25 4 7.8 4h8.4C17.75 4 19 5.25 19 6.8V17M5 11h14M7.5 14.5h.01M16.5 14.5h.01M8 19v-2m8 2v-2M8 7h8" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -16]
  });
}

function pointAtDistance(points: LatLng[], cumulative: number[], distance: number): LatLng {
  let index = 0;
  while (index < cumulative.length - 2 && cumulative[index + 1] < distance) index++;
  const segment = cumulative[index + 1] - cumulative[index];
  const fraction = segment === 0 ? 0 : (distance - cumulative[index]) / segment;
  return [
    points[index][0] + (points[index + 1][0] - points[index][0]) * fraction,
    points[index][1] + (points[index + 1][1] - points[index][1]) * fraction
  ];
}

function BusMarker({ line, selected, onSelect, showEta }: { line: BusRoute; selected: boolean; onSelect: () => void; showEta: boolean }) {
  const lengths = useMemo(() => {
    const result = [0];
    for (let i = 1; i < line.coordinates.length; i++) result.push(result[i - 1] + routeDistance(line.coordinates[i - 1], line.coordinates[i]));
    return result;
  }, [line]);
  const total = lengths[lengths.length - 1];
  const start = useRef(Date.now());
  const initialDistance = total * (line.id === '12' ? .22 : line.id === '4' ? .41 : .61);
  const [progress, setProgress] = useState(initialDistance);
  const [position, setPosition] = useState<LatLng>(() => pointAtDistance(line.coordinates, lengths, initialDistance));
  const stopProgress = useMemo(() => line.stops.map(stop => { let best = Infinity, at = 0; for (let i = 0; i < line.coordinates.length; i++) { const distance = routeDistance(stop.coordinates, line.coordinates[i]); if (distance < best) { best = distance; at = lengths[i] } } return at }), [lengths, line]);
  const nextIndex = stopProgress.findIndex(at => at > progress + 35);
  const nextStop = line.stops[nextIndex < 0 ? 0 : nextIndex];
  useEffect(() => {
    const tick = () => {
      const travelled = ((Date.now() - start.current) / 1000) * 4.5;
      const currentProgress = (initialDistance + travelled) % total;
      setProgress(currentProgress);
      setPosition(pointAtDistance(line.coordinates, lengths, currentProgress));
    };
    const timer = window.setInterval(tick, 1200);
    return () => window.clearInterval(timer);
  }, [lengths, line, total]);
  return <Marker position={position} icon={makeBusIcon(line.color, selected)} eventHandlers={{ click: onSelect }} zIndexOffset={800}>
    <Popup className="bus-track-popup">
      <div className="map-popup"><div className="map-popup-title"><span className="popup-line-dot" style={{ background: line.color }} /><strong>{line.name}</strong>{showEta&&<span className="popup-time">{line.time} min</span>}</div><span>Próxima paragem: {nextStop.name}</span><small>Posição e chegada simuladas</small><button onClick={onSelect}>Ver detalhes da linha <ArrowUpRight size={13} /></button></div>
    </Popup>
  </Marker>;
}

function StopMarker({ stop, available, onSelect }: { stop: RouteStop; available: BusRoute[]; onSelect: (line: BusRoute) => void }) {
  return <CircleMarker center={stop.coordinates} radius={6} pathOptions={{ color: '#fff', weight: 2.5, fillColor: '#172321', fillOpacity: 1 }}>
    <Popup className="bus-track-popup">
      <div className="map-popup"><div className="section-kicker">PARAGEM</div><strong>{stop.name}</strong><div className="popup-arrivals">{available.map(line => <button key={line.id} onClick={() => onSelect(line)}><span className="popup-line-dot" style={{ background: line.color }} />{line.name}<b>{line.time} min</b></button>)}</div><small>Próximas chegadas simuladas</small></div>
    </Popup>
  </CircleMarker>;
}

function MapTools() {
  const map = useMap();
  return <div className="leaflet-locate-control"><button type="button" aria-label="Centrar na localização de demonstração" title="A minha localização de demonstração" onClick={() => map.flyTo(DEMO_LOCATION, 15, { duration: .5 })}><LocateFixed size={17} /></button></div>;
}

function ResizeMap({ expanded }: { expanded: boolean }) {
  const map = useMap();
  useEffect(() => {
    const timer = window.setTimeout(() => map.invalidateSize({ pan: false }), 100);
    return () => window.clearTimeout(timer);
  }, [expanded, map]);
  return null;
}

type MobilityPreferences = { favoritesOnly: boolean; nearbyStops: boolean; showEta: boolean; showLocation: boolean };
export default function SantaremMap({ selectedLine, onSelectLine, expanded, onToggleExpanded, favoriteLines = [], mobility = { favoritesOnly: false, nearbyStops: true, showEta: true, showLocation: true } }: { selectedLine: string; onSelectLine: (id: string) => void; expanded: boolean; onToggleExpanded: () => void; favoriteLines?: string[]; mobility?: MobilityPreferences }) {
  const visibleRoutes = mobility.favoritesOnly ? routes.filter(line => favoriteLines.includes(line.id)) : routes;
  const bounds = useMemo(() => {
    const positions = routes.flatMap(line => line.coordinates.map(([lat, lng]) => L.latLng(lat, lng)));
    positions.push(L.latLng(39.219, -8.645)); // Rio Tejo, extent anchor only; route is not drawn here.
    return L.latLngBounds(positions);
  }, []);
  const selectRoute = (line: BusRoute) => onSelectLine(line.id);
  const allStops = useMemo(() => {
    const map = new Map<string, RouteStop>();
    for (const line of routes) for (const stop of line.stops) if (!map.has(stop.id)) map.set(stop.id, stop);
    return [...map.values()];
  }, []);
  return <div className={'map '+(expanded?'map-expanded':'')}>
    <MapContainer center={initialView} zoom={13} scrollWheelZoom zoomControl={false} className="leaflet-map">
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} />
      <ZoomControl position="topright" />
      <ScaleControl position="bottomleft" imperial={false} />
      <ResizeMap expanded={expanded} />
      <BoundsFitter bounds={bounds} />
      {visibleRoutes.map(line => <Fragment key={line.id}>
        <Polyline positions={line.coordinates} pathOptions={{ color: '#fff', weight: selectedLine === line.id ? 11 : 8, opacity: .95, lineCap: 'round', lineJoin: 'round' }} eventHandlers={{ click: () => selectRoute(line) }} />
        <Polyline positions={line.coordinates} pathOptions={{ color: line.color, weight: selectedLine === line.id ? 6.5 : 4.5, opacity: selectedLine === line.id ? .96 : .78, lineCap: 'round', lineJoin: 'round' }} eventHandlers={{ click: () => selectRoute(line) }} />
      </Fragment>)}
      {mobility.nearbyStops && allStops.map(stop => <StopMarker key={stop.id} stop={stop} available={visibleRoutes.filter(line => line.stops.some(item => item.id === stop.id))} onSelect={selectRoute} />)}
      {visibleRoutes.map(line => <BusMarker key={line.id} line={line} selected={selectedLine === line.id} onSelect={() => selectRoute(line)} showEta={mobility.showEta} />)}
      {mobility.showLocation && <><CircleMarker center={DEMO_LOCATION} radius={17} pathOptions={{ color: '#3987f5', weight: 0, fillColor: '#3987f5', fillOpacity: .16 }} />
      <CircleMarker center={DEMO_LOCATION} radius={6} pathOptions={{ color: '#fff', weight: 2.5, fillColor: '#3987f5', fillOpacity: 1 }}>
        <Popup><div className="map-popup"><div className="section-kicker">LOCALIZAÇÃO</div><strong>Centro de Santarém</strong><small>Posição fixa de demonstração; não usa GPS.</small></div></Popup>
      </CircleMarker></>}
      <MapTools />
    </MapContainer>
    <button className="map-full-toggle" type="button" onClick={onToggleExpanded} aria-label={expanded?'Fechar mapa completo':'Ver mapa completo'}>{expanded?<><X size={15}/> Fechar mapa</>:<>Ver mapa completo <ArrowUpRight size={14}/></>}</button>
    <div className="map-disclaimer">Rotas e veículos de demonstração · Cartografia © OpenStreetMap</div>
  </div>;
}

function BoundsFitter({ bounds }: { bounds: L.LatLngBounds }) {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (fitted.current) return;
    map.fitBounds(bounds, { padding: [24, 24], maxZoom: 14 });
    fitted.current = true;
  }, [bounds, map]);
  return null;
}

