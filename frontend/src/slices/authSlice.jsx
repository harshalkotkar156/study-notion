import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: localStorage.getItem("token") || null,
};


const authSlice = createSlice({
    name:"auth",
    initialState:initialState,
    reducers:{
        setToken(state,token){
            state.token = value.payload;
        }
    }
})

export const {setToken} = authSlice.actions;
export default authSlice.reducer;
