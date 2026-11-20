export function CityPreview() {
  return (
    <section className="map-panel" aria-labelledby="map-title">
      <div className="panel-heading"><div><span className="eyebrow">SPATIAL CONTEXT</span><h2 id="map-title">City workspace</h2></div><span className="badge">Illustration</span></div>
      <svg className="city-map" viewBox="0 0 600 350" role="img" aria-label="Illustrative city districts divided by a river. This is not geographic data.">
        <defs><pattern id="blocks" width="48" height="40" patternUnits="userSpaceOnUse"><rect width="48" height="40" fill="#e9eee7"/><rect x="5" y="5" width="36" height="28" rx="3" fill="#dbe3d8"/></pattern></defs>
        <rect width="600" height="350" fill="url(#blocks)"/>
        <path d="M-20 230 C130 115 235 310 360 190 S520 135 630 70" fill="none" stroke="#b6d8df" strokeWidth="48"/>
        <g fill="none" stroke="#fafbf5" strokeWidth="12"><path d="M70 0 L170 350 M300 0 L260 350 M510 0 L440 350 M0 90 L600 285 M0 300 L600 35"/></g>
        <g fill="none" stroke="#a8b9a8" strokeWidth="2" strokeDasharray="6 6"><path d="M5 35 L210 15 L225 135 L100 150 Z M340 28 L565 10 L580 95 L390 150 Z M320 255 L540 200 L585 325 L330 335 Z"/></g>
        <g fill="#47604f" fontFamily="system-ui" fontSize="11" letterSpacing="2"><text x="76" y="65">NORTH DISTRICT</text><text x="390" y="65">EAST DISTRICT</text><text x="366" y="300">SOUTH DISTRICT</text></g>
        <g fill="#246b57" stroke="white" strokeWidth="4"><circle cx="175" cy="117" r="9"/><circle cx="417" cy="130" r="9"/><circle cx="350" cy="275" r="9"/></g>
        <g fill="#446674" fontSize="12" fontFamily="system-ui"><text x="225" y="218" transform="rotate(12 225 218)">River</text><text x="565" y="32">N &#8593;</text></g>
      </svg>
      <div className="map-caption"><span><i className="legend-dot"/> Indicative facilities</span><span>Not to scale</span></div>
      <p className="muted small">Illustrative layout only. Live map data has not been connected.</p>
    </section>
  )
}
