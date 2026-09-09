import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { ListadoComponent } from './pages/libros/listado/listado.component';
import { DetalleComponent } from './pages/libros/detalle/detalle.component';
import { CarritoComponent } from './pages/carrito/carrito.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { ExitoComponent } from './pages/exito/exito.component';
import { AuthGuard } from './guards/auth.guard';
import { HomeComponent } from './pages/home/home.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { AgregarLibroComponent } from './pages/libros/agregar-libro/agregar-libro.component';

export const routes: Routes = [
  { path: '', redirectTo: '/libros', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'libros', component: ListadoComponent },
  { path: 'libros/:id', component: DetalleComponent }, 
  { path: 'carrito', component: CarritoComponent, canActivate: [AuthGuard] },
  { path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuard] },
  { path: 'exito', component: ExitoComponent, canActivate: [AuthGuard] },
  { path: 'home', component: HomeComponent },
{ path: 'perfil', component: PerfilComponent, canActivate: [AuthGuard] },
  { path: 'agregar-libro', component: AgregarLibroComponent },
  { path: '**', redirectTo: '/home' }
];
