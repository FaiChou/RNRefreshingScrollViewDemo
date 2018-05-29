import React, { Component } from 'react';
import {
  Text,
  View,
  Platform,
  StyleSheet,
} from 'react-native';
import RefreshableScrollView from './RefreshableScrollView';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

export default class App extends Component {
  _onRefresh = (endRefresh) => {
    setTimeout(endRefresh, 5000);
  }
  render() {
    return (
      <RefreshableScrollView
        onRefresh={this._onRefresh}
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.welcome}>
          Welcome to React Native!
        </Text>
        <Text style={styles.instructions}>
          To get started, edit App.js
        </Text>
        <Text style={styles.instructions}>
          {instructions}
        </Text>
      </RefreshableScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  content: {
    marginTop: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
