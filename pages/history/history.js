Page({
  data: { records: [] },

  onShow() {
    const records = wx.getStorageSync('diceRecords') || []
    this.setData({
      records: records.map(record => ({
        ...record,
        valuesText: record.values.join(' + ')
      }))
    })
  },

  onTryDice() {
    wx.navigateTo({ url: '/pages/dice/dice' })
  }
})
