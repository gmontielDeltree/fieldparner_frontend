
export interface Lenguaje {
	_id ?: string,
	_rev ?: string,
	lang: string
}


export interface Campana {
	_id?:string,
	_rev?:string,
	nombre: string,
	inicio: string,//ISODATE
	fin: string,
    }