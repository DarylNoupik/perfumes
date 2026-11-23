import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
const supabase = url && key ? createClient(url, key) : null

export default function App() {
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (!supabase) return
    const controller = new AbortController()

    async function loadInstruments() {
      const { data, error } = await supabase
        .from('instruments')
        .select('id, name')
        .order('id')
        .abortSignal(controller.signal)
      if (!controller.signal.aborted) setResult({ data, error })
    }

    void loadInstruments()
    return () => controller.abort()
  }, [])

  return (
    <main>
      <h1>Instruments</h1>
      {!supabase ? (
        <p>Renseigne l’URL et la clé publique Supabase dans <code>.env.local</code>.</p>
      ) : !result ? (
        <p role="status">Chargement des instruments…</p>
      ) : result.error ? (
        <p role="alert">Impossible de charger les instruments. {result.error.message}</p>
      ) : result.data.length === 0 ? (
        <p>Aucun instrument.</p>
      ) : (
        <ul>{result.data.map(({ id, name }) => <li key={id}>{name}</li>)}</ul>
      )}
    </main>
  )
}
