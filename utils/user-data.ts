import { ImageSourcePropType } from 'react-native';

/**
 * Interface untuk struktur data pengguna.
 * Catatan: Password TIDAK PERNAH disimpan di sini karena alasan keamanan.
 */
export interface User {
  id: string; 
  name: string;
  email: string;
  profilePictureUri: string | ImageSourcePropType;
  role: 'super_user' | 'regular_user';
}

export const defaultUser: User = {
  id: 'guest',
  name: "Guest User",
  email: "guest@example.com",
  profilePictureUri: require("../assets/images/pp.svg"), 
  role: "regular_user",
};

export const ASYNC_STORAGE_KEYS = {
  USER_TOKEN: 'userToken',
  USER_DATA: 'userData',
  MOCK_USERS: 'mockUsers',
  JUST_LOGGED_OUT: 'justLoggedOut',
};
