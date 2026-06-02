import React from 'react';
import { Box, Text } from '@mantine/core';
import colors from '../../styles/Colors';
import { Link } from 'react-router-dom';

export const Board = () => {
  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2rem',
        width: '100%',
        minHeight: '100vh',
        backgroundColor: colors.White_1,
        padding: '2rem',
        boxSizing: 'border-box',
      }}
    >
      <Text c={colors.Gray_2} size="xl" fw={700}>
        Game Board
      </Text>
      <Link to="/card-list" style={{ textDecoration: 'none' }}>
        <Text c={colors.Blue_3} size="lg" fw={600}>
          View Card List
        </Text>
      </Link>
    </Box>
  );
};

export default Board;