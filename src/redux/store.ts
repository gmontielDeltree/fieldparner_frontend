import { configureStore } from '@reduxjs/toolkit';

import { vehiculoSlice } from './vehiculo';
import { uiSlice } from './ui';
import { authSlice } from './auth';
import { businessSlice } from './business';

const store = configureStore({
    reducer: {
        ui: uiSlice.reducer,
        vehiculo: vehiculoSlice.reducer,
        auth: authSlice.reducer,
        business: businessSlice.reducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;