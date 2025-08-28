import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Pressable } from 'react-native';

// Definisikan ulang Colors di sini atau impor dari file konstanta Anda
const Colors = {
  primary: '#0044cc',
  border: '#d9d9d9',
  textLight: '#888',
};

interface CustomSwitchProps {
  value: boolean;
  onValueChange: () => void;
  disabled?: boolean;
}

const CustomSwitch: React.FC<CustomSwitchProps> = ({ value, onValueChange, disabled = false }) => {
  // Logika animasi tetap sama
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 250,
      useNativeDriver: false, // Diperlukan untuk animasi warna
    }).start();
  }, [value, animatedValue]);

  // Interpolasi untuk posisi thumb (knob)
  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 44], // Disesuaikan: w-20 (80) - w-8 (32) - offset (4) = 44
  });

  // Interpolasi untuk warna latar belakang
  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.border, Colors.primary],
  });

  // Style dinamis yang akan tetap menggunakan prop `style`
  const animatedContainerStyle = {
    backgroundColor,
  };

  const animatedThumbStyle = {
    transform: [{ translateX }],
  };

  return (
    <Pressable onPress={onValueChange} disabled={disabled}>
      <Animated.View
        // Style statis diubah menjadi className
        className={`w-20 h-10 rounded-full justify-center ${disabled ? 'opacity-50' : ''}`}
        style={animatedContainerStyle}
      >
        <Animated.View
          // Style statis diubah menjadi className
          className="absolute w-8 h-8 rounded-full bg-white justify-center items-center shadow-md shadow-black"
          style={animatedThumbStyle}
        >
          <Ionicons
            name={value ? 'sunny' : 'moon'}
            size={18}
            color={value ? Colors.primary : Colors.textLight}
          />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

export default CustomSwitch;
