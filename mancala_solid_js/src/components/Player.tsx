import { Player as PlayerEnum } from '../game/types';
import { GameModeEnum } from './GameStartPopup';
import styles from './Player.module.css';

interface PlayerProps {
  player: PlayerEnum;
  isCurrent: boolean;
  gameMode: GameModeEnum;
}

const Player = (props: PlayerProps) => {
  const playerName = () => {
    if (props.gameMode === GameModeEnum.AVA) {
      return props.player === PlayerEnum.PLAYER_1 ? 'AI 1' : 'AI 2';
    }
    return props.player === PlayerEnum.PLAYER_1 ? 'Player 1' : 'Player 2';
  };

  return (
    <div class={`${styles.player} ${props.isCurrent ? styles.current : ''}`}>
      {playerName()}
    </div>
  );
};

export default Player;