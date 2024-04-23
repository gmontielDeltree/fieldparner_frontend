import { Button } from '@mui/material'
import React from 'react'

const CloseButton = ({onClick}) => {
  return (
    <Button onClick={onClick}>CLOSE</Button>
  )
}

export default CloseButton