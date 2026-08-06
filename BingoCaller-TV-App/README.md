# Bingo Caller TV App

A React Native TV application for displaying live bingo games on multiple TV platforms:
- **Android TV** (Google TV)
- **Fire TV** (Amazon)
- **Samsung Tizen** (separate app - see below)
- **Apple TV** (tvOS - optional)

## Features

- 📺 Full-screen bingo number display optimized for 10-foot TV viewing
- 🎰 Live ball grid showing called/uncalled numbers
- 🔊 Text-to-speech announcements with volume control
- 🌐 Live updates via Server-Sent Events (SSE)
- 📡 Auto-detect server on local WiFi network
- 🎮 Remote control support (D-pad navigation)
- 💚 Responsive design for all TV resolutions (HD, Full HD, 4K)
- 🔴 Connection status indicator
- ⚡ Minimal memory footprint for older TV hardware

## Requirements

- **Node.js** 16+
- **React Native CLI** or **Expo CLI**
- **Android NDK** (for building Android/Fire TV apps)
- **Java Development Kit (JDK)** 11 or higher
- **Bingo Caller Server** running on local WiFi network (see main project README)

## Installation

### 1. Setup React Native Development Environment

```bash
# Install React Native CLI
npm install -g react-native-cli

# Or use Expo (simpler for beginners)
npm install -g expo-cli
```

### 2. Clone the Project

```bash
cd "C:\Dev\repos\Bingo Caller\BingoCaller-TV-App"
npm install
```

### 3. Configure Android SDK

```bash
# Set ANDROID_HOME environment variable
# On Windows:
set ANDROID_HOME=%USERPROFILE%\AppData\Local\Android\Sdk
```

## Building & Deploying

### Android TV / Fire TV / Google TV

#### Option A: Direct Installation (Development)

```bash
# Connect TV via ADB (Android Debug Bridge)
adb connect <TV_IP_ADDRESS>:5555

# Build and install APK
npm run android

# Or
react-native run-android --variant=release
```

#### Option B: Build APK for Distribution

```bash
npm run build-android

# APK will be at:
# android/app/build/outputs/apk/release/app-release.apk
```

#### Step-by-Step TV Installation:

1. **Enable Developer Mode on TV:**
   - Go to Settings → Developer Options
   - Enable USB Debugging
   - Enable ADB over Network
   - Note the TV's IP address

2. **Connect via ADB:**
   ```bash
   adb connect <TV_IP>:5555
   adb devices  # Should show your TV
   ```

3. **Install the App:**
   ```bash
   adb install android/app/build/outputs/apk/release/app-release.apk
   ```

4. **Launch the App:**
   ```bash
   adb shell am start -n com.bingocallertvapp/com.bingocallertvapp.MainActivity
   ```

5. **On the TV:**
   - App will auto-detect the server on your WiFi
   - If manual config needed, use TV remote D-pad to navigate settings
   - Default server port: 3000

### Sideloading APK to Fire TV

1. **Enable Developer Options** on Fire TV
2. **Build APK:**
   ```bash
   npm run build-android
   ```
3. **Upload to Fire TV:**
   - Use Fire TV's Manage Installed Applications
   - Select "Install an App from a File"
   - Choose the APK from your device

### Apple TV (tvOS)

```bash
# Setup tvOS development
pod install --repo-update

# Run on tvOS simulator
react-native run-ios --tv

# Build for device
xcodebuild -scheme BingoCaller -configuration Release -destination generic/platform=tvOS
```

## Samsung Tizen TV Support

**Note:** Samsung Tizen uses a different runtime. For Samsung TVs, use one of these approaches:

### Option 1: Samsung Tizen Studio (Recommended for Samsung)

1. Download **Samsung Tizen Studio**
2. Create a new Web Application project
3. Use the `web/` folder contents (HTML/CSS/JS) adapted from the original `display.html`
4. Package as a Tizen app
5. Install on Samsung TV via USB or Samsung Apps

### Option 2: Web-based Fallback

If your Samsung TV has a web browser or SmartTV app platform:
- Access the bingo display directly via web browser
- Navigate to: `http://<server_ip>:3000/display.html`
- This works if your TV supports browser access to LAN addresses

### Option 3: Use Android TV Display on Samsung (if TV supports it)

Some Samsung TVs can run Android apps. Try installing the Android APK if your model supports it.

## Network Configuration

### Auto-Detection

The app will attempt to find the server automatically on:
- 192.168.1.1:3000
- 192.168.0.1:3000
- 192.168.0.100:3000
- 10.0.0.1:3000

### Manual Configuration

If auto-detection fails:

1. Start the server on your laptop:
   ```bash
   cd "C:\Dev\repos\Bingo Caller\Web Application\multi-device"
   node server.js
   ```

2. Note the LAN IP shown (e.g., `http://192.168.1.42:3000`)

3. On the TV app:
   - Press back/menu to access settings
   - Enter the server URL manually
   - Test connection

## Remote Control Support

The app responds to standard TV remote commands:

| Button | Action |
|--------|--------|
| **Up** | Scroll up (future feature) |
| **Down** | Scroll down (future feature) |
| **Left** | Brightness down |
| **Right** | Brightness up |
| **OK/Select** | Open settings menu |
| **Back** | Exit app |

## Troubleshooting

### App Won't Connect to Server

1. **Check WiFi:** Ensure TV and server laptop are on the same network
   ```bash
   # On TV: Check Settings → WiFi
   # Verify IP address range is compatible
   ```

2. **Test Server:** From TV, try to access in a browser:
   ```
   http://<server_ip>:3000/api/state
   ```

3. **Firewall:** Allow Node.js through Windows Firewall
   - Windows Settings → Firewall & Network Protection
   - Allow an app through firewall
   - Check Node.js

4. **Try Manual Entry:**
   - Instead of auto-detect, manually enter server URL in app settings

### App Crashes or Freezes

1. **Low Memory:** Some older TVs have limited RAM
   - Close other apps
   - Restart the app

2. **Update:** Ensure you're running the latest app version

3. **Check Logs:**
   ```bash
   adb logcat | grep BingoCaller
   ```

### Text-to-Speech Not Working

1. **Check Volume:** TV volume must not be muted
2. **TTS Engine:** Verify TV has text-to-speech support
   - Settings → Accessibility → Text-to-Speech
3. **Fallback:** App will continue working without TTS

### Display Resolution Issues

The app automatically adapts to TV resolution (HD/Full HD/4K). If text is too small/large:

1. Check TV resolution settings
2. Try adjusting TV display settings
3. Report issue with TV model details

## Development

### Project Structure

```
BingoCaller-TV-App/
├── App.js                          # Main app entry point
├── index.js                        # React Native entry
├── package.json                    # Dependencies
├── app.json                        # App config
└── src/
    ├── components/                 # UI components
    │   ├── GameDisplay.js         # Last called number display
    │   ├── NumberGrid.js          # Ball grid
    │   ├── LastNumbers.js         # Last 5 numbers
    │   ├── StatusBar.js           # Game status
    │   └── ConnectionStatus.js    # Server connection status
    ├── hooks/                      # React hooks
    │   ├── useGameState.js        # Game state management
    │   └── useServerConnection.js # SSE connection
    └── styles/
        └── theme.js               # Colors, fonts, spacing
```

### Running in Development

```bash
# Start development server
npm start

# In another terminal, run on Android
react-native run-android

# View logs
react-native logs android
```

### Building Production APK

```bash
# Clean previous builds
npm run clean

# Build release APK
npm run build-android

# Signed APK (requires keystore)
# See: https://reactnative.dev/docs/signed-apk-android
```

## Performance Optimization

- App uses minimal dependencies for fast loading
- SSE connection keeps network usage low
- Text-to-speech is asynchronous (doesn't block UI)
- Ball grid uses efficient rendering
- Responsive design scales automatically

## Platform Compatibility Matrix

| Platform | Status | Notes |
|----------|--------|-------|
| **Android TV** | ✅ Full Support | Tested on Android 5.0+ |
| **Google TV** | ✅ Full Support | Recommended |
| **Fire TV** | ✅ Full Support | Stick, Cube, and Fire TV Edition |
| **Samsung Tizen** | ⚠️ Partial* | Use web browser or Tizen Studio |
| **Apple TV** | ✅ Full Support | tvOS 13+ |
| **LG WebOS** | ⚠️ Limited** | Use web browser via LG Store |
| **Sony Android TV** | ✅ Full Support | Android-based |
| **Roku** | ❌ Not Supported | Roku uses proprietary SDK |

*See Samsung Tizen section above
**Some LG TVs support web apps via LG Developer Mode

## Contributing

To add features or fix bugs:

1. Create a feature branch
2. Make changes in `src/`
3. Test on actual TV device
4. Submit PR with description

## License

Part of the Bingo Caller project.

## Support

For issues:
1. Check this README's Troubleshooting section
2. Check the main Bingo Caller project documentation
3. Verify your TV model in the Compatibility Matrix

---

**Ready to use?** Make sure your Bingo Caller server is running, then start the app and enjoy live bingo on your TV! 📺🎰
