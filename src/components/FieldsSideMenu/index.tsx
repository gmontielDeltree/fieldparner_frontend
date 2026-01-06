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

  const exportFieldToPDF = async (field: Field) => {
    try {
      // Show loading message (optional)
      console.log('Starting PDF generation...')

      // Get satellite image first - but don't wait too long
      let satelliteImageUrl: string | null = null
      try {
        console.log('Fetching satellite image...')
        satelliteImageUrl = await Promise.race([
          getSatelliteImage(field),
          new Promise<null>((resolve) => setTimeout(() => {
            console.log('Satellite image timeout after 5 seconds')
            resolve(null)
          }, 5000))
        ])
      } catch (satError) {
        console.error('Error getting satellite image:', satError)
        satelliteImageUrl = null
      }

      // Create PDF using jsPDF native methods for better reliability
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 15
      const contentWidth = pageWidth - (margin * 2)
      let currentY = margin

      // Add gradient header background
      pdf.setFillColor(102, 126, 234) // #667eea
      pdf.rect(0, 0, pageWidth, 40, 'F')

      // Add header text
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(24)
      pdf.setFont('helvetica', 'bold')
      pdf.text(field.nombre, margin, 20)

      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'normal')
      const dateStr = `Field Report - ${new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}`
      pdf.text(dateStr, margin, 30)

      currentY = 50

      // Field Information Section
      pdf.setTextColor(45, 55, 72) // #2d3748
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Field Information', margin, currentY)
      currentY += 10

      // Draw info box background
      pdf.setFillColor(248, 249, 250) // #f8f9fa
      pdf.rect(margin, currentY - 5, contentWidth, 35, 'F')

      // Add blue accent line
      pdf.setDrawColor(102, 126, 234)
      pdf.setLineWidth(1)
      pdf.line(margin, currentY - 5, margin, currentY + 30)

      // Field details in two columns
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(113, 128, 150) // #718096

      const col1X = margin + 5
      const col2X = margin + contentWidth / 2
      let infoY = currentY

      // Column 1
      pdf.text('Field ID:', col1X, infoY)
      pdf.setTextColor(45, 55, 72)
      pdf.setFont('helvetica', 'bold')
      pdf.text(field._id.substring(0, 20) + '...', col1X, infoY + 5)

      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(113, 128, 150)
      pdf.text('Number of Lots:', col1X, infoY + 15)
      pdf.setTextColor(45, 55, 72)
      pdf.setFont('helvetica', 'bold')
      pdf.text(`${field.lotes.length} lots`, col1X, infoY + 20)

      // Column 2
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(113, 128, 150)
      pdf.text('Total Area:', col2X, infoY)
      pdf.setTextColor(45, 55, 72)
      pdf.setFont('helvetica', 'bold')
      pdf.text(`${field.campo_geojson.properties.hectareas.toFixed(2)} hectares`, col2X, infoY + 5)

      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(113, 128, 150)
      pdf.text('UUID:', col2X, infoY + 15)
      pdf.setTextColor(45, 55, 72)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(8)
      pdf.text(field.uuid.substring(0, 35) + '...', col2X, infoY + 20)

      currentY += 45

      // Field Visualization Section - Split into map and satellite
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(45, 55, 72)
      pdf.text('Field Visualization', margin, currentY)
      currentY += 10

      // Draw both map and satellite side by side
      const mapWidth = (contentWidth - 5) / 2
      const mapHeight = 60

      // Left side: Field geometry map
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(100, 100, 100)
      pdf.text('Field Map', margin + mapWidth / 2, currentY - 2, { align: 'center' })
      drawFieldGeometry(pdf, field, margin, currentY + 2, mapWidth, mapHeight)

      // Right side: Satellite image
      pdf.text('Satellite View', margin + mapWidth + 5 + mapWidth / 2, currentY - 2, { align: 'center' })
      if (satelliteImageUrl) {
        try {
          pdf.addImage(satelliteImageUrl, 'PNG', margin + mapWidth + 5, currentY + 2, mapWidth, mapHeight)
          // Draw field boundary on top of satellite image
          drawFieldBoundaryOnSatellite(pdf, field, margin + mapWidth + 5, currentY + 2, mapWidth, mapHeight)
        } catch (imgError) {
          console.error('Error adding satellite image:', imgError)
          pdf.setFillColor(240, 240, 240)
          pdf.rect(margin + mapWidth + 5, currentY + 2, mapWidth, mapHeight, 'F')
          pdf.setTextColor(150, 150, 150)
          pdf.setFontSize(10)
          pdf.text('Satellite image unavailable', margin + mapWidth + 5 + mapWidth / 2, currentY + 2 + mapHeight / 2, { align: 'center' })
        }
      } else {
        pdf.setFillColor(240, 240, 240)
        pdf.rect(margin + mapWidth + 5, currentY + 2, mapWidth, mapHeight, 'F')
        pdf.setTextColor(150, 150, 150)
        pdf.setFontSize(10)
        pdf.text('Loading satellite view...', margin + mapWidth + 5 + mapWidth / 2, currentY + 2 + mapHeight / 2, { align: 'center' })
      }

      currentY += mapHeight + 15

      // Lots Detail Table
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(45, 55, 72)
      pdf.text('Lots Detail', margin, currentY)
      currentY += 10

      // Table header
      pdf.setFillColor(247, 250, 252) // #f7fafc
      pdf.rect(margin, currentY, contentWidth, 8, 'F')

      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(74, 85, 104) // #4a5568

      const col1 = margin + 2
      const col2 = margin + contentWidth * 0.5
      const col3 = margin + contentWidth * 0.75

      pdf.text('Lot Name', col1, currentY + 5)
      pdf.text('Area (ha)', col2, currentY + 5)
      pdf.text('Percentage', col3, currentY + 5)
      currentY += 10

      // Table rows
      pdf.setFont('helvetica', 'normal')
      field.lotes.forEach((lot, index) => {
        // Alternate row colors
        if (index % 2 === 1) {
          pdf.setFillColor(247, 250, 252)
          pdf.rect(margin, currentY - 2, contentWidth, 7, 'F')
        }

        pdf.setTextColor(45, 55, 72)
        pdf.text(lot.properties.nombre, col1, currentY + 3)
        pdf.setTextColor(74, 85, 104)
        pdf.text(lot.properties.hectareas.toFixed(2), col2, currentY + 3)
        const percentage = ((lot.properties.hectareas / field.campo_geojson.properties.hectareas) * 100).toFixed(1)
        pdf.text(`${percentage}%`, col3, currentY + 3)
        currentY += 7
      })

      // Total row
      pdf.setFillColor(237, 242, 247) // #edf2f7
      pdf.rect(margin, currentY - 2, contentWidth, 8, 'F')
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(45, 55, 72)
      pdf.text('TOTAL', col1, currentY + 3)
      pdf.text(field.campo_geojson.properties.hectareas.toFixed(2), col2, currentY + 3)
      pdf.text('100%', col3, currentY + 3)
      currentY += 15

      // Footer
      pdf.setDrawColor(226, 232, 240) // #e2e8f0
      pdf.setLineWidth(0.5)
      pdf.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20)

      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(113, 128, 150)
      const footerText = `Generated by FieldPartner • ${new Date().toISOString()}`
      const textWidth = pdf.getStringUnitWidth(footerText) * 9 / pdf.internal.scaleFactor
      pdf.text(footerText, (pageWidth - textWidth) / 2, pageHeight - 10)

      // Save the PDF
      pdf.save(`Field_${field.nombre}_${new Date().getTime()}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try again.')
    }
  }

  // Helper function to draw field geometry directly on PDF
  const drawFieldGeometry = (pdf: jsPDF, field: Field, x: number, y: number, width: number, height: number) => {
    try {
      // Draw map background
      pdf.setFillColor(245, 245, 245)
      pdf.rect(x, y, width, height, 'F')

      // Draw border for map area
      pdf.setDrawColor(200, 200, 200)
      pdf.setLineWidth(0.5)
      pdf.rect(x, y, width, height, 'S')

      const coordinates = field.campo_geojson.geometry.coordinates[0]
      if (!coordinates || coordinates.length === 0) {
        pdf.setTextColor(107, 114, 128)
        pdf.text('No geometry data available', x + width / 2, y + height / 2, { align: 'center' })
        return
      }

      // Find bounds
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
      coordinates.forEach((coord: number[]) => {
        minX = Math.min(minX, coord[0])
        maxX = Math.max(maxX, coord[0])
        minY = Math.min(minY, coord[1])
        maxY = Math.max(maxY, coord[1])
      })

      const geoWidth = maxX - minX
      const geoHeight = maxY - minY
      const padding = 10
      const scale = Math.min((width - padding * 2) / geoWidth, (height - padding * 2) / geoHeight)
      const centerGeoX = (minX + maxX) / 2
      const centerGeoY = (minY + maxY) / 2
      const offsetX = x + width / 2
      const offsetY = y + height / 2

      // Convert coordinates to screen points
      const fieldPoints: Array<{ x: number, y: number }> = []
      coordinates.forEach((coord: number[]) => {
        const px = offsetX + (coord[0] - centerGeoX) * scale
        const py = offsetY - (coord[1] - centerGeoY) * scale
        fieldPoints.push({ x: px, y: py })
      })

      // Draw filled field background
      if (fieldPoints.length > 2) {
        // Find bounding box
        const minX = Math.min(...fieldPoints.map(p => p.x))
        const maxX = Math.max(...fieldPoints.map(p => p.x))
        const minY = Math.min(...fieldPoints.map(p => p.y))
        const maxY = Math.max(...fieldPoints.map(p => p.y))

        // Draw light blue background rectangle
        pdf.setFillColor(230, 245, 255)
        pdf.rect(minX, minY, maxX - minX, maxY - minY, 'F')
      }

      // Draw field outline with thick blue line
      pdf.setDrawColor(0, 100, 200)
      pdf.setLineWidth(1.5)

      for (let i = 0; i < fieldPoints.length; i++) {
        const currentPoint = fieldPoints[i]
        const nextPoint = fieldPoints[(i + 1) % fieldPoints.length]
        pdf.line(currentPoint.x, currentPoint.y, nextPoint.x, nextPoint.y)
      }

      // Draw lots with different colors
      const colors = [
        { r: 251, g: 191, b: 36 }, // Yellow
        { r: 52, g: 211, b: 153 }, // Green
        { r: 96, g: 165, b: 250 }, // Blue
        { r: 167, g: 139, b: 250 }, // Purple
        { r: 248, g: 113, b: 113 }, // Red
        { r: 251, g: 146, b: 60 }  // Orange
      ]

      field.lotes.forEach((lot, index) => {
        if (lot.geometry && lot.geometry.coordinates && lot.geometry.coordinates[0]) {
          const lotCoords = lot.geometry.coordinates[0]
          const color = colors[index % colors.length]

          // Convert lot coordinates to screen points
          const lotPoints: Array<{ x: number, y: number }> = []
          lotCoords.forEach((coord: number[]) => {
            const px = offsetX + (coord[0] - centerGeoX) * scale
            const py = offsetY - (coord[1] - centerGeoY) * scale
            lotPoints.push({ x: px, y: py })
          })

          // Draw lot outline
          pdf.setDrawColor(80, 80, 80)
          pdf.setLineWidth(0.5)

          for (let i = 0; i < lotPoints.length; i++) {
            const currentPoint = lotPoints[i]
            const nextPoint = lotPoints[(i + 1) % lotPoints.length]
            pdf.line(currentPoint.x, currentPoint.y, nextPoint.x, nextPoint.y)
          }

          // Calculate center of lot for label
          const centerLotX = lotPoints.reduce((sum, p) => sum + p.x, 0) / lotPoints.length
          const centerLotY = lotPoints.reduce((sum, p) => sum + p.y, 0) / lotPoints.length

          // Draw colored dot for lot identification
          pdf.setFillColor(color.r, color.g, color.b)
          pdf.circle(centerLotX, centerLotY, 2, 'F')

          // Add lot name below the dot
          pdf.setFontSize(6)
          pdf.setFont('helvetica', 'bold')
          pdf.setTextColor(0, 0, 0)
          pdf.text(lot.properties.nombre, centerLotX, centerLotY + 4, { align: 'center' })
        }
      })

      // Add north arrow
      const arrowX = x + width - 15
      const arrowY = y + 15
      pdf.setDrawColor(55, 65, 81)
      pdf.setFillColor(55, 65, 81)

      // Draw N with arrow pointing up
      pdf.setLineWidth(1)
      pdf.line(arrowX, arrowY, arrowX, arrowY - 8) // vertical line
      pdf.line(arrowX, arrowY - 8, arrowX - 2, arrowY - 5) // left arrow
      pdf.line(arrowX, arrowY - 8, arrowX + 2, arrowY - 5) // right arrow
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'bold')
      pdf.text('N', arrowX, arrowY + 5, { align: 'center' })

      // Add simple scale indicator
      const scaleBarX = x + 10
      const scaleBarY = y + height - 10
      const scaleBarWidth = 30
      pdf.setLineWidth(1)
      pdf.line(scaleBarX, scaleBarY, scaleBarX + scaleBarWidth, scaleBarY)
      pdf.setFontSize(7)
      pdf.text('Scale', scaleBarX + scaleBarWidth / 2, scaleBarY + 5, { align: 'center' })

    } catch (error) {
      console.error('Error drawing field geometry:', error)
      pdf.setTextColor(107, 114, 128)
      pdf.setFontSize(10)
      pdf.text('Unable to render field map', x + width / 2, y + height / 2, { align: 'center' })
    }
  }

  // Helper function to get satellite image
  const getSatelliteImage = async (field: Field): Promise<string | null> => {
    try {
      const coordinates = field.campo_geojson.geometry.coordinates[0]
      if (!coordinates || coordinates.length === 0) return null

      // Calculate bounds
      let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity
      coordinates.forEach((coord: number[]) => {
        minLng = Math.min(minLng, coord[0])
        maxLng = Math.max(maxLng, coord[0])
        minLat = Math.min(minLat, coord[1])
        maxLat = Math.max(maxLat, coord[1])
      })

      // Calculate center and zoom level
      const centerLng = (minLng + maxLng) / 2
      const centerLat = (minLat + maxLat) / 2

      // Calculate appropriate zoom level based on bounds
      const latDiff = maxLat - minLat
      const lngDiff = maxLng - minLng
      const maxDiff = Math.max(latDiff, lngDiff)

      // Better zoom calculation based on the field size
      // Use hectares as additional reference if available
      const hectares = field.campo_geojson.properties?.hectareas || 0

      // Calculate zoom based on both bounds and area
      let zoom = 15 // Default zoom

      // Primary calculation based on geographic bounds
      if (maxDiff < 0.0001) {
        zoom = 19 // Tiny field
      } else if (maxDiff < 0.0003) {
        zoom = 18 // Very small field  
      } else if (maxDiff < 0.0007) {
        zoom = 17 // Small field
      } else if (maxDiff < 0.0015) {
        zoom = 16 // Small-medium field
      } else if (maxDiff < 0.003) {
        zoom = 15 // Medium field
      } else if (maxDiff < 0.006) {
        zoom = 14 // Large field
      } else if (maxDiff < 0.012) {
        zoom = 13 // Very large field
      } else if (maxDiff < 0.025) {
        zoom = 12 // Huge field
      } else {
        zoom = 11 // Massive area
      }

      // Fine-tune based on hectares if available
      if (hectares > 0) {
        if (hectares < 1) {
          zoom = Math.min(zoom, 17) // Small fields need higher zoom
        } else if (hectares < 5) {
          zoom = Math.min(zoom, 16)
        } else if (hectares < 20) {
          zoom = Math.min(zoom, 15)
        } else if (hectares < 50) {
          zoom = Math.min(zoom, 14)
        } else if (hectares < 100) {
          zoom = Math.min(zoom, 13)
        } else {
          zoom = Math.min(zoom, 12)
        }
      }

      // Add just a tiny bit more zoom (una pizca!)
      zoom = zoom + 1  // A bit more zoom for better field visibility

      console.log(`Field: ${hectares.toFixed(1)} ha, bounds: ${maxDiff.toFixed(5)}, zoom: ${zoom}`)

      // Create an image element to load the satellite view
      // We'll use a proxy service or create a canvas-based solution
      return new Promise((resolve) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'

        // Try Mapbox first
        const accessToken = 'pk.eyJ1IjoibGF6bG9wYW5hZmxleCIsImEiOiJja3ZzZHJ0ZzYzN2FvMm9tdDZoZmJqbHNuIn0.oQI_TrJ3SvJ6e5S9_CnzFw'
        const width = 400
        const height = 300

        // Simpler URL format
        const url = `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/${centerLng},${centerLat},${zoom}/${width}x${height}?access_token=${accessToken}`

        console.log('Loading satellite image from:', url)

        img.onload = () => {
          // Create canvas to convert image to base64
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height)
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
            console.log('Satellite image converted to base64')
            resolve(dataUrl)
          } else {
            resolve(null)
          }
        }

        img.onerror = () => {
          console.error('Failed to load satellite image, trying alternative...')

          // Fallback: Create a simple placeholder with field coordinates
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')

          if (ctx) {
            // Draw a gradient background to simulate aerial view
            const gradient = ctx.createLinearGradient(0, 0, width, height)
            gradient.addColorStop(0, '#8BC34A')
            gradient.addColorStop(0.5, '#689F38')
            gradient.addColorStop(1, '#558B2F')
            ctx.fillStyle = gradient
            ctx.fillRect(0, 0, width, height)

            // Add some texture
            ctx.globalAlpha = 0.3
            for (let i = 0; i < 50; i++) {
              ctx.fillStyle = i % 2 === 0 ? '#7CB342' : '#689F38'
              ctx.fillRect(
                Math.random() * width,
                Math.random() * height,
                Math.random() * 50 + 10,
                Math.random() * 50 + 10
              )
            }
            ctx.globalAlpha = 1

            // Add text
            ctx.fillStyle = 'white'
            ctx.font = 'bold 16px Arial'
            ctx.textAlign = 'center'
            ctx.fillText('Aerial View Simulation', width / 2, height / 2)
            ctx.font = '12px Arial'
            ctx.fillText(`${centerLat.toFixed(4)}, ${centerLng.toFixed(4)}`, width / 2, height / 2 + 20)

            const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
            resolve(dataUrl)
          } else {
            resolve(null)
          }
        }

        // Set the image source
        img.src = url

        // Timeout fallback
        setTimeout(() => {
          if (img.complete === false) {
            console.log('Image load timeout, using fallback')
            img.src = '' // Cancel loading
            img.onerror(new Event('timeout'))
          }
        }, 3000)
      })

    } catch (error) {
      console.error('Error in getSatelliteImage:', error)
      return null
    }
  }

  // Helper function to draw field boundary on satellite image
  const drawFieldBoundaryOnSatellite = (pdf: jsPDF, field: Field, x: number, y: number, width: number, height: number) => {
    try {
      const coordinates = field.campo_geojson.geometry.coordinates[0]
      if (!coordinates || coordinates.length === 0) return

      // Find bounds
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
      coordinates.forEach((coord: number[]) => {
        minX = Math.min(minX, coord[0])
        maxX = Math.max(maxX, coord[0])
        minY = Math.min(minY, coord[1])
        maxY = Math.max(maxY, coord[1])
      })

      const geoWidth = maxX - minX
      const geoHeight = maxY - minY
      const padding = 10
      const scale = Math.min((width - padding * 2) / geoWidth, (height - padding * 2) / geoHeight)
      const centerGeoX = (minX + maxX) / 2
      const centerGeoY = (minY + maxY) / 2
      const offsetX = x + width / 2
      const offsetY = y + height / 2

      // Convert coordinates to screen points
      const fieldPoints: Array<{ x: number, y: number }> = []
      coordinates.forEach((coord: number[]) => {
        const px = offsetX + (coord[0] - centerGeoX) * scale
        const py = offsetY - (coord[1] - centerGeoY) * scale
        fieldPoints.push({ x: px, y: py })
      })

      // Draw field outline with bright color for visibility on satellite
      pdf.setDrawColor(255, 255, 0) // Yellow for visibility
      pdf.setLineWidth(2)

      for (let i = 0; i < fieldPoints.length; i++) {
        const currentPoint = fieldPoints[i]
        const nextPoint = fieldPoints[(i + 1) % fieldPoints.length]
        pdf.line(currentPoint.x, currentPoint.y, nextPoint.x, nextPoint.y)
      }

      // Draw lot boundaries if visible
      pdf.setLineWidth(1)
      pdf.setDrawColor(255, 200, 0) // Orange for lots

      field.lotes.forEach((lot) => {
        if (lot.geometry && lot.geometry.coordinates && lot.geometry.coordinates[0]) {
          const lotCoords = lot.geometry.coordinates[0]
          const lotPoints: Array<{ x: number, y: number }> = []

          lotCoords.forEach((coord: number[]) => {
            const px = offsetX + (coord[0] - centerGeoX) * scale
            const py = offsetY - (coord[1] - centerGeoY) * scale
            lotPoints.push({ x: px, y: py })
          })

          for (let i = 0; i < lotPoints.length; i++) {
            const currentPoint = lotPoints[i]
            const nextPoint = lotPoints[(i + 1) % lotPoints.length]
            pdf.line(currentPoint.x, currentPoint.y, nextPoint.x, nextPoint.y)
          }
        }
      })
    } catch (error) {
      console.error('Error drawing boundary on satellite:', error)
    }
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
        // Force the drawer above any map/overlay layers across the app
        zIndex: (theme) => Math.max(theme.zIndex.tooltip + 1, 13000),
        width: '40%',
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: '40%',
          boxSizing: 'border-box',
          zIndex: 'inherit',
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
