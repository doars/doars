# Performance comparison

Original:

```
alpine
- loop
  Setup time   x̄110.62ms, ∧107.20ms, ∨124.50ms,   ±0.41%
  Setup memory  x̄12.35MB,  ∧12.29MB,  ∨12.85MB,   ±0.15%
  Run time      x̄40.32ms,  ∧38.70ms,  ∨43.10ms,   ±0.51%
  Run memory     x̄1.85MB,   ∧1.82MB,   ∨1.88MB,   ±0.16%

doars
- loop
  Setup time   x̄176.47ms, ∧172.60ms, ∨189.30ms,   ±0.28%
  Setup memory  x̄19.65MB,  ∧19.52MB,  ∨19.75MB,   ±0.04%
  Run time     x̄202.10ms, ∧196.50ms, ∨225.30ms,   ±0.38%
  Run memory    x̄20.22MB,  ∧18.60MB,  ∨24.45MB,   ±2.45%

doars-interpret
- loop
  Setup time   x̄138.69ms, ∧134.00ms, ∨155.20ms,   ±0.44%
  Setup memory  x̄12.24MB,  ∧12.16MB,  ∨12.29MB,   ±0.04%
  Run time     x̄133.61ms, ∧129.30ms, ∨148.60ms,   ±0.50%
  Run memory    x̄11.65MB,  ∧10.48MB,  ∨12.66MB,   ±0.45%
```

After access centralization:

```
alpine
- loop
  Setup time   x̄105.33ms, ∧103.00ms, ∨122.70ms,   ±0.40%
  Setup memory  x̄12.35MB,  ∧12.28MB,  ∨12.90MB,   ±0.17%
  Run time      x̄38.31ms,  ∧36.80ms,  ∨42.00ms,   ±0.41%
  Run memory     x̄1.85MB,   ∧1.82MB,   ∨1.89MB,   ±0.16%

doars
- loop
  Setup time   x̄190.38ms, ∧184.90ms, ∨210.90ms,   ±0.34%
  Setup memory  x̄17.37MB,  ∧17.27MB,  ∨17.48MB,   ±0.04%
  Run time     x̄188.18ms, ∧181.60ms, ∨248.60ms,   ±0.72%
  Run memory    x̄18.88MB,  ∧13.86MB,  ∨25.78MB,   ±5.20%

doars-interpret
- loop
  Setup time   x̄129.64ms, ∧125.70ms, ∨143.90ms,   ±0.36%
  Setup memory  x̄15.19MB,  ∧15.14MB,  ∨15.26MB,   ±0.03%
  Run time     x̄118.55ms, ∧112.80ms, ∨129.20ms,   ±0.41%
  Run memory    x̄11.67MB,  ∧10.01MB,  ∨12.39MB,   ±1.66%
```
