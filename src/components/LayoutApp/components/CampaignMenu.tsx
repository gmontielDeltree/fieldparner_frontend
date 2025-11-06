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
import { dbContext } from '../../../services'
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
    isLoading,
    error
  } = useCampaign()
  const { selectedCampaign } = useAppSelector((state) => state.campaign)
  const { user } = useAppSelector((state) => state.auth)

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const openDropdown = Boolean(anchorEl)

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [campaignToEdit, setCampaignToEdit] = useState<Campaign | undefined>()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [campaignToClose, setCampaignToClose] = useState<Campaign | null>(null)

  // Filtrar campañas activas una sola vez
  const activeCampaigns = campaigns.filter((campaign) => campaign.state !== 'closed')

  console.log("CampaignMenu - Render state:", {
    campaignsTotal: campaigns.length,
    activeCampaignsCount: activeCampaigns.length,
    selectedCampaign: selectedCampaign,
    isLoading
  })

  useEffect(() => {
    if (campaignToClose) {
      setAnchorEl(null)
    }
  }, [campaignToClose])

  const handleCampaignMenu = (event: React.MouseEvent<HTMLElement>) => {
    console.log("Opening campaign menu dropdown")
    setAnchorEl(event.currentTarget)
  }

  const handleCloseMenu = () => {
    console.log("Closing campaign menu dropdown")
    setAnchorEl(null)
  }

  const handleCreateAndEditCampaign = async (campaign: Campaign) => {
    console.log('Handling campaign create/edit:', campaign)
    console.log('🎯 CampaignMenu - Received zafra:', campaign.zafra)
    console.log('🎯 CampaignMenu - Zafra type:', typeof campaign.zafra)
    console.log('🎯 CampaignMenu - Is Array?:', Array.isArray(campaign.zafra))
    
    try {
      if (campaign._rev) {
        console.log('Editing existing campaign:', campaign)
        await updateCampaign(campaign)
        dispatch(campaignSlice.actions.setSelectedCampaign(campaign))
        saveCampaignToLS(campaign) // Guardar en localStorage
        setIsEditModalOpen(false)
        await getCampaigns()
        return
      }
      const uuid = uuidv7()
      campaign._id = `campaign:${uuid}`
      campaign.campaignId = `campaign:${uuid}`
      console.log('Creating new campaign with ID:', campaign._id)
      console.log('🎯 CampaignMenu - Campaign to save:', campaign)
      await addCampaign(campaign)
      dispatch(campaignSlice.actions.setSelectedCampaign(campaign))
      saveCampaignToLS(campaign) // Guardar en localStorage
      setIsCreateModalOpen(false)
      await getCampaigns()
    } catch (err) {
      console.error('Error handling campaign create/edit:', err)
    }
  }

  const onDeleteCampaignHandler = async (campaign: Campaign) => {
    console.log('Deleting campaign:', campaign._id)
    try {
      await deleteCampaign(campaign)
      setIsEditModalOpen(false)

      if (campaign._id === selectedCampaign?._id) {
        const newCampaign = campaigns.find((e) => e._id !== campaign._id)
        if (newCampaign) {
          console.log('Setting new selected campaign after deletion:', newCampaign._id)
          dispatch(setSelectedCampaign(newCampaign))
        } else {
          console.log('No campaigns left after deletion, setting selected to null')
          dispatch(setSelectedCampaign(null))
        }
      }
      await getCampaigns()
    } catch (err) {
      console.error('Error deleting campaign:', err)
    }
  }

  // Initial load effect - solo cargar campañas
  useEffect(() => {
    console.log('CampaignMenu mounted, fetching campaigns...')
    getCampaigns()
  }, [])

  // Effect para manejar la selección de campaña cuando las campañas se cargan
  useEffect(() => {
    console.log('Campaigns updated, count:', campaigns.length)

    // Solo ejecutar si hay campañas y no hay campaña seleccionada
    if (campaigns.length > 0 && !selectedCampaign) {
      const campaignFromLS = loadCampaignFromLS()
      console.log('Campaign from localStorage:', campaignFromLS)

      if (campaignFromLS) {
        const campaignExists = campaigns.some(c => c._id === campaignFromLS._id)
        
        if (campaignExists) {
          console.log('Setting selected campaign from localStorage:', campaignFromLS._id)
          dispatch(setSelectedCampaign(campaignFromLS))
          return
        } else {
          console.log('Campaign from localStorage not found in current campaigns')
        }
      }
      
      // Si no hay campaña en localStorage o no existe, seleccionar la primera activa
      const firstActiveCampaign = campaigns.find(c => c.state !== 'closed')
      if (firstActiveCampaign) {
        console.log('Selecting first active campaign:', firstActiveCampaign._id)
        dispatch(setSelectedCampaign(firstActiveCampaign))
        saveCampaignToLS(firstActiveCampaign)
      }
    }
  }, [campaigns, selectedCampaign, dispatch])

  useEffect(() => {
    if (selectedCampaign) {
      console.log('Saving selected campaign to localStorage:', selectedCampaign._id)
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
        },
      )
    } else {
      console.log('No campaign selected to save to localStorage')
    }
  }, [selectedCampaign, t])

  const handleCampaignSelect = (campaignId: string) => {
    console.log('Selecting campaign with ID:', campaignId)
    const campaign = campaigns.find((c) => c.campaignId === campaignId)
    if (campaign) {
      console.log('Found campaign to select:', campaign)
      dispatch(campaignSlice.actions.setSelectedCampaign(campaign))
      handleCloseMenu()
    } else {
      console.error('Campaign not found with ID:', campaignId)
    }
  }

  const handleEditClick = (campaignToEdit: Campaign) => {
    console.log('Edit clicked for campaign:', campaignToEdit._id)
    console.log('🎨 Campaign to edit full object:', campaignToEdit)
    console.log('🎨 Campaign zafra field:', campaignToEdit.zafra)
    console.log('🎨 Campaign zafra type:', typeof campaignToEdit.zafra)
    setCampaignToEdit(campaignToEdit)
    setIsEditModalOpen(true)
    handleCloseMenu()
  }

  const handleCloseCampaign = (campaign: Campaign) => {
    console.log('Setting campaign to close:', campaign._id)
    setCampaignToClose(campaign)
    handleCloseMenu()
  }

  const confirmCloseCampaign = async () => {
    if (campaignToClose) {
      try {
        console.log('Confirming close of campaign:', campaignToClose._id)
        // A073: validate there are no pending planned or non-executed activities for this campaign
        const fieldsDb = dbContext.fields
        // 1) Planned activities for this campaign
        const plannedResp = await fieldsDb.allDocs({
          startkey: 'planactividad:',
          endkey: 'planactividad:\ufff0',
          include_docs: true,
        })
        const plannedPendientes = plannedResp.rows
          .map(r => r.doc as any)
          .filter(doc => doc && (doc.campanaId === campaignToClose._id || doc.campanaId === campaignToClose.campaignId))

        // 2) Regular activities that are not executed for this campaign
        const actsResp = await fieldsDb.allDocs({
          startkey: 'actividad:',
          endkey: 'actividad:\ufff0',
          include_docs: true,
        })
        // 3) Confirm executions: check ejecucion:* docs and map executed uuids
        const ejecResp = await fieldsDb.allDocs({
          startkey: 'ejecucion:',
          endkey: 'ejecucion:\ufff0',
          include_docs: true,
        })
        const executedUuids = new Set<string>((ejecResp.rows || []).flatMap(r => {
          const arr: string[] = []
          if (r.id) {
            const parts = String(r.id).split(':')
            arr.push(parts[parts.length - 1])
          }
          const doc: any = r.doc
          if (doc?.actividad_uuid) arr.push(doc.actividad_uuid)
          return arr
        }))

        const validTipos = new Set(['siembra','aplicacion','cosecha','preparado'])
        const actsInCampaign = actsResp.rows
          .map(r => r.doc as any)
          .filter(doc => {
            const idCamp = doc?.campaña?.campaignId || doc?.campanaId
            const pertenece = idCamp === campaignToClose._id || idCamp === campaignToClose.campaignId
            return pertenece
          })

        const allActsDebug = actsInCampaign.map(doc => {
          const estado = (doc?.estado || '').toLowerCase()
          const tipo = (doc?.tipo || '').toLowerCase()
          const uuid = doc?.uuid || (doc?._id ? String(doc._id).split(':').pop() : undefined)
          const hasExecution = uuid ? executedUuids.has(uuid) : false
          const isRealLabor = validTipos.has(tipo)
          const shouldBlock = isRealLabor && !hasExecution && !(estado === 'completada' || estado === 'ejecutada')
          return {
            _id: doc?._id,
            uuid,
            tipo,
            estado,
            isRealLabor,
            hasExecution,
            shouldBlock,
          }
        })

        const actividadesNoEjecutadas = allActsDebug.filter(a => a.shouldBlock)

        console.log('[CloseCampaign] Audit check:', {
          campaign: campaignToClose._id,
          plannedPendientes: plannedPendientes?.length || 0,
          actividadesNoEjecutadas: actividadesNoEjecutadas?.length || 0,
          samplePlanned: plannedPendientes?.slice(0, 3)?.map((d:any)=>d._id),
          sampleActivities: actividadesNoEjecutadas?.slice(0, 5)
        })
        console.table(allActsDebug.slice(0, 20))

        if ((plannedPendientes?.length || 0) > 0 || (actividadesNoEjecutadas?.length || 0) > 0) {
          toast.error(t('No se puede cerrar la campaña: existen labores planificadas o pendientes de ejecución.') + ` (${(plannedPendientes?.length||0)} planificadas, ${(actividadesNoEjecutadas?.length||0)} pendientes)`, {
            position: 'top-center',
            autoClose: 4000,
            hideProgressBar: true,
            theme: 'colored',
          })
          setCampaignToClose(null)
          return
        }

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

        if (selectedCampaign?._id === updatedCampaign._id) {
          const newCampaign = campaigns.find(
            (campaign) =>
              campaign._id !== updatedCampaign._id && campaign.state !== 'closed',
          )
          if (newCampaign) {
            console.log('Setting new selected campaign after close:', newCampaign._id)
            dispatch(setSelectedCampaign(newCampaign))
          } else {
            console.log('No active campaigns left after close, setting selected to null')
            dispatch(setSelectedCampaign(null))
          }
        }
        await getCampaigns()
        setCampaignToClose(null)
      } catch (err) {
        console.error('Error closing campaign:', err)
      }
    }
  }

  const handleDialogClose = () => {
    setCampaignToClose(null)
    setAnchorEl(null)
  }

  const campaignName = selectedCampaign?.name || t('no_campaign')
  const tooltipTitle = selectedCampaign
    ? `${t('Campaña seleccionada')}: ${t('Desde')} ${selectedCampaign.startDate} ${t('al')} ${selectedCampaign.endDate} - ${selectedCampaign.state}`
    : t('no_campaign')

  return (
    <>
      <Tooltip title={tooltipTitle}>
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
          {isLoading ? `${t('Loading')}...` : campaignName}
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

        {isLoading ? (
          <MenuItem>
            <Typography>{t('Loading')}...</Typography>
          </MenuItem>
        ) : activeCampaigns.length === 0 ? (
          <MenuItem>
            <Typography>{t('No active campaigns found')}</Typography>
          </MenuItem>
        ) : (
          activeCampaigns.map((campaign) => (
            <MenuItem key={campaign._id}>
              <Grid container sx={{ width: '40rem' }}>
                <Grid
                  item
                  xs={8}
                  onClick={() => handleCampaignSelect(campaign.campaignId)}
                  style={{ cursor: 'pointer' }}
                >
                  <Typography variant="subtitle1">{campaign.name || 'Unnamed Campaign'}</Typography>
                  <Typography variant="subtitle2" color="textSecondary">
                    {`${campaign?.description || 'No description'} - ${campaign?.startDate || ''} ${t('to')} ${campaign?.endDate || ''} ${campaign?.state ? ` - ${campaign.state}` : ''} ${campaign?.zoneId ? ` - ${campaign.zoneId}` : ''}`}
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
          ))
        )}
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

