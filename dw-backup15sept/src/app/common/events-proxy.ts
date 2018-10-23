
export class EventProxy {
  target : any;
  eventHandlers : any;
  proxy : any;
  listeners : any;
  constructor(eventEmitter, listeners) {
    this.target = eventEmitter || {}
    this.eventHandlers = listeners || {}
    this.setTarget = this.setTarget.bind(this)
    this.addListener = this.addListener.bind(this)
    this.getProxy = this.getProxy.bind(this)
    this.proxy = new Proxy({}, {
      get: (obj, name) => {
        // intercept listeners
        if (name === 'on') return this.addListener
        if (name === 'setTarget') return this.setTarget
        if (name === 'proxyEventHandlers') return this.eventHandlers
        return this.target[name]
      },
      set: (obj, name, value) => {
        this.target[name] = value
        return true
      }
    })
    if (listeners)
      this.proxy.setTarget(eventEmitter)
  }
  getProxy() {
    return this.proxy
  }
  setTarget(eventEmitter) {
    this.target = eventEmitter
    // migrate listeners
    Object.keys(this.eventHandlers).forEach((name) => {
      this.eventHandlers[name].forEach((handler) => this.target.on(name, handler))
    })
  }
  addListener(name, handler) {
    if (!this.eventHandlers[name]) this.eventHandlers[name] = []
      this.eventHandlers[name].push(handler)
      this.target.on(name, handler)
  }
}
