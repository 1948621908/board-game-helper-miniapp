const RECORD_KEY = 'diceRecords'
const COUNT_KEY = 'diceCount'
const MAX_RECORDS = 100
const MAX_DICE = 12

const facePositions = {
  1: [5],
  2: [1, 9],
  3: [1, 5, 9],
  4: [1, 3, 7, 9],
  5: [1, 3, 5, 7, 9],
  6: [1, 3, 4, 6, 7, 9]
}

function makeDice(values) {
  return values.map((value, id) => ({
    id,
    value,
    cells: Array.from({ length: 9 }, (_, index) => ({
      position: index + 1,
      active: facePositions[value].includes(index + 1)
    }))
  }))
}

function formatTime(date) {
  const pad = value => String(value).padStart(2, '0')
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

Page({
  data: {
    count: 2,
    dice: makeDice([1, 1]),
    rolling: false,
    hasResult: false,
    total: 0,
    valuesText: ''
  },

  onLoad() {
    const saved = Number(wx.getStorageSync(COUNT_KEY))
    const count = Number.isInteger(saved) && saved >= 1 && saved <= MAX_DICE ? saved : 2
    this.setData({ count, dice: makeDice(Array(count).fill(1)) })
  },

  onStep(e) {
    if (this.data.rolling) return
    const count = Math.max(1, Math.min(MAX_DICE, this.data.count + Number(e.currentTarget.dataset.delta)))
    if (count === this.data.count) return
    this.setData({
      count,
      dice: makeDice(Array(count).fill(1)),
      hasResult: false,
      total: 0,
      valuesText: ''
    })
    wx.setStorageSync(COUNT_KEY, count)
  },

  onRoll() {
    if (this.data.rolling) return
    this.setData({ rolling: true, hasResult: false })
    this._frameTimer = setInterval(() => {
      this.setData({ dice: makeDice(Array.from({ length: this.data.count }, () => Math.floor(Math.random() * 6) + 1)) })
    }, 80)
    this._settleTimer = setTimeout(() => {
      clearInterval(this._frameTimer)
      this._frameTimer = null
      this._settleTimer = null
      const values = Array.from({ length: this.data.count }, () => Math.floor(Math.random() * 6) + 1)
      const total = values.reduce((sum, value) => sum + value, 0)
      const record = {
        id: Date.now(),
        count: this.data.count,
        values,
        total,
        timeLabel: formatTime(new Date())
      }
      const records = wx.getStorageSync(RECORD_KEY) || []
      wx.setStorageSync(RECORD_KEY, [record, ...records].slice(0, MAX_RECORDS))
      this.setData({
        dice: makeDice(values),
        rolling: false,
        hasResult: true,
        total,
        valuesText: values.join(' + ')
      })
    }, 720)
  },

  onHistory() {
    wx.switchTab({ url: '/pages/history/history' })
  },

  onHide() {
    this.stopAnimation()
  },

  onUnload() {
    this.stopAnimation()
  },

  stopAnimation() {
    if (this._frameTimer) clearInterval(this._frameTimer)
    if (this._settleTimer) clearTimeout(this._settleTimer)
    this._frameTimer = null
    this._settleTimer = null
    if (this.data.rolling) this.setData({ rolling: false })
  }
})
