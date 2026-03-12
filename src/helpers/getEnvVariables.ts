//Exportar todas las variables de ambiente en Vite (.env)
export const getEnvVariables = () => {

    return {
        ...import.meta.env
    }

}
