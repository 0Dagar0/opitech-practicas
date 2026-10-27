import { Component, ElementRef, AfterViewInit, ViewChild, HostListener } from '@angular/core';

@Component({
  selector: 'app-universe-background',
  standalone: true,
  templateUrl: './universe-background.html',
  styleUrls: ['./universe-background.css']
})
export class UniverseBackgroundComponent implements AfterViewInit {
  @ViewChild('canvasRef', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private animationFrameId: number | null = null;
  private width = 0;
  private height = 0;
  private time = 0;

  private nebulae = [
    { x: 0.3, y: 0.5, radius: 0.4, color: 'rgba(255, 100, 50, 0.25)', speedX: 0.02, speedY: 0.01, radiusSpeed: 0.005 },
    { x: 0.7, y: 0.4, radius: 0.5, color: 'rgba(150, 50, 200, 0.2)', speedX: -0.015, speedY: 0.02, radiusSpeed: 0.008 },
    { x: 0.5, y: 0.7, radius: 0.35, color: 'rgba(50, 150, 200, 0.18)', speedX: 0.01, speedY: -0.01, radiusSpeed: 0.006 },
    { x: 0.2, y: 0.8, radius: 0.3, color: 'rgba(200, 80, 120, 0.15)', speedX: -0.008, speedY: 0.015, radiusSpeed: 0.004 },
    { x: 0.8, y: 0.2, radius: 0.45, color: 'rgba(100, 180, 100, 0.12)', speedX: 0.012, speedY: -0.018, radiusSpeed: 0.007 }
  ];

  ngAfterViewInit() {
    this.initCanvas();
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
  }

  private animate() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.time += 0.016; 

    for (const neb of this.nebulae) {
      let x = neb.x + Math.sin(this.time * neb.speedX) * 0.05;
      let y = neb.y + Math.cos(this.time * neb.speedY) * 0.05;
      let radius = neb.radius + Math.sin(this.time * neb.radiusSpeed) * 0.05;
      x = Math.min(0.95, Math.max(0.05, x));
      y = Math.min(0.95, Math.max(0.05, y));
      radius = Math.min(0.6, Math.max(0.2, radius));

      const centerX = x * this.width;
      const centerY = y * this.height;
      const maxRadius = radius * Math.min(this.width, this.height);

      const grad = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
      grad.addColorStop(0, neb.color);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(0, 0, this.width, this.height);
    }

    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  private drawTextPattern() {
    if (!this.ctx) return;
    this.ctx.save();
    this.ctx.globalAlpha = 0.03;        
    this.ctx.font = 'bold 14px monospace';
    this.ctx.fillStyle = '#ffaa66';
    const text = 'OPITECH';
    const stepX = 180;
    const stepY = 100;
    const offsetX = (this.time * 2) % stepX;
    const offsetY = (this.time * 1) % stepY;
    for (let x = -stepX; x < this.width + stepX; x += stepX) {
      for (let y = -stepY; y < this.height + stepY; y += stepY) {
        this.ctx.fillText(text, x + offsetX, y + offsetY);
      }
    }
    this.ctx.restore();
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