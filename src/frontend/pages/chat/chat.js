Page({
    data: {
        messages: [],
        inputMsg: ''
    },

    onInput(e) {
        this.setData({ inputMsg: e.detail.value });
    },

    sendMessage() {
        const msg = this.data.inputMsg.trim();
        if (!msg) return;

        // 添加用户消息
        this.setData({
            messages: [...this.data.messages, { role: 'user', content: msg }],
            inputMsg: ''
        });

        // 调用后端API
        wx.request({
            url: 'https://your-domain.com/api/chat',
            method: 'POST',
            data: { message: msg },
            success: (res) => {
                if (res.data.content) {
                    this.setData({
                        messages: [...this.data.messages, { role: 'bot', content: res.data.content }]
                    });
                }
            }
        });
    }
})