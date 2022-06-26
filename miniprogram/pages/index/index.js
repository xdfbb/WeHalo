//index.js
//获取应用实例
const app = getApp()
const jinrishici = require('../../utils/jinrishici.js')
const request = require('../../utils/request.js');
let util = require('../../utils/util.js');
let touchDotX = 0; //X按下时坐标
let touchDotY = 0; //y按下时坐标
let interval; //计时器
let time = 0; //从按下到松开共多少时间*100



Page({
    data: {
        StatusBar: app.globalData.StatusBar,
        CustomBar: app.globalData.CustomBar,
        Custom: app.globalData.Custom,
        BlogName: app.globalData.BlogName,
        BlogDesc: app.globalData.BlogDesc,
        HaloUser: app.globalData.HaloUser,
        HaloPassword: app.globalData.HaloPassword,
        miniProgram: app.globalData.miniProgram,
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        userInfo: {},
        cardIdex: 1,
        randomNum: 0,
        animationTime: 1,
        moreFlag: false,
        pages: 0,
        cardCur: 0,
        TabCur: 0,
        scrollLeft: 0,
        openid: '',
        Role: '游客',
        roleFlag: false,
        adminOpenid: app.globalData.adminOpenid,
        colourList: [{
            colour: 'bg-red'
        }, {
            colour: 'bg-orange'
        }, {
            colour: 'bg-yellow'
        }, {
            colour: 'bg-olive'
        }, {
            colour: 'bg-green'
        }, {
            colour: 'bg-cyan'
        }, {
            colour: 'bg-blue'
        }, {
            colour: 'bg-purple'
        }, {
            colour: 'bg-mauve'
        }, {
            colour: 'bg-pink'
        }, {
            colour: 'bg-lightBlue'
        }],
        categories: [{
            name: "全部",
            slug: "all"
        }],
        isPasswordShow: false,
        password: null,
        secretUrl: null,
        navTabList: [{
                "text": "叫毛儿",
                "iconPath": "/image/video-image/logo-jiaomao.png",
                "selectedIconPath": "/image/video-image/logo-jiaomao.png",
                "pagePath": "/pages/index/index",
            },
            {
                "text": "精选小程序",
                "iconPath": "/image/video-image/logo_mini_programm.png",
                "selectedIconPath": "/image/video-image/logo_mini_programm.png",
                "pagePath": "/pages/post/post?postId=47",
            },
            {
                "text": "精选公众号",
                "iconPath": "/image/video-image/wechat.png",
                "selectedIconPath": "/image/video-image/wechat.png",
                "pagePath": "/pages/post/post?postId=46",
            },
            {
                "text": "知乎精选",
                "iconPath": "/image/video-image/logo-zhihu.png",
                "selectedIconPath": "/image/video-image/logo-zhihu.png",
                "pagePath": "/pages/post/post?postId=49",
            },
            {
                "text": "抖音精选",
                "iconPath": "/image/video-image/tik-tok.png",
                "selectedIconPath": "/image/video-image/tik-tok.png",
                "pagePath": "/pages/post/post?postId=48",
            }
        ],
    },
    tabChange(e) {
        //获取到底部栏元素的下标
        let index = e.detail.index;
        this.setData({
            tabbarIndex: index
        })
        wx.navigateTo({
            url: e.detail.item.pagePath
        })
        console.log('tab change', e.detail.index)
    },
    /**
     * 监听屏幕滚动 判断上下滚动
     */
    onPageScroll: function (event) {
        this.setData({
            scrollTop: event.detail.scrollTop
        })
    },
    //事件处理函数
    bindViewTap: function () {
        wx.navigateTo({
            url: '../logs/logs'
        })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        var userInfo = wx.getStorageSync('userInfo')
        if (userInfo) {
            this.setData({
                userInfo: userInfo,
                hasUserInfo: true
            })
            this.getPermissions()
        }
    },

    onLoad: function () {
        // 在页面中定义插屏广告
        let interstitialAd = null
        // 在页面onLoad回调事件中创建插屏广告实例
        if (wx.createInterstitialAd) {
            interstitialAd = wx.createInterstitialAd({
                adUnitId: 'adunit-f117e72a7c599593'
            })
            interstitialAd.onLoad(() => {})
            interstitialAd.onError((err) => {})
            interstitialAd.onClose(() => {})
        }
        // 在适合的场景显示插屏广告
        if (interstitialAd) {
            interstitialAd.show().catch((err) => {
                console.error(err)
            })
        }
        // 每日诗词
        jinrishici.load(result => {
            // 下面是处理逻辑示例
            this.setData({
                jinrishici: result.data.content
            });
        });
        var urlPostList = app.globalData.url + '/api/content/posts';
        var token = app.globalData.token;
        var params = {
            page: 0,
            size: 100, //不带参数请求默认10条，又没有查所有文章的接口，所以先暂定100
            sort: 'createTime,desc',
        };
        var paramBanner = {
            page: 0,
            size: 4,
            categoryId: 10,
            sort: 'visits,desc',
        };
        // @todo 文章列表网络请求API数据
        request.requestGetApi(urlPostList, token, params, this, this.successPostList, this.failPostList);
        // @todo 文章Banner网络请求API数据
        request.requestGetApi(urlPostList, token, paramBanner, this, this.successBanner, this.failBanner);
        var urlAdminLogin = app.globalData.url + '/api/admin/login';
        var paramAdminLogin = {
            username: this.data.HaloUser,
            password: this.data.HaloPassword
        };
        // @todo 获取后台token网络请求API数据
        request.requestPostApi(urlAdminLogin, token, paramAdminLogin, this, this.successAdminLogin, this.failAdminLogin);
        var that = this;
        var urlCategoriesList = app.globalData.url + '/api/content/categories';
        // 查分类
        request.requestGetApi(urlCategoriesList, token, {
            sort: 'createTime'
        }, this, function (res) {
            res.data.forEach(element => {
                that.data.categories.push(element)
            });
            that.setData({
                categories: that.data.categories
            })
        }, null);
        this.requestTagstData();
    },

    getUserProfile: function () {
        var that = this;
        wx.getUserProfile({
            desc: '用于完善用户资料',
            success: (res) => {
                if (res.errMsg == "getUserProfile:ok") {
                    wx.setStorageSync('userInfo', res.userInfo)
                    app.globalData.userInfo = res.userInfo
                    that.setData({
                        userInfo: res.userInfo,
                        hasUserInfo: true,
                    })
                    that.getPermissions()
                }
            },
            fail: err => {
                wx.showToast({
                    title: '授权后才能体验更多功能哦',
                    icon: 'none',
                    duration: 3000
                })
            },
        })
    },

    getPermissions: function () {
        var that = this;
        wx.cloud.callFunction({
            name: 'get_wx_context',
            success(res) {
                wx.setStorageSync('openid', res.result.openid)
                var role = res.result.openid == that.data.adminOpenid ? '管理员' : '游客'
                app.globalData.roleFlag = res.result.openid == that.data.adminOpenid;
                that.setData({
                    Role: role,
                    roleFlag: res.result.openid == that.data.adminOpenid,
                });
            },
        })
    },

    DotStyle(e) {
        this.setData({
            DotStyle: e.detail.value
        })
    },
    // cardSwiper
    cardSwiper(e) {
        this.setData({
            cardCur: e.detail.current
        })
    },
    // towerSwiper
    // 初始化towerSwiper
    towerSwiper(name) {
        let list = this.data[name];
        for (let i = 0; i < list.length; i++) {
            list[i].zIndex = parseInt(list.length / 2) + 1 - Math.abs(i - parseInt(list.length / 2))
            list[i].mLeft = i - parseInt(list.length / 2)
        }
        this.setData({
            swiperList: list
        })
    },
    // towerSwiper触摸开始
    towerStart(e) {
        this.setData({
            towerStart: e.touches[0].pageX
        })
    },
    // towerSwiper计算方向
    towerMove(e) {
        this.setData({
            direction: e.touches[0].pageX - this.data.towerStart > 0 ? 'right' : 'left'
        })
    },
    // towerSwiper计算滚动
    towerEnd(e) {
        let direction = this.data.direction;
        let list = this.data.swiperList;
        if (direction == 'right') {
            let mLeft = list[0].mLeft;
            let zIndex = list[0].zIndex;
            for (let i = 1; i < list.length; i++) {
                list[i - 1].mLeft = list[i].mLeft
                list[i - 1].zIndex = list[i].zIndex
            }
            list[list.length - 1].mLeft = mLeft;
            list[list.length - 1].zIndex = zIndex;
            this.setData({
                swiperList: list
            })
        } else {
            let mLeft = list[list.length - 1].mLeft;
            let zIndex = list[list.length - 1].zIndex;
            for (let i = list.length - 1; i > 0; i--) {
                list[i].mLeft = list[i - 1].mLeft
                list[i].zIndex = list[i - 1].zIndex
            }
            list[0].mLeft = mLeft;
            list[0].zIndex = zIndex;
            this.setData({
                swiperList: list
            })
        }
    },
    showModal(e) {
        console.log(e);
        this.setData({
            modalName: e.currentTarget.dataset.target
        })
    },
    hideModal(e) {
        this.setData({
            modalName: null
        })
    },
    tabSelect(e) {
        this.randomNum();
        this.setData({
            postList: [],
        });
        var slug = e.currentTarget.dataset.slug;
        var url = slug != 'all' ? "/api/content/categories/" + slug + "/posts" : "/api/content/posts";
        var urlPostList = app.globalData.url + url;
        var token = app.globalData.token;
        var params = {
            size: 100,
            sort: 'createTime,desc',
            password: wx.getStorageSync('password'),
        };
        //@todo 文章内容网络请求API数据
        request.requestGetApi(urlPostList, token, params, this, this.successPostList, this.failPostList);
        this.setData({
            TabCur: e.currentTarget.dataset.id,
            scrollLeft: (e.currentTarget.dataset.id - 1) * 60,
            secretUrl: slug
        });
    },

    switchSex: function (e) {
        // console.warn(e.detail.value);
        app.globalData.skin = e.detail.value
        console.log(app.globalData.skin)
        this.setData({
            skin: e.detail.value
        });
    },
    // 触摸开始事件
    touchStart: function (e) {
        touchDotX = e.touches[0].pageX; // 获取触摸时的原点
        touchDotY = e.touches[0].pageY;
        // 使用js计时器记录时间    
        interval = setInterval(function () {
            time++;
        }, 100);
    },
    // 触摸结束事件
    touchEnd: function (e) {
        let touchMoveX = e.changedTouches[0].pageX;
        let touchMoveY = e.changedTouches[0].pageY;
        let tmX = touchMoveX - touchDotX;
        let tmY = touchMoveY - touchDotY;
        if (time < 20) {
            let absX = Math.abs(tmX);
            let absY = Math.abs(tmY);
            if (absX > 2 * absY) {
                if (tmX < 0) {
                    this.setData({
                        modalName: null
                    })
                } else {
                    this.setData({
                        modalName: "viewModal"
                    })
                }
            }
            if (absY > absX * 2 && tmY < 0) {
                console.log("上滑动=====")
            }
        }
        clearInterval(interval); // 清除setInterval
        time = 0;
    },
    // 关闭抽屉
    shutDownDrawer: function (e) {
        this.setData({
            modalName: null
        })
    },
    //冒泡事件
    maopao: function (e) {
        console.log("冒泡...")
    },
    showMask: function (e) {
        this.selectComponent("#authorCardId").showMask();
        this.shutDownDrawer();
    },

    //获取随机数
    randomNum: function () {
        var num = Math.floor(Math.random() * 10);
        this.setData({
            randomNum: num
        });
    },

    /**
     * 加载更多
     */
    loadMore: function () {

    },



    /**
     * 文章Banner请求--接口调用成功处理
     */
    successBanner: function (res, selfObj) {
        var that = this;
        var list = res.data.content;
        for (let i = 0; i < list.length; ++i) {
            list[i].createTime = util.customFormatTime(list[i].createTime, 'Y.M.D');
        }
        that.setData({
            bannerPost: res.data.content,
        });
    },
    /**
     * 文章Banner请求--接口调用失败处理
     */
    failBanner: function (res, selfObj) {
        console.error('failBanner', res)
    },


    /**
     * 文章列表请求--接口调用成功处理
     */
    /**
     * 文章列表请求--接口调用成功处理
     */
    successPostList: function (res, selfObj) {
        var that = this;
        if (res.status != 403) {
            var list = res.data.content;
            for (let i = 0; i < list.length; ++i) {
                list[i].createTime = util.customFormatTime(list[i].createTime, 'Y.M.D');
                if (list[i].title.length > 10) {
                    list[i].title = list[i].title.substring(0, 14) + '...'
                }
            }
            that.setData({
                postList: res.data.content,
                moreFlag: res.data.content == "",
                pages: res.data.pages,
                noPostTitle: "作者会努力更新文章的 . . ."
            });
        } else {
            that.setData({
                moreFlag: true,
                isPasswordShow: true,
                noPostTitle: "该列表为私密列表，请输入访问密码后访问"
            });
            wx.showToast({
                title: '请输入正确密码',
                icon: 'none',
                duration: 2000,
                mask: true
            })
        }
    },
    /**
     * 文章列表请求--接口调用失败处理
     */
    failPostList: function (res, selfObj) {
        console.error('failPostList', res)
    },

    /**
     * 后台登入请求--接口调用成功处理
     */
    successAdminLogin: function (res, selfObj) {
        var that = this;
        // that.setData({
        //     access_token: res.data.access_token,
        //     refresh_token: res.data.refresh_token
        // })
        app.globalData.adminToken = res.data.access_token;
        // clearTimeout(delay);
        // console.warn(res)
    },
    /**
     * 后台登入请求--接口调用失败处理
     */
    failAdminLogin: function (res, selfObj) {
        console.error('failAdminLogin', res)
    },

    /**
     * 搜索文章模块
     */
    Search: function (e) {
        var content = e.detail.value.replace(/\s+/g, '');
        // console.log(content);
        var that = this;
        that.setData({
            SearchContent: content,
        });
    },
    SearchSubmit: function (e) {
        // console.warn(this.data.SearchContent);

        var that = this;
        that.setData({
            postList: null,
        });

        var urlPostList = app.globalData.url + '/api/content/posts/search?sort=createTime%2Cdesc&keyword=' + this.data.SearchContent;
        var token = app.globalData.token;
        var params = {};


        //@todo 搜索文章网络请求API数据
        request.requestPostApi(urlPostList, token, params, this, this.successSearch, this.failSearch);
    },
    successSearch: function (res, selfObj) {
        var that = this;
        // console.warn(res.data.content);
        var list = res.data.content;
        for (let i = 0; i < list.length; ++i) {
            list[i].createTime = util.customFormatTime(list[i].createTime, 'Y.M.D');
        }
        if (res.data.content != "") {
            that.setData({
                postList: res.data.content,
                moreFlag: false,
                pages: res.data.pages,
            });
        } else {
            that.setData({
                postList: res.data.content,
                moreFlag: true,
                pages: res.data.pages,
            });
        }
    },
    failSearch: function (res, selfObj) {
        console.error('failSearch', res)
    },

    /**
     * 获取Tags列表
     */
    requestTagstData: function (e) {
        var urlTags = app.globalData.url + '/api/admin/tags'; //读取首页背景图地址
        var token = app.globalData.token;
        var params = {};
        request.requestGetApi(urlTags, token, params, this, this.successTags, this.failTags);
    },
    /**
     * 成功获取tags列表
     */

    successTags: function (res, selfObj) {
        var that = this;
        if (res.data) {
            for (var item of res.data) {
                if ('小程序首页背景'.indexOf(item.name) > -1) {
                    that.setData({
                        backgroundimgurl: item.thumbnail
                    })
                    break;
                }
            }
        }
    },

    /**
     * 获取tags列表错误
     */
    failTags: function (res, selfObj) {
        console.error('failTags', res)
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return {
            title: this.data.BlogDesc,
            path: '/pages/index/index',
            imageUrl: 'https://jiaomao.solemountain.cn/upload/2022/06/%E4%BA%92%E8%81%94%E7%BD%91%E7%83%AD%E7%82%B9%E8%A6%81%E9%97%BB%E6%96%B0%E9%97%BB%E8%BF%BD%E8%B8%AA.png',
        }
    },
    hidePasswordModal(e) {
        this.setData({
            isPasswordShow: false
        })
    },
    clickPassword(e) {
        this.setData({
            isPasswordShow: false
        })
        wx.setStorageSync('password', this.data.password)
        this.randomNum();
        this.setData({
            postList: [],
        });
        var urlPostList = app.globalData.url + "/api/content/categories/" + this.data.secretUrl + "/posts";
        var token = app.globalData.token;
        var params = {
            size: 100,
            sort: 'createTime,desc',
            password: wx.getStorageSync('password')
        };
        //@todo 文章内容网络请求API数据
        request.requestGetApi(urlPostList, token, params, this, this.successPostList, this.failPostList);
        this.setData({
            TabCur: e.currentTarget.dataset.id,
            scrollLeft: (e.currentTarget.dataset.id - 1) * 60
        });
    },
    inputPassword(e) {
        this.setData({
            password: e.detail.value
        })
    }

})