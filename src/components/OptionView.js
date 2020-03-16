import React, { Component, Fragment } from 'react';
import { View, StyleSheet, Text, Image, ActivityIndicator, Dimensions, ScrollView, Linking, TouchableHighlight, RefreshControl, TextInput, BackHandler } from 'react-native';
import firebase from "react-native-firebase";
import { GoogleSignin } from '@react-native-community/google-signin';
import Toast from 'react-native-simple-toast'
import { Actions } from 'react-native-router-flux';
import {PieChart, ProgressChart} from 'react-native-chart-kit';

function wait(timeout) {
    return new Promise(resolve => {
        setTimeout(resolve, timeout);
    });
}

const chartConfig = {
    backgroundGradientFrom: "#1E2923",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#08130D",
    backgroundGradientToOpacity: 0.5,
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5
};

export default class OptionView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            uid : null,
            data : [],
            loading : true,
            search : '',
            refresh : false,
        }
    }

    async componentDidMount() {
        /* 추후 파이어베이스 적용 */
        //const userInfo = await GoogleSignin.getCurrentUser(); 
        this.getUser();
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    }

    handleBackButton = () => {
		BackHandler.exitApp();
	   	return true;
    }
    
    componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
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
            }, () => {
                this.getMyProductdata(userInfo.user.id);
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

    async getMyProductdata(uid) {
        let searchData = [];
        let searchArr = [];
        let count = 0;

        firebase.database().ref('/basket/' + uid).orderByChild('removed').equalTo(false).once('value', (snapshot) => {
            const shopObject = snapshot.val();

            if (shopObject) {
                Object.keys(shopObject).map(key => {
                    searchArr = [...searchArr, shopObject[key]['category']];
                    count++;
                });

                const r = searchArr.reduce((x,y) => {
                    x[y] = ++x[y] || 1; 
                    return x;
                }, {});

                Object.keys(r).map(key => {
                    searchData = [
                        ...searchData, 
                        {
                            name : key,
                            population : Math.floor(r[key] / count * 100),
                            color: 'rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')',
                            legendFontColor: "#7F7F7F",
                            legendFontSize: 14
                        }
                    ];
                });
                this.setState({
                    data : searchData,
                    loading: false
                })
            } else {
                this.setState({
                    data : [{
                        name : '아이템',
                        population : 1,
                        color: '#8c8c8c',
                        legendFontColor: "#7F7F7F",
                        legendFontSize: 14
                    }],
                    loading: false
                })
            }
        })
    }

    signOut = async () => {
        try {
            await GoogleSignin.revokeAccess();
            await GoogleSignin.signOut();
            this.setState({ user: null }); // Remember to remove the user from your app's state as well
            Toast.show('정상적으로 로그아웃하였습니다.', Toast.SHORT);
            Actions.reset('login');
        } catch (error) {
            console.error(error);
        }
    };

    render() {
        const {data, loading, search} = this.state;

        return (
            <View style={{flex : 1, alignItems: 'center', backgroundColor: '#fff'}}>
                {/* <View style={{flexDirection: 'row',  height: 40, marginTop: 20, marginBottom: 20, flex: 1 }}>
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
                </View> */}
                <ScrollView contentContainerStyle={{alignItems: 'center'}} style={{width: '100%'}}>
                    <View style={{ width: '90%', flex: 1}}>
                        <View style={{flex: 3, backgroundColor: '#f7e8ff', paddingTop: 20, marginTop: 20, marginBottom: 20, borderRadius: 10}} >
                            <Text style={{textAlign: 'center'}}>소비 성향</Text>   
                            {(loading) ? (
                                <ActivityIndicator style={{height: 220}}/>
                            ) : (
                                <PieChart
                                    data={data}
                                    width={Dimensions.get('window').width}
                                    height={220}
                                    accessor="population"
                                    chartConfig={chartConfig}
                                    backgroundColor="transparent"
                                    absolute
                                    paddingLeft={20}
                                />
                            )}
                        </View>
                        <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center'}}>
                            <TouchableHighlight style={{padding: 10, borderRadius: 5, backgroundColor: '#d787ff' }} onPress={() => Actions.tutorial()}>
                                <Text style={{color: '#ffffff'}}>튜토리얼</Text>
                            </TouchableHighlight>
                            <TouchableHighlight style={{padding: 10, borderRadius: 5, backgroundColor: '#8c8c8c' }} onPress={this.signOut}>
                                <Text style={{color: '#ffffff'}}>로그아웃</Text>
                            </TouchableHighlight>
                        </View>
                    </View>
                </ScrollView>
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