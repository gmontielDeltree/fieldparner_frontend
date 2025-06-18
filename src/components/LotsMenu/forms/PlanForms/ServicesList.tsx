import { NumberFieldWithUnits } from '../../components/NumberField'
import React, { useState } from 'react'
import {
    Box,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
    IconButton,
    TextField,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import CloseIcon from '@mui/icons-material/Close'
import { AutocompleteContratista } from '../../components/AutocompleteContratista'
import { useTranslation } from 'react-i18next'

/**
 * ServicesList recibe:
 * - rows: array con los objetos de servicio (cada uno con .servicio, .contratista, etc.)
 * - onUpdateRows: callback para actualizar la lista cuando se edita o borra
 * - isBrazil, isFitosanitaria (para lógica condicional con la 'ART')
 */

interface ServicesListProps {
    rows: any[]
    onUpdateRows: (rows: any[]) => void
    isBrazil: boolean
    isFitosanitaria: boolean
}

const ServicesList: React.FC<ServicesListProps> = ({ rows, onUpdateRows, isBrazil, isFitosanitaria }) => {
    const { t } = useTranslation()
    const [editIndex, setEditIndex] = useState(-1)
    const [editData, setEditData] = useState<any>({})

    // Pulsar "Editar"
    const handleEditRow = (index: number) => {
        setEditIndex(index)
        setEditData({ ...rows[index] })
    }

    // Cancelar edición
    const handleCancelEdit = () => {
        setEditIndex(-1)
        setEditData({})
    }

    // Guardar cambios
    const handleSaveEdit = () => {
        // Validar
        if (!editData.servicio || !editData.servicio.service) {
            alert(t('selectValidService'))
            return
        }
        // Aplica cambios
        const updatedRows = rows.map((row, i) =>
            i === editIndex ? editData : row
        )
        onUpdateRows(updatedRows)
        setEditIndex(-1)
        setEditData({})
    }

    // Borrar fila
    const handleDeleteRow = (index: number) => {
        const updatedRows = rows.filter((_, i) => i !== index)
        onUpdateRows(updatedRows)
    }

    // Controla inputs en edición
    const handleChangeField = (field: string, value: any) => {
        setEditData((prev: any) => ({
            ...prev,
            [field]: value,
        }))
    }

    // Helper to display contractor information properly
    const renderContratista = (contratista: any) => {
        if (!contratista) return ''

        // If contratista is an object, display its name or a relevant property
        if (typeof contratista === 'object') {
            // Choose the most appropriate field to display
            return contratista.nombreCompleto ||
                contratista.razonSocial ||
                contratista.name ||
                JSON.stringify(contratista)
        }

        // If it's a string, just return it
        return contratista
    }

    return (
        <Box mt={3}>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            {/* Si es Brasil + fitosanitaria => columna ART */}
                            {isBrazil && isFitosanitaria && <TableCell>{t('art')}</TableCell>}
                            <TableCell>{t('service')}</TableCell>
                            <TableCell>{t('contractor')}</TableCell>
                            <TableCell>{t('comment')}</TableCell>
                            <TableCell>{t('units')}</TableCell>
                            <TableCell align="center">{t('actions')}</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {rows.map((row, index) => {
                            const isEditing = editIndex === index
                            return (
                                <TableRow key={row.uuid || index}>
                                    {/* ART (si aplica) */}
                                    {isBrazil && isFitosanitaria && (
                                        <TableCell>
                                            {isEditing ? (
                                                <TextField
                                                    size="small"
                                                    value={editData.art || ''}
                                                    onChange={(e) => handleChangeField('art', e.target.value)}
                                                />
                                            ) : (
                                                row.art || ''
                                            )}
                                        </TableCell>
                                    )}

                                    {/* Servicio (MOSTRAMOS la propiedad .service del objeto "servicio") */}
                                    <TableCell>
                                        {isEditing ? (
                                            <TextField
                                                size="small"
                                                value={editData.servicio?.service || ''}
                                                onChange={(e) =>
                                                    // Ojo: aquí deberías buscar el objeto completo si lo deseas
                                                    // Para simplificar, asumimos que sólo cambiamos el .service (string).
                                                    handleChangeField('servicio', {
                                                        ...editData.servicio,
                                                        service: e.target.value,
                                                    })
                                                }
                                            />
                                        ) : (
                                            // row.servicio es un OBJETO. Mostramos la propiedad row.servicio.service
                                            row.servicio?.service
                                        )}
                                    </TableCell>

                                    {/* Contratista */}
                                    <TableCell>
                                        {isEditing ? (
                                            <AutocompleteContratista
                                                value={editData.contratista || ''}
                                                onChange={(val: any) => handleChangeField('contratista', val)}
                                            />
                                        ) : (
                                            renderContratista(row.contratista)
                                        )}
                                    </TableCell>

                                    {/* Comentario */}
                                    <TableCell>
                                        {isEditing ? (
                                            <TextField
                                                size="small"
                                                value={editData.comentario || ''}
                                                onChange={(e) => handleChangeField('comentario', e.target.value)}
                                            />
                                        ) : (
                                            row.comentario
                                        )}
                                    </TableCell>

                                    {/* Unidades */}
                                    <TableCell>
                                        {isEditing ? (
                                            <TextField
                                                size="small"
                                                type="number"
                                                value={editData.unidades || 0}
                                                onChange={(e) => handleChangeField('unidades', Number(e.target.value))}
                                            />
                                        ) : (
                                            row.unidades
                                        )}
                                    </TableCell>

                                    {/* Acciones */}
                                    <TableCell align="center">
                                        {isEditing ? (
                                            <>
                                                <IconButton color="primary" onClick={handleSaveEdit}>
                                                    <SaveIcon />
                                                </IconButton>
                                                <IconButton color="error" onClick={handleCancelEdit}>
                                                    <CloseIcon />
                                                </IconButton>
                                            </>
                                        ) : (
                                            <>
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => handleEditRow(index)}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleDeleteRow(index)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    )
}

export default ServicesList