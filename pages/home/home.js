Page({
  data: {
    tools: [
      { id: 'dice', icon: '⚄', name: '掷骰子', desc: '点击屏幕，快速投掷', tone: 'red', tag: '1–12 颗' },
      { id: 'finger', icon: '☝', name: '指尖选择', desc: '多人按住，随机选一位', tone: 'teal', tag: '多人游戏' }
    ],
    recent: []
  },
  onShow() {
    const records = wx.getStorageSync('diceRecords') || []
    this.setData({
      recent: records.slice(0, 3).map(record => ({
        id: record.id,
        name: `掷骰子 · ${record.count} 颗 · 合计 ${record.total} 点`,
        time: record.timeLabel
      }))
    })
  },
  onToolTap(e) {
    const { id } = e.currentTarget.dataset
    const pages = { dice: '/pages/dice/dice', finger: '/pages/finger/finger' }
    if (pages[id]) wx.navigateTo({ url: pages[id] })
  }
})
