document.addEventListener('DOMContentLoaded', () => {

  // --- Game State & Elements ---
  let player1 = null;
  let player2 = null;

  const selectionContainer = document.querySelector('.selection-container');
  const fightContainer = document.querySelector('.fight-container');
  const resetButton = document.getElementById('reset-button');
  const startFightButton = document.getElementById('start-fight-button');
  const p1Select = document.getElementById('player1-select');
  const p2Select = document.getElementById('player2-select');

  // --- Monster Definitions ---
  const monsterData = {
      pink: {
          name: "Pink Monster",
          attackPower: 15,
          // Sprite paths can be generated if needed, or add them here
      },
      blue: {
          name: "Blue Monster",
          attackPower: 12,
      },
      white: {
          name: "White Monster",
          attackPower: 14,
      }
  };

  // --- Core Functions ---

  function updateHealthBar(player) {
      if (!player || !player.healthBar) return;
      const healthPercent = (player.health / player.maxHealth) * 100;
      const clampedPercent = Math.max(0, Math.min(100, healthPercent));
      const healthBarElement = player.healthBar;
      const valueElement = healthBarElement.querySelector('.health-bar__value');

      healthBarElement.style.setProperty('--health-percent', `${clampedPercent}%`);

      if (clampedPercent <= 25) valueElement.style.backgroundColor = '#ffcc00';
      else if (clampedPercent <= 50) valueElement.style.backgroundColor = '#ffff00';
      else valueElement.style.backgroundColor = '#00ff00';
  }

  function getAnimationDuration(animationName) {
      switch (animationName) {
          case 'attack': return 800;
          case 'hurt': return 500;
          case 'death': return 1200;
          case 'idle': return 600;
          default: return 500;
      }
  }

  function playAnimation(player, animationName) {
      if (!player || !player.element) return;

      if (player.animationTimeout) {
          clearTimeout(player.animationTimeout);
          player.animationTimeout = null;
      }

      player.state = animationName;
      // Use the monsterType selected for this player
      player.element.className = `sprite ${player.monsterType}-${animationName}`;

      if (player.isAlive && animationName !== 'idle' && animationName !== 'death') {
          const duration = getAnimationDuration(animationName);
          player.animationTimeout = setTimeout(() => {
              if (player.isAlive && player.state === animationName) {
                  playAnimation(player, 'idle');
              }
              player.animationTimeout = null;
          }, duration);
      }
  }

  function takeDamage(targetPlayer, amount) {
      if (!targetPlayer.isAlive || targetPlayer.state === 'hurt') return;

      targetPlayer.health -= amount;
      console.log(`${targetPlayer.name} takes ${amount} damage, health: ${targetPlayer.health}`);

      if (targetPlayer.health <= 0) {
          targetPlayer.health = 0;
          targetPlayer.isAlive = false;
          updateHealthBar(targetPlayer);
          playAnimation(targetPlayer, 'death');
          console.log(`${targetPlayer.name} died!`);
          disableAttackButtons();
          resetButton.style.display = 'block'; // Show reset button when someone dies
      } else {
          updateHealthBar(targetPlayer);
          playAnimation(targetPlayer, 'hurt');
      }
  }

  function attack(attacker, defender) {
      if (!attacker.isAlive || !defender.isAlive || attacker.state === 'attack' || attacker.state === 'hurt' || defender.state === 'hurt') {
          // console.log("Attack prevented (dead or busy)");
          return;
      }

      console.log(`${attacker.name} attacks ${defender.name}`);
      playAnimation(attacker, 'attack');

      const attackAnimDuration = getAnimationDuration('attack');
      setTimeout(() => {
          if (defender.isAlive && attacker.state === 'attack') {
              takeDamage(defender, attacker.attackPower);
          }
      }, attackAnimDuration * 0.6);
  }

  function disableAttackButtons() {
      if (player1) player1.attackButton.disabled = true;
      if (player2) player2.attackButton.disabled = true;
  }

  function enableAttackButtons() {
      if (player1) player1.attackButton.disabled = !player1.isAlive;
      if (player2) player2.attackButton.disabled = !player2.isAlive;
  }

  // --- Initialization and Game Flow ---

  function initializePlayer(playerNumber, selectedMonsterType) {
      const playerObj = {
          id: `player${playerNumber}`,
          monsterType: selectedMonsterType,
          name: monsterData[selectedMonsterType].name,
          health: 100,
          maxHealth: 100,
          attackPower: monsterData[selectedMonsterType].attackPower,
          element: document.getElementById(`player${playerNumber}-sprite`),
          healthBar: document.getElementById(`player${playerNumber}-health-bar`),
          attackButton: document.getElementById(`player${playerNumber}-attack-button`),
          isAlive: true,
          state: 'idle',
          animationTimeout: null,
      };

      // Add event listener for this player's attack button
      playerObj.attackButton.onclick = () => { // Use onclick to easily overwrite later if needed
          const opponent = (playerNumber === 1) ? player2 : player1;
          attack(playerObj, opponent);
      };

      return playerObj;
  }

  function startGame() {
      const p1Selection = p1Select.value;
      const p2Selection = p2Select.value;

      console.log(`Starting game: P1=${p1Selection}, P2=${p2Selection}`);

      player1 = initializePlayer(1, p1Selection);
      player2 = initializePlayer(2, p2Selection);

      // Hide selection, show fight area
      selectionContainer.style.display = 'none';
      fightContainer.style.display = 'flex'; // Use 'flex' to match CSS
      resetButton.style.display = 'none'; // Hide reset until game ends

      // Initial setup
      updateHealthBar(player1);
      updateHealthBar(player2);
      playAnimation(player1, 'idle');
      playAnimation(player2, 'idle');
      enableAttackButtons();
  }

  function resetGame() {
      console.log("Resetting game - returning to selection...");
      // Hide fight area, show selection
      fightContainer.style.display = 'none';
      selectionContainer.style.display = 'block'; // Or 'flex' depending on desired layout
      resetButton.style.display = 'none';

      // Clear player data (optional, will be overwritten on start)
      player1 = null;
      player2 = null;

      // Maybe reset dropdowns to default?
      p1Select.value = 'blue';
      p2Select.value = 'pink';
  }

  // --- Event Listeners ---
  startFightButton.addEventListener('click', startGame);
  resetButton.addEventListener('click', resetGame);

}); // End DOMContentLoaded