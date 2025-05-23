import { useState } from 'react';
import { BackButton } from '../common';
import { playSound } from '../../utils/soundUtils';

interface CharacterSelectionProps {
  onSelect: (character: string) => void;
  selectedCharacter: string;
  standalone?: boolean;
}

const characters = [
  { id: 'blue', name: 'Azul' },
  { id: 'pink', name: 'Rosa' },
  { id: 'white', name: 'Bai' }
];

const CharacterSelection = ({ onSelect, selectedCharacter = 'blue', standalone = false }: CharacterSelectionProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    playSound('ding');
    onSelect(e.target.value);
  };

  return (
    <div className={`character-selection ${standalone ? 'standalone' : ''}`}>
      {standalone && <BackButton to="/" className="back-button-top-left" />}
      <h3>Choose Your Character</h3>
      <div className="character-preview">
        <div className={`character-sprite ${selectedCharacter}-idle`}></div>
        <select 
          value={selectedCharacter} 
          onChange={handleChange}
          className="character-select"
        >
          {characters.map(character => (
            <option key={character.id} value={character.id}>
              {character.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default CharacterSelection;