import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import EditField from '../components/EditField'

export const FieldPage = () => {
    const {campoId} = useParams()
 const navigate = useNavigate()

  return (
    <EditField
    isOpen={true}
    field={selectedField}
    onClose={() => {
      // removeLotsFromMap(map, selectedField.Lotes);
    //   setSelectedField(null);
      navigate("/init/overview/fields");
    }}
    onDelete={handleDeleteField}
    onLocate={handleLocateField}
    handleCreateLot={handleCreateLot}
    handleCreateUniqueLot={handleCreateUniqueLot}
  />
  )
}
