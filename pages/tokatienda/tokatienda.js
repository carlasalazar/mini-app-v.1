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
    { id: 'h1', name: 'Gorro Clásico', price: 100, emoji: '🎩', type: 'hat' },
    { id: 'h2', name: 'Corona Real', price: 500, emoji: '👑', type: 'hat' },
    { id: 'h3', name: 'Gorro Fiesta', price: 50, emoji: '🥳', type: 'hat' },
    { id: 'h4', name: 'Lentes Cool', price: 150, emoji: '🕶️', type: 'acc' },
  ],
  bloques: [
    { id: 'b1', name: 'Bloque Paja', price: 80, emoji: '🟫', stats: '+10 Def' },
    { id: 'b2', name: 'Bloque Ladrillo', price: 200, emoji: '🧱', stats: '+30 Def' },
    { id: 'b3', name: 'Bloque Cristal', price: 400, emoji: '⬜', stats: '+50 Def' },
    { id: 'b4', name: 'Bloque Oro', price: 1000, emoji: '🟨', stats: '+100 Def' },
  ],
  ataque: [
    { id: 'a1', name: 'Martillo Madera', price: 120, emoji: '🔨', desc: '1 uso' },
    { id: 'a2', name: 'Pico Minero', price: 250, emoji: '⛏️', desc: '3 usos' },
    { id: 'a3', name: 'Espada Toka', price: 600, emoji: '⚔️', desc: '5 usos' },
  ],
  premios: [
    { id: 'p1', name: 'Cupón Cine', price: 2000, emoji: '🎟️', desc: 'Canjeable' },
    { id: 'p2', name: 'Caja Sorpresa', price: 1500, emoji: '🎁', desc: 'Item Aleatorio' },
  ]
};

Page({
  data: {
    PALETTE,
    catalog: CATALOG,
    currentCategory: 'personalizar',
    userPoints: 2000,
    inventory: ['h1'], // Start with one hat owned
    selectedHat: '🎩',
    selectedAcc: '',
    showConfirmModal: false,
    pendingItem: null
  },

  onLoad() {
    // Initial setup if needed
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

  switchCategory(e) {
    const { cat } = e.currentTarget.dataset;
    this.setData({ currentCategory: cat });
  },

  onItemTap(e) {
    const { item } = e.currentTarget.dataset;
    const isOwned = this.data.inventory.includes(item.id);

    if (isOwned) {
      this.applyPreview(item);
    } else {
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
    my.showToast({ content: 'Vista previa actualizada', type: 'success' });
  },

  confirmPurchase() {
    const { pendingItem, userPoints, inventory } = this.data;
    
    if (userPoints >= pendingItem.price) {
      const newPoints = userPoints - pendingItem.price;
      const newInventory = [...inventory, pendingItem.id];
      
      this.setData({
        userPoints: newPoints,
        inventory: newInventory,
        showConfirmModal: false,
        pendingItem: null
      });

      my.showToast({ content: '¡Compra realizada!', type: 'success' });
      
      // Auto-preview if it's customization
      if (pendingItem.type) {
        this.applyPreview(pendingItem);
      }
    } else {
      my.showToast({ content: 'Puntos insuficientes', type: 'fail' });
      this.setData({ showConfirmModal: false, pendingItem: null });
    }
  },

  cancelPurchase() {
    this.setData({ showConfirmModal: false, pendingItem: null });
  }
});
