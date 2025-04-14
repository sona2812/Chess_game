export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type PieceColor = 'w' | 'b';
export type PieceStyle = 'default' | 'alpha' | 'neo';

export interface Piece {
  type: PieceType;
  color: PieceColor;
}

export interface Square {
  piece: Piece | null;
  position: string;
}

export interface Theme {
  lightSquare: string;
  darkSquare: string;
  selected: string;
}

export interface GameState {
  selectedSquare: string | null;
  possibleMoves: string[];
  currentTheme: Theme;
  capturableSquares: string[];
  capturedPieces: {
    white: { type: PieceType, count: number }[];
    black: { type: PieceType, count: number }[];
  };
} 