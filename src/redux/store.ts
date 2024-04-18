import { configureStore } from "@reduxjs/toolkit";

import { vehiculoSlice } from "./vehicle";
import { uiSlice } from "./ui";
import { authSlice } from "./auth";
import { businessSlice } from "./business";
import { supplySlice } from "./supply";
import { depositSlice } from "./deposit";
import { mapSlice } from "./map";
import { drawSlice } from "./draw";
import { fieldListSlice } from "./fieldsList";
import { campaignSlice } from "./campaign";
import { zoneSlice } from "./zones";
import { originsDestinationsSlice } from "./originsdestinatons/originDestiantionsSlice";
import { usersSlice } from "./users/userSlice";
import { withdrawalOrderSlice } from "./withdrawalOrder";

const store = configureStore({
  reducer: {
    ui: uiSlice.reducer,
    vehiculo: vehiculoSlice.reducer,
    auth: authSlice.reducer,
    business: businessSlice.reducer,
    supply: supplySlice.reducer,
    deposit: depositSlice.reducer,
    map: mapSlice.reducer,
    draw: drawSlice.reducer,
    ordesti: originsDestinationsSlice.reducer,
    fieldList: fieldListSlice.reducer,
    users: usersSlice.reducer,
    campaign: campaignSlice.reducer,
    order: withdrawalOrderSlice.reducer,
    zone: zoneSlice.reducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
