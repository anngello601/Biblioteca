export interface PagoDemo {
  id: string;
  fecha: string;
  total: number;
  metodoPago: string;
  estadoPago: 'DEMO_NO_REAL';
}
export interface PagoDemoDetalle {
  nombre: string;
  autor: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface PagoDemo {
  id: string;
  fecha: string;
  total: number;
  metodoPago: string;
  estadoPago: 'DEMO_NO_REAL';
  empresa: {
    nombre: string;
    rucDemo: string;
  };
  comprador: {
    nombre: string;
    email: string;
  };
  detalles: PagoDemoDetalle[];
}
