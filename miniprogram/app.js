//app.js

App({
    onLaunch: function() {
        if (!wx.cloud) {
            console.error('请使用 2.2.3 或以上的基础库以使用云能力')
        }
        else {
            wx.cloud.init({
                env: 'xlr-0053be',
                traceUser: true,
            })
        }

        // 展示本地存储能力
        var logs = wx.getStorageSync('logs') || []
        logs.unshift(Date.now())
        wx.setStorageSync('logs', logs)

        // 登录
        wx.login({
            success: res => {
                // 发送 res.code 到后台换取 openId, sessionKey, unionId
            }
        })
        // 获取系统状态栏信息
        wx.getSystemInfo({
            success: e => {
                this.globalData.StatusBar = e.statusBarHeight;
                let capsule = wx.getMenuButtonBoundingClientRect();
                if (capsule) {
                     this.globalData.Custom = capsule;
                    this.globalData.CustomBar = capsule.bottom + capsule.top - e.statusBarHeight;
                } else {
                    this.globalData.CustomBar = e.statusBarHeight + 50;
                }
            }
        })

        const miniProgram = wx.getAccountInfoSync()
        console.log(miniProgram)
        this.globalData.miniProgram = miniProgram.miniProgram
        
        // 获取小程序更新机制兼容
        if (wx.canIUse('getUpdateManager')) {
            const updateManager = wx.getUpdateManager()
            updateManager.onCheckForUpdate(function (res) {
                // 请求完新版本信息的回调
                if (res.hasUpdate) {
                    updateManager.onUpdateReady(function () {
                        wx.showModal({
                            title: '更新提示',
                            content: '新版本已经准备好，是否重启应用？',
                            success: function (res) {
                                if (res.confirm) {
                                    // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                                    updateManager.applyUpdate()
                                }
                            }
                        })
                    })
                    updateManager.onUpdateFailed(function () {
                        // 新的版本下载失败
                        wx.showModal({
                            title: '已经有新版本了哟~',
                            content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
                        })
                    })
                }
            })
        } else {
            // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
            wx.showModal({
                title: '提示',
                content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
            })
        }

    },
    globalData: { //全局变量
        userInfo: null,
        skin: null,
        roleFlag: false,
        url: "https://jiaomao.solemountain.cn",
        BlogName: "叫毛儿",
        BlogDesc: "叫毛人儿，叫毛事儿，发现南阳新鲜事儿！",
        token: "f3541a0f-6bd4-4fdd-8add-a1d1320c7f6b",
        highlightStyle: "dracula", //代码高亮样式，可用值default,darcula,dracula,tomorrow
        adminOpenid: "oY3L80FJLtU-rxykgaekZ6aeEZdo",
        HaloUser: "xdfbb",
        HaloPassword: "11291212Ee"
    }
    
})