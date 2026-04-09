const app = getApp();

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

const MOCK_USERS = [
  { id: 101, user: "TokayoGamer", isFriend: true, blocks: [15, 30, 70, 45], protection: 0 },
  { id: 102, user: "Rex_Antigravity", isFriend: true, blocks: [90, 99], protection: 0 },
  { id: 103, user: "Lulu_Sky", isFriend: false, blocks: [15, 15, 15], protection: 0 },
  { id: 104, user: "MetalTok", isFriend: false, blocks: [80, 80, 80, 90], protection: 0 },
];

Page({
  data: {
    view: 'base', // 'base', 'explorar', 'atacar', 'escape'
    showInventory: false,
    baseHealth: 50,
    maxHealth: 200,
    ARENA,
    inventory: [],
    stats: {},
    healthPct: 25,
    healthColor: '#EF4444',
    protectionLevel: 0,
    mockUsers: [],
    searchQuery: '',
    rival: null, // User currently being attacked
    isAttacking: false,
    rutaTokayito: '/assets/icons/tokayito-icon.png',
    rutaBloqueNube: '/assets/icons/bloque - nube.png',
    rutaBloqueMadera: '/assets/icons/bloque - madera.png',
    bloquesIzquierda: [
      { id: 1, nivel: 1 },
      { id: 2, nivel: 1 },
      { id: 3, nivel: 1 },
    ],
    bloquesDerecha: [
      { id: 4, nivel: 1 },
      { id: 5, nivel: 1 },
      { id: 6, nivel: 1 },
    ],
  },
  onShow() {
    this.refreshData();
  },
  refreshData() {
    const inventory = app.globalData.inventory;
    const stats = app.globalData.stats;
    
    // Calculate own protection level
    const protectionLevel = inventory.reduce((acc, item) => acc + (item.dureza * (item.qty > 0 ? 1 : 0)), 0);
    
    // Calculate mock users protection
    const mockUsers = MOCK_USERS.map(u => ({
      ...u,
      protection: u.blocks.reduce((a, b) => a + b, 0)
    }));

    this.setData({ 
      inventory, 
      stats, 
      protectionLevel, 
      mockUsers,
      baseHealth: app.globalData.stats.fuerza * 2 // Example mapping
    }, () => this.updateHealthUI());
  },
  updateHealthUI() {
    const { baseHealth, maxHealth } = this.data;
    const healthPct = Math.min((baseHealth / maxHealth) * 100, 100);
    let healthColor = ARENA.success;
    if (healthPct <= 20) healthColor = ARENA.danger;
    else if (healthPct <= 50) healthColor = "#FFC107";
    
    this.setData({ healthPct, healthColor });
  },
  toggleInventory() {
    const isShowing = !this.data.showInventory;
    this.setData({ showInventory: isShowing });
    if (isShowing) my.hideTabBar();
    else if (this.data.view === 'base') my.showTabBar();
  },
  toggleExplorar() {
    if (this.data.view === 'explorar') {
      this.setData({ view: 'base' });
      my.showTabBar();
    } else {
      this.setData({ view: 'explorar' });
      my.hideTabBar();
    }
  },
  onSearchInput(e) {
    this.setData({ searchQuery: e.detail.value });
  },
  iniciarAtaque(e) {
    const { id } = e.currentTarget.dataset;
    const rival = this.data.mockUsers.find(u => u.id === id);
    this.setData({ 
      view: 'atacar', 
      rival,
      isAttacking: true 
    });
    my.hideTabBar();
  },
  atacarCubo() {
    // Combat Rewards
    app.updateStat('fuerza', 1);
    this.refreshData();
    
    // Simple visual feedback trigger could go here
    my.showToast({ content: '+1 Fuerza!', duration: 500 });
  },
  donarBloque(e) {
    const { id } = e.currentTarget.dataset;
    const rival = this.data.mockUsers.find(u => u.id === id);
    
    // Use first available block for mock donation
    const itemToDonate = this.data.inventory.find(i => i.qty > 0);
    
    if (itemToDonate) {
      if (app.deductInventory(itemToDonate.id, 1)) {
        app.updateStat('bondad', 5);
        this.refreshData();
        my.showToast({ content: `¡Donaste ${itemToDonate.nombre} a ${rival.user}! +5 Bondad`, duration: 2000 });
      }
    } else {
      my.showToast({ content: 'No tienes bloques para donar', type: 'fail' });
    }
  },
  finalizarAtaque() {
    this.setData({ view: 'base', rival: null, isAttacking: false });
    my.showTabBar();
  },
  seleccionarBloque(e) {
    const { id } = e.currentTarget.dataset;
    console.log("Bloque seleccionado:", id);
    this.toggleInventory();
  },
  setView(e) {
    const { view } = e.currentTarget.dataset;
    this.setData({ view });
    if (view === 'base') my.showTabBar();
    else my.hideTabBar();
  },
  atraparTokayo() {
    app.updateStat('fuerza', 10);
    this.setData({ view: 'base', showInventory: false }, () => {
      this.refreshData();
      this.updateHealthUI();
    });
    my.showTabBar();
  }
});
