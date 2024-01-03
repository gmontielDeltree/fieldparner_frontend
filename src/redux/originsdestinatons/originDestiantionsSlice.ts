import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OriginDestinations, OriginDestinationsState} from '../../types';


const initialState: OriginDestinationsState = {
    originsDestinationsActive: null,
    OriginsDestinations: [],
}

// const store = configureStore({
//     reducer: {
//       ui: uiSlice.reducer,
//       vehiculo: vehiculoSlice.reducer,
//       auth: authSlice.reducer,
//       business: businessSlice.reducer,
//       supply: supplySlice.reducer,
//       deposit: depositSlice.reducer,
//       map: mapSlice.reducer
//     }
//   });

export const originsDestinationsSlice = createSlice({
    name: 'Procedencias/Destinos',
    initialState: initialState,
    reducers: {
        setOriginsDestinationsActive: (state, action: PayloadAction<OriginDestinations>) => {
            state. originsDestinationsActive = action.payload;
        },
        removeOriginsDestinationsActive: (state) => {
            state. originsDestinationsActive = null
        },
        loadOriginsDestinations: (state, action: PayloadAction<OriginDestinations[]>) => {
            state. OriginsDestinations = action.payload;
        },
        removeOriginsDestinations: (state) => {
            state. OriginsDestinations = [];
        }
    }
});


export const {
    loadOriginsDestinations,
    removeOriginsDestinations,
    removeOriginsDestinationsActive,
    setOriginsDestinationsActive,
} = originsDestinationsSlice.actions;
