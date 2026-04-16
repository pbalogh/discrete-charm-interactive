import { useState, useRef } from 'react'
import TokenSelector from './components/TokenSelector'
import ConsensusVoting from './components/ConsensusVoting'
import CrossoverChart from './components/CrossoverChart'
import ExceptionHandler from './components/ExceptionHandler'
import Narrative from './components/Narrative'
import { sampleData } from './data/generated_samples'
import './App.css'

function App() {
  const [selectedTokenIndex, setSelectedTokenIndex] = useState(null)
  const [currentExample, setCurrentExample] = useState(0)
  const vizRef = useRef(null)

  const handleTokenSelect = (idx) => {
    setSelectedTokenIndex(idx)
    setTimeout(() => {
      vizRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 50)
  }

  const example = sampleData[currentExample]
  const tokenData = selectedTokenIndex !== null
    ? example.tokens[selectedTokenIndex]
    : null

  return (
    <div className="app">
      <header>
        <h1>The Discrete Charm of the MLP</h1>
        <p className="subtitle">
          How transformer MLPs use consensus mechanisms to decide when nonlinearity matters
        </p>
        <p className="byline">
          Peter Balogh • <a href="https://arxiv.org/abs/2603.10985" target="_blank">Paper on arXiv</a>
        </p>
      </header>

      <Narrative phase={tokenData ? 'exploring' : 'intro'} tokenData={tokenData} />

      <section className="interactive-section">
        <h2>Try it yourself</h2>
        <p>Click any token below to see how Layer 11's MLP decides whether to engage:</p>

        <TokenSelector
          tokens={example.tokens}
          selectedIndex={selectedTokenIndex}
          onSelect={handleTokenSelect}
        />

        {tokenData && (
          <div className="visualization-grid" ref={vizRef}>
            <div className="consensus-section">
              <h3>Consensus Voting</h3>
              <p className="section-description">
                Seven "default" neurons vote on whether this token is predictable:
              </p>
              <ConsensusVoting
                neurons={tokenData.consensusNeurons}
                consensusCount={tokenData.consensusCount}
              />
            </div>

            <div className="exception-section">
              <h3>Exception Handler</h3>
              <p className="section-description">
                When consensus breaks down, neuron 2123 lights up — a diagnostic indicator, not a causal trigger:
              </p>
              <ExceptionHandler
                fireRate={tokenData.exceptionFireRate}
                isActive={tokenData.exceptionFires}
                consensusCount={tokenData.consensusCount}
              />
            </div>

            <div className="crossover-section">
              <h3>The Paradox</h3>
              <p className="section-description">
                At 7/7 consensus, the MLP barely helps — the token is already predictable:
              </p>
              <CrossoverChart
                currentConsensus={tokenData.consensusCount}
                currentOutput={tokenData.mlpOutput}
              />
            </div>
          </div>
        )}

        <div className="example-buttons">
          <h3>Jump to examples:</h3>
          <button onClick={() => { setCurrentExample(0); setSelectedTokenIndex(null); }}>
            High consensus (boring token)
          </button>
          <button onClick={() => { setCurrentExample(1); setSelectedTokenIndex(null); }}>
            Zero consensus (exception fires)
          </button>
          <button onClick={() => { setCurrentExample(2); setSelectedTokenIndex(null); }}>
            The paragraph boundary exception
          </button>
        </div>
      </section>

      <footer>
        <p>
          Built with React + D3 • <a href="https://github.com/pbalogh/discrete-charm-interactive">Source</a>
        </p>
      </footer>
    </div>
  )
}

export default App
