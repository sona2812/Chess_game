import { Chess, Square, Piece } from 'chess.js';

interface PieceValues {
  p: number;
  n: number;
  b: number;
  r: number;
  q: number;
  k: number;
}

interface PositionWeights {
  p: number[][];
  n: number[][];
  b: number[][];
  r: number[][];
  q: number[][];
  k: number[][];
  k_endgame: number[][];
}

// Position weight tables for each piece type
const PAWN_POSITION: number[][] = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5,  5, 10, 25, 25, 10,  5,  5],
  [0,  0,  0, 20, 20,  0,  0,  0],
  [5, -5,-10,  0,  0,-10, -5,  5],
  [5, 10, 10,-20,-20, 10, 10,  5],
  [0,  0,  0,  0,  0,  0,  0,  0]
];

const KNIGHT_POSITION: number[][] = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50]
];

const BISHOP_POSITION: number[][] = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5, 10, 10,  5,  0,-10],
  [-10,  5,  5, 10, 10,  5,  5,-10],
  [-10,  0, 10, 10, 10, 10,  0,-10],
  [-10, 10, 10, 10, 10, 10, 10,-10],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20]
];

const ROOK_POSITION: number[][] = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [5, 10, 10, 10, 10, 10, 10,  5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [0,  0,  0,  5,  5,  0,  0,  0]
];

const QUEEN_POSITION: number[][] = [
  [-20,-10,-10, -5, -5,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5,  5,  5,  5,  0,-10],
  [-5,  0,  5,  5,  5,  5,  0, -5],
  [0,  0,  5,  5,  5,  5,  0, -5],
  [-10,  5,  5,  5,  5,  5,  0,-10],
  [-10,  0,  5,  0,  0,  0,  0,-10],
  [-20,-10,-10, -5, -5,-10,-10,-20]
];

const KING_POSITION_MIDDLEGAME: number[][] = [
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [20, 20,  0,  0,  0,  0, 20, 20],
  [20, 30, 10,  0,  0, 10, 30, 20]
];

const KING_POSITION_ENDGAME: number[][] = [
  [-50,-40,-30,-20,-20,-30,-40,-50],
  [-30,-20,-10,  0,  0,-10,-20,-30],
  [-30,-10, 20, 30, 30, 20,-10,-30],
  [-30,-10, 30, 40, 40, 30,-10,-30],
  [-30,-10, 30, 40, 40, 30,-10,-30],
  [-30,-10, 20, 30, 30, 20,-10,-30],
  [-30,-30,  0,  0,  0,  0,-30,-30],
  [-50,-30,-30,-30,-30,-30,-30,-50]
];

const PIECE_VALUES: PieceValues = {
  p: 100,   // pawn
  n: 320,   // knight
  b: 330,   // bishop
  r: 500,   // rook
  q: 900,   // queen
  k: 20000  // king
};

// Bonus multiplier for capturing moves
const CAPTURE_BONUS = 1.2; // 20% bonus for captures

const POSITION_WEIGHTS: PositionWeights = {
  p: PAWN_POSITION,
  n: KNIGHT_POSITION,
  b: BISHOP_POSITION,
  r: ROOK_POSITION,
  q: QUEEN_POSITION,
  k: KING_POSITION_MIDDLEGAME,
  k_endgame: KING_POSITION_ENDGAME
};

export class ChessAI {
  private isEndgame(game: Chess): boolean {
    const board = game.board();
    let whitePieces = 0, blackPieces = 0;
    let whiteQueen = false, blackQueen = false;

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j];
        if (piece) {
          if (piece.type === 'q') {
            if (piece.color === 'w') whiteQueen = true;
            else blackQueen = true;
          } else if (piece.type !== 'k') {
            if (piece.color === 'w') whitePieces++;
            else blackPieces++;
          }
        }
      }
    }

    return (!whiteQueen && !blackQueen) ||
           (whiteQueen && whitePieces <= 1 && !blackQueen) ||
           (blackQueen && blackPieces <= 1 && !whiteQueen);
  }

  private evaluateMove(game: Chess, move: string): number {
    const gameCopy = new Chess(game.fen());
    const moveResult = gameCopy.move(move);
    
    // Base evaluation
    let score = this.evaluateBoard(gameCopy);
    
    // Add capture bonus
    if (moveResult.captured) {
      const captureValue = PIECE_VALUES[moveResult.captured as keyof PieceValues];
      const pieceValue = PIECE_VALUES[moveResult.piece as keyof PieceValues];
      
      // Higher bonus for capturing more valuable pieces with less valuable pieces
      if (captureValue > pieceValue) {
        score *= CAPTURE_BONUS * 1.5; // 50% extra bonus for capturing more valuable pieces
      } else {
        score *= CAPTURE_BONUS;
      }
    }
    
    return score;
  }

  public getBestMove(game: Chess): string | null {
    const moves = game.moves();
    let bestMove = null;
    let bestValue = game.turn() === 'w' ? -Infinity : Infinity;

    for (const move of moves) {
      const value = this.evaluateMove(game, move);
      
      if (game.turn() === 'w') {
        if (value > bestValue) {
          bestValue = value;
          bestMove = move;
        }
      } else {
        if (value < bestValue) {
          bestValue = value;
          bestMove = move;
        }
      }
    }

    return bestMove;
  }

  private evaluateBoard(game: Chess): number {
    let score = 0;
    const board = game.board();
    const isEndgamePhase = this.isEndgame(game);

    if (game.isCheckmate()) {
      return game.turn() === 'w' ? -100000 : 100000;
    }
    if (game.isDraw() || game.isStalemate()) {
      return 0;
    }

    // Count attacked pieces
    const attackedByBlack = new Set<string>();
    const attackedByWhite = new Set<string>();
    
    // Get all possible moves and their targets
    const moves = game.moves({ verbose: true });
    for (const move of moves) {
      if (game.turn() === 'w') {
        attackedByWhite.add(move.to);
      } else {
        attackedByBlack.add(move.to);
      }
    }

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j];
        if (piece) {
          const isWhite = piece.color === 'w';
          const row = isWhite ? 7 - i : i;
          const col = j;
          
          // Material value
          let materialValue = PIECE_VALUES[piece.type] * (isWhite ? 1 : -1);
          
          // Position value
          let positionValue = 0;
          switch (piece.type) {
            case 'p':
              positionValue = POSITION_WEIGHTS.p[row][col];
              break;
            case 'n':
              positionValue = POSITION_WEIGHTS.n[row][col];
              break;
            case 'b':
              positionValue = POSITION_WEIGHTS.b[row][col];
              break;
            case 'r':
              positionValue = POSITION_WEIGHTS.r[row][col];
              break;
            case 'q':
              positionValue = POSITION_WEIGHTS.q[row][col];
              break;
            case 'k':
              positionValue = isEndgamePhase 
                ? POSITION_WEIGHTS.k_endgame[row][col]
                : POSITION_WEIGHTS.k[row][col];
              break;
          }

          score += materialValue + (positionValue * (isWhite ? 1 : -1) * 0.1);

          // Add bonus for attacking pieces
          const square = String.fromCharCode(97 + j) + (8 - i);
          if (isWhite && attackedByBlack.has(square)) {
            score -= PIECE_VALUES[piece.type] * 0.1; // Penalty for being attacked
          } else if (!isWhite && attackedByWhite.has(square)) {
            score += PIECE_VALUES[piece.type] * 0.1; // Bonus for attacking
          }
        }
      }
    }

    // Mobility bonus with higher weight
    const mobility = game.moves().length;
    score += (game.turn() === 'w' ? 1 : -1) * mobility * 0.2; // Doubled mobility importance

    return score;
  }

  public getCapturablePieces(game: Chess): Square[] {
    const capturablePieces: Square[] = [];
    const moves = game.moves({ verbose: true });
    
    // Create a Set to store unique target squares of capturing moves
    const captureSquares = new Set<Square>();
    
    // Iterate through all possible moves
    for (const move of moves) {
      // If the move is a capture, add the target square
      if (move.captured) {
        captureSquares.add(move.to as Square);
      }
    }
    
    return Array.from(captureSquares);
  }
} 