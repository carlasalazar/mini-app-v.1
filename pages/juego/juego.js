Page({
  data: {
    estiloFondo: 'background-color: #071B45;',
    puntos: 0,
    tiempoRestante: 60,
    juegoActivo: false,
    cuentaRegresiva: 3,
    mostrandoCuenta: true,
    objetos: [],
    anchoCanasta: 120,
    canastaX: 315, // Posición inicial centrada ( (750 - 120) / 2 )
  },
  moverCanasta(e) {
    if (!this.data.juegoActivo) return;
    const xPx = e.touches[0].clientX;
    const anchoCanasta = this.data.anchoCanasta;
    const mitad = anchoCanasta / 2;
    // Conversión px a rpx (basado en el estándar de 750rpx de ancho total)
    let xRpx = (xPx / 375) * 750;
    xRpx = Math.max(mitad, Math.min(750 - mitad, xRpx));
    this.setData({ canastaX: xRpx - mitad });
  },
  onLoad(query) {
    const colorFondo = decodeURIComponent(query.colorFondo || '#071B45');
    this.setData({
      estiloFondo: `background-color: ${colorFondo};`
    });
    this.iniciarCuentaRegresiva();
  },
  iniciarCuentaRegresiva() {
    let cuenta = 3;
    this.setData({ mostrandoCuenta: true, cuentaRegresiva: cuenta });

    this.intervaloCuenta = setInterval(() => {
      cuenta--;
      if (cuenta > 0) {
        this.setData({ cuentaRegresiva: cuenta });
      } else {
        clearInterval(this.intervaloCuenta);
        this.setData({
          cuentaRegresiva: '¡Ya!',
        });
        // después de mostrar "¡Ya!" medio segundo, ocultamos la cuenta y activamos el juego
        setTimeout(() => {
          this.setData({
            mostrandoCuenta: false,
            juegoActivo: true,
          });
          this.iniciarObjetos();
          this.iniciarTimer();
        }, 600);
      }
    }, 1000);
  },
  iniciarTimer() {
    this.timerLoop = setInterval(() => {
      const tiempoRestante = this.data.tiempoRestante - 1;

      if (tiempoRestante <= 0) {
        this.limpiarIntervalos();
        this.setData({
          tiempoRestante: 0,
          juegoActivo: false,
        });
        this.terminarJuego();
      } else {
        this.setData({ tiempoRestante });
      }
    }, 1000);
  },
  terminarJuego() {
    const puntos = this.data.puntos;

    my.getStorage({
      key: 'record_atrapa',
      success: res => {
        const recordAnterior = res.data || 0;
        const nuevoRecord = Math.max(puntos, recordAnterior);

        my.setStorage({
          key: 'record_atrapa',
          data: nuevoRecord,
          success: () => {
            my.navigateTo({
              url: `/pages/resultado/resultado?puntos=${puntos}&record=${nuevoRecord}`,
              fail(err) { console.error('Error al navegar a resultado:', err); }
            });
          },
          fail() { console.error('Error al guardar récord'); }
        });
      },
      fail: () => {
        my.setStorage({
          key: 'record_atrapa',
          data: puntos,
          success: () => {
            my.navigateTo({
              url: `/pages/resultado/resultado?puntos=${puntos}&record=${puntos}`,
              fail(err) { console.error('Error al navegar a resultado:', err); }
            });
          },
          fail() { console.error('Error al guardar récord'); }
        });
      }
    });
  },
  generarObjeto() {
    const tipos = ['normal', 'especial', 'trampa'];
    const rand = Math.random();
    let tipo = 'normal';
    if (rand > 0.8) tipo = 'trampa';
    else if (rand > 0.6) tipo = 'especial';

    return {
      id: Date.now() + Math.random(),
      tipo,
      x: Math.floor(Math.random() * 630) + 60, // entre 60 y 690 rpx
      y: -100, // empieza un poco arriba para que entre fluido
      visible: true,
    };
  },
  iniciarObjetos() {
    const objetos = [this.generarObjeto()];
    this.setData({ objetos });

    this.gameLoop = setInterval(() => {
      if (!this.data.juegoActivo) return;

      const { canastaX, anchoCanasta, puntos } = this.data;
      const velocidad = 12; // rpx por tick
      const fondoPantalla = 1200; // rpx
      const fondoCanasta = 1000; // rpx - altura ajustada para detección visual
      const margenColision = anchoCanasta / 2;
      
      let nuevosPuntos = puntos;
      let huboColision = false;

      let objetosActualizados = this.data.objetos.map(obj => {
        const nuevaY = obj.y + velocidad;
        
        // Solo verificamos colisión si el objeto llega a la altura de la canasta
        if (nuevaY >= fondoCanasta && obj.y < fondoCanasta + 100) {
          const centroObjeto = obj.x + 40; // 40 = mitad del ancho del objeto (80/2)
          const centroCanasta = canastaX + margenColision;
          const distancia = Math.abs(centroObjeto - centroCanasta);

          if (distancia < margenColision + 20) {
            huboColision = true;
            if (obj.tipo === 'normal') nuevosPuntos += 1;
            else if (obj.tipo === 'especial') nuevosPuntos += 3;
            else if (obj.tipo === 'trampa') nuevosPuntos = Math.max(0, nuevosPuntos - 1);
            return { ...obj, y: nuevaY, visible: false }; // Marcar como recolectado
          }
        }
        return { ...obj, y: nuevaY };
      });

      // Filtrar objetos que salieron de pantalla o fueron recolectados
      objetosActualizados = objetosActualizados.filter(obj => obj.y < fondoPantalla && obj.visible !== false);

      if (objetosActualizados.length < 2) {
        objetosActualizados.push(this.generarObjeto());
      }

      this.setData({ 
        objetos: objetosActualizados, 
        puntos: nuevosPuntos 
      });

      if (huboColision) {
        my.vibrate({ success() {}, fail() {} });
      }
    }, 50);
  },
  onUnload() {
    this.limpiarIntervalos();
  },
  onHide() {
    this.limpiarIntervalos();
  },
  limpiarIntervalos() {
    if (this.intervaloCuenta) clearInterval(this.intervaloCuenta);
    if (this.gameLoop) clearInterval(this.gameLoop);
  }
});
