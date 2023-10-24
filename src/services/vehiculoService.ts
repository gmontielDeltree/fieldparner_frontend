import { Vehiculos as data } from '../data/Equipos';
import { Vehiculo } from '../types';

export const getVehiculoService = () => {

    return new Promise<Vehiculo[]>((resolve, reject) => {

        setTimeout(() => {
            const vehiculos = data;
            if (vehiculos) resolve(vehiculos);
            else reject('Nose encontraron vehiculos.');
        }, 2000);
    });
}