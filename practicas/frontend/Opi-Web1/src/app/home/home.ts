import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UniverseBackgroundComponent } from '../components/universe-background/universe-background';
import { StarfieldComponent } from '../components/starfield/starfield';
import { HeroConstellationComponent } from '../components/hero-constellation/hero-constellation';
import { UiService } from '../services/ui';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, UniverseBackgroundComponent, StarfieldComponent, HeroConstellationComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {
  private readonly uiService = inject(UiService);

  abrirContacto(): void {
    this.uiService.abrirContacto();
  }
}
