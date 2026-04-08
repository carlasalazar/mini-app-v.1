App({
  globalData: {
    userInfo: null,
    navigationHistory: [],
    // Game State
    userPoints: 2000,
    stats: {
      bondad: 70,
      inteligencia: 45,
      fuerza: 80
    },
    inventory: [
      { id: "paja",       nombre: "Paja",     qty: 15, dureza: 15, img: "/assets/icons/tokaya_v1.png" },
      { id: "madera",     nombre: "Madera",   qty: 8,  dureza: 45, img: "/assets/icons/tokaya_v1.png" },
      { id: "piedra",     nombre: "Piedra",   qty: 22, dureza: 70, img: "/assets/icons/tokaya_v1.png" },
      { id: "cristal",    nombre: "Cristal",  qty: 3,  dureza: 30, img: "/assets/icons/tokaya_v1.png" },
      { id: "metal",      nombre: "Metal",    qty: 12, dureza: 90, img: "/assets/icons/tokaya_v1.png" },
      { id: "obsidiana",  nombre: "Obsidiana",qty: 1,  dureza: 99, img: "/assets/icons/tokaya_v1.png" },
    ],
    toolsInventory: {
      hammers: 0,
      picks: 0,
      swords: 0
    }
  },
  onLaunch(options) {
    console.log('App Launch', options);
  },
  // Global Actions
  addPoints(amount) {
    this.globalData.userPoints += amount;
  },
  addTool(toolType, amount = 1) {
    if (this.globalData.toolsInventory[toolType] !== undefined) {
      this.globalData.toolsInventory[toolType] += amount;
    }
  },
  updateStat(statName, value) {
    this.globalData.stats[statName] = Math.min(Math.max((this.globalData.stats[statName] || 0) + value, 0), 100);
  },
  deductInventory(itemId, amount = 1) {
    const item = this.globalData.inventory.find(i => i.id === itemId);
    if (item && item.qty >= amount) {
      item.qty -= amount;
      return true;
    }
    return false;
  }
});
