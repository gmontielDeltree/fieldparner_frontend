import React from 'react';
import { Box } from '@mui/material';
import * as MuiIcons from '@mui/icons-material';

const isEmoji = (s?: string) => {
  if (!s) return false;
  for (const ch of Array.from(s)) {
    const cp = ch.codePointAt(0) || 0;
    if (cp >= 0x1f000) return true;
  }
  return false;
};

const normalizeName = (s?: string) => {
  if (!s) return '';
  return String(s)
    .trim()
    .replace(/[^a-zA-Z0-9]/g, '');
};

const toPascal = (s: string) => {
  if (!s) return s;
  const raw = s.replace(/[^a-zA-Z0-9]/g, '');
  return raw.charAt(0).toUpperCase() + raw.slice(1);
};

const resolveMuiIcon = (name?: string | null) => {
  if (!name) return null;
  if (isEmoji(name)) return null;

  const raw = String(name || '');
  const norm = normalizeName(raw);
  if (!norm) return null;

  const variants = [
    raw,
    norm,
    toPascal(norm),
    `${toPascal(norm)}Icon`,
    `${toPascal(norm)}Rounded`,
    `${toPascal(norm)}Outlined`,
    `${toPascal(norm)}Sharp`,
    `${toPascal(norm)}TwoTone`,
  ];

  for (const cand of variants) {
    const IconComp = (MuiIcons as any)[cand];
    if (IconComp) return IconComp;
  }

  return null;
};

export const IconsViewer: React.FC<{ iconName?: string | null; size?: number }> = ({
  iconName,
  size = 22,
}) => {
  if (isEmoji(iconName)) {
    return (
      <Box component='span' sx={{ fontSize: size, lineHeight: 1 }}>
        {iconName}
      </Box>
    );
  }
  const IconComp = resolveMuiIcon(iconName || undefined);
  if (IconComp) return <IconComp sx={{ fontSize: size }} />;
  return null;
};
