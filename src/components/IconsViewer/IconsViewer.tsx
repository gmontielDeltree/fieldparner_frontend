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
  const nameStr: string | undefined = iconName == null ? undefined : String(iconName);

  if (isEmoji(nameStr)) {
    return (
      <Box component='span' sx={{ fontSize: size, lineHeight: 1 }}>
        {nameStr}
      </Box>
    );
  }
  const name = nameStr;

  // If iconName looks like a URL or asset path, render an <img>
  if (name && (name.includes('/') || name.match(/\.(png|webp|jpg|jpeg|svg)$/i))) {
    return <Box component='img' src={name} sx={{ width: size, height: size }} />;
  }

  // If iconName contains a colon (vaadin/my-icons namespace), render a vaadin-icon webcomponent
  if (name && name.includes(':')) {
    // create vaadin-icon webcomponent without JSX unknown element error
    const vnode = React.createElement('vaadin-icon', { icon: name, style: { width: size, height: size } });
    return (
      <Box component='span' sx={{ display: 'inline-flex', width: size, height: size }}>
        {vnode}
      </Box>
    );
  }

  const IconComp = resolveMuiIcon(name || undefined);
  if (IconComp) return <IconComp sx={{ fontSize: size }} />;
  return null;
};
