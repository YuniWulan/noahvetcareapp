import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons,Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Auth Screens
import { LoginScreen } from './services/Screens/LoginScreen';
import { RegisterScreen } from './services/Screens/RegisterScreen';
import { ForgotPasswordScreen } from './services/Screens/ForgotPasswordScreen';
import { OtpVerificationScreen } from './services/Screens/OtpVerificationScreen';
import { ResetPasswordScreen } from './services/Screens/ResetPasswordScreen';

// Customer/Doctor Home
import CustomerHomeScreen from './services/Screens/CustomerHomeScreen';
import DoctorHomeScreen from './services/Screens/DoctorHomeScreen';
import DoctorReservations from './services/Screens/DoctorReservasiList';
import DoctorProfiles from './services/Screens/DoctorProfile';

// Feature Screens
import ReservasiScreen from './services/Screens/ReservasiScreen';
import ReservationListScreen from './services/Screens/ReservationListScreen';
import TransactionScreen from './services/Screens/TransactionScreen';
import ReservationSuccessScreen from './services/Screens/ReservationSuccessScreen';
import ProfileScreen from './services/Screens/ProfileScreen';
import EditProfileScreen from './services/Screens/EditProfilScreen';
import ChangePasswordScreen from './services/Screens/ChangePasswordScreen';
import AddPetScreen from './services/Screens/AddPetScreen';
import DetailPetScreen from './services/Screens/DetailPetScreen';
import DetailReservation from './services/Screens/DetailReservation';
import ViewDoctorProfile from './services/Screens/ViewDoctorProfile';

// Define Tab Params for Customer
export type MainTabParamList = {
  Home: undefined;
  ReservationList: undefined;
  Transaction: undefined;
  Profile: undefined;
};

// Define Tab Params for Doctor
export type DoctorTabParamList = {
  DoctorHome: undefined;
  DoctorReservations: undefined;
  DoctorProfiles: undefined;
};

export type DoctorData = {
  id?: string | number; 
  username: string;
  email?: string;
  name?: string;
  full_name?: string;
  user_id?: string | number; 
  _id?: string;
  specialization?: string;
  license_number?: string;
  phone?: string | null;
  experience?: string;
  education?: string;
  about?: string;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const DoctorTab = createBottomTabNavigator<DoctorTabParamList>();

// Customer Tabs
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#9E9E9E',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={CustomerHomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ReservationList"
        component={ReservationListScreen}
        options={{
          tabBarLabel: 'Reservation',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="calendar-today" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Transaction"
        component={TransactionScreen}
        options={{
          tabBarLabel: 'Transaction',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="receipt" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="account-circle" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Doctor Tabs
function DoctorTabs() {
  return (
    <DoctorTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#9E9E9E',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
        },
      }}
    >
      <DoctorTab.Screen
        name="DoctorHome"
        component={DoctorHomeScreen}
        options={{
          tabBarLabel: 'Beranda',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <DoctorTab.Screen
        name="DoctorReservations"
        component={DoctorReservations}
        options={{
          tabBarLabel: 'Reservasi',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="calendar-today" size={size} color={color} />
          ),
        }}
      />
      <DoctorTab.Screen
        name="DoctorProfiles"
        component={DoctorProfiles}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="account-circle" size={size} color={color} />
          ),
        }}
      />
    </DoctorTab.Navigator>
  );
}

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  OtpVerification: { email: string };
  ResetPassword: undefined;
  CustomerHome: undefined;
  DoctorHome: undefined;
  MainTabs: undefined;
  DoctorTabs: undefined;
  DoctorReservations: undefined;
  DoctorProfiles: undefined;
  ViewDoctorProfile: { doctorData: DoctorData };
  Reservasi: { selectedDoctor?: DoctorData } | undefined;
  AddPetScreen: undefined;
  DetailPetScreen: { 
    petId: string | number; 
    petName?: string; 
    fromAddPet?: boolean;
    petData?: any; 
  };
  DetailReservation: {  
    reservationId: string | number;
    petName?: string;
    fromReservasi?: boolean;
    reservationData?: any;
  };
  ReservationList?: {
    newReservation?: {
      id: string;
      petName: string | undefined;
      gender: string;
      date: string;
      time: string;
      status: string;
      image: any;
    };
    shouldRefresh?: boolean;
  };
  Transaction: undefined;
  ReservationSuccess: { appointmentId: number };
  Profile: { refresh?: boolean } | undefined;
  EditProfile: undefined;
  ChangePassword: undefined; 
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerTitleAlign: 'center' }}>
          {/* Auth Screens */}
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
          <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ headerShown: false }} />

          {/* Main Navigation */}
          <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="DoctorTabs" component={DoctorTabs} options={{ headerShown: false }} />

          {/* Feature Screens - Customer */}
          <Stack.Screen name="Reservasi" component={ReservasiScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ReservationList" component={ReservationListScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Transaction" component={TransactionScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ReservationSuccess" component={ReservationSuccessScreen} options={{ headerShown: false }} />
          
          {/* Profile & Settings Screens - Shared */}
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: false }} />
          
          {/* Pet Management Screens - Customer */}
          <Stack.Screen name="AddPetScreen" component={AddPetScreen} options={{ headerShown: false }} />
          <Stack.Screen name="DetailPetScreen" component={DetailPetScreen} options={{headerShown: false}}/>
          
          {/* Reservation Detail - Shared between Customer & Doctor */}
          <Stack.Screen name="DetailReservation" component={DetailReservation} options={{headerShown: false}}/>
          
          {/* Doctor Specific Screens */}
          <Stack.Screen name="DoctorReservations" component={DoctorReservations} options={{ headerShown: false }} />
          <Stack.Screen name="DoctorProfiles" component={DoctorProfiles} options={{ headerShown: false }} />
         <Stack.Screen name="ViewDoctorProfile" component={ViewDoctorProfile} options={{ headerShown: false }} />

        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
} 