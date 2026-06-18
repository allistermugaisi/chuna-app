import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { Toast } from "../../components/Toast";
import { tokenConfig } from "./authSlice";
import { save, getValueFor, remove } from "../../utils/secureStore";

const initialState = {
  // Create listing
  listing: null,

  // My listings
  listings: [],
  listingsTotal: 0,
  loadingListings: false,

  // Received requests
  requests: [],
  loadingRequests: false,

  // Shared flags
  isLoading: false, // create listing spinner
  cancelling: null, // listing_ref currently being cancelled
  responding: null, // request_ref currently being responded to

  error: null,
};

const marketSlice = createSlice({
  name: "market",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createListing.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createListing.fulfilled, (state, action) => {
        state.isLoading = false;
        state.listing = action.payload;

        // Optimistically prepend to listings so the dashboard updates immediately
        state.listings = [
          {
            listing_ref: action.payload.listing_ref,
            shares_offered: String(action.payload.shares),
            asking_price: String(action.payload.asking_price),
            total_value: String(action.payload.total_value),
            status: action.payload.status,
            expires_at: action.payload.expires_at,
            total_requests: 0,
            created_at: new Date().toISOString(),
          },
          ...state.listings,
        ];
        state.listingsTotal += 1;
      })
      .addCase(createListing.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message ?? "Failed to create listing.";
      })
      // ── fetchMyListings ────────────────────────────────────────────────────
      .addCase(fetchMyListings.pending, (state) => {
        state.loadingListings = true;
        state.error = null;
      })
      .addCase(fetchMyListings.fulfilled, (state, action) => {
        state.loadingListings = false;
        state.listings = action.payload.listings ?? [];
        state.listingsTotal = action.payload.total ?? 0;
      })
      .addCase(fetchMyListings.rejected, (state, action) => {
        state.loadingListings = false;
        state.error = action.payload?.message ?? "Failed to load listings.";
      })

      // ── fetchReceivedRequests ──────────────────────────────────────────────
      .addCase(fetchReceivedRequests.pending, (state) => {
        state.loadingRequests = true;
        state.error = null;
      })
      .addCase(fetchReceivedRequests.fulfilled, (state, action) => {
        state.loadingRequests = false;
        state.requests = action.payload.requests ?? [];
      })
      .addCase(fetchReceivedRequests.rejected, (state, action) => {
        state.loadingRequests = false;
        state.error = action.payload?.message ?? "Failed to load requests.";
      })

      // ── cancelListing ──────────────────────────────────────────────────────
      .addCase(cancelListing.pending, (state, action) => {
        state.cancelling = action.meta.arg; // listingRef
      })
      .addCase(cancelListing.fulfilled, (state, action) => {
        state.cancelling = null;
        // Flip the status locally — no need to re-fetch
        state.listings = state.listings.map((l) =>
          l.listing_ref === action.payload ? { ...l, status: "cancelled" } : l,
        );
      })
      .addCase(cancelListing.rejected, (state) => {
        state.cancelling = null;
      })

      // ── respondToRequest ───────────────────────────────────────────────────
      .addCase(respondToRequest.pending, (state, action) => {
        state.responding = action.meta.arg.requestRef;
      })
      .addCase(respondToRequest.fulfilled, (state, action) => {
        state.responding = null;
        // Remove responded request from list
        state.requests = state.requests.filter(
          (r) => r.request_ref !== action.payload,
        );
      })
      .addCase(respondToRequest.rejected, (state) => {
        state.responding = null;
      });
  },
});

const baseUrl = "https://chus.tililtech.com";

// POST /marketplace/listings
export const createListing = createAsyncThunk(
  "market/createListing",
  async (payload, { rejectWithValue }) => {
    const token = await tokenConfig();

    // Request body
    const {
      shares,
      description,
      asking_price,
      shares_offered,
      price_per_share,
    } = payload;

    try {
      // Make request to login user
      const response = await axios.post(
        `${baseUrl}/marketplace/listings`,
        payload,
        token,
      );

      const data = await response.data;

      if (data?.status_code !== 201) {
        Toast.show({
          type: "error",
          title: "Could not create listing",
          message: data?.message ?? "Please try again.",
        });
        return rejectWithValue(data);
      } else {
        Toast.show({
          type: "success",
          title: `${data?.status_desc}`,
          message: `${data?.message}`,
        });

        return data?.data;
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ?? "An error occurred. Try again.";
      Toast.show({ type: "error", title: "Error", message: msg });
      return rejectWithValue(error?.response?.data ?? { message: msg });
    }
  },
);

// GET /marketplace/my-listings?page=1&limit=20
export const fetchMyListings = createAsyncThunk(
  "market/fetchMyListings",
  async ({ page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const token = await tokenConfig();

      const response = await axios.get(
        `${baseUrl}/marketplace/my-listings?page=${page}&limit=${limit}`,
        token,
      );

      const data = response.data;

      if (data?.status_code !== 200) {
        return rejectWithValue(data);
      }

      return data?.data; // { listings: [...], total: N }
    } catch (error) {
      console.log(error);
      return rejectWithValue(
        error?.response?.data ?? { message: "Network error." },
      );
    }
  },
);

// GET /marketplace/received-requests?page=1&limit=20
export const fetchReceivedRequests = createAsyncThunk(
  "market/fetchReceivedRequests",
  async ({ page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const token = await tokenConfig();

      const response = await axios.get(
        `${baseUrl}/marketplace/received-requests?page=${page}&limit=${limit}`,
        token,
      );

      const data = response.data;
      console.log("fetchReceivedRequests", data);

      if (data?.status_code !== 200) {
        return rejectWithValue(data);
      }

      return data?.data; // { requests: [...] }
    } catch (error) {
      return rejectWithValue(
        error?.response?.data ?? { message: "Network error." },
      );
    }
  },
);

// PUT /marketplace/listings/:ref/cancel
export const cancelListing = createAsyncThunk(
  "market/cancelListing",
  async (listingRef, { rejectWithValue }) => {
    try {
      const token = await tokenConfig();
      const response = await axios.put(
        `${baseUrl}/marketplace/listings/${listingRef}/cancel`,
        {}, // empty body — endpoint only needs the ref in the URL
        token,
      );

      const data = response.data;

      if (data?.status_code !== 200) {
        Toast.show({
          type: "error",
          title: "Error",
          message: data?.message ?? "Could not cancel.",
        });
        return rejectWithValue(data);
      }

      Toast.show({
        type: "success",
        title: "Listing cancelled",
        message: data?.message,
      });
      return listingRef; // return ref so reducer can flip status locally
    } catch (error) {
      const msg = error?.response?.data?.message ?? "Network error.";
      Toast.show({ type: "error", title: "Error", message: msg });
      return rejectWithValue(error?.response?.data ?? { message: msg });
    }
  },
);

// PUT /marketplace/requests/:ref/respond
export const respondToRequest = createAsyncThunk(
  "market/respondToRequest",
  async (
    { requestRef, action, counterPrice = "", counterMessage = "" },
    { rejectWithValue },
  ) => {
    try {
      const token = await tokenConfig();
      const response = await axios.put(
        `${baseUrl}/marketplace/requests/${requestRef}/respond`,
        {
          action,
          counter_price: counterPrice,
          counter_message: counterMessage,
        },
        token,
      );

      const data = response.data;

      if (data?.status_code !== 200) {
        Toast.show({
          type: "error",
          title: "Error",
          message: data?.message ?? "Could not respond.",
        });
        return rejectWithValue(data);
      }

      Toast.show({
        type: "success",
        title: action === "accept" ? "Offer accepted" : "Offer declined",
        message: data?.message,
      });

      return requestRef; // return ref so reducer can remove it from local list
    } catch (error) {
      const msg = error?.response?.data?.message ?? "Network error.";
      Toast.show({ type: "error", title: "Error", message: msg });
      return rejectWithValue(error?.response?.data ?? { message: msg });
    }
  },
);

export const { clearError } = marketSlice.actions;
export default marketSlice.reducer;
