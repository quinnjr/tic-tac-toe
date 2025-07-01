import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

app.use(cors());
app.use(express.json());

// Game state storage (in production, you'd use a database)
interface GameState {
  board: (string | null)[];
  currentPlayer: 'X' | 'O';
  winner: string | null;
  gameOver: boolean;
  moveHistory: { player: string; position: number; timestamp: number }[];
  gameMode: 'human-vs-human' | 'human-vs-ai' | 'ai-vs-ai';
  aiPerformance?: {
    algorithm: 'minimax' | 'alpha-beta';
    nodesExplored: number;
    executionTime: number;
    alphaBetaPruningTime: number;
    minimaxDecisionTime: number;
    bestMove: number;
  };
  playerXControl: 'human' | 'ai';
  playerOControl: 'human' | 'ai';
  playerXAlgorithm: 'minimax' | 'alpha-beta';
  playerOAlgorithm: 'minimax' | 'alpha-beta';
}

let gameState: GameState = {
  board: Array(9).fill(null),
  currentPlayer: 'X',
  winner: null,
  gameOver: false,
  moveHistory: [],
  gameMode: 'human-vs-human',
  playerXControl: 'human',
  playerOControl: 'human',
  playerXAlgorithm: 'alpha-beta',
  playerOAlgorithm: 'minimax'
};

// AI Performance tracking
interface AIPerformance {
  algorithm: 'minimax' | 'alpha-beta';
  nodesExplored: number;
  executionTime: number;
  alphaBetaPruningTime: number;
  minimaxDecisionTime: number;
  bestMove: number;
}

// Helper function to check for winner
function checkWinner(board: (string | null)[]): string | null {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ];

  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  if (board.every(cell => cell !== null)) {
    return 'Draw';
  }

  return null;
}

// Helper function to check if board is full
function isBoardFull(board: (string | null)[]): boolean {
  return board.every(cell => cell !== null);
}

/**
 * Tic-tac-toe API endpoints
 */

// Set up game mode endpoint
app.post('/api/game/mode', (req, res) => {
  const { mode } = req.body;
  if (mode === 'human-vs-human' || mode === 'human-vs-ai' || mode === 'ai-vs-ai') {
    gameState.gameMode = mode;
    // Reset game when changing mode
    gameState.board = Array(9).fill(null);
    gameState.currentPlayer = 'X';
    gameState.gameOver = false;
    gameState.winner = null;
    gameState.moveHistory = [];
    gameState.aiPerformance = undefined;

    // Set player controls based on mode
    if (mode === 'human-vs-human') {
      gameState.playerXControl = 'human';
      gameState.playerOControl = 'human';
    } else if (mode === 'human-vs-ai') {
      gameState.playerXControl = 'human';
      gameState.playerOControl = 'ai';
    } else if (mode === 'ai-vs-ai') {
      gameState.playerXControl = 'ai';
      gameState.playerOControl = 'ai';
      // Both players use alpha-beta pruning (optimized minimax) for AI vs AI battles
      gameState.playerXAlgorithm = 'alpha-beta';
      gameState.playerOAlgorithm = 'alpha-beta';
    }

    return res.json(gameState);
  } else {
    return res.status(400).json({ error: 'Invalid game mode' });
  }
});

// Helper function to determine game mode from player controls
function determineGameMode(playerXControl: 'human' | 'ai', playerOControl: 'human' | 'ai'): 'human-vs-human' | 'human-vs-ai' | 'ai-vs-ai' {
  if (playerXControl === 'human' && playerOControl === 'human') {
    return 'human-vs-human';
  } else if (playerXControl === 'ai' && playerOControl === 'ai') {
    return 'ai-vs-ai';
  } else {
    return 'human-vs-ai';
  }
}

// Switch player control (human <-> AI)
app.post('/api/game/switch-control', (req, res) => {
  const { player, control } = req.body;

  if ((player !== 'X' && player !== 'O') || (control !== 'human' && control !== 'ai')) {
    return res.status(400).json({ error: 'Invalid player or control type' });
  }

  if (player === 'X') {
    gameState.playerXControl = control;
  } else {
    gameState.playerOControl = control;
  }

  // Automatically update game mode based on player controls
  gameState.gameMode = determineGameMode(gameState.playerXControl, gameState.playerOControl);

  return res.json(gameState);
});

// Set AI algorithm for a player
app.post('/api/game/set-algorithm', (req, res) => {
  const { player, algorithm } = req.body;

  if ((player !== 'X' && player !== 'O') || (algorithm !== 'minimax' && algorithm !== 'alpha-beta')) {
    return res.status(400).json({ error: 'Invalid player or algorithm' });
  }

  if (player === 'X') {
    gameState.playerXAlgorithm = algorithm;
  } else {
    gameState.playerOAlgorithm = algorithm;
  }

  return res.json(gameState);
});

// Let AI make the next move for current player
app.post('/api/game/ai-move', (req, res) => {
  if (gameState.gameOver) {
    return res.status(400).json({ error: 'Game is already over' });
  }

  const currentPlayerAlgorithm = gameState.currentPlayer === 'X' ?
    gameState.playerXAlgorithm : gameState.playerOAlgorithm;

  const aiPerformance = getBestAIMove(gameState.board, currentPlayerAlgorithm);

  // Make AI move
  gameState.board[aiPerformance.bestMove] = gameState.currentPlayer;
  gameState.moveHistory.push({
    player: gameState.currentPlayer,
    position: aiPerformance.bestMove,
    timestamp: Date.now()
  });

  // Store AI performance data
  gameState.aiPerformance = aiPerformance;

  // Check for game over
  gameState.winner = checkWinner(gameState.board);
  gameState.gameOver = gameState.winner !== null;

  if (!gameState.gameOver) {
    gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
  }

  return res.json(gameState);
});

// Get current game state
app.get('/api/game/state', (req, res) => {
  res.json(gameState);
});

// Make a move
app.post('/api/game/move', (req, res) => {
  const { position } = req.body;

  if (typeof position !== 'number' || position < 0 || position > 8) {
    return res.status(400).json({ error: 'Invalid position' });
  }

  if (gameState.gameOver) {
    return res.status(400).json({ error: 'Game is already over' });
  }

  if (gameState.board[position] !== null) {
    return res.status(400).json({ error: 'Position already taken' });
  }

  // Check if current player is controlled by human (only allow manual moves for human-controlled players)
  const currentPlayerControl = gameState.currentPlayer === 'X' ?
    gameState.playerXControl : gameState.playerOControl;

  if (currentPlayerControl === 'ai') {
    return res.status(400).json({ error: 'Current player is AI-controlled. Use /api/game/ai-move endpoint.' });
  }

  // Make the move
  gameState.board[position] = gameState.currentPlayer;
  gameState.moveHistory.push({
    player: gameState.currentPlayer,
    position,
    timestamp: Date.now()
  });

  // Check for winner
  const winner = checkWinner(gameState.board);
  if (winner) {
    gameState.winner = winner;
    gameState.gameOver = true;
  } else if (isBoardFull(gameState.board)) {
    gameState.winner = 'Draw';
    gameState.gameOver = true;
  } else {
    // Switch players
    gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';

    // If next player is AI-controlled, make AI move automatically
    const nextPlayerControl = gameState.currentPlayer === 'X' ?
      gameState.playerXControl : gameState.playerOControl;

    if (nextPlayerControl === 'ai' && !gameState.gameOver) {
      const nextPlayerAlgorithm = gameState.currentPlayer === 'X' ?
        gameState.playerXAlgorithm : gameState.playerOAlgorithm;

      const aiPerformance = getBestAIMove(gameState.board, nextPlayerAlgorithm);

      // Make AI move
      gameState.board[aiPerformance.bestMove] = gameState.currentPlayer;
      gameState.moveHistory.push({
        player: gameState.currentPlayer,
        position: aiPerformance.bestMove,
        timestamp: Date.now()
      });

      // Store AI performance data
      gameState.aiPerformance = aiPerformance;

      // Check for game over after AI move
      gameState.winner = checkWinner(gameState.board);
      gameState.gameOver = gameState.winner !== null;

      if (!gameState.gameOver) {
        gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
      }
    }
  }

  return res.json(gameState);
});

// Reset the game
app.post('/api/game/reset', (req, res) => {
  const currentXControl = gameState.playerXControl;
  const currentOControl = gameState.playerOControl;
  const currentXAlgorithm = gameState.playerXAlgorithm;
  const currentOAlgorithm = gameState.playerOAlgorithm;

  gameState = {
    board: Array(9).fill(null),
    currentPlayer: 'X',
    winner: null,
    gameOver: false,
    moveHistory: [],
    gameMode: determineGameMode(currentXControl, currentOControl), // Automatically determine based on player controls
    playerXControl: currentXControl,
    playerOControl: currentOControl,
    playerXAlgorithm: currentXAlgorithm,
    playerOAlgorithm: currentOAlgorithm
  };

  return res.json(gameState);
});

// Get move history
app.get('/api/game/history', (req, res) => {
  res.json(gameState.moveHistory);
});

// Get player statistics
app.get('/api/game/stats', (req, res) => {
  const stats = {
    totalMoves: gameState.moveHistory.length,
    xMoves: gameState.moveHistory.filter(move => move.player === 'X').length,
    oMoves: gameState.moveHistory.filter(move => move.player === 'O').length,
    gameMode: gameState.gameMode,
    aiPerformance: gameState.aiPerformance
  };

  res.json(stats);
});

// Compare algorithms endpoint
app.post('/api/game/compare-algorithms', (req, res) => {
  // Check if there are any available moves to analyze
  if (gameState.gameOver) {
    return res.status(400).json({ error: 'Cannot compare algorithms when game is over' });
  }

  const minimaxPerformance = getBestAIMove([...gameState.board], 'minimax');
  const alphaBetaPerformance = getBestAIMove([...gameState.board], 'alpha-beta');

  return res.json({
    minimax: minimaxPerformance,
    alphaBeta: alphaBetaPerformance,
    improvement: {
      nodesReduced: minimaxPerformance.nodesExplored - alphaBetaPerformance.nodesExplored,
      timeReduced: minimaxPerformance.executionTime - alphaBetaPerformance.executionTime,
      percentageImprovement: Math.round(((minimaxPerformance.nodesExplored - alphaBetaPerformance.nodesExplored) / minimaxPerformance.nodesExplored) * 100)
    }
  });
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 * Skip API routes as they're handled above.
 */
app.use('*', (req, res, next) => {
  // Skip API routes
  if (req.originalUrl.startsWith('/api/')) {
    return next();
  }

  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);

// Minimax algorithm with performance tracking
function minimax(board: (string | null)[], depth: number, isMaximizing: boolean, performance: { nodes: number }): number {
  performance.nodes++;

  const winner = checkWinner(board);
  if (winner === 'O') return 10 - depth; // AI wins
  if (winner === 'X') return depth - 10; // Human wins
  if (winner === 'Draw') return 0; // Draw

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'O';
        const score = minimax(board, depth + 1, false, performance);
        board[i] = null;
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'X';
        const score = minimax(board, depth + 1, true, performance);
        board[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

// Alpha-beta pruning algorithm with performance tracking
function alphaBeta(board: (string | null)[], depth: number, alpha: number, beta: number, isMaximizing: boolean, performance: { nodes: number }): number {
  performance.nodes++;

  const winner = checkWinner(board);
  if (winner === 'O') return 10 - depth; // AI wins
  if (winner === 'X') return depth - 10; // Human wins
  if (winner === 'Draw') return 0; // Draw

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'O';
        const score = alphaBeta(board, depth + 1, alpha, beta, false, performance);
        board[i] = null;
        bestScore = Math.max(score, bestScore);
        alpha = Math.max(alpha, bestScore);
        if (beta <= alpha) {
          break; // Beta cutoff
        }
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'X';
        const score = alphaBeta(board, depth + 1, alpha, beta, true, performance);
        board[i] = null;
        bestScore = Math.min(score, bestScore);
        beta = Math.min(beta, bestScore);
        if (beta <= alpha) {
          break; // Alpha cutoff
        }
      }
    }
    return bestScore;
  }
}

// Get best AI move using specified algorithm
function getBestAIMove(board: (string | null)[], algorithm: 'minimax' | 'alpha-beta'): AIPerformance {
  const startTime = performance.now();
  let bestMove = -1;
  let bestScore = -Infinity;
  const performanceTracker = { nodes: 0 };
  let totalAlphaBetaTime = 0;
  let totalMinimaxTime = 0;

  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = 'O';
      let score: number;

      if (algorithm === 'minimax') {
        const minimaxStart = performance.now();
        score = minimax(board, 0, false, performanceTracker);
        const minimaxEnd = performance.now();
        totalMinimaxTime += (minimaxEnd - minimaxStart);
        // For pure minimax, alpha-beta time is 0
        totalAlphaBetaTime = 0;
      } else {
        // For alpha-beta, we track the pruning optimization time
        const alphaBetaStart = performance.now();
        score = alphaBeta(board, 0, -Infinity, Infinity, false, performanceTracker);
        const alphaBetaEnd = performance.now();
        totalAlphaBetaTime += (alphaBetaEnd - alphaBetaStart);

        // Also run minimax to see what the time would have been without pruning
        const minimaxPerformanceTracker = { nodes: 0 };
        const minimaxStart = performance.now();
        minimax([...board], 0, false, minimaxPerformanceTracker);
        const minimaxEnd = performance.now();
        totalMinimaxTime = (minimaxEnd - minimaxStart);
      }

      board[i] = null;

      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }

  const endTime = performance.now();

  return {
    algorithm,
    nodesExplored: performanceTracker.nodes,
    executionTime: Math.round((endTime - startTime) * 100) / 100,
    alphaBetaPruningTime: Math.round(totalAlphaBetaTime * 100) / 100,
    minimaxDecisionTime: Math.round(totalMinimaxTime * 100) / 100,
    bestMove
  };
}
