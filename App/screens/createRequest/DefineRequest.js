import {
  View,
  Text,
  Pressable,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Animated,
  StyleSheet,
  BackHandler,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import React, { useCallback, useEffect, useState } from "react";
import ArrowLeft from "../../assets/arrow-left.svg";
import Genie from "../../assets/Genie.svg";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import {
  emtpyRequestImages,
  requestClear,
  setEstimatedPrice,
  setExpectedPrice,
  setNearByStoresCategory,
  setRequestDetail,
  setRequestImages,
  setSuggestedImages,
} from "../../redux/reducers/userRequestsSlice";
import { useSelector, useDispatch } from "react-redux";
import BackArrow from "../../assets/BackArrowImg.svg";
import axios from "axios";
import { setSpades, setUserDetails } from "../../redux/reducers/userDataSlice";
import { baseUrl } from "../../utils/logics/constants";
import axiosInstance from "../../utils/logics/axiosInstance";
import ExpectedModal from "../../assets/expectedPriceModal.svg";
import RightArrow from "../../assets/rightblack.svg";
import AddMoreImage from "../../assets/AddImg.svg";
import { Camera } from "expo-camera";
import { manipulateAsync } from "expo-image-manipulator";
import { launchCamera } from "react-native-image-picker";
import * as ImagePicker from "expo-image-picker";
import DelImg from "../../assets/delImg.svg";
import ModalCancel from "../components/ModalCancel";
import Banner2 from "../../assets/Banner2.svg";
import WhiteArrow from "../../assets/white-right.svg"
import { formatDateTime } from "../../utils/logics/Logics";
import { NewRequestCreated } from "../../notification/notificationMessages";
import SuccessPopup from "../components/SuccessPopup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FastImage from "react-native-fast-image";
import SuccessPopupNew from "../components/SuccessPopupNew";
import { socket } from "../../utils/scoket.io/socket";
import GreyArrow from "../../assets/grey-right.svg";


const {width,height} = Dimensions.get("window")

const DefineRequest = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [query, setQuery] = useState("");
  const [price, setPrice] = useState("");
  const [expectedPriceModal, setExpectedPriceModal] = useState(false);
  const requestCategory = useSelector(
    (store) => store.userRequest.requestCategory
  );
  const userDetails = useSelector((store) => store.user.userDetails);
  const userLongitude = useSelector((store) => store.user.userLongitude);
  const userLatitude = useSelector((store) => store.user.userLatitude);
  const accessToken = useSelector((store) => store.user.accessToken);
  const suggestedImages = useSelector(
    (store) => store.userRequest.suggestedImages
  );
  const requestImages = useSelector((store) => store.userRequest.requestImages);
  const estimatedPrice = useSelector(
    (store) => store.userRequest.estimatedPrice
  );
  const expectedPrice = useSelector((store) => store.userRequest.expectedPrice);
  const [addMore, setAddMore] = useState(false);
  const [delImgType, setDelImgType] = useState("clicked");
  const [descModal, setDescModal] = useState(false);
  const [selectedImgEstimatedPrice, setSelectedImgEstimatedPrice] = useState(0);
  const [selectedImageDesc, setSelectedImageDesc] = useState("");
  const [isService, setIsService] = useState(false);
  const [showImageLength, setShowImageLength] = useState(20);
  const [loadMore, setLoadMore] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [signUpModal, setSignUpModal] = useState(false);
  const [imagesLocal, setImagesLocal] = useState([]);
  const insets = useSafeAreaInsets();
  const [cameraScreen, setCameraScreen] = useState(false);
  const [imgIndex, setImgIndex] = useState();
  const [modalVisible, setModalVisible] = useState(false);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off);
  const [zoom, setZoom] = useState(0);
  const [whiteBalance, setWhiteBalance] = useState(
    Camera.Constants.WhiteBalance.auto
  );
  const [autoFocus, setAutoFocus] = useState(Camera.Constants.AutoFocus.on);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [camera, setCamera] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [scaleAnimation] = useState(new Animated.Value(0));
  const navigationState = useNavigationState((state) => state);
 const spadeCouponCode = useSelector(
    (store) => store.userRequest.spadeCouponCode
  );
  const isDefineRequest =
    navigationState.routes[navigationState.index].name === "define-request";
      const requestDetail = useSelector((store) => store.userRequest.requestDetail);
      const spadePrice = useSelector((store) => store.userRequest.spadePrice);
     const [isVisible, setIsVisible] = useState(false);
      const spades = useSelector((store) => store.user.spades);
    
  // useEffect(() => {
  //   if (suggestedImages.length > 0)
  //     setQuery("Looking for the product in this reference image.");
  // }, []);

  // console.log(suggestedImages, requestImages);

  const handleImagePress = (image) => {
    setSelectedImage(image);
    Animated.timing(scaleAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleClose = () => {
    Animated.timing(scaleAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setSelectedImage(null));
  };

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === "granted");
    })();
  }, [cameraScreen]);
  //   if (hasCameraPermission === null) {
  //     return <View />;
  //   }
  //   if (hasCameraPermission === false) {
  //     return <Text>No access to camera</Text>;
  //   }

  const takePicture = async () => {
    const options = {
      mediaType: "photo",
      saveToPhotos: true,
    };

    launchCamera(options, async (response) => {
      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.error) {
        console.log("ImagePicker Error: ");
      } else {
        try {
          const newImageUri = response.assets[0].uri;
          const compressedImage = await manipulateAsync(
            newImageUri,
            [{ resize: { width: 600, height: 800 } }],
            { compress: 0.5, format: "jpeg", base64: true }
          );

          dispatch(setRequestImages([compressedImage.uri, ...requestImages]));
        } catch (error) {
          console.error("Error processing image: ", error);
        }
      }
    });
  };

  const deleteImage = (index) => {
    setImgIndex(index);
    setModalVisible(true);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      base64: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      // await getImageUrl(result.assets[0]);
      const newImageUri = result?.assets[0]?.uri;
      const compressedImage = await manipulateAsync(
        newImageUri,
        [{ resize: { width: 600, height: 800 } }],
        { compress: 0.5, format: "jpeg" }
      );
      dispatch(setRequestImages([compressedImage.uri, ...requestImages]));
    }
  };

  useEffect(() => {
    if (isDefineRequest) {
      const backAction = () => {
        dispatch(setSuggestedImages([]));
        dispatch(setRequestImages([]));
        dispatch(setExpectedPrice(0));
        dispatch(setEstimatedPrice(0));
        return false;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );

      return () => backHandler.remove(); // Clean up the event listener
    }
  }, [isDefineRequest]);

  const suggestions = {
    "Consumer Electronics & Accessories - Home appliances and equipment etc": [
      "Smart Tv 55 inch, Ultra HD",
      "12 Ltr Oven Toaster Griller with Heating Mode",
      "Double Door Refrigerator",
      "1600 Watts Induction Cooktop with Automatic Voltage Regulator",
    ],
    "Fashion/Clothings - Top, bottom, dresses": [
      "Boiler suits",
      "Jeans: Denim jackets",
      "Trench coats",
      "Wrap dress",
      "Plain white shirt",
    ],
    "Fashion Accessories - Jewellery, Gold & Diamond": [
      "vintage jewelry",
      "wedding jewelry",
      "Gold earrings",
      "Diamond Rings",
      "mett finish jewellery set",
    ],
    "Fashion Accessories - Shoes, bags etc": [
      "School Uniform Shoe",
      "EXTRA SOFT Men's Classic Casual Clogs/ Sandals with Adjustable Back Strap",
      "Black Nike Shoes",
      "Red Puma Shoes",
    ],
    "Fashion Accessories - Sharee, suits, kurti & dress materials etc": [
      "A-Line Kurta with Pant and Dupatta Suit Set",
      "Floor Length Suits",
      "Banarsi Sari",
      "Elegant Draped Styles",
    ],
    "Gifts, Kids Games,Toys & Clothings": [
      "Monopoly",
      "Chess",
      "Jenga",
      "Game of States",
      "Audi Tt Rs Plus Electric Motor Car",
      "Vintage Electric Motor Car",
    ],
    "Luxury Watches": [
      "Digital Watch",
      "Apple Watch",
      "Android Digital Watch",
      "Tissot T classic man’s watch",
    ],
    "Hardware - Plumbing, Paint,& Electricity": [
      "5 KG paint bucket",
      "Need Plumber",
      "Kitchen Sinks",
      "Sink Couplings",
      "Need Painter",
    ],
    "Sports Nutrition - Whey Pro etc": [
      "Nutrabay Pure Creatine Monohydrate",
      "Nutrabay Gold 100% Whey Protein Concentrate",
      "Wellversed (wellcore) - Micronised Creatine",
    ],
    "Automotive Parts/Services - 2 wheeler Fuel based": [
      "Bike Battery",
      "Engine Repair",
      "Tyre Replacement",
      "Bike Service",
    ],
    "Automotive Parts/Services - 4 wheeler Fuel based": [
      "Car Battery",
      "Engine Repair",
      "Tyre Replacement",
      "Car Service",
    ],
    "Services & Repair, Consumer Electronics & Accessories - Home appliances and equipment etc":
      [
        "Refrigerator Repair",
        "Washing Machine Repair Services",
        "Geyser Repair Services",
        "AC repair",
        "Cooler Repair",
      ],
    "Services & Repair, Consumer Electronics & Accessories - Mobile, Laptop, digital products etc":
      [
        "Laptop Keyboard repair",
        "Laptop RAM Customization",
        "Laptop battery service",
        "Mobile Screen repair",
      ],
    "Clock Repair & Services": [
      "Replace watch battery - Armani",
      "Fog on my watch",
      "Watch screen damage",
      "Watch glass repair",
    ],
    "Hardware - Cement, Hand tools, Powertools etc": [
      "Drill Machine ",
      "Electric Saw for wood ",
      "Heavy Load Hammer",
      "Screw drivers",
    ],
    "Kitchen Utensils & Kitchenware": [
      "Stainless Steel Knife Set",
      "Cutting Board",
      "Frying Pan",
      "Measuring Cups and Spoons",
    ],
    "Electrical Services & Repair - Electrician": [
      "Repair my electricity board",
      "Wiring Repair",
      "Repair split AC",
    ],
  };
  // console.log("hii", suggestions[requestCategory]);


  const handleSubmit = async () => {
    let productPrice;
    if (price?.length > 0) {
      productPrice=parseInt(price);
    } else {
      productPrice=0;
    }

        
         
    // console.log(
    //   "userDetails",
    //   userDetails._id,
    //   requestDetail,
    //   requestCategory,
    //   requestImages,
    //   suggestedImages,
    //   productPrice,
    //   spadePrice,
    //   userLongitude,
    //   userLatitude
    // );

    const formData = new FormData();

    requestImages?.forEach((image, index) => {
      formData.append("requestImages", {
        uri: image,
        type: "image/jpeg", // Adjust this based on the image type
        name: `photo-${Date.now()}-${index}.jpg`, // Adjust this based on the image name
      });
    });

    formData.append("customerID", userDetails._id);
    formData.append("request", `Looking for ${requestDetail}`);
    formData.append("requestCategory", requestCategory);
    formData.append("expectedPrice", productPrice > 0 ? productPrice : 0);
    // formData.append("spadePrice", userDetails.freeSpades > 0 ? 0 : spadePrice);
    formData.append("spadePrice", 0);
    formData.append(
      "appliedCoupon",
      spadeCouponCode.length > 0 ? spadeCouponCode : "NA"
    );
    formData.append(
      "longitude",
      userLongitude !== 0 ? userLongitude : userDetails.longitude
    );
    formData.append(
      "latitude",
      userLatitude !== 0 ? userLatitude : userDetails.latitude
    );
    formData.append("suggestedImages", suggestedImages);
console.log(formData)
    setLoading(true);
    try {
      const config = {
        headers: {
          // Use "headers" instead of "header"
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${accessToken}`,
        },
      };
      const response = await axiosInstance.post(
        `${baseUrl}/user/createrequest`,
        formData,
        config
      );

      // console.log("created request data", response.data);

      if (response.status === 201) {
        dispatch(setUserDetails(response.data.userDetails));
        await AsyncStorage.setItem(
          "userDetails",
          JSON.stringify(response.data.userDetails)
        );

        let res = response.data.userRequest;
        const dateTime = formatDateTime(res.updatedAt);
        res.createdAt = dateTime.formattedTime;
        res.updatedAt = dateTime.formattedDate;

        dispatch(setSpades([res, ...spades]));
        setIsVisible(true);
        
      //   // dispatch(setCreatedRequest(res));

        socket.emit("new request", response.data.userRequest._id);
      //   //make redux to its inital state
      
      setTimeout(() => {
        setIsVisible(false);
        navigation.navigate("home");
      }, 3000);
        const notification = {
          uniqueTokens: response.data.uniqueTokens,
          title: userDetails?.userName,
          body: requestDetail,
          image:
            response.data?.userRequest?.requestImages?.length > 0
              ? response.data?.userRequest?.requestImages[0]
              : "",
        };

        await NewRequestCreated(notification);

      //   // dispatch(emtpyRequestImages());
         dispatch(setRequestDetail(""));
                dispatch(setRequestImages([]));
                dispatch(setSuggestedImages([]))
                
        // dispatch(emtpyRequestImages());
        // dispatch(requestClear());
        // console.error("Error while creating request");
      }
      
    } catch (error) {
      // dispatch(emtpyRequestImages());
      // dispatch(requestClear());
      console.error("Error while creating request", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ backgroundColor: "#FFEDD6" }}>
          <View className=" flex  mt-[40px] flex-row  items-center  px-[32px] bg-[]">
            <TouchableOpacity
              onPress={() => {
                navigation.goBack();
                dispatch(setSuggestedImages([]));
                dispatch(setRequestImages([]));
                dispatch(setExpectedPrice(0));
                dispatch(setEstimatedPrice(0));
              }}
              className="px-[8px] py-[20px]"
              style={{
                paddingHorizontal: 8,
                paddingVertical: 20,
                position: "absolute",
                zIndex: 100,
                left: 32,
              }}
            >
              <BackArrow width={14} height={10} />
            </TouchableOpacity>
            <Text
              className="text-[16px] flex flex-1 justify-center text-[#2e2c43] items-center text-center"
              style={{ fontFamily: "Poppins-ExtraBold" }}
            >
              Make an Offer
            </Text>
          </View>

          <Text
            className="text-[16px]  text-[#2e2c43] text-center mt-[20px]"
            style={{ fontFamily: "Poppins-Regular" }}
          >
            {requestDetail.substring(0,20)}...
          </Text>

          {suggestedImages && suggestedImages?.length > 0 && (
            <View
              style={{
                flex: 1,
                margin: 20,
                marginHorizontal: 32,
                flexDirection: "row",
                gap: 10,
                justifyContent: "center",
              }}
            >
              {suggestedImages &&
                suggestedImages?.map((img, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      handleImagePress(img);
                    }}
                    style={{ borderRadius: 16, marginRight: 10 }}
                  >
                    <View style={styles.imageWrapper}>
                      <FastImage source={{ uri: img }} style={styles.image} />
                      {/* <Pressable
                            onPress={() => {
                              deleteImage(index);
                              setDelImgType("suggested");
                            }}
                            style={styles.deleteIcon}
                          >
                            <DelImg />
                          </Pressable> */}
                    </View>
                  </TouchableOpacity>
                ))}
            </View>
          )}

          {suggestedImages && suggestedImages?.length == 0 && (
            <View
              className={`w-full mt-[20px] flex flex-row items-center  justify-center ${
                requestImages &&
                requestImages?.length > 0 &&
                "ml-[32px] mt-[0px]"
              }`}
            >
              <TouchableOpacity onPress={() => setAddMore(!addMore)} style={{}}>
                <View style={{}}>
                  <AddMoreImage />
                </View>
              </TouchableOpacity>
              {requestImages && requestImages?.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{
                    flex: 1,
                    margin: 20,
                    marginHorizontal: 32,
                    flexDirection: "row",
                    alignSelf: "flex-start",
                    gap: 10,
                  }}
                >
                  {requestImages &&
                    requestImages?.map((img, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => {
                          handleImagePress(img);
                        }}
                        style={{ borderRadius: 16, marginRight: 10 }}
                      >
                        <View style={styles?.imageWrapper}>
                          <FastImage source={{ uri: img }} style={styles.image} />
                          <Pressable
                            onPress={() => {
                              deleteImage(index);
                              setDelImgType("clicked");
                            }}
                            style={styles.deleteIcon}
                          >
                            <DelImg />
                          </Pressable>
                        </View>
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              )}
            </View>
          )}

          <View style={{ marginHorizontal: 32,flexDirection: "row", gap: 4, alignItems: "center",justifyContent:"center" }}>
            <View
              style={{
                backgroundColor: "#55CD00",
                width: 8,
                height: 8,
                borderRadius: 20,
              }}
            ></View>
            <Text
              className="text-[16px] text-[#55CD00] "
              style={{ fontFamily: "Poppins-Black" }}
            >
              Go Live
            </Text>
          </View>

           <View
                          style={{
                            
                            paddingBottom: 20,
                            paddingHorizontal: 2,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Banner2 width={width - 20} />
                        </View>
        </View>
{/* 
        <Text
          className="text-[16px] mx-[32px] my-[10px] text-[#2e2c43] text-center"
          style={{ fontFamily: "Poppins-Bold" }}
        >
          Describe Your Need
        </Text> */}

        {/* <View
          className="mx-[32px]  h-[127px] bg-[#ffe5c4] rounded-xl "
          style={{
            marginBottom: 20,
            borderWidth: 0.5,
            borderRadius: 16,
            borderColor: "#fb8c00",
          }}
        >
          <TextInput
            multiline
            numberOfLines={6}
            onChangeText={(val) => {
              setQuery(val);
            }}
            value={query}
            placeholder="Type here..."
            placeholderTextColor="#dbcdbb"
            className="w-full h-[127px] overflow-y-scroll px-[20px]  rounded-xl"
            style={{
              padding: 20,
              height: 300,
              flex: 1,
              textAlignVertical: "top",
              fontFamily: "Poppins-Regular",
            }}
          />
        </View> */}

        {/* {requestCategory && suggestions[requestCategory] && (
          <View style={{ paddingHorizontal: 32 }}>
            <Text
              style={{
                fontFamily: "Poppins-Regular",
                paddingVertical: 10,
                fontSize: 14,
              }}
            >
              Suggestions
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {suggestions[requestCategory].map((categ, index) => (
                <TouchableOpacity
                  onPress={() => {
                    setQuery(categ);
                  }}
                  key={index}
                  style={{
                    borderWidth: 1,
                    borderRadius: 16,
                    borderColor: "#fb8c00",
                    backgroundColor: "#ffe5c4",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Poppins-Regular",
                      fontSize: 14,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      color: "#fb8c00",
                    }}
                  >
                    {categ}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )} */}

        <View
          className=" mt-[15px] mb-[100px] mx-[32px] flex justify-center items-center"
          style={{ fontFamily: "Poppins-Medium" }}
        >
          {
            <View className="flex flex-col justify-center items-center">
              <Text
                style={{
                  fontFamily: "Poppins-Medium",
                  fontSize: 14,
                  color: "#2e2c43",
                }}
              >
                Estimated Price
              </Text>
              <Text
                style={{
                  fontFamily: "Poppins-Bold",
                  fontSize: 24,
                  color: "#558b2f",
                }}
              >
                {estimatedPrice == 0 ? "Na" : `${estimatedPrice} Rs`}
              </Text>
            </View>
          }
          <View className="relative  w-full flex justify-center items-center">
            <Text
              className="w-full text-center text-[14px] text-[#2e2c43] mx-[6px] mt-[10px]"
              style={{ fontFamily: "Poppins-Medium" }}
            >
              Your Offered Price
            </Text>
            <TouchableOpacity
              onPress={() => {
                setExpectedPriceModal(!expectedPriceModal);
              }}
              style={{
                width: 25,
                height: 25,
                position: "absolute",
                right: 0,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                borderColor: "red",
                borderWidth: 2,
                borderRadius: 16,
                zIndex: 100,
              }}
            >
              <Text
                style={{
                  color: "red",
                  fontSize: 16,
                  fontFamily: "Poppins-SemiBold",
                }}
              >
                ?
              </Text>
            </TouchableOpacity>
          </View>

          <View
            className="w-full mx-[32px]  h-[54px] bg-[#ffe5c4] rounded-xl mt-[10px] "
            style={{
              borderWidth: 0.5,
              borderRadius: 16,
              borderColor: "#fb8c00",
            }}
          >
            <TextInput
              placeholder="Ex:1,200 Rs"
              value={price}
              onChangeText={(val) => {
                // console.log(expectedPrice);
                setPrice(val);
              }}
              keyboardType="numeric"
              placeholderTextColor={"#558b2f"}
              className="w-full text-center overflow-y-scroll px-[20px]  rounded-xl"
              style={{
                paddingHorizontal: 20,
                height: 54,
                flex: 1,
                color: "#558b2f",
                fontFamily: "Poppins-SemiBold",
              }}
            />
          </View>
        </View>

        {isVisible &&  (
          <SuccessPopupNew isVisible={isVisible} setIsVisible={setIsVisible} />
        )}

        <Modal visible={expectedPriceModal} transparent={true}>
          <TouchableOpacity
            onPress={() => {
              setExpectedPriceModal(false);
            }}
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.5)",
            }}
          >
            <ExpectedModal width={"90%"} />
          </TouchableOpacity>
        </Modal>
      </ScrollView>
      {addMore && (
        <View
          style={{ flex: 1 }}
          className="absolute  left-0 right-0 bottom-0 z-50 h-screen shadow-2xl"
        >
          <TouchableOpacity
            onPress={() => {
              setAddMore(false);
            }}
          >
            <View
              className="h-full w-screen "
              style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            ></View>
          </TouchableOpacity>
          <View className="bg-white absolute bottom-0 left-0 right-0 ">
            <TouchableOpacity
              onPress={() => {
                pickImage();
                setAddMore(false);
              }}
            >
              <View className="items-center flex-row justify-between pl-[15px] pr-[30px] mx-[20px] py-[30px]  border-b-[1px] border-gray-400">
                <Text style={{ fontFamily: "Poppins-Regular" }}>
                  Upload Image
                </Text>
                <RightArrow />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                takePicture();
                setAddMore(false);
              }}
            >
              <View className="items-center flex-row justify-between pl-[15px] pr-[30px] mx-[20px] py-[30px]">
                <Text style={{ fontFamily: "Poppins-Regular" }}>
                  Click Image
                </Text>
                <RightArrow />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Modal transparent visible={!!selectedImage} onRequestClose={handleClose}>
        <Pressable
          onPress={() => {
            handleClose();
          }}
          style={styles.modalContainer}
        >
          <Animated.View
            style={[
              {
                transform: [{ scale: scaleAnimation }],
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          >
            <Pressable
              onPress={() => {
                handleClose();
              }}
            >
              <FastImage
                source={{ uri: selectedImage }}
                style={[
                  styles.modalImage,
                  // {
                  //     transform: [{ scale: scaleAnimation }],
                  // },
                ]}
              />
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>

       {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#fb8c00" />
              </View>
            )}

      <ModalCancel
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        index={imgIndex}
        delImgType={delImgType}
      />
      <TouchableOpacity
        disabled={!requestDetail || loading || !price}
        onPress={() => {
          
          handleSubmit();
          // navigation.navigate("requestpreview");
        }}
        style={{
          position: "absolute",
          flexDirection:"row",
          gap:20,
          bottom: 0,
          left: 0,
          right: 0,
          height: 68,
          width: "100%",
          backgroundColor: !requestDetail || !price ? "#e6e6e6" : "#FB8C00",
          justifyContent: "center", // Center content vertically
          alignItems: "center", // Center content horizontally
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontFamily: "Poppins-BlackItalic",
            color: !requestDetail || !price ? "#888888" : "white",
          }}
        >
          Send your offer
        </Text>
        {
                      !price || !requestDetail ? ( <GreyArrow width={20} height={20}/>):(<WhiteArrow width={20} height={20} />)
                    }
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginHorizontal: 30,
    gap: 5,
    marginTop: 10,
  },
  imageWrapper: {
    margin: 5,
    borderRadius: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "gray",
  },
  image: {
    width: 168,
    height: 232,
    borderRadius: 10,
  },
  // deleteIc: {
  //   position: 'absolute',
  //   top: 5,
  //   right: 5,
  // },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalImage: {
    width: 300,
    height: 400,
    borderRadius: 10,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
  },
  deleteIcon: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "white",
    borderRadius: 50,
    padding: 2,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});
export default DefineRequest;
