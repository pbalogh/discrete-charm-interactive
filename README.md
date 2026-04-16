# The Discrete Charm of the MLP

**Interactive visualization** demonstrating how transformer MLP layers use consensus mechanisms to decide when nonlinearity matters.

🔗 **[Live Demo](https://pbalogh.github.io/discrete-charm-interactive/)**

Based on the research paper: **"The Discrete Charm of the MLP"** by Peter Balogh.

## The Finding

GPT-2's Layer 11 MLP uses a **consensus/exception architecture**:

- **7 "default" neurons** fire for most tokens (74-95% of the time)
- When they **agree** (all fire), the MLP output is small and approximately linear
- When they **disagree**, a single **exception handler neuron (N2123)** fires
- At 7/7 consensus: N2123 fires 0.4% of the time, MLP output = 74.6
- At 0/7 consensus: N2123 fires 91.2% of the time, MLP output = 192.7

## Try It Yourself

The visualization lets you:

1. **Click any token** in example sentences to see its neuron activations
2. **Watch the 7 consensus neurons** vote on whether the token is predictable
3. **See N2123 fire** (or stay silent) based on consensus level
4. **Explore the gradient** showing how MLP output decreases with consensus

## Running Locally

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Tech Stack

- **React** for UI components
- **D3.js** for data visualizations
- **Vite** for fast development and building

## Data

The neuron activation data is extracted from actual GPT-2 runs on 5 example sentences demonstrating:

- High consensus tokens (predictable, boring)
- Zero consensus tokens (ambiguous, interesting)
- The paragraph boundary exception (`\n\n`)
- Ambiguous prepositions
- Technical content

### Regenerating Data

The included data is real activations from GPT-2. To regenerate:

```bash
# Using synthetic data (no dependencies)
python3 generate_data.py --mode synthetic

# Using real GPT-2 activations (requires PyTorch + transformers)
pip3 install torch transformers
python3 generate_data.py --mode real
```

## Paper

Full paper: [arXiv link coming soon]

## License

MIT (code) • CC-BY 4.0 (content)

## Citation

```bibtex
@article{balogh2025discrete,
  title={The Discrete Charm of the MLP: Consensus Mechanisms in Transformer Nonlinearity},
  author={Balogh, Peter},
  journal={arXiv preprint},
  year={2025}
}
```
