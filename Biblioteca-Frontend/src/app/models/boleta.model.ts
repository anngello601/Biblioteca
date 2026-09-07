// models/boleta.model.ts
export interface DetalleBoleta {
  id?: number;
  libroId: number;
  cantidad: number;
  precioUnitario: number;
}

export interface Boleta {
  id: number;
  usuarioId: number;
  fecha: string;
  total: number;
  detalles: DetalleBoleta[];
}