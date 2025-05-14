import { configureStore } from "@reduxjs/toolkit"
import jobReducer from "./slices/jobSlice"
import useReducer from "./slices/userSlice";
import applicationReducer from "./slices/applicationSlice"
import updateProfileReducer from "./slices/updateProfileSlice";

const store = configureStore({
    reducer: {
        user: useReducer,
        jobs: jobReducer,
        applications: applicationReducer,
        updateProfile: updateProfileReducer,
    },
})

export default store;