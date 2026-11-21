// Hamburger button that opens the side drawer from any nested screen.
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { IconButton } from 'react-native-paper';

export default function MenuButton() {
  const navigation = useNavigation();
  return (
    <IconButton icon="menu" iconColor="#FFFFFF" onPress={() => navigation.dispatch(DrawerActions.openDrawer())} />
  );
}
