import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import CloseIcon from '@mui/icons-material/Close'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import {
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import * as XLSX from 'xlsx'

import { hideFieldList } from '../../redux/fieldsList'
import { SearchBar } from '../Planification/SearchBar'
import { Field } from '../../interfaces/field'
import FieldOutlineIcon from './fieldoutlineicon'
import FieldInfoPopup from './FieldInfoPopup'
import InfoButton from './InfoButton'

interface FieldsSideMenuProps {
  open: boolean
  fields: Field[]
  onSelectField: (field: Field) => void
  onSelectLot: (lot: any, field: Field) => void
}

const FieldsSideMenu: React.FC<FieldsSideMenuProps> = ({
  open,
  fields,
  onSelectField,
  onSelectLot,
}) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [currentField, setCurrentField] = useState<Field | null>(null)
  const [pdfContent, setPdfContent] = useState('')
  const [filtrados, setFiltrados] = useState<Field[]>(fields)
  const [infoModalOpen, setInfoModalOpen] = useState(false)
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (fields) {
      setFiltrados(fields)
    }
  }, [fields])

  const handleClose = () => {
    setFiltrados(fields)
    dispatch(hideFieldList())
    setAnchorEl(null)
  }

  const handleFieldSelect = (field: Field) => {
    onSelectField(field)
    handleClose()
  }

  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    field: Field,
  ) => {
    setAnchorEl(event.currentTarget)
    setCurrentField(field)
  }

  const handleInfoButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    field: Field,
  ) => {
    event.stopPropagation()
    const rect = event.currentTarget.getBoundingClientRect()
    setModalPosition({
      x: rect.right + 10,
      y: rect.top,
    })
    setCurrentField(field)
    setInfoModalOpen(true)
  }

  const exportFieldToPDF = (field: Field) => {
    const input = document.body
    html2canvas(input, { scale: 1 })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/jpeg', 1.0)
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: 'a4',
        })
        const imgProps = pdf.getImageProperties(imgData)
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight)
        pdf.save(`Field_${field.nombre}.pdf`)
      })
      .catch((err) => console.error('Error exporting PDF: ', err))
  }

  const exportFieldToXLSX = (field: Field) => {
    const wb = XLSX.utils.book_new()
    const wsName = 'Field Data'

    const data = [
      ['Field Name', field.nombre],
      ['Field ID', field._id],
      ['Hectares', field.campo_geojson.properties.hectareas],
      ['UUID', field.uuid],
      ['', ''],
      ['Lots', 'Hectares'],
    ]

    field.lotes.forEach((lot) => {
      data.push([lot.properties.nombre, lot.properties.hectareas])
    })

    const ws = XLSX.utils.aoa_to_sheet(data)
    XLSX.utils.book_append_sheet(wb, ws, wsName)
    XLSX.writeFile(wb, `Field_${field.nombre}.xlsx`)
  }

  const handleCloseExportMenu = () => {
    setAnchorEl(null)
  }

  const handleExport = (format: 'PDF' | 'XLSX') => {
    if (format === 'PDF' && currentField) {
      exportFieldToPDF(currentField)
    } else if (format === 'XLSX' && currentField) {
      exportFieldToXLSX(currentField)
    }
    handleCloseExportMenu()
  }
  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={handleClose}
      sx={{
        width: '40%',
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: '40%',
          boxSizing: 'border-box',
        },
      }}
    >
      <Box
        sx={{
          width: '100%',
          padding: '10px 15px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Typography variant="h6" noWrap>
          Listado de campos
        </Typography>
        <IconButton onClick={handleClose}>
          {' '}
          <CloseIcon />
        </IconButton>
      </Box>
      <SearchBar
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          let text = e.target.value.toLowerCase()
          let filtrados = fields.filter((f) =>
            f.nombre.toLowerCase().includes(text),
          )
          setFiltrados(filtrados)
        }}
      />

      <List sx={{ width: '100%' }}>
        {filtrados === undefined && <li>{t('No hay campos')}</li>}
        {filtrados?.length === 0 && <li>{t('No hay campos')}</li>}
        {filtrados.map((field, index) => (
          <React.Fragment key={index}>
            <ListItem
              sx={{
                position: 'relative',
                padding: '12px 16px',
                minHeight: '72px',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <Box
                onClick={() => handleFieldSelect(field)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  width: 'calc(100% - 100px)',
                  cursor: 'pointer',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative',
                    marginRight: 2,
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: '15%',
                      right: '-8px',
                      bottom: '15%',
                      width: '2px',
                      background:
                        'linear-gradient(180deg, transparent, #2563eb, transparent)',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                    },
                    '&:hover::after': {
                      opacity: 1,
                    },
                  }}
                >
                  <FieldOutlineIcon field={field} size={32} />
                </Box>

                <Box sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      lineHeight: 1.2,
                      marginBottom: '4px',
                    }}
                  >
                    {field.nombre}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ lineHeight: 1.2 }}
                  >
                    Hectáreas:{' '}
                    {field.campo_geojson.properties.hectareas.toFixed(2)}
                  </Typography>
                </Box>
              </Box>

              {/* Botones de acción fijos */}
              <Box
                sx={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  gap: '8px',
                  background: 'transparent',
                }}
              >
                <IconButton
                  onClick={(e) => handleInfoButtonClick(e, field)}
                  sx={{
                    width: '34px',
                    height: '34px',
                    background: 'rgba(37, 99, 235, 0.1)',
                    borderRadius: '8px',
                    padding: '8px',
                    '&:hover': {
                      background: 'rgba(37, 99, 235, 0.2)',
                    },
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </IconButton>
                <IconButton
                  aria-label="more"
                  aria-controls="long-menu"
                  aria-haspopup="true"
                  onClick={(event) => {
                    event.stopPropagation()
                    handleClick(event, field)
                  }}
                  sx={{
                    width: '34px',
                    height: '34px',
                    background: 'rgba(37, 99, 235, 0.1)',
                    borderRadius: '8px',
                    padding: '8px',
                    '&:hover': {
                      background: 'rgba(37, 99, 235, 0.2)',
                    },
                  }}
                >
                  <MoreVertIcon sx={{ color: '#2563eb', fontSize: '18px' }} />
                </IconButton>
              </Box>
            </ListItem>
            {index < filtrados.length - 1 && (
              <Divider
                sx={{
                  '&::before, &::after': {
                    borderColor: 'rgba(0, 0, 0, 0.08)',
                  },
                }}
              />
            )}
          </React.Fragment>
        ))}
      </List>
      {infoModalOpen && (
        <FieldInfoPopup
          field={currentField}
          position={modalPosition}
          onClose={() => setInfoModalOpen(false)}
          onLotSelect={(lot, field) => {
            onSelectLot(lot, field)
            setInfoModalOpen(false)
          }}
        />
      )}
      <Menu
        id="field-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleCloseExportMenu}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            minWidth: 350,
            borderRadius: 2,
            overflow: 'visible',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            '& .MuiList-root': {
              padding: 0,
            },
          },
        }}
      >
        <Box
          sx={{
            width: '100%',
            padding: '10px 15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <Typography variant="h6" noWrap>
            Exportar Campo
          </Typography>
          <IconButton
            onClick={handleCloseExportMenu}
            sx={{
              width: '34px',
              height: '34px',
              '&:hover': {
                background: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {currentField?.nombre}
          </Typography>
        </Box>

        <MenuItem
          onClick={() => handleExport('PDF')}
          sx={{
            py: 2,
            px: 2,
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            '&:hover': {
              backgroundColor: 'rgba(37, 99, 235, 0.08)',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Box
              sx={{
                mr: 2,
                p: 1.5,
                borderRadius: 1.5,
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2563eb"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <path d="M12 18v-6" />
                <path d="M8 15l4 4 4-4" />
              </svg>
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1" sx={{ mb: 0.5, lineHeight: 1.2 }}>
                Exportar a PDF
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ lineHeight: 1.2 }}
              >
                Documento con diseño del campo
              </Typography>
            </Box>
          </Box>
        </MenuItem>

        <MenuItem
          onClick={() => handleExport('XLSX')}
          sx={{
            py: 2,
            px: 2,
            '&:hover': {
              backgroundColor: 'rgba(37, 99, 235, 0.08)',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Box
              sx={{
                mr: 2,
                p: 1.5,
                borderRadius: 1.5,
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2563eb"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <path d="M8 12h8" />
                <path d="M8 16h8" />
                <path d="M8 8h2" />
              </svg>
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1" sx={{ mb: 0.5, lineHeight: 1.2 }}>
                Exportar a Excel
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ lineHeight: 1.2 }}
              >
                Tabla de datos detallada
              </Typography>
            </Box>
          </Box>
        </MenuItem>
      </Menu>
    </Drawer>
  )
}

export default FieldsSideMenu
