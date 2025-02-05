import React, { useState, useEffect } from 'react'
import {
  Tooltip,
  Typography,
  Button,
  Menu,
  MenuItem,
  Divider,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Slide,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import {
  loadCampaignFromLS,
  saveCampaignToLS,
} from '../../../helpers/persistence'
import { useAppSelector } from '../../../hooks'
import { useCampaign } from '../../../hooks'
import { uuidv7 } from 'uuidv7'
import { useDispatch } from 'react-redux'
import { campaignSlice, setSelectedCampaign } from '../../../redux/campaign'
import CreateCampaignModal from '../../CreateCampaign'
import { Campaign } from '../../../types'
import { toast } from 'react-toastify'
import CloseIcon from '@mui/icons-material/Close'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'

const Transition = React.forwardRef(function Transition(
  props: any,
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />
})

const CampaignMenu: React.FC = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const {
    campaigns,
    getCampaigns,
    addCampaign,
    updateCampaign,
    deleteCampaign,
  } = useCampaign()
  const { selectedCampaign } = useAppSelector((state) => state.campaign)

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const openDropdown = Boolean(anchorEl)

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [campaignToEdit, setCampaignToEdit] = useState<Campaign | undefined>()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [campaignToClose, setCampaignToClose] = useState<Campaign | null>(null)

  useEffect(() => {
    if (campaignToClose) {
      setAnchorEl(null)
    }
  }, [campaignToClose])

  const handleCampaignMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
  }

  const handleCreateAndEditCampaign = async (campaign: Campaign) => {
    if (campaign._rev) {
      await updateCampaign(campaign)
      dispatch(campaignSlice.actions.setSelectedCampaign(campaign))
      setIsEditModalOpen(false)
      getCampaigns()
      return
    }
    const uuid = uuidv7()
    campaign._id = `campaign:${uuid}`
    campaign.campaignId = `campaign:${uuid}`
    await addCampaign(campaign)
    dispatch(campaignSlice.actions.setSelectedCampaign(campaign))
    setIsCreateModalOpen(false)
    getCampaigns()
  }

  const onDeleteCampaignHandler = async (campaign: Campaign) => {
    await deleteCampaign(campaign)
    setIsEditModalOpen(false)

    if (campaign._id === selectedCampaign?._id) {
      const newCampaign = campaigns.find((e) => e._id !== campaign._id)
      if (newCampaign) {
        dispatch(setSelectedCampaign(newCampaign))
      } else {
        dispatch(setSelectedCampaign(null))
      }
    }
    getCampaigns()
  }

  useEffect(() => {
    getCampaigns()
    const campaign = loadCampaignFromLS()
    if (campaign) {
      dispatch(setSelectedCampaign(campaign))
    }
  }, [])

  useEffect(() => {
    if (selectedCampaign) {
      saveCampaignToLS(selectedCampaign)
      toast.success(
        `${t('La campaña')} ${selectedCampaign.name} ${t('está seleccionada')}`,
        {
          position: 'top-center',
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
          theme: 'colored',
          transition: Slide,
          onClose: () => {
            // Force cleanup of toast container
            const toastContainer = document.querySelector('.Toastify');
            if (toastContainer) {
              toastContainer.remove();
            }
          }
        },
      )
    }
  }, [selectedCampaign])

  const handleCampaignSelect = (campaignId: string) => {
    const campaign = campaigns.find((c) => c.campaignId === campaignId)
    if (campaign) {
      dispatch(campaignSlice.actions.setSelectedCampaign(campaign))
      handleCloseMenu()
    }
  }

  const handleEditClick = (campaignToEdit: Campaign) => {
    setCampaignToEdit(campaignToEdit)
    setIsEditModalOpen(true)
    handleCloseMenu()
  }

  const handleCloseCampaign = (campaign: Campaign) => {
    setCampaignToClose(campaign)
    handleCloseMenu()
  }

  const confirmCloseCampaign = async () => {
    if (campaignToClose) {
      const updatedCampaign = { ...campaignToClose, state: 'closed' }
      await updateCampaign(updatedCampaign)
      toast.success(
        `${t('Campaign')} "${updatedCampaign.name}" ${t('has been closed')}`,
        {
          position: 'top-center',
          autoClose: 3000,
          hideProgressBar: true,
          theme: 'colored',
          transition: Slide,
        },
      )
      // Verificar si la campaña cerrada es la campaña seleccionada
      if (selectedCampaign?._id === updatedCampaign._id) {
        const newCampaign = campaigns.find(
          (campaign) =>
            campaign._id !== updatedCampaign._id && campaign.state !== 'closed',
        )
        if (newCampaign) {
          dispatch(setSelectedCampaign(newCampaign))
        } else {
          dispatch(setSelectedCampaign(null))
        }
      }
      getCampaigns()
      setCampaignToClose(null)
    }
  }

  const handleDialogClose = () => {
    setCampaignToClose(null)
    setAnchorEl(null)
  }

  return (
    <>
      <Tooltip
        title={`${t('Campaña seleccionada')}: ${t('Desde')} ${
          selectedCampaign?.startDate
        } ${t('al')} ${selectedCampaign?.endDate} - ${selectedCampaign?.state}`}
      >
        <Button
          aria-label="campaign"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleCampaignMenu}
          color="inherit"
          style={{
            marginLeft: '50px',
            backgroundColor: '#f5f5f5',
            color: '#1976d2',
            borderRadius: '4px',
            textTransform: 'none',
          }}
        >
          {selectedCampaign?.name || t('no_campaign')}
        </Button>
      </Tooltip>

      <CreateCampaignModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateAndEditCampaign}
      />

      <CreateCampaignModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onCreate={handleCreateAndEditCampaign}
        initialData={campaignToEdit}
        onDelete={campaigns.length > 1 ? onDeleteCampaignHandler : undefined}
        editMode
      />
      <Menu
        id="menu-campaigns"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        open={openDropdown}
        onClose={handleCloseMenu}
        keepMounted={false}
        sx={{
          '& .MuiPaper-root': {
            minWidth: '630px',
          },
        }}
      >
        <MenuItem
          onClick={() => {
            setIsCreateModalOpen(true)
            handleCloseMenu()
          }}
        >
          {t('add_new_campaign')} +
        </MenuItem>
        <Divider />
        {campaigns
          .filter((campaign) => campaign.state !== 'closed')
          .map((campaign) => (
            <MenuItem key={campaign._id}>
              <Grid container sx={{ width: '40rem' }}>
                <Grid
                  item
                  xs={8}
                  onClick={() => handleCampaignSelect(campaign.campaignId)}
                  style={{ cursor: 'pointer' }}
                >
                  <Typography variant="subtitle1">{campaign.name}</Typography>
                  <Typography variant="subtitle2" color="textSecondary">
                    {`${
                      campaign?.description.length
                        ? campaign?.description
                        : 'No description'
                    } - ${campaign?.startDate} ${t('to')} ${
                      campaign?.endDate
                    } ${
                      campaign?.state.length ? ` - ${campaign?.state}` : ''
                    } ${
                      campaign?.zoneId.length ? ` - ${campaign?.zoneId}` : ''
                    }`}
                  </Typography>
                </Grid>
                <Grid item xs={4} style={{ textAlign: 'right' }}>
                  <Button
                    color="primary"
                    size="small"
                    variant="contained"
                    onClick={() => handleEditClick(campaign)}
                    style={{ marginRight: '8px', marginTop: '8px' }}
                  >
                    {t('Edit')}
                  </Button>

                  {campaigns.length > 1 && (
                    <Button
                      variant="contained"
                      size="small"
                      color="error"
                      onClick={() => onDeleteCampaignHandler(campaign)}
                      style={{ marginTop: '8px', marginRight: '8px' }}
                    >
                      {t('Delete')}
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    size="small"
                    color="warning"
                    onClick={() => handleCloseCampaign(campaign)}
                    style={{ marginTop: '8px' }}
                    startIcon={<CloseIcon />}
                  >
                    {t('Close')}
                  </Button>
                </Grid>
              </Grid>
              <Divider />
            </MenuItem>
          ))}
      </Menu>

      <Dialog
        open={campaignToClose !== null}
        onClose={handleDialogClose}
        aria-labelledby="close-campaign-dialog-title"
        aria-describedby="close-campaign-dialog-description"
        TransitionComponent={Transition}
        keepMounted={false}
      >
        <DialogTitle
          id="close-campaign-dialog-title"
          style={{ textAlign: 'center', paddingTop: '24px' }}
        >
          <WarningAmberIcon
            color="warning"
            style={{ fontSize: '48px', marginBottom: '8px' }}
          />
          <Typography variant="h5">{t('Confirm Close Campaign')}</Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="close-campaign-dialog-description"
            style={{ textAlign: 'center', marginTop: '16px' }}
          >
            {t('Are you sure you want to close the campaign')}{' '}
            <strong>"{campaignToClose?.name}"</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions
          style={{ justifyContent: 'center', paddingBottom: '24px' }}
        >
          <Button
            onClick={handleDialogClose}
            color="primary"
            variant="outlined"
            style={{ marginRight: '16px' }}
          >
            {t('Cancel')}
          </Button>
          <Button
            onClick={confirmCloseCampaign}
            color="secondary"
            variant="contained"
          >
            {t('Close Campaign')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default CampaignMenu
