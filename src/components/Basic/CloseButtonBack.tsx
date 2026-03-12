import { useNavigate } from 'react-router-dom';
import CloseButton from './CloseButton';

export const CloseButtonBack = () => {
  const navigate = useNavigate();
  return <CloseButton onClick={() => navigate(-1)} />;
};
