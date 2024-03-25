//Valida si el tipo de insumo es "Semilla" en los idiomas ES, EN, PT
export const IsSeed = (supplyType: string): boolean => {
    const seedsENESPT = ["seeds", "semillas", "sementes"];
    return (seedsENESPT.includes(supplyType.toLowerCase()));
}

//Valida si el tipo de insumo es "Cultivo" en los idiomas ES, EN, PT
export const IsCultive = (supplyType: string): boolean => {
    const seedsENESPT = ["seeds", "semillas", "sementes"];
    return (seedsENESPT.includes(supplyType.toLowerCase()));
}