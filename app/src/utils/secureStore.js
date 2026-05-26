import * as SecureStore from "expo-secure-store";

export const save = async (key, value) => {
  try {
    await SecureStore.setItemAsync(key, value);
    // console.log(`Saved ${key}`);
  } catch (error) {
    console.error("SecureStore save error:", error);
  }
};

export const getValueFor = async (key) => {
  try {
    const value = await SecureStore.getItemAsync(key);
    // console.log(`Retrieved ${key}:`, value);
    return value;
  } catch (error) {
    console.error("SecureStore get error:", error);
  }
};

export const remove = async (key) => {
  await SecureStore.deleteItemAsync(key);
};
