import React from 'react'
import PersonalForm from '../forms/PlanForms/PersonalForm'
import SuppliesForm from '../forms/PlanForms/SuppliesForm'
import OtherDetailsForm from '../forms/PlanForms/OtherDetailsForm'
import ServicesForm from '../forms/PlanForms/ServicesForm'
import ConditionsForm from '../forms/PlanForms/ConditionsForm'
import ObservationsForm from '../forms/PlanForms/ObservationsForm'

interface PlanActivityContentProps {
  step: number
  activityType: string
  lot: any
  db: any
  formData: any
  setFormData: React.Dispatch<React.SetStateAction<any>>
}

const PlanActivityContent: React.FC<PlanActivityContentProps> = ({
  step,
  activityType,
  lot,
  db,
  formData,
  setFormData,
}) => {
  let adjustedStep = step
  if (activityType !== 'sowing' && step > 1) {
    adjustedStep = step + 1
  }

  switch (adjustedStep) {
    case 0:
      return (
        <PersonalForm
          lot={lot}
          formData={formData}
          setFormData={setFormData}
          showActivityType={activityType === 'application'}
        />
      )
    case 1:
      return (
        <SuppliesForm
          lot={lot}
          db={db}
          formData={formData}
          setFormData={setFormData}
        />
      )
    case 2:
      return (
        <OtherDetailsForm
          lot={lot}
          formData={formData}
          setFormData={setFormData}
        />
      )
    case 3:
      return (
        <ServicesForm lot={lot} formData={formData} setFormData={setFormData} />
      )
    case 4:
      return (
        <ConditionsForm
          lot={lot}
          formData={formData}
          setFormData={setFormData}
        />
      )
    case 5:
      return (
        <ObservationsForm
          lot={lot}
          formData={formData}
          setFormData={setFormData}
        />
      )
    default:
      return <div>Unknown Step</div>
  }
}

export default PlanActivityContent
