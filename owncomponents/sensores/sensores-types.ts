interface DailyTelemetryCard {
    _id : string;
    device_id : string;
    ts_last: number;
    data: DataPoints[]

}

interface DataPoints {
    mag : string;
    value : number;
    unit: string;
    ts?: number;
}

export {DailyTelemetryCard, DataPoints}