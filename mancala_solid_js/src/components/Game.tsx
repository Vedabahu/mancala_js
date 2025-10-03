
import { createSignal, Show, onMount } from 'solid-js';
import {
  prepareGame,
  playTurn,
  canContinueToPlay,
  finalizeGame,
} from '../game/engine';
import { Player, Prizes } from '../game/types';
import { minimaxAB } from '../game/ai';
import Board from './Board';
import PlayerComponent from './Player';
import Settings from './Settings';
import { GameModeEnum } from './GameStartPopup';
import WinnerPopup from './WinnerPopup';
import GameStartPopup from './GameStartPopup';
import StonesToMove from './StonesToMove';
import styles from './Game.module.css';

const Game = () => {
  const [numberOfStones, setNumberOfStones] = createSignal(4);
  const [gameState, setGameState] = createSignal(prepareGame(numberOfStones()));
  const [currentPlayer, setCurrentPlayer] = createSignal(Player.PLAYER_1);
  const [winner, setWinner] = createSignal<Prizes | null>(null);
  const [gameMode, setGameMode] = createSignal<GameModeEnum | null>(null);
  const [focusedPit, setFocusedPit] = createSignal<number | null>(null);
  const [isAnimating, setIsAnimating] = createSignal(false);
  const [stonesToMove, setStonesToMove] = createSignal(0);

  const handleSettingsChange = (stones: number) => {
    setNumberOfStones(stones);
    restartGame(stones);
  };

  const startGame = (mode: GameModeEnum) => {
    setGameMode(mode);
    restartGame(numberOfStones());
    if (mode === GameModeEnum.AVA) {
      setTimeout(() => handleAITurn(Player.PLAYER_1), 500);
    }
  };

  const animateTurn = (
    states: number[][],
    focusedPits: number[],
    initialStones: number,
    callback: () => void
  ) => {
    setIsAnimating(true);
    setStonesToMove(initialStones);
    let i = 0;

    function nextStep() {
      if (i >= states.length) {
        setFocusedPit(null);
        setIsAnimating(false);
        setStonesToMove(0);
        callback();
        return;
      }

      setGameState(states[i]);
      setFocusedPit(focusedPits[i]);
      if (i > 0) {
        setStonesToMove((prev) => prev - 1);
      }
      i++;

      setTimeout(nextStep, 500);
    }

    nextStep();
  };

  const handlePitClick = (pitIndex: number) => {
    if (winner() !== null || isAnimating() || gameMode() === GameModeEnum.AVA) return;

    const player = currentPlayer();

    if (gameMode() === GameModeEnum.PVA && player === Player.PLAYER_2) {
      return;
    }

    const initialStones = gameState()[player + pitIndex];
    const { playAgain, success, states, focusedPits } = playTurn(
      gameState(),
      player,
      pitIndex + 1
    );

    if (success) {
      animateTurn(states, focusedPits, initialStones, () => {
        if (!canContinueToPlay(gameState())) {
          setWinner(finalizeGame(gameState()));
          return;
        }

        if (!playAgain) {
          const nextPlayer =
            player === Player.PLAYER_1 ? Player.PLAYER_2 : Player.PLAYER_1;
          setCurrentPlayer(nextPlayer);
          if (
            gameMode() === GameModeEnum.PVA &&
            nextPlayer === Player.PLAYER_2
          ) {
            setTimeout(() => handleAITurn(Player.PLAYER_2), 500);
          }
        } else if (
          gameMode() === GameModeEnum.PVA &&
          player === Player.PLAYER_2
        ) {
          setTimeout(() => handleAITurn(Player.PLAYER_2), 500);
        }
      });
    }
  };

  const handleAITurn = (player: Player) => {
    const { bestPit } = minimaxAB(
      gameState(),
      player,
      10,
      true,
      player,
      -Infinity,
      Infinity
    );

    const initialStones = gameState()[player + bestPit - 1];
    const { playAgain, success, states, focusedPits } = playTurn(
      gameState(),
      player,
      bestPit
    );

    if (success) {
      animateTurn(states, focusedPits, initialStones, () => {
        if (!canContinueToPlay(gameState())) {
          setWinner(finalizeGame(gameState()));
          return;
        }

        if (playAgain) {
          handleAITurn(player);
        } else {
          const nextPlayer =
            player === Player.PLAYER_1 ? Player.PLAYER_2 : Player.PLAYER_1;
          setCurrentPlayer(nextPlayer);
          if (gameMode() === GameModeEnum.AVA) {
            setTimeout(() => handleAITurn(nextPlayer), 500);
          }
        }
      });
    }
  };

  const restartGame = (stones: number) => {
    setGameState(prepareGame(stones));
    setCurrentPlayer(Player.PLAYER_1);
    setWinner(null);
  };

  return (
    <>
      <Show when={gameMode() === null}>
        <GameStartPopup onStartGame={startGame} />
      </Show>
      <Show when={gameMode() !== null}>
        <div
          class={`${styles.game} ${
            currentPlayer() === Player.PLAYER_1
              ? styles.player1Turn
              : styles.player2Turn
          }`}
        >
          <Show when={isAnimating()}>
            <StonesToMove stones={stonesToMove()} />
          </Show>
          <h1>Mancala</h1>
          <Settings onSettingsChange={handleSettingsChange} />
          <div class={styles.players}>
            <PlayerComponent
              player={Player.PLAYER_1}
              isCurrent={currentPlayer() === Player.PLAYER_1}
              gameMode={gameMode()!}
            />
            <PlayerComponent
              player={Player.PLAYER_2}
              isCurrent={currentPlayer() === Player.PLAYER_2}
              gameMode={gameMode()!}
            />
          </div>
          <Board
            gameState={gameState()}
            onPitClick={handlePitClick}
            currentPlayer={currentPlayer()}
            focusedPit={focusedPit()}
          />
          {winner() !== null && (
            <WinnerPopup
              winner={winner()}
              onRestart={() => restartGame(numberOfStones())}
              gameMode={gameMode()!}
            />
          )}
        </div>
      </Show>
    </>
  );
};

export default Game;
