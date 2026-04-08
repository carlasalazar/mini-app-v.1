const TRIVIA_QUESTIONS = [
  {
    pregunta: "¿Qué representa el CAT en un producto financiero?",
    opciones: ["Costo Anual Total", "Crédito Al Toque", "Cuenta Anual Trendy"],
    correcta: 0
  },
  {
    pregunta: "¿Cuál es el propósito principal de esta Mini App TokaYa!?",
    opciones: ["Gestionar tarjetas bancarias", "Brindar entretenimiento y dinámicas", "Pagar servicios públicos"],
    correcta: 1
  },
  {
    pregunta: "¿Qué sector lidera Toka en México?",
    opciones: ["Venta de smartphones", "Redes sociales", "Vales de despensa y pagos"],
    correcta: 2
  },
  {
    pregunta: "Según la regla 50/30/20, ¿cuánto deberías ahorrar?",
    opciones: ["El 5% de tus ingresos", "El 20% para tu futuro", "Gastar el 100% en lujos"],
    correcta: 1
  },
  {
    pregunta: "¿Cuál es el beneficio de jugar diariamente en TokaYa!?",
    opciones: ["Fortalecer stats de tu Tokayito", "Ganar boletos de avión", "Cambiar el color del cielo"],
    correcta: 0
  }
];

Page({
  data: {
    showTrivia: false,
    stats: { bondad: 0, inteligencia: 0, fuerza: 0 },
    perfeccion: 0,
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
  onShow() {
    this.refreshStats();
  },
  onLoad() {
    this.initSparkles();
  },
  refreshStats() {
    const app = getApp();
    const stats = app.globalData.stats;
    this.setData({ stats }, () => this.updatePerfeccion());
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
    const isShowing = !this.data.showTrivia;
    this.setData({
      showTrivia: isShowing,
      triviaStep: 'start',
      currentQIndex: 0,
      score: 0
    });
    
    if (isShowing) {
      my.hideTabBar();
    } else {
      my.showTabBar();
    }
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
