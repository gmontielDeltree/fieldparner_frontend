export const validateEntityRoles = (formValues, currentField, currentValue) => {
    if (!currentValue) {
        return { isValid: true, warningMessage: "" };
    }

    const roleNames = {
        cuitComprador: "Comprador",
        cuitDestinatario: "Destinatario",
        cuitDestino: "Destino",
        cuitTransportista: "Transportista",
        cuitChofer: "Chofer",
        cuitPagadorFlete: "Pagador de Flete",
        cuitIntermediarioFlete: "Intermediario de Flete"
    };
    const incompatibleRoles = [
        ["cuitComprador", "cuitDestinatario", "cuitDestino"],
        ["cuitTransportista", "cuitChofer"],
        ["cuitPagadorFlete", "cuitIntermediarioFlete"]
    ];

    let conflicts = [];

    for (const roleGroup of incompatibleRoles) {
        if (roleGroup.includes(currentField)) {
            const conflictingFields = roleGroup
                .filter(field => field !== currentField &&
                    formValues[field]?.value === currentValue);

            if (conflictingFields.length > 0) {
                const conflictNames = conflictingFields.map(field => roleNames[field]);
                conflicts.push({
                    roles: conflictNames,
                    currentRole: roleNames[currentField]
                });
            }
        }
    }

    if (conflicts.length > 0) {
        const warningMessages = conflicts.map(conflict =>
            `"${conflict.currentRole}" no debería ser el mismo que "${conflict.roles.join('" y "')}"`
        );

        return {
            isValid: false,
            warningMessage: `Advertencia: ${warningMessages.join('. ')}`
        };
    }

    return { isValid: true, warningMessage: "" };
};