import { Component, inject, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css'],
})
export class PerfilComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  readonly defaultAvatarUrl = 'https://i.ibb.co/nM8GvScD/pngwing-com.png';

  // Datos del formulario
  nombre = '';
  password = '';
  avatarUrl = '';
  selectedFile: File | null = null;
  modoImagen: 'url' | 'file' = 'url';

  // Signals para UI
  avatarPreview = signal<string>(this.defaultAvatarUrl);
  mensaje = signal('');
  error = signal('');
  cargando = signal(false);

  constructor() {
    this.cargarPerfil();
  }

  // ==========================
  // Cargar datos del usuario
  // ==========================
  private cargarPerfil(): void {
    this.authService.getUsuarioActual().subscribe({
      next: (user: Usuario | null) => {
        if (user) {
          this.nombre = user.nombre ?? '';
          this.avatarUrl = user.avatarUrl ?? '';
          this.avatarPreview.set(user.avatarUrl || this.defaultAvatarUrl);
          if (user.avatarUrl) this.modoImagen = 'url';
        }
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Error al cargar el perfil.');
        console.error(err);
      },
    });
  }

  // ==========================
  // Manejo de archivo
  // ==========================
  onDragOver(event: DragEvent) {
    event.preventDefault();
  }
  onDragLeave(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) this.procesarArchivo(file);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.procesarArchivo(file);
  }

  private procesarArchivo(file: File) {
    if (!file.type.startsWith('image/')) {
      this.error.set('Solo se permiten imágenes.');
      return;
    }
    this.selectedFile = file;
    this.modoImagen = 'file';
    this.avatarUrl = '';

    const reader = new FileReader();
    reader.onload = (e) => this.avatarPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);

    this.error.set('');
  }

  // ==========================
  // Previsualizar URL manual
  // ==========================
  previsualizarUrl() {
    if (this.avatarUrl && this.avatarUrl.trim() !== '') {
      this.modoImagen = 'url';
      this.selectedFile = null;
      this.avatarPreview.set(this.avatarUrl);
      this.error.set('');
    } else {
      this.avatarPreview.set(this.defaultAvatarUrl);
    }
  }

  // ==========================
  // Guardar perfil (UNA SOLA llamada)
  // ==========================
  guardarPerfil() {
    this.error.set('');
    this.mensaje.set('');

    // 1. Validar nombre
    if (!this.nombre || this.nombre.trim() === '') {
      this.error.set('El nombre es obligatorio.');
      return;
    }

    // 2. Validar contraseña (si se ingresó)
    if (this.password && this.password.length < 6) {
      this.error.set('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    // 3. Construir FormData
    const formData = new FormData();
    formData.append('nombre', this.nombre.trim());

    if (this.password && this.password.trim() !== '') {
      formData.append('password', this.password);
    }

    if (this.selectedFile) {
      formData.append('avatar', this.selectedFile, this.selectedFile.name);
    } else if (this.modoImagen === 'url' && this.avatarUrl.trim() !== '') {
      formData.append('avatarUrl', this.avatarUrl.trim());
    }

    // 4. UNA sola llamada al backend (a través del servicio)
    this.cargando.set(true);

    this.authService.actualizarPerfil(formData).subscribe({
      next: (response: Usuario) => {
        this.cargando.set(false);
        this.mensaje.set('✅ Perfil actualizado correctamente.');
        this.password = ''; // limpia contraseña
        this.selectedFile = null;
        if (response.avatarUrl) {
          this.avatarPreview.set(response.avatarUrl);
          this.avatarUrl = response.avatarUrl;
        }
        if (this.fileInput) {
          this.fileInput.nativeElement.value = '';
        }
        // El navbar se actualiza SOLO porque AuthService usa signals
      },
      error: (err) => {
        this.cargando.set(false);
        this.error.set(
          typeof err.error === 'string'
            ? err.error
            : err.error?.message || 'Error al actualizar el perfil.',
        );
        console.error(err);
      },
    });
  }

  // ==========================
  // Cancelar
  // ==========================
  cancelar() {
    this.router.navigate(['/libros']);
  }
}
