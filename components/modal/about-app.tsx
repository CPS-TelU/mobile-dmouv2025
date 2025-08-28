import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Linking,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import FullLogo from "../../assets/images/fulldmouv.svg";
import { Colors } from "../../constants/Colors";

type AboutAppModalProps = {
  visible: boolean;
  onClose: () => void;
};

const AboutAppModal: React.FC<AboutAppModalProps> = ({ visible, onClose }) => {
  const instagramUrl =
    "https://www.instagram.com/cpslaboratory?igsh=MXBobDF3YWZ0aTk4NQ==";

  const handleInstagramPress = () => {
    Linking.openURL(instagramUrl).catch((err) =>
      console.error("An error occurred", err)
    );
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/60">
        <View className="bg-white rounded-2xl p-6 w-[85%] max-w-[350px] items-center shadow-lg shadow-black/25">
          {/* Logo Aplikasi */}
          <FullLogo width={180} height={60} className="mt-4 mb-4 h-[50px]" />

          {/* Judul & Deskripsi */}
          <Text className="font-poppins-bold text-2xl text-primary mb-3 text-center">
            About D&apos;Mouv
          </Text>

          <Text className="font-roboto-regular text-[15px] text-textLight text-center leading-6 mb-2.5 px-1">
            D&apos;Mouv is your smart solution for efficient energy use. With
            advanced smart detection technology, our app automatically senses
            when people are in a room.
          </Text>

          <Text className="font-roboto-regular text-[15px] text-textLight text-center leading-6 mb-2.5 px-1">
            Our system intuitively turns lights on when a room is occupied and
            switches them off when it&apos;s empty. This smart automation helps
            you save energy effortlessly, leading to real savings on your
            electricity bills.
          </Text>

          {/* Bagian Help Center */}
          <View className="border-t border-b border-border w-full items-center py-4 my-4">
            <Text className="font-poppins-semibold text-base text-text mb-2.5">
              Help Center
            </Text>
            <TouchableOpacity
              className="flex-row items-center bg-gray-100 py-2 px-4 rounded-xl"
              onPress={handleInstagramPress}
            >
              <Ionicons
                name="logo-instagram"
                size={22}
                color={Colors.text}
                className="mr-2"
              />
              <Text className="font-roboto-medium text-sm text-text">
                @cpslaboratory
              </Text>
            </TouchableOpacity>
          </View>

          {/* Informasi Hukum dan Hak Cipta */}
          <View className="items-center mt-2.5">
            <Text className="font-roboto-regular text-xs text-textLight text-center mb-1">
              © 2025 D&apos;Mouv. All rights reserved.
            </Text>
            <TouchableOpacity onPress={() => Linking.openURL("#")}>
              <Text className="font-roboto-medium text-[10px] text-primary underline my-0.5 text-center">
                Terms of Service{"\n"}Privacy Policy
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tombol Tutup Utama */}
          <TouchableOpacity
            className="bg-primary py-4 rounded-2xl w-full items-center mt-5"
            onPress={onClose}
          >
            <Text className="text-white text-lg font-poppins-semibold">
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AboutAppModal;
