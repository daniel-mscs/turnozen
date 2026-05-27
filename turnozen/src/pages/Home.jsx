import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import ModalEmprego from "../components/ModalEmprego";
import ModalTurno from "../components/ModalTurno";
import Calendario from "../components/Calendario";
import Turnos from "../pages/Turnos";
import BotaoPDF from "../components/BotaoPDF";
import styles from "./Home.module.css";
import Ajuda from "../pages/Ajuda";

export default function Home({ session }) {
  const [empregos, setEmpregos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [empregoSelecionado, setEmpregoSelecionado] = useState(null);
  const [telaEmprego, setTelaEmprego] = useState(null);
  const [toast, setToast] = useState("");
  const [sidebarAberta, setSidebarAberta] = useState(true);
  const [refreshCalendario, setRefreshCalendario] = useState(0);
  const [turnoEditando, setTurnoEditando] = useState(null);
  const [dataPreSelecionada, setDataPreSelecionada] = useState("");
  const [selecionandoEmprego, setSelecionandoEmprego] = useState(false);
  const [turnosPDF, setTurnosPDF] = useState([]);
  const [telaAjuda, setTelaAjuda] = useState(false);

  useEffect(() => {
    fetchEmpregos();
  }, []);

  useEffect(() => {
    if (!loading && empregos.length === 0) {
      setModalAberto(true);
    }
  }, [loading, empregos]);

  async function fetchEmpregos() {
    const { data, error } = await supabase
      .from("empregos")
      .select("*")
      .order("created_at", { ascending: true });

    if (!error) setEmpregos(data);
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  async function handleDeletar(id) {
  if (!confirm("Deletar esse emprego?")) return;
  await supabase.from("empregos").delete().eq("id", id);
  fetchEmpregos();
  setRefreshCalendario((r) => r + 1);
}

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  if (telaAjuda) return <Ajuda onBack={() => setTelaAjuda(false)} />;

  if (telaEmprego)
    return <Turnos emprego={telaEmprego} onBack={() => setTelaEmprego(null)} />;

  async function fetchTurnosMes(mes, ano) {
    const inicio = `${ano}-${String(mes + 1).padStart(2, "0")}-01`;
    const fim = `${ano}-${String(mes + 1).padStart(2, "0")}-31`;
    const { data } = await supabase
      .from("turnos")
      .select("*")
      .eq("user_id", session.user.id)
      .gte("data", inicio)
      .lte("data", fim);
    setTurnosPDF(data || []);
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button
            className={styles.btnToggle}
            onClick={() => setSidebarAberta((s) => !s)}
            title={sidebarAberta ? "Recolher painel" : "Expandir painel"}
          >
            <i className="ti ti-layout-sidebar" />
          </button>
          <div className={styles.logo}>
            <span className={styles.logoAccent}>Turno</span>Zen
          </div>
        </div>
        <div className={styles.headerRight}>
          <button
            className={styles.btnAjuda}
            onClick={() => setTelaAjuda(true)}
          >
            <i className="ti ti-help-circle" />
          </button>
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

      <main
        className={`${styles.main} ${!sidebarAberta ? styles.mainFull : ""}`}
      >
        {/* ── SIDEBAR EMPREGOS ── */}
        <div
          className={`${styles.sidebar} ${!sidebarAberta ? styles.sidebarHidden : ""}`}
        >
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Empregos</h2>
            <button
              className={styles.btnAdd}
              onClick={() => setModalAberto(true)}
            >
              Novo emprego
            </button>
          </div>

          {loading ? (
            <p className={styles.empty}>carregando...</p>
          ) : empregos.length === 0 ? (
            <p className={styles.empty}>Nenhum emprego ainda.</p>
          ) : (
            <div className={styles.empregosList}>
              {empregos.map((emp) => (
                <div key={emp.id} className={styles.empregoCard}>
                  <div
                    className={styles.empregoCor}
                    style={{ background: emp.cor }}
                  />
                  <span
                    className={styles.empregoNome}
                    onClick={() => setTelaEmprego(emp)}
                  >
                    {emp.nome}
                  </span>
                  <div className={styles.empregoActions}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <button
                        className={styles.btnTurno}
                        onClick={() => setEmpregoSelecionado(emp)}
                      >
                        Adicionar turno
                      </button>
                      <span style={{ fontSize: 10, color: "#444", textAlign: "center" }}>
                        ou clique em um dia 📅
                      </span>
                    </div>
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
        </div>

        {/* ── CALENDÁRIO ── */}
        <div className={styles.calendarioWrap}>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: 12,
            }}
          >
            <BotaoPDF
              empregos={empregos}
              mes={new Date().getMonth()}
              ano={new Date().getFullYear()}
              userId={session.user.id}
            />
          </div>
          <div id="calendario-pdf">
            <Calendario
              empregos={empregos}
              userId={session.user.id}
              onDiaClick={(dataStr, turnosDia) => {
                if (turnosDia.length === 0 && empregos.length > 0) {
                  setDataPreSelecionada(dataStr);
                  setSelecionandoEmprego(true);
                }
              }}
              refresh={refreshCalendario}
              onEditarTurno={(turno) => setTurnoEditando(turno)}
            />
          </div>
        </div>
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
          dataInicial={dataPreSelecionada}
          onClose={() => {
            setEmpregoSelecionado(null);
            setDataPreSelecionada("");
          }}
          onSaved={(data) => {
            const hoje = new Date().toISOString().split("T")[0];
            if (data >= hoje) showToast("Turno salvo!");
            fetchEmpregos();
            setRefreshCalendario((r) => r + 1);
          }}
        />
      )}

      {turnoEditando && (
        <ModalTurno
          emprego={empregos.find((e) => e.id === turnoEditando.emprego_id)}
          userId={session.user.id}
          turnoExistente={turnoEditando}
          onClose={() => setTurnoEditando(null)}
          onSaved={(data) => {
            const hoje = new Date().toISOString().split("T")[0];
            if (data >= hoje) showToast("Turno atualizado!");
            setTurnoEditando(null);
            fetchEmpregos();
            setRefreshCalendario((r) => r + 1);
          }}
        />
      )}

      {selecionandoEmprego && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
          }}
          onClick={() => setSelecionandoEmprego(false)}
        >
          <div
            style={{
              background: "#111",
              border: "1px solid #2a2a2a",
              borderRadius: 16,
              padding: "24px",
              minWidth: 280,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p
              style={{
                fontSize: 13,
                color: "#888",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Qual emprego?
            </p>
            {empregos.map((emp) => (
              <button
                key={emp.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "#161616",
                  border: "1px solid #222",
                  borderRadius: 10,
                  padding: "12px 16px",
                  cursor: "pointer",
                  color: "#fff",
                  fontSize: 14,
                  fontFamily: "inherit",
                }}
                onClick={() => {
                  setEmpregoSelecionado(emp);
                  setSelecionandoEmprego(false);
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: emp.cor,
                  }}
                />
                {emp.nome}
              </button>
            ))}
          </div>
        </div>
      )}

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}
