#!/usr/bin/env python3
"""
Example usage of the Ship Stability Loadicator
This script demonstrates how to use the loadicator programmatically.
"""

from loadicator import ShipStability

def example_basic_usage():
    """Basic example of using the loadicator."""
    print("=" * 60)
    print("EXAMPLE 1: Basic Usage")
    print("=" * 60)
    print()
    
    # Create a ship stability calculator
    ship = ShipStability()
    
    # Define ship parameters
    kg = 8.5  # meters
    draft = 8.0  # meters
    
    # Generate stability report
    report = ship.generate_stability_report(kg, draft)
    
    # Access specific values
    print(f"Input KG: {report['input']['kg']} m")
    print(f"Input Draft: {report['input']['draft']} m")
    print(f"Displacement: {report['hydrostatic']['displacement']} tonnes")
    print(f"GM: {report['stability']['gm']:.3f} m")
    print(f"Max GZ: {report['stability']['max_gz']:.4f} m at {report['stability']['max_gz_angle']}°")
    print()
    
    # Generate plot
    ship.plot_gz_curve(kg, draft, save_path='example_gz_curve.png')
    print("Plot saved as: example_gz_curve.png")
    print()


def example_multiple_conditions():
    """Example of comparing multiple loading conditions."""
    print("=" * 60)
    print("EXAMPLE 2: Comparing Multiple Loading Conditions")
    print("=" * 60)
    print()
    
    ship = ShipStability()
    
    # Define different loading conditions
    conditions = [
        {"name": "Light Load", "kg": 7.0, "draft": 6.0},
        {"name": "Normal Load", "kg": 8.5, "draft": 8.0},
        {"name": "Heavy Load", "kg": 9.5, "draft": 10.0},
    ]
    
    print(f"{'Condition':<15} {'KG (m)':<10} {'Draft (m)':<12} {'Displacement (t)':<18} {'GM (m)':<10} {'Max GZ (m)':<12}")
    print("-" * 90)
    
    for condition in conditions:
        report = ship.generate_stability_report(condition['kg'], condition['draft'])
        
        print(f"{condition['name']:<15} "
              f"{condition['kg']:<10.1f} "
              f"{condition['draft']:<12.1f} "
              f"{report['hydrostatic']['displacement']:<18.0f} "
              f"{report['stability']['gm']:<10.3f} "
              f"{report['stability']['max_gz']:<12.4f}")
    
    print()


def example_stability_check():
    """Example of checking stability criteria."""
    print("=" * 60)
    print("EXAMPLE 3: Stability Criteria Check")
    print("=" * 60)
    print()
    
    ship = ShipStability()
    
    kg = 8.5
    draft = 8.0
    
    report = ship.generate_stability_report(kg, draft)
    
    # Check IMO stability criteria (simplified)
    print("Checking stability criteria:")
    print()
    
    gm = report['stability']['gm']
    max_gz = report['stability']['max_gz']
    max_gz_angle = report['stability']['max_gz_angle']
    range_stability = report['stability']['range_of_stability']
    
    criteria_met = True
    
    # Criterion 1: GM should be positive and reasonable
    print(f"1. GM = {gm:.3f} m")
    if gm > 0.15:
        print("   ✓ PASS: GM is adequate")
    else:
        print("   ✗ FAIL: GM is too low (should be > 0.15m)")
        criteria_met = False
    
    # Criterion 2: Maximum GZ should occur at reasonable angle
    print(f"\n2. Maximum GZ = {max_gz:.4f} m at {max_gz_angle:.0f}°")
    if max_gz > 0.2:
        print("   ✓ PASS: Maximum GZ is adequate")
    else:
        print("   ✗ FAIL: Maximum GZ is too low (should be > 0.2m)")
        criteria_met = False
    
    # Criterion 3: Range of stability
    print(f"\n3. Range of Positive Stability = {range_stability:.0f}°")
    if range_stability >= 50:
        print("   ✓ PASS: Range of stability is adequate")
    else:
        print("   ✗ FAIL: Range too small (should be ≥ 50°)")
        criteria_met = False
    
    print()
    if criteria_met:
        print("✓ All stability criteria MET")
    else:
        print("✗ Some stability criteria NOT MET")
    
    print()


def example_data_export():
    """Example of accessing and exporting curve data."""
    print("=" * 60)
    print("EXAMPLE 4: Accessing GZ Curve Data")
    print("=" * 60)
    print()
    
    ship = ShipStability()
    
    kg = 8.5
    draft = 8.0
    
    report = ship.generate_stability_report(kg, draft)
    
    # Access the GZ curve data
    angles = report['gz_curve']['angles']
    gz_values = report['gz_curve']['gz_values']
    
    print("GZ Curve Data (first 5 points):")
    print(f"{'Angle (°)':<12} {'GZ (m)':<12}")
    print("-" * 24)
    for i in range(min(5, len(angles))):
        print(f"{angles[i]:<12.1f} {gz_values[i]:<12.4f}")
    
    print(f"... (total {len(angles)} points)")
    print()
    
    # You can export this data to CSV, database, etc.
    print("This data can be exported to:")
    print("- CSV files for spreadsheet analysis")
    print("- Databases for record keeping")
    print("- Other applications via JSON")
    print()


if __name__ == "__main__":
    # Run all examples
    example_basic_usage()
    example_multiple_conditions()
    example_stability_check()
    example_data_export()
    
    print("=" * 60)
    print("All examples completed!")
    print("=" * 60)
