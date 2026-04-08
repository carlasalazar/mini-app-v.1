const TRIVIA_QUESTIONS = [
  {
    pregunta: "¿Qué es súper importante para mi futuro financiero? ✨",
    opciones: ["Gastar todo en gloss 💄", "Ahorrar para imprevistos 💖", "Pedirle prestado a mi bff 👯‍♀️"],
    correcta: 1
  },
  {
    pregunta: "Si uso mi tarjeta, el CAT significa... 🤔",
    opciones: ["Costo Anual Total ¡Ouch! 💸", "Cute And Trendy 💅", "Comisión Al Toque ⚡️"],
    correcta: 0
  },
  {
    pregunta: "La regla mágica 50/30/20 es para... 📚",
    opciones: ["Bailar en TikTok 🕺", "Organizar mi dinero 💰", "Comprar boletos de concierto 🎟️"],
    correcta: 1
  }
];

Page({
  data: {
    showTrivia: false,
    stats: { bondad: 70, inteligencia: 45, fuerza: 80 },
    perfeccion: 65,
    triviaStep: 'start', // 'start', 'playing', 'result'
    currentQIndex: 0,
    score: 0,
    questions: TRIVIA_QUESTIONS,
    sparkles: [],
    PALETTE: {
      tealDark: "#0B6E56",
      tealLight: "#7FCEBC",
      skyBlue: "#87CEEB",
      grassGreen: "#4A7C59",
      pink: "#FF6B9D",
      earthBrown: "#8B6F47",
      softYellow: "#FFE680",
      lightGreen: "#D4E5D9",
      white: "#FFFFFF",
      glass: "rgba(255, 255, 255, 0.70)",
    }
  },
  onLoad() {
    this.updatePerfeccion();
    this.initSparkles();
  },
  updatePerfeccion() {
    const { stats } = this.data;
    const perfeccion = Math.round((stats.bondad + stats.inteligencia + stats.fuerza) / 3);
    this.setData({ perfeccion });
  },
  initSparkles() {
    const sparkles = Array.from({ length: 15 }).map((_, i) => ({
      top: Math.random() * 100,
      left: Math.random() * 100,
      color: i % 2 === 0 ? '#FFFFFF' : '#FFE680',
      delay: Math.random() * 3,
      duration: Math.random() * 2 + 3
    }));
    this.setData({ sparkles });
  },
  toggleTrivia() {
    this.setData({ 
      showTrivia: !this.data.showTrivia,
      triviaStep: 'start',
      currentQIndex: 0,
      score: 0
    });
  },
  startTrivia() {
    this.setData({ triviaStep: 'playing' });
  },
  handleRespuesta(e) {
    const { idx } = e.currentTarget.dataset;
    let { score, currentQIndex, stats } = this.data;
    
    if (idx === TRIVIA_QUESTIONS[currentQIndex].correcta) {
      score++;
    }
    
    if (currentQIndex < TRIVIA_QUESTIONS.length - 1) {
      this.setData({ score, currentQIndex: currentQIndex + 1 });
    } else {
      const newInt = Math.min(stats.inteligencia + 18, 100);
      this.setData({ 
        score, 
        triviaStep: 'result',
        'stats.inteligencia': newInt
      }, () => this.updatePerfeccion());
    }
  }
});
