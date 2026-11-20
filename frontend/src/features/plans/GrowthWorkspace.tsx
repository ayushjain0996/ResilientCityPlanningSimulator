import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { CityPreview } from '../../components/CityPreview'
import type { Role } from './catalogue'

type GrowthDraft = {
  name: string
  city: string
  population: string
  assumptions: string
  seed: string
  horizons: number[]
}

const INITIAL_DRAFT: GrowthDraft = {
  name: '', city: 'Dublin', population: '', assumptions: '', seed: '42', horizons: [5, 10, 20],
}

export function GrowthWorkspace({ role, isPreview = true }: { role: Role; isPreview?: boolean }) {
  const [draft, setDraft] = useState<GrowthDraft>(INITIAL_DRAFT)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [review, setReview] = useState<GrowthDraft | null>(null)
  const [downloadError, setDownloadError] = useState('')
  const reviewRef = useRef<HTMLElement>(null)
  const readOnly = role !== 'PLANNER'

  useEffect(() => { if (review) reviewRef.current?.focus() }, [review])

  function update<K extends keyof GrowthDraft>(key: K, value: GrowthDraft[K]) {
    setDraft({ ...draft, [key]: value })
    setReview(null)
    setErrors({})
    setDownloadError('')
  }

  function reviewInputs(event: FormEvent) {
    event.preventDefault()
    if (readOnly) return
    const issues: Record<string, string> = {}
    if (!draft.name.trim()) issues.name = 'Enter a plan name.'
    if (!draft.city.trim()) issues.city = 'Enter a city.'
    if (!/^\d+$/.test(draft.population) || !Number.isSafeInteger(Number(draft.population))
      || Number(draft.population) <= 0) issues.population = 'Enter a positive whole population.'
    if (!draft.assumptions.trim()) issues.assumptions = 'Describe your population assumptions.'
    if (!/^\d+$/.test(draft.seed) || !Number.isSafeInteger(Number(draft.seed))) {
      issues.seed = 'Enter a whole seed from 0 to 9007199254740991.'
    }
    if (!draft.horizons.length) issues.horizons = 'Choose at least one growth horizon.'
    setErrors(issues)
    setReview(Object.keys(issues).length ? null : {
      ...draft, name: draft.name.trim(), city: draft.city.trim(), assumptions: draft.assumptions.trim(),
    })
  }

  function downloadInputs(inputs: GrowthDraft) {
    setDownloadError('')
    try {
      const blob = new Blob([JSON.stringify({
        formatVersion: 1,
        kind: 'local-growth-inputs',
        planName: inputs.name,
        city: inputs.city,
        population: Number(inputs.population),
        assumptions: inputs.assumptions,
        seed: inputs.seed,
        horizons: inputs.horizons,
        notice: 'Local inputs only. No simulation has been run and no server record has been created.',
      }, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'growth-inputs.json'
      document.body.append(link)
      try { link.click() }
      finally { link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000) }
    } catch {
      setDownloadError('Unable to download inputs in this browser. Copy the reviewed values before leaving the page.')
    }
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">PLANNING WORKSPACE / UC-01</p>
          <h1>Plan for a more resilient city.</h1>
          <p className="muted">Explore future growth. Start with the assumptions behind your plan.</p>
        </div>
        <span className="badge accent">Input workspace</span>
      </div>
      <ol className="steps" aria-label="Input preparation stages">
        <li className="current"><span>01</span> Configure inputs</li>
        <li><span>02</span> Review inputs</li>
        <li><span>03</span> Download inputs</li>
      </ol>
      {readOnly && <p className="notice" role="status">
        {isPreview
          ? 'Read-only preview. Only the Planner can configure inputs. Role selection is a demonstration, not authentication.'
          : 'Read-only access. Only the Planner can configure inputs.'}
      </p>}
      <div className="workspace-grid">
        <section className="panel" aria-labelledby="config-title">
          <div className="panel-heading">
            <div><span className="eyebrow">ASSESSMENT SETUP</span><h2 id="config-title">Phased urban growth</h2></div>
            <span className="badge">Draft</span>
          </div>
          <form onSubmit={reviewInputs} noValidate>
            <fieldset disabled={readOnly} className="fields">
              <legend className="sr-only">Growth inputs</legend>
              <label htmlFor="plan-name">Plan name</label>
              <input id="plan-name" maxLength={120} placeholder="e.g. Dublin growth assessment"
                value={draft.name} onChange={event => update('name', event.target.value)}
                aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined}/>
              {errors.name && <p id="name-error" className="field-error">{errors.name}</p>}
              <div className="field-row">
                <div>
                  <label htmlFor="city">City</label>
                  <input id="city" maxLength={100} value={draft.city} onChange={event => update('city', event.target.value)}
                    aria-invalid={!!errors.city} aria-describedby={errors.city ? 'city-error' : undefined}/>
                  {errors.city && <p id="city-error" className="field-error">{errors.city}</p>}
                </div>
                <div>
                  <label htmlFor="population">Current population</label>
                  <input id="population" inputMode="numeric" placeholder="e.g. 50000" value={draft.population}
                    onChange={event => update('population', event.target.value)} aria-invalid={!!errors.population}
                    aria-describedby={errors.population ? 'population-error' : undefined}/>
                  {errors.population && <p id="population-error" className="field-error">{errors.population}</p>}
                </div>
              </div>
              <fieldset className="horizons" aria-describedby={errors.horizons ? 'horizons-error' : undefined}>
                <legend>Growth horizons</legend>
                <div className="horizon-options">
                  {[5, 10, 20].map(year => <label key={year} className={draft.horizons.includes(year) ? 'selected' : ''}>
                    <input type="checkbox" checked={draft.horizons.includes(year)} onChange={() => update('horizons',
                      draft.horizons.includes(year)
                        ? draft.horizons.filter(value => value !== year)
                        : [...draft.horizons, year].sort((a, b) => a - b))}/>
                    {year} years
                  </label>)}
                </div>
                {errors.horizons && <p id="horizons-error" className="field-error">{errors.horizons}</p>}
              </fieldset>
              <label htmlFor="assumptions">Population assumptions</label>
              <textarea id="assumptions" rows={3} maxLength={2000}
                placeholder="Describe expected growth and the source of your assumptions." value={draft.assumptions}
                onChange={event => update('assumptions', event.target.value)} aria-invalid={!!errors.assumptions}
                aria-describedby={errors.assumptions ? 'assumptions-error' : undefined}/>
              {errors.assumptions && <p id="assumptions-error" className="field-error">{errors.assumptions}</p>}
              <label htmlFor="seed">Random seed</label>
              <input id="seed" inputMode="numeric" value={draft.seed} onChange={event => update('seed', event.target.value)}
                aria-invalid={!!errors.seed} aria-describedby="seed-help seed-error"/>
              <p id="seed-help" className="small muted">Keep the same seed when comparing growth horizons.</p>
              <p id="seed-error" className="field-error">{errors.seed}</p>
              <div className="form-footer">
                <span className="small muted">All fields are required.</span>
                <button className="primary" type="submit">Review inputs <span aria-hidden="true">&rarr;</span></button>
              </div>
            </fieldset>
            {Object.keys(errors).length > 0 && <p role="alert" className="field-error">
              Check the highlighted inputs before continuing.
            </p>}
          </form>
        </section>
        <aside className="context-column">
          <CityPreview/>
          <section className="guidance">
            <span className="eyebrow">BEFORE YOU BEGIN</span>
            <h2>Good plans start with clear inputs.</h2>
            <p>Compare 5, 10 and 20-year horizons to explore future infrastructure and service capacity.</p>
            <ul>
              <li>Document assumptions for later review.</li>
              <li>Keep an explicit seed for reproducibility.</li>
              <li>Check data availability before drawing conclusions.</li>
            </ul>
            <div className="guidance-note">Prepare, review and download your inputs.<br/>
              Simulation and server records are outside this checkpoint.
            </div>
          </section>
        </aside>
      </div>
      {review && <section className="panel review-panel" aria-labelledby="review-title"
        role="region" tabIndex={-1} ref={reviewRef}>
        <span className="eyebrow">LOCAL PREVIEW</span><h2 id="review-title">Input review</h2>
        <p role="status">Inputs checked in this browser. No simulation has been started and no plan has been saved.</p>
        <dl>
          <div><dt>Plan</dt><dd>{review.name}</dd></div>
          <div><dt>City</dt><dd>{review.city}</dd></div>
          <div><dt>Current population</dt><dd>{Number(review.population).toLocaleString('en-IE')}</dd></div>
          <div><dt>Growth horizons</dt><dd>{review.horizons.join(', ')} years</dd></div>
          <div><dt>Random seed</dt><dd>{review.seed}</dd></div>
          <div><dt>Assumptions</dt><dd>{review.assumptions}</dd></div>
        </dl>
        <p className="small muted">Server validation and real map data are required before a simulation can run.
          Refreshing the page or signing out clears this draft. Download a copy if you want to keep these inputs.</p>
        <button className="secondary" onClick={() => downloadInputs(review)}>Download inputs (JSON)</button>
        {downloadError && <p role="alert" className="field-error">{downloadError}</p>}
      </section>}
    </>
  )
}
