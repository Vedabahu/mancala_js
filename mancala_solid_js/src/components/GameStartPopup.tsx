
import styles from './GameStartPopup.module.css';

export const GameModeEnum = {
  PVA: 'Player vs. AI',
  PVP: 'Player vs. Player',
  AVA: 'AI vs. AI',
} as const;

export type GameModeEnum = (typeof GameModeEnum)[keyof typeof GameModeEnum];

interface GameStartPopupProps {
  onStartGame: (mode: GameModeEnum) => void;
}

const GameStartPopup = (props: GameStartPopupProps) => {
  return (
    <div class={styles.popupOverlay}>
      <div class={styles.popup}>
        <h1>Welcome to Mancala!</h1>
        <h2>Choose your game mode:</h2>
        <div class={styles.buttons}>
          <button onClick={() => props.onStartGame(GameModeEnum.PVP)}>
            Player vs. Player
          </button>
          <button onClick={() => props.onStartGame(GameModeEnum.PVA)}>
            Player vs. AI
          </button>
          <button onClick={() => props.onStartGame(GameModeEnum.AVA)}>
            AI vs. AI
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameStartPopup;
