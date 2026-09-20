import os
import sys
from pathlib import Path

# Disable TensorFlow in transformers imports if PyTorch is used
os.environ["USE_TF"] = "0"
os.environ["USE_TORCH"] = "1"

# NumPy 2.x backward compatibility shim for older dependencies
try:
    import numpy as np
    if not hasattr(np, "complex_"):
        np.complex_ = np.complex128
    if not hasattr(np, "float_"):
        np.float_ = np.float64
except ImportError:
    pass

# Add project root to sys.path
root = Path(__file__).resolve().parent
if str(root) not in sys.path:
    sys.path.insert(0, str(root))

