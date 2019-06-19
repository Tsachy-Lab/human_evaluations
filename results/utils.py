import numpy as np

def scrambleID(s='placeholder',state=0):
  l = list(s)
  np.random.RandomState(state).shuffle(l)
  return ''.join(l)


