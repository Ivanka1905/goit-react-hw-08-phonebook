import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { getCurrentUser } from 'redux/user/userOperations';
import { toast } from 'react-toastify';

axios.defaults.baseURL = 'https://yourpet-backend.onrender.com/api/';

export const token = {
  set(accessToken) {
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  },
  unset() {
    axios.defaults.headers.common.Authorization = '';
  },
};

export const register = createAsyncThunk(
  'auth/register',
  async (credentials, { rejectWithValue, dispatch }) => {
    try {
      await axios.post('auth/register', credentials);
      const { email, password } = credentials;
      await dispatch(
        login({
          email,
          password,
        })
      );
    } catch (error) {
      toast.error('Email is invalid or it is used');
      return rejectWithValue(error.message);
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axios.post('auth/login', credentials);
      token.set(data.accessToken);
      dispatch(getCurrentUser());
      return data;
    } catch (error) {
      toast.error('Email or password is wrong');
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue, getState }) => {
    try {
      const value = getState().auth.accessToken;
      token.set(value);
      await axios.post('auth/logout');
      token.unset();
    } catch (error) {
      toast.error(error.response.data);
      return rejectWithValue(error.message);
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refresh',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await axios.get('auth/refresh', credentials);
      token.set(data.accessToken);
      return data;
    } catch (error) {
      token.unset();
      return rejectWithValue(error.message);
    }
  }
);
