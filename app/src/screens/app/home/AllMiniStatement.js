import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";

import MiniStatement from "../../../components/MiniStatement";

const AllMiniStatement = () => {
  const navigation = useNavigation();
  return (
    <ScrollView>
      <MiniStatement navigation={navigation} limit={50} header={false} />
    </ScrollView>
  );
};

export default AllMiniStatement;
