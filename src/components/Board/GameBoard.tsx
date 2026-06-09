import { Box, Text, Button, Group, Progress, Badge, ScrollArea, Stack } from '@mantine/core';
import { IconSword, IconShield, IconX, IconRefresh } from '@tabler/icons-react';
import colors from '../../styles/Colors';
import useGameStore, { getCurrentPhaseName } from '../../stores/gameStore';
import type { Card } from '../../logic/deckConstraints';
import type { Nature } from '../../types/constants';

const NatureIcon: React.FC<{ nature: Nature }> = ({ nature }) => {
  const iconMap: Record<Nature, string> = {
    fire: '🔥',
    earth: '🌍',
    water: '💧',
    air: '💨',
    light: '✨',
    dark: '🌑',
  };
  return <span style={{ fontSize: '1rem' }}>{iconMap[nature] || '❓'}</span>;
};

const PlayerField: React.FC<{
  player: any;
  isCurrentPlayer: boolean;
  isBottom: boolean;
  onToggleAttacker: (uid: string) => void;
  onToggleDefender: (uid: string) => void;
  selectedAttackers: string[];
  selectedDefender: string | null;
}> = ({ player, isCurrentPlayer, isBottom, onToggleAttacker, onToggleDefender, selectedAttackers, selectedDefender }) => {
  const hpPercent = Math.max(0, (player.currentHP / player.maxHP) * 100);
  const manaPercent = Math.max(0, (player.currentMana / player.maxMana) * 100);

  const handleCardClick = (card: Card, uid: string) => {
    if (isCurrentPlayer) {
      onToggleAttacker(uid);
    } else {
      onToggleDefender(uid);
    }
  };

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: isBottom ? 'column' : 'column',
        width: '100%',
        padding: '0.75rem',
        backgroundColor: isCurrentPlayer ? colors.Gray_6 : colors.Gray_7,
        borderRadius: '8px',
        border: `2px solid ${isCurrentPlayer ? colors.Blue_3 : colors.Gray_5}`,
      }}
    >
      <Group justify="space-between" mb="xs">
        <Text c={colors.White_1} size="sm" fw={700}>
          {player.playerId === 'player1' ? 'Player 1' : 'Player 2'}
          {isCurrentPlayer && <Badge ml="xs" color="blue">ACTIVE</Badge>}
        </Text>
        <Group gap="xs">
          <Text c={colors.Gray_3} size="xs">
            Deck: {player.deck.length}
          </Text>
          <Text c={colors.Gray_3} size="xs">
            Hand: {player.hand.length}/{player.maxHandSize}
          </Text>
          <Text c={colors.Gray_3} size="xs">
            GY: {player.graveyard.length}
          </Text>
        </Group>
      </Group>

      <Group gap="xs" mb="xs">
        <Text c={colors.White_1} size="xs">HP</Text>
        <Progress value={hpPercent} color={hpPercent > 50 ? 'green' : hpPercent > 25 ? 'yellow' : 'red'} style={{ flex: 1 }} size="sm" />
        <Text c={colors.White_1} size="xs" fw={600}>
          {player.currentHP}/{player.maxHP}
        </Text>
      </Group>

      <Group gap="xs" mb="xs">
        <Text c={colors.Blue_3} size="xs">MP</Text>
        <Progress value={manaPercent} color="blue" style={{ flex: 1 }} size="sm" />
        <Text c={colors.White_1} size="xs" fw={600}>
          {player.currentMana}/{player.maxMana}
        </Text>
      </Group>

      <Box style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', mb: 'xs' }}>
        {(player.natureScaling.fire.count || 0) > 0 && <Badge size="sm" c={colors.White_1} style={{ backgroundColor: colors.Red_8 }}>🔥x{player.natureScaling.fire.count} (+{player.natureScaling.fire.damageBonus}DMG)</Badge>}
        {(player.natureScaling.earth.count || 0) > 0 && <Badge size="sm" c={colors.White_1} style={{ backgroundColor: colors.Green_7 }}>🌍x{player.natureScaling.earth.count} (+{player.natureScaling.earth.hpBonus}HP)</Badge>}
        {(player.natureScaling.water.count || 0) > 0 && <Badge size="sm" c={colors.White_1} style={{ backgroundColor: colors.Blue_5 }}>💧x{player.natureScaling.water.count} (+{player.natureScaling.water.regenBonus}Regen)</Badge>}
        {(player.natureScaling.air.count || 0) > 0 && <Badge size="sm" c={colors.White_1} style={{ backgroundColor: colors.Gray_4 }}>💨x{player.natureScaling.air.count} (+{player.natureScaling.air.summonBonus}Summons)</Badge>}
        {(player.natureScaling.light.count || 0) > 0 && <Badge size="sm" c={colors.White_1} style={{ backgroundColor: colors.Orange_7 }}>✨x{player.natureScaling.light.count} (+{player.natureScaling.light.manaBonus}MP)</Badge>}
        {(player.natureScaling.dark.count || 0) > 0 && <Badge size="sm" c={colors.White_1} style={{ backgroundColor: colors.Purple_7 }}>🌑x{player.natureScaling.dark.count} (+{player.natureScaling.dark.handBonus}Hand)</Badge>}
      </Box>

      <Text c={colors.Gray_3} size="xs" mb="xs">Field ({player.fieldNumina.length}/3):</Text>
      <Box style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', minHeight: '120px' }}>
        {player.fieldNumina.map((numen: Card, idx: number) => {
          const uid = (numen as any).uid || `field_${idx}`;
          const isSelectedAttacker = selectedAttackers.includes(uid);
          const isSelectedDefender = selectedDefender === uid;
          const pos = player.numenPositions[uid] || 'attack';
          return (
            <Box
              key={uid}
              onClick={() => handleCardClick(numen, uid)}
              style={{
                width: '90px',
                height: '120px',
                backgroundColor: colors.Gray_5,
                borderRadius: '6px',
                padding: '4px',
                cursor: 'pointer',
                border: `2px solid ${
                  isSelectedAttacker ? colors.Red_5 :
                  isSelectedDefender ? colors.Green_5 :
                  colors.Gray_4
                }`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Text c={colors.White_1} size="9px" fw={600} lineClamp={1}>
                {numen.name}
              </Text>
              <Box style={{ display: 'flex', justifyContent: 'center' }}>
                <NatureIcon nature={(numen as any).attribute as Nature} />
              </Box>
              <Group gap="2px" style={{ marginTop: 'auto' }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <IconSword size={10} color={colors.Red_1} />
                  <Text c={colors.Red_1} size="9px">
                    {(numen as any).currentAttack ?? (numen as any).attack ?? 0}
                  </Text>
                </Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <IconShield size={10} color={colors.Blue_1} />
                  <Text c={colors.Blue_1} size="9px">
                    {(numen as any).currentDefense ?? (numen as any).defense ?? 0}
                  </Text>
                </Box>
              </Group>
              <Text c={colors.Gray_3} size="8px" ta="center">
                {pos === 'attack' ? '⚔️' : '🛡️'}
              </Text>
            </Box>
          );
        })}
        {Array.from({ length: Math.max(0, 3 - player.fieldNumina.length) }).map((_, i) => (
          <Box
            key={`empty_${i}`}
            style={{
              width: '90px',
              height: '120px',
              backgroundColor: colors.Gray_8,
              borderRadius: '6px',
              border: `1px dashed ${colors.Gray_5}`,
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export const GameBoard = () => {
  const gameState = useGameStore((s) => s.gameState);
  const combatLog = useGameStore((s) => s.combatLog);
  const changePhase = useGameStore((s) => s.changePhase);
  const selectAttacker = useGameStore((s) => s.selectAttacker);
  const selectDefender = useGameStore((s) => s.selectDefender);
  const executeAttack = useGameStore((s) => s.executeAttack);
  const clearSelections = useGameStore((s) => s.clearSelections);
  const endTurn = useGameStore((s) => s.endTurn);
  const quitGame = useGameStore((s) => s.quitGame);
  const summonNumen = useGameStore((s) => s.summonNumen);
  const discardCard = useGameStore((s) => s.discardCard);

  const currentPlayer = gameState.currentPlayer;
  const opponentId = currentPlayer === 'player1' ? 'player2' : 'player1';
  const player = gameState[currentPlayer];
  const opponent = gameState[opponentId];
  const phase = gameState.currentPhase;

  const handleSummon = (card: Card) => {
    if (!player) return;
    const uid = (card as any).id || card.id;
    summonNumen(currentPlayer, uid, 'attack');
  };

  const handleDiscard = (card: Card) => {
    if (!player) return;
    const uid = (card as any).id || card.id;
    discardCard(currentPlayer, uid);
  };

  if (!player || !opponent) {
    return (
      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <Text c={colors.Gray_3}>No active game</Text>
      </Box>
    );
  }

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100vh',
        backgroundColor: colors.Gray_8,
        padding: '0.5rem',
        boxSizing: 'border-box',
        gap: '0.5rem',
      }}
    >
      <Group justify="space-between" style={{ padding: '0.25rem 0.5rem' }}>
        <Text c={colors.White_1} size="sm" fw={700}>
          Turn {gameState.turnNumber} - {getCurrentPhaseName(phase)}
        </Text>
        <Group gap="xs">
          <Button size="xs" onClick={changePhase} styles={{ root: { backgroundColor: colors.Blue_5 } }}>
            Next Phase
          </Button>
          <Button size="xs" onClick={endTurn} styles={{ root: { backgroundColor: colors.Orange_7 } }}>
            End Turn
          </Button>
          <Button size="xs" onClick={executeAttack} disabled={gameState.selectedAttackers.length === 0} styles={{ root: { backgroundColor: colors.Red_8 } }}>
            <IconSword size={12} /> Attack
          </Button>
          <Button size="xs" onClick={clearSelections} styles={{ root: { backgroundColor: colors.Gray_5 } }}>
            <IconX size={12} /> Clear
          </Button>
          <Button size="xs" onClick={quitGame} styles={{ root: { backgroundColor: colors.Red_10 } }}>
            <IconRefresh size={12} /> Quit
          </Button>
        </Group>
      </Group>

      <Box style={{ display: 'flex', flex: 1, gap: '0.5rem', minHeight: 0 }}>
        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', minHeight: 0 }}>
          <PlayerField
            player={opponent}
            isCurrentPlayer={false}
            isBottom={false}
            onToggleAttacker={() => {}}
            onToggleDefender={selectDefender}
            selectedAttackers={[]}
            selectedDefender={gameState.selectedDefender}
          />

          <Box
            style={{
              flex: 1,
              backgroundColor: colors.Gray_7,
              borderRadius: '6px',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 0,
            }}
          >
            <Text c={colors.Gray_4} size="xs" fw={600}>
              Battle Zone
              {gameState.selectedAttackers.length > 0 && (
                <Text c={colors.Red_5} size="xs" inherit>
                  {' '}
                  - {gameState.selectedAttackers.length} attacker(s) selected
                </Text>
              )}
              {gameState.selectedDefender && (
                <Text c={colors.Green_5} size="xs" inherit>
                  {' '}
                  - defender selected
                </Text>
              )}
            </Text>
          </Box>

          <PlayerField
            player={player}
            isCurrentPlayer={true}
            isBottom={true}
            onToggleAttacker={selectAttacker}
            onToggleDefender={() => {}}
            selectedAttackers={gameState.selectedAttackers}
            selectedDefender={null}
          />
        </Box>

        <Box style={{ width: '220px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Text c={colors.White_1} size="xs" fw={600}>Hand ({player.hand.length}/{player.maxHandSize}):</Text>
          <ScrollArea style={{ flex: 1 }}>
            <Stack gap="xs">
              {player.hand.map((card: Card, idx: number) => (
                <Box
                  key={idx}
                  style={{
                    backgroundColor: colors.Gray_6,
                    borderRadius: '4px',
                    padding: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <Text c={colors.White_1} size="xs" fw={600} lineClamp={1}>
                    {card.name}
                  </Text>
                  <Text c={colors.Gray_3} size="9px" lineClamp={2}>
                    {(card as any).description || ''}
                  </Text>
                  <Group gap="xs">
                    {card.type === 'numen' && (
                      <Button size="compact-xs" onClick={() => handleSummon(card)} styles={{ root: { backgroundColor: colors.Green_6, fontSize: '9px' } }}>
                        Summon
                      </Button>
                    )}
                    <Button size="compact-xs" onClick={() => handleDiscard(card)} styles={{ root: { backgroundColor: colors.Red_8, fontSize: '9px' } }}>
                      Discard
                    </Button>
                  </Group>
                </Box>
              ))}
            </Stack>
          </ScrollArea>

          <Text c={colors.White_1} size="xs" fw={600}>Combat Log:</Text>
          <ScrollArea style={{ height: '150px' }}>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {combatLog.slice(-20).map((log, idx) => (
                <Text key={idx} c={colors.Gray_3} size="9px">
                  {log}
                </Text>
              ))}
            </Box>
          </ScrollArea>
        </Box>
      </Box>

      {gameState.gameActive === false && gameState.winner && (
        <Box
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <Box
            style={{
              backgroundColor: colors.Gray_7,
              padding: '2rem',
              borderRadius: '12px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <Text c={colors.Orange_7} size="xl" fw={700}>
              Game Over!
            </Text>
            <Text c={colors.White_1} size="lg">
              {gameState.winner === 'player1' ? 'Player 1' : 'Player 2'} Wins!
            </Text>
            <Button onClick={quitGame} styles={{ root: { backgroundColor: colors.Blue_5 } }}>
              Back to Menu
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default GameBoard;