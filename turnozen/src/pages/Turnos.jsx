import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import styles from './Turnos.module.css'

export default function Turnos({ emprego, onBack }) {
  const [turnos, setTurnos] = useState([])
  const [loading, setLoading] = useState(true)
  const [mes, setMes] = useState(() => {
    const hoje = new Date()
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`
  })

  useEffect(() => {
    fetchTurnos()
  }, [mes])

  async function fetchTurnos() {
    setLoading(true)
    const inicio = `${mes}-01`
    const fim = `${mes}-31`

    const { data, error } = await supabase
      .from('turnos')
      .select('*')
      .eq('emprego_id', emprego.id)
      .gte('data', inicio)
      .lte('data', fim)
      .order('data', { ascending: true })

    if (!error) setTurnos(data)
    setLoading(false)
  }

  async function handleDeletar(id) {
    if (!confirm('Deletar esse turno?')) return
    await supabase.from('turnos').delete().eq('id', id)
    fetchTurnos()
  }

  function calcHoras(inicio, fim) {
    const [h1, m1] = inicio.split(':').map(Number)
    const [h2, m2] = fim.split(':').map(Number)
    let mins = (h2 * 60 + m2) - (h1 * 60 + m1)
    if (mins < 0) mins += 24 * 60
    return `${Math.floor(mins / 60)}h${mins % 60 > 0 ? `${mins % 60}m` : ''}`
  }

  function totalHoras() {
    let total = 0
    turnos.forEach(t => {
      const [h1, m1] = t.hora_inicio.split(':').map(Number)
      const [h2, m2] = t.hora_fim.split(':').map(Number)
      let mins = (h2 * 60 + m2) - (h1 * 60 + m1)
      if (mins < 0) mins += 24 * 60
      total += mins
    })
    return `${Math.floor(total / 60)}h${total % 60 > 0 ? `${total % 60}m` : ''}`
  }

  function formatData(data) {
    const [ano, mes, dia] = data.split('-')
    return `${dia}/${mes}/${ano}`
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.btnBack} onClick={onBack}>
          <i className="ti ti-arrow-left" /> voltar
        </button>
        <div className={styles.headerInfo}>
          <div className={styles.cor} style={{ background: emprego.cor }} />
          <span className={styles.headerNome}>{emprego.nome}</span>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.topBar}>
          <input
            className={styles.mesInput}
            type="month"
            value={mes}
            onChange={e => setMes(e.target.value)}
          />
          {turnos.length > 0 && (
            <div className={styles.total}>
              <span className={styles.totalLabel}>total</span>
              <span className={styles.totalHoras}>{totalHoras()}</span>
            </div>
          )}
        </div>

        {loading ? (
          <p className={styles.empty}>carregando...</p>
        ) : turnos.length === 0 ? (
          <p className={styles.empty}>Nenhum turno nesse mês.</p>
        ) : (
          <div className={styles.lista}>
            {turnos.map(t => (
              <div key={t.id} className={styles.card}>
                <div className={styles.cardData}>{formatData(t.data)}</div>
                <div className={styles.cardHoras}>
                  {t.hora_inicio.slice(0, 5)} → {t.hora_fim.slice(0, 5)}
                </div>
                <div className={styles.cardDuracao}>
                  {calcHoras(t.hora_inicio, t.hora_fim)}
                </div>
                <button
                  className={styles.btnDeletar}
                  onClick={() => handleDeletar(t.id)}
                >
                  <i className="ti ti-trash" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}