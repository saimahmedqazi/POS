import {
  NavigationContainer,
} from '@react-navigation/native';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import ProductsScreen from '../screens/products-screen';

import CartScreen from '../screens/cart-screen';

const Stack =
  createNativeStackNavigator();

export default function AppNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Products"
          component={
            ProductsScreen
          }
        />

        <Stack.Screen
          name="Cart"
          component={
            CartScreen
          }
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}