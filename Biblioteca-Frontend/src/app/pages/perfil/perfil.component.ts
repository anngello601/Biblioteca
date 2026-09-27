import { Component, inject, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
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

  readonly defaultAvatarUrl =
    'https://www.nicepng.com/png/full/115-1150821_default-avatar-comments-sign-in-icon-png.png';

  nombre = '';
  password = '';
  avatarUrl = '';
  selectedFile: File | null = null;
  modoImagen: 'url' | 'file' = 'url';

  avatarPreview = signal<string>(this.defaultAvatarUrl);
  mensaje = signal('');
  error = signal('');
  cargando = signal(false);

  constructor() {
    this.cargarPerfil();
  }

  private cargarPerfil() {
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
      },
    });
  }

  // ==================== MANEJO DE ARCHIVO ====================
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
      this.error.set('Solo se permiten imágenes (JPG, PNG, WEBP…).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.error.set('La imagen no puede superar 10 MB.');
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

  previsualizarUrl() {
    if (this.avatarUrl && this.avatarUrl.trim() !== '') {
      this.modoImagen = 'url';
      this.selectedFile = null;
      this.avatarPreview.set(this.avatarUrl.trim());
      this.error.set('');
    } else {
      this.avatarPreview.set(this.defaultAvatarUrl);
    }
  }

  // ==================== GUARDAR ====================
  guardarPerfil() {
    this.error.set('');
    this.mensaje.set('');

    if (!this.nombre || this.nombre.trim() === '') {
      this.error.set('El nombre es obligatorio.');
      return;
    }

    if (this.password && this.password.length < 6) {
      this.error.set('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

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

    this.cargando.set(true);

    this.authService.actualizarPerfil(formData).subscribe({
      next: (response: Usuario) => {
        this.cargando.set(false);
        this.mensaje.set('✅ Perfil actualizado correctamente.');

        this.password = '';
        this.selectedFile = null;
        if (this.fileInput) this.fileInput.nativeElement.value = '';

        if (response.avatarUrl) {
          this.avatarUrl = response.avatarUrl;
          this.avatarPreview.set(response.avatarUrl);
          this.modoImagen = 'url';
        }
      },
      error: (err) => {
        this.cargando.set(false);
        this.error.set(
          typeof err.error === 'string'
            ? err.error
            : err.error?.message || 'Error al actualizar el perfil.',
        );
      },
    });
  }

  cancelar() {
    this.router.navigate(['/libros']);
  }
}
