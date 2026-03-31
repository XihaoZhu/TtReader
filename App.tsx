// /src/App.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BookListScreen from "./screens/BookListScreen";
import BookReaderScreen from "./screens/BookReaderScreen";

export type RootStackParamList = {
  BookList: undefined;
  BookReader: { filePath: string; title: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="BookList">
        <Stack.Screen
          name="BookList"
          component={BookListScreen}
          options={{ title: "My Books" }}
        />
        <Stack.Screen
          name="BookReader"
          component={BookReaderScreen}
          options={{ title: "Reader" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}