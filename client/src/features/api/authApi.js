import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn, userLoggedOut, setLoading } from "../authSlice";

const USER_API = `${import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1"}/user/`;

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: USER_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (inputData) => ({
        url: "register",
        method: "POST",
        body: inputData,
      }),
    }),

    loginUser: builder.mutation({
      query: (inputData) => ({
        url: "login",
        method: "POST",
        body: inputData,
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          dispatch(userLoggedIn({ user: result.data.user }));
        } catch (error) {
          console.log(error);
        }
      },
    }),

    logoutUser: builder.mutation({
      query: () => ({
        url:"logout",
        method: "GET"
      }),
 async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          dispatch(userLoggedOut());
        } catch (error) {
          console.log(error);
        }
      }
    }),


    loadUser: builder.query({
       query: () => ({
      url:"profile",
      method:"GET"
    }),
     async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          dispatch(userLoggedIn({ user: result.data.user }));
        } catch (error) {
          // Only log errors that aren't 401 (Unauthorized is expected when not logged in)
          if (error?.error?.status !== 401) {
            console.log(error);
          }
          dispatch(setLoading(false)); // Set loading to false even on error
        }
      },
    }),

    updateUser: builder.mutation({
      query:(FormData) => ({
        url:"profile/update",
        method: "PUT",
        body: FormData,
        credentials:"include"
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(userLoggedIn({ user: data.user }));
        } catch (error) {
          console.log(error);
        }
      },
    }),

    createStudentUser: builder.mutation({
      query: (userData) => ({
        url: "create-student",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ['User']
    }),

    getAllStudents: builder.query({
      query: () => ({
        url: "all-students",
        method: "GET",
      }),
      providesTags: ['User']
    }),

    updateStudentByAdmin: builder.mutation({
      query: ({ userId, userData }) => ({
        url: `update-student/${userId}`,
        method: "PUT",
        body: userData,
      }),
      invalidatesTags: ['User']
    }),

    deleteStudentByAdmin: builder.mutation({
      query: (userId) => ({
        url: `delete-student/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ['User']
    }),

  }),
});

export const { 
  useRegisterUserMutation, 
  useLoginUserMutation, 
  useLogoutUserMutation, 
  useLoadUserQuery, 
  useUpdateUserMutation,
  useCreateStudentUserMutation,
  useGetAllStudentsQuery,
  useUpdateStudentByAdminMutation,
  useDeleteStudentByAdminMutation
} = authApi;
