import { useState } from 'react'
import './TokenSelector.css'

function TokenSelector({ tokens, selectedIndex, onSelect }) {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  return (
    <div className="token-selector">
      <div className="tokens">
        {tokens.map((token, idx) => {
          const isSelected = idx === selectedIndex
          const isHovered = idx === hoveredIndex
          const consensusClass =
            token.consensusCount >= 6 ? 'high-consensus' :
            token.consensusCount >= 4 ? 'medium-consensus' :
            token.consensusCount >= 2 ? 'low-consensus' : 'zero-consensus'

          return (
            <span
              key={idx}
              className={`token ${consensusClass} ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
              onClick={() => onSelect(idx)}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              title={`Consensus: ${token.consensusCount}/7 • MLP output: ${token.mlpOutput.toFixed(1)}`}
            >
              {token.text.replace(/\\n/g, '↵')}
            </span>
          )
        })}
      </div>
      {selectedIndex !== null && (
        <div className="token-info">
          <strong>Selected:</strong> "{tokens[selectedIndex].text}" •{' '}
          <strong>Consensus:</strong> {tokens[selectedIndex].consensusCount}/7 •{' '}
          <strong>MLP Output:</strong> {tokens[selectedIndex].mlpOutput.toFixed(1)}
        </div>
      )}
    </div>
  )
}

export default TokenSelector
