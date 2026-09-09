import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';

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

  readonly defaultAvatarUrl = 'https://i.ibb.co/nM8GvScD/pngwing-com.png';
  usuario = toSignal<any>(this.authService.usuario$, { initialValue: null });
  avatarPreview = signal<string>(this.defaultAvatarUrl);
  selectedFile = signal<File | null>(null);
  formData = signal({ nombre: '', password: '' });

  constructor() {
    // 👇 SOLUCIÓN: Acepta 'any' para que no se queje TypeScript
    this.authService.getUsuarioActual().subscribe({
      next: (user: any) => {
        if (user) {
          this.formData.update(f => ({ ...f, nombre: user.nombre }));
          this.avatarPreview.set(user.avatarUrl || this.defaultAvatarUrl);
        }
      },
      error: (err) => console.error('Error al cargar usuario:', err)
    });
  }

  onDragOver(event: DragEvent) { event.preventDefault(); }
  onDragLeave(event: DragEvent) {}
  onDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) this.handleFile(file);
  }
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.handleFile(file);
  }
  private handleFile(file: File) {
    this.selectedFile.set(file);
    const reader = new FileReader();
    reader.onload = (e) => this.avatarPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  guardarPerfil() {
    const formData = new FormData();
    formData.append('nombre', this.formData().nombre);
    if (this.formData().password) {
      formData.append('password', this.formData().password);
    }
    if (this.selectedFile()) {
      formData.append('avatar', this.selectedFile()!);
    }

    this.http.put('http://localhost:8080/api/auth/perfil', formData, { withCredentials: true })
      .subscribe({
        next: () => {
          alert('Perfil actualizado correctamente');
          window.location.reload();
        },
        error: (err) => console.error('Error al actualizar', err)
      });
  }
}