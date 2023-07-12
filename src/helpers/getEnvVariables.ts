//Exportar todas las variables de ambiente en Vite (.env)
export const getEnvVariables = () => {

    import.meta.env;

    return {
        ...import.meta.env
    }

}
