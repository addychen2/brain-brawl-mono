import { useState } from 'react';

interface CharacterSelectionProps {
  onSelect: (character: string) => void;
  selectedCharacter: string;
}

const characters = [
  { id: 'blue', name: 'Blue Monster' },
  { id: 'pink', name: 'Pink Monster' },
  { id: 'white', name: 'White Monster' }
];

const CharacterSelection = ({ onSelect, selectedCharacter = 'blue' }: CharacterSelectionProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSelect(e.target.value);
  };

  return (
    <div className="character-selection">
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