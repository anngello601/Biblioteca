export interface Libro {
  id: number;
  nombre: string;
  tipo: 'DIGITAL' | 'FISICO';
  editorial: string;
  anioPublicacion: number;
  precio: number;
  stock: number;
  portada?: string;
  autor?: string;   // 👈 AÑADIR ESTE CAMPO
}