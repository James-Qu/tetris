# Angular Tetris Game

A fully playable Tetris game built with Angular featuring keyboard controls, scoring system, and dynamic difficulty levels.

## Features

- **Playable Tetris Game**: Full implementation of classic Tetris mechanics
- **Keyboard Controls**: Intuitive controls for moving and rotating pieces
- **Score System**: Earn points for clearing lines (40, 100, 300, 1200 points depending on line clears)
- **Level System**: Level increases every 10 lines cleared
- **Dynamic Speed**: Game speed increases with each level
- **Game Over Detection**: Automatically detects when no more pieces can be placed
- **Beautiful UI**: Modern gradient design with responsive layout
- **Real-time Updates**: Reactive programming with RxJS for smooth gameplay

## Controls

| Key | Action |
|-----|--------|
| **← →** | Move left/right |
| **↑** | Rotate piece clockwise |
| **↓** | Soft drop (speed up descent) |
| **Space** | Hard drop (instant drop) |

## Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open your browser and navigate to `http://localhost:4200`

## How to Play

1. Click "Play" or the game starts automatically
2. Use arrow keys to move the falling pieces
3. Press Up arrow to rotate pieces
4. Press Space bar to instantly drop a piece
5. Complete horizontal lines to clear them and earn points
6. The game speeds up as your level increases
7. Game ends when pieces reach the top of the board

## Scoring System

- **Single Line**: 40 × Level points
- **Double Line**: 100 × Level points
- **Triple Line**: 300 × Level points
- **Tetris (4 Lines)**: 1200 × Level points

## Project Structure

```
src/
├── app/
│   ├── tetris.service.ts      # Core game logic and state management
│   ├── app.component.ts       # Main component with keyboard handling
│   ├── app.component.html     # Game UI template
│   ├── app.component.scss     # Styling
│   ├── app.module.ts          # Angular module definition
├── main.ts                    # Application entry point
├── index.html                 # HTML shell
├── styles.scss               # Global styles
```

## Game Logic

The game implements classic Tetris mechanics:
- 7 unique tetromino pieces (I, O, T, S, Z, J, L)
- 10×20 game board
- Collision detection
- Line clearing algorithm
- Piece rotation with wall kicks
- Dynamic difficulty progression

## Build for Production

```bash
npm run build
```

The built application will be available in the `dist/angular-tetris` directory.

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Technologies Used

- **Angular 17**: Modern web framework
- **TypeScript**: Type-safe programming language
- **RxJS**: Reactive programming library
- **SCSS**: Advanced styling
- **Vanilla Canvas**: Game rendering

## Future Enhancements

- [ ] Next piece preview with visual grid
- [ ] Sound effects and music
- [ ] High score leaderboard
- [ ] Ghost piece preview
- [ ] Multiple game modes (Zen, Time Attack, etc.)
- [ ] Mobile touch controls
- [ ] Pause/Resume functionality

## License

MIT License

## Credits

Created as a demonstration of Angular capabilities with reactive programming patterns and game development concepts.
