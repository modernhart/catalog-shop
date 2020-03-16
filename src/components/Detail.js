import React, { Component } from 'react';
import { View, Dimensions, StyleSheet, ScrollView, TouchableHighlight, TouchableOpacity, Image, Linking, Text, BackHandler, ActivityIndicator, Picker, Share } from 'react-native';
import { GoogleSignin } from '@react-native-community/google-signin';
import { Actions } from 'react-native-router-flux'
import firebase from "react-native-firebase";
import HTML from 'react-native-render-html';
import Toast from 'react-native-simple-toast'
import jsonData from './data.json';

export default class Detail extends Component {

    constructor(props) {
        super(props);
        this.state = {
            uid : null,
            data : [],
            images : [],
            loading : true,
            category : null
        };
    }

    handleBackButton = () => { 
		Actions.pop();
	   	return true;
    }
    
    componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    }

    putInBasket = () => {
        const {title, lprice, hprice, image, link} = this.props.val;
        const {uid, images, category} = this.state;

        const cat = (category) ? category : jsonData.category[0]
        
        const shopData = {
            title,
            lprice,
            hprice, 
            image,
            link,
            images,
            removed : false,
            purchase : false,
            category : cat
        }

        firebase.database().ref('/basket/' + uid).push(shopData, (err) => {
            if (err) {
                alert(err);
            } else {
                Actions.pop();
                Toast.show('장바구니에 상품이 추가되었습니다.', Toast.SHORT);
                Actions.reset('home', JSON.stringify({refresh : 2}));
            }
        })
    }

    async getUser(){
        const userInfo = await GoogleSignin.getCurrentUser(); 
        if (userInfo) {
            this.setState({
                uid : userInfo.user.id,
            });
        }
    }

    getYoutubeContents() {
        const searchProduct = this.props.val.title.replace(/<\/?[^>]+(>|$)/g, "");
        const splitWords = searchProduct.split(' ');
        const searchQuery = splitWords.splice(0, 4).join(' '); 

        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${searchQuery}&key=AIzaSyAAlnHoZX-R1SYc0qOfxuWYrfPlwRcHCys&maxResults=3`
        fetch(searchUrl, {
            method: 'GET',
        })
        .then(data => data.json())
        .then(jsonData => {
            this.setState({
                data : jsonData.items,
                loading : false
            }, () => {
                //console.log('^^', this.state.data)
            })
            // this.setState({
            //     data : jsonData.items,
            //     loading : false
            // })
        })
    }

    openImagesLink() {
        const text = this.props.val.title.replace(/<\/?[^>]+(>|$)/g, "");
        const search = text.split(' ').splice(0, 4).join(' ');

        Linking.openURL(`https://www.google.com/search?q=${encodeURI(search)}&tbm=isch`);
    }

    getImage() {
        const searchProduct = this.props.val.title.replace(/<\/?[^>]+(>|$)/g, "");
        const imageUrl = `https://openapi.naver.com/v1/search/image.json?query=${searchProduct}&display=1`
        fetch(imageUrl, {
            method: 'GET',
            headers: {
                "X-Naver-Client-Id" : "NKPpRTtA4tudmEH2Apa9",
                "X-Naver-Client-Secret" : "UbEycr2vfh"
            },
        })
        .then(data => data.json())
        .then(jsonData => {
            this.setState({
                images : jsonData.items,
                loading : false
            });
        })
    }
    
    removeData(pid) {
        const {uid} = this.state;

        firebase.database().ref('/basket/' + uid + '/' + pid).update({
            removed : true
        });

        Actions.pop();
        Toast.show('해당 아이템이 삭제되었습니다.', Toast.SHORT);
        Actions.reset('home', JSON.stringify({refresh : 2}));
    }

    componentDidMount() {
        this.getUser();
        this.getImage();
        this.getYoutubeContents();
        
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    }

    async onShare ({link}) {
        try {
            const result = await Share.share({
                message: link,
                title : '괜찮은 아이템이 있는데?',
            });
      
            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                } else {
                    // shared
                }
            } else if (result.action === Share.dismissedAction) {
              // dismissed
            }
        } catch (error) {
            console.log(error.message);
        }
    }

    render() {
        const {data, loading, images} = this.state;
        if (loading) {
            return (
                <View style={styles.center}>
                    <ActivityIndicator />
                </View>
            )
        }
        return (
            <ScrollView style={{flex : 1, backgroundColor: '#fff'}}>
                <View style={{alignItems: 'center',  marginBottom: 20}}>
                    <View style={{height: 200}}>
                        <ScrollView horizontal>
                            <Image source={{uri : this.props.val.image}}
                                style={{width: 200, height: 200}}
                            />
                        </ScrollView>
                    </View>
                    <View>
                        <TouchableOpacity
                            onPress={() => this.openImagesLink()}
                        >
                            <Image source={require('../google.png')}
                                style={{width: 45, height: 45}}
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={{marginTop : 40, width: '85%'}}>
                        <Text>상품명</Text>
                        <ScrollView style={{padding : 10, borderRadius: 10, marginTop: 10, backgroundColor: '#b3d5ff'}}>
                            <HTML html={this.props.val.title} />
                        </ScrollView>
                    </View>
                    <View style={{marginTop : 40, width: '85%', alignItems: 'flex-start'}}>
                        <Text>가격</Text>
                        <ScrollView style={{padding : 10, borderRadius: 10, marginTop: 10, backgroundColor: '#ffb5b5', width: '100%'}}>
                            <Text style={{color : '#fff', textAlign: 'center'}}>{`${this.props.val.lprice.toLocaleString()}`}</Text>
                        </ScrollView>
                        <ScrollView style={{padding : 10, borderRadius: 10, marginTop: 10, backgroundColor: '#ff5959', width: '100%'}}>
                            <Text style={{color : '#fff', textAlign: 'center'}}>{`${this.props.val.hprice.toLocaleString()}`}</Text>
                        </ScrollView>
                    </View>
                    <View style={{marginTop : 40, width: '85%', alignItems: 'flex-start'}}>
                        <Text>분류</Text>
                        <Picker
                            selectedValue={(this.props.val.category) ? this.props.val.category : this.state.category}
                            enabled={(this.props.val.category) ? false : true}
                            style={{height: 50, width: '100%'}}
                            onValueChange={(itemValue, itemIndex) =>
                                this.setState({category: itemValue})
                            }>
                            {jsonData.category.map((value) => 
                                <Picker.Item label={value} value={value} key={value}/>
                            )}
                        </Picker>
                    </View>
                    
                    <View style={{marginTop : 40, width: '85%'}}>
                        <Text>리뷰 및 관련 영상</Text>
                        <ScrollView horizontal={true} style={{marginTop: 10}}>
                            {(data && data.length) ? data.map(val => (
                                <TouchableOpacity
                                    onPress={() => { Linking.openURL(`https://www.youtube.com/watch?v=${val.id.videoId}`)}}
                                >
                                    <Image  
                                        key={val.etag}
                                        source={{uri : val.snippet.thumbnails.high.url}}
                                        style={{width: 280, height: 160}}
                                    />
                                    <Text style={{textAlign: 'center', marginTop: 10, fontSize: 15}}>{val.snippet.channelTitle}</Text>
                                    <View style={{flex: 1, width: 280, marginTop: 1}}>
                                        <Text style={{textAlign: 'center', fontSize: 13}}>{val.snippet.title}</Text>
                                    </View>
                                </TouchableOpacity>
                            )) : (
                                <View>
                                    <Image  
                                        source={{uri : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9y3qBbWX82hVeOW_KuWJ7duwo8h-UMHI_Q96hoPbbgo8Np2YlAw'}}
                                        style={{ height: 160, width: 270}}
                                    />
                                </View>
                                
                            )}
                        </ScrollView>
                    </View>
                    <View style={{marginTop : 40, width: '85%', flexDirection: 'row', flex : 1}}>
                        <View style={{width: '50%', flex : 0.5, padding: 15}}>
                            <TouchableHighlight
                                onPress={() => this.onShare(this.props.val)}
                                underlayColor={"#ffdfd1"}
                                style={{borderRadius: 10, backgroundColor: '#ffa27a', padding: 5}}
                            >
                                <Text style={{textAlign: 'center', color: '#fff', fontSize: 16}}>공유하기</Text>
                            </TouchableHighlight>
                        </View>
                        {(this.props.basket) ? (
                            <View style={{width: '50%', flex : 0.5, padding: 15}}>
                                <TouchableHighlight
                                    onPress={() => this.removeData(this.props.val.pid)}
                                    underlayColor={"#9ebaff"}
                                    style={{borderRadius: 10, backgroundColor: '#ff4278', padding: 5}}
                                >
                                    <Text style={{textAlign: 'center', color: '#fff', fontSize: 16}}>삭제하기</Text>
                                </TouchableHighlight>
                            </View>
                        ) : (
                            <View style={{width: '50%', flex : 0.5, padding: 15}}>
                                <TouchableHighlight
                                    onPress={this.putInBasket}
                                    underlayColor={"#9ebaff"}
                                    style={{borderRadius: 10, backgroundColor: '#6390ff', padding: 5}}
                                >
                                    <Text style={{textAlign: 'center', color: '#fff', fontSize: 16}}>장바구니에 넣기</Text>
                                </TouchableHighlight>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
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