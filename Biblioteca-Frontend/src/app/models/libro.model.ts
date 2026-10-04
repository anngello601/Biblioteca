export interface Libro {
  id: number; // 👈 Agrega el signo de interrogación
  nombre: string;
  tipo: 'DIGITAL' | 'FISICO';
  editorial: string;
  anioPublicacion: number;
  precio: number;
  stock: number;
  portada: string;
  autor: string;
  descripcion: string;
}