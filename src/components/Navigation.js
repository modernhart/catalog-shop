import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { BottomNavigation } from 'react-native-paper';
import Search from './Search';
import ShoppingList from './ShoppingList';
import Favorite from './Favorite';
import OptionView from './OptionView';

export default class Navigation extends Component {

    constructor(props) {
        super(props);
        this.state = {
            index: 0,
            routes: [
                { key: 'like', title: '관심목록', icon: 'heart'},
                { key: 'search', title: '검색', icon: 'feature-search-outline'},
                { key: 'basket', title: '장바구니', icon: 'cupcake'},
                { key: 'option', title: 'ME', icon: 'face'},
            ],
                
        };
    }

    componentDidMount() {
        if (this.props.data) {
			const data = JSON.parse(this.props.data);
			this.setState({
				index : data.refresh
			})
		}
    }

    _handleIndexChange = index => this.setState({ index });

	_renderScene = BottomNavigation.SceneMap({
        like : Favorite,
        search : Search,
        basket : ShoppingList,
        option : OptionView
	});

    render() {
        return (
            <BottomNavigation
                navigationState={this.state}
                onIndexChange={this._handleIndexChange}
                renderScene={this._renderScene}
                shifting={true}
                barStyle={styles.barStyle}
                //onTabPress={(e) => console.log(1)}
            />
        )
    }
}


const styles = StyleSheet.create({
    center : {
        flex : 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    barStyle : {
		backgroundColor : '#ffffff'
	},
})