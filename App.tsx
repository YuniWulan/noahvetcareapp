import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import HomeScreen from './home';
import ReservationListScreen from './ReservationListScreen';
import ReservasiScreen from './Reservasi';
import TransactionScreen from './transaction';
import ReservationSuccessScreen from './ReservationSuccessScreen';
import Profile from './profile';
import EditProfile from './editprofil';
import ChangePassword from './changePassword';

export type RootStackParamList = {
  MainTabs: undefined;
  Reservasi: undefined;
  ReservationList: undefined;
  Transaction: undefined;
  ReservationSuccess: { appointmentId: number };
  Profile: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  ReservationList: undefined;
  Transaction: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

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
        component={HomeScreen}
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
        component={Profile}
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

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="MainTabs" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Reservasi" component={ReservasiScreen} />
        <Stack.Screen name="Transaction" component={TransactionScreen} />
        <Stack.Screen name="ReservationSuccess" component={ReservationSuccessScreen} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="ChangePassword" component={ChangePassword} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};