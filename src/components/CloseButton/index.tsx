
import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded';
import { useNavigate } from 'react-router-dom';
import { IconButton } from '@mui/material';

export const CloseButtonPage = () => {
  const navigate = useNavigate();

  const handleNavigateToFields = () => {
    navigate('/init/overview/fields');
  };

  return (
    <IconButton
      onClick={handleNavigateToFields}
      color="secondary" >
      <HighlightOffRoundedIcon fontSize='medium' />
    </IconButton>
  );
};