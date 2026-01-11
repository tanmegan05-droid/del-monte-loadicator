# Quick Start Guide - Ship Stability Loadicator

## Installation & Setup

```bash
# Clone the repository
git clone https://github.com/tanmegan05-droid/del-monte-loadicator.git
cd del-monte-loadicator

# Install dependencies
pip install -r requirements.txt
```

## Basic Usage

### Run Interactive Mode
```bash
python loadicator.py
```

You will be prompted for:
- **KG** (Vertical Center of Gravity in meters): Height from keel to center of gravity
- **Draft** (in meters): How deep the ship sits in water

### Example Session
```
Enter KG (vertical center of gravity from keel) in meters [default: 8.5]: 8.5
Enter Draft in meters [default: 8.0]: 8.0
```

## Output Files

The tool generates three outputs:

1. **Console Report** - Immediate text output with all calculations
2. **JSON File** - `stability_report_KG{kg}_Draft{draft}.json`
   - Complete data in structured format
   - Easy to integrate with other systems
3. **Graph** - `gz_curve_KG{kg}_Draft{draft}.png`
   - Professional GZ curve visualization
   - Includes stability data and data points table

## Understanding the Results

### Key Parameters

| Parameter | Description | Good Range |
|-----------|-------------|------------|
| **GM** | Metacentric Height - measure of initial stability | 0.5 - 1.5 m |
| **GZ** | Righting Arm - force returning ship upright | Max > 0.2 m |
| **Displacement** | Total weight of water displaced (ship's weight) | Varies by vessel |
| **Range of Stability** | Max angle ship can heel and return upright | > 50° for ocean-going |

### Safety Warnings

- ⚠️ **GM < 0.15m**: Ship may be UNSTABLE (dangerous)
- ⚠️ **GM > 1.5m**: Ship very STIFF (uncomfortable motion)
- ✓ **0.15m < GM < 1.5m**: Normal operating range

## Programmatic Usage

See `examples.py` for detailed examples:

```python
from loadicator import ShipStability

# Create calculator
ship = ShipStability()

# Generate report
report = ship.generate_stability_report(kg=8.5, draft=8.0)

# Access data
print(f"Displacement: {report['hydrostatic']['displacement']} tonnes")
print(f"GM: {report['stability']['gm']} m")

# Generate plot
ship.plot_gz_curve(kg=8.5, draft=8.0, save_path='my_curve.png')
```

## Valid Input Ranges

- **KG**: Any positive value (typically 5-12 meters for cargo vessels)
- **Draft**: 2.0 - 14.0 meters (based on hydrostatic tables)

## Troubleshooting

### Error: "Draft X.Xm is out of range"
- Draft must be between 2.0 and 14.0 meters
- Check your input value

### Error: "Invalid input"
- Ensure you enter numeric values only
- Use decimal point (.) not comma (,)

### Negative GZ values
- Indicates unstable condition at those heel angles
- Check if KG is too high relative to KM

## Technical Notes

- Calculations use simplified hydrostatic data for a typical 150m cargo vessel
- GZ curve uses GM method for small angles, wall-sided formula for larger angles
- For real operations, use vessel-specific hydrostatic tables

## Support

For issues or questions, please open an issue on GitHub.

---

**Safety Notice**: This tool is for educational and preliminary assessment purposes. For actual ship operations, use approved stability documentation and consult qualified marine professionals.
