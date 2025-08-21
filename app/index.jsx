import { View, Text, StyleSheet } from 'react-native';

const Home =() => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello World123</Text>
    </View>
  )
}

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
