// /src/App.tsx
import React from "react";
import { NavigationContainer, getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import BookListScreen from "./screens/BookListScreen";
import BookReaderScreen from "./screens/BookReaderScreen";
import WordListScreen from "./screens/WordListScreen";
import SettingsScreen from "./screens/SettingsScreen";
import Ionicons from '@expo/vector-icons/Ionicons';
import { ReaderProvider } from "./components/ReaderContext";
import { useReader } from "./components/ReaderContext";
import ReaderOverlay from "./screens/ReaderOverlay";


export type RootStackParamList = {
  BookList: undefined;
  BookReader: { filePath: string; title: string };
  WordList: undefined;
};


const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function BooksStack() {
  return (
    <Stack.Navigator detachInactiveScreens={false}>
      <Stack.Screen
        name="BookList"
        component={BookListScreen}
        options={{ title: "My Books" }}
      />
      <Stack.Screen
        name="BookReader"
        component={BookReaderScreen}
        getId={({ params }) => params.filePath}
        options={{
          title: "reader",
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <ReaderProvider>
      <AppNavigator />
    </ReaderProvider>
  );
}

function AppNavigator() {
  const { reader } = useReader();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: { display: reader.visible ? "none" : "flex" },
          tabBarIcon: ({ color, size }) => {
            let iconName: "book" | "list" | "settings" = (route.name === "Books") ? "book" : (route.name === "Words") ? "list" : "settings";
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen
          name="Books"
          component={BooksStack}
          options={({ route }) => {
            const routeName = getFocusedRouteNameFromRoute(route) ?? "BookList";
            return {
              tabBarStyle: { display: reader.visible || routeName === "BookReader" ? "none" : "flex" },
            };
          }}
        />
          <Tab.Screen
            name="Words"
            component={WordListScreen}
            options={{
              title: "Words collected",
              headerShown: true,
            }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              title: "Settings",
              headerShown: true,
            }}
          />
      </Tab.Navigator>
      <ReaderOverlay />
    </NavigationContainer >
  );
}
