

import { Box } from '@mui/material';
import { ReactNode } from 'react';

type BorderContainerProps = {
    children: ReactNode;
}

export const BorderContainer = ({ children }: BorderContainerProps) => {
    return (
        <Box sx={{
            minHeight: "200px",
            width: "100%",
            p: 1,
            border: "1px solid black",
            borderRadius: "20px"
        }}>
            {children}
        </Box>
    )
}
