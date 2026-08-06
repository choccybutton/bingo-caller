# Bingo Caller TV App - Quick Setup Guide

## 5-Minute Quick Start (Android TV / Fire TV)

### Prerequisites
- Bingo Caller server running on your WiFi network
- Android TV, Fire TV, or Google TV device
- Computer with Node.js installed
- USB cable (for development) or ADB over WiFi

### Step 1: Install Dependencies

```bash
cd BingoCaller-TV-App
npm install
```

### Step 2: Build the App

```bash
# Build Android APK
npm run build-android

# This creates: android/app/build/outputs/apk/release/app-release.apk
```

### Step 3: Connect to Your TV

**Option A - USB Connection (Faster):**
```bash
# Enable USB debugging on TV and connect USB cable
adb connect localhost:5037
adb devices  # Should show your TV
```

**Option B - WiFi Connection (Wireless):**
```bash
# Enable ADB over Network on TV (Settings → Developer → ADB over Network)
# Note the TV's IP address
adb connect <TV_IP>:5555
adb devices  # Should show your TV
```

### Step 4: Install and Run

```bash
# Install the APK
adb install android/app/build/outputs/apk/release/app-release.apk

# Launch the app
adb shell am start -n com.bingocallertvapp/com.bingocallertvapp.MainActivity
```

### Step 5: On the TV Screen

1. App launches and auto-scans for the Bingo Caller server
2. If found, it automatically connects
3. If not found:
   - Press OK/Select on remote
   - Manually enter server URL (e.g., `http://192.168.1.42:3000`)
   - Wait for connection

**Done!** The app should now display the live bingo game.

---

## For Samsung TVs (Tizen)

Since Samsung uses Tizen (not Android), you have these options:

### Option 1: Web Browser (Simplest)
1. Open the TV's web browser app
2. Navigate to: `http://<server_ip>:3000/display.html`
3. Press "Fullscreen" button

**Pros:** No installation needed
**Cons:** Requires TV to have web browser support

### Option 2: Samsung Tizen App (Advanced)
1. Download [Samsung Tizen Studio](https://developer.samsung.com/tizen/tizen-studio)
2. Create a Web Application project
3. Copy HTML/CSS/JS from `../Web Application/multi-device/public/display.html`
4. Build and deploy to Samsung TV

**Pros:** Native experience, optimized for Samsung
**Cons:** Requires development tools, more complex

### Option 3: Check if TV Supports Android
Some newer Samsung TVs can run Android apps. Try the Android APK installation if your model supports Google Play.

---

## For Fire TV (Amazon)

### Quick Path:

1. **Build APK (same as Android TV):**
   ```bash
   npm run build-android
   ```

2. **Install via Fire TV:**
   - Go to Fire TV Settings → Development → USB Debugging (Enable)
   - Connect via USB or ADB over WiFi
   - Run: `adb install app-release.apk`

3. **Or use Amazon App Store:**
   - Side-load the APK using developer mode
   - Or submit to Amazon App Store for distribution

**Note:** Fire TV is Android-based, so Android TV app works directly

---

## For Google TV

Google TV is Android-based and uses the same Android APK.

1. Build: `npm run build-android`
2. Install to your Google TV device
3. Connect to WiFi network with Bingo Caller server
4. App auto-detects server or you can enter manually

---

## Development Mode (Optional)

To develop and test changes:

```bash
# Start the development server
npm start

# In another terminal, run on connected device
react-native run-android
```

Watch for hot-reload (changes appear automatically).

---

## Troubleshooting

### Q: "Could not auto-detect server"
**A:** 
- Ensure your TV is on the **same WiFi network** as the server laptop
- Try manually entering the server URL shown when `node server.js` starts
- Check Windows Firewall is allowing Node.js

### Q: "App crashes on startup"
**A:**
- Clear app cache: `adb shell pm clear com.bingocallertvapp`
- Reinstall: `adb uninstall com.bingocallertvapp && adb install app-release.apk`
- Check TV has enough storage space

### Q: "Text-to-speech not working"
**A:**
- App still works without TTS
- Check TV volume is not muted
- Verify TV has TTS engine (Settings → Accessibility)

### Q: "Remote control buttons not working"
**A:**
- Some remotes have different button mappings
- App still works with standard D-pad navigation
- Try pressing OK/Select button to access any menu

---

## Upgrading to New Version

```bash
# Pull latest changes
git pull

# Reinstall dependencies
npm install

# Rebuild APK
npm run clean
npm run build-android

# Reinstall on TV
adb uninstall com.bingocallertvapp
adb install android/app/build/outputs/apk/release/app-release.apk
```

---

## Next Steps

1. **Test with your server:** Make sure the server is running before launching the app
2. **Optimize display:** Adjust TV settings for best picture (brightness, contrast, etc.)
3. **Multiple TVs:** Repeat the installation on each TV - they all connect to the same server
4. **Feedback:** Note any improvements or issues for future updates

---

**Happy calling!** 🎰📺
