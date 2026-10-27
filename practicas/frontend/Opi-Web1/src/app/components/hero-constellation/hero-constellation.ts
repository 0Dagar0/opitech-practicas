import { Component, ElementRef, AfterViewInit, ViewChild, HostListener } from '@angular/core';

interface StarWithProgress {
  x: number;
  y: number;
  segmentIndex: number;
  t: number;
  globalOrder: number;
}

interface LetterPath {
  name: string;
  segments: [number, number, number, number][];
  stars: StarWithProgress[];
  offset: number;
  transform: (centerX: number, centerY: number) => {
    segments: [number, number, number, number][];
    stars: StarWithProgress[];
  };
}

@Component({
  selector: 'app-hero-constellation',
  standalone: true,
  templateUrl: './hero-constellation.html',
  styleUrls: ['./hero-constellation.css']
})
export class HeroConstellationComponent implements AfterViewInit {
  @ViewChild('canvasRef', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private letters: LetterPath[] = [];
  private animationFrameId: number | null = null;
  private startTime = 0;

  // Duraciones (ms)
  private drawDuration = 1500;
  private glowDuration = 400;
  private fadeDuration = 800;
  private pauseDuration = 4000;   
  private totalCycle = this.drawDuration + this.glowDuration + this.fadeDuration + this.pauseDuration;

  private extraScale = 0.62;
  private centerX = 0;
  private centerY = 0;
  private reposicionPendiente = false;

  ngAfterViewInit() {
    this.initCanvas();
    this.defineLetters();
    this.startAnimation();
  }

  ngOnDestroy() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private initCanvas() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvas();
  }

  private resizeCanvas() {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  private defineLetters() {
    
    const rawLetters = [
      {
        name: 'O', segments: [[0.30, 0.35, 0.35, 0.32], [0.35, 0.32, 0.40, 0.31], [0.40, 0.31, 0.45, 0.32], [0.45, 0.32, 0.50, 0.35], [0.50, 0.35, 0.50, 0.40], [0.50, 0.40, 0.50, 0.45], [0.50, 0.45, 0.45, 0.48], [0.45, 0.48, 0.40, 0.49], [0.40, 0.49, 0.35, 0.48], [0.35, 0.48, 0.30, 0.45], [0.30, 0.45, 0.30, 0.40], [0.30, 0.40, 0.30, 0.35]],
        stars: [[0.30, 0.35], [0.35, 0.32], [0.40, 0.31], [0.45, 0.32], [0.50, 0.35], [0.50, 0.40], [0.50, 0.45], [0.45, 0.48], [0.40, 0.49], [0.35, 0.48], [0.30, 0.45]]
      },
      {
        name: 'P', segments: [[0.55, 0.31, 0.55, 0.36], [0.55, 0.36, 0.55, 0.41], [0.55, 0.41, 0.55, 0.46], [0.55, 0.46, 0.55, 0.51], [0.55, 0.31, 0.62, 0.31], [0.62, 0.31, 0.66, 0.34], [0.66, 0.34, 0.66, 0.39], [0.66, 0.39, 0.62, 0.42], [0.62, 0.42, 0.55, 0.41]],
        stars: [[0.55, 0.31], [0.55, 0.36], [0.55, 0.41], [0.55, 0.46], [0.55, 0.51], [0.62, 0.31], [0.66, 0.34], [0.66, 0.39], [0.62, 0.42]]
      },
      {
        name: 'I', segments: [[0.72, 0.31, 0.78, 0.31], [0.72, 0.31, 0.75, 0.34], [0.78, 0.31, 0.75, 0.34], [0.75, 0.34, 0.75, 0.39], [0.75, 0.39, 0.75, 0.44], [0.75, 0.44, 0.75, 0.49], [0.75, 0.49, 0.72, 0.52], [0.75, 0.49, 0.78, 0.52]],
        stars: [[0.72, 0.31], [0.78, 0.31], [0.75, 0.34], [0.75, 0.39], [0.75, 0.44], [0.75, 0.49], [0.72, 0.52], [0.78, 0.52]]
      },
      {
        name: 'T', segments: [[0.83, 0.31, 0.92, 0.31], [0.83, 0.31, 0.875, 0.34], [0.92, 0.31, 0.875, 0.34], [0.875, 0.34, 0.875, 0.39], [0.875, 0.39, 0.875, 0.44], [0.875, 0.44, 0.875, 0.49]],
        stars: [[0.83, 0.31], [0.92, 0.31], [0.875, 0.34], [0.875, 0.39], [0.875, 0.44], [0.875, 0.49]]
      },
      {
        name: 'E', segments: [[0.98, 0.31, 1.07, 0.31], [0.98, 0.31, 0.98, 0.41], [0.98, 0.41, 1.07, 0.41], [0.98, 0.41, 0.98, 0.51], [0.98, 0.51, 1.07, 0.51]],
        stars: [[0.98, 0.31], [1.07, 0.31], [0.98, 0.41], [1.07, 0.41], [0.98, 0.51], [1.07, 0.51]]
      },
      {
        name: 'C', segments: [[1.13, 0.34, 1.21, 0.34], [1.13, 0.34, 1.13, 0.49], [1.13, 0.49, 1.21, 0.49]],
        stars: [[1.13, 0.34], [1.21, 0.34], [1.13, 0.41], [1.13, 0.49], [1.21, 0.49]]
      },
      {
        name: 'H', segments: [[1.28, 0.31, 1.28, 0.36], [1.28, 0.36, 1.28, 0.41], [1.28, 0.41, 1.28, 0.46], [1.28, 0.46, 1.28, 0.51], [1.35, 0.31, 1.35, 0.36], [1.35, 0.36, 1.35, 0.41], [1.35, 0.41, 1.35, 0.46], [1.35, 0.46, 1.35, 0.51], [1.28, 0.41, 1.35, 0.41]],
        stars: [[1.28, 0.31], [1.28, 0.36], [1.28, 0.41], [1.28, 0.46], [1.28, 0.51], [1.35, 0.31], [1.35, 0.36], [1.35, 0.41], [1.35, 0.46], [1.35, 0.51]]
      }
    ];

    const allPoints: [number, number][] = [];
    for (const letter of rawLetters) {
      for (const seg of letter.segments) {
        allPoints.push([seg[0], seg[1]]);
        allPoints.push([seg[2], seg[3]]);
      }
      for (const star of letter.stars) {
        allPoints.push([star[0], star[1]] as [number, number]);
      }
    }

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const p of allPoints) {
      minX = Math.min(minX, p[0]);
      maxX = Math.max(maxX, p[0]);
      minY = Math.min(minY, p[1]);
      maxY = Math.max(maxY, p[1]);
    }

    const canvas = this.canvasRef.nativeElement;
    // En móvil se deja menos margen lateral para que la palabra no quede diminuta.
    const marginPercent = canvas.width < 768 ? 0.08 : 0.2;
    const groupWidth = maxX - minX;
    const groupHeight = maxY - minY;
    const maxAllowedWidth = canvas.width * (1 - 2 * marginPercent);
    const maxAllowedHeight = canvas.height * 0.3;
    const scaleFactor =
      Math.min(maxAllowedWidth / groupWidth, maxAllowedHeight / groupHeight) * this.extraScale;

    const groupCenterX = (minX + maxX) / 2;
    const groupCenterY = (minY + maxY) / 2;

    this.letters = rawLetters.map((letter, idx) => {
      const originalSegments = letter.segments.map(seg => [...seg] as [number, number, number, number]);
      const originalStars = letter.stars.map(star => [...star] as [number, number]);

      const transformPoints = (centerX: number, centerY: number) => {
        const transformedSegments = originalSegments.map(seg => [
          centerX + (seg[0] - groupCenterX) * scaleFactor,
          centerY + (seg[1] - groupCenterY) * scaleFactor,
          centerX + (seg[2] - groupCenterX) * scaleFactor,
          centerY + (seg[3] - groupCenterY) * scaleFactor
        ] as [number, number, number, number]);

        const transformedStarsRaw = originalStars.map(star => ({
          x: centerX + (star[0] - groupCenterX) * scaleFactor,
          y: centerY + (star[1] - groupCenterY) * scaleFactor
        }));

        const starsWithProgress: StarWithProgress[] = [];
        for (let i = 0; i < transformedStarsRaw.length; i++) {
          let segmentIndex = i;
          let t = 0;
          if (i === transformedStarsRaw.length - 1 && originalSegments.length === transformedStarsRaw.length) {
            segmentIndex = originalSegments.length - 1;
            t = 1;
          }
          starsWithProgress.push({
            x: transformedStarsRaw[i].x,
            y: transformedStarsRaw[i].y,
            segmentIndex: segmentIndex,
            t: t,
            globalOrder: 0
          });
        }
        let order = 0;
        for (let i = 0; i < starsWithProgress.length; i++) {
          starsWithProgress[i].globalOrder = order;
          if (i < transformedSegments.length) {
            const seg = transformedSegments[i];
            const dx = seg[2] - seg[0];
            const dy = seg[3] - seg[1];
            const length = Math.hypot(dx, dy);
            order += length;
          }
        }
        const totalLength = order;
        for (let i = 0; i < starsWithProgress.length; i++) {
          starsWithProgress[i].globalOrder /= totalLength;
        }

        return { segments: transformedSegments, stars: starsWithProgress };
      };

      const defaultCenter = { x: canvas.width / 2, y: canvas.height / 2 };
      const transformed = transformPoints(defaultCenter.x, defaultCenter.y);
      const numLetters = rawLetters.length;
      const invertedOffset = (numLetters - 1 - idx) * 0.5;  

      return {
        name: letter.name,
        segments: transformed.segments,
        stars: transformed.stars,
        offset: invertedOffset,
        transform: (centerX: number, centerY: number) => transformPoints(centerX, centerY)
      };
    });

    this.positionLetters();
  }

  /**
   * Coloca la constelación en un punto aleatorio de la pantalla.
   *
   * Se calcula primero el tamaño real de la palabra para elegir un centro
   * que la deje siempre completa dentro de la ventana: así vuelve a aparecer
   * en sitios distintos (como al principio) pero sin cortarse en los bordes
   * ni taparse con la cabecera o el botón flotante.
   */
  private positionLetters() {
    const canvas = this.canvasRef.nativeElement;
    if (!canvas || this.letters.length === 0) return;

    // transform(0, 0) devuelve la palabra centrada en el origen: sirve para
    // medir cuánto ocupa sin importar dónde se dibuje después.
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const letter of this.letters) {
      for (const [x1, y1, x2, y2] of letter.transform(0, 0).segments) {
        minX = Math.min(minX, x1, x2);
        maxX = Math.max(maxX, x1, x2);
        minY = Math.min(minY, y1, y2);
        maxY = Math.max(maxY, y1, y2);
      }
    }

    const mitadAncho = (maxX - minX) / 2;
    const mitadAlto = (maxY - minY) / 2;

    // Zonas que no se deben invadir.
    const margenLateral = 24;
    const limiteArriba = canvas.width < 768 ? 90 : 110; // cabecera
    const limiteAbajo = 130; // pie de página y botón flotante

    const minCentroX = margenLateral + mitadAncho;
    const maxCentroX = canvas.width - margenLateral - mitadAncho;
    const minCentroY = limiteArriba + mitadAlto;
    const maxCentroY = canvas.height - limiteAbajo - mitadAlto;

    // Si la pantalla es muy pequeña se centra para que no quede fuera.
    this.centerX =
      maxCentroX > minCentroX
        ? Math.random() * (maxCentroX - minCentroX) + minCentroX
        : canvas.width / 2;
    this.centerY =
      maxCentroY > minCentroY
        ? Math.random() * (maxCentroY - minCentroY) + minCentroY
        : canvas.height / 2;

    for (const letter of this.letters) {
      const transformed = letter.transform(this.centerX, this.centerY);
      letter.segments = transformed.segments;
      letter.stars = transformed.stars;
    }
  }

  private startAnimation() {
    this.startTime = performance.now();
    const animate = (now: number) => {
      this.draw(now);
      this.animationFrameId = requestAnimationFrame(animate);
    };
    this.animationFrameId = requestAnimationFrame(animate);
  }

  private draw(now: number) {
    const canvas = this.canvasRef.nativeElement;
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    const elapsed = (now - this.startTime) / 1000;
    const drawEnd = this.drawDuration / 1000;
    const glowEnd = drawEnd + this.glowDuration / 1000;
    const fadeEnd = glowEnd + this.fadeDuration / 1000;

    // Se usa para saber si todas las letras están en pausa: en ese momento
    // la palabra se vuelve a colocar en otro punto aleatorio.
    let todasEnPausa = true;

    for (const letter of this.letters) {
      const cycleTime = (elapsed + letter.offset) % (this.totalCycle / 1000);
      let drawProgress = 0;
      let alpha = 0;
      let glow = 0;

      if (cycleTime < drawEnd) {
        drawProgress = cycleTime / drawEnd;
        alpha = 1;
        todasEnPausa = false;
      } else if (cycleTime < glowEnd) {
        drawProgress = 1;
        alpha = 1;
        glow = 1;
        todasEnPausa = false;
      } else if (cycleTime < fadeEnd) {
        drawProgress = 1;
        const t = (cycleTime - glowEnd) / (this.fadeDuration / 1000);
        alpha = 1 - t;
        todasEnPausa = false;
      } else {
        // Fase de pausa: no dibujamos
        continue;
      }

      if (alpha <= 0) continue;

      const numSegments = letter.segments.length;
      const segmentsToDraw = Math.ceil(drawProgress * numSegments);

      for (let i = 0; i < segmentsToDraw - 1; i++) {
        const seg = letter.segments[i];
        this.drawSegment(seg[0], seg[1], seg[2], seg[3], alpha, glow);
      }
      if (segmentsToDraw > 0 && segmentsToDraw <= numSegments) {
        const i = segmentsToDraw - 1;
        const seg = letter.segments[i];
        const subProgress = (drawProgress * numSegments) - i;
        if (subProgress > 0) {
          const x1 = seg[0], y1 = seg[1];
          const x2 = seg[2], y2 = seg[3];
          const dx = x2 - x1;
          const dy = y2 - y1;
          const xEnd = x1 + dx * subProgress;
          const yEnd = y1 + dy * subProgress;
          this.drawSegment(x1, y1, xEnd, yEnd, alpha, glow);
        }
      }

      for (const star of letter.stars) {
        if (drawProgress >= star.globalOrder) {
          this.drawStar(star.x, star.y, alpha, glow);
        }
      }
    }

    if (todasEnPausa && !this.reposicionPendiente) {
      this.positionLetters();
      this.reposicionPendiente = true;
    }

    if (!todasEnPausa) {
      this.reposicionPendiente = false;
    }
  }

  private drawSegment(x1: number, y1: number, x2: number, y2: number, alpha: number, glow: number = 0) {
    if (!this.ctx) return;
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    const opacity = alpha * 0.85;  
    this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
    this.ctx.lineWidth = 3.8;
    this.ctx.shadowBlur = 10 * (alpha + glow);
    this.ctx.shadowColor = '#ffffff';
    this.ctx.stroke();
    this.ctx.shadowBlur = 0;
  }

  private drawStar(x: number, y: number, alpha: number, glow: number = 0) {
    if (!this.ctx) return;
    const radius = 1.5 * (0.5 + alpha);
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
    const starOpacity = alpha * 0.8;
    this.ctx.fillStyle = `rgba(255, 220, 150, ${starOpacity})`;
    this.ctx.fill();
    this.ctx.shadowBlur = 6 * (alpha + glow);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;
  }

  @HostListener('window:resize')
  onResize() {
    this.resizeCanvas();
    // Se recalculan las letras con el nuevo tamaño de pantalla.
    this.defineLetters();
  }
}