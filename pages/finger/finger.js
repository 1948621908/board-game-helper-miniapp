const STABLE_MS = 1500

function styleFor(x, y) {
  return `left: ${x}px; top: ${y}px;`
}

Page({
  data: {
    touches: [],
    locked: false,
    result: '',
    stableSeconds: 1.5
  },

  onReady() {
    this.measureStage()
  },

  measureStage(callback) {
    wx.createSelectorQuery().select('.touch-stage').boundingClientRect(rect => {
      if (rect) this._stageRect = rect
      if (callback) callback()
    }).exec()
  },

  onTouchStart(e) {
    if (this.data.locked) return
    if (this._stageRect) {
      this.syncTouches(e.touches)
    } else {
      this.measureStage(() => this.syncTouches(e.touches))
    }
  },

  onTouchMove(e) {
    if (!this.data.locked) this.syncTouches(e.touches)
  },

  onTouchEnd(e) {
    if (!this.data.locked) this.syncTouches(e.touches)
  },

  syncTouches(rawTouches) {
    if (!this._stageRect) return
    const incomingIds = rawTouches.map(touch => touch.identifier)
    const incomingSet = new Set(incomingIds)
    Object.keys(this._labels || {}).forEach(id => {
      if (!incomingSet.has(Number(id))) delete this._labels[id]
    })
    if (!this._labels) this._labels = {}
    if (!this._nextLabel) this._nextLabel = 1

    const touches = rawTouches.map(touch => {
      if (!this._labels[touch.identifier]) this._labels[touch.identifier] = this._nextLabel++
      const x = touch.pageX - this._stageRect.left
      const y = touch.pageY - this._stageRect.top
      return {
        id: touch.identifier,
        label: this._labels[touch.identifier],
        x,
        y,
        style: styleFor(x, y),
        selected: false
      }
    })

    this._touchSnapshot = incomingIds.slice().sort((a, b) => a - b).join(',')
    this.setData({ touches, result: '' })
    this.scheduleLock()
  },

  scheduleLock() {
    clearTimeout(this._stableTimer)
    if (!this._touchSnapshot) return
    const snapshot = this._touchSnapshot
    this._stableTimer = setTimeout(() => {
      if (snapshot === this._touchSnapshot && this.data.touches.length) this.lockOne()
    }, STABLE_MS)
  },

  lockOne() {
    clearTimeout(this._stableTimer)
    const winnerIndex = Math.floor(Math.random() * this.data.touches.length)
    const winner = this.data.touches[winnerIndex]
    const touches = this.data.touches.map(touch => ({
      ...touch,
      selected: touch.id === winner.id
    }))
    this.setData({
      touches,
      locked: true,
      result: `第 ${winner.label} 个手指被选中`
    })
  },

  onReset() {
    clearTimeout(this._stableTimer)
    this._touchSnapshot = ''
    this._labels = {}
    this._nextLabel = 1
    this.setData({ touches: [], locked: false, result: '' })
  },

  onUnload() {
    clearTimeout(this._stableTimer)
  }
})
