# Performance comparison

Original:

```
doars-interpret
- loop
  Setup time   x̄138.69ms, ∧134.00ms, ∨155.20ms,   ±0.44%
  Setup memory  x̄12.24MB,  ∧12.16MB,  ∨12.29MB,   ±0.04%
  Run time     x̄133.61ms, ∧129.30ms, ∨148.60ms,   ±0.50%
  Run memory    x̄11.65MB,  ∧10.48MB,  ∨12.66MB,   ±0.45%
```

After access centralization:

```
doars-interpret
- loop
  Setup time   x̄129.64ms, ∧125.70ms, ∨143.90ms,   ±0.36%
  Setup memory  x̄15.19MB,  ∧15.14MB,  ∨15.26MB,   ±0.03%
  Run time     x̄118.55ms, ∧112.80ms, ∨129.20ms,   ±0.41%
  Run memory    x̄11.67MB,  ∧10.01MB,  ∨12.39MB,   ±1.66%
```

After switch from recursive update calls to while loop:

```
doars-interpret
- loop
  Setup time   x̄137.34ms, ∧133.70ms, ∨151.10ms,   ±0.33%
  Setup memory  x̄15.19MB,  ∧15.13MB,  ∨15.25MB,   ±0.04%
  Run time     x̄125.69ms, ∧118.90ms, ∨134.10ms,   ±0.42%
  Run memory     x̄9.93MB,   ∧9.56MB,  ∨13.27MB,   ±1.90%
```

// FIXME:
- Storing state on DOM seems the cause of performance issues. Data is retained where it shouldn't move this to attribute.getData() and attribute.setData() calls where possible. And remove the requirements for shared symbols elsewhere.
- Do we need to create recursive revocable proxies for things like the state? Shouldn't a single layer be enough allow the invalid state when used to be stale data? Or would it not be stale and still allow writing to it? If it is required, perhaps we can collect some functions into one for these.
