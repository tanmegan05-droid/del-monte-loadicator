# Del Monte Loadicator

A digital ship stability loadicator tool for calculating and visualizing ship stability curves (GZ curves) based on vessel parameters.

## Overview

This loadicator tool helps maritime professionals assess ship stability by calculating the GZ (righting arm) curve based on the ship's vertical center of gravity (KG) and draft. The tool provides:

- **GZ Curve Calculation**: Computes the righting arm at various heel angles
- **Displacement Data**: Calculates displacement from hydrostatic tables
- **Stability Parameters**: GM (metacentric height), KM, KB, BM values
- **Visualization**: Generates professional graphs showing the GZ curve
- **Data Export**: Saves results in JSON format and PNG graphs

## Features

- Interactive command-line interface for easy input
- Real-time stability calculations based on naval architecture principles
- Comprehensive stability report with key parameters
- Visual GZ curve with data points table
- Safety assessments and warnings
- Export capability for reports and graphs

## Installation

1. Clone the repository:
```bash
git clone https://github.com/tanmegan05-droid/del-monte-loadicator.git
cd del-monte-loadicator
```

2. Install required dependencies:
```bash
pip install -r requirements.txt
```

## Usage

Run the loadicator tool:

```bash
python loadicator.py
```

### Input Parameters

The tool will prompt you for:
- **KG (Vertical Center of Gravity)**: Height from keel to center of gravity in meters
- **Draft**: Ship's draft in meters

### Example

```
SHIP STABILITY LOADICATOR
============================================================

Please enter the following ship parameters:

Enter KG (vertical center of gravity from keel) in meters [default: 8.5]: 8.5
Enter Draft in meters [default: 8.0]: 8.0

Calculating stability data...
```

### Output

The tool generates:

1. **Console Output**: Detailed stability report including:
   - Input parameters
   - Hydrostatic data (displacement, KB, BM, KM)
   - Stability parameters (GM, max GZ, range of stability)
   - GZ curve data points table

2. **JSON Report**: `stability_report_KG{kg}_Draft{draft}.json`
   - Complete stability data in structured format
   - Easy to integrate with other systems

3. **Graph**: `gz_curve_KG{kg}_Draft{draft}.png`
   - Professional GZ curve visualization
   - Includes stability information overlay
   - Data points table for reference

## Understanding the Output

### Key Stability Parameters

- **GM (Metacentric Height)**: Measure of initial stability. Higher GM = more stable but stiffer motion
  - Typical range: 0.5 - 1.5 meters for cargo vessels
  - < 0.15m: Unstable (dangerous)
  - > 1.5m: Very stiff (uncomfortable motion)

- **GZ (Righting Arm)**: Force that returns the ship to upright position
  - Should be positive for a range of heel angles
  - Maximum GZ typically occurs at 30-40 degrees

- **Displacement**: Total weight of water displaced (ship's weight)

- **Range of Stability**: Maximum angle at which ship can heel and still return upright

### GZ Curve Interpretation

A good stability curve should have:
- Positive GM (curve starts with positive slope)
- Maximum GZ > 0.2m
- Range of stability > 50 degrees for ocean-going vessels
- Smooth curve without discontinuities

## Ship Parameters

The tool uses hydrostatic data for a typical medium-sized cargo vessel:
- Length between perpendiculars: 150m
- Beam: 25m
- Depth: 15m
- Draft range: 2.0m - 14.0m

These parameters can be modified in the `ShipStability` class for specific vessels.

## Technical Details

### Calculation Methods

The loadicator uses naval architecture principles:

1. **Hydrostatic Properties**: Interpolated from tabular data based on draft
2. **KM Calculation**: KM = KB + BM
3. **GM Calculation**: GM = KM - KG
4. **GZ Curve**: 
   - Small angles (0-15°): GZ = GM × sin(θ)
   - Larger angles: Wall-sided formula with corrections

### Limitations

- Uses simplified hydrostatic data (typical vessel)
- Does not account for:
  - Free surface effects
  - Shifting cargo
  - Wind heeling moments
  - Wave effects
  - Asymmetric loading

For real vessel operations, use the ship's specific hydrostatic tables and consider all factors affecting stability.

## Safety Notice

⚠️ **Important**: This tool is for educational and preliminary assessment purposes. For actual ship operations:
- Use the vessel's approved stability documentation
- Consult with qualified marine professionals
- Follow IMO and flag state regulations
- Consider all loading conditions and environmental factors

## Requirements

- Python 3.7 or higher
- NumPy 1.21.0 or higher
- Matplotlib 3.4.0 or higher

## License

This project is open source and available for educational purposes.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for improvements.

## Author

Created for ship stability assessment and maritime education.