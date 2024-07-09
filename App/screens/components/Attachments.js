import { View, Text, TouchableOpacity, TouchableWithoutFeedback, Dimensions } from 'react-native'
import React, { useState } from 'react';
import StoreLocation from '../../assets/StoreLocation.svg';
import Document from '../../assets/Documents.svg';
import NewBid from '../../assets/NewBid.svg';
import Camera from '../../assets/Camera.svg';
import Gallery from '../../assets/Gallerys.svg';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { socket } from '../../utils/scoket.io/socket';
import { formatDateTime } from '../../utils/logics/Logics';
import { setCurrentSpadeRetailer, setCurrentSpadeRetailers } from '../../redux/reducers/userDataSlice';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';

const Attachments = ({ setAttachmentScreen, setCameraScreen, messages, setMessages }) => {

    const currentSpadeRetailer = useSelector(store => store.user.currentSpadeRetailer);
    const currentSpadeRetailers = useSelector(store => store.user.currentSpadeRetailers);
    const currentSpade = useSelector((store) => store.user.currentSpade);
    const navigation = useNavigation();
    const [imageUri, setImageUri] = useState("");
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);


    const sendAttachment = async () => {
        // console.log('res', query, imageUri);
        setLoading(true)
        const token = await axios.get('http://173.212.193.109:5000/retailer/unique-token', {
            params: {
                id: details.retailerId._id,
            }
        });

        const formData = new FormData();
        // imageUri.forEach((uri, index) => {
        formData.append('bidImages', {
            uri: uri.uri,  // Correctly use the URI property from ImagePicker result
            type: 'image/jpeg', // Adjust this based on the image type
            name: `photo-${Date.now()}.jpg`,
        });        // });

        formData.append('sender', JSON.stringify({ type: 'UserRequest', refId: details.requestId }));
        formData.append('userRequest', currentSpade._id);
        formData.append('message', query);
        formData.append('bidType', "false");
        formData.append('chat', details._id);

        // await axios.post('http://173.212.193.109:5000/chat/send-message', {
        //     sender: {
        //         type: 'UserRequest',
        //         refId: details.requestId,
        //     },
        //     userRequest: currentSpade._id,
        //     message: query,
        //     bidType: "false",
        //     bidImages: [imageUri],
        //     chat: details._id,
        // })
        await axios.post('http://192.168.51.192:5000/chat/send-message', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
            .then(res => {
                console.log(res);
                const data = formatDateTime(res.data.createdAt);
                res.data.createdAt = data.formattedTime;

                //updating messages
                setMessages([...messages, res.data]);

                //updating chat latest message
                setLoading(false);
                const updateChat = { ...currentSpadeRetailer, unreadCount: 0, latestMessage: { _id: res.data._id, message: res.data.message, bidType: "false", sender: { type: 'UserRequest', refId: currentSpade._id } } };
                const updatedRetailers = [updateChat, ...currentSpadeRetailers.filter(c => c._id !== updateChat._id)];
                dispatch(setCurrentSpadeRetailers(updatedRetailers));
                dispatch(setCurrentSpadeRetailer(updateChat));

                socket.emit("new message", res.data);
                navigation.navigate('bargain');
            })
            .catch(err => {
                setLoading(false);

                console.log(err);
            })

    }

    // const getImageUrl = async (image) => {


    //     let CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/kumarvivek/image/upload';

    //     let base64Img = `data:image/jpg;base64,${image.base64}`;

    //     let data = {
    //         "file": base64Img,
    //         "upload_preset": "CulturTap",
    //     }

    //     // console.log('base64', data);
    //     fetch(CLOUDINARY_URL, {
    //         body: JSON.stringify(data),
    //         headers: {
    //             'content-type': 'application/json'
    //         },
    //         method: 'POST',
    //     }).then(async r => {
    //         let data = await r.json()

    //         // setPhoto(data.url);
    //         const imgUri = data.secure_url;
    //         if (imgUri) {

    //             setImageUri(imgUri);
    //             sendAttachment;
    //         }
    //         console.log('dataImg', data.secure_url);
    //         // return data.secure_url;
    //     }).catch(err => console.log(err));

    // };

    const pickImage = async () => {
        console.log("object", "hii");
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            base64: true,
            quality: 1,
        });

        // console.log('pickImage', "result");
        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
            console.log('attachment image file', result.assets[0].uri);
            // console.log(object)
            // await getImageUrl(result.assets[0]);

        }
    };

    const { height } = Dimensions.get('window');

    return (
        // <View style={{ zIndex: 100, flex: 1 }} className="flex flex-col  absolute top-0 bottom-0 left-0 right-0  z-50 h-screen">
        //     <TouchableOpacity onPress={() => { setAttachmentScreen(false) }}>
        //         <View className=" w-screen  bg-transparent" >
        //         </View>
        //     </TouchableOpacity>
        //     <View className="bg-white  py-[20px]  gap-5 absolute bottom-0 left-0 right-0 ">
        //         <View className="flex-row justify-evenly">
        //             <View className="items-center">
        //                 <Document />
        //                 <Text style={{ fontFamily: "Poppins-Regular" }}>Document</Text>
        //             </View>
        //             {/* <View className="items-center">
        //                 <NewBid />
        //                 <Text style={{ fontFamily: "Poppins-Regular" }}>New Bid</Text>
        //             </View> */}
        //             <View className="items-center">
        //                 <StoreLocation />
        //                 <Text style={{ fontFamily: "Poppins-Regular" }}>Location</Text>
        //             </View>
        //             <TouchableOpacity onPress={() => { navigation.navigate('camera', { openCamera: true, messages, setMessages }) }}>
        //                 <View className="items-center">
        //                     <Camera />
        //                     <Text style={{ fontFamily: "Poppins-Regular" }}>Camera</Text>
        //                 </View>
        //             </TouchableOpacity>
        //             <TouchableOpacity onPress={() => { navigation.navigate('camera', { openCamera: false, messages, setMessages }) }}>
        //                 <View className="items-center">
        //                     <Gallery />
        //                     <Text style={{ fontFamily: "Poppins-Regular" }}>Gallery</Text>
        //                 </View>
        //             </TouchableOpacity>
        //         </View>
        //         {/* <View className="flex-row justify-evenly">


        //         </View> */}
        //     </View>
        // </View>

        <View style={{ flex: 1 }} >
            {/* <TouchableOpacity onPress={() => setAttachmentScreen(false)}>
                <View className="w-screen bg-transparent flex-1" />
            </TouchableOpacity> */}
            <TouchableOpacity onPress={() => { setAttachmentScreen(false) }}>
                <View className="h-full w-screen " style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}  >
                </View>
            </TouchableOpacity>
            <View style={{ zIndex: 100, position: 'absolute', backgroundColor: 'white', bottom: 165, left: 0, right: 0 }}>
                <View className="flex-row justify-evenly py-[20px]">
                    <View className="items-center">
                        <Document />
                        <Text style={{ fontFamily: 'Poppins-Regular' }}>Document</Text>
                    </View>
                    <View className="items-center">
                        <StoreLocation />
                        <Text style={{ fontFamily: 'Poppins-Regular' }}>Location</Text>
                    </View>
                    <TouchableOpacity onPress={() => { navigation.navigate('camera', { openCamera: true, messages, setMessages }); setAttachmentScreen(false) }}>
                        <View className="items-center">
                            <Camera />
                            <Text style={{ fontFamily: 'Poppins-Regular' }}>Camera</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { navigation.navigate('camera', { openCamera: false, messages, setMessages }); setAttachmentScreen(false) }}>
                        <View className="items-center">
                            <Gallery />
                            <Text style={{ fontFamily: 'Poppins-Regular' }}>Gallery</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

const styles = {
    attachments: {
        flex: 1,
        zIndex: 100, // Ensure the overlay is on top
    },
};
export default Attachments