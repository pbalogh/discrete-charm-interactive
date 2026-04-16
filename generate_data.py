#!/usr/bin/env python3
"""
Generate realistic neuron activation data for the Discrete Charm visualization.

This script creates activation data based on the empirical findings from the paper,
without requiring GPT-2 to be loaded. If you have PyTorch + Transformers installed,
it can also generate real activations from the model.

Usage:
    # Generate synthetic data (no dependencies required)
    python generate_data.py --mode synthetic

    # Generate real data from GPT-2 (requires torch, transformers)
    python generate_data.py --mode real
"""

import json
import argparse
from pathlib import Path

# Consensus neurons from the paper
CONSENSUS_NEURONS = [
    {"id": 2, "name": "N2", "role": "General punctuation", "fire_rate": 0.98},
    {"id": 762, "name": "N762", "role": "Delimiter context", "fire_rate": 0.759},
    {"id": 2361, "name": "N2361", "role": "Subordinate clause", "fire_rate": 0.884},
    {"id": 2460, "name": "N2460", "role": "Default-ON", "fire_rate": 0.853},
    {"id": 2928, "name": "N2928", "role": "Content context", "fire_rate": 0.943},
    {"id": 1831, "name": "N1831", "role": "General context", "fire_rate": 0.776},
    {"id": 2727, "name": "N2727", "role": "General context", "fire_rate": 0.733},
]

# Consensus gradient from Table 1 in the paper
CONSENSUS_GRADIENT = [
    {"consensusCount": 0, "tokenPercent": 3.5, "n2123FireRate": 91.2, "mlpOutput": 192.7},
    {"consensusCount": 1, "tokenPercent": 4.0, "n2123FireRate": 60.1, "mlpOutput": 115.1},
    {"consensusCount": 2, "tokenPercent": 5.2, "n2123FireRate": 33.4, "mlpOutput": 101.0},
    {"consensusCount": 3, "tokenPercent": 7.0, "n2123FireRate": 14.1, "mlpOutput": 88.0},
    {"consensusCount": 4, "tokenPercent": 11.2, "n2123FireRate": 6.4, "mlpOutput": 83.0},
    {"consensusCount": 5, "tokenPercent": 20.1, "n2123FireRate": 3.1, "mlpOutput": 80.7},
    {"consensusCount": 6, "tokenPercent": 26.9, "n2123FireRate": 1.2, "mlpOutput": 76.2},
    {"consensusCount": 7, "tokenPercent": 22.1, "n2123FireRate": 0.4, "mlpOutput": 74.6},
]


def generate_synthetic_data():
    """
    Generate realistic synthetic data based on paper findings.
    This doesn't require GPT-2 but captures the statistical patterns.
    """
    import random
    random.seed(42)

    example_sentences = [
        {
            "id": "high-consensus",
            "title": "High Consensus Example",
            "sentence": "The cat sat on the mat.",
            "tokens_text": ["The", " cat", " sat", " on", " the", " mat", "."],
            # Most tokens should have high consensus (6-7)
            "consensus_pattern": [7, 6, 6, 6, 7, 6, 6],
        },
        {
            "id": "zero-consensus",
            "title": "Zero Consensus Example",
            "sentence": "However, the situation remains unclear.",
            "tokens_text": ["However", ",", " the", " situation", " remains", " unclear", "."],
            # Mix: start with low consensus, then recover
            "consensus_pattern": [0, 3, 7, 4, 5, 4, 6],
        },
        {
            "id": "paragraph-boundary",
            "title": "Paragraph Boundary Exception",
            "sentence": "This is sentence one.\\n\\nThis is sentence two.",
            "tokens_text": ["This", " is", " sentence", " one", ".", "\\n\\n", "This", " is", " sentence", " two", "."],
            # Paragraph boundary breaks consensus completely
            "consensus_pattern": [7, 6, 5, 6, 6, 0, 7, 6, 5, 6, 6],
        },
        {
            "id": "ambiguous-preposition",
            "title": "Ambiguous Preposition",
            "sentence": "He looked at the painting of her mother.",
            "tokens_text": ["He", " looked", " at", " the", " painting", " of", " her", " mother", "."],
            # Prepositions break consensus
            "consensus_pattern": [6, 5, 2, 7, 6, 3, 7, 6, 6],
        },
        {
            "id": "technical-content",
            "title": "Technical Content",
            "sentence": "The algorithm optimizes loss via gradient descent.",
            "tokens_text": ["The", " algorithm", " optim", "izes", " loss", " via", " gradient", " descent", "."],
            # Technical tokens maintain consensus
            "consensus_pattern": [7, 6, 5, 6, 6, 4, 6, 6, 6],
        },
    ]

    samples = []

    for example in example_sentences:
        tokens = []

        for idx, (text, target_consensus) in enumerate(zip(
            example["tokens_text"], example["consensus_pattern"]
        )):
            # Find the MLP output for this consensus level
            gradient_entry = next(
                g for g in CONSENSUS_GRADIENT if g["consensusCount"] == target_consensus
            )

            # Generate neuron activations
            # For each consensus neuron, decide if it fires based on:
            # 1. Its base fire rate
            # 2. The target consensus count
            neurons = []
            fires_count = 0

            for neuron_info in CONSENSUS_NEURONS:
                # Probability this neuron fires depends on target consensus
                # If we want N neurons to fire, make the top N most likely to fire
                base_fire_prob = neuron_info["fire_rate"]

                # Adjust probability based on whether we need this neuron for consensus
                if fires_count < target_consensus:
                    # We need this one to fire
                    fire_prob = min(0.95, base_fire_prob + 0.1)
                else:
                    # We want it to not fire
                    fire_prob = max(0.05, base_fire_prob - 0.7)

                fires = random.random() < fire_prob
                if fires:
                    fires_count += 1

                # Activation level: if fires, high (0.7-0.95), else low (0.03-0.09)
                if fires:
                    activation = random.uniform(0.7, 0.95)
                else:
                    activation = random.uniform(0.03, 0.09)

                neurons.append({
                    "id": neuron_info["id"],
                    "fires": fires,
                    "activation": round(activation, 2),
                })

            # Recount actual fires
            actual_consensus = sum(1 for n in neurons if n["fires"])

            # Exception handler (N2123) fire probability
            exception_fire_rate = gradient_entry["n2123FireRate"]
            exception_fires = random.random() < (exception_fire_rate / 100)

            # MLP output with some variance
            mlp_output = gradient_entry["mlpOutput"] + random.uniform(-3, 3)

            token_data = {
                "text": text,
                "position": idx,
                "consensusNeurons": neurons,
                "consensusCount": actual_consensus,
                "exceptionFires": exception_fires,
                "exceptionFireRate": exception_fire_rate,
                "mlpOutput": round(mlp_output, 1),
            }
            tokens.append(token_data)

        samples.append({
            "id": example["id"],
            "title": example["title"],
            "sentence": example["sentence"],
            "tokens": tokens,
        })

    return samples


def generate_real_data():
    """
    Generate real activation data from GPT-2 (requires torch + transformers).
    """
    try:
        import torch
        from transformers import GPT2LMHeadModel, GPT2Tokenizer
    except ImportError:
        print("ERROR: PyTorch and Transformers required for real data generation")
        print("Install with: pip install torch transformers")
        return None

    print("Loading GPT-2 model...")
    model = GPT2LMHeadModel.from_pretrained('gpt2').eval()
    tokenizer = GPT2Tokenizer.from_pretrained('gpt2')
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    model = model.to(device)
    print(f"Model loaded on {device}")

    layer_idx = 11  # Layer 11 as in the paper
    consensus_neuron_ids = [n["id"] for n in CONSENSUS_NEURONS]
    exception_neuron_id = 2123

    example_sentences = [
        "The cat sat on the mat.",
        "However, the situation remains unclear.",
        "This is sentence one.\n\nThis is sentence two.",
        "He looked at the painting of her mother.",
        "The algorithm optimizes loss via gradient descent.",
    ]

    samples = []

    for sent_idx, sentence in enumerate(example_sentences):
        print(f"\nProcessing: {sentence[:50]}...")

        # Tokenize
        input_ids = tokenizer.encode(sentence, return_tensors='pt').to(device)
        tokens_text = [tokenizer.decode([t]) for t in input_ids[0]]

        # Collect activations
        activations = {}

        def hook_fn(module, input, output):
            activations['post_gelu'] = output.detach().cpu()

        layer = model.transformer.h[layer_idx]
        handle = layer.mlp.act.register_forward_hook(hook_fn)

        with torch.no_grad():
            outputs = model(input_ids)

        handle.remove()

        # Get MLP output
        def mlp_output_hook(module, input, output):
            activations['mlp_output'] = output.detach().cpu()

        handle2 = layer.mlp.register_forward_hook(mlp_output_hook)

        with torch.no_grad():
            outputs = model(input_ids)

        handle2.remove()

        post_gelu = activations['post_gelu'][0]  # [seq_len, 3072]
        mlp_output = activations['mlp_output'][0]  # [seq_len, 768]

        tokens = []

        for pos in range(len(tokens_text)):
            # Get activations for this position
            neuron_acts = post_gelu[pos]

            # Consensus neurons
            consensus_neurons = []
            consensus_count = 0

            for neuron_id in consensus_neuron_ids:
                activation = float(neuron_acts[neuron_id])
                fires = activation > 0.1
                if fires:
                    consensus_count += 1

                consensus_neurons.append({
                    "id": neuron_id,
                    "fires": fires,
                    "activation": round(activation, 2),
                })

            # Exception neuron
            exception_activation = float(neuron_acts[exception_neuron_id])
            exception_fires = exception_activation > 0.1

            # Find expected fire rate from gradient
            gradient_entry = min(
                CONSENSUS_GRADIENT,
                key=lambda g: abs(g["consensusCount"] - consensus_count)
            )
            exception_fire_rate = gradient_entry["n2123FireRate"]

            # MLP output magnitude
            mlp_out_norm = float(torch.norm(mlp_output[pos]))

            token_data = {
                "text": tokens_text[pos],
                "position": pos,
                "consensusNeurons": consensus_neurons,
                "consensusCount": consensus_count,
                "exceptionFires": exception_fires,
                "exceptionFireRate": exception_fire_rate,
                "mlpOutput": round(mlp_out_norm, 1),
            }
            tokens.append(token_data)

        samples.append({
            "id": f"example-{sent_idx}",
            "title": f"Example {sent_idx + 1}",
            "sentence": sentence,
            "tokens": tokens,
        })

    return samples


def main():
    parser = argparse.ArgumentParser(description="Generate activation data for visualization")
    parser.add_argument(
        "--mode",
        choices=["synthetic", "real"],
        default="synthetic",
        help="Data generation mode (synthetic=no deps, real=requires GPT-2)"
    )
    parser.add_argument(
        "--output",
        default="src/data/generated_samples.js",
        help="Output file path"
    )
    args = parser.parse_args()

    print(f"Generating {args.mode} data...")

    if args.mode == "synthetic":
        samples = generate_synthetic_data()
    else:
        samples = generate_real_data()
        if samples is None:
            return 1

    # Write to JavaScript file
    output_path = Path(__file__).parent / args.output
    output_path.parent.mkdir(parents=True, exist_ok=True)

    js_content = f"""// Auto-generated activation data for Discrete Charm visualization
// Generated using: {args.mode} mode
// DO NOT EDIT - regenerate with generate_data.py

export const consensusNeuronInfo = {json.dumps(CONSENSUS_NEURONS, indent=2)}

export const consensusGradient = {json.dumps(CONSENSUS_GRADIENT, indent=2)}

export const sampleData = {json.dumps(samples, indent=2)}
"""

    with open(output_path, 'w') as f:
        f.write(js_content)

    print(f"\n✅ Generated {len(samples)} examples")
    print(f"📁 Saved to: {output_path}")
    print(f"\nTo use in visualization:")
    print(f"  import {{ sampleData }} from './data/generated_samples'")

    return 0


if __name__ == "__main__":
    exit(main())
