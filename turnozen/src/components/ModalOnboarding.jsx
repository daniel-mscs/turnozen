import { useState, useEffect } from "react";
import { Preferences } from "@capacitor/preferences";

export default function ModalOnboarding({ onClose }) {
  const [passo, setPasso] = useState(1);

  async function handleFechar() {
    await Preferences.set({ key: "onboarding_completo", value: "true" });
    onClose();
  }

  const passos = [
    {
      icone: "👋",
      titulo: "Bem-vindo ao TurnoZen!",
      texto: "Organize seus plantões em múltiplos empregos de forma simples e visual.",
    },
    {
      icone: "💼",
      titulo: "Cadastre seus empregos",
      texto: 'Clique em "Novo emprego", digite o nome e escolha uma cor para identificar cada trabalho no calendário.',
    },
    {
      icone: "📅",
      titulo: "Adicione seus turnos",
      texto: "Clique em qualquer dia do calendário para adicionar um turno. O app calcula automaticamente suas horas de descanso!",
    },
  ];

  const p = passos[passo - 1];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 300,
        padding: 24,
      }}
    >
      <div
        style={{
          background: "#111",
          border: "1px solid #2a2a2a",
          borderRadius: 20,
          padding: 32,
          maxWidth: 340,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 48 }}>{p.icone}</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "#fff", margin: 0 }}>
            {p.titulo}
          </h2>
          <p style={{ fontSize: 14, color: "#888", margin: 0, lineHeight: 1.6 }}>
            {p.texto}
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
          {passos.map((_, i) => (
            <div
              key={i}
              style={{
                width: i + 1 === passo ? 20 : 6,
                height: 6,
                borderRadius: 3,
                background: i + 1 === passo ? "#8B5CF6" : "#333",
                transition: "width 0.2s",
              }}
            />
          ))}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {passo < 3 ? (
            <>
              <button
                onClick={handleFechar}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "1px solid #222",
                  color: "#555",
                  padding: "10px",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 13,
                }}
              >
                pular
              </button>
              <button
                onClick={() => setPasso((p) => p + 1)}
                style={{
                  flex: 2,
                  background: "#8B5CF6",
                  border: "none",
                  color: "#fff",
                  padding: "10px",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                próximo →
              </button>
            </>
          ) : (
            <button
              onClick={handleFechar}
              style={{
                flex: 1,
                background: "#8B5CF6",
                border: "none",
                color: "#fff",
                padding: "12px",
                borderRadius: 10,
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              começar 🚀
            </button>
          )}
        </div>
      </div>
    </div>
  );
}