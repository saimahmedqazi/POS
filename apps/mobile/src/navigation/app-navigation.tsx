import React from 'react';

import {
  NavigationContainer,
  DefaultTheme,
} from '@react-navigation/native';

import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack';

import ProductsScreen from '../screens/products-screen';

import CartScreen from '../screens/cart-screen';

import OrdersScreen from '../screens/orders-screen';
import OrderConfirmationScreen from '../screens/order-confirmation-screen';

export type RootStackParamList = {
  Products: undefined;
  Cart: undefined;
  Orders: undefined;
  OrderConfirmation: { orderId: string; total: number; itemCount: number };
};

const Stack =
  createNativeStackNavigator<RootStackParamList>();

const screenOptions: NativeStackNavigationOptions =
  {
    headerShadowVisible: false,

    headerTitleStyle: {
      fontWeight: '700',
      color: '#f8fafc',
    },

    headerStyle: {
      backgroundColor: '#0f172a',
    },
    
    headerTintColor: '#f8fafc',

    contentStyle: {
      backgroundColor: '#020617',
    },

    animation: 'slide_from_right',
  };

const navigationTheme = {
  ...DefaultTheme,

  colors: {
    ...DefaultTheme.colors,
    background: '#020617',
    card: '#0f172a',
    text: '#f8fafc',
    border: 'rgba(255,255,255,0.05)',
  },
};

export default function AppNavigation() {
  return (
    <NavigationContainer
      theme={navigationTheme}
    >
      <Stack.Navigator
        screenOptions={
          screenOptions
        }
      >
        <Stack.Screen
          name="Products"
          component={
            ProductsScreen
          }
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="Cart"
          component={
            CartScreen
          }
          options={{
            title:
              'Shopping Cart',
          }}
        />
        <Stack.Screen
  name="Orders"
  component={OrdersScreen}
  options={{
    title: 'My Orders',
  }}
/>

        <Stack.Screen
          name="OrderConfirmation"
          component={OrderConfirmationScreen}
          options={{
            title: 'Order Confirmed',
            headerBackVisible: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}