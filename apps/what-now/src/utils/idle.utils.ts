// oxlint-disable no-new
/* c8 ignore start */
import { debounce, emit, nbMsInMinute } from '@shuunen/shuutils'
import { logger } from './logger.utils'
;new (class IdleService {
  private readonly checkInactivityEvery = 10

  private inactiveSince = 0 // ms

  private readonly resetTimerDelay = 200 // minutes

  private readonly sendReminderEvery = 30 // minutes

  private timer!: NodeJS.Timeout

  /**
   * Constructor
   */
  public constructor() {
    this.setupListeners()
    this.resetTimer('init')
  }
  /**
   * Check inactivity
   */
  private checkInactivity() {
    const inactivePeriod = Date.now() - this.inactiveSince
    const minutes = Math.round(inactivePeriod / nbMsInMinute)
    logger.info('user has been inactive for', minutes, 'minute(s)')
    if (minutes === this.sendReminderEvery) emit('send-reminder')
  }
  /**
   * Reset timer
   * @param from - event that triggered the reset
   */
  private resetTimer(from = 'unknown event') {
    logger.info('timer reset due to', from)
    this.inactiveSince = Date.now()
    clearTimeout(this.timer)
    this.setupTimer()
    emit('user-activity', from)
  }
  /**
   * Setup listeners
   */
  private setupListeners() {
    const events = ['mousedown', 'touchstart', 'visibilitychange', 'focus', 'blur-sm']
    const resetTimer = debounce(this.resetTimer.bind(this), this.resetTimerDelay)
    for (const name of events)
      globalThis.addEventListener(
        name,
        event => {
          void resetTimer(event.type)
        },
        true,
      )
  }
  /**
   * Setup timer
   */
  private setupTimer() {
    this.timer = setInterval(() => {
      this.checkInactivity()
    }, this.checkInactivityEvery * nbMsInMinute)
  }
})()
