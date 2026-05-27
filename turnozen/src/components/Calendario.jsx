import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import styles from "./Calendario.module.css";

export default function Calendario({
  empregos,
  userId,
  onDiaClick,
  refresh,
  onEditarTurno,
}) {
  const [turnos, setTurnos] = useState([]);
  const [mes, setMes] = useState(() => {
    const hoje = new Date();
    return { ano: hoje.getFullYear(), mes: hoje.getMonth() };
  });
  const [popupDia, setPopupDia] = useState(null);

  useEffect(() => {
    fetchTurnos();
  }, [mes, refresh]);

  async function fetchTurnos() {
    const inicio = `${mes.ano}-${String(mes.mes + 1).padStart(2, "0")}-01`;
    const fim = `${mes.ano}-${String(mes.mes + 1).padStart(2, "0")}-31`;

    const { data } = await supabase
      .from("turnos")
      .select("*, empregos(cor, nome)")
      .eq("user_id", userId)
      .gte("data", inicio)
      .lte("data", fim);

    setTurnos(data || []);
  }

  function diasDoMes() {
    const total = new Date(mes.ano, mes.mes + 1, 0).getDate();
    const primeiroDia = new Date(mes.ano, mes.mes, 1).getDay();
    return { total, primeiroDia };
  }

  function turnosDoDia(dia) {
    const dataStr = `${mes.ano}-${String(mes.mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    return turnos
      .filter((t) => t.data === dataStr)
      .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
  }

  function descansosDoDia(dia) {
  const turnosDia = turnosDoDia(dia);
  const turnosProximo = turnosDoDia(dia + 1);

  function toMins(horaInicio, horaFim) {
    const [hI, mI] = horaInicio.split(":").map(Number);
    const [hF, mF] = horaFim.split(":").map(Number);
    const ini = hI * 60 + mI;
    const fim = hF * 60 + mF;
    return { ini, fim: fim < ini ? fim + 24 * 60 : fim };
  }

  const lista = [];

  turnosDia.forEach((t) => {
    const { ini, fim } = toMins(t.hora_inicio, t.hora_fim);
    lista.push({ ini, fim });
  });

  turnosProximo.forEach((t) => {
    const { ini, fim } = toMins(t.hora_inicio, t.hora_fim);
    lista.push({ ini: ini + 24 * 60, fim: fim + 24 * 60 });
  });

  if (lista.length < 2) return [];

  lista.sort((a, b) => a.ini - b.ini);

  const descansos = [];
  for (let i = 0; i < lista.length - 1; i++) {
    const diff = lista[i + 1].ini - lista[i].fim;
    if (diff >= 0) {
      descansos.push({
        horas: Math.floor(diff / 60),
        mins: diff % 60,
        critico: diff < 11 * 60,
      });
    }
  }

  return descansos;
}

  function calcDuracao(inicio, fim) {
    const [h1, m1] = inicio.split(":").map(Number);
    const [h2, m2] = fim.split(":").map(Number);
    let mins = h2 * 60 + m2 - (h1 * 60 + m1);
    if (mins < 0) mins += 24 * 60;
    return `${Math.floor(mins / 60)}h${mins % 60 > 0 ? `${mins % 60}m` : ""}`;
  }

  function formatData(dataStr) {
    const [ano, mes, dia] = dataStr.split("-");
    const semana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const d = new Date(Number(ano), Number(mes) - 1, Number(dia));
    return `${semana[d.getDay()]}, ${dia}/${mes}/${ano}`;
  }

  function mesAnterior() {
    setMes((m) =>
      m.mes === 0 ? { ano: m.ano - 1, mes: 11 } : { ...m, mes: m.mes - 1 },
    );
  }

  function mesSeguinte() {
    setMes((m) =>
      m.mes === 11 ? { ano: m.ano + 1, mes: 0 } : { ...m, mes: m.mes + 1 },
    );
  }

  const MESES = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const { total, primeiroDia } = diasDoMes();
  const hoje = new Date();
  const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;

  return (
    <div className={styles.container}>
      <div className={styles.navMes}>
        <button className={styles.btnNav} onClick={mesAnterior}>
          ‹
        </button>
        <span className={styles.titulo}>
          {MESES[mes.mes]} {mes.ano}
        </span>
        <button className={styles.btnNav} onClick={mesSeguinte}>
          ›
        </button>
      </div>

      <div className={styles.semana}>
        {DIAS_SEMANA.map((d) => (
          <div key={d} className={styles.diaSemana}>
            {d}
          </div>
        ))}
      </div>

      <div className={styles.grid}>
        {Array.from({ length: primeiroDia }).map((_, i) => (
          <div key={`empty-${i}`} className={styles.diaVazio} />
        ))}

        {Array.from({ length: total }).map((_, i) => {
          const dia = i + 1;
          const dataStr = `${mes.ano}-${String(mes.mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
          const turnosDia = turnosDoDia(dia);
          const isHoje = dataStr === hojeStr;
          const descansos = descansosDoDia(dia);

          return (
            <div
              key={dia}
              className={`${styles.dia} ${isHoje ? styles.hoje : ""} ${turnosDia.length > 0 ? styles.comTurno : ""}`}
              onClick={() => {
                if (turnosDia.length > 0)
                   setPopupDia({ dataStr, dia, turnosDia, descansos });
                onDiaClick(dataStr, turnosDia);
              }}
            >
              <span className={styles.diaNum}>{dia}</span>
              <div className={styles.barras}>
                {turnosDia.map((t) => (
                  <div
                    key={t.id}
                    className={styles.barra}
                    style={{ background: t.empregos?.cor || "#8B5CF6" }}
                  />
                ))}
              </div>
              {descansos.map((d, i) => (
                <span
                  key={i}
                  className={styles.livre}
                  style={{ color: d.critico ? "#e53935" : "#10B981" }}
                >
                  {d.horas}h{d.mins > 0 ? `${d.mins}m` : ""}
                </span>
              ))}
            </div>
          );
        })}
      </div>

      {/* ── POPUP ── */}
      {popupDia && (
        <div className={styles.popupOverlay} onClick={() => setPopupDia(null)}>
          <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
            <div className={styles.popupHeader}>
              <span className={styles.popupData}>
                {formatData(popupDia.dataStr)}
              </span>
              <button
                className={styles.popupClose}
                onClick={() => setPopupDia(null)}
              >
                ✕
              </button>
            </div>

            <div className={styles.popupTurnos}>
              {popupDia.turnosDia.map((t) => (
                <div key={t.id} className={styles.popupTurno}>
                  <div
                    className={styles.popupCor}
                    style={{ background: t.empregos?.cor }}
                  />
                  <div className={styles.popupInfo}>
                    <span className={styles.popupNome}>{t.empregos?.nome}</span>
                    <span className={styles.popupHora}>
                      {t.hora_inicio.slice(0, 5)} → {t.hora_fim.slice(0, 5)}
                    </span>
                  </div>
                  <span className={styles.popupDuracao}>
                    {calcDuracao(t.hora_inicio, t.hora_fim)}
                  </span>
                  <button
                    className={styles.popupEditBtn}
                    onClick={() => {
                      onEditarTurno(t);
                      setPopupDia(null);
                    }}
                  >
                    <i className="ti ti-pencil" />
                  </button>
                </div>
              ))}
            </div>

            <button
              className={styles.popupAddBtn}
              onClick={() => {
                onDiaClick(popupDia.dataStr, []);
                setPopupDia(null);
              }}
            >
              + adicionar turno
            </button>

            {popupDia.descansos?.map((d, i) => (
              <div
                key={i}
                className={styles.popupDescanso}
                style={{ borderColor: d.critico ? "#e5393522" : "#10B98122" }}
              >
                <span
                  className={styles.popupDescansoLabel}
                  style={{ color: d.critico ? "#e53935" : "#10B981" }}
                >
                  {d.critico ? "⚠ Descanso curto" : "✓ Descanso"}
                </span>
                <span
                  className={styles.popupDescansoHoras}
                  style={{ color: d.critico ? "#e53935" : "#10B981" }}
                >
                  {d.horas}h{d.mins > 0 ? `${d.mins}m` : ""} até o próximo turno
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
