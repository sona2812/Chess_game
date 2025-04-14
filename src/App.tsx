import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ChessBoard from './components/ChessBoard';
import ControlPanel from './components/ControlPanel';
import { Theme } from './types/chess';
import { themes } from './config/themes';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%);
  color: #ffffff;
`;

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const BoardWrapper = styled.div`
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
`;

function App() {
  const [boardSize, setBoardSize] = useState(560);
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes.default);

  useEffect(() => {
    const handleResize = () => {
      const minSize = Math.min(window.innerWidth - 80, window.innerHeight - 250);
      setBoardSize(Math.min(600, minSize));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <AppContainer>
      <GameContainer>
        <Title>Chess Game</Title>
        <ControlPanel
          currentTheme={currentTheme}
          onThemeChange={setCurrentTheme}
        />
        <BoardWrapper>
          <ChessBoard
            size={boardSize}
            currentTheme={currentTheme}
          />
        </BoardWrapper>
      </GameContainer>
    </AppContainer>
  );
}

export default App;
