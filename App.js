/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import { Stack, Router, Scene, Modal } from 'react-native-router-flux';
import GoogleLogin from './src/components/GoogleLogin';
import Search from './src/components/Search';
import Navigation from './src/components/Navigation';
import ShoppingList from './src/components/ShoppingList';
import Detail from './src/components/Detail';
import Favorite from './src/components/Favorite';
import Tutorial from './src/components/Tutorial';

const App = () => {
  return (
    <>
      <Router>
        <Stack key="root" hideNavBar>
          <Stack key="login" hideNavBar initial >
              <Scene key="register" component={GoogleLogin} />
          </Stack>
          <Stack key="home" hideNavBar >
              <Scene key="main" component={Navigation} />
          </Stack>
          <Stack key="detailItem" headerLayoutPreset="center" back duration={0} titleStyle={{ alignSelf: 'center' }}>
              <Scene key="detailItem" component={Detail} title="상품 상세" panHandlers={null}  />
          </Stack>
          <Stack key="tutorial" headerLayoutPreset="center" duration={0} titleStyle={{ alignSelf: 'center' }}>
              <Scene key="tutorialItem" component={Tutorial} hideNavBar panHandlers={null}  />
          </Stack>
        </Stack>
      </Router>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});

export default App;
