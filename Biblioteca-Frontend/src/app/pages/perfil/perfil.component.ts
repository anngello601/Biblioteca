import { Component, inject, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';


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
  private cdr = inject(ChangeDetectorRef); // 👈 NUEVO


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
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.cargando = false;
        this.error = err.error || 'Error al actualizar el perfil.';
        this.cdr.detectChanges(); // 👈 TAMBIÉN AQUÍ
        console.error(err);
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

    // 1️⃣ Validar nombre obligatorio
    if (!this.nombre || this.nombre.trim() === '') {
      this.error = 'El nombre es obligatorio.';
      this.cargando = false;
      return;
    }

    // 2️⃣ Validar contraseña (si se ingresó)
    if (this.password && this.password.trim() !== '' && this.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres.';
      this.cargando = false;
      return;
    }

    // 3️⃣ Crear FormData (siempre, porque el backend espera multipart/form-data)
    const formData = new FormData();
    formData.append('nombre', this.nombre.trim());

    // Contraseña (si se proporcionó)
    if (this.password && this.password.trim() !== '') {
      formData.append('password', this.password);
    }

    // 4️⃣ Manejar la imagen:
    // - Si hay un archivo seleccionado, lo enviamos como 'avatar'
    // - Si NO hay archivo pero SÍ hay URL manual, la enviamos como 'avatarUrl'
    // - Si no hay ni archivo ni URL, no enviamos nada (el backend mantiene la actual)
    if (this.selectedFile) {
      formData.append('avatar', this.selectedFile, this.selectedFile.name);
    } else if (this.modoImagen === 'url' && this.avatarUrl && this.avatarUrl.trim() !== '') {
      formData.append('avatarUrl', this.avatarUrl.trim());
    }

    // 5️⃣ Enviar la petición
    this.http.put('http://localhost:8080/api/auth/perfil', formData, { withCredentials: true })
      .subscribe({
        next: (response: any) => {
          this.cargando = false;
          this.mensaje = '✅ Perfil actualizado correctamente.';
          if (response.avatarUrl) {
            this.avatarPreview.set(response.avatarUrl);
            this.avatarUrl = response.avatarUrl;
          }
          this.selectedFile = null;
          if (this.fileInput) {
            this.fileInput.nativeElement.value = '';
          }
          this.authService.actualizarUsuarioEnSesion(response);
          this.cdr.detectChanges(); // 👈 FORZAR REFRESCO
        },
        error: (err) => {
          this.cargando = false;
          this.error = err.error || 'Error al actualizar el perfil.';
          console.error(err);
          this.cdr.detectChanges(); // 👈 FORZAR REFRESCO
        }
      });
  }


// 👉 Cancelar
cancelar() {
  this.router.navigate(['/libros']);
}
}