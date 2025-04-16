import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Chess, Move as ChessMove, Square as ChessSquare } from 'chess.js';
import { Theme, GameState as ChessGameState, PieceType, PieceStyle } from '../types/chess';
import { themes } from '../config/themes';
import { PIECE_STYLES } from '../config/pieceStyles';
import { PIECE_IMAGES } from './ChessPieces';
import { ChessAI } from '../services/ChessAI';
import { ChessCommentary } from '../services/ChessCommentary';
import CapturedPieces from './CapturedPieces';

const GameContainer = styled.div`
  display: flex;
  gap: 20px;
  align-items: flex-start;
  position: relative;
  padding-top: 50px;
  flex-wrap: wrap;
  justify-content: center;

  @media (max-width: 1200px) {
    gap: 15px;
    padding-top: 40px;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    padding-top: 30px;
    gap: 10px;
  }

  @media (max-width: 480px) {
    padding-top: 20px;
  }
`;

const BoardContainer = styled.div<{ size: number }>`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  border: 4px solid #1a1a1a;
  border-radius: 4px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  overflow: hidden;

  @media (max-width: 768px) {
    width: ${props => Math.min(props.size, window.innerWidth - 40)}px;
    height: ${props => Math.min(props.size, window.innerWidth - 40)}px;
  }
`;

const Square = styled.div<{ 
  isLight: boolean; 
  theme: Theme; 
  isSelected: boolean; 
  isPossibleMove: boolean;
  isCapturable: boolean;
}>`
  aspect-ratio: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${props =>
    props.isSelected
      ? props.theme.selected
      : props.isLight
      ? props.theme.lightSquare
      : props.theme.darkSquare};
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;

  &:hover {
    filter: brightness(1.1);
  }

  ${props => props.isPossibleMove && `
    &::after {
      content: '';
      position: absolute;
      width: 25%;
      height: 25%;
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: 50%;
    }
  `}

  ${props => props.isCapturable && `
    &::before {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      background-color: rgba(255, 0, 0, 0.2);
      pointer-events: none;
    }
  `}
`;

const Piece = styled.img`
  width: 85%;
  height: 85%;
  position: absolute;
  pointer-events: none;
  user-select: none;
  transition: all 0.2s ease;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));

  ${Square}:hover & {
    transform: scale(1.05);
  }
`;

const GameStatus = styled.div<{ isActive?: boolean; isGameOver?: boolean }>`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: -25px;
  text-align: center;
  color: ${props => {
    if (props.isGameOver) return '#e74c3c';
    if (props.isActive) return '#2ecc71';
    return 'transparent';
  }};
  font-weight: 500;
  font-size: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  z-index: 1;
  background: rgba(0, 0, 0, 0.3);
  padding: 4px 12px;
  border-radius: 4px;
  white-space: nowrap;
`;

const PromotionDialog = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 1000;
`;

const PromotionOption = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f0f0f0;
  }

  img {
    width: 40px;
    height: 40px;
  }
`;

const MoveHistoryContainer = styled.div`
  background: linear-gradient(
    45deg,
    rgba(23, 32, 42, 0.95),
    rgba(44, 62, 80, 0.95)
  );
  padding: 20px;
  border-radius: 8px;
  color: white;
  font-family: 'Roboto Mono', monospace;
  width: 240px;
  max-height: 400px;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  backdrop-filter: blur(10px);

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 8px;
    background: linear-gradient(
      45deg,
      rgba(52, 152, 219, 0.1),
      rgba(46, 204, 113, 0.1),
      rgba(155, 89, 182, 0.1)
    );
    background-size: 400% 400%;
    animation: gradient 15s ease infinite;
    z-index: -1;
  }

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }

  @keyframes gradient {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`;

const MoveRow = styled.div`
  display: grid;
  grid-template-columns: 30px 90px 90px;
  gap: 10px;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s ease;

  &:nth-child(odd) {
    background: rgba(255, 255, 255, 0.03);
  }

  &:hover {
    background: rgba(255, 255, 255, 0.07);
  }
`;

const MoveNumber = styled.span`
  color: rgba(255, 255, 255, 0.4);
  font-weight: 500;
`;

const MoveText = styled.span<{ color: 'white' | 'black' }>`
  color: ${props => props.color === 'white' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.6)'};
  font-weight: 500;
  transition: color 0.2s ease;

  &:hover {
    color: ${props => props.color === 'white' ? '#fff' : 'rgba(255, 255, 255, 0.8)'};
  }
`;

const GameControls = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
  display: flex;
  gap: 10px;

  @media (max-width: 768px) {
    position: relative;
    top: auto;
    right: auto;
    justify-content: center;
    margin-bottom: 10px;
  }
`;

const ActionButton = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #2c3e50, #3498db);
  color: white;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(5px);

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      120deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: 0.5s;
  }

  &:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    background: linear-gradient(135deg, #3498db, #2c3e50);

    &:before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0) scale(0.95);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const CommentaryBox = styled.div`
  background: linear-gradient(135deg, rgba(23, 32, 42, 0.95), rgba(44, 62, 80, 0.95));
  padding: 15px;
  border-radius: 8px;
  color: white;
  font-family: 'Roboto', sans-serif;
  margin-top: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: fadeIn 0.3s ease-in-out;
  min-height: 60px;
  display: flex;
  align-items: center;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const StatsContainer = styled.div<{ size: number }>`
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 20px;
  margin-bottom: 20px;
  max-width: ${props => props.size}px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
`;

const PlayerStats = styled.div<{ isActive: boolean }>`
  background: ${props => props.isActive ? 
    'linear-gradient(135deg, rgba(46, 204, 113, 0.95), rgba(52, 152, 219, 0.95))' :
    'linear-gradient(135deg, rgba(23, 32, 42, 0.95), rgba(44, 62, 80, 0.95))'
  };
  padding: 15px 20px;
  border-radius: 12px;
  color: white;
  flex: 1;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  position: relative;
  backdrop-filter: blur(10px);
  transform: ${props => props.isActive ? 'translateY(-5px)' : 'none'};
  animation: ${props => props.isActive ? 'pulse 2s infinite' : 'none'};

  @keyframes pulse {
    0% {
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }
    50% {
      box-shadow: 0 4px 30px rgba(46, 204, 113, 0.4);
    }
    100% {
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  }

  @media (max-width: 768px) {
    width: 100%;
    max-width: 300px;
  }

  h3 {
    margin: 0 0 12px 0;
    font-size: 1.4rem;
    font-weight: 500;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }

    @media (max-width: 480px) {
      font-size: 1.2rem;
    }
  }
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 8px 0;
  font-size: 1rem;
  transition: all 0.3s ease;
  padding: 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(5px);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(5px);
  }

  span:first-child {
    color: rgba(255, 255, 255, 0.8);
    transition: all 0.3s ease;
  }

  span:last-child {
    font-weight: 600;
    transition: all 0.3s ease;
  }

  &:hover span:first-child {
    color: white;
  }

  &:hover span:last-child {
    transform: scale(1.1);
  }
`;

const Timer = styled.div<{ isLow: boolean }>`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${props => props.isLow ? '#e74c3c' : 'white'};
  animation: ${props => props.isLow ? 'pulse 1s infinite' : 'none'};

  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

const ControlPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: rgba(0, 0, 0, 0.3);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const ControlSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SectionTitle = styled.h3`
  color: white;
  margin: 0;
  font-size: 1.2rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const ModeButton = styled.button<{ isActive: boolean }>`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: ${props => props.isActive ? '#3498db' : '#95a5a6'};
  color: white;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

const GameOverBox = styled.div<{ type: 'win' | 'lose' | 'draw' }>`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  color: white;
  text-align: center;
  z-index: 1000;
  animation: popIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  max-width: 400px;
  width: 90%;
  background: ${props => 
    props.type === 'win' 
      ? 'linear-gradient(135deg, rgba(46, 204, 113, 0.95), rgba(39, 174, 96, 0.95))'
      : props.type === 'lose'
      ? 'linear-gradient(135deg, rgba(231, 76, 60, 0.95), rgba(192, 57, 43, 0.95))'
      : 'linear-gradient(135deg, rgba(52, 152, 219, 0.95), rgba(41, 128, 185, 0.95))'
  };

  @keyframes popIn {
    0% {
      transform: translate(-50%, -50%) scale(0.5);
      opacity: 0;
    }
    100% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
    }
  }

  h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  p {
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
    opacity: 0.9;
  }

  button {
    background: white;
    color: ${props => 
      props.type === 'win' 
        ? '#2ecc71'
        : props.type === 'lose'
        ? '#e74c3c'
        : '#3498db'
    };
    border: none;
    padding: 0.8rem 1.5rem;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
    }

    &:active {
      transform: translateY(0);
    }
  }
`;

const CaptureAnimation = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255,0,0,0.2) 0%, rgba(255,0,0,0) 70%);
  animation: capturePulse 0.5s ease-out;
  pointer-events: none;
  z-index: 2;

  @keyframes capturePulse {
    0% {
      transform: translate(-50%, -50%) scale(0.5);
      opacity: 0;
    }
    50% {
      transform: translate(-50%, -50%) scale(1.2);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 0;
    }
  }
`;

const EnhancedStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
  animation: float 3s ease-in-out infinite;

  @keyframes float {
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-5px);
    }
    100% {
      transform: translateY(0px);
    }
  }

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-5px) scale(1.05);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  }

  .label {
    font-size: 0.8rem;
    opacity: 0.7;
    margin-bottom: 4px;
    transition: all 0.3s ease;
  }

  .value {
    font-size: 1.1rem;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  &:hover .label {
    opacity: 1;
    transform: translateY(-2px);
  }

  &:hover .value {
    transform: scale(1.2);
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

interface PromotionDialogProps {
  onSelect: (piece: PieceType) => void;
  color: 'w' | 'b';
}

const PawnPromotionDialog: React.FC<PromotionDialogProps> = ({ onSelect, color }) => {
  const promotionPieces: PieceType[] = ['q', 'r', 'b', 'n'];

  return (
    <PromotionDialog>
      {promotionPieces.map((piece) => (
        <PromotionOption key={piece} onClick={() => onSelect(piece)}>
          <img
            src={PIECE_IMAGES[color][piece]}
            alt={`Promote to ${piece}`}
            draggable={false}
          />
          <span>
            {piece === 'q' ? 'Queen' :
             piece === 'r' ? 'Rook' :
             piece === 'b' ? 'Bishop' : 'Knight'}
          </span>
        </PromotionOption>
      ))}
    </PromotionDialog>
  );
};

interface ChessBoardProps {
  size: number;
  currentTheme: Theme;
}

interface MoveHistoryProps {
  moves: string[];
}

const MoveHistory: React.FC<MoveHistoryProps> = ({ moves }) => {
  const pairs = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({
      number: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1]
    });
  }

  return (
    <MoveHistoryContainer>
      {pairs.map(({ number, white, black }) => (
        <MoveRow key={number}>
          <MoveNumber>{number}.</MoveNumber>
          <MoveText color="white">{white}</MoveText>
          <MoveText color="black">{black || ''}</MoveText>
        </MoveRow>
      ))}
    </MoveHistoryContainer>
  );
};

interface PlayerStatsData {
  captures: number;
  checks: number;
  moveTime: number;
}

interface PlayerStatsState {
  white: PlayerStatsData;
  black: PlayerStatsData;
}

interface TimerState {
  white: number;
  black: number;
}

interface ChessBoardState {
  selectedSquare: string | null;
  possibleMoves: string[];
  currentTheme: Theme;
  capturableSquares: string[];
  capturedPieces: {
    white: { type: PieceType; count: number }[];
    black: { type: PieceType; count: number }[];
  };
  isGameStarted: boolean;
  timerMode: 'none' | '5min';
  pieceStyle: PieceStyle;
}

const ChessBoard: React.FC<ChessBoardProps> = ({ size, currentTheme }) => {
  const [game] = useState(() => {
    const savedFen = typeof window !== 'undefined' ? localStorage.getItem('chessFen') : null;
    if (savedFen) {
      const newGame = new Chess();
      newGame.load(savedFen);
      return newGame;
    }
    return new Chess();
  });

  const [ai] = useState(new ChessAI());
  const [commentary] = useState(new ChessCommentary());
  const [currentComment, setCurrentComment] = useState<string>('Welcome to the game! White to move.');
  const [moveHistory, setMoveHistory] = useState<string[]>(() => {
    const savedMoves = localStorage.getItem('chessMoves');
    return savedMoves ? JSON.parse(savedMoves) : [];
  });

  const [gameState, setGameState] = useState<ChessBoardState>(() => {
    const savedGameState = localStorage.getItem('chessGameState');
    return savedGameState ? JSON.parse(savedGameState) : {
      selectedSquare: null,
      possibleMoves: [],
      currentTheme,
      capturableSquares: [],
      capturedPieces: {
        white: [],
        black: [],
      },
      isGameStarted: false,
      timerMode: 'none',
      pieceStyle: 'default' as PieceStyle
    };
  });

  const [status, setStatus] = useState<string>('');
  const [promotionMove, setPromotionMove] = useState<{
    from: ChessSquare;
    to: ChessSquare;
  } | null>(null);

  const [playerStats, setPlayerStats] = useState<PlayerStatsState>(() => {
    const savedStats = localStorage.getItem('chessPlayerStats');
    return savedStats ? JSON.parse(savedStats) : {
      white: { captures: 0, checks: 0, moveTime: 0 },
      black: { captures: 0, checks: 0, moveTime: 0 },
    };
  });

  const [moveStartTime, setMoveStartTime] = useState<number>(Date.now());
  const [currentTimer, setCurrentTimer] = useState<TimerState>(() => {
    const savedTimer = localStorage.getItem('chessTimer');
    return savedTimer ? JSON.parse(savedTimer) : {
      white: gameState.timerMode === '5min' ? 300 : Infinity,
      black: gameState.timerMode === '5min' ? 300 : Infinity
    };
  });
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [captureAnimation, setCaptureAnimation] = useState<string | null>(null);
  const [gameStats, setGameStats] = useState({
    totalMoves: 0,
    captures: 0,
    checks: 0,
    averageMoveTime: 0,
    longestMoveTime: 0,
    shortestMoveTime: Infinity,
    pieceActivity: {
      p: 0, n: 0, b: 0, r: 0, q: 0, k: 0
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chessFen', game.fen());
      localStorage.setItem('chessMoves', JSON.stringify(moveHistory));
      localStorage.setItem('chessGameState', JSON.stringify(gameState));
    }
  }, [game.fen(), moveHistory, gameState]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chessPlayerStats', JSON.stringify(playerStats));
    }
  }, [playerStats]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chessTimer', JSON.stringify(currentTimer));
    }
  }, [currentTimer]);

  useEffect(() => {
    if (!game.isGameOver() && gameState.isGameStarted && gameState.timerMode === '5min') {
      const interval = setInterval(() => {
        const currentPlayer = game.turn() === 'w' ? 'white' : 'black';
        setCurrentTimer((prev: TimerState) => {
          const newTime = prev[currentPlayer] <= 0 ? 0 : prev[currentPlayer] - 1;
          
          // Check if time has run out
          if (newTime === 0) {
            const winner = currentPlayer === 'white' ? 'Black' : 'White';
            setStatus(`${winner} wins on time!`);
            // End the game by loading a valid FEN that represents a game over state
            game.load('4k3/8/8/8/8/8/8/4K3 w - - 0 1');
          }
          
          return {
            ...prev,
            [currentPlayer]: newTime
          };
        });
      }, 1000);
      setTimerInterval(interval);
      return () => clearInterval(interval);
    }
  }, [game.turn(), gameState.isGameStarted, gameState.timerMode]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const wholeSeconds = Math.floor(seconds % 60);
    const decimalPart = (seconds % 1).toFixed(2).substring(2);
    return `${minutes}:${wholeSeconds.toString().padStart(2, '0')}.${decimalPart}`;
  };

  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      isGameStarted: true
    }));
    setCurrentComment('Game started! White to move.');
    setMoveStartTime(Date.now());
  };

  const resetGame = () => {
    game.reset();
    setMoveHistory([]);
    setCurrentComment('Press Start to begin the game!');
    setGameState({
      selectedSquare: null,
      possibleMoves: [],
      currentTheme,
      capturableSquares: [],
      capturedPieces: {
        white: [],
        black: [],
      },
      isGameStarted: false,
      timerMode: 'none',
      pieceStyle: 'default' as PieceStyle
    });
    setPlayerStats({
      white: { captures: 0, checks: 0, moveTime: 0 },
      black: { captures: 0, checks: 0, moveTime: 0 },
    });
    setCurrentTimer({
      white: gameState.timerMode === '5min' ? 300 : Infinity,
      black: gameState.timerMode === '5min' ? 300 : Infinity
    });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('chessFen');
      localStorage.removeItem('chessMoves');
      localStorage.removeItem('chessGameState');
      localStorage.removeItem('chessPlayerStats');
      localStorage.removeItem('chessTimer');
    }
    updateStatus();
  };

  const updateCapturedPieces = (capturedPiece: PieceType, capturedColor: 'w' | 'b') => {
    setGameState(prev => {
      const targetArray = capturedColor === 'b' ? prev.capturedPieces.black : prev.capturedPieces.white;
      const existingPiece = targetArray.find(p => p.type === capturedPiece);
      
      if (existingPiece) {
        return {
          ...prev,
          capturedPieces: {
            ...prev.capturedPieces,
            [capturedColor === 'b' ? 'black' : 'white']: targetArray.map(p =>
              p.type === capturedPiece ? { ...p, count: p.count + 1 } : p
            ),
          },
        };
      } else {
        return {
          ...prev,
          capturedPieces: {
            ...prev.capturedPieces,
            [capturedColor === 'b' ? 'black' : 'white']: [
              ...targetArray,
              { type: capturedPiece, count: 1 },
            ],
          },
        };
      }
    });
  };

  const handleMove = (move: ChessMove, isAIMove: boolean = false) => {
    // Calculate move time
    const moveTime = (Date.now() - moveStartTime) / 1000;
    setMoveStartTime(Date.now());

    // Update game stats
    setGameStats(prev => ({
      ...prev,
      totalMoves: prev.totalMoves + 1,
      captures: prev.captures + (move.captured ? 1 : 0),
      checks: prev.checks + (game.isCheck() ? 1 : 0),
      averageMoveTime: (prev.averageMoveTime * prev.totalMoves + moveTime) / (prev.totalMoves + 1),
      longestMoveTime: Math.max(prev.longestMoveTime, moveTime),
      shortestMoveTime: Math.min(prev.shortestMoveTime, moveTime),
      pieceActivity: {
        ...prev.pieceActivity,
        [move.piece]: prev.pieceActivity[move.piece] + 1
      }
    }));

    // Show capture animation
    if (move.captured) {
      setCaptureAnimation(move.to);
      setTimeout(() => setCaptureAnimation(null), 500);
    }

    // Update stats
    const color = move.color === 'w' ? 'white' : 'black';
    setPlayerStats((prev: PlayerStatsState) => ({
      ...prev,
      [color]: {
        ...prev[color],
        captures: prev[color].captures + (move.captured ? 1 : 0),
        checks: prev[color].checks + (game.isCheck() ? 1 : 0),
        moveTime: prev[color].moveTime + moveTime,
      },
    }));

    if (move.captured) {
      updateCapturedPieces(move.captured as PieceType, move.color === 'w' ? 'b' : 'w');
    }

    addMoveToHistory(move.san);
    setCurrentComment(commentary.generateCommentary(game, move));

    setGameState(prev => ({
      ...prev,
      selectedSquare: null,
      possibleMoves: [],
      capturableSquares: [],
    }));
    
    updateStatus();

    if (!isAIMove && !game.isGameOver()) {
      // AI move with minimum thinking time
      const minThinkingTime = 2000; // 2 seconds minimum thinking time
      const startThinkingTime = Date.now();

      // Get AI's move immediately but don't apply it yet
      const aiMove = ai.getBestMove(game);
      
      if (aiMove) {
        setTimeout(() => {
          const actualThinkingTime = (Date.now() - startThinkingTime) / 1000;
          // Update black's timer for the "thinking" time
          setCurrentTimer(prev => ({
            ...prev,
            black: Math.max(0, prev.black - actualThinkingTime)
          }));
          
          const moveResult = game.move(aiMove);
          handleMove(moveResult, true);
        }, minThinkingTime);
      }
    }
  };

  const handlePromotion = (promotionPiece: PieceType) => {
    if (promotionMove) {
      const move = game.move({
        from: promotionMove.from,
        to: promotionMove.to,
        promotion: promotionPiece
      });

      handleMove(move);
      setPromotionMove(null);
    }
  };

  const addMoveToHistory = (move: string) => {
    setMoveHistory(prev => [...prev, move]);
  };

  const handleSquareClick = (square: string) => {
    if (!gameState.isGameStarted) return;
    if (game.turn() === 'b' || game.isGameOver()) return;

    if (gameState.selectedSquare === null) {
      const moves = game.moves({ square: square as ChessSquare, verbose: true }) as ChessMove[];
      if (moves.length > 0 && game.get(square as ChessSquare)?.color === 'w') {
        const captureMoves = moves.filter(move => move.captured);
        setGameState({
          ...gameState,
          selectedSquare: square,
          possibleMoves: moves.map(move => move.to),
          capturableSquares: captureMoves.map(move => move.to),
        });
      }
    } else {
      if (gameState.possibleMoves.includes(square)) {
        try {
          const piece = game.get(gameState.selectedSquare as ChessSquare);
          const rank = square.charAt(1);
          if (piece?.type === 'p' && rank === '8') {
            setPromotionMove({
              from: gameState.selectedSquare as ChessSquare,
              to: square as ChessSquare
            });
            return;
          }

          const move = game.move({
            from: gameState.selectedSquare as ChessSquare,
            to: square as ChessSquare,
          });

          handleMove(move);
        } catch (e) {
          console.error('Invalid move:', e);
        }
      } else {
        // If clicking on another white piece, select it instead
        const newSquarePiece = game.get(square as ChessSquare);
        if (newSquarePiece?.color === 'w') {
          const moves = game.moves({ square: square as ChessSquare, verbose: true }) as ChessMove[];
          const captureMoves = moves.filter(move => move.captured);
          setGameState({
            ...gameState,
            selectedSquare: square,
            possibleMoves: moves.map(move => move.to),
            capturableSquares: captureMoves.map(move => move.to),
          });
        } else {
          // If clicking elsewhere, clear selection
          setGameState(prev => ({
            ...prev,
            selectedSquare: null,
            possibleMoves: [],
            capturableSquares: [],
          }));
        }
      }
    }
  };

  const updateStatus = () => {
    if (game.isGameOver()) {
      if (game.isCheckmate()) {
        setStatus(`Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins!`);
      } else if (game.isDraw()) {
        setStatus('Game Over - Draw!');
      } else {
        setStatus('Game Over!');
      }
    } else {
      setStatus(`${game.turn() === 'w' ? 'White' : 'Black'} to move`);
    }
  };

  useEffect(() => {
    updateStatus();
    // Remove the capturable squares update from useEffect since we'll handle it in handleSquareClick
  }, [game.fen()]);

  const setPieceStyle = (style: PieceStyle) => {
    setGameState(prev => ({
      ...prev,
      pieceStyle: style
    }));
  };

  const renderSquare = (i: number, j: number) => {
    const file = String.fromCharCode(97 + j);
    const rank = 8 - i;
    const square = `${file}${rank}` as ChessSquare;
    const piece = game.get(square);
    const isLight = (i + j) % 2 === 0;
    const isSelected = square === gameState.selectedSquare;
    const isPossibleMove = gameState.possibleMoves.includes(square);
    const isCapturable = gameState.capturableSquares.includes(square);

    return (
      <Square
        key={square}
        isLight={isLight}
        theme={currentTheme}
        isSelected={isSelected}
        isPossibleMove={isPossibleMove}
        isCapturable={isCapturable}
        onClick={() => handleSquareClick(square)}
      >
        {piece && (
          <Piece
            src={PIECE_STYLES[gameState.pieceStyle]?.[piece.color]?.[piece.type] || PIECE_IMAGES[piece.color][piece.type]}
            alt={`${piece.color}${piece.type}`}
            draggable={false}
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.src = PIECE_IMAGES[piece.color][piece.type];
            }}
          />
        )}
        {captureAnimation === square && <CaptureAnimation />}
      </Square>
    );
  };

  const renderBoard = () => {
    const squares = [];
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        squares.push(renderSquare(i, j));
      }
    }
    return squares;
  };

  const setTimerMode = (mode: 'none' | '5min') => {
    setGameState(prev => ({
      ...prev,
      timerMode: mode
    }));
    setCurrentTimer({
      white: mode === '5min' ? 300 : Infinity,
      black: mode === '5min' ? 300 : Infinity
    });
  };

  const getGameOverType = () => {
    if (status.includes('wins on time')) {
      return status.includes('White wins') ? 'win' : 'lose';
    }
    if (game.isCheckmate()) {
      return game.turn() === 'b' ? 'win' : 'lose';
    }
    return 'draw';
  };

  const getGameOverMessage = () => {
    if (status.includes('wins on time')) {
      return status.includes('White wins') 
        ? '🎉 Congratulations! 🎉' 
        : 'Game Over';
    }
    if (game.isCheckmate()) {
      return game.turn() === 'b' 
        ? '🎉 Congratulations! 🎉' 
        : 'Game Over';
    }
    return 'Game Ended in a Draw!';
  };

  const getGameOverStatus = () => {
    if (status.includes('wins on time')) {
      return status;
    }
    if (game.isCheckmate()) {
      return `Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins!`;
    }
    if (game.isDraw()) {
      return 'Game Over - Draw!';
    }
    return 'Game Over!';
  };

  return (
    <GameContainer>
      <ControlPanel>
        <ControlSection>
          <SectionTitle>Piece Style</SectionTitle>
          <ButtonGroup>
            <ModeButton
              isActive={gameState.pieceStyle === 'default'}
              onClick={() => setPieceStyle('default')}
            >
              DEFAULT
            </ModeButton>
            <ModeButton
              isActive={gameState.pieceStyle === 'alpha'}
              onClick={() => setPieceStyle('alpha')}
            >
              ALPHA
            </ModeButton>
            <ModeButton
              isActive={gameState.pieceStyle === 'neo'}
              onClick={() => setPieceStyle('neo')}
            >
              NEO
            </ModeButton>
          </ButtonGroup>
        </ControlSection>
        <ControlSection>
          <SectionTitle>Timer Mode</SectionTitle>
          <ButtonGroup>
            <ModeButton
              isActive={gameState.timerMode === 'none'}
              onClick={() => setTimerMode('none')}
              disabled={gameState.isGameStarted}
            >
              NO TIMER
            </ModeButton>
            <ModeButton
              isActive={gameState.timerMode === '5min'}
              onClick={() => setTimerMode('5min')}
              disabled={gameState.isGameStarted}
            >
              5 MINUTES
            </ModeButton>
          </ButtonGroup>
        </ControlSection>
      </ControlPanel>
      <GameControls>
        <ActionButton 
          onClick={startGame} 
          disabled={gameState.isGameStarted}
          style={{ 
            opacity: gameState.isGameStarted ? 0.7 : 1,
            background: gameState.isGameStarted ? 
              'linear-gradient(135deg, #95a5a6, #7f8c8d)' : 
              'linear-gradient(135deg, #2c3e50, #3498db)',
            cursor: gameState.isGameStarted ? 'not-allowed' : 'pointer'
          }}
        >
          Start Game
        </ActionButton>
        <ActionButton onClick={resetGame}>
          New Game
        </ActionButton>
      </GameControls>
      <div>
        <StatsContainer size={size}>
          <PlayerStats isActive={game.turn() === 'w'}>
            <h3>White</h3>
            <StatRow>
              <span>Captures:</span>
              <span>{playerStats.white.captures}</span>
            </StatRow>
            <StatRow>
              <span>Checks:</span>
              <span>{playerStats.white.checks}</span>
            </StatRow>
            {gameState.timerMode !== 'none' && (
              <StatRow>
                <span>Time:</span>
                <Timer isLow={currentTimer.white < 60}>{formatTime(currentTimer.white)}</Timer>
              </StatRow>
            )}
            <EnhancedStats>
              <StatItem>
                <span className="label">Total Moves</span>
                <span className="value">{gameStats.totalMoves}</span>
              </StatItem>
              <StatItem>
                <span className="label">Avg Move Time</span>
                <span className="value">{gameStats.averageMoveTime.toFixed(1)}s</span>
              </StatItem>
              <StatItem>
                <span className="label">Longest Move</span>
                <span className="value">{gameStats.longestMoveTime.toFixed(1)}s</span>
              </StatItem>
              <StatItem>
                <span className="label">Shortest Move</span>
                <span className="value">{gameStats.shortestMoveTime.toFixed(1)}s</span>
              </StatItem>
            </EnhancedStats>
          </PlayerStats>
          <PlayerStats isActive={game.turn() === 'b'}>
            <h3>Black</h3>
            <StatRow>
              <span>Captures:</span>
              <span>{playerStats.black.captures}</span>
            </StatRow>
            <StatRow>
              <span>Checks:</span>
              <span>{playerStats.black.checks}</span>
            </StatRow>
            {gameState.timerMode !== 'none' && (
              <StatRow>
                <span>Time:</span>
                <Timer isLow={currentTimer.black < 60}>{formatTime(currentTimer.black)}</Timer>
              </StatRow>
            )}
          </PlayerStats>
        </StatsContainer>
        <div style={{ position: 'relative' }}>
          <GameStatus isGameOver={game.isGameOver()} isActive={true}>
            {status}
          </GameStatus>
          <BoardContainer size={size}>
            {Array(8).fill(null).map((_, i) => (
              Array(8).fill(null).map((_, j) => renderSquare(i, j))
            ))}
          </BoardContainer>
          <CommentaryBox>{currentComment}</CommentaryBox>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <MoveHistory moves={moveHistory} />
        <CapturedPieces capturedPieces={gameState.capturedPieces} pieceSize={size / 12} />
      </div>
      {promotionMove && (
        <PawnPromotionDialog onSelect={handlePromotion} color="w" />
      )}
      {game.isGameOver() && (
        <GameOverBox type={getGameOverType()}>
          <h2>{getGameOverMessage()}</h2>
          <p>{getGameOverStatus()}</p>
          <button onClick={resetGame}>Play Again</button>
        </GameOverBox>
      )}
    </GameContainer>
  );
};

export default ChessBoard; 