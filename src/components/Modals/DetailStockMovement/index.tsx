import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    List,
    ListItem,
    ListItemText,
    Typography,
} from "@mui/material";
import React from "react";
import { StockMovementItem } from "../../../types";
import { useTranslation } from "react-i18next";
import { Helper } from "../../../helpers/helper";
import { useAppSelector } from "../../../hooks";

type Props = {
    open: boolean;
    detail: StockMovementItem | null;
    onClose: () => void;
}

export const DetailStockMovementModal: React.FC<Props> = ({ open, detail, onClose }) => {
    const { t } = useTranslation();
    const { user } = useAppSelector((state) => state.auth);

    return (
        <Dialog
            open={open}
            maxWidth="md"
            scroll="paper"
            fullWidth
            onClose={() => onClose()}
        >
            <DialogTitle variant="h5">Detalle del movimiento </DialogTitle>
            <DialogContent >
                <Grid container spacing={1}>
                    <Grid item xs={12} md={6}>
                        <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                            <ListItem>
                                <ListItemText primary={t("_date")}
                                    secondary={
                                        <Typography gutterBottom variant="h6" fontWeight={700} >
                                            {detail?.operationDate}
                                        </Typography>
                                    }
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary={t("movement_type")}
                                    secondary={
                                        <Typography gutterBottom variant="h6" fontWeight={700} >
                                            {detail?.isIncome ? t("_income").toUpperCase() : t("_outcome").toUpperCase()}
                                        </Typography>}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary={t("supply")}
                                    secondary={
                                        <Typography gutterBottom variant="h6" fontWeight={700} >
                                            {detail?.supply?.name || "-"}
                                        </Typography>}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary={"UM"}
                                    secondary={
                                        <Typography gutterBottom variant="h6" fontWeight={700} >
                                            {detail?.supply?.unitMeasurement || "-"}
                                        </Typography>}
                                />
                            </ListItem>
                        </List>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                            <ListItem>
                                <ListItemText
                                    sx={{ textAlign: "right" }}
                                    primary={t("_quantity")}
                                    secondary={
                                        <Typography gutterBottom variant="h6" fontWeight={700} >
                                            {`${detail?.supply?.unitMeasurement} ${Helper.parseDecimalPointToComaWithCurrency(detail?.amount || 0, "", 2) || "-"}`}
                                        </Typography>}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    sx={{ textAlign: "right" }}
                                    primary={t("_warehouse")}
                                    secondary={
                                        <Typography gutterBottom variant="h6" fontWeight={700} >
                                            {detail?.deposit?.description || "-"}
                                        </Typography>}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    sx={{ textAlign: "right" }}
                                    primary={t("location")}
                                    secondary={
                                        <Typography gutterBottom variant="h6" fontWeight={700} >
                                            {detail?.location || "-"}
                                        </Typography>}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    sx={{ textAlign: "right" }}
                                    primary={t("_campaign")}
                                    secondary={
                                        <Typography gutterBottom variant="h6" fontWeight={700} >
                                            {detail?.campaign?.name || "-"}
                                        </Typography>}
                                />
                            </ListItem>
                        </List>
                    </Grid>
                    <Grid item xs={12} md={12}>
                        <Divider />
                        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                            <ListItem>
                                <ListItemText
                                    primary={t("description")}
                                    secondary={
                                        <Typography gutterBottom variant="h6" fontWeight={700} >
                                            {detail?.detail || "-"}
                                        </Typography>}
                                />
                            </ListItem>
                        </List>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button variant="contained" color="primary" onClick={() => onClose()}>
                    {t("close")}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
