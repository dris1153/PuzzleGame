<script lang="ts">
  import { defaultParSec, type GameConfig } from './data/game-config'
  import GameScreen from './screens/game-screen.svelte'

  // Temporary until level data and screens land in phase 3.
  const config: GameConfig = {
    mode: 'campaign',
    levelId: 'level-01',
    imageSrc: `${import.meta.env.BASE_URL}levels/level-01.jpg`,
    rows: 3,
    cols: 3,
    rotation: false,
    parSec: defaultParSec(3, 3, false),
  }
</script>

<!-- GameScreen reads its config once; a new config needs a fresh instance. -->
{#key config}
  <GameScreen {config} />
{/key}
