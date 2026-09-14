# cxSeed

A seed generator node with emoji buttons for quick seed recall and randomization.

## Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| seed | INT | 0 | Seed value (0 to 2^64-1) with `control_after_generate: randomize` |

## Outputs

| Name | Type | Description |
|------|------|-------------|
| SEED | INT | The current seed value |

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| min | int | 0 | Minimum seed value |
| max | int | 2^64-1 | Maximum seed value |
| max_digits | int | 0 | Maximum display digits (0 = no limit) |

## Interaction

- **Emoji buttons** — Visual buttons for seed operations:
  - Recall previous seed
  - Generate random seed
  - Copy/paste seed value
- **Control after generate** — Framework dropdown for automatic seed behavior (randomize, increment, decrement, fixed)

## Right-Click Menu

- **Randomize Seed Now** — Immediately generate a new random seed
- **Reset to Defaults** — Restore all properties to defaults
