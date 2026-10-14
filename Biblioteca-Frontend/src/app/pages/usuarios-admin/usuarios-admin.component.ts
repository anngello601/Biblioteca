import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Usuario } from '../../models/usuario.model';
import { AuthService } from '../../services/auth.service';
import { UsuarioAdminRequest, UsuarioAdminService } from '../../services/usuario-admin.service';

@Component({
  selector: 'app-usuarios-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios-admin.component.html'
})
export class UsuariosAdminComponent implements OnInit {
  private readonly usuarioAdminService = inject(UsuarioAdminService);
  private readonly authService = inject(AuthService);

  usuarios = signal<Usuario[]>([]);
  editandoId = signal<number | null>(null);
  cargando = signal(false);
  error = signal('');
  mensaje = signal('');
  busqueda = '';
  formulario: UsuarioAdminRequest = this.formularioVacio();
  administradorId: number | undefined;

  ngOnInit(): void {
    this.authService.usuario$.subscribe(usuario => this.administradorId = usuario?.id);
    this.cargarUsuarios();
  }

  get usuariosFiltrados(): Usuario[] {
    const termino = this.busqueda.trim().toLocaleLowerCase();
    if (!termino) return this.usuarios();
    return this.usuarios().filter(usuario =>
      usuario.nombre.toLocaleLowerCase().includes(termino) ||
      usuario.email.toLocaleLowerCase().includes(termino) ||
      usuario.rol?.toLocaleLowerCase().includes(termino)
    );
  }

  cargarUsuarios(): void {
    this.cargando.set(true);
    this.error.set('');
    this.usuarioAdminService.listar().subscribe({
      next: usuarios => {
        this.usuarios.set(usuarios);
        this.cargando.set(false);
      },
      error: err => {
        this.error.set(this.errorDe(err, 'No se pudieron cargar los usuarios.'));
        this.cargando.set(false);
      }
    });
  }

  guardar(): void {
    this.error.set('');
    this.mensaje.set('');
    const request = { ...this.formulario };
    if (!request.password?.trim()) delete request.password;
    if (this.editandoId() === null && !request.password) {
      this.error.set('La contraseña es obligatoria para crear un usuario.');
      return;
    }

    this.cargando.set(true);
    const id = this.editandoId();
    const operacion = id === null
      ? this.usuarioAdminService.crear(request)
      : this.usuarioAdminService.actualizar(id, request);
    operacion.subscribe({
      next: () => {
        this.mensaje.set(id === null ? 'Usuario creado correctamente.' : 'Usuario actualizado correctamente.');
        this.limpiarFormulario();
        this.cargarUsuarios();
      },
      error: err => {
        this.error.set(this.errorDe(err, 'No se pudo guardar el usuario.'));
        this.cargando.set(false);
      }
    });
  }

  editar(usuario: Usuario): void {
    this.editandoId.set(usuario.id ?? null);
    this.formulario = {
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol ?? 'CLIENTE',
      password: ''
    };
    this.error.set('');
    this.mensaje.set('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminar(usuario: Usuario): void {
    if (!usuario.id || usuario.id === this.administradorId) return;
    if (!confirm(`¿Eliminar la cuenta de ${usuario.nombre}?`)) return;

    this.cargando.set(true);
    this.usuarioAdminService.eliminar(usuario.id).subscribe({
      next: () => {
        this.mensaje.set('Usuario eliminado correctamente.');
        this.cargarUsuarios();
      },
      error: err => {
        this.error.set(this.errorDe(err, 'No se pudo eliminar el usuario.'));
        this.cargando.set(false);
      }
    });
  }

  limpiarFormulario(): void {
    this.editandoId.set(null);
    this.formulario = this.formularioVacio();
  }

  private formularioVacio(): UsuarioAdminRequest {
    return { nombre: '', email: '', password: '', rol: 'CLIENTE' };
  }

  private errorDe(err: unknown, predeterminado: string): string {
    const error = err as { error?: unknown; status?: number };
    if (typeof error.error === 'string') return error.error;
    if (typeof error.error === 'object' && error.error !== null &&
        'error' in error.error && typeof error.error.error === 'string') return error.error.error;
    if (error.status === 0) return 'No se pudo conectar con el backend.';
    if (error.status === 401) return 'Inicia sesión nuevamente.';
    if (error.status === 403) return 'Solo administradores pueden gestionar usuarios.';
    return predeterminado;
  }
}
