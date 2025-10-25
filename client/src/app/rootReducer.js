import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import { authApi } from "@/features/api/authApi";
import { courseApi } from "@/features/api/CourseApi";
import { enrollmentApi } from "@/features/api/enrollmentApi";
import { analyticsApi } from "@/features/api/analyticsApi";
import { settingsApi } from "@/features/api/settingsApi";

const rootReducer = combineReducers({
  [authApi.reducerPath]: authApi.reducer,
  [courseApi.reducerPath]: courseApi.reducer,
  [enrollmentApi.reducerPath]: enrollmentApi.reducer,
  [analyticsApi.reducerPath]: analyticsApi.reducer,
  [settingsApi.reducerPath]: settingsApi.reducer,
  auth: authReducer,
});

export default rootReducer;
