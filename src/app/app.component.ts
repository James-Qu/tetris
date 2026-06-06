import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { TetrisService, Piece, LineClearEvent } from './tetris.service';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

interface BoardCell {
  colorIndex: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  board: number[][] = [];
  score = 0;
  level = 1;
  lines = 0;
  gameOver = false;
  gameActive = false;
  isPaused = false;
  nextPiece: Piece | null = null;
  activeEffect: LineClearEvent | null = null;
  private effectTimeout: any = null;

  // Touch control state
  private repeatInitialTimer: any = null;
  private repeatIntervalTimer: any = null;

  private gameTickSubscription: Subscription | null = null;
  private boardSubscription: Subscription | null = null;
  private scoreSubscription: Subscription | null = null;
  private levelSubscription: Subscription | null = null;
  private linesSubscription: Subscription | null = null;
  private gameOverSubscription: Subscription | null = null;
  private speedSubscription: Subscription | null = null;
  private nextPieceSubscription: Subscription | null = null;
  private lineClearSubscription: Subscription | null = null;

  readonly CELL_COLORS = [
    '#1a1a2e', // empty (dark background)
    '#ff6b6b', // red
    '#4ecdc4', // teal
    '#45b7d1', // blue
    '#ffa502', // orange
    '#f7b731', // yellow
    '#5f27cd', // purple
    '#00d2d3', // cyan
    '#ff9ff3'  // pink
  ];

  constructor(private tetrisService: TetrisService) {}

  ngOnInit(): void {
    this.boardSubscription = this.tetrisService.board$.subscribe(board => {
      this.board = board;
    });

    this.scoreSubscription = this.tetrisService.score$.subscribe(score => {
      this.score = score;
    });

    this.levelSubscription = this.tetrisService.level$.subscribe(level => {
      this.level = level;
    });

    this.linesSubscription = this.tetrisService.lines$.subscribe(lines => {
      this.lines = lines;
    });

    this.gameOverSubscription = this.tetrisService.gameOver$.subscribe(gameOver => {
      this.gameOver = gameOver;
      if (gameOver) {
        this.stopGameTick();
      }
    });

    this.nextPieceSubscription = this.tetrisService.nextPiece$.subscribe(piece => {
      this.nextPiece = piece;
    });

    this.lineClearSubscription = this.tetrisService.lineClearEffect$.subscribe(effect => {
      if (effect.type === 'single') return;

      if (this.effectTimeout) {
        clearTimeout(this.effectTimeout);
        this.effectTimeout = null;
      }
      this.activeEffect = effect;
      this.effectTimeout = setTimeout(() => {
        this.activeEffect = null;
      }, 1000);
    });

    this.startGame();
  }

  startGame(): void {
    this.tetrisService.startGame();
    this.gameActive = true;
    this.startGameTick();
  }

  private startGameTick(): void {
    // Use a fixed interval that checks current speed
    this.gameTickSubscription = interval(50).subscribe(() => {
      if (this.tetrisService.isGameActive() && !this.isPaused) {
        // Call tick at the appropriate speed
        const speed = this.tetrisService.getGameSpeed();
        if (this.lastTickTime === undefined) {
          this.lastTickTime = Date.now();
        }
        const now = Date.now();
        if (now - this.lastTickTime >= speed) {
          this.tetrisService.tick();
          this.lastTickTime = now;
        }
      }
    });
  }

  private lastTickTime: number | undefined;

  private stopGameTick(): void {
    if (this.gameTickSubscription) {
      this.gameTickSubscription.unsubscribe();
      this.gameTickSubscription = null;
    }
    if (this.speedSubscription) {
      this.speedSubscription.unsubscribe();
      this.speedSubscription = null;
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (!this.gameActive) return;

    switch (event.key.toLowerCase()) {
      case 'arrowleft':
        event.preventDefault();
        if (!this.isPaused) {
          this.tetrisService.movePieceLeft();
        }
        break;
      case 'arrowright':
        event.preventDefault();
        if (!this.isPaused) {
          this.tetrisService.movePieceRight();
        }
        break;
      case 'arrowup':
        event.preventDefault();
        if (!this.isPaused) {
          this.tetrisService.rotatePieceClockwise();
        }
        break;
      case 'arrowdown':
        event.preventDefault();
        if (!this.isPaused) {
          this.tetrisService.tick();
        }
        break;
      case ' ':
        event.preventDefault();
        if (!this.isPaused) {
          this.tetrisService.dropPiece();
        }
        break;
      case 'p':
        event.preventDefault();
        this.togglePause();
        break;
    }
  }

  togglePause(): void {
    this.isPaused = !this.isPaused;
  }

  // ── Touch Controls ───────────────────────────────────────────────────────────

  private vibrate(): void {
    if ('vibrate' in navigator) {
      navigator.vibrate(18);
    }
  }

  private executeAction(action: string): void {
    if (!this.gameActive || this.gameOver) return;
    switch (action) {
      case 'left':      if (!this.isPaused) { this.tetrisService.movePieceLeft(); }  break;
      case 'right':     if (!this.isPaused) { this.tetrisService.movePieceRight(); } break;
      case 'rotate':    if (!this.isPaused) { this.tetrisService.rotatePieceClockwise(); } break;
      case 'softDrop':  if (!this.isPaused) { this.tetrisService.tick(); }           break;
      case 'hardDrop':  if (!this.isPaused) { this.tetrisService.dropPiece(); }      break;
      case 'pause':     this.togglePause();                                           break;
    }
  }

  onTouchStart(event: TouchEvent, action: string): void {
    event.preventDefault();
    this.vibrate();
    this.cancelRepeat();
    this.executeAction(action);

    // Auto-repeat only for directional moves
    if (action === 'left' || action === 'right') {
      this.repeatInitialTimer = setTimeout(() => {
        this.repeatIntervalTimer = setInterval(() => {
          this.executeAction(action);
        }, 80);
      }, 250);
    }
  }

  onTouchEnd(event: TouchEvent): void {
    event.preventDefault();
    this.cancelRepeat();
  }

  private cancelRepeat(): void {
    if (this.repeatInitialTimer !== null) {
      clearTimeout(this.repeatInitialTimer);
      this.repeatInitialTimer = null;
    }
    if (this.repeatIntervalTimer !== null) {
      clearInterval(this.repeatIntervalTimer);
      this.repeatIntervalTimer = null;
    }
  }

  getBackgroundColor(colorIndex: number): string {
    return this.CELL_COLORS[colorIndex];
  }

  getColorIndex(color: string): number {
    switch (color) {
      case '#ffa502': return 1;
      case '#00d2d3': return 2;
      case '#ff6b6b': return 3;
      case '#4ecdc4': return 4;
      case '#f7b731': return 5;
      case '#45b7d1': return 6;
      case '#5f27cd': return 7;
      default: return 8;
    }
  }

  resetGame(): void {
    this.gameOver = false;
    this.startGame();
  }

  ngOnDestroy(): void {
    this.stopGameTick();
    this.boardSubscription?.unsubscribe();
    this.scoreSubscription?.unsubscribe();
    this.levelSubscription?.unsubscribe();
    this.linesSubscription?.unsubscribe();
    this.gameOverSubscription?.unsubscribe();
    this.speedSubscription?.unsubscribe();
    this.nextPieceSubscription?.unsubscribe();
    this.lineClearSubscription?.unsubscribe();
    if (this.effectTimeout) {
      clearTimeout(this.effectTimeout);
    }
    this.cancelRepeat();
  }
}
