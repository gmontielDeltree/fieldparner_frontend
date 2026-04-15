import React from 'react';
import { Row, Col } from 'reactstrap';
import {
  MapIcon,
  MapPin,
  Sprout,
  Calendar,
  Wheat
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ActivityHeaderProps {
  activityType: string;
  fieldName: string;
  lot: any;
  formData: any;
  activityIcons: any;
  mode?: 'plan' | 'execute';
  isEditing?: boolean;
  getActivityColor?: (activityType: string) => string;
}

const ActivityHeader: React.FC<ActivityHeaderProps> = ({
  activityType,
  fieldName,
  lot,
  formData,
  activityIcons,
  mode = 'plan', // 'plan' or 'execute'
  isEditing = false,
  getActivityColor
}) => {
  const { t } = useTranslation();

  // Get the display activity name
  const getDisplayText = () => {
    if (mode === 'execute') {
      // Try specific execute keys first
      const executeKey = `execute_${activityType}`;
      const translated = t(executeKey, { defaultValue: '' });
      if (translated) {
        return translated;
      }
      // Fallback: construct from available keys
      const executeText = t('executeActivity', { defaultValue: t('execution', { defaultValue: 'Execute' }) });
      const activityText = t(activityType);
      
      // If executeActivity contains "Activity", replace it
      if (executeText.toLowerCase().includes('activity') || executeText.toLowerCase().includes('actividad')) {
        return executeText.replace(/activity|actividad/gi, activityText);
      }
      
      // Otherwise just concatenate
      return `${executeText} ${activityText}`;
    }
    return isEditing ? t('edit') + ' ' + t(activityType) : t(activityType);
  };

  // Determine background color based on activity type
  const getBackgroundColor = () => {
    if (typeof getActivityColor === 'function') {
      return getActivityColor(activityType);
    }

    // Default colors if getActivityColor isn't provided
    switch (activityType) {
      case 'sowing':
        return '#10b981';
      case 'application':
        return '#3b82f6';
      case 'harvesting':
        return '#f59e0b';
      case 'preparation':
        return '#6b7280';
      case 'tour':
        return '#9333ea';
      default:
        return '#6b7280';
    }
  };

  // Select the appropriate icon based on activity type
  const ActivityIcon = activityIcons[activityType];

  return (
    <div
      style={{
        background: getBackgroundColor(),
        borderTopLeftRadius: '0.5rem',
        borderTopRightRadius: '0.5rem',
        padding: '2rem',
      }}
    >
      <Row className="align-items-center">
        <Col>
          <h1
            className="text-white mb-4"
            style={{ fontSize: '2rem', fontWeight: 'bold' }}
          >
            {getDisplayText()}
          </h1>

          <div className="d-flex gap-4">
            {/* Field info */}
            <div className="d-flex align-items-center gap-2 bg-white bg-opacity-10 rounded-3 px-3 py-2">
              <MapIcon className="text-white" size={20} />
              <div>
                <div
                  className="text-white-50 mb-0"
                  style={{
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {t('field')}
                </div>
                <div className="text-white fw-semibold">{fieldName}</div>
              </div>
            </div>

            {/* Lot info */}
            {lot && (
              <div className="d-flex align-items-center gap-2 bg-white bg-opacity-10 rounded-3 px-3 py-2">
                <MapPin className="text-white" size={20} />
                <div>
                  <div
                    className="text-white-50 mb-0"
                    style={{
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {t('lot')}
                  </div>
                  <div className="text-white fw-semibold">
                    {lot.properties.nombre}
                  </div>
                </div>
              </div>
            )}

            {/* Crop info (if available) */}
            {formData?.detalles?.cultivo?.descriptionES && (
              <div className="d-flex align-items-center gap-2 bg-white bg-opacity-10 rounded-3 px-3 py-2">
                <Sprout className="text-white" size={20} />
                <div>
                  <div
                    className="text-white-50 mb-0"
                    style={{
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {t('crop')}
                  </div>
                  <div className="text-white fw-semibold">
                    {formData.detalles.cultivo.descriptionES}
                  </div>
                </div>
              </div>
            )}

            {/* Campaign info (if available) */}
            {formData?.campaña && (
              <div className="d-flex align-items-center gap-2 bg-white bg-opacity-10 rounded-3 px-3 py-2">
                <Calendar className="text-white" size={20} />
                <div>
                  <div
                    className="text-white-50 mb-0"
                    style={{
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {t('campaign')}
                  </div>
                  <div className="text-white fw-semibold">
                    {formData.campaña.nombreComercial || formData.campaña.name || formData.campaña.campaignId}
                  </div>
                </div>
              </div>
            )}

            {/* Zafra info (if available) */}
            {formData?.detalles?.zafra && (
              <div className="d-flex align-items-center gap-2 bg-white bg-opacity-10 rounded-3 px-3 py-2">
                <Wheat className="text-white" size={20} />
                <div>
                  <div
                    className="text-white-50 mb-0"
                    style={{
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {t('Zafra')}
                  </div>
                  <div className="text-white fw-semibold">
                    {formData.detalles.zafra}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Col>

        {/* Activity icon */}
        <Col xs="auto">
          <div
            className="rounded-circle p-3"
            style={{
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%)",
              backdropFilter: "blur(2px)"
            }}
          >
            {ActivityIcon}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ActivityHeader;