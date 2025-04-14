import { Chess, Move } from 'chess.js';

export class ChessCommentary {
  private getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private getPieceDescription(piece: string): string {
    switch (piece.toLowerCase()) {
      case 'p': return 'pawn';
      case 'n': return 'knight';
      case 'b': return 'bishop';
      case 'r': return 'rook';
      case 'q': return 'queen';
      case 'k': return 'king';
      default: return 'piece';
    }
  }

  private getOpeningComments(): string[] {
    return [
      "A classic opening move! Let's see how this game develops.",
      "Setting up for an interesting position.",
      "A solid start to the game.",
      "Taking control of the center early.",
      "Building a strong foundation.",
    ];
  }

  private getCaptureComments(): string[] {
    return [
      "What a capture! The balance of power shifts.",
      "A decisive capture that could change the game.",
      "Trading pieces - every capture counts!",
      "A strategic elimination of the opponent's piece.",
      "The battle intensifies with this capture!",
    ];
  }

  private getCheckComments(): string[] {
    return [
      "Check! The king is under attack.",
      "A dangerous check - the king must move!",
      "Putting pressure on the king with this check.",
      "The king is threatened! What's the escape plan?",
      "A tactical check that demands attention.",
    ];
  }

  private getCheckmateComments(): string[] {
    return [
      "Checkmate! A brilliant conclusion to the game.",
      "Game over - a masterful checkmate!",
      "The king is trapped! A decisive victory.",
      "A beautiful checkmate to end the game.",
      "The final move - checkmate!",
    ];
  }

  private getGeneralMoveComments(): string[] {
    return [
      "A thoughtful move that improves the position.",
      "Developing pieces and creating opportunities.",
      "Building pressure on the opponent's position.",
      "A strategic move with long-term implications.",
      "Carefully maneuvering for better control.",
    ];
  }

  private getEndgameComments(): string[] {
    return [
      "The endgame approaches - every move is crucial.",
      "A tense endgame position is forming.",
      "The final phase of the game begins.",
      "Both sides must play precisely in this endgame.",
      "The endgame will test both players' technique.",
    ];
  }

  generateCommentary(game: Chess, move: Move): string {
    const pieceType = this.getPieceDescription(move.piece);
    const color = move.color === 'w' ? 'White' : 'Black';
    
    // Check for special cases
    if (game.isCheckmate()) {
      return this.getRandomElement(this.getCheckmateComments());
    }
    
    if (game.isCheck()) {
      return this.getRandomElement(this.getCheckComments());
    }

    if (move.captured) {
      const capturedPiece = this.getPieceDescription(move.captured);
      return `${color}'s ${pieceType} captures the ${capturedPiece}! ${this.getRandomElement(this.getCaptureComments())}`;
    }

    // Opening phase (first 4 moves)
    if (game.moveNumber() <= 4) {
      return this.getRandomElement(this.getOpeningComments());
    }

    // Endgame phase (less than 10 pieces on board)
    if (game.board().flat().filter(piece => piece !== null).length < 10) {
      return this.getRandomElement(this.getEndgameComments());
    }

    // General moves
    return `${color}'s ${pieceType} moves. ${this.getRandomElement(this.getGeneralMoveComments())}`;
  }
} 