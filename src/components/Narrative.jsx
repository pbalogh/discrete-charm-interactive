import './Narrative.css'

function Narrative({ phase, tokenData }) {
  if (phase === 'intro') {
    return (
      <section className="narrative intro">
        <h2>The Question</h2>
        <p>
          When a token passes through a transformer's MLP layer, it goes through an
          expand → activate → compress cycle. The nonlinear activation (GELU) is expensive
          to compute. But is it always necessary?
        </p>
        <p>
          We found something surprising: <strong>the MLP itself knows when it's wasting effort</strong>.
        </p>

        <h3>The Finding</h3>
        <p>
          In GPT-2's Layer 11, seven "default" neurons fire for most tokens (74-95% of the time).
          When these neurons <em>agree</em> — when they all fire together — the MLP's output
          is small and approximately linear. The token is predictable; nonlinearity doesn't help.
        </p>
        <p>
          When they <em>disagree</em>, a single neuron (N2123) lights up. This "exception
          indicator" signals that the full nonlinear circuit is active — the MLP's output
          magnitude jumps to 2.8× its consensus-level baseline.
        </p>
        <p className="callout">
          At 7/7 consensus, N2123 fires only 0.5% of the time, and the MLP barely helps.
          At 0/7 consensus, N2123 fires 94.7% of the time, and the MLP's output is 2.8× larger.
        </p>

        <p>
          <strong>Scroll down to explore this mechanism yourself.</strong>
        </p>
      </section>
    )
  }

  if (phase === 'exploring' && tokenData) {
    const { consensusCount, exceptionFires, mlpOutput } = tokenData

    return (
      <section className="narrative exploring">
        <h3>What's happening for this token?</h3>
        {consensusCount === 7 && (
          <div className="narrative-box high-consensus">
            <p>
              <strong>Perfect consensus!</strong> All 7 default neurons agree this token
              is predictable from context. The MLP's output magnitude is minimal
              ({mlpOutput.toFixed(1)}) — a simple linear transformation would have been
              enough. The expensive nonlinear circuit is wasted here.
            </p>
          </div>
        )}
        {consensusCount >= 5 && consensusCount < 7 && (
          <div className="narrative-box medium-consensus">
            <p>
              <strong>Strong consensus.</strong> Most neurons agree ({consensusCount}/7).
              The MLP still doesn't need much nonlinearity — output is {mlpOutput.toFixed(1)},
              close to the linear floor. These tokens are mostly predictable.
            </p>
          </div>
        )}
        {consensusCount >= 3 && consensusCount < 5 && (
          <div className="narrative-box low-consensus">
            <p>
              <strong>Split decision.</strong> The neurons are divided ({consensusCount}/7 agree).
              The MLP output ({mlpOutput.toFixed(1)}) is starting to grow — the model
              needs more correction. {exceptionFires && 'N2123 is active here — a reliable indicator that the nonlinear pathway is engaged.'}
            </p>
          </div>
        )}
        {consensusCount >= 1 && consensusCount < 3 && (
          <div className="narrative-box very-low-consensus">
            <p>
              <strong>Low consensus.</strong> Most neurons disagree (only {consensusCount}/7 agree).
              The MLP output is high ({mlpOutput.toFixed(1)}) — the model is working hard.
              {exceptionFires && ' N2123 is active — signaling that the full nonlinear machinery is in use.'}
            </p>
          </div>
        )}
        {consensusCount === 0 && (
          <div className="narrative-box zero-consensus">
            <p>
              <strong>Zero consensus!</strong> Complete disagreement — no neurons agree.
              The MLP's output is at maximum ({mlpOutput.toFixed(1)}, 2.8× the consensus baseline).
              {exceptionFires && ' N2123 is active — a diagnostic indicator that this token is deeply ambiguous and the full nonlinear circuit is engaged.'}
            </p>
          </div>
        )}

        <p className="try-more">
          Try clicking other tokens to see how consensus changes. Notice how
          punctuation and function words often break consensus, while content
          words maintain it.
        </p>
      </section>
    )
  }

  return null
}

export default Narrative
