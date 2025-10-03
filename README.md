## 🎲 Board games
This is a collection of web-based emulations of several real-world board games. It includes:

- blackjack-like card game [Flip 7](https://theop.games/products/flip-7),
- a modified version of hidden-role game [One Night Ultimate Werewolf](https://beziergames.com/products/one-night-ultimate-werewolf),
- and strategy board game [Wandering Towers](https://boardgamegeek.com/boardgame/355483/wandering-towers).

I do not claim ownership to any of these games -- I just developed web-based versions of them of my own volition.

Each game comes with a "What is this?" page describing more about how to play and how to utilize the site!

### Technical notes
These games were developed with pure HTML, CSS and JavaScript. Some utilize the object-to-DOM model, i.e., transformations from a JS object such as:
```js
{
  tag: 'i',
  style: 'font-weight: bold',
  children: 'Hello world!'
}
```
into an element such as: **_Hello world!_**.

These websites are all purely static and either rely on players to propagate game information themselves or only rely on one player to "host" i.e. communicate decisions from and broadcast game state to each player.
