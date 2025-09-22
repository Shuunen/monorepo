// oxlint-disable no-magic-numbers, id-length, no-console, max-nested-callbacks, no-explicit-any, max-lines-per-function, no-null, class-methods-use-this
/** biome-ignore-all lint/correctness/noNodejsModules: we can use node here */
/** biome-ignore-all lint/style/useNamingConvention: it's Electron conventions */
import { join } from 'node:path'
import { type CapacitorElectronConfig, CapacitorSplashScreen, CapElectronEventEmitter, setupCapacitorElectronPlugins } from '@capacitor-community/electron'
import chokidar from 'chokidar'
import { app, BrowserWindow, Menu, MenuItem, type MenuItemConstructorOptions, nativeImage, Tray } from 'electron'
import electronIsDev from 'electron-is-dev'
import electronServe from 'electron-serve'
import windowStateKeeper from 'electron-window-state'

// Define components for a watcher to detect when the webapp is changed so we can reload in Dev mode.
const reloadWatcher = {
  debouncer: null,
  ready: false,
  watcher: null,
}

export function setupReloadWatcher(electronCapacitorApp: ElectronCapacitorApp): void {
  reloadWatcher.watcher = chokidar
    .watch(join(app.getAppPath(), 'app'), {
      // biome-ignore lint/performance/useTopLevelRegex: fix me later
      ignored: /[/\\]\./,
      persistent: true,
    })
    .on('ready', () => {
      reloadWatcher.ready = true
    })
    .on('all', (_event, _path) => {
      if (reloadWatcher.ready) {
        clearTimeout(reloadWatcher.debouncer)
        reloadWatcher.debouncer = setTimeout(() => {
          electronCapacitorApp.getMainWindow().webContents.reload()
          reloadWatcher.ready = false
          clearTimeout(reloadWatcher.debouncer)
          reloadWatcher.debouncer = null
          reloadWatcher.watcher = null
          setupReloadWatcher(electronCapacitorApp)
        }, 1500)
      }
    })
}

// Define our class to manage our app.
export class ElectronCapacitorApp {
  private MainWindow: BrowserWindow | null = null
  private SplashScreen: CapacitorSplashScreen | null = null
  private TrayIcon: Tray | null = null
  private CapacitorFileConfig: CapacitorElectronConfig
  private TrayMenuTemplate: (MenuItem | MenuItemConstructorOptions)[] = [new MenuItem({ label: 'Quit App', role: 'quit' })]
  private AppMenuBarMenuTemplate: (MenuItem | MenuItemConstructorOptions)[] = [{ role: process.platform === 'darwin' ? 'appMenu' : 'fileMenu' }, { role: 'viewMenu' }]
  private mainWindowState
  private loadWebApp
  private customScheme: string

  constructor(capacitorFileConfig: CapacitorElectronConfig, trayMenuTemplate?: (MenuItemConstructorOptions | MenuItem)[], appMenuBarMenuTemplate?: (MenuItemConstructorOptions | MenuItem)[]) {
    this.CapacitorFileConfig = capacitorFileConfig

    this.customScheme = this.CapacitorFileConfig.electron?.customUrlScheme ?? 'capacitor-electron'

    if (trayMenuTemplate) this.TrayMenuTemplate = trayMenuTemplate

    if (appMenuBarMenuTemplate) this.AppMenuBarMenuTemplate = appMenuBarMenuTemplate

    // Setup our web app loader, this lets us load apps like react, vue, and angular without changing their build chains.
    this.loadWebApp = electronServe({
      directory: join(app.getAppPath(), 'app'),
      scheme: this.customScheme,
    })
  }

  // Helper function to load in the app.
  // biome-ignore lint/suspicious/noExplicitAny: it's ok here
  private async loadMainWindow(thisRef: any) {
    await thisRef.loadWebApp(thisRef.MainWindow)
  }

  // Expose the mainWindow ref for use outside of the class.
  getMainWindow(): BrowserWindow {
    return this.MainWindow
  }

  getCustomURLScheme(): string {
    return this.customScheme
  }

  init() {
    const icon = nativeImage.createFromPath(join(app.getAppPath(), 'assets', process.platform === 'win32' ? 'appIcon.ico' : 'appIcon.png'))
    this.mainWindowState = windowStateKeeper({
      defaultHeight: 800,
      defaultWidth: 1000,
    })
    // Setup preload script path and construct our main window.
    const preloadPath = join(app.getAppPath(), 'build', 'src', 'preload.js')
    this.MainWindow = new BrowserWindow({
      height: this.mainWindowState.height,
      icon,
      show: false,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: true,
        // Use preload to inject the electron variant overrides for capacitor plugins.
        // preload: join(app.getAppPath(), "node_modules", "@capacitor-community", "electron", "dist", "runtime", "electron-rt.js"),
        preload: preloadPath,
        // prevent CORS issues :p
        webSecurity: false,
      },
      width: this.mainWindowState.width,
      x: this.mainWindowState.x,
      y: this.mainWindowState.y,
    })
    this.mainWindowState.manage(this.MainWindow)

    if (this.CapacitorFileConfig.backgroundColor) this.MainWindow.setBackgroundColor(this.CapacitorFileConfig.electron.backgroundColor)

    // If we close the main window with the splashscreen enabled we need to destroy the ref.
    this.MainWindow.on('closed', () => {
      if (this.SplashScreen?.getSplashWindow() && !this.SplashScreen.getSplashWindow().isDestroyed()) this.SplashScreen.getSplashWindow().close()
    })

    // When the tray icon is enabled, setup the options.
    if (this.CapacitorFileConfig.electron?.trayIconAndMenuEnabled) {
      this.TrayIcon = new Tray(icon)
      this.TrayIcon.on('double-click', () => {
        if (this.MainWindow)
          if (this.MainWindow.isVisible()) this.MainWindow.hide()
          else {
            this.MainWindow.show()
            this.MainWindow.focus()
          }
      })
      this.TrayIcon.on('click', () => {
        if (this.MainWindow)
          if (this.MainWindow.isVisible()) this.MainWindow.hide()
          else {
            this.MainWindow.show()
            this.MainWindow.focus()
          }
      })
      this.TrayIcon.setToolTip(app.getName())
      this.TrayIcon.setContextMenu(Menu.buildFromTemplate(this.TrayMenuTemplate))
    }

    // Setup the main manu bar at the top of our window.
    Menu.setApplicationMenu(Menu.buildFromTemplate(this.AppMenuBarMenuTemplate))

    // If the splashscreen is enabled, show it first while the main window loads then switch it out for the main window, or just load the main window from the start.
    if (this.CapacitorFileConfig.electron?.splashScreenEnabled) {
      this.SplashScreen = new CapacitorSplashScreen({
        imageFilePath: join(app.getAppPath(), 'assets', this.CapacitorFileConfig.electron?.splashScreenImageName ?? 'splash.png'),
        windowHeight: 400,
        windowWidth: 400,
      })
      this.SplashScreen.init(this.loadMainWindow, this)
    } else
      this.loadMainWindow(this).catch(error => {
        // biome-ignore lint/suspicious/noConsole: it's ok in this context
        console.error('Error loading main window:', error)
      })

    // Security
    this.MainWindow.webContents.setWindowOpenHandler(details => {
      if (!details.url.includes(this.customScheme)) return { action: 'deny' }

      return { action: 'allow' }
    })
    this.MainWindow.webContents.on('will-navigate', (event, _newURL) => {
      if (!this.MainWindow.webContents.getURL().includes(this.customScheme)) event.preventDefault()
    })

    // Link electron plugins into the system.
    setupCapacitorElectronPlugins()

    // When the web app is loaded we hide the splashscreen if needed and show the mainwindow.
    this.MainWindow.webContents.on('dom-ready', () => {
      if (this.CapacitorFileConfig.electron?.splashScreenEnabled) this.SplashScreen.getSplashWindow().hide()

      if (!this.CapacitorFileConfig.electron?.hideMainWindowOnLaunch) this.MainWindow.show()

      setTimeout(() => {
        if (electronIsDev) this.MainWindow.webContents.openDevTools()

        CapElectronEventEmitter.emit('CAPELECTRON_DeeplinkListenerInitialized', '')
        // oxlint-disable-next-line no-magic-numbers
      }, 400)
    })
  }
}
