// app.js
App({
    // 全局数据存储（跨页面共享）
    globalData: {
        userInfo: null,          // 用户基本信息
        token: null,            // 后端接口认证令牌
        chatSocket: null,       // WebSocket连接实例
        systemInfo: null        // 设备系统信息
    },

    // 小程序初始化（生命周期函数）
    onLaunch() {
        console.log('小程序初始化完成')
        this.initSystemInfo()
        this.checkLoginStatus()
        this.connectSocket()
    },

    // 获取设备信息（兼容性处理）
    initSystemInfo() {
        try {
            const systemInfo = wx.getSystemInfoSync()
            this.globalData.systemInfo = systemInfo
        } catch (e) {
            console.error('获取设备信息失败:', e)
        }
    },

    // 检查本地登录态
    checkLoginStatus() {
        const token = wx.getStorageSync('token')
        if (token) {
            this.globalData.token = token
            this.silentLogin()  // 静默登录更新token
        }
    },

    // 静默登录（无感刷新token）
    silentLogin() {
        wx.login({
            success: res => {
                wx.request({
                    url: 'https://your-api-domain.com/auth/silent',
                    method: 'POST',
                    data: { code: res.code },
                    success: (res) => {
                        if (res.data.code === 200) {
                            this._saveToken(res.data.token)
                        }
                    }
                })
            }
        })
    },

    // 用户登录（显式授权）
    login(callback) {
        wx.login({
            success: res => {
                wx.request({
                    url: 'https://your-api-domain.com/auth/login',
                    method: 'POST',
                    data: { code: res.code },
                    success: (res) => {
                        if (res.data.code === 200) {
                            this._saveToken(res.data.token)
                            this._getUserProfile()
                            callback && callback(true)
                        }
                    }
                })
            }
        })
    },

    // 保存token到内存和存储
    _saveToken(token) {
        this.globalData.token = token
        wx.setStorageSync('token', token)
    },

    // 获取用户信息（需授权）
    _getUserProfile() {
        wx.getUserProfile({
            desc: '用于展示用户信息',
            success: res => {
                this.globalData.userInfo = res.userInfo
                wx.setStorageSync('userInfo', res.userInfo)
            }
        })
    },

    // 初始化WebSocket连接
    connectSocket() {
        const socket = wx.connectSocket({
            url: 'wss://your-api-domain.com/chat',
            header: { 'Authorization': this.globalData.token }
        })

        socket.onOpen(() => {
            console.log('WebSocket连接已建立')
            this.globalData.chatSocket = socket
        })

        socket.onError(err => {
            console.error('WebSocket连接错误:', err)
        })
    },

    // 全局工具方法
    checkLogin() {
        return !!this.globalData.token
    },

    getToken() {
        return this.globalData.token || wx.getStorageSync('token')
    }
})