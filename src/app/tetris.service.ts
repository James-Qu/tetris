import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';

export interface Piece {
  shape: number[][];
  x: number;
  y: number;
  color: string;
}

type Board = number[][];

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const CELL_COLORS = [
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

const TETROMINOES = [
  { shape: [[1, 1], [1, 1]], color: '#ffa502' }, // O - Orange
  { shape: [[1, 1, 1, 1]], color: '#00d2d3' }, // I - Cyan
  { shape: [[1, 1, 1], [1, 0, 0]], color: '#ff6b6b' }, // L - Red
  { shape: [[1, 1, 1], [0, 0, 1]], color: '#4ecdc4' }, // J - Teal
  { shape: [[0, 1, 1], [1, 1, 0]], color: '#f7b731' }, // S - Yellow
  { shape: [[1, 1, 0], [0, 1, 1]], color: '#45b7d1' }, // Z - Blue
  { shape: [[1, 1, 1], [0, 1, 0]], color: '#5f27cd' } // T - Purple
];

@Injectable({
  providedIn: 'root'
})
export class TetrisService {
  private board: Board = [];
  private currentPiece: Piece | null = null;
  private nextPiece: Piece | null = null;
  private score = 0;
  private level = 1;
  private linesCleared = 0;
  private gameActive = false;
  private gameSpeed = 1000;

  private boardSubject = new BehaviorSubject<Board>([]);
  private scoreSubject = new BehaviorSubject<number>(0);
  private levelSubject = new BehaviorSubject<number>(1);
  private linesSubject = new BehaviorSubject<number>(0);
  private gameOverSubject = new BehaviorSubject<boolean>(false);
  private nextPieceSubject = new BehaviorSubject<Piece | null>(null);

  board$ = this.boardSubject.asObservable();
  score$ = this.scoreSubject.asObservable();
  level$ = this.levelSubject.asObservable();
  lines$ = this.linesSubject.asObservable();
  gameOver$ = this.gameOverSubject.asObservable();
  nextPiece$ = this.nextPieceSubject.asObservable();

  constructor() {
    this.initBoard();
  }

  private initBoard(): void {
    this.board = Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0));
    this.boardSubject.next(this.board.map(row => [...row]));
  }

  startGame(): void {
    this.initBoard();
    this.score = 0;
    this.level = 1;
    this.linesCleared = 0;
    this.gameSpeed = 1000;
    this.gameActive = true;
    this.gameOverSubject.next(false);
    this.scoreSubject.next(0);
    this.levelSubject.next(1);
    this.linesSubject.next(0);

    this.currentPiece = this.getRandomPiece();
    this.nextPiece = this.getRandomPiece();
    this.nextPieceSubject.next(this.nextPiece);
    this.updateBoard();
  }

  private getRandomPiece(): Piece {
    const tetromino = TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)];
    return {
      shape: tetromino.shape.map(row => [...row]),
      color: tetromino.color,
      x: Math.floor(BOARD_WIDTH / 2) - Math.ceil(tetromino.shape[0].length / 2),
      y: 0
    };
  }

  private updateBoard(): void {
    const newBoard = this.board.map(row => [...row]);

    if (this.currentPiece) {
      this.drawPiece(newBoard, this.currentPiece);
    }

    this.boardSubject.next(newBoard);
  }

  private drawPiece(board: Board, piece: Piece): void {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardX = piece.x + x;
          const boardY = piece.y + y;
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            board[boardY][boardX] = piece.color === '#ffa502' ? 1 :
                                   piece.color === '#00d2d3' ? 2 :
                                   piece.color === '#ff6b6b' ? 3 :
                                   piece.color === '#4ecdc4' ? 4 :
                                   piece.color === '#f7b731' ? 5 :
                                   piece.color === '#45b7d1' ? 6 :
                                   piece.color === '#5f27cd' ? 7 : 8;
          }
        }
      }
    }
  }

  private canMoveTo(piece: Piece, x: number, y: number): boolean {
    for (let py = 0; py < piece.shape.length; py++) {
      for (let px = 0; px < piece.shape[py].length; px++) {
        if (piece.shape[py][px]) {
          const newX = x + px;
          const newY = y + py;

          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return false;
          }

          if (newY >= 0 && this.board[newY][newX] !== 0) {
            return false;
          }
        }
      }
    }
    return true;
  }

  private rotatePiece(piece: Piece): Piece {
    const rotated = piece.shape[0].map((_, colIndex) =>
      piece.shape.map(row => row[colIndex]).reverse()
    );
    return { ...piece, shape: rotated };
  }

  movePieceLeft(): void {
    if (!this.gameActive || !this.currentPiece) return;
    if (this.canMoveTo(this.currentPiece, this.currentPiece.x - 1, this.currentPiece.y)) {
      this.currentPiece.x -= 1;
      this.updateBoard();
    }
  }

  movePieceRight(): void {
    if (!this.gameActive || !this.currentPiece) return;
    if (this.canMoveTo(this.currentPiece, this.currentPiece.x + 1, this.currentPiece.y)) {
      this.currentPiece.x += 1;
      this.updateBoard();
    }
  }

  rotatePieceClockwise(): void {
    if (!this.gameActive || !this.currentPiece) return;
    const rotated = this.rotatePiece(this.currentPiece);
    if (this.canMoveTo(rotated, this.currentPiece.x, this.currentPiece.y)) {
      this.currentPiece.shape = rotated.shape;
      this.updateBoard();
    }
  }

  dropPiece(): void {
    if (!this.gameActive || !this.currentPiece) return;
    while (this.canMoveTo(this.currentPiece, this.currentPiece.x, this.currentPiece.y + 1)) {
      this.currentPiece.y += 1;
    }
    this.lockPiece();
  }

  tick(): void {
    if (!this.gameActive || !this.currentPiece) return;

    if (this.canMoveTo(this.currentPiece, this.currentPiece.x, this.currentPiece.y + 1)) {
      this.currentPiece.y += 1;
      this.updateBoard();
    } else {
      this.lockPiece();
    }
  }

  private lockPiece(): void {
    if (!this.currentPiece) return;

    // Lock the piece into the board
    for (let y = 0; y < this.currentPiece.shape.length; y++) {
      for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
        if (this.currentPiece.shape[y][x]) {
          const boardX = this.currentPiece.x + x;
          const boardY = this.currentPiece.y + y;
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            const colorIndex = this.currentPiece.color === '#ffa502' ? 1 :
                              this.currentPiece.color === '#00d2d3' ? 2 :
                              this.currentPiece.color === '#ff6b6b' ? 3 :
                              this.currentPiece.color === '#4ecdc4' ? 4 :
                              this.currentPiece.color === '#f7b731' ? 5 :
                              this.currentPiece.color === '#45b7d1' ? 6 :
                              this.currentPiece.color === '#5f27cd' ? 7 : 8;
            this.board[boardY][boardX] = colorIndex;
          }
        }
      }
    }

    // Check for complete lines
    this.clearCompleteLines();

    // Get next piece
    this.currentPiece = this.nextPiece;
    this.nextPiece = this.getRandomPiece();
    this.nextPieceSubject.next(this.nextPiece);

    // Check for game over
    if (!this.canMoveTo(this.currentPiece!, this.currentPiece!.x, this.currentPiece!.y)) {
      this.gameActive = false;
      this.gameOverSubject.next(true);
    }

    this.updateBoard();
  }

  private clearCompleteLines(): void {
    let linesCleared = 0;

    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (this.board[y].every(cell => cell !== 0)) {
        this.board.splice(y, 1);
        this.board.unshift(Array(BOARD_WIDTH).fill(0));
        linesCleared++;
        y++; // Recheck this line
      }
    }

    if (linesCleared > 0) {
      this.linesCleared += linesCleared;
      const points = [40, 100, 300, 1200][linesCleared - 1] * this.level;
      this.score += points;

      this.level = Math.floor((1 + Math.sqrt(1 + this.score / 125)) / 2);
      this.gameSpeed = Math.max(100, Math.floor(1000 * Math.pow(0.8, this.level - 1)));

      this.levelSubject.next(this.level);
      this.scoreSubject.next(this.score);
      this.linesSubject.next(this.linesCleared);
    }
  }

  getBoard(): Board {
    return this.board;
  }

  isGameActive(): boolean {
    return this.gameActive;
  }

  getGameSpeed(): number {
    return this.gameSpeed;
  }
}
