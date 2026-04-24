import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

// REGISTER
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    const response = await fetch("https://apis-8.onrender.com/api/userRoutes/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userData)
    })

    const data = await response.json()

    if (!response.ok) {
      if (data.message === "user exists") {
        return rejectWithValue("Email already exists")
      }
      return rejectWithValue(data.message || "Registration failed")
    }

    return data
  }
)

// LOGIN
export const loginUser = createAsyncThunk(
  "auth/login",
  async (userData, { rejectWithValue }) => {
    const response = await fetch("https://apis-8.onrender.com/api/userRoutes/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userData)
    })

    const data = await response.json()

    if (!response.ok) {
      return rejectWithValue(data.message || "Login failed")
    }

    return data
  }
)

const authSlice = createSlice({
  name: "authSlice",
  initialState: {
    user: null,
    loading: false,
    error: null,
    token: localStorage.getItem("token") || null
  },

  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.error = null
      state.loading = false
      localStorage.removeItem("token")
    }
  },

  extraReducers: (builder) => {
    builder

      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.token = action.payload.webToken
        localStorage.setItem("token", action.payload.webToken)
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { logout } = authSlice.actions
export default authSlice.reducer