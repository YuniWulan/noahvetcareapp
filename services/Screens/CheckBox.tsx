import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from '@expo/vector-icons'; 

interface Props {
  label: string;
  checked: boolean;
  onToggle: () => void;
}

export function CheckBox({ label, checked, onToggle }: Props) {
  return (
    <TouchableOpacity onPress={onToggle} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
      <View style={{
        width: 20,
        height: 20,
        borderWidth: 1,
        borderRadius: 4,
        borderColor: '#007BFF',
        backgroundColor: checked ? '#007BFF' : 'white',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10
      }}>
        {checked && <Ionicons name="checkmark" size={14} color="white" />}
      </View>
      <Text>{label}</Text>
    </TouchableOpacity>
  );
}