import { Typography, Box } from "@mui/material";

export const FormSection: React.FC<{ title?: string; children: React.ReactNode }> = ({ title, children }) => (
    <Box sx={{ mb: 4 }}>
      {title && (
        <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
          <Box sx={{ flexGrow: 1, height: '1px', backgroundColor: 'divider' }} />
          <Typography
            variant="h6"
            sx={{ mx: 2, fontWeight: 500, color: 'text.secondary' }}
          >
            {title}
          </Typography>
          <Box sx={{ flexGrow: 1, height: '1px', backgroundColor: 'divider' }} />
        </Box>
      )}
      <Box sx={{ pl: 2 }}>{children}</Box>
    </Box>
  );