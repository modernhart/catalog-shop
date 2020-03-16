import React, { Component, Fragment } from 'react';
import { View, StyleSheet, Text, Image, ActivityIndicator, TouchableOpacity, Linking, TouchableWithoutFeedback, TouchableHighlight, RefreshControl, TextInput, BackHandler, FlatList, Dimensions } from 'react-native';
import firebase from "react-native-firebase";
import { GoogleSignin } from '@react-native-community/google-signin';
import Toast from 'react-native-simple-toast'
import HTML from 'react-native-render-html';
import Icon from 'react-native-vector-icons/Ionicons';
import { Actions } from 'react-native-router-flux';

function wait(timeout) {
    return new Promise(resolve => {
        setTimeout(resolve, timeout);
    });
}

export default class Favorite extends Component {

    constructor(props) {
        super(props);
        this.state = {
            uid : null,
            data : [],
            loading : true,
            showMore : false,
            refresh : false,
            like : []
        }
    }

    componentDidMount() {
        /* 추후 파이어베이스 적용 */
        //const userInfo = await GoogleSignin.getCurrentUser(); 

        /* 네이버 쇼핑 샘플 API*/
        //const url = 'https://openapi.naver.com/v1/search/shop.json?query=%EC%A3%BC%EC%8B%9D&display=10&start=1&sort=sim'
        this.getUser();
        //this.getSearchData('의류', this.state.start);

        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    }

    handleBackButton = () => {
		BackHandler.exitApp();
	   	return true;
    }
    
    componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
	}

    async getUser(){
        const userInfo = await GoogleSignin.getCurrentUser(); 
        if (userInfo) {
            this.setState({
                uid : userInfo.user.id,
            }, () => {
                this.getLikeData();
            });
        }
    }

    _onRefresh = () => {
        this.setState({refresh: true});
        wait(1000).then(() => {
            this.getSearchData(this.state.search, 1);
            this.setState({
                refresh: false
            })
        })
    }

    async getMoreData(text, start) {
        const search = (!text) ? '의류' : text;

        const data = await fetch(`https://openapi.naver.com/v1/search/shop.json?query=${encodeURI(search)}&display=10&start=${start}`,
        {
            method: 'GET',
            headers: {
                "X-Naver-Client-Id" : "NKPpRTtA4tudmEH2Apa9",
                "X-Naver-Client-Secret" : "UbEycr2vfh"
            }
        });
        const res = await data.json();
        if (res) {
            this.setState({
                data : [...this.state.data, ...res.items],
                showMore : false
            })
        }
    }

    closeToBottom({layoutMeasurement, contentOffset, contentSize}) {
        const bottom = layoutMeasurement.height + contentOffset.y >= contentSize.height;
       //{(showMore) ? <ActivityIndicator /> : null}
        const {search, showMore} = this.state;
        
        if (bottom) {
            this.setState({
                start : this.state.start + 10,
                showMore: true
            }, () => {
                this.getMoreData(search, this.state.start);
            });
        }
    }

    _onRefresh = () => {
        this.setState({refresh: true});
        wait(1000).then(() => {
            this.getLikeData();
            this.setState({
                refresh: false
            })
        })
    }

    onLikeAction = (value, like) => {
        const {uid} = this.state;
        const items = {
            shopId : value.productId
        }

        if (like) {
            firebase.database().ref('/like/' + uid).push(items, (err) => {
                if (err) {
                    console.log(err)
                } else {
                    this.getLikeData(uid)
                }
            })
        } else {
            firebase.database().ref('/like/' + uid + '/' + value).update({
                shopId : null
            }, () => {
                this.getLikeData(uid)
            });
        }
    }

    async getLikeData() {
        let allData = [];
        firebase.database().ref('/like').once('value', (snapshot) => {
            snapshot.forEach((childSnapshot) => {
                const shopObject = childSnapshot.val();
                Object.keys(shopObject).map(key => {
                    allData = [...allData, shopObject[key]];
                });
            });

            this.setState({
                data : allData,
                loading : false
            })
        });
    }

    render() {
        const {data, loading, search, start, like} = this.state;
        console.log(this.state.uid)
        return (
            <View style={{flex : 1, alignItems: 'center', backgroundColor: '#fff'}}>
                {(loading) ? (
                    <View style={styles.center}>
                        <ActivityIndicator />
                    </View>) : (
                    <FlatList
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refresh}
                                onRefresh={this._onRefresh}
                            />
                        }    
                        data={data}
                        contentContainerStyle={{alignItems: 'center'}}
                        style={{width: '100%', margin: 10}}
                        numColumns={3}
                        keyExtractor={(item, index) => item.shopId}
                        renderItem={({item}) => (
                            <TouchableOpacity onPress={() => Actions.detailItem({val : item})}>
                                <Image 
                                    key={item.shopId}
                                    style={{
                                        width: (Dimensions.get('window').width / 3) - 15, 
                                        height: (Dimensions.get('window').width / 3) - 15, 
                                        margin: 5, 
                                        justifyContent: 'center', 
                                        alignItems: 'center'
                                    }} 
                                    source={{uri: item.image}} />
                            </TouchableOpacity>
                        )}
                    />
                )}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    center : {
        flex : 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor : '#fff'
    }
})