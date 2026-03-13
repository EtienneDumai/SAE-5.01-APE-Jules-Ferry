import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./components/header/header.component";
import { ToastComponent } from "./components/toast/toast.component";
import { FooterComponent } from "./components/footer/footer.component";
import { AuthService } from './services/Auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FooterComponent, HeaderComponent, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'frontend';
  private readonly authService = inject(AuthService);

  ngOnInit(): void {
    this.authService.init(); 
  }
}