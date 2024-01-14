import { Accordion, AccordionDetails, AccordionSummary, Paper } from "@mui/material";
import React from "react";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export const SatelliteResumen : React.FC = (props) =>{

    return (
        <Paper>
            <Accordion>
                <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                >
                Resumen    
                </AccordionSummary>
                <AccordionDetails>

                </AccordionDetails>
            </Accordion>
            <Accordion defaultExpanded>
                <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                >
                    Clima
                </AccordionSummary>
            </Accordion>
        </Paper>
    )
}