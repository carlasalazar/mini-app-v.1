Page({
  data: {
    puntos: 0,
    record: 0,
    esNuevoRecord: false,
  },

  onLoad(query) {
    const puntos = parseInt(query.puntos) || 0;
    const record = parseInt(query.record) || 0;
    const esNuevoRecord = puntos >= record && puntos > 0;

    this.setData({ puntos, record, esNuevoRecord });
  },

  // Vuelve a jugar — regresa a la pantalla del juego
  jugarDeNuevo() {
    my.navigateBack({ delta: 1 });
  },

  // Vuelve al mapa Tiki Toka
  volverAlMapa() {
    my.navigateBack({ delta: 2 });
  },
});
