import React from 'react';
import { StyleSheet, BackHandler, Dimensions } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import { Actions } from 'react-native-router-flux';
 
const styles = StyleSheet.create({
    image: {
        width: Dimensions.get('window').width - 100,
        height: 300,
    },
    image2 : {
        width: Dimensions.get('window').width - 80,
        height: 190,
    }
});
 
const slides = [
  {
    key: 'somethun',
    title: '관심 목록',
    text: '사람들이 좋아하는 아이템을 보거나 \n 바구니에 담을 수 있습니다. 아이템에 대한 관련 영상을 확인해보세요.',
    image : require('../favorite.jpg'),
    imageStyle: styles.image,
    styles: {padding: 0},
    backgroundColor: '#59b2ab',
  },
  {
    key: 'somethun-dos',
    title: '장바구니',
    text: '구매를 하고 싶은 아이템을 담아 관리합니다.\n 다양한 아이템을 검색하고, 구매를 해야하거나 이미 구매를 한 아이템을 공유해 보세요.',
    image : require('../shoplist.jpg'),
    imageStyle: styles.image2,
    backgroundColor: '#7b2191',
  },
  {
    key: 'somethun1',
    title: '소비 성향',
    text: '현재 구매 아이템의 성향을 파악할 수 있습니다. \n 어떤 종류의 아이템을 선호하는지 수치로 확인해볼 수 있습니다.',
    image : require('../tendency.jpg'),
    imageStyle: styles.image2,
    backgroundColor: '#2f8a0b',
  }
];
 
export default class Tutorial extends React.Component {
    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    }

    handleBackButton = () => {
		Actions.pop();
	   	return true;
    }
    
    componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
	}

    _onDone = () => {
        Actions.pop();
    }
    render() {
        return (
        <AppIntroSlider
            slides={slides}
            onDone={this._onDone}
        />
        );
    }
}