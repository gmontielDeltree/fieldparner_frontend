import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import {
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  Fade,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Edit2,
  Repeat,
  FileText,
  Share2,
  BarChart2,
  Cloud,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import { useTranslation } from "react-i18next";

// Styled components for the action bar
const ActionsContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  position: 'relative',
  zIndex: 2,
  flexWrap: 'nowrap',
  '@media (max-width: 600px)': {
    gap: '4px',
  }
});

const ActionButton = styled(IconButton)({
  background: 'linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)',
  border: '1px solid rgba(226, 232, 240, 0.8)',
  borderRadius: '12px',
  padding: '8px',
  transition: 'all 0.2s ease-in-out',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  '&:hover': {
    background: 'linear-gradient(135deg, #f0f7ff 0%, #e6f0f9 100%)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    transform: 'translateY(-2px)',
  },
  '&.Mui-disabled': {
    background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)',
    opacity: 0.6,
    boxShadow: 'none',
  },
  '@media (max-width: 600px)': {
    padding: '6px',
  }
});

const MoreButton = styled(ActionButton)(({ theme }) => ({
  background: 'linear-gradient(135deg, #f0f7ff 0%, #e6f0f9 100%)',
  '&:hover': {
    background: 'linear-gradient(135deg, #e1efff 0%, #d7e7f7 100%)',
  }
}));

const TooltipWrapper = styled(Tooltip)({
  position: 'relative',
});

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    padding: '4px 0',
    minWidth: '200px',
  },
}));

const StyledMenuItem = styled(MenuItem)(({ theme, disabled }) => ({
  padding: '10px 16px',
  gap: '12px',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: disabled ? '#a0aec0' : '#0f172a',
  '&:hover': {
    backgroundColor: '#f7fafc',
  },
  '& svg': {
    color: disabled ? '#a0aec0' : '#0284c7',
  }
}));

// Main component
const ActivityActionsBar = ({
  onEditActivity,
  onDownloadOT,
  onRepeatOT,
  onShareOT,
  onDownloadCompare,
  onMeteo,
  onDeleteActivity,
  disabledActions = {},
  sx = {}
}) => {
  const { t } = useTranslation();
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const menuOpen = Boolean(menuAnchorEl);

  // Update window width on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleOpenMenu = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };

  // Define all actions
  const allActions = [
    {
      icon: <Edit2 size={18} strokeWidth={2} />,
      text: t('editActivity'),
      action: onEditActivity,
      disabled: disabledActions.edit || false
    },
    {
      icon: <FileText size={18} strokeWidth={2} />,
      text: t('createWorkOrder'),
      action: onDownloadOT,
      disabled: disabledActions.ot || false
    },
    {
      icon: <Repeat size={18} strokeWidth={2} />,
      text: t('repeatActivity'),
      action: onRepeatOT,
      disabled: disabledActions.repeat || false
    },
    {
      icon: <BarChart2 size={18} strokeWidth={2} />,
      text: t('programExecutionComparison'),
      action: onDownloadCompare,
      disabled: disabledActions.compare || false
    },
    {
      icon: <Share2 size={18} strokeWidth={2} />,
      text: t('shareWorkOrder'),
      action: onShareOT,
      disabled: disabledActions.share || false
    },
    {
      icon: <Cloud size={18} strokeWidth={2} />,
      text: t('meteorology'),
      action: onMeteo,
      disabled: disabledActions.meteo || false
    },
    {
      icon: <Trash2 size={18} strokeWidth={2} color="#e11d48" />,
      text: t('deleteActivity'),
      action: onDeleteActivity,
      textColor: "#e11d48",
      disabled: disabledActions.delete || false
    }
  ];

  // Determine how many actions to show based on screen width
  let visibleCount = 7; // Show all by default

  if (windowWidth < 768) {
    visibleCount = 2; // Show 2 on small mobile
  } else if (windowWidth < 1024) {
    visibleCount = 3; // Show 3 on mobile/small tablet
  } else if (windowWidth < 1280) {
    visibleCount = 5; // Show 5 on tablet/small desktop
  }

  const visibleActions = allActions.slice(0, visibleCount);
  const menuActions = allActions.slice(visibleCount);

  return (
    <ActionsContainer sx={sx}>
      {visibleActions.map((action) => (
        <TooltipWrapper
          key={action.text}
          title={action.text}
          arrow
          placement="top"
        >
          <span>
            <ActionButton
              onClick={action.action}
              disabled={action.disabled}
              size="small"
              sx={{ color: action.textColor }}
            >
              {action.icon}
            </ActionButton>
          </span>
        </TooltipWrapper>
      ))}

      {menuActions.length > 0 && (
        <>
          <TooltipWrapper title={t('moreActions')} arrow placement="top">
            <MoreButton
              onClick={handleOpenMenu}
              size="small"
            >
              <MoreHorizontal size={18} strokeWidth={2} />
            </MoreButton>
          </TooltipWrapper>

          <StyledMenu
            anchorEl={menuAnchorEl}
            open={menuOpen}
            onClose={handleCloseMenu}
            TransitionComponent={Fade}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            {menuActions.map((action, index) => (
              <StyledMenuItem
                key={action.text}
                onClick={() => {
                  handleCloseMenu();
                  action.action();
                }}
                disabled={action.disabled}
                sx={{ color: action.textColor }}
              >
                {action.icon}
                {action.text}
              </StyledMenuItem>
            ))}

            {menuActions.some(action => action.textColor === "#e11d48") ? null : (
              <Divider sx={{ my: 1 }} />
            )}
          </StyledMenu>
        </>
      )}
    </ActionsContainer>
  );
};

export default ActivityActionsBar;