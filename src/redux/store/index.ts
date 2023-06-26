import { configureStore } from '@reduxjs/toolkit';

import { vehiculoSlice } from '../slices/vehiculo';
import { uiSlice } from '../slices/ui';

const store = configureStore({
    reducer: {
        ui: uiSlice.reducer,
        vehiculo: vehiculoSlice.reducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;