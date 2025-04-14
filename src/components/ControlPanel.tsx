import React from 'react';
import styled from 'styled-components';
import { Theme } from '../types/chess';
import { themes } from '../config/themes';

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  width: 100%;
  max-width: 500px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  color: #ffffff;
  font-weight: 500;
  letter-spacing: 0.5px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const Button = styled.button<{ isActive: boolean }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: ${props => props.isActive ? 'rgba(74, 144, 226, 0.9)' : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.9)'};
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;
  backdrop-filter: blur(5px);
  text-transform: uppercase;
  letter-spacing: 1px;

  &:hover {
    background: ${props => props.isActive ? 'rgba(74, 144, 226, 1)' : 'rgba(255, 255, 255, 0.15)'};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

interface ControlPanelProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  currentTheme,
  onThemeChange,
}) => {
  return (
    <Panel>
      <Section>
        <Title>Board Theme</Title>
        <ButtonGroup>
          {Object.entries(themes).map(([name, theme]) => (
            <Button
              key={name}
              isActive={theme === currentTheme}
              onClick={() => onThemeChange(theme)}
            >
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </Button>
          ))}
        </ButtonGroup>
      </Section>
    </Panel>
  );
};

export default ControlPanel; 