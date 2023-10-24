export interface MagrisRecord {
	"ts": string,
	"posicion": [
	  number,
	  number
	],
	"peso": number,
	"peso_objetivo": number,
	"peso_inicio": number,
	"patente_o_lote": string,
	"cultivo": number,
	"estado": number
}

export interface MagrisReporte {
	_id : string,
	_rev?: string,
	ts: string,
	data: MagrisRecord[]
}