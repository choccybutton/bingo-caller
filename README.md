# Bingo Caller - Web Application

A professional web-based bingo caller that runs entirely in your browser. No server needed - everything runs client-side and works offline!

## Features

- **Game Modes**: Support for both 75-ball (American) and 90-ball (British) games
- **Call Modes**:
  - Manual: Click "Call Number" for each draw
  - Automatic: Set a delay and let the app call numbers automatically
  - Pause: Pause the game while checking for winners, then resume
- **Visual Display**:
  - Interactive grid of numbered balls
  - Called numbers shown in bright green with glow effect
  - Uncalled numbers shown in grey
  - Display of the last 5 called numbers
  - Real-time status showing called and remaining numbers
- **Authentic British Bingo Names**: Numbers are called using traditional British bingo terminology:
  - "Kelly's eye" for 1
  - "Two little ducks" for 22
  - "Legs eleven" for 11
  - "All the threes" for 33
  - "Garden gate" for 8
  - And many more!
- **Text-to-Speech**: Numbers are announced using your browser's speech synthesis with authentic British bingo terms
- **Fully Responsive**: Works on desktop, tablet, and mobile devices
- **Works Offline**: All code runs in your browser - no internet connection needed after first load

## How to Use

1. **Open the Application**:
   - Simply open `index.html` in any modern web browser
   - Works with Chrome, Firefox, Safari, Edge, etc.

2. **Select Game Type**:
   - Choose between **75 Ball** (American) or **90 Ball** (British)

3. **Select Mode**:
   - **Manual**: Click "Call Number" to draw each ball
   - **Auto**: Numbers are drawn automatically at the set interval

4. **Set Delay (for Auto mode)**:
   - Enter the time between calls in milliseconds (default: 2000ms = 2 seconds)
   - Minimum: 100ms, Maximum: 60,000ms

5. **Start the Game**:
   - Click "Start Game" to begin
   - Numbers will start being called according to your chosen mode

6. **During the Game**:
   - Watch the grid update as numbers are called
   - Listen to the spoken number announcements
   - Check the "Last Called" display for the most recent number
   - View the "Last 5 Numbers" section at the bottom
   - See real-time count of called and remaining numbers

7. **Pause/Resume**:
   - Click "Pause" to pause the game (e.g., while checking for a winner)
   - Click "Resume" to continue from where you left off
   - In Auto mode, the timer will stop and resume with you

8. **Reset**:
   - Click "Reset" to start a new game at any time
   - This clears all called numbers and allows you to configure a new game

## Authentic British Bingo Names

The application uses traditional British bingo caller terminology:

| Number | Name |
|--------|------|
| 1 | Kelly's eye |
| 2 | One little duck |
| 3 | Cup of tea |
| 7 | Lucky seven |
| 8 | Garden gate |
| 11 | Legs eleven |
| 22 | Two little ducks |
| 33 | All the threes |
| 44 | All the fours |
| 55 | All the fives |
| 66 | All the sixes |
| 77 | All the sevens |
| 88 | All the eights |

And many more for numbers 1-90!

## Technical Details

- **Pure HTML/CSS/JavaScript**: No dependencies or frameworks required
- **Client-Side Processing**: All logic runs in your browser
- **Web Speech API**: Uses browser's built-in text-to-speech for number announcements
- **Responsive Design**: Adapts to different screen sizes automatically
- **Cross-Browser Compatible**: Works on all modern browsers

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (including mobile)
- IE11: Not supported (uses modern JavaScript)

## Tips & Tricks

- **Sound**: Make sure your browser and system volume are turned up to hear the number announcements
- **Multiple Players**: This works great for groups - display on a projector or large monitor
- **Customizable Speed**: Adjust the auto-mode delay to suit your pace:
  - 1000ms (1 second) = Fast game
  - 2000ms (2 seconds) = Standard pace
  - 3000-5000ms = Slower, more relaxed pace
- **Pause for Winners**: When someone calls a winner, click "Pause" to check their card without new numbers being called

## Troubleshooting

**Sound not working?**
- Check that your browser volume is turned up
- Check that your system volume is not muted
- Try a different browser - some browsers have different speech synthesis support
- Refresh the page and try again

**Numbers not appearing?**
- Try refreshing the page (F5 or Cmd+R)
- Clear your browser cache
- Try a different browser

**App not loading?**
- Make sure you're opening `index.html` directly in your browser
- If opening from a file, you may need to use a local web server (e.g., Python's `python -m http.server`)

## File Structure

```
Web Application/
├── index.html      (Single HTML file with all code and styles)
└── README.md       (This file)
```

That's it! One simple HTML file with everything built in.

## Enjoy Your Game!

Good luck with your bingo games! Whether you're running a community game or playing with friends and family, this bingo caller has everything you need. 🎰
