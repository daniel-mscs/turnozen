import styles from "./Ajuda.module.css";

const TOPICOS = [
  {
    icon: "ti-briefcase",
    titulo: "Cadastrar emprego",
    texto:
      'Clique em "Novo emprego" na barra lateral. Digite o nome do emprego e escolha uma cor para identificá-lo no calendário. Você pode cadastrar quantos empregos quiser.',
  },
  {
    icon: "ti-calendar-plus",
    titulo: "Adicionar turno",
    texto:
      'Clique em "Adicionar turno" ao lado do emprego, ou clique diretamente em um dia vazio no calendário. Informe a data, horário de entrada e saída. O horário do último turno é preenchido automaticamente.',
  },
  {
    icon: "ti-pencil",
    titulo: "Editar ou deletar turno",
    texto:
      "Clique em um dia no calendário para ver os turnos. Clique no ícone de lápis para editar, ou no botão deletar dentro do modal de edição.",
  },
  {
    icon: "ti-palette",
    titulo: "Cores no calendário",
    texto:
      "Cada listra colorida representa um turno de um emprego. A cor é a mesma que você escolheu ao cadastrar o emprego. Dias com duas listras indicam que você trabalhou nos dois empregos.",
  },
  {
    icon: "ti-clock",
    titulo: "Tempo de descanso",
    texto:
      "O número em verde ou vermelho embaixo do dia indica quantas horas livres você terá até o próximo turno. Em vermelho significa menos de 11 horas de descanso — atenção à sua saúde!",
  },
  {
    icon: "ti-file-type-pdf",
    titulo: "Exportar PDF",
    texto:
      'Clique em "Exportar PDF" para gerar a escala do mês em PDF. Cole na geladeira ou em um lugar de fácil visão para consultar sem precisar abrir o app.',
  },
  {
    icon: "ti-layout-sidebar",
    titulo: "Painel lateral",
    texto:
      "Clique no ícone de menu no canto superior esquerdo para recolher ou expandir o painel de empregos. Assim o calendário fica com mais espaço.",
  },
];

export default function Ajuda({ onBack }) {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.btnBack} onClick={onBack}>
          <i className="ti ti-arrow-left" /> voltar
        </button>
        <span className={styles.titulo}>Ajuda</span>
      </header>

      <main className={styles.main}>
        <p className={styles.intro}>
          Tudo que você precisa saber para usar o TurnoZen.
        </p>

        <div className={styles.lista}>
          {TOPICOS.map((t, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.cardIcon}>
                <i className={`ti ${t.icon}`} />
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitulo}>{t.titulo}</h3>
                <p className={styles.cardTexto}>{t.texto}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
