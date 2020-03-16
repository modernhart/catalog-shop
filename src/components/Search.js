import React, { Component, Fragment } from 'react';
import { View, StyleSheet, Text, Image, ActivityIndicator, TouchableOpacity, ScrollView, Linking, TouchableHighlight, RefreshControl, TextInput, BackHandler } from 'react-native';
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

function isOnLike(like, productId) {
    let result = false;

    like.map(val => {
        if (productId === val.shopId) {
            result = true;
        }
    });
    return result;
}

function keyIndexOf(like, productId) {
    let pid = null;

    like.map(val => {
        if (productId === val.shopId) {
            pid = val.pid;
        }
    });

    return pid;
}

export default class Search extends Component {

    constructor(props) {
        super(props);
        this.state = {
            uid : null,
            data : [],
            loading : true,
            search : '',
            start : 1,
            showMore : false,
            refresh : false,
            like : []
        }
    }

    async componentDidMount() {
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

    async getSearchData(text, start) {
        if (!text) {
            Toast.show('검색어를 입력해주세요', Toast.SHORT)
            return false;
        }
        this.setState({
            loading : true,
        });
        const data = await fetch(`https://openapi.naver.com/v1/search/shop.json?query=${encodeURI(text)}&display=10&start=${start}`,
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
                data : res.items,
                loading : false
            }, () => {
                this.getLikeData(this.state.uid);
            })
        }
    }

    handleChange = (text) => {
        this.setState({
            search : text
        })
    }

    async getUser(){
        const userInfo = await GoogleSignin.getCurrentUser(); 
        if (userInfo) {
            this.setState({
                uid : userInfo.user.id,
                loading : false
            });
        }
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
            this.getSearchData(this.state.search, 1);
            this.setState({
                refresh: false
            })
        })
    }

    onLikeAction = (value, like) => {
        const {uid, search} = this.state;
        const items = {
            shopId : value.productId,
            search,
            image : value.image,
            title : value.title,
            lprice : value.lprice, 
            hprice : value.hprice,
            link : value.link
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
            firebase.database().ref('/like/' + uid + '/' + value).remove(() => {
                this.getLikeData(uid)
            });
        }
    }

    async getLikeData(uid) {
        let like = [];

        firebase.database().ref('/like/' + uid).once('value', (snapshot) => {
            const shopObject = snapshot.val();
            if (shopObject) {
                like = Object.keys(shopObject).map(key => ({
                    ...shopObject[key],
                    pid : key
                }));
            } else {
                like = []
            }
            this.setState({
                like
            })
        })
    }

    render() {
        const {data, loading, search, start, like} = this.state;

        return (
            <View style={{flex : 1, alignItems: 'center', backgroundColor: '#fff'}}>
                <View style={{flexDirection: 'row',  height: 40, marginTop: 20, marginBottom: 20 }}>
                    <TextInput 
                        placeholder="쇼핑 목록을 검색하세요"
                        style={{justifyContent: 'center', borderWidth: 1, borderColor: '#e1e3e8', padding: 10, width: '70%', borderTopLeftRadius: 5, borderBottomLeftRadius: 5}} 
                        onChangeText={this.handleChange}>                
                    </TextInput>
                    <TouchableHighlight 
                        underlayColor={"#b3ccff"} 
                        style={{
                            backgroundColor: '#115ef7', 
                            justifyContent: 'center', 
                            width: '15%', 
                            alignItems: 'center', 
                            borderTopRightRadius: 5, 
                            borderBottomRightRadius: 5
                        }} 
                        onPress={() => this.getSearchData(search, start)}>
                        <Text style={{color: '#fff'}}>검색</Text>
                    </TouchableHighlight>
                </View>
                {(loading) ? (
                    <View style={styles.center}>
                        <ActivityIndicator />
                    </View>) : (
                    <ScrollView 
                        style={{width: '100%', backgroundColor: '#fff'}} 
                        onScroll={({nativeEvent}) => this.closeToBottom(nativeEvent)}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refresh}
                                onRefresh={this._onRefresh}
                            />
                        }    
                    >
                        <View>
                            {(data.length) ? (
                                data.map((val, index) => (
                                    <View style={{flexDirection: 'row', padding: 10}} key={index}>
                                        <TouchableHighlight onPress={() => Linking.openURL(val.link)}>
                                            <Image 
                                                source={{uri : val.image}} 
                                                style={{width: 100, height: 100, position: 'relative'}} 
                                            />
                                        </TouchableHighlight>
                                        <View style={{flex : 1, marginLeft: 20}}>
                                            <HTML html={val.title} />
                                            <Text style={{color : '#1f43f2'}}>{val.mallName}</Text>
                                            <View style={{bottom: 0, position: 'absolute', flexDirection: 'row', right: 0}}>
                                                <TouchableOpacity underlayColor={"#9ec0ff"} onPress={() => Actions.detailItem({val, search})} style={{margin: 10}}>
                                                    <Icon name="md-cart" size={36} color={"#6ea1ff"} />
                                                </TouchableOpacity>
                                                {(isOnLike(like, val.productId)) ? (
                                                    <TouchableOpacity underlayColor={"#ffa8a8"} onPress={() => this.onLikeAction(keyIndexOf(like, val.productId), false)} style={{margin: 10}}>
                                                        <Icon name={"md-heart"} size={36} color={"#ff3333"}  />
                                                    </TouchableOpacity>
                                                ) : (
                                                    <TouchableOpacity underlayColor={"#ffa8a8"} onPress={() => this.onLikeAction(val, true)} style={{margin: 10}}>
                                                        <Icon name="md-heart-empty" size={36} color={"#ff3333"}  />
                                                    </TouchableOpacity>
                                                )}
                                                
                                            </View>
                                        </View>
                                    </View>
                                ))
                            ) : (
                                <View style={{flex: 1, alignItems: 'center', marginTop: '50%'}}>
                                    <Text>데이터를 검색하세요</Text>
                                </View>
                            )}
                        </View>
                    </ScrollView>
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