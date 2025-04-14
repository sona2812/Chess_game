import { PieceType, PieceStyle } from '../types/chess';

// Define base URLs for different piece styles
const PIECE_STYLE_URLS = {
  default: 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/',
  alpha: 'https://lichess1.org/assets/piece/alpha/',
  neo: 'https://images.chesscomfiles.com/chess-themes/pieces/classic/150/'
};

// Create piece image URLs for each style
export const PIECE_STYLES: Record<PieceStyle, Record<'w' | 'b', Record<PieceType, string>>> = {
  default: {
    w: {
      p: `${PIECE_STYLE_URLS.default}wp.png`,
      n: `${PIECE_STYLE_URLS.default}wn.png`,
      b: `${PIECE_STYLE_URLS.default}wb.png`,
      r: `${PIECE_STYLE_URLS.default}wr.png`,
      q: `${PIECE_STYLE_URLS.default}wq.png`,
      k: `${PIECE_STYLE_URLS.default}wk.png`
    },
    b: {
      p: `${PIECE_STYLE_URLS.default}bp.png`,
      n: `${PIECE_STYLE_URLS.default}bn.png`,
      b: `${PIECE_STYLE_URLS.default}bb.png`,
      r: `${PIECE_STYLE_URLS.default}br.png`,
      q: `${PIECE_STYLE_URLS.default}bq.png`,
      k: `${PIECE_STYLE_URLS.default}bk.png`
    }
  },
  alpha: {
    w: {
      p: `${PIECE_STYLE_URLS.alpha}wP.svg`,
      n: `${PIECE_STYLE_URLS.alpha}wN.svg`,
      b: `${PIECE_STYLE_URLS.alpha}wB.svg`,
      r: `${PIECE_STYLE_URLS.alpha}wR.svg`,
      q: `${PIECE_STYLE_URLS.alpha}wQ.svg`,
      k: `${PIECE_STYLE_URLS.alpha}wK.svg`
    },
    b: {
      p: `${PIECE_STYLE_URLS.alpha}bP.svg`,
      n: `${PIECE_STYLE_URLS.alpha}bN.svg`,
      b: `${PIECE_STYLE_URLS.alpha}bB.svg`,
      r: `${PIECE_STYLE_URLS.alpha}bR.svg`,
      q: `${PIECE_STYLE_URLS.alpha}bQ.svg`,
      k: `${PIECE_STYLE_URLS.alpha}bK.svg`
    }
  },
  neo: {
    w: {
      p: `${PIECE_STYLE_URLS.neo}wp.png`,
      n: `${PIECE_STYLE_URLS.neo}wn.png`,
      b: `${PIECE_STYLE_URLS.neo}wb.png`,
      r: `${PIECE_STYLE_URLS.neo}wr.png`,
      q: `${PIECE_STYLE_URLS.neo}wq.png`,
      k: `${PIECE_STYLE_URLS.neo}wk.png`
    },
    b: {
      p: `${PIECE_STYLE_URLS.neo}bp.png`,
      n: `${PIECE_STYLE_URLS.neo}bn.png`,
      b: `${PIECE_STYLE_URLS.neo}bb.png`,
      r: `${PIECE_STYLE_URLS.neo}br.png`,
      q: `${PIECE_STYLE_URLS.neo}bq.png`,
      k: `${PIECE_STYLE_URLS.neo}bk.png`
    }
  }
}; 