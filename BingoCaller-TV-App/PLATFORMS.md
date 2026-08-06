# TV Platform Support Guide

This document details how to install and run the Bingo Caller TV app on different TV platforms.

## Platform Comparison

| Platform | App Type | Market Share | Ease | Notes |
|----------|----------|--------------|------|-------|
| **Android TV** | Native App (APK) | 35% | ⭐⭐⭐⭐⭐ | **Recommended** |
| **Fire TV** | Native App (APK) | 25% | ⭐⭐⭐⭐⭐ | Works great |
| **Google TV** | Native App (APK) | 15% | ⭐⭐⭐⭐⭐ | Modern Android TV |
| **Samsung Tizen** | Web App or Tizen | 15% | ⭐⭐⭐⭐ | Web browser easiest |
| **LG WebOS** | Web App | 5% | ⭐⭐⭐ | Via web browser |
| **Apple TV** | Native tvOS App | 5% | ⭐⭐⭐⭐ | Separate build |

## Android TV (Sony, Generic, etc.)

### What It Is
Generic Android TV interface used by Sony, Philips, Hisense, TCL, and others.

### Installation

**Method 1: USB Connection (Fastest)**
```bash
# 1. Enable USB Debugging on TV
#    Settings → Developer Options → USB Debugging (Enable)

# 2. Connect USB cable from computer to TV

# 3. From project directory
adb devices  # Should see your TV listed

# 4. Install the app
npm run build-android
adb install android/app/build/outputs/apk/release/app-release.apk

# 5. Launch
adb shell am start -n com.bingocallertvapp/com.bingocallertvapp.MainActivity
```

**Method 2: WiFi Connection (Wireless)**
```bash
# 1. Enable ADB over Network on TV
#    Settings → Developer Options → ADB over Network (Enable)
#    Note the IP address shown

# 2. From computer
adb connect <TV_IP>:5555
adb devices

# 3. Install and launch (same as above)
adb install android/app/build/outputs/apk/release/app-release.apk
adb shell am start -n com.bingocallertvapp/com.bingocallertvapp.MainActivity
```

### Remote Control
- **D-Pad:** Navigate
- **OK/Select:** Confirm
- **Back:** Exit app
- **Home:** Return to TV home screen

### Troubleshooting
- Can't connect via ADB? Try: `adb kill-server && adb start-server`
- TV not showing USB option? Try different USB port or cable
- WiFi won't connect? Make sure TV is on same network as computer

---

## Fire TV (Amazon)

### What It Is
Amazon's Android-based TV platform. Works on Fire TV devices and Fire TV Edition TVs.

### Installation

**Method 1: Developer Options (Recommended)**
```bash
# 1. On Fire TV: Settings → Device & Accessories → Developer Options
#    Enable "USB Debugging" and "ADB over Network"
#    Note the IP address

# 2. Connect via ADB
adb connect <FireTV_IP>:5555
adb devices

# 3. Install
npm run build-android
adb install android/app/build/outputs/apk/release/app-release.apk

# 4. Launch
adb shell am start -n com.bingocallertvapp/com.bingocallertvapp.MainActivity
```

**Method 2: Side-load via USB**
```bash
# 1. Enable USB Debugging on Fire TV

# 2. Connect USB cable

# 3. Build and install
npm run build-android
adb install android/app/build/outputs/apk/release/app-release.apk
```

**Method 3: Amazon Appstore (For Distribution)**
- Submit APK to Amazon Appstore
- Users can install from Appstore on their Fire TV
- Requires Amazon Developer account

### Fire TV Stick Specifics
- **Performance:** Works well on Fire TV Stick 4K (recommended)
- **Older Sticks:** May run slower on 1st gen Fire Stick
- **Fire TV Cube:** Excellent performance
- **Fire TV Edition TVs:** Best experience (dedicated hardware)

### Remote Control
- **D-Pad:** Navigate
- **Select:** Confirm
- **Back:** Exit app
- **Home:** Return to Fire TV home
- **Microphone Button:** Can't be used by apps

---

## Google TV

### What It Is
Google's modern Android TV interface (replacement for traditional Android TV).

### Installation
Same as Android TV - Google TV is built on Android.

```bash
adb connect <GoogleTV_IP>:5555
npm run build-android
adb install android/app/build/outputs/apk/release/app-release.apk
```

### Google TV Specifics
- Newer UI with better recommendations
- Better integration with Google services
- Works perfectly with the Bingo Caller app
- Available on Sony, TCL, and other manufacturers

### Performance
- Excellent on modern hardware
- Recommended platform for new deployments

---

## Samsung Tizen

### What It Is
Samsung's proprietary TV operating system (not Android).

### Installation Options

#### Option 1: Web Browser (Simplest - Recommended)

**Requirements:**
- Samsung TV with web browser app
- TV connected to WiFi network

**Steps:**
1. On TV, open the web browser app (apps menu)
2. Navigate to: `http://<server_ip>:3000/display.html`
3. Wait for it to load
4. Press the "Fullscreen" button (if available)
5. Use remote to navigate if needed

**Pros:**
- No installation needed
- Works on any Samsung TV with browser
- Instant update (no rebuild needed)

**Cons:**
- Requires browser app to be available
- May be slightly slower than native app

#### Option 2: Samsung Tizen App (Advanced)

**Requirements:**
- Samsung Tizen Studio
- Tizen SDK
- Samsung Developer Account
- Samsung TV with developer mode enabled

**Steps:**

1. **Install Tizen Studio:**
   - Download from: https://developer.samsung.com/tizen/tizen-studio
   - Install on your computer

2. **Create Tizen Web Project:**
   - Open Tizen Studio
   - File → New → Web Application
   - Select "Web Application" template

3. **Copy App Files:**
   - Copy HTML/CSS/JS from: `../Web Application/multi-device/public/`
   - Paste into Tizen project's `web/` folder
   - Update any server URL references if needed

4. **Build Package:**
   - Right-click project → Build
   - Creates `.wgt` file (Tizen package)

5. **Deploy to TV:**
   - Enable Developer Mode on TV
   - Tools → Device Manager → Connect TV
   - Right-click project → Run As → Tizen Web Application

6. **Certify (For Distribution):**
   - Create certificates via Tizen SDK
   - Sign and distribute on Samsung App Store

**Pros:**
- Native app experience
- Optimized for Samsung
- Professional distribution option

**Cons:**
- Requires development tools
- More complex setup
- Need developer account for distribution

#### Option 3: Check for Android Support

Some newer Samsung TVs (especially 2019+) support Android apps:
- Settings → Apps → Unknown Sources (Enable)
- Transfer APK via USB or install via ADB
- Try running the Android APK

**Success depends on TV model.**

### Samsung TV Specifics

| TV Year | Tizen Support | Web Browser | Android Apps |
|---------|---------------|-------------|--------------|
| 2022+ | ✅ Yes | ✅ Yes | ⚠️ Some |
| 2020-2021 | ✅ Yes | ✅ Yes | ⚠️ Some |
| 2019 | ✅ Yes | ⚠️ Limited | ✅ Yes |
| 2018 | ✅ Yes | ✅ Yes | ❌ No |
| 2017- | ✅ Yes | ✅ Basic | ❌ No |

### Remote Control
- **D-Pad:** Navigate
- **Enter:** Confirm
- **Back:** Exit
- **Smart Hub:** Return to TV menu

---

## LG WebOS

### What It Is
LG's smart TV operating system.

### Installation

#### Recommended: Web Browser

1. Open LG web browser app
2. Navigate to: `http://<server_ip>:3000/display.html`
3. App loads and displays bingo game

#### Advanced: LG Developer Mode

If your TV supports it:
1. Settings → Developer → Enable Developer Mode
2. Enable "Allow LG Connect Apps"
3. Use LG SDK to deploy web app

### LG WebOS Specifics
- Modern TVs (2020+) have excellent web browser support
- Older LGs may have limited browser
- No native app SDK publicly available

### Remote Control
- **Arrow Keys:** Navigate
- **OK:** Confirm
- **Back:** Exit
- **Home:** Return to LG menu

---

## Apple TV (tvOS)

### What It Is
Apple's TV operating system for Apple TV devices.

### Requirements
- Apple TV (4th gen or later)
- Xcode on macOS
- Apple Developer Account

### Installation

```bash
# 1. Install dependencies
pod install

# 2. Open in Xcode
open BingoCaller-TV-App.xcworkspace

# 3. Build for tvOS
# Select "Apple TV" as build target in Xcode

# 4. Run on device
xcodebuild -scheme BingoCaller -configuration Release -destination generic/platform=tvOS
```

### Apple TV Specifics
- Best performance on Apple TV 4K
- Full native experience
- Requires macOS computer to build
- Can be distributed on Apple TV App Store

---

## Unsupported Platforms

### Roku
❌ **Not Supported** - Roku uses proprietary SDK not compatible with React Native

**Workaround:** Use web browser if Roku has web app support (rare)

### Conventional Smart TVs without Smart OS
❌ **Not Directly Supported** - Some older TVs with limited smart features

**Workaround:** 
- Connect external device (Fire TV Stick, Roku, Apple TV, Android TV box)
- Use that device to run the app

---

## Multi-TV Setup Recommendation

For the best experience across multiple TVs:

1. **Primary Display (Large/Venue):** Use Android TV or Fire TV (most reliable)
2. **Secondary Displays:** Use Fire TV Sticks (affordable, consistent)
3. **Samsung TV:** Use web browser option (simplest)
4. **LG TV:** Use web browser option (simplest)
5. **Apple TV (if available):** Use tvOS app (premium experience)

Example Setup:
- Main Display: 65" Fire TV Edition TV
- Side Screen: 43" Samsung using web browser
- Backup Screen: Fire TV Stick

All connect to same Bingo Caller server, all update simultaneously.

---

## Performance Notes

### Recommended Hardware Tier

| Category | Excellent | Good | Acceptable |
|----------|-----------|------|-----------|
| **Android TV** | TV 2020+ | TV 2018+ | TV 2016+ |
| **Fire TV** | Fire TV 4K | Fire TV Stick 4K | Fire Stick 2nd Gen |
| **Samsung** | 2020+ Tizen | 2018+ Tizen | Web Browser only |
| **Apple TV** | Apple TV 4K | Apple TV HD | (Older unsupported) |

### Things That Affect Performance
- **Network Speed:** Need stable WiFi (5GHz recommended)
- **Server Distance:** Keep server close to TV
- **TV Age:** Older hardware = slower rendering
- **Other Apps:** Close background apps to free up RAM

---

## Getting Support for Your TV

If having issues with a specific TV:

1. Check platform compatibility above
2. Try web browser option first (if available)
3. Verify TV is on same WiFi network as server
4. Run server diagnostics: `curl http://192.168.1.x:3000/api/state`
5. Check TV Developer/USB settings enabled
6. Try different USB cable or WiFi connection

---

**Still stuck?** Check the main README.md Troubleshooting section or refer to your TV's manual for Developer Mode instructions.
