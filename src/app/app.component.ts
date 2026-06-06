import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { TetrisService } from './tetris.service';
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

  private gameTickSubscription: Subscription | null = null;
  private boardSubscription: Subscription | null = null;
  private scoreSubscription: Subscription | null = null;
  private levelSubscription: Subscription | null = null;
  private linesSubscription: Subscription | null = null;
  private gameOverSubscription: Subscription | null = null;
  private speedSubscription: Subscription | null = null;

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
  }

  startGame(): void {
    this.tetrisService.startGame();
    this.gameActive = true;
    this.startGameTick();
  }

  private startGameTick(): void {
    this.speedSubscription = this.tetrisService.getGameSpeed = this.tetrisService.getGameSpeed.bind(this.tetrisService);
    const speed$ = interval(this.tetrisService.getGameSpeed()).pipe(
      switchMap(() => {
        const currentSpeed = this.tetrisService.getGameSpeed();
        return interval(currentSpeed);
      })
    );

    // Simpler approach - use a fixed interval that checks current speed
    this.gameTickSubscription = interval(50).subscribe(() => {
      if (this.tetrisService.isGameActive()) {
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

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        this.tetrisService.movePieceLeft();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.tetrisService.movePieceRight();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.tetrisService.rotatePieceClockwise();
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.tetrisService.tick();
        break;
      case ' ':
        event.preventDefault();
        this.tetrisService.dropPiece();
        break;
    }
  }

  getBackgroundColor(colorIndex: number): string {
    return this.CELL_COLORS[colorIndex];
  }

  resetGame(): void {
    this.gameOver = false;
    this.startGame();
  }
}
