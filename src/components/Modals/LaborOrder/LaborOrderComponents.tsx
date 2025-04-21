import React from 'react';
import {
    IconButton,
    Typography,
    Chip,
    useTheme,
    alpha,
    Tooltip,
    Card,
    CardContent,
    Stack,
    Avatar,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemAvatar,
    Paper,
    Collapse,
    Box,
    Button
} from '@mui/material';
import {
    Remove as DeleteIcon,
    WarehouseRounded as WarehouseIcon,
    Grid4x4Rounded as GridIcon,
    CheckCircleOutline as CheckCircleIcon,
    RemoveCircleOutline as RemoveCircleIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Restore as RestoreIcon
} from '@mui/icons-material';
import { ItemRow, TableCellStyled } from '../..';
import { useTranslation } from "react-i18next";
import { useState } from 'react';

// Props interface for RowSupply component
interface RowSupplyProps {
    row: DepositSupplyOrderItem;
    handleDelete: (item: DepositSupplyOrderItem) => void;
}

// Modern styled supply row component
export const RowSupply = ({ row, handleDelete }) => {
    const { t } = useTranslation();
    const theme = useTheme();

    return (
        <ItemRow
            key={row._id}
            sx={{
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.light, 0.05),
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 8px -2px ${alpha(theme.palette.common.black, 0.1)}`
                }
            }}
        >
            <TableCellStyled align="left">
                <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar
                        sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            width: 32,
                            height: 32
                        }}
                    >
                        <WarehouseIcon fontSize="small" />
                    </Avatar>
                    <Typography variant="body2" fontWeight="medium">{row.deposit.description}</Typography>
                </Stack>
            </TableCellStyled>

            <TableCellStyled align="left">
                <Typography variant="body2" fontWeight="medium">{row.supply.name}</Typography>
            </TableCellStyled>

            <TableCellStyled align="center">
                <Chip
                    label={row.supply.unitMeasurement}
                    size="small"
                    variant="outlined"
                    sx={{
                        borderRadius: '4px',
                        backgroundColor: alpha(theme.palette.info.light, 0.1),
                        borderColor: theme.palette.info.light,
                        color: theme.palette.info.dark
                    }}
                />
            </TableCellStyled>

            <TableCellStyled align="center">
                {row.location ? (
                    <Chip
                        label={row.location}
                        size="small"
                        sx={{
                            borderRadius: '4px',
                            backgroundColor: alpha(theme.palette.success.light, 0.1),
                            color: theme.palette.success.dark
                        }}
                        icon={<GridIcon style={{ fontSize: 14 }} />}
                    />
                ) : (
                    <Typography variant="body2" color="text.secondary">-</Typography>
                )}
            </TableCellStyled>

            <TableCellStyled align="center">
                <Typography
                    variant="body2"
                    fontWeight="bold"
                    sx={{
                        color: theme.palette.primary.main,
                        backgroundColor: alpha(theme.palette.primary.light, 0.1),
                        padding: '4px 8px',
                        borderRadius: '4px',
                        display: 'inline-block'
                    }}
                >
                    {row.amount}
                </Typography>
            </TableCellStyled>

            <TableCellStyled align="center">
                <Tooltip title={t("delete")}>
                    <IconButton
                        onClick={() => handleDelete(row)}
                        size="small"
                        sx={{
                            color: theme.palette.error.main,
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.error.main, 0.1),
                            }
                        }}
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </TableCellStyled>
        </ItemRow>
    );
};

// InfoCard component for displaying information in a modern card format
export const InfoCard = ({ icon, title, value, color = 'primary' }) => {
    const theme = useTheme();
    return (
        <Card
            variant="outlined"
            sx={{
                height: '100%',
                borderRadius: 2,
                borderColor: 'transparent',
                boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.05)}`,
                transition: 'all 0.2s ease',
                '&:hover': {
                    boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.08)}`,
                    borderColor: alpha(theme.palette[color].main, 0.3),
                    transform: 'translateY(-2px)'
                }
            }}
        >
            <CardContent>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar
                        sx={{
                            bgcolor: alpha(theme.palette[color].main, 0.1),
                            color: theme.palette[color].main
                        }}
                    >
                        {icon}
                    </Avatar>
                    <Box>
                        <Typography color="text.secondary" variant="caption" fontWeight="medium">
                            {title}
                        </Typography>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                            {value || '-'}
                        </Typography>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
};

// Supply History component to show retired and removed supplies
export const SupplyHistory = ({
    retiredSupplies = [],
    removedSupplies = [],
    onRestoreSupply
}) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const [expandRetired, setExpandRetired] = useState(false);
    const [expandRemoved, setExpandRemoved] = useState(false);

    const toggleRetired = () => setExpandRetired(!expandRetired);
    const toggleRemoved = () => setExpandRemoved(!expandRemoved);

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('default', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <Paper
            variant="outlined"
            sx={{
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.05)}`,
                mb: 3
            }}
        >
            <Box
                sx={{
                    p: 2,
                    borderBottom: expandRetired ? `1px solid ${alpha(theme.palette.divider, 0.5)}` : 'none',
                    backgroundColor: alpha(theme.palette.success.light, 0.05),
                    cursor: 'pointer',
                    '&:hover': {
                        backgroundColor: alpha(theme.palette.success.light, 0.1)
                    },
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
                onClick={toggleRetired}
            >
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar
                        sx={{
                            bgcolor: alpha(theme.palette.success.main, 0.1),
                            color: theme.palette.success.main,
                            width: 36,
                            height: 36
                        }}
                    >
                        <CheckCircleIcon />
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold" color="success.main">
                            {t("retiredSupplies")}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {retiredSupplies.length} {t("itemsAlreadyWithdrawn")}
                        </Typography>
                    </Box>
                </Stack>
                {expandRetired ? <ExpandLessIcon color="success" /> : <ExpandMoreIcon color="success" />}
            </Box>

            <Collapse in={expandRetired} timeout="auto">
                <List sx={{ p: 0, maxHeight: 240, overflow: 'auto' }}>
                    {retiredSupplies.length > 0 ? (
                        retiredSupplies.map((item, index) => (
                            <ListItem
                                key={`retired-${index}`}
                                divider={index !== retiredSupplies.length - 1}
                                sx={{
                                    py: 1,
                                    px: 2,
                                    backgroundColor: index % 2 === 0 ? alpha(theme.palette.success.light, 0.03) : 'transparent',
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.success.light, 0.07)
                                    }
                                }}
                            >
                                <ListItemAvatar>
                                    <Avatar
                                        sx={{
                                            bgcolor: alpha(theme.palette.success.main, 0.1),
                                            color: theme.palette.success.main,
                                            width: 32,
                                            height: 32
                                        }}
                                    >
                                        <CheckCircleIcon fontSize="small" />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Typography variant="body2" fontWeight="medium">
                                            {item.supply.name}
                                        </Typography>
                                    }
                                    secondary={
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Chip
                                                label={`${item.amount} ${item.supply.unitMeasurement}`}
                                                size="small"
                                                sx={{
                                                    borderRadius: '4px',
                                                    backgroundColor: alpha(theme.palette.success.light, 0.1),
                                                    color: theme.palette.success.dark,
                                                    height: 20,
                                                    fontSize: '0.7rem'
                                                }}
                                            />
                                            {item.retiredDate && (
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatDate(item.retiredDate)}
                                                </Typography>
                                            )}
                                        </Stack>
                                    }
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                                    {item.deposit.description}
                                </Typography>
                            </ListItem>
                        ))
                    ) : (
                        <ListItem sx={{ justifyContent: 'center', py: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                                {t("noRetiredSupplies")}
                            </Typography>
                        </ListItem>
                    )}
                </List>
            </Collapse>

            {/* Removed Supplies Section */}
            <Box
                sx={{
                    p: 2,
                    borderBottom: expandRemoved ? `1px solid ${alpha(theme.palette.divider, 0.5)}` : 'none',
                    backgroundColor: alpha(theme.palette.error.light, 0.05),
                    cursor: 'pointer',
                    '&:hover': {
                        backgroundColor: alpha(theme.palette.error.light, 0.1)
                    },
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
                onClick={toggleRemoved}
            >
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar
                        sx={{
                            bgcolor: alpha(theme.palette.error.main, 0.1),
                            color: theme.palette.error.main,
                            width: 36,
                            height: 36
                        }}
                    >
                        <RemoveCircleIcon />
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold" color="error.main">
                            {t("removedSupplies")}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {removedSupplies.length} {t("itemsRemovedFromList")}
                        </Typography>
                    </Box>
                </Stack>
                {expandRemoved ? <ExpandLessIcon color="error" /> : <ExpandMoreIcon color="error" />}
            </Box>

            <Collapse in={expandRemoved} timeout="auto">
                <List sx={{ p: 0, maxHeight: 240, overflow: 'auto' }}>
                    {removedSupplies.length > 0 ? (
                        removedSupplies.map((item, index) => (
                            <ListItem
                                key={`removed-${index}`}
                                divider={index !== removedSupplies.length - 1}
                                sx={{
                                    py: 1,
                                    px: 2,
                                    backgroundColor: index % 2 === 0 ? alpha(theme.palette.error.light, 0.03) : 'transparent',
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.error.light, 0.07)
                                    }
                                }}
                            >
                                <ListItemAvatar>
                                    <Avatar
                                        sx={{
                                            bgcolor: alpha(theme.palette.error.main, 0.1),
                                            color: theme.palette.error.main,
                                            width: 32,
                                            height: 32
                                        }}
                                    >
                                        <RemoveCircleIcon fontSize="small" />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Typography variant="body2" fontWeight="medium">
                                            {item.supply.name}
                                        </Typography>
                                    }
                                    secondary={
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Chip
                                                label={`${item.amount} ${item.supply.unitMeasurement}`}
                                                size="small"
                                                sx={{
                                                    borderRadius: '4px',
                                                    backgroundColor: alpha(theme.palette.error.light, 0.1),
                                                    color: theme.palette.error.dark,
                                                    height: 20,
                                                    fontSize: '0.7rem'
                                                }}
                                            />
                                            {item.removedDate && (
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatDate(item.removedDate)}
                                                </Typography>
                                            )}
                                        </Stack>
                                    }
                                />
                                {onRestoreSupply && (
                                    <Tooltip title={t("restoreToList")}>
                                        <IconButton
                                            size="small"
                                            onClick={() => onRestoreSupply(item)}
                                            sx={{
                                                color: theme.palette.primary.main,
                                                '&:hover': {
                                                    backgroundColor: alpha(theme.palette.primary.main, 0.1)
                                                }
                                            }}
                                        >
                                            <RestoreIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </ListItem>
                        ))
                    ) : (
                        <ListItem sx={{ justifyContent: 'center', py: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                                {t("noRemovedSupplies")}
                            </Typography>
                        </ListItem>
                    )}
                </List>
            </Collapse>
        </Paper>
    );
};