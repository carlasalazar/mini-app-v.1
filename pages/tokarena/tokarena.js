const ARENA = {
  bgDeep:     "transparent",
  bgCard:     "rgba(255, 255, 255, 0.70)",
  bgHighCard: "rgba(255, 255, 255, 0.90)",
  border:     "#7FCEBC",
  accentFire: "#FF6B9D",
  accentVio:  "#4A7C59",
  success:    "#4CAF50",
  danger:     "#FF6B9D",
  textPri:    "#0B6E56",
  textMuted:  "rgba(11, 110, 86, 0.6)",
};

const CATALOGO = [
  { id: "paja",       nombre: "Bloque de Paja",    defensa: 10,  precio: 50,  color: "#C8A84B", darkColor: "#3D2F0A" },
  { id: "madera",     nombre: "Bloque de Madera",  defensa: 30,  precio: 150, color: "#8B5A2B", darkColor: "#2A1A0A" },
  { id: "piedra",     nombre: "Bloque de Piedra",  defensa: 60,  precio: 300, color: "#6B7280", darkColor: "#1F2937" },
  { id: "bloquesote", nombre: "El Bloquesote",     defensa: 100, precio: 800, color: "#7C3AED", darkColor: "#1E0A40" },
];

Page({
  data: {
    view: 'base', // 'base', 'catalogo', 'social', 'escape'
    baseHealth: 50,
    maxHealth: 200,
    ARENA,
    CATALOGO,
    healthPct: 25,
    healthColor: '#EF4444' 
  },
  onLoad() {
    this.updateHealthUI();
  },
  updateHealthUI() {
    const { baseHealth, maxHealth } = this.data;
    const healthPct = (baseHealth / maxHealth) * 100;
    let healthColor = ARENA.success;
    if (healthPct <= 20) healthColor = ARENA.danger;
    else if (healthPct <= 50) healthColor = "#FFC107";
    
    this.setData({ healthPct, healthColor });
  },
  simularAtaque() {
    let next = this.data.baseHealth - 25;
    if (next <= 0) {
      this.setData({ baseHealth: 0, view: 'escape' }, () => this.updateHealthUI());
    } else {
      this.setData({ baseHealth: next }, () => this.updateHealthUI());
    }
  },
  comprarBloque(e) {
    const { defensa } = e.currentTarget.dataset;
    const next = Math.min(this.data.baseHealth + defensa, this.data.maxHealth);
    this.setData({ baseHealth: next, view: 'base' }, () => this.updateHealthUI());
  },
  setView(e) {
    const { view } = e.currentTarget.dataset;
    this.setData({ view });
  },
  atraparTokayo() {
    this.setData({ baseHealth: 50, view: 'base' }, () => this.updateHealthUI());
  }
});
