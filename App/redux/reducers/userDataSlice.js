// features/counterSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  mobileNumber: "",
  userName: "",
  userLocation: "",
  images: [],
  userDetails: {},
  spades: [],
  currentSpade: {},
  currentSpadeRetailer: {},
  currentSpadeRetailers: [],
  currentChatMessages: [],
  uniqueToken: "",
  userLongitude: 0,
  userLatitude: 0,
  currentSpadeChatId: {},
  bargainingScreens: [],
  accessToken: "",
  refreshToken: "",
  isOnline: false,
  isHome: true,
  history: [],
  storeCategories: [],
  storeData: {},
  currentLocation: "",
  vendorId:"",
  storeVisible: false,
};

const userDataSlice = createSlice({
  name: 'store',
  initialState,
  reducers: {
    setMobileNumber: (state, action) => {
      state.mobileNumber = action.payload;
    },
    setUserName: (state, action) => {
      state.userName = action.payload;
    },
    setUserLocation: (state, action) => {
      state.userLocation = action.payload;
    },
    setImages: (state, action) => {
      state.images = action.payload;
    },
    setUserDetails: (state, action) => {
      state.userDetails = action.payload;
    },
    setSpades: (state, action) => {
      state.spades = action.payload;
    },
    setCurrentSpade: (state, action) => {
      state.currentSpade = action.payload;
    },
    setCurrentSpadeRetailer: (state, action) => {
      state.currentSpadeRetailer = action.payload;
    },
    setCurrentSpadeRetailers: (state, action) => {
      state.currentSpadeRetailers = action.payload;
    },
    setCurrentChatMessages: (state, action) => {
      if (Array.isArray(action.payload)) {
        state.currentChatMessages = action.payload;
      } else {
        console.error('Non-array value detected in setCurrentChatMessages:', action.payload);
      }
    },
    setUniqueToken: (state, action) => {
      state.uniqueToken = action.payload;
    },
    userClear: (state) => {
      return initialState;
    },
    setUserLongitude: (state, action) => {
      state.userLongitude = action.payload;
    },
    setUserLatitude: (state, action) => {
      state.userLatitude = action.payload;
    },
    setCurrentSpadeChatId: (state, action) => {
      state.currentSpadeChatId = action.payload;
    },
    setBargainingScreens: (state, action) => {
      state.bargainingScreens = []; // clear array before pushing new one]\]\\      
      state.bargainingScreens.push(action.payload);
    },
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;

    },
    setRefreshToken: (state, action) => {
      state.refreshToken = action.payload;
    },
    setIsOnline: (state, action) => {
      state.isOnline = action.payload;
    },
    setIsHome: (state, action) => {
      state.isHome = action.payload;
    },
    setHistory: (state, action) => {
      state.history = action.payload;
    },
    setStoreCategories: (state, action) => {
      state.storeCategories = action.payload;
    },
    setStoreData: (state, action) => {
      state.storeData = action.payload;
    },
    dataClear: (state) => {
      return initialState;
    },
    setCurrentLocation: (state, action) => {
      state.currentLocation = action.payload;
    },
    setVendorId: (state, action) => {
      state.vendorId = action.payload;
    },
    setStoreVisible: (state, action) => {
      state.storeVisible = action.payload;
    }
  },
});

export const { setMobileNumber, setUserName,setVendorId, setUserLocation, setImages, setUserDetails, setSpades, setCurrentSpade, setCurrentSpadeRetailer, setCurrentSpadeRetailers,setStoreVisible, setCurrentChatMessages, setUniqueToken, userClear, setUserLatitude, setUserLongitude, setCurrentSpadeChatId, setBargainingScreens, setAccessToken, setRefreshToken, setIsOnline, setIsHome, setHistory, setStoreCategories, setStoreData, dataClear, setCurrentLocation } = userDataSlice.actions;
export default userDataSlice.reducer;