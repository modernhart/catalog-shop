import React, { Component, Fragment } from 'react';
import { View, StyleSheet, Text, Image, ActivityIndicator, ScrollView, Linking, TouchableHighlight, TouchableOpacity, RefreshControl, BackHandler, Share } from 'react-native';
import firebase from "react-native-firebase";
import { GoogleSignin } from '@react-native-community/google-signin';
import Toast from 'react-native-simple-toast'
import HTML from 'react-native-render-html';
import Icon from 'react-native-vector-icons/Ionicons';
import { Actions } from 'react-native-router-flux';

// function wait(timeout) {
//     return new Promise(resolve => {
//         setTimeout(resolve, timeout);
//     });
// }

export default class ShoppingList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            data : [],
            loading : true,
            search : '',
            uid : null,
            refresh : false
        }
    }

    async getData() {
        const userInfo = await GoogleSignin.getCurrentUser(); 

        if (userInfo) {
            this.setState({
                uid : userInfo.user.id
            })

            firebase.database().ref('/basket/' + userInfo.user.id).orderByChild('removed').equalTo(false).once('value', (snapshot) => {
                const shopObject = snapshot.val();

                if (shopObject) {
                    const shopList = Object.keys(shopObject).map(key => ({
                        ...shopObject[key],
                        pid : key
                    }));
                    this.setState({
                        data : shopList,
                        loading: false
                    })
                } else {
                    this.setState({
                        loading: false
                    })
                }
            })
        }
    }

    async componentDidMount() {
        this.getData();
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    }

    handleBackButton = () => {
		BackHandler.exitApp();
	   	return true;
    }
    
    componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
	}

    removeData(pid) {
        const {uid} = this.state;

        firebase.database().ref('/basket/' + uid + '/' + pid).update({
            removed : true
        });

        Toast.show('해당 아이템이 삭제되었습니다.', Toast.SHORT);
        Actions.reset('home', JSON.stringify({refresh : 2}));
    }

    purchaseItem(pid, status) {
        const {uid} = this.state;

        firebase.database().ref('/basket/' + uid + '/' + pid).update({
            purchase : status
        });

        Toast.show((status) ? '아이템 구매 완료' : '아이템 되돌리기', Toast.SHORT);
        Actions.reset('home', JSON.stringify({refresh : 2}));
    }

    async onShare ({link}) {
        try {
            const result = await Share.share({
                message: link,
                title : '괜찮은 아이템이 있는데?',
            });
      
            if (result.action === Share.sharedAction) {
                console.log(result);
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

    // _onRefresh() {
    //     this.setState({refresh: true});
    //     wait(2000).then(() => {
    //         this.getData();
    //         this.setState({
    //             refresh: false
    //         })
    //     })
    // }

    render() {
        const {data, loading, search} = this.state;
        if (loading) {
            return (
                <View style={styles.center}>
                    <ActivityIndicator />
                </View>
            )
        }
        return (
            <ScrollView style={{width: '100%', backgroundColor: '#fff'}}>
                <View style={{alignItems: 'center'}}>
                    <View style={{width: '100%'}}>
                        {(data.length) ? (data.map((val, index) => (
                            <Fragment key={index}>
                                <View style={{flexDirection: 'row', padding: 10, backgroundColor: (val.purchase) ? '#ffabab' : '#ffffff'}}>
                                    <TouchableHighlight onPress={() => Actions.detailItem({basket: true, val})} onLongPress={() => Linking.openURL(val.link)}>
                                        <Image 
                                            source={{uri : val.image}} 
                                            style={{width: 100, height: 100}} 
                                        />
                                    </TouchableHighlight>
                                    <View style={{flex : 1, marginLeft: 20}}>
                                        <HTML html={val.title} />
                                        <View style={{bottom: 0, position: 'absolute', flexDirection: 'row', right: 0}}>
                                            <Text style={{padding: 5, backgroundColor: (val.purchase) ? "#7d7c7c" : "#ffb5b5", margin: 5, borderRadius: 5, color: '#fff', fontSize: 11, paddingTop: 10}}>{(val.lprice > 0) ? val.lprice : '-' }</Text>
                                            <Text style={{padding: 5, backgroundColor: (val.purchase) ? '#7d7c7c' : "#ff5959", margin: 5, borderRadius: 5, color: '#fff', fontSize: 11, paddingTop: 10}}>{(val.hprice > 0) ? val.hprice : '-' }</Text>
                                            {(val.purchase) ? (
                                                <TouchableOpacity onPress={() => this.purchaseItem(val.pid, false)} style={{margin: 10}}>
                                                    <Icon name="md-redo" size={30} color={"#7d7c7c"} />
                                                </TouchableOpacity>
                                            ) : (
                                                <TouchableOpacity onPress={() => this.purchaseItem(val.pid, true)} style={{margin: 10}}>
                                                    <Icon name="md-checkbox" size={30} color={"#ff3333"} />
                                                </TouchableOpacity>
                                            )}
                                            <TouchableOpacity onPress={() => this.onShare(val)} style={{margin: 10}}>
                                                <Icon name="md-share" size={30} color={(val.purchase) ? "#7d7c7c" : "#ff3333"} />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => this.removeData(val.pid)} style={{margin: 10}}>
                                                <Icon name="md-trash" size={30} color={(val.purchase) ? "#7d7c7c" : "#ff3333"} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                                {/* <View 
                                    style={{
                                        paddingTop: (val.images) ? 10 : 0, 
                                        paddingBottom: (val.images) ? 10 : 0, 
                                        borderBottomWidth: 1, 
                                        borderBottomColor: '#bdbdbd',
                                        backgroundColor: (val.purchase) ? '#ffabab' : '#ffffff'
                                    }}
                                    >
                                    <ScrollView horizontal={true}>
                                        {(val.images && val.images.map(imageVal => (
                                            <Image  
                                                source={{uri : imageVal.link}} 
                                                style={{width: 80, height: 80}} 
                                            />
                                        )))}
                                    </ScrollView>
                                </View> */}
                            </Fragment>
                        ))) : (
                            <View style={{flex : 1, marginTop: '70%', alignItems : 'center'}}>
                                <Text>담긴 상품이 없습니다.</Text>
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
        backgroundColor : '#fff'
    }
})