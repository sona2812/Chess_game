import React from 'react';
import styled from 'styled-components';

const CommentaryContainer = styled.div`
  background: linear-gradient(
    45deg,
    rgba(44, 62, 80, 0.95),
    rgba(52, 73, 94, 0.95)
  );
  padding: 20px;
  border-radius: 8px;
  color: white;
  width: 240px;
  min-height: 100px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  backdrop-filter: blur(10px);
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const CommentaryText = styled.p`
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.9);
  animation: fadeIn 0.5s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const CommentaryTitle = styled.div`
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 10px;
  color: #3498db;
`;

interface CommentaryBoxProps {
  comment: string;
}

const CommentaryBox: React.FC<CommentaryBoxProps> = ({ comment }) => {
  return (
    <CommentaryContainer>
      <CommentaryTitle>Chess Commentary</CommentaryTitle>
      <CommentaryText>{comment}</CommentaryText>
    </CommentaryContainer>
  );
};

export default CommentaryBox; 