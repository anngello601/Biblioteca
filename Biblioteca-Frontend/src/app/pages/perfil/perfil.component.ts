import { Component, inject, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  readonly defaultAvatarUrl = 'https://i.ibb.co/nM8GvScD/pngwing-com.png';
  
  // Estado del formulario
  nombre = '';
  password = '';
  // Para la foto
  avatarUrl = '';           // URL manual
  selectedFile: File | null = null;
  avatarPreview = signal<string>(this.defaultAvatarUrl);
  modoImagen: 'url' | 'file' = 'url'; // para saber qué modo usar al guardar

  // Mensajes
  mensaje = '';
  error = '';
  cargando = false;

  constructor() {
    // Cargar datos del usuario actual
    this.authService.getUsuarioActual().subscribe({
      next: (user: any) => {
        if (user) {
          this.nombre = user.nombre;
          this.avatarUrl = user.avatarUrl || '';
          this.avatarPreview.set(user.avatarUrl || this.defaultAvatarUrl);
          // Si tiene avatarUrl, lo mostramos
          if (user.avatarUrl) {
            this.modoImagen = 'url';
          }
        }
      },
      error: () => {
        this.error = 'No se pudo cargar el perfil. Inicia sesión nuevamente.';
        this.router.navigate(['/login']);
      }
    });
  }

  // 👉 Manejo de archivo (drag & drop / click)
  onDragOver(event: DragEvent) {
    event.preventDefault();
  }
  onDragLeave(event: DragEvent) {
    event.preventDefault();
  }
  onDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) {
      this.procesarArchivo(file);
    }
  }
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.procesarArchivo(file);
    }
  }

  private procesarArchivo(file: File) {
    if (!file.type.startsWith('image/')) {
      this.error = 'Solo se permiten imágenes.';
      return;
    }
    this.selectedFile = file;
    this.modoImagen = 'file';
    // Vista previa local
    const reader = new FileReader();
    reader.onload = (e) => {
      this.avatarPreview.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    // Limpiar el campo URL para no confundir
    this.avatarUrl = '';
    this.error = '';
  }

  // 👉 Previsualizar URL manual
  previsualizarUrl() {
    if (this.avatarUrl && this.avatarUrl.trim() !== '') {
      this.modoImagen = 'url';
      this.selectedFile = null; // si se usa URL, descartar archivo
      this.avatarPreview.set(this.avatarUrl);
      this.error = '';
    } else {
      // Si la URL está vacía, volver a la imagen por defecto (o la actual)
      this.avatarPreview.set(this.avatarUrl || this.defaultAvatarUrl);
    }
  }

  // 👉 Guardar perfil
  guardarPerfil() {
    this.error = '';
    this.mensaje = '';
    this.cargando = true;

    // Construir el objeto a enviar
    const data: any = {
      nombre: this.nombre
    };
    if (this.password && this.password.trim() !== '') {
      if (this.password.length < 6) {
        this.error = 'La contraseña debe tener al menos 6 caracteres.';
        this.cargando = false;
        return;
      }
      data.password = this.password;
    }

    // Decidir qué enviar: URL o archivo
    if (this.modoImagen === 'url' && this.avatarUrl && this.avatarUrl.trim() !== '') {
      data.avatarUrl = this.avatarUrl;
    } else if (this.modoImagen === 'file' && this.selectedFile) {
      // Si hay archivo, usamos FormData
      const formData = new FormData();
      formData.append('nombre', data.nombre);
      if (data.password) formData.append('password', data.password);
      formData.append('avatar', this.selectedFile);
      
      this.http.put('http://localhost:8080/api/auth/perfil', formData, { withCredentials: true })
        .subscribe({
          next: (response: any) => {
            this.cargando = false;
            this.mensaje = '✅ Perfil actualizado correctamente.';
            // Actualizar la vista previa con la nueva imagen del backend
            if (response.avatarUrl) {
              this.avatarPreview.set(response.avatarUrl);
              this.avatarUrl = response.avatarUrl;
            }
            // Resetear el campo de archivo
            this.selectedFile = null;
            if (this.fileInput) {
              this.fileInput.nativeElement.value = '';
            }
            // Actualizar el BehaviorSubject del AuthService (para navbar)
            this.authService.actualizarUsuarioEnSesion(response);
          },
          error: (err) => {
            this.cargando = false;
            this.error = err.error || 'Error al actualizar el perfil.';
            console.error(err);
          }
        });
      return;
    }

    // Si no hay archivo ni URL, solo enviar JSON
    this.http.put('http://localhost:8080/api/auth/perfil', data, { withCredentials: true })
      .subscribe({
        next: (response: any) => {
          this.cargando = false;
          this.mensaje = '✅ Perfil actualizado correctamente.';
          if (response.avatarUrl) {
            this.avatarPreview.set(response.avatarUrl);
            this.avatarUrl = response.avatarUrl;
          }
          // Actualizar el BehaviorSubject
          this.authService.actualizarUsuarioEnSesion(response);
        },
        error: (err) => {
          this.cargando = false;
          this.error = err.error || 'Error al actualizar el perfil.';
          console.error(err);
        }
      });
  }

  // 👉 Cancelar
  cancelar() {
    this.router.navigate(['/libros']);
  }
}