import React from 'react';
import { Box, Typography } from '@mui/material';
import { Check as CheckIcon, Clear as ClearIcon } from '@mui/icons-material';

interface ValidationItemProps {
  valid: boolean;
  text: string;
}

const ValidationItem: React.FC<ValidationItemProps> = ({ valid, text }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
      {valid ? (
        <CheckIcon sx={{ fontSize: 16, color: 'success.main' }} />
      ) : (
        <ClearIcon sx={{ fontSize: 16, color: 'error.main' }} />
      )}
      <Typography variant="caption" color={valid ? 'success.main' : 'text.secondary'}>
        {text}
      </Typography>
    </Box>
  );
};

export default ValidationItem;