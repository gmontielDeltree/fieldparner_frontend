import React from 'react';
import {
  Popover,
} from '@mui/material';
import NotificationList from './NotificationList';

interface NotificationPopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  anchorEl,
  open,
  onClose,
}) => {
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      slotProps={{
        paper: {
          sx: {
            width: 400,
            maxHeight: 500,
            mt: 1,
          }
        }
      }}
    >
      <NotificationList />
    </Popover>
  );
};

export default NotificationPopover;
