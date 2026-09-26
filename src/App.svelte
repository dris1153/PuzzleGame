<script lang="ts">
  import { levelConfig, nextLevel } from './data/levels'
  import FreePlaySetupScreen from './screens/free-play-setup-screen.svelte'
  import GameScreen from './screens/game-screen.svelte'
  import HomeScreen from './screens/home-screen.svelte'
  import LevelSelectScreen from './screens/level-select-screen.svelte'
  import SettingsScreen from './screens/settings-screen.svelte'
  import StatsScreen from './screens/stats-screen.svelte'
  import { screen } from './stores/screen-store.svelte'
  import { settings } from './stores/settings-store.svelte'

  $effect(() => {
    document.documentElement.lang = settings.current.locale
  })

  const current = $derived(screen.current)

  function exitGame() {
    if (current.name === 'game') screen.go({ name: current.returnTo })
  }

  function nextHandler(): (() => void) | undefined {
    if (current.name !== 'game' || current.config.mode !== 'campaign') return undefined
    const next = nextLevel(current.config.levelId)
    return next && (() => screen.go({ name: 'game', config: levelConfig(next), returnTo: 'level-select' }))
  }
</script>

{#if current.name === 'home'}
  <HomeScreen />
{:else if current.name === 'level-select'}
  <LevelSelectScreen />
{:else if current.name === 'free-play'}
  <FreePlaySetupScreen />
{:else if current.name === 'stats'}
  <StatsScreen />
{:else if current.name === 'settings'}
  <SettingsScreen />
{:else if current.name === 'game'}
  <!-- GameScreen reads its config once; every navigation to a game gets a fresh instance. -->
  {#key current}
    <GameScreen config={current.config} onExit={exitGame} onNext={nextHandler()} />
  {/key}
{/if}
