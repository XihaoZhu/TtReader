// /src/App.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text } from "react-native";
import BookListScreen from "./screens/BookListScreen";
import BookReaderScreen from "./screens/BookReaderScreen";
import WordListScreen from "./screens/WordListScreen";
import Ionicons from '@expo/vector-icons/Ionicons';


export type RootStackParamList = {
  BookList: undefined;
  BookReader: { filePath: string; title: string };
  WordList: undefined;
};


const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function BooksStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="BookList"
        component={BookListScreen}
        options={{ title: "My Books" }}
      />
      <Stack.Screen
        name="BookReader"
        component={BookReaderScreen}
        options={({ route }) => ({
          title: "reader",
          headerShown: true,
          tabBarStyle: { display: 'none' },
        })}
      />
    </Stack.Navigator>
  );
}

function SettingsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Settings (Coming Soon)</Text>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color, size }) => {
            let iconName: "book" | "list" | "settings" = (route.name === "Books") ? "book" : (route.name === "Words") ? "list" : "settings";

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen
          name="Books"
          component={BooksStack}
        />
        <Tab.Screen
          name="Words"
          component={WordListScreen}
          options={({ route }) => ({
            title: "Words collected",
            headerShown: true,
          })}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
        />
      </Tab.Navigator>
    </NavigationContainer >
  );
}