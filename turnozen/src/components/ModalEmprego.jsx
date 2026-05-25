import { useState } from "react";
import { supabase } from "../lib/supabase";
import styles from "./ModalEmprego.module.css";

const CORES = [
  "#8B5CF6",
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
  "#06B6D4",
  "#F97316",
  "#A855F7",
  "#14B8A6",
  "#84CC16",
  "#DC2626",
];

export default function ModalEmprego({ userId, onClose, onSaved }) {
  const [nome, setNome] = useState("");
  const [cor, setCor] = useState("#8B5CF6");
  const [loading, setLoading] = useState(false);

  async function handleSalvar() {
    if (!nome.trim()) return;
    setLoading(true);

    const { error } = await supabase
      .from("empregos")
      .insert({ nome: nome.trim(), cor, user_id: userId });

    if (!error) {
      onSaved();
      onClose();
    }
    setLoading(false);
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>Novo emprego</h3>

        <div className={styles.field}>
          <label className={styles.label}>Nome</label>
          <input
            className={styles.input}
            placeholder="Ex: Hospital Caridade"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Cor</label>
          <div className={styles.cores}>
            {CORES.map((c) => (
              <button
                key={c}
                className={`${styles.corBtn} ${cor === c ? styles.corSelecionada : ""}`}
                style={{ background: c }}
                onClick={() => setCor(c)}
              />
            ))}
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.btnCancelar} onClick={onClose}>
            cancelar
          </button>
          <button
            className={styles.btnSalvar}
            onClick={handleSalvar}
            disabled={loading}
          >
            {loading ? "salvando..." : "salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
