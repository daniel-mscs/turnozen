import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import ModalEmprego from '../components/ModalEmprego'
import styles from './Home.module.css'
import ModalTurno from '../components/ModalTurno'

export default function Home({ session }) {
  const [empregos, setEmpregos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [empregoSelecionado, setEmpregoSelecionado] = useState(null)
  const [toast, setToast] = useState('')
  useEffect(() => {
    fetchEmpregos()
  }, [])

  async function fetchEmpregos() {
    const { data, error } = await supabase
      .from('empregos')
      .select('*')
      .order('created_at', { ascending: true })

    if (!error) setEmpregos(data)
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  async function handleDeletar(id) {
  if (!confirm('Deletar esse emprego?')) return
  await supabase.from('empregos').delete().eq('id', id)
  fetchEmpregos()
}

  function showToast(msg) {
  setToast(msg)
  setTimeout(() => setToast(''), 3000)
}

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoAccent}>Turno</span>Zen
        </div>
        <div className={styles.headerRight}>
          <img
            src={session.user.user_metadata.avatar_url}
            alt="avatar"
            className={styles.avatar}
          />
          <button className={styles.btnLogout} onClick={handleLogout}>
            sair
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Meus empregos</h2>
          <button className={styles.btnAdd} onClick={() => setModalAberto(true)}>+ adicionar</button>
        </div>

        {loading ? (
          <p className={styles.empty}>carregando...</p>
        ) : empregos.length === 0 ? (
          <p className={styles.empty}>Nenhum emprego cadastrado ainda.</p>
        ) : (
          <div className={styles.empregosList}>
            {empregos.map(emp => (
              <div key={emp.id} className={styles.empregoCard}>
                <div className={styles.empregoCor} style={{ background: emp.cor }} />
                <span className={styles.empregoNome}>{emp.nome}</span>
                <div className={styles.empregoActions}>
                  <button
                    className={styles.btnTurno}
                    onClick={() => setEmpregoSelecionado(emp)}
                  >
                    Adicionar turno
                  </button>
                  <button
                    className={styles.btnDeletar}
                    onClick={() => handleDeletar(emp.id)}
                  >
                    <i className="ti ti-trash" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {modalAberto && (
        <ModalEmprego
          userId={session.user.id}
          onClose={() => setModalAberto(false)}
          onSaved={fetchEmpregos}
        />
      )}

      {empregoSelecionado && (
        <ModalTurno
          emprego={empregoSelecionado}
          userId={session.user.id}
          onClose={() => { setEmpregoSelecionado(null) }}
          onSaved={() => showToast('Turno salvo!')}
        />
      )}

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  )
}