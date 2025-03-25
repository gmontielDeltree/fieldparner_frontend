import React, { useEffect, useState } from 'react';
import { dbContext } from '../../services';
import { useCampaign } from '../../hooks';
import { toast } from 'react-toastify';

const AssignCampaignsToActivities: React.FC = () => {
  const { campaigns, getCampaigns } = useCampaign();
  const [isProcessing, setIsProcessing] = useState(false);
  const db = dbContext.fields;

  const assignCampaigns = async () => {
    if (isProcessing || campaigns.length === 0) return;
    
    setIsProcessing(true);
    try {
      // Get all activities
      const result = await db.allDocs({
        include_docs: true,
        startkey: 'actividad:',
        endkey: 'actividad:\ufff0'
      });

      const activities = result.rows.map(row => row.doc);
      const updates = [];

      // Assign random campaign to each activity
      for (const activity of activities) {
        if (!activity.campaign) {
          const randomCampaign = campaigns[Math.floor(Math.random() * campaigns.length)];
          activity.campaign = {
            id: randomCampaign._id,
            name: randomCampaign.name
          };
          updates.push(activity);
        }
      }

      // Bulk update activities
      if (updates.length > 0) {
        await db.bulkDocs(updates);
        toast.success(`Successfully assigned campaigns to ${updates.length} activities`);
      } else {
        toast.info('All activities already have campaigns assigned');
      }
    } catch (error) {
      console.error('Error assigning campaigns:', error);
      toast.error('Error assigning campaigns to activities');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await getCampaigns();
      assignCampaigns();
    };
    initialize();
  }, []);

  return null; // This component doesn't render anything
};

export default AssignCampaignsToActivities;