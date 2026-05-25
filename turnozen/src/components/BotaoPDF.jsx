import { useState } from "react";
import jsPDF from "jspdf";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { Capacitor } from "@capacitor/core";
import { supabase } from "../lib/supabase";
import styles from "./BotaoPDF.module.css";

export default function BotaoPDF({ empregos, mes, ano, userId }) {
  const [loading, setLoading] = useState(false);
  const [dica, setDica] = useState(false);

  const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  async function handleGerar() {
    setLoading(true);
    const inicio = `${ano}-${String(mes + 1).padStart(2, "0")}-01`;
    const fim = `${ano}-${String(mes + 1).padStart(2, "0")}-31`;
    const { data: turnos } = await supabase
      .from("turnos")
      .select("*")
      .eq("user_id", userId)
      .gte("data", inicio)
      .lte("data", fim);

    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4", putOnlyUsedFonts: true });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageW, pageH, "F");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.setTextColor(20, 20, 20);
    pdf.text("TurnoZen", 14, 14);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`${MESES[mes]} ${ano}`, 14, 21);

    const totalDias = new Date(ano, mes + 1, 0).getDate();
    const primeiroDia = new Date(ano, mes, 1).getDay();
    const startX = 14;
    const startY = 28;
    const cellW = (pageW - 28) / 7;
    const cellH = 24;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(120, 120, 120);
    DIAS_SEMANA.forEach((d, i) => {
      pdf.text(d, startX + i * cellW + cellW / 2, startY + 5, { align: "center" });
    });

    let col = primeiroDia;
    let row = 0;
    for (let dia = 1; dia <= totalDias; dia++) {
      const x = startX + col * cellW;
      const y = startY + 10 + row * cellH;

      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.2);
      pdf.rect(x, y, cellW, cellH);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(40, 40, 40);
      pdf.text(String(dia), x + 2, y + 5);

      const dataStr = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
      const turnosDia = turnos.filter((t) => t.data === dataStr).sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));

      turnosDia.forEach((t, idx) => {
        const emp = empregos.find((e) => e.id === t.emprego_id);
        const nome = emp?.nome || "";
        const hora = `${t.hora_inicio.slice(0, 5)}-${t.hora_fim.slice(0, 5)}`;
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(6);
        pdf.setTextColor(40, 40, 40);
        pdf.text(nome, x + 2, y + 10 + idx * 8);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(6);
        pdf.setTextColor(100, 100, 100);
        pdf.text(hora, x + 2, y + 14 + idx * 8);
      });

      col++;
      if (col > 6) { col = 0; row++; }
    }

    empregos.forEach((emp, i) => {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.setTextColor(80, 80, 80);
      pdf.text(`• ${emp.nome}`, 50 + i * 60, pageH - 8);
    });

    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(7);
    pdf.setTextColor(180, 180, 180);
    pdf.text("Gerado pelo TurnoZen • Cole na geladeira ou em um lugar de facil visao :)", pageW / 2, pageH - 4, { align: "center" });

    const fileName = `escala-${String(mes + 1).padStart(2, "0")}-${ano}.pdf`;

    // nativo (APK) — salva e abre share sheet
    if (Capacitor.isNativePlatform()) {
      const base64 = pdf.output("datauristring").split(",")[1];
      await Filesystem.writeFile({ path: fileName, data: base64, directory: Directory.Cache });
      const { uri } = await Filesystem.getUri({ path: fileName, directory: Directory.Cache });
      await Share.share({ title: "Escala TurnoZen", url: uri, dialogTitle: "Compartilhar escala" });
    } else {
      // browser — download normal
      pdf.save(fileName);
    }

    setLoading(false);
    setDica(true);
    setTimeout(() => setDica(false), 4000);
  }

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button className={styles.btn} onClick={handleGerar} disabled={loading}>
        <i className="ti ti-file-type-pdf" />
        {loading ? "gerando..." : "exportar PDF"}
      </button>
      {dica && (
        <div className={styles.dica}>
          📌 Cole na geladeira ou em lugar de fácil visão!
        </div>
      )}
    </div>
  );
}