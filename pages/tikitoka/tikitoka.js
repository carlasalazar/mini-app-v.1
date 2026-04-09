const PALETTE = {
  tealDark: "#0B6E56",
  tealLight: "#7FCEBC",
  skyBlue: "#87CEEB",
  grassGreen: "#4A7C59",
  pink: "#FF6B9D",
  softYellow: "#FFE680",
  lightGreen: "#D4E5D9",
  glass: "rgba(255, 255, 255, 0.70)",
  white: "#FFFFFF",
};

const BIOMAS = [
  { id: "norte", nombre: "Invierno", color: "#87CEEB", bgDark: "#F0F9FF", descripcion: "Minijuegos helados.", emoji: "❄️" },
  { id: "centro", nombre: "Bosque",  color: "#7FCEBC", bgDark: "#F0FFF4", descripcion: "Minijuegos de agilidad.", emoji: "🌲" },
  { id: "sur",    nombre: "Playa",   color: "#FFE680", bgDark: "#FFFBEB", descripcion: "Minijuegos bajo el sol.", emoji: "🏖️" },
];

Page({
  data: {
    PALETTE,
    view: 'mapa', // 'mapa' or 'minijuego'
    biomaActivo: null,
    biomas: BIOMAS,
    dots: []
  },
  onLoad() {
    this.setData({
      dots: Array.from({ length: 12 }).map((_, i) => ({
        top: 10 + (i * 7) % 80,
        left: 5 + (i * 13) % 85,
        delay: i * 0.2,
        duration: 2 + i * 0.3
      }))
    });
  },
  // Lógica de navegación del Custom Tab Bar
  goToTikitoka() {
    my.redirectTo({ url: '/pages/tikitoka/tikitoka' });
  },
  goToTokarena() {
    my.redirectTo({ url: '/pages/tokarena/tokarena' });
  },
  goToTokayito() {
    my.redirectTo({ url: '/pages/tokayito/tokayito' });
  },
  goToTienda() {
    my.redirectTo({ url: '/pages/tokatienda/tokatienda' });
  },
  handleSeleccionarBioma(e) {
    const { id } = e.currentTarget.dataset;
    const biomaActivo = BIOMAS.find(b => b.id === id);
    this.setData({
      biomaActivo,
      view: 'minijuego'
    });
  },
  setViewMapa() {
    this.setData({
      view: 'mapa'
    });
  }
});
