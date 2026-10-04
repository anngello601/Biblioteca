import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BoletaService } from '../../services/boleta.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent {
  constructor(private boletaService: BoletaService, private router: Router) {}

  confirmar() {
    this.boletaService.confirmarCompra().subscribe({
      next: () => this.router.navigate(['/exito']),
      error: (err) => alert('Error: ' + err.error)
    });
  }
}