import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "/",
  // credentials: "include",
});

const prototype = createApi({
  baseQuery: baseQuery,
  //   keepUnusedDataFor: 30,
  //   refetchOnMountOrArgChange: 30,
  refetchOnReconnect: true,
  endpoints: () => ({}),
});

export { prototype };
