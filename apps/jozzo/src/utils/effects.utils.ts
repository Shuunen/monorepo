/* v8 ignore file -- @preserve */
const pouringSoundDurationMs = 1000
const pouringSoundTotalSegments = 8 // 0-1, 1-2, ..., 7-8

/**
 * Play a random 1s segment of the tea-pouring sound with a fadeout effect.
 */
// oxlint-disable-next-line max-lines-per-function
export function playPouringSound() {
  const segment = Math.floor(Math.random() * pouringSoundTotalSegments)
  // declaring the sound outside mess up with the sound playback
  const pouringSound = new Audio('/tea-pouring.mp3')
  pouringSound.volume = 1
  pouringSound.currentTime = segment
  void pouringSound.play()
  // Fade out over the last 200ms
  const fadeDuration = 200
  const fadeSteps = 10
  const fadeStepTime = fadeDuration / fadeSteps
  setTimeout(() => {
    let currentStep = 0
    // oxlint-disable-next-line max-nested-callbacks
    const fadeInterval = setInterval(() => {
      currentStep += 1
      pouringSound.volume = Math.max(0, 1 - currentStep / fadeSteps)
      if (currentStep >= fadeSteps) {
        clearInterval(fadeInterval)
        pouringSound.pause()
      }
    }, fadeStepTime)
  }, pouringSoundDurationMs - fadeDuration)
}

export const backgroundMusic = new Audio('/jungle.mp3')
backgroundMusic.volume = 0.5 // Set a lower volume for background music
backgroundMusic.preload = 'auto'
backgroundMusic.loop = true

export const fireworksSound = new Audio('/fireworks.mp3')
fireworksSound.volume = 1
fireworksSound.preload = 'auto'

const winTheme = new Audio('/jojos-golden-wind.mp3')
winTheme.volume = 1
winTheme.preload = 'auto'

/**
 * Setup the background music and effects when the game starts.
 */
export function startEffects() {
  winTheme.pause()
  winTheme.currentTime = 0
  if (backgroundMusic.paused) {
    backgroundMusic.currentTime = 0
    void backgroundMusic.play()
  }
  document.documentElement.classList.remove('color')
}

/**
 * Plays the win ceremony effects: stops background music, plays fireworks and win theme ^^
 */
export function winEffects() {
  backgroundMusic.pause()
  void fireworksSound.play()
  void winTheme.play()
  document.documentElement.classList.add('color')
}
