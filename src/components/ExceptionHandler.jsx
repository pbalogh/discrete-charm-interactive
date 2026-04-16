import { useEffect, useState } from 'react'
import './ExceptionHandler.css'

function ExceptionHandler({ fireRate, isActive, consensusCount }) {
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    if (isActive) {
      setPulse(true)
      const timer = setTimeout(() => setPulse(false), 600)
      return () => clearTimeout(timer)
    }
  }, [isActive])

  return (
    <div className={`exception-handler ${isActive ? 'active' : 'inactive'} ${pulse ? 'pulse' : ''}`}>
      <div className="neuron-display">
        <div className="neuron-circle">
          <span className="neuron-id">N2123</span>
        </div>
        <div className="status-label">
          {isActive ? 'FIRING' : 'Silent'}
        </div>
      </div>

      <div className="fire-rate-display">
        <div className="fire-rate-label">Fire rate at this consensus level:</div>
        <div className="fire-rate-value">
          {fireRate.toFixed(1)}%
        </div>
        <div className="fire-rate-bar">
          <div
            className="fire-rate-fill"
            style={{
              width: `${fireRate}%`,
              backgroundColor: fireRate <= 10
                ? '#22c55e'
                : fireRate <= 50
                  ? `rgb(${Math.round(34 + (234 - 34) * ((fireRate - 10) / 40))}, ${Math.round(197 + (179 - 197) * ((fireRate - 10) / 40))}, ${Math.round(94 + (8 - 94) * ((fireRate - 10) / 40))})`
                  : `rgb(${Math.round(234 + (239 - 234) * ((fireRate - 50) / 50))}, ${Math.round(179 + (68 - 179) * ((fireRate - 50) / 50))}, ${Math.round(8 + (68 - 8) * ((fireRate - 50) / 50))})`
            }}
          ></div>
        </div>
      </div>

      <div className="explanation">
        {consensusCount === 7 && (
          <p>
            <strong>Perfect consensus.</strong> All 7 neurons agree this token is predictable.
            N2123 stays silent — the linear path is sufficient.
          </p>
        )}
        {consensusCount >= 5 && consensusCount < 7 && (
          <p>
            <strong>Strong consensus.</strong> Most neurons agree. N2123 rarely activates here
            — only {fireRate.toFixed(1)}% of the time.
          </p>
        )}
        {consensusCount >= 3 && consensusCount < 5 && (
          <p>
            <strong>Moderate disagreement.</strong> Neurons are split. N2123 activates
            {fireRate.toFixed(1)}% of the time — indicating the nonlinear pathway is engaged.
          </p>
        )}
        {consensusCount >= 1 && consensusCount < 3 && (
          <p>
            <strong>Low consensus.</strong> Most neurons disagree. N2123 activates
            {fireRate.toFixed(1)}% of the time — the MLP is working hard.
          </p>
        )}
        {consensusCount === 0 && (
          <p>
            <strong>Zero consensus!</strong> Complete disagreement. N2123 activates {fireRate.toFixed(1)}% of the time
            — signaling that this token needs the full nonlinear circuit.
          </p>
        )}
      </div>

      <div className="mechanism">
        <h4>The Indicator Mechanism</h4>
        <p>
          Neuron 2123 is 93–98% mutually exclusive with the 7 default neurons.
          When they all fire (consensus), it stays silent. When they disagree
          (no consensus), it activates. But N2123 is diagnostic, not causal —
          zeroing it alone has no measurable effect. The computation is distributed
          across all 3,072 neurons; N2123 is a reliable readout of which regime is active.
        </p>
      </div>
    </div>
  )
}

export default ExceptionHandler
