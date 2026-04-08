const app = getApp();

const PALETTE = {
  tealDark: "#0B6E56",
  tealLight: "#7FCEBC",
  skyBlue: "#87CEEB",
  grassGreen: "#4A7C59",
  pink: "#FF6B9D",
  earthBrown: "#8B6F47",
  softYellow: "#FFE680",
  lightGreen: "#D4E5D9",
  white: "#FFFFFF",
};

const CATALOG = {
  personalizar: [
    { id: 'h1', name: 'Gorro Clásico', price: 100, cashPrice: 15, emoji: '🎩', type: 'hat' },
    { id: 'h2', name: 'Corona Real', price: 500, cashPrice: 45, emoji: '👑', type: 'hat' },
    { id: 'h3', name: 'Gorro Fiesta', price: 50, cashPrice: 10, emoji: '🥳', type: 'hat' },
    { id: 'h4', name: 'Lentes Cool', price: 150, cashPrice: 20, emoji: '🕶️', type: 'acc' },
  ],
  bloques: [
    { id: 'b1', name: 'Bloque Paja', price: 80, cashPrice: 5, emoji: '🟫', stats: '+10 Def' },
    { id: 'b2', name: 'Bloque Ladrillo', price: 200, cashPrice: 15, emoji: '🧱', stats: '+30 Def' },
    { id: 'b3', name: 'Bloque Cristal', price: 400, cashPrice: 30, emoji: '⬜', stats: '+50 Def' },
    { id: 'b4', name: 'Bloque Oro', price: 1000, cashPrice: 80, emoji: '🟨', stats: '+100 Def' },
  ],
  ataque: [
    { id: 'a1', name: 'Martillo Madera', price: 120, cashPrice: 10, emoji: '🔨', desc: '1 uso' },
    { id: 'a2', name: 'Pico Minero', price: 250, cashPrice: 20, emoji: '⛏️', desc: '3 usos' },
    { id: 'a3', name: 'Espada Toka', price: 600, cashPrice: 50, emoji: '⚔️', desc: '5 usos' },
  ],
  premios: [
    { id: 'p1', name: 'Cupón Cine', price: 2000, emoji: '🎟️', desc: 'SÓLO PUNTOS' },
    { id: 'p2', name: 'Caja Sorpresa', price: 1500, emoji: '🎁', desc: 'SÓLO PUNTOS' },
  ]
};

const POINTS_PACKS = [
  { id: 'pack1', name: 'Bolsita de Puntos', points: 100, price: 20, icon: '💰' },
  { id: 'pack2', name: 'Cofre Toka', points: 500, price: 100, icon: '📦', extra: '1 Martillo', toolBonus: 'hammers' },
  { id: 'pack3', name: 'Bóveda Diamante', points: 1500, price: 250, icon: '💎', extra: '3 Martillos', toolBonus: 'hammers', amount: 3 },
];

Page({
  data: {
    PALETTE,
    catalog: CATALOG,
    pointsPacks: POINTS_PACKS,
    currentCategory: 'personalizar',
    userPoints: 0,
    inventory: [],
    selectedHat: '🎩',
    selectedAcc: '',
    showConfirmModal: false,
    showPointsStore: false,
    pendingItem: null
  },

  onShow() {
    this.refreshLocalData();
  },

  refreshLocalData() {
    this.setData({
      userPoints: app.globalData.userPoints,
      inventory: app.globalData.inventory.map(i => i.id) 
    });
  },

  switchCategory(e) {
    const { cat } = e.currentTarget.dataset;
    this.setData({ currentCategory: cat });
  },

  onItemTap(e) {
    const { item } = e.currentTarget.dataset;
    const isOwned = this.data.inventory.includes(item.id);

    // TRY-ON: Always apply preview immediately
    if (item.type) {
      this.applyPreview(item);
    }

    if (!isOwned) {
      this.setData({
        showConfirmModal: true,
        pendingItem: item
      });
    }
  },

  applyPreview(item) {
    if (item.type === 'hat') {
      this.setData({ selectedHat: item.emoji });
    } else if (item.type === 'acc') {
      this.setData({ selectedAcc: item.emoji });
    }
  },

  buyWithPoints() {
    const { pendingItem, userPoints } = this.data;
    if (userPoints >= pendingItem.price) {
      app.globalData.userPoints -= pendingItem.price;
      this.handlePurchaseSuccess(pendingItem);
    } else {
      my.showToast({ content: 'Puntos insuficientes', type: 'fail' });
    }
  },

  buyWithCash() {
    const { pendingItem } = this.data;
    // Mock simulation of real money payment
    console.log(`Processing real money payment for ${pendingItem.name}: $${pendingItem.cashPrice}`);
    this.handlePurchaseSuccess(pendingItem);
  },

  handlePurchaseSuccess(item) {
    // Add to specific global inventory if it's a block or something else
    // But for simplicity in this demo, we add the ID to the tracking list
    app.globalData.inventory.push({ id: item.id, name: item.name });
    
    my.showToast({ content: '¡Compra exitosa!', type: 'success' });
    this.setData({ showConfirmModal: false, pendingItem: null });
    this.refreshLocalData();
  },

  togglePointsStore() {
    const isShowing = !this.data.showPointsStore;
    this.setData({ showPointsStore: isShowing });
    
    if (isShowing) {
      my.hideTabBar();
    } else {
      my.showTabBar();
    }
  },

  buyPointsPackage(e) {
    const { pack } = e.currentTarget.dataset;
    console.log(`Comprando paquete de puntos: ${pack.name} por $${pack.price}`);
    
    app.addPoints(pack.points);
    if (pack.toolBonus) {
      app.addTool(pack.toolBonus, pack.amount || 1);
    }

    my.showToast({ content: `¡Puntos acreditados! ${pack.extra ? '+ '+pack.extra : ''}`, type: 'success' });
    this.refreshLocalData();
    // Keep internal drawer open or close as needed
  },

  cancelPurchase() {
    this.setData({ showConfirmModal: false, pendingItem: null });
  }
});
