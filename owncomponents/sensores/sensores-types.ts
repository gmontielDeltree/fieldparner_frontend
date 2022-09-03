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


// {
//   "_id": "bcddc2ffff106884:1657242669",
//   "_rev": "1-0b6d03fccdb673b72aaef52b6f7b5bb0",
//   "version": "0",
//   "device_id": "bcddc2ffff106884",
//   "ts": 1657242669,
//   "data": [
//     {
//       "sensor_id": "temperatura",
//       "ts": 1657242669,
//       "value": 8.85,
//       "unit": "ºC"
//     },

export {DailyTelemetryCard, DataPoints}