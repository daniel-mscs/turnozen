import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import styles from './Calendario.module.css'

export default function Calendario({ empregos, userId, onDiaClick, refresh }) {
  const [turnos, setTurnos] = useState([])
  const [mes, setMes] = useState(() => {
    const hoje = new Date()
    return { ano: hoje.getFullYear(), mes: hoje.getMonth() }
  })

     useEffect(() => {
     fetchTurnos()
    }, [mes, refresh])  

  async function fetchTurnos() {
    const inicio = `${mes.ano}-${String(mes.mes + 1).padStart(2, '0')}-01`
    const fim = `${mes.ano}-${String(mes.mes + 1).padStart(2, '0')}-31`

    const { data } = await supabase
      .from('turnos')
      .select('*, empregos(cor, nome)')
      .eq('user_id', userId)
      .gte('data', inicio)
      .lte('data', fim)

    setTurnos(data || [])
  }

  function diasDoMes() {
    const total = new Date(mes.ano, mes.mes + 1, 0).getDate()
    const primeiroDia = new Date(mes.ano, mes.mes, 1).getDay()
    return { total, primeiroDia }
  }

  function turnosDoDia(dia) {
    const dataStr = `${mes.ano}-${String(mes.mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
    return turnos.filter(t => t.data === dataStr)
  }

  function mesAnterior() {
    setMes(m => {
      if (m.mes === 0) return { ano: m.ano - 1, mes: 11 }
      return { ...m, mes: m.mes - 1 }
    })
  }

  function mesSeguinte() {
    setMes(m => {
      if (m.mes === 11) return { ano: m.ano + 1, mes: 0 }
      return { ...m, mes: m.mes + 1 }
    })
  }

  const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const { total, primeiroDia } = diasDoMes()
  const hoje = new Date()
  const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`

  return (
    <div className={styles.container}>
      <div className={styles.navMes}>
        <button className={styles.btnNav} onClick={mesAnterior}>‹</button>
        <span className={styles.titulo}>{MESES[mes.mes]} {mes.ano}</span>
        <button className={styles.btnNav} onClick={mesSeguinte}>›</button>
      </div>

      <div className={styles.semana}>
        {DIAS_SEMANA.map(d => (
          <div key={d} className={styles.diaSemana}>{d}</div>
        ))}
      </div>

      <div className={styles.grid}>
        {Array.from({ length: primeiroDia }).map((_, i) => (
          <div key={`empty-${i}`} className={styles.diaVazio} />
        ))}

        {Array.from({ length: total }).map((_, i) => {
          const dia = i + 1
          const dataStr = `${mes.ano}-${String(mes.mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
          const turnosDia = turnosDoDia(dia)
          const isHoje = dataStr === hojeStr

          return (
            <div
              key={dia}
              className={`${styles.dia} ${isHoje ? styles.hoje : ''} ${turnosDia.length > 0 ? styles.comTurno : ''}`}
              onClick={() => onDiaClick(dataStr, turnosDia)}
            >
              <span className={styles.diaNum}>{dia}</span>
              <div className={styles.barras}>
                {turnosDia.map(t => (
                  <div
                    key={t.id}
                    className={styles.barra}
                    style={{ background: t.empregos?.cor || '#8B5CF6' }}
                    title={`${t.empregos?.nome} ${t.hora_inicio.slice(0,5)}-${t.hora_fim.slice(0,5)}`}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}