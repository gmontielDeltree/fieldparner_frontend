import React from 'react'
import { AutocompleteSupplies } from '../components/LotsMenu/components/AutocompleteSupplies'
import { Box } from '@mui/material'

export const ComponentTestBed = () => {
  return (
    <Box sx={{width:400, padding:"20px"}}>
    <AutocompleteSupplies value={null} onChange={(e)=>{console.log(e)}} />
    </Box>
  )
}
