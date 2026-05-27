# TurnoZen

App para organização de plantões em múltiplos empregos. Desenvolvido para técnicos de enfermagem e profissionais com escalas rotativas em mais de um local de trabalho.

🔗 [turnozen.vercel.app](https://turnozen.vercel.app)

---

## Funcionalidades

- Calendário mensal com visualização por emprego
- Cálculo automático de horas de descanso entre turnos
- Alerta quando o descanso está abaixo de 11h (norma CLT)
- Exportação de PDF da escala mensal
- Login com Google via OAuth
- PWA instalável + APK Android via Capacitor
- Suporte a turnos noturnos (ex: 19h → 07h)

---

## Stack

- **Frontend:** React + Vite
- **Backend/DB:** Supabase (PostgreSQL + Auth + RLS)
- **Mobile:** Capacitor (Android)
- **Deploy:** Vercel

---

## Como rodar localmente

```bash
# Clone o repositório
git clone https://github.com/daniel-mscs/turnozen.git
cd turnozen/turnozen

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY

# Rode em desenvolvimento
npm run dev
```

---

## Variáveis de ambiente

```env
VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_aqui
```

---

## Build para Android

```bash
npm run build
npx cap sync
# Abrir Android Studio e gerar APK
npx cap open android
```

---

## Autor

Daniel — Técnico de Enfermagem e estudante de Engenharia de Software (1º semestre)

[GitHub](https://github.com/daniel-mscs) · [LinkedIn](https://linkedin.com/in/seu-perfil)