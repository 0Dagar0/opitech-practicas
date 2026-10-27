import { Component, ElementRef, AfterViewInit, ViewChild, HostListener } from '@angular/core';

@Component({
  selector: 'app-starfield',
  standalone: true,
  templateUrl: './starfield.html',
  styleUrls: ['./starfield.css']
})
export class StarfieldComponent implements AfterViewInit {
  @ViewChild('canvasRef', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private starsLayer1: { x: number; y: number; radius: number; alpha: number; speed: number }[] = [];
  private starsLayer2: { x: number; y: number; radius: number; alpha: number; speed: number }[] = [];
  private animationFrameId: number | null = null;
  private width = 0;
  private height = 0;

  ngAfterViewInit() {
    this.initCanvas();
    this.createStars();
    this.animate();
  }

  private initCanvas() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvas();
    // El resize lo gestiona @HostListener, que Angular limpia al destruir.
  }

  private resizeCanvas() {
    const canvas = this.canvasRef.nativeElement;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    canvas.width = this.width;
    canvas.height = this.height;
    this.createStars();
  }

  private createStars() {
    // Capa 1: estrellas pequeñas y lentas (fondo)
    this.starsLayer1 = [];
    for (let i = 0; i < 120; i++) {
      this.starsLayer1.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 0.8 + 0.3,
        alpha: Math.random() * 0.3 + 0.1,
        speed: Math.random() * 0.05 + 0.02
      });
    }
    // Capa 2: estrellas más grandes y rápidas (primer plano)
    this.starsLayer2 = [];
    for (let i = 0; i < 60; i++) {
      this.starsLayer2.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 1.2 + 0.6,
        alpha: Math.random() * 0.5 + 0.2,
        speed: Math.random() * 0.15 + 0.08
      });
    }
  }

  private animate() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Dibujar capa 1 (fondo)
    for (const star of this.starsLayer1) {
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.radius, 0, 2 * Math.PI);
      this.ctx.fillStyle = `rgba(255, 200, 150, ${star.alpha})`;
      this.ctx.fill();
      star.y += star.speed;
      if (star.y > this.height) {
        star.y = 0;
        star.x = Math.random() * this.width;
      }
    }

    // Dibujar capa 2 (primer plano)
    for (const star of this.starsLayer2) {
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.radius, 0, 2 * Math.PI);
      this.ctx.fillStyle = `rgba(255, 220, 180, ${star.alpha})`;
      this.ctx.fill();
      star.y += star.speed;
      if (star.y > this.height) {
        star.y = 0;
        star.x = Math.random() * this.width;
      }
    }

    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  @HostListener('window:resize')
  onResize() {
    this.resizeCanvas();
  }

  ngOnDestroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}