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

export type RootStackParamList = {
  Products: undefined;
  Cart: undefined;
  Orders: undefined;
};

const Stack =
  createNativeStackNavigator<RootStackParamList>();

const screenOptions: NativeStackNavigationOptions =
  {
    headerShadowVisible: false,

    headerTitleStyle: {
      fontWeight: '700',
    },

    headerStyle: {
      backgroundColor: '#fff',
    },

    contentStyle: {
      backgroundColor: '#f9fafb',
    },

    animation: 'slide_from_right',
  };

const navigationTheme = {
  ...DefaultTheme,

  colors: {
    ...DefaultTheme.colors,

    background: '#f9fafb',
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}