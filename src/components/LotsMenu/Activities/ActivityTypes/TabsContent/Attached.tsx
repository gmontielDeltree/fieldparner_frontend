import React from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Avatar,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import { styled, alpha } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

// ─── Styled Components (matching Planification design) ──────────────

const AttachedCard = styled(Paper)(({ theme }) => ({
  borderRadius: '16px',
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  boxShadow: 'rgba(145, 158, 171, 0.16) 0px 1px 2px 0px, rgba(145, 158, 171, 0.12) 0px 8px 16px -4px',
  overflow: 'hidden',
  backgroundColor: theme.palette.background.paper,
}));

const CardHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(2, 2.5),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
}));

const SectionIcon = styled(Avatar)(({ theme }) => ({
  width: 34,
  height: 34,
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
  color: theme.palette.primary.main,
  "& .MuiSvgIcon-root": {
    fontSize: "1.15rem",
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '0.9rem',
  color: theme.palette.text.primary,
  letterSpacing: '-0.01em',
}));

const DropZone = styled('label')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(4, 3),
  margin: theme.spacing(2.5),
  borderRadius: '14px',
  border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
  backgroundColor: alpha(theme.palette.primary.main, 0.02),
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  "&:hover": {
    borderColor: alpha(theme.palette.primary.main, 0.4),
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  },
}));

const UploadIconBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 56,
  height: 56,
  borderRadius: '16px',
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.04)} 100%)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
}));

const UploadButton = styled(Button)(({ theme }) => ({
  borderRadius: '10px',
  padding: '8px 24px',
  fontWeight: 600,
  fontSize: '0.82rem',
  textTransform: 'none',
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
  color: theme.palette.primary.main,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  boxShadow: 'none',
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.14),
    borderColor: theme.palette.primary.main,
    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
  },
}));

// ─── Component ──────────────────────────────────────────────────────

function AttachedContent() {
  const { t } = useTranslation();

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <AttachedCard elevation={0}>
        <CardHeader>
          <SectionIcon><AttachFileIcon /></SectionIcon>
          <SectionTitle>{t("attachments")}</SectionTitle>
        </CardHeader>

        <input
          accept="*/*"
          style={{ display: "none" }}
          id="contained-button-file"
          type="file"
          onChange={handleFileUpload}
        />

        <DropZone htmlFor="contained-button-file">
          <UploadIconBox>
            <CloudUploadIcon sx={{ fontSize: '1.6rem', color: 'primary.main' }} />
          </UploadIconBox>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: 'text.primary', mb: 0.3 }}>
              {t("upload_file")}
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
              {t("dragOrClickToUpload") || "Arrastrá o hacé click para subir archivos"}
            </Typography>
          </Box>
          <UploadButton
            component="span"
            startIcon={<InsertDriveFileOutlinedIcon sx={{ fontSize: '1rem !important' }} />}
          >
            {t("selectFile") || "Seleccionar archivo"}
          </UploadButton>
        </DropZone>
      </AttachedCard>
    </Box>
  );
}

export default AttachedContent;
