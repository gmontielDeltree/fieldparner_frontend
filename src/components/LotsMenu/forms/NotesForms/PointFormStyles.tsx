import { styled, keyframes } from "@mui/material/styles";
import {
  Typography,
  Button,
  Grid,
  Card,
  IconButton,
  TextField
} from "@mui/material";

export const Title = styled(Typography)({
  fontSize: "1.5em",
  fontWeight: "bold",
  color: "#333",
  marginBottom: "20px"
});

export const hoverAnimation = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  `;

export const ImageUploadButton = styled(Button)({
  backgroundColor: "#1c76d2",
  color: "#fff",
  "&:hover": {
    backgroundColor: "#7b1fa2",
    animation: `${hoverAnimation} 1.5s ease-in-out infinite`
  },
  margin: "10px 0",
  padding: "10px 20px"
});

export const RecordingButton = styled(IconButton)({
  color: (props) => (props.recording ? "#d32f2f" : "#1976d2"),
  transform: (props) => (props.recording ? "scale(1.2)" : "scale(1)"),
  transition: "transform 0.2s ease-in-out",
  "&:hover": {
    backgroundColor: (props) => (props.recording ? "#ff7961" : "#64b5f6")
  }
});

export const StyledTextField = styled(TextField)({
  margin: "10px 0"
});

export const StyledGrid = styled(Grid)({
  padding: "10px"
});

export const ImageGrid = styled(Grid)({
  marginTop: "10px",
  display: "flex",
  justifyContent: "start",
  flexWrap: "wrap",
  gap: "10px"
});

export const StyledImageCard = styled(Card)({
  maxWidth: 150,
  boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)",
  transition: "0.3s",
  position: "relative",
  "&:hover": {
    boxShadow: "0 8px 16px 0 rgba(0,0,0,0.2)"
  }
});

export const CustomButton = styled(Button)({
  margin: "10px 0",
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)"
  }
});

export const StyledCard = styled(Card)({
  margin: "20px 0",
  padding: "15px",
  backgroundColor: "#f3f3f3",
  boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "150px",
  width: "100%"
});

export const RecordingArea = styled("div")({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "20px"
});

export const AudioRecordCard = StyledCard;
export const AudioPlaybackCard = StyledCard;

export const RecordingIndicator = styled("div")(({ recording }) => ({
  height: "15px",
  width: "15px",
  borderRadius: "50%",
  backgroundColor: recording ? "#d32f2f" : "#1976d2",
  animation: recording ? `${pulseAnimation} 2s infinite` : "none"
}));

export const pulseAnimation = keyframes`
    0% { transform: scale(0.95); opacity: 0.7; }
    50% { transform: scale(1.1); opacity: 1; }
    100% { transform: scale(0.95); opacity: 0.7; }
  `;

export const RecordingStatusLabel = styled(Typography)({
  margin: "0 20px",
  fontWeight: "bold",
  fontSize: "1.2rem"
});

export const AudioPlayer = styled("audio")({
  width: "100%",
  marginTop: "10px",
  outline: "none",
  "&::-webkit-media-controls-panel": {
    backgroundColor: "#e3f2fd",
    borderRadius: "4px"
  },
  "&::-webkit-media-controls-play-button": {},
  "&::-webkit-media-controls-current-time-display, &::-webkit-media-controls-time-remaining-display, &::-webkit-media-controls-mute-button, &::-webkit-media-controls-volume-slider":
    {
      color: "#333"
    }
});

export const PlaybackTitle = styled(Typography)({
  marginBottom: "10px",
  fontWeight: "bold",
  color: "#333",
  fontSize: "1.2rem"
});
