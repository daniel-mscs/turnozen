import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import styles from './ModalTurno.module.css'

export default function ModalTurno({ emprego, userId, onClose, onSaved, turnoExistente, dataInicial }) {
  const [data, setData] = useState(turnoExistente?.data || dataInicial || '')
  const [horaInicio, setHoraInicio] = useState(turnoExistente?.hora_inicio?.slice(0,5) || '')
  const [horaFim, setHoraFim] = useState(turnoExistente?.hora_fim?.slice(0,5) || '')
  const [loading, setLoading] = useState(false)
  const dataRef = useRef(null)

  // Preenche automaticamente com o último turno desse emprego
  useEffect(() => {
    async function fetchUltimo() {
      if (turnoExistente) return // não sobrescreve se tiver editando
      const { data: ultimo } = await supabase
        .from('turnos')
        .select('hora_inicio, hora_fim')
        .eq('emprego_id', emprego.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (ultimo) {
        setHoraInicio(ultimo.hora_inicio.slice(0, 5))
        setHoraFim(ultimo.hora_fim.slice(0, 5))
      }
    }
    fetchUltimo()
    dataRef.current?.focus()
  }, [])

  async function handleDeletar() {
    if (!confirm('Deletar esse turno?')) return
    await supabase.from('turnos').delete().eq('id', turnoExistente.id)
    onSaved(data)
    onClose()
  }

  async function handleSalvar() {
    if (!data || !horaInicio || !horaFim) return
    setLoading(true)

    const { error } = turnoExistente
      ? await supabase
          .from('turnos')
          .update({ data, hora_inicio: horaInicio, hora_fim: horaFim })
          .eq('id', turnoExistente.id)
      : await supabase
          .from('turnos')
          .insert({ user_id: userId, emprego_id: emprego.id, data, hora_inicio: horaInicio, hora_fim: horaFim })

    if (!error) {
      onSaved(data)
      onClose()
    }
    setLoading(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSalvar()
    if (e.key === 'Escape') onClose()
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()} onKeyDown={handleKeyDown}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.cor} style={{ background: emprego.cor }} />
            <span className={styles.title}>{emprego.nome}</span>
          </div>
          <span className={styles.headerLabel}>{turnoExistente ? 'Editar turno' : 'Novo turno'}</span>
        </div>

        <div className={styles.fields}>
          <div className={styles.field}>
            <label className={styles.label}>Data</label>
            <input
                ref={dataRef}
                className={styles.input}
                type="date"
                value={data}
                max={new Date().toISOString().split('T')[0]}
                onChange={e => setData(e.target.value)}
              />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Entrada</label>
              <input
                className={styles.input}
                type="time"
                value={horaInicio}
                onChange={e => setHoraInicio(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Saída</label>
              <input
                className={styles.input}
                type="time"
                value={horaFim}
                onChange={e => setHoraFim(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          {turnoExistente && (
            <button className={styles.btnDeletar} onClick={handleDeletar}>
              <i className="ti ti-trash" />
            </button>
          )}
          <button className={styles.btnCancelar} onClick={onClose}>cancelar</button>
          <button
            className={styles.btnSalvar}
            onClick={handleSalvar}
            disabled={loading || !data || !horaInicio || !horaFim}
          >
            {loading ? 'salvando...' : 'salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}