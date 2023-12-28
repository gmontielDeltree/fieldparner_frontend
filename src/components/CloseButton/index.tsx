
import Button from '@mui/material/Button';
import Icon from '@mui/material/Icon';
import CancelIcon from '@mui/icons-material/Cancel';
import { useNavigate } from 'react-router-dom';

export const CloseButtonPage = () => {
  const navigate = useNavigate();

  const handleNavigateToFields = () => {
    navigate('/init/overview/fields');
  };

  return (
    <Button onClick={handleNavigateToFields} startIcon={<Icon component={CancelIcon} />} color="secondary">
    </Button>
  );
};