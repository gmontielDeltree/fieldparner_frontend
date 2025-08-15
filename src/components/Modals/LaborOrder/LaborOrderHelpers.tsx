import { dbContext } from '../../../services';
import { NotificationService } from "../../../services/notificationService";

/**
 * Initialize order data for the Labor Order
 * @param {Object} params - Parameters for initializing order data
 * @returns {Object|null} - Order data with field name or null
 */
export const initializeOrderData = async ({
    lotActive,
    selectedCampaign,
    activity,
    fieldName,
    getLaborOrder,
    getOrderWithDepositsAndSuppliesByOrder
}) => {
    try {
        console.log("initializeOrderData called with:", {
            lotActive,
            selectedCampaign,
            activity,
            fieldName
        });

        const field = lotActive?.properties?.campo_parent_id;
        const campaignId = selectedCampaign.campaignId;
        const contractorId =
            activity?.detalles?.contratista?._id ||
            activity?.contratista?._id ||
            null;

        console.log("Extracted values:", { field, campaignId, contractorId });

        if (campaignId && contractorId) {
            console.log("Calling getLaborOrder with:", { field, campaignId, contractorId });
            const order = await getLaborOrder(field, campaignId, contractorId);
            console.log("getLaborOrder result:", order);

            if (order) {
                // Add field name to the order for display and PDF
                const orderWithFieldName = {
                    ...order,
                    fieldName:
                        fieldName ||
                        lotActive?.properties?.campo_nombre ||
                        lotActive?.properties?.campo_parent_nombre
                };
                //Este no iria
                // await getOrderWithDepositsAndSuppliesByOrder(order.order);
                return orderWithFieldName;
            }
        }

        // Create a default order if none exists
        console.log("Creating default order as fallback");
        return createDefaultOrder(lotActive, selectedCampaign, activity, fieldName);
    } catch (error) {
        console.error("Error initializing order data:", error);
        // Create a default order when error occurs
        console.log("Error occurred, creating default order as fallback");
        return createDefaultOrder(lotActive, selectedCampaign, activity, fieldName);
    }
};

/**
 * Create a default order when no order is found or error occurs
 * @param {Object} lotActive - Active lot data
 * @param {Object} selectedCampaign - Selected campaign
 * @param {Object} activity - Activity data
 * @param {String} fieldName - Field name
 * @returns {Object} - Default order object
 */
const createDefaultOrder = (lotActive, selectedCampaign, activity, fieldName) => {
    // Generate a temporary order ID
    const tempOrderId = `TEMP-${Date.now().toString(36).toUpperCase()}`;

    // Generate field name from available sources
    const derivedFieldName = fieldName ||
        lotActive?.properties?.campo_nombre ||
        lotActive?.properties?.campo_parent_nombre ||
        "Unknown Field";

    // Get contractor info if available
    const contractor = activity?.detalles?.contratista ||
        activity?.contratista ||
        activity?.detalles?.contractor ||
        { name: "Unknown Contractor" };

    console.log("Created default order:", tempOrderId);

    return {
        order: tempOrderId,
        fieldName: derivedFieldName,
        fieldId: lotActive?.properties?.campo_parent_id || "unknown-field",
        campaignId: selectedCampaign?.campaignId || "unknown-campaign",
        campaign: selectedCampaign?.name || "Unknown Campaign",
        contractorId: contractor._id || "unknown-contractor",
        contractor: contractor.name || contractor.nombreCompleto || contractor.razonSocial || "Unknown Contractor"
    };
};

/**
 * Process activity data to create withdrawal items
 * @param {Object} activity - The activity data
 * @param {Object} user - Current user data
 * @returns {Array} - Array of withdrawal items
 */
export const processActivityData = (activity, user) => {
    if (!activity?.detalles?.dosis?.length) {
        return [];
    }

    return activity.detalles.dosis
        // Filter those NOT marked as withdrawn
        .filter(d => !d.retired)
        .map((dose, idx) => {
            const dosificacion = parseFloat(dose.total || "0");
            return {
                _id: `dose-${idx}`,
                accountId: user?.accountId || "",
                deposit: dose.deposito || {},
                supply: dose.insumo || dose.selectedOption || {},
                location: dose.ubicacion || "",
                nroLot: dose.nro_lote || "",
                order: 0,
                withdrawalAmount: dosificacion,
                originalAmount: dosificacion,
                amount: dosificacion
            };
        });
};

/**
 * Mark items as retired in the activity
 * @param {Object} activity - The activity data
 * @param {Array} withdrawalItems - Items to mark as retired
 * @param {Function} t - Translation function
 * @returns {Promise<void>}
 */
export const markItemsAsRetired = async (activity, withdrawalItems, t) => {
    try {
        if (!activity || !activity.detalles || !activity.detalles.dosis) {
            console.error("No se puede actualizar la actividad, datos insuficientes");
            return;
        }

        // Get the activity ID
        const activityId = activity._id || `actividad:${activity.fecha}:${activity.uuid}`;
        console.log("Intentando actualizar actividad con ID:", activityId);

        try {
            // Get the most up-to-date version of the document
            const currentDoc = await dbContext.fields.get(activityId);

            if (currentDoc && currentDoc.detalles && currentDoc.detalles.dosis) {
                await updateDocumentWithRetiredItems(currentDoc, withdrawalItems, t);
            } else {
                throw new Error("El documento recuperado no tiene la estructura esperada");
            }
        } catch (error) {
            if (error.name === 'not_found') {
                console.error("Documento no encontrado:", error);
                await findAndUpdateByUUID(activity, withdrawalItems, t);
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error("Error al marcar los insumos como retirados:", error);
        // Show error notification
        NotificationService.showError(
            t("errorMarkingItemsAsWithdrawn")
        );
    }
};

/**
 * Update document with retired items
 * @param {Object} document - Document to update
 * @param {Array} withdrawalItems - Items to mark as retired
 * @param {Function} t - Translation function
 * @returns {Promise<void>}
 */
const updateDocumentWithRetiredItems = async (document, withdrawalItems, t) => {
    // Apply changes to the updated document
    const updatedDoc = { ...document };

    // Mark supplies as retired
    let changesApplied = false;
    withdrawalItems.forEach(item => {
        const doseIndex = updatedDoc.detalles.dosis.findIndex(
            dose =>
                (dose.insumo && dose.insumo.name === item.supply.name) ||
                (dose.selectedOption && dose.selectedOption.name === item.supply.name)
        );

        if (doseIndex !== -1 && !updatedDoc.detalles.dosis[doseIndex].retired) {
            updatedDoc.detalles.dosis[doseIndex].retired = true;
            updatedDoc.detalles.dosis[doseIndex].retiredDate = new Date().toISOString();
            changesApplied = true;
        }
    });

    if (changesApplied) {
        // Save the updated document
        await dbContext.fields.put(updatedDoc);

        // Show success notification
        NotificationService.showSuccess(
            t("itemsMarkedAsWithdrawn")
        );
    } else {
        console.log("No se realizaron cambios en los insumos");
    }
};

/**
 * Find document by UUID and update it
 * @param {Object} activity - Activity with UUID
 * @param {Array} withdrawalItems - Items to mark as retired
 * @param {Function} t - Translation function
 * @returns {Promise<void>}
 */
const findAndUpdateByUUID = async (activity, withdrawalItems, t) => {
    try {
        const result = await dbContext.fields.find({
            selector: {
                "uuid": activity.uuid
            }
        });

        if (result.docs.length > 0) {
            const dbActivity = result.docs[0];
            await updateDocumentWithRetiredItems(dbActivity, withdrawalItems, t);
        } else {
            throw new Error("No se encontró la actividad en la base de datos");
        }
    } catch (findError) {
        console.error("Error al buscar la actividad:", findError);
        throw findError;
    }
};