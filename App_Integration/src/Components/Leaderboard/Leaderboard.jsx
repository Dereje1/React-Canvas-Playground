import React from 'react';
import './Leaderboard.css';

const dummyData = [
  {
    username: 'Quincy',
    bestScore: Math.round(Math.random() * 1000),
  },
  {
    username: 'Dave',
    bestScore: Math.round(Math.random() * 1000),
  },
  {
    username: 'Joseph',
    bestScore: Math.round(Math.random() * 1000),
  },
  {
    username: 'Donald',
    bestScore: Math.round(Math.random() * 1000),
  },
  {
    username: 'Danica',
    bestScore: Math.round(Math.random() * 1000),
  },
  {
    username: 'Yancy',
    bestScore: Math.round(Math.random() * 1000),
  },
  {
    username: 'belcurv',
    bestScore: Math.round(Math.random() * 1000),
  },
  {
    username: 'terrance',
    bestScore: Math.round(Math.random() * 1000),
  },
  {
    username: 'rbertram8',
    bestScore: Math.round(Math.random() * 1000),
  },
  {
    username: 'Dereje',
    bestScore: Math.round(Math.random() * 1000),
  },
  {
    username: 'Chance',
    bestScore: Math.round(Math.random() * 1000),
  },
  {
    username: 'Adam',
    bestScore: Math.round(Math.random() * 1000),
  },
  {
    username: 'Kate',
    bestScore: Math.round(Math.random() * 1000),
  },
  {
    username: 'Kitty',
    bestScore: Math.round(Math.random() * 1000),
  },
  {
    username: 'Bernard',
    bestScore: Math.round(Math.random() * 1000),
  },
  {
    username: 'Kevin',
    bestScore: Math.round(Math.random() * 1000),
  },
  {
    username: 'Iggy',
    bestScore: Math.round(Math.random() * 1000),
  },
  {
    username: 'terrance',
    bestScore: Math.round(Math.random() * 1000),
  },
  {
    username: 'rbertram8',
    bestScore: Math.round(Math.random() * 1000),
  },
  {
    username: 'Dereje',
    bestScore: Math.round(Math.random() * 1000),
  },
];

const Leaderboard = () => (
  <div className="leaderboard">
    <div className="board">
      <div className="board-header">
        High Scores
      </div>
      {
        dummyData
          .sort((a, b) => b.bestScore - a.bestScore)
          .filter((dummy, index) => index < 10)
          .map(x => (
            <div key={x.username} className="leaderboard-player">
              <p>{x.username}</p>
              <p>{x.bestScore}</p>
            </div>
          ))
      }
    </div>
  </div>
);

export default Leaderboard;
