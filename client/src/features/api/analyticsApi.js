import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const ANALYTICS_API = "http://localhost:8080/api/v1/analytics";

export const analyticsApi = createApi({
  reducerPath: "analyticsApi",
  tagTypes: ['Analytics'],
  baseQuery: fetchBaseQuery({
    baseUrl: ANALYTICS_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => ({
        url: "/stats",
        method: "GET",
      }),
      providesTags: ['Analytics']
    }),
    getUserGrowth: builder.query({
      query: (period = "month") => ({
        url: `/user-growth?period=${period}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetUserGrowthQuery
} = analyticsApi;

