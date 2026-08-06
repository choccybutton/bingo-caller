# Bingo Caller - Windows Desktop Application

A professional Windows desktop application for calling bingo numbers with authentic British bingo terminology, visual ball display, and text-to-speech support.

## Features

- **Game Modes**: Support for both 75-ball (American) and 90-ball (British) games
- **Call Modes**:
  - Manual: Click to call each number
  - Automatic: Set a delay and let the app call numbers automatically
  - Pause: Pause the game while checking for winners
- **Visual Display**:
  - Grid of numbered balls
  - Called numbers shown in bright green with white text
  - Uncalled numbers shown in grey
  - Display of the last 5 called numbers
- **Authentic British Bingo Names**: Numbers are called using traditional British bingo terminology (e.g., "legs eleven" for 11, "two little ducks" for 22)
- **Text-to-Speech**: Numbers are announced using Windows speech synthesis with authentic British bingo terms

## Requirements

- Windows 10 or later
- .NET 8.0 Runtime

## How to Build

1. Open PowerShell in the `desktop application` directory
2. Run: `dotnet build`
3. To run: `dotnet run`

Or use Visual Studio to build and run the project.

## How to Use

1. **Select Game Type**:
   - Choose between 75-ball or 90-ball game
   
2. **Select Mode**:
   - **Manual**: Click "Call Number" for each draw
   - **Auto**: Set delay (in milliseconds) and select "Auto" - numbers will be called automatically
   
3. **Start**: Click "Start Game" to begin

4. **During Game**:
   - Watch the grid update as numbers are called
   - Listen for the spoken number announcements
   - Check the "Last 5 Numbers" display
   
5. **Pause**: Click "Pause" when someone calls a winner (to check the ticket)

6. **Resume**: Click "Pause" again (now showing "Resume") to continue

7. **Reset**: Click "Reset" to start a new game

## Authentic Bingo Names

The application uses authentic British bingo terminology:
- 1: "One"
- 2: "Two little ducks"
- 11: "Legs eleven"
- 22: "Two little ducks"
- 33: "All the threes"
- 44: "All the fours"
- 55: "All the fives"
- 66: "All the sixes"
- 77: "All the sevens"
- 88: "All the eights"
- 90: "Ninety"

And many more traditional names throughout the game!

## Customization

You can adjust the auto-mode delay by changing the value in the "Delay (ms)" field. The minimum is 100ms.
