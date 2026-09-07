export interface Libro {
  id: number;              // <-- Quita el '?' para que sea obligatorio
  nombre: string;
  tipo: 'DIGITAL' | 'FISICO';
  editorial: string;
  anioPublicacion: number;
  precio: number;
  stock: number;
  portada?: string;        // Este sí puede ser opcional
}