using System;
using System.Collections.Generic;
using System.Linq;

namespace BingoCaller.Models;

public enum GameType
{
    TSeventyFive,
    Ninety
}

public class BingoGame
{
    public GameType GameType { get; set; }
    public List<int> Numbers { get; set; }
    public List<int> CalledNumbers { get; set; }
    public Queue<int> LastFiveNumbers { get; set; }

    public BingoGame(GameType gameType)
    {
        GameType = gameType;
        int maxNumber = gameType == GameType.Ninety ? 90 : 75;

        Numbers = Enumerable.Range(1, maxNumber).ToList();
        CalledNumbers = new List<int>();
        LastFiveNumbers = new Queue<int>();

        Shuffle();
    }

    private void Shuffle()
    {
        Random random = new Random();
        for (int i = Numbers.Count - 1; i > 0; i--)
        {
            int randomIndex = random.Next(i + 1);
            (Numbers[i], Numbers[randomIndex]) = (Numbers[randomIndex], Numbers[i]);
        }
    }

    public int? GetNextNumber()
    {
        var remainingNumbers = Numbers.Except(CalledNumbers).ToList();
        if (remainingNumbers.Count == 0)
            return null;

        int nextNumber = remainingNumbers[0];
        CalledNumbers.Add(nextNumber);

        LastFiveNumbers.Enqueue(nextNumber);
        if (LastFiveNumbers.Count > 5)
            LastFiveNumbers.Dequeue();

        return nextNumber;
    }

    public bool IsCalled(int number) => CalledNumbers.Contains(number);

    public int TotalNumbers => GameType == GameType.Ninety ? 90 : 75;

    public int RemainingNumbers => TotalNumbers - CalledNumbers.Count;

    public void Reset()
    {
        CalledNumbers.Clear();
        LastFiveNumbers.Clear();
        Shuffle();
    }
}
