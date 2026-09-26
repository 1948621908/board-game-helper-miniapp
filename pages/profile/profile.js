Page({
  data: { version: '0.2.0' },
  onFeedback() { wx.showToast({ title: '感谢反馈', icon: 'none' }) },
  onAbout() { wx.showModal({ title: '关于桌游助手', content: '为桌游聚会准备的轻量工具，帮助大家更快开局、顺利进行每一轮游戏。', showCancel: false }) }
})
