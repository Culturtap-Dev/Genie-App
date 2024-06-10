import {
  Dimensions,
  View,
  Text,
  Image,
  KeyboardAvoidingView,
  TextInput,
  ScrollView,
  Pressable,
  TouchableOpacity,
  Alert,
  BackHandler,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  useNavigation,
  useNavigationState,
  useRoute,
} from "@react-navigation/native";
import { Entypo } from "@expo/vector-icons";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import {
  setMobileNumber,
  setUniqueToken,
  setUserDetails,
} from "../../redux/reducers/userDataSlice";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import auth from "@react-native-firebase/auth";
import axios from "axios";
import MobileNumberScreenBg from "../../assets/MobileEntryPageBg.svg";
import MobileIcon from "../../assets/mobileIcon.svg";
import messaging from "@react-native-firebase/messaging";

import OtpPageBg from "../../assets/OtpVerificationPageBg.svg";

const MobileNumberEntryScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const route = useRoute();
  const [mobileNumber, setMobileNumberLocal] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [code, setCode] = useState("");
  const [mobileScreen, setMobileScreen] = useState(true);
  const countryCode = "+91";
  const uniqueToken = useSelector((store) => store.user.uniqueToken);
  const userMobileNumber = useSelector((store) => store.user.mobileNumber);

  const navigationState = useNavigationState((state) => state);
  const isLoginScreen =
    navigationState.routes[navigationState.index].name === "mobileNumber";
  console.log("mobil", isLoginScreen);

  async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log("Authorization status:", authStatus);
    }
  }

  useEffect(() => {
    if (requestUserPermission()) {
      messaging()
        .getToken()
        .then((token) => {
          console.log("token", token);
        //   setToken(token);
          dispatch(setUniqueToken(token));
        });
    } else {
      console.log("permission not granted", authStatus);
    }
  }, [route.params]);

  useEffect(() => {
    const backAction = () => {
      // If on OTP screen, set mobileScreen to true to go back to mobile number entry screen
      if (!mobileScreen) {
        setMobileScreen(true);
        return true; // Prevent default back action
      } else if (isLoginScreen) {
        BackHandler.exitApp();
        // return true;
      }

      return false;
    };

    // Add event listener for hardware back button
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    // Clean up event listener
    return () => backHandler.remove();
  }, [mobileScreen]);

  const handleMobileNo = (number) => {
    // Update the mobile number state
    setMobileNumberLocal(number);
    // Log the mobile number value
    console.log(number);
  };

  const handleOtp = (otp) => {
    setOtp(otp);
    console.log(otp);
  };

  const sendVerification = async () => {
    if (mobileNumber.length === 10) {
      // Navigate to OTP screen if the phone number is valid
      setLoading(true);
      try {
        const phoneNumber = countryCode + mobileNumber;
        // console.log(phoneNumber);
        // const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
        // setConfirm(confirmation);
        // console.log(confirmation);
        dispatch(setMobileNumber(phoneNumber));
        setMobileScreen(false);
      } catch (error) {
        console.log("error", error);
      } finally {
        setLoading(false);
      }
    } else {
      // Display an alert if the phone number is invalid
      alert("Please enter correct mobile number.");
    }
  };

  const checkMobileNumber = async () => {
    setLoading(true);
    try {
      // Make a request to your backend API to check if the mobile number is registered

      // console.log(confirm)
      // const res = await confirm.confirm(otp);
      // console.log("res", res);
      console.log(otp);
      // if(res){
      const phoneNumber = countryCode + mobileNumber;
      console.log("phone", phoneNumber);
      const response = await axios.get("http://173.212.193.109:5000/user/", {
        params: {
          mobileNo: phoneNumber,
        },
      });
      // console.log("res", response);
      setMobileScreen(true);
      if (response.data.mobileNo) {
        // If mobile number is registered, navigate to home screen
        // console.log('userDetails from mobileScreen', response.data);
        dispatch(setUserDetails(response.data));
        await AsyncStorage.setItem(
          "userDetails",
          JSON.stringify(response.data)
        );
        setOtp("");
        // setMobileNumberLocal("");
        navigation.navigate("home");
        await axios
          .patch("http://173.212.193.109:5000/user/edit-profile", {
            _id: response.data._id,
            updateData: { uniqueToken: uniqueToken },
          })
          .then((res) => {
            console.log("UserToken updated Successfully");
          })
          .catch((err) => {
            console.error("Error updating token: " + err.message);
          });
      } else if (response.data.status === 404) {
        // If mobile number is not registered, continue with the registration process
        // setMobileNumberLocal("");
        navigation.navigate("registerUsername");
      }
      //   }
      //   else{
      //     setLoading(false);
      //     console.log('Invalid otp:');
      //     alert('Invalid otp');
      //     return;
      //   }
    } catch (error) {
      console.error("Error checking mobile number:", error);
    } finally {
      setLoading(false);
    }
  };

  const { width } = Dimensions.get("window");
  // console.log('width', width);
  return (
    <>
      {mobileScreen && (
        <View style={{ flex:1,backgroundColor: "white"  }}>
         <ScrollView contentContainerStyle={{ flexGrow: 1}}>
         <KeyboardAvoidingView  behavior="position">
            {/* <Image source={require("../../assets/MobileEntryPage.png")} className="w-full object-cover" /> */}
            
              <MobileNumberScreenBg width={width} height={350}/>
              <View style={{ flex: 1, backgroundColor: "white",paddingBottom:30 }}>
              <View className="flex flex-row gap-[8px] pt-[32px] px-[32px]">
                <Text className="h-[7px] w-[30px] border-[1px] border-[#fb8c00] bg-[#fb8c00] rounded-md"></Text>
                <Text className="h-[7px] w-[30px] border-[1px] border-black rounded-md"></Text>
                <Text className="h-[7px] w-[30px] border-[1px] border-black rounded-md"></Text>
              </View>
              <View className="mt-[20px] px-[32px]">
                <Text className="text-[14px]">
                  Now bargaining is possible {"\n"}from your couch! Connect online with nearby retailers now.
                </Text>
               
              </View>
              <View className="flex flex-col gap-[10px] mt-[40px]">
                <View className="flex flex-col gap-[5px] px-[32px]">
                  {/* <Image source={require("../../assets/mobileIcon.png")} className="w-[11px] h-[18px]" /> */}
                  {/* <MobileIcon /> */}
                  <Text className="text-[16px] font-extrabold">
                    Please enter your
                  </Text>
                </View>
                <View className="flex flex-col gap-[15px]">
                  <Text className="text-[13px] font-normal px-[32px]">
                    Mobile Number
                  </Text>
                 
                    <View className="flex flex-row items-center gap-[10px] h-[54px] px-[8px] border-[1px] border-[#f9f9f9] rounded-[16px] bg-[#F9F9F9] mx-[30px]">
                      <Text className="text-[16px] font-extrabold border-r-[1px] border-[#dbcdbb] pr-[16px] pl-[15px]">
                        +91
                        <Entypo
                          name="chevron-down"
                          size={16}
                          color="black"
                          className="pl-[10px]"
                        />
                      </Text>
                      <TextInput
                        value={mobileNumber}
                        placeholder="Ex : 9088-79-0488"
                        placeholderTextColor={"#dbcdbb"}
                        onChangeText={handleMobileNo}
                        keyboardType="numeric"
                        className="w-full text-[16px]"
                        maxLength={10}
                      />
                    </View>
                 
                </View>
              </View>
            </View>
            </KeyboardAvoidingView>
          </ScrollView>
          <TouchableOpacity
            disabled={mobileNumber.length !== 10}
            onPress={sendVerification}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 68,
              width: "100%",
              backgroundColor:
                mobileNumber.length !== 10 ? "#e6e6e6" : "#FB8C00",
              justifyContent: "center", // Center content vertically
              alignItems: "center", // Center content horizontally
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: mobileNumber.length !== 10 ? "#888888" : "white",
              }}
            >
              NEXT
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {!mobileScreen && (
        <View style={{ flex: 1 }}>
          {/* <Text>OtpVerificationScreen</Text> */}
          <KeyboardAvoidingView behavior="padding">
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} >
            <Image
              source={require("../../assets/Otpverification.png")}
              className="w-full object-cover"
            />
            {/* <OtpPageBg width={width} /> */}
            {/* <Pressable onPress={() => { navigation.goBack() }} className="flex flex-row items-center absolute top-16 left-4 gap-2">
                            <FontAwesome name="chevron-left" size={15} color="black" />
                            <Text className="text-[16px] font-extrabold">Back</Text>
                        </Pressable> */}
            <View className="px-[42px] pb-[70px]">
              <View className="flex flex-row gap-2 pt-[30px] ">
                <View className="w-[32px] h-[9px] bg-[#fb8c00] rounded-lg"></View>
                <View className="w-[32px] h-[9px] bg-[#fb8c00]  rounded-lg"></View>
                <View className="w-[32px] h-[9px] border-[1px] border-black rounded-lg"></View>
              </View>
              <View>
                <Text className="text-[14px] text-[#2e2c43] pt-[24px]">
                  Get the best price for your next purchase, Smart shopping is
                  on now.{" "}
                </Text>
              </View>
              <View>
                <Text className="text-[18px] font-extrabold text-[#001b33] pt-[24px]">
                  ENTER OTP
                </Text>
              </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    marginTop: 19,
                  }}
                >
                  <TextInput
                    placeholder="* * * * * *"
                    maxLength={6}
                    placeholderTextColor={"#dbcdbb"}
                    keyboardType="numeric"
                    onChangeText={handleOtp}
                    style={{
                      letterSpacing: 8,
                      textAlignVertical: "center",
                      borderWidth: 1,
                      borderColor: "#2e2c43",
                      backgroundColor: "#f9f9f9",
                      borderRadius: 16,
                      width: "100%",
                      height: 53,
                      textAlign: "center",
                      fontSize: 17,
                    }}
                  />
                </View>
             
              <View className="mt-[14px]">
                <Text className="text-[14px] text-[#2e2c43]">
                  OTP should be auto-filled otherwise type it manually.Sending OTP at{" "}
                  <Text className="text-[#558b2f] font-semibold">
                    +91 {userMobileNumber.slice(3, 13)}
                  </Text>
                </Text>
              </View>
              <View>
                <Text className="text-[14px] text-[#2e2c43] mt-[15px]">
                  Didn't recieve it?
                </Text>
                <TouchableOpacity onPress={sendVerification}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "bold",
                          color: "#e76043",
                        }}
                      >
                        RESEND
                      </Text>
                    </TouchableOpacity>
              </View>
            </View>
            
          </ScrollView>
          </KeyboardAvoidingView>

          <TouchableOpacity
            disabled={otp.length !== 6}
            onPress={checkMobileNumber}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 68,
              width: "100%",
              backgroundColor:
                otp.length !== 6 ? "#e6e6e6" : "#FB8C00",
              justifyContent: "center", // Center content vertically
              alignItems: "center", // Center content horizontally
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: otp.length !== 6 ? "#888888" : "white",
              }}
            >
            NEXT
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};

export default MobileNumberEntryScreen;
