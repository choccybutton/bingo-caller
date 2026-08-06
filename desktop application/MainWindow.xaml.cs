using System;
using System.Speech.Synthesis;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Shapes;
using System.Windows.Threading;
using BingoCaller.Models;
using BingoCaller.Utilities;

namespace BingoCaller;

public partial class MainWindow : Window
{
    private BingoGame? _game;
    private DispatcherTimer? _autoCallTimer;
    private bool _isPaused;
    private SpeechSynthesizer? _speechSynthesizer;

    public MainWindow()
    {
        InitializeComponent();
        _speechSynthesizer = new SpeechSynthesizer();
    }

    private void StartGameClick(object sender, RoutedEventArgs e)
    {
        var gameType = Ball75Radio.IsChecked == true ? GameType.TSeventyFive : GameType.Ninety;
        _game = new BingoGame(gameType);
        _isPaused = false;

        DrawBingoGrid();
        UpdateUI();

        Ball75Radio.IsEnabled = false;
        Ball90Radio.IsEnabled = false;
        StartButton.IsEnabled = false;
        CallNumberButton.IsEnabled = true;
        PauseButton.IsEnabled = true;

        StatusText.Text = "Playing";
        StatusText.Foreground = new SolidColorBrush(Colors.LimeGreen);

        if (AutoModeRadio.IsChecked == true)
        {
            StartAutoMode();
        }
    }

    private void CallNumberClick(object sender, RoutedEventArgs e)
    {
        if (_game == null || _game.RemainingNumbers == 0)
            return;

        var number = _game.GetNextNumber();
        if (number != null)
        {
            SpeakNumber(number.Value);
            DrawBingoGrid();
            UpdateUI();

            if (_game.RemainingNumbers == 0)
            {
                _autoCallTimer?.Stop();
                StatusText.Text = "Game Complete!";
                StatusText.Foreground = new SolidColorBrush(Colors.Gold);
                CallNumberButton.IsEnabled = false;
            }
        }
    }

    private void PauseClick(object sender, RoutedEventArgs e)
    {
        if (_game == null)
            return;

        _isPaused = !_isPaused;

        if (_isPaused)
        {
            _autoCallTimer?.Stop();
            PauseButton.Content = "Resume";
            StatusText.Text = "Paused";
            StatusText.Foreground = new SolidColorBrush(Colors.Orange);
        }
        else
        {
            PauseButton.Content = "Pause";
            StatusText.Text = "Playing";
            StatusText.Foreground = new SolidColorBrush(Colors.LimeGreen);

            if (AutoModeRadio.IsChecked == true)
            {
                StartAutoMode();
            }
        }
    }

    private void ResetClick(object sender, RoutedEventArgs e)
    {
        _autoCallTimer?.Stop();
        _game = null;
        _isPaused = false;

        NumberGrid.Children.Clear();
        LastNumberText.Text = "Last Called: ---";
        LastFiveText.Text = "---";

        Ball75Radio.IsEnabled = true;
        Ball90Radio.IsEnabled = true;
        StartButton.IsEnabled = true;
        CallNumberButton.IsEnabled = false;
        PauseButton.IsEnabled = false;
        PauseButton.Content = "Pause";

        StatusText.Text = "Ready";
        StatusText.Foreground = new SolidColorBrush(Colors.LimeGreen);
    }

    private void DrawBingoGrid()
    {
        if (_game == null)
            return;

        NumberGrid.Children.Clear();

        int columns = 9;
        if (_game.GameType == GameType.TSeventyFive)
            columns = 9;
        else
            columns = 9;

        for (int i = 0; i < _game.TotalNumbers; i++)
        {
            int number = i + 1;
            bool isCalled = _game.IsCalled(number);

            var ball = CreateBall(number, isCalled);
            Grid.SetColumn(ball, i % columns);
            Grid.SetRow(ball, i / columns);
            NumberGrid.Children.Add(ball);
        }

        NumberGrid.ColumnDefinitions.Clear();
        NumberGrid.RowDefinitions.Clear();

        for (int i = 0; i < columns; i++)
            NumberGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });

        int rows = (int)Math.Ceiling(_game.TotalNumbers / (double)columns);
        for (int i = 0; i < rows; i++)
            NumberGrid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(60) });
    }

    private StackPanel CreateBall(int number, bool isCalled)
    {
        var ball = new StackPanel
        {
            Orientation = Orientation.Vertical,
            HorizontalAlignment = HorizontalAlignment.Center,
            VerticalAlignment = VerticalAlignment.Center,
            Margin = new Thickness(5)
        };

        var circle = new Ellipse
        {
            Width = 50,
            Height = 50,
            Fill = new SolidColorBrush(isCalled ? Colors.LimeGreen : Color.FromRgb(100, 100, 100)),
            Stroke = new SolidColorBrush(Colors.White),
            StrokeThickness = 2
        };

        var textBlock = new TextBlock
        {
            Text = number.ToString(),
            FontSize = 16,
            FontWeight = FontWeights.Bold,
            Foreground = new SolidColorBrush(isCalled ? Colors.White : Colors.Gray),
            HorizontalAlignment = HorizontalAlignment.Center,
            VerticalAlignment = VerticalAlignment.Center,
            Margin = new Thickness(0, -25, 0, 0)
        };

        ball.Children.Add(circle);
        ball.Children.Add(textBlock);

        return ball;
    }

    private void UpdateUI()
    {
        if (_game == null)
            return;

        if (_game.CalledNumbers.Count > 0)
        {
            int lastNumber = _game.CalledNumbers[_game.CalledNumbers.Count - 1];
            LastNumberText.Text = $"Last Called: {lastNumber} ({BingoNameProvider.GetBingoName(lastNumber)})";
            LastNumberText.Foreground = new SolidColorBrush(Colors.LimeGreen);
        }

        if (_game.LastFiveNumbers.Count > 0)
        {
            var numbersString = string.Join(", ", _game.LastFiveNumbers);
            LastFiveText.Text = numbersString;
        }
    }

    private void SpeakNumber(int number)
    {
        try
        {
            string bingoName = BingoNameProvider.GetBingoName(number);
            _speechSynthesizer?.Speak(bingoName);
        }
        catch
        {
            // Silently fail if speech synthesis is not available
        }
    }

    private void StartAutoMode()
    {
        if (!int.TryParse(DelayTextBox.Text, out int delay) || delay < 100)
        {
            DelayTextBox.Text = "2000";
            delay = 2000;
        }

        _autoCallTimer = new DispatcherTimer { Interval = TimeSpan.FromMilliseconds(delay) };
        _autoCallTimer.Tick += (s, e) =>
        {
            if (!_isPaused && _game?.RemainingNumbers > 0)
            {
                CallNumberClick(null, null);
            }
        };
        _autoCallTimer.Start();
    }
}
