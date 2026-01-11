#!/usr/bin/env python3
"""
Ship Stability Loadicator
A tool to calculate ship stability curves (GZ curves) based on KG and draft inputs.
"""

import numpy as np
import matplotlib.pyplot as plt
from typing import Tuple, List, Dict
import json


class ShipStability:
    """
    Ship Stability Calculator
    
    This class implements simplified ship stability calculations based on
    typical ship hydrostatic data and metacentric height principles.
    """
    
    def __init__(self):
        """
        Initialize with default ship parameters.
        These represent a typical medium-sized cargo vessel.
        """
        # Ship principal dimensions (in meters)
        self.length_bp = 150.0  # Length between perpendiculars
        self.beam = 25.0        # Breadth
        self.depth = 15.0       # Depth
        
        # Hydrostatic data - simplified for demonstration
        # In a real loadicator, this would come from ship's hydrostatic tables
        self.draft_table = np.array([2.0, 4.0, 6.0, 8.0, 10.0, 12.0, 14.0])
        self.displacement_table = np.array([2500, 5500, 9000, 13000, 17500, 22500, 28000])  # tonnes
        self.kb_table = np.array([1.1, 2.2, 3.3, 4.4, 5.5, 6.6, 7.7])  # KB - keel to center of buoyancy
        self.bm_table = np.array([8.5, 7.8, 7.0, 6.2, 5.5, 4.8, 4.2])  # BM - metacentric radius
        
    def interpolate_hydrostatic_data(self, draft: float) -> Dict[str, float]:
        """
        Interpolate hydrostatic data for a given draft.
        
        Args:
            draft: Ship's draft in meters
            
        Returns:
            Dictionary containing displacement, KB, and BM values
        """
        if draft < self.draft_table[0] or draft > self.draft_table[-1]:
            raise ValueError(f"Draft must be between {self.draft_table[0]} and {self.draft_table[-1]} meters")
        
        displacement = np.interp(draft, self.draft_table, self.displacement_table)
        kb = np.interp(draft, self.draft_table, self.kb_table)
        bm = np.interp(draft, self.draft_table, self.bm_table)
        
        return {
            'displacement': displacement,
            'kb': kb,
            'bm': bm
        }
    
    def calculate_km(self, draft: float) -> float:
        """
        Calculate KM (keel to metacenter height).
        
        Args:
            draft: Ship's draft in meters
            
        Returns:
            KM value in meters
        """
        hydro_data = self.interpolate_hydrostatic_data(draft)
        km = hydro_data['kb'] + hydro_data['bm']
        return km
    
    def calculate_gm(self, kg: float, draft: float) -> float:
        """
        Calculate GM (metacentric height).
        
        Args:
            kg: Vertical center of gravity from keel in meters
            draft: Ship's draft in meters
            
        Returns:
            GM value in meters
        """
        km = self.calculate_km(draft)
        gm = km - kg
        return gm
    
    def calculate_gz_curve(self, kg: float, draft: float, 
                          heel_angles: np.ndarray = None) -> Tuple[np.ndarray, np.ndarray]:
        """
        Calculate GZ (righting arm) curve for given KG and draft.
        
        This uses a simplified formula: GZ = GM * sin(θ) for small angles,
        and a more complex approximation for larger angles including
        wall-sided formula corrections.
        
        Args:
            kg: Vertical center of gravity from keel in meters
            draft: Ship's draft in meters
            heel_angles: Array of heel angles in degrees (default: 0 to 60 degrees)
            
        Returns:
            Tuple of (heel_angles, gz_values) arrays
        """
        if heel_angles is None:
            heel_angles = np.arange(0, 61, 5)  # 0 to 60 degrees in 5-degree steps
        
        gm = self.calculate_gm(kg, draft)
        hydro_data = self.interpolate_hydrostatic_data(draft)
        
        # Convert angles to radians
        heel_rad = np.radians(heel_angles)
        
        # Calculate GZ values
        gz_values = np.zeros_like(heel_angles, dtype=float)
        
        for i, (angle, rad) in enumerate(zip(heel_angles, heel_rad)):
            if angle == 0:
                gz_values[i] = 0.0
            elif angle <= 15:
                # For small angles, use simplified formula
                gz_values[i] = gm * np.sin(rad)
            else:
                # For larger angles, use wall-sided formula approximation
                # GZ = (GM + 0.5 * BM * tan²θ) * sinθ - 0.5 * (KB/B) * sin²θ
                bm = hydro_data['bm']
                kb = hydro_data['kb']
                
                gz_values[i] = (gm + 0.5 * bm * np.tan(rad)**2) * np.sin(rad)
                
                # Add correction for larger angles
                if angle > 30:
                    correction = -0.5 * (kb / self.beam) * (np.sin(rad)**2)
                    gz_values[i] += correction
        
        return heel_angles, gz_values
    
    def generate_stability_report(self, kg: float, draft: float) -> Dict:
        """
        Generate a complete stability report.
        
        Args:
            kg: Vertical center of gravity from keel in meters
            draft: Ship's draft in meters
            
        Returns:
            Dictionary containing all stability data
        """
        hydro_data = self.interpolate_hydrostatic_data(draft)
        km = self.calculate_km(draft)
        gm = self.calculate_gm(kg, draft)
        heel_angles, gz_values = self.calculate_gz_curve(kg, draft)
        
        # Find maximum GZ and its angle
        max_gz_index = np.argmax(gz_values)
        max_gz = gz_values[max_gz_index]
        max_gz_angle = heel_angles[max_gz_index]
        
        # Find range of positive stability
        positive_stability_indices = np.where(gz_values > 0)[0]
        if len(positive_stability_indices) > 0:
            range_of_stability = heel_angles[positive_stability_indices[-1]]
        else:
            range_of_stability = 0.0
        
        report = {
            'input': {
                'kg': float(kg),
                'draft': float(draft)
            },
            'hydrostatic': {
                'displacement': float(hydro_data['displacement']),
                'kb': float(hydro_data['kb']),
                'bm': float(hydro_data['bm']),
                'km': float(km)
            },
            'stability': {
                'gm': float(gm),
                'max_gz': float(max_gz),
                'max_gz_angle': float(max_gz_angle),
                'range_of_stability': float(range_of_stability)
            },
            'gz_curve': {
                'angles': [float(x) for x in heel_angles],
                'gz_values': [float(x) for x in gz_values]
            }
        }
        
        return report
    
    def plot_gz_curve(self, kg: float, draft: float, save_path: str = None):
        """
        Plot the GZ curve and display or save it.
        
        Args:
            kg: Vertical center of gravity from keel in meters
            draft: Ship's draft in meters
            save_path: Optional path to save the plot
        """
        heel_angles, gz_values = self.calculate_gz_curve(kg, draft)
        hydro_data = self.interpolate_hydrostatic_data(draft)
        gm = self.calculate_gm(kg, draft)
        
        # Create figure with better styling
        plt.figure(figsize=(12, 8))
        
        # Plot GZ curve
        plt.subplot(2, 1, 1)
        plt.plot(heel_angles, gz_values, 'b-', linewidth=2, label='GZ Curve')
        plt.axhline(y=0, color='k', linestyle='-', linewidth=0.5)
        plt.grid(True, alpha=0.3)
        plt.xlabel('Heel Angle (degrees)', fontsize=12)
        plt.ylabel('GZ - Righting Arm (meters)', fontsize=12)
        plt.title(f'Ship Stability Curve (GZ Curve)\nKG = {kg:.2f}m, Draft = {draft:.2f}m', 
                 fontsize=14, fontweight='bold')
        plt.legend(fontsize=10)
        
        # Add stability information as text
        info_text = f"Displacement: {hydro_data['displacement']:.0f} tonnes\n"
        info_text += f"GM: {gm:.3f} m\n"
        info_text += f"KM: {self.calculate_km(draft):.3f} m\n"
        info_text += f"Max GZ: {np.max(gz_values):.3f} m at {heel_angles[np.argmax(gz_values)]:.0f}°"
        
        plt.text(0.98, 0.97, info_text,
                transform=plt.gca().transAxes,
                fontsize=10,
                verticalalignment='top',
                horizontalalignment='right',
                bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.8))
        
        # Plot data points table
        plt.subplot(2, 1, 2)
        plt.axis('off')
        
        # Create table data
        table_data = []
        table_data.append(['Angle (°)', 'GZ (m)'])
        for angle, gz in zip(heel_angles, gz_values):
            table_data.append([f'{angle:.0f}', f'{gz:.4f}'])
        
        # Display table in columns
        col_width = 0.15
        row_height = 0.06
        n_rows = len(heel_angles) + 1
        n_cols_per_set = 2
        n_sets = 3  # Display in 3 columns
        
        for set_idx in range(n_sets):
            start_row = set_idx * (n_rows // n_sets) + 1
            end_row = min(start_row + (n_rows // n_sets), len(table_data))
            
            if start_row < len(table_data):
                for row_idx in range(start_row, end_row):
                    for col_idx in range(n_cols_per_set):
                        x_pos = set_idx * (col_width * n_cols_per_set + 0.05) + col_idx * col_width
                        y_pos = 0.95 - (row_idx - start_row) * row_height
                        
                        cell_text = table_data[row_idx][col_idx]
                        
                        # Header styling
                        if row_idx == 0 or (row_idx == start_row and start_row > 0):
                            plt.text(x_pos, y_pos, table_data[0][col_idx],
                                   fontsize=9, fontweight='bold',
                                   ha='left', va='center')
                        else:
                            plt.text(x_pos, y_pos, cell_text,
                                   fontsize=8,
                                   ha='left', va='center')
        
        plt.title('GZ Curve Data Points', fontsize=12, fontweight='bold', loc='left')
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=150, bbox_inches='tight')
            print(f"Plot saved to: {save_path}")
        else:
            plt.show()


def main():
    """Main function to demonstrate the loadicator tool."""
    print("=" * 60)
    print("SHIP STABILITY LOADICATOR")
    print("=" * 60)
    print()
    
    # Create stability calculator instance
    ship = ShipStability()
    
    # Get user input
    try:
        print("Please enter the following ship parameters:")
        print()
        
        kg_input = input("Enter KG (vertical center of gravity from keel) in meters [default: 8.5]: ").strip()
        kg = float(kg_input) if kg_input else 8.5
        
        draft_input = input("Enter Draft in meters [default: 8.0]: ").strip()
        draft = float(draft_input) if draft_input else 8.0
        
        print()
        print("Calculating stability data...")
        print()
        
        # Generate stability report
        report = ship.generate_stability_report(kg, draft)
        
        # Display results
        print("=" * 60)
        print("STABILITY REPORT")
        print("=" * 60)
        print()
        
        print("INPUT PARAMETERS:")
        print(f"  KG (Center of Gravity):     {report['input']['kg']:.3f} m")
        print(f"  Draft:                      {report['input']['draft']:.3f} m")
        print()
        
        print("HYDROSTATIC DATA:")
        print(f"  Displacement:               {report['hydrostatic']['displacement']:.0f} tonnes")
        print(f"  KB (Keel to Buoyancy):      {report['hydrostatic']['kb']:.3f} m")
        print(f"  BM (Metacentric Radius):    {report['hydrostatic']['bm']:.3f} m")
        print(f"  KM (Keel to Metacenter):    {report['hydrostatic']['km']:.3f} m")
        print()
        
        print("STABILITY PARAMETERS:")
        print(f"  GM (Metacentric Height):    {report['stability']['gm']:.3f} m")
        print(f"  Maximum GZ:                 {report['stability']['max_gz']:.4f} m")
        print(f"  Angle at Max GZ:            {report['stability']['max_gz_angle']:.0f} degrees")
        print(f"  Range of Positive Stability: {report['stability']['range_of_stability']:.0f} degrees")
        print()
        
        print("GZ CURVE DATA POINTS:")
        print("-" * 60)
        print(f"{'Angle (°)':>12} | {'GZ (m)':>12}")
        print("-" * 60)
        for angle, gz in zip(report['gz_curve']['angles'], report['gz_curve']['gz_values']):
            print(f"{angle:>12.0f} | {gz:>12.4f}")
        print("-" * 60)
        print()
        
        # Save report to JSON
        report_filename = f"stability_report_KG{kg:.1f}_Draft{draft:.1f}.json"
        with open(report_filename, 'w') as f:
            json.dump(report, f, indent=2)
        print(f"Report saved to: {report_filename}")
        print()
        
        # Generate and save plot
        plot_filename = f"gz_curve_KG{kg:.1f}_Draft{draft:.1f}.png"
        ship.plot_gz_curve(kg, draft, save_path=plot_filename)
        print()
        
        print("=" * 60)
        print("Stability assessment complete!")
        print("=" * 60)
        
        # Safety assessment
        if report['stability']['gm'] < 0.15:
            print("\n⚠️  WARNING: GM is very low! Ship may be unstable.")
        elif report['stability']['gm'] > 1.5:
            print("\n⚠️  CAUTION: GM is very high! Ship may have excessive stiffness.")
        else:
            print("\n✓ GM is within acceptable range.")
        
    except ValueError as e:
        print(f"Error: Invalid input - {e}")
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    main()
