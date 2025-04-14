import React from 'react';
import styled from 'styled-components';
import { PieceType } from '../types/chess';
import { PIECE_IMAGES } from './ChessPieces';

const CapturedPiecesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  min-height: 100px;
  width: 200px;
`;

const PiecesRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  align-items: center;
`;

const CapturedPiece = styled.div<{ size: number }>`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PieceImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
`;

const PieceCount = styled.span`
  position: absolute;
  bottom: -5px;
  right: -5px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
`;

interface CapturedPiecesProps {
  capturedPieces: {
    white: { type: PieceType; count: number }[];
    black: { type: PieceType; count: number }[];
  };
  pieceSize?: number;
}

const CapturedPieces: React.FC<CapturedPiecesProps> = ({ 
  capturedPieces, 
  pieceSize = 40 
}) => {
  return (
    <CapturedPiecesContainer>
      <PiecesRow>
        {capturedPieces.black.map((piece, index) => (
          <CapturedPiece key={`${piece.type}-${index}`} size={pieceSize}>
            <PieceImage
              src={PIECE_IMAGES.b[piece.type]}
              alt={`Captured black ${piece.type}`}
            />
            <PieceCount>{piece.count}</PieceCount>
          </CapturedPiece>
        ))}
      </PiecesRow>
      <PiecesRow>
        {capturedPieces.white.map((piece, index) => (
          <CapturedPiece key={`${piece.type}-${index}`} size={pieceSize}>
            <PieceImage
              src={PIECE_IMAGES.w[piece.type]}
              alt={`Captured white ${piece.type}`}
            />
            <PieceCount>{piece.count}</PieceCount>
          </CapturedPiece>
        ))}
      </PiecesRow>
    </CapturedPiecesContainer>
  );
};

export default CapturedPieces; 