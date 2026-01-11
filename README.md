# Digital Loadicator - Ship Stability Calculator

A web-based digital tool that replaces traditional loadicator instruments for calculating ship stability parameters. This tool allows users to input draft and KG (vertical centre of gravity) to calculate displacement and generate a GZ curve with data points and graphical visualization.

## Features

- **Input Parameters:**
  - Draft (in meters)
  - KG - Vertical Centre of Gravity (in meters above keel)

- **Output Results:**
  - Displacement (in tonnes)
  - GZ Curve (Righting Lever curve)
  - Data points table showing GZ values at various heel angles (0° to 60° in 5° increments)
  - Interactive graph visualization of the GZ curve

## Usage

### Running the Application

1. **Open the application:**
   - Simply open `index.html` in any modern web browser (Chrome, Firefox, Safari, Edge)
   - Or use a local server for better performance

2. **Using a local server (optional but recommended):**
   ```bash
   # If you have Python installed:
   python -m http.server 8000
   
   # Or using Node.js http-server:
   npx http-server
   ```
   Then navigate to `http://localhost:8000` in your browser

### How to Use

1. **Enter Draft:** Input the ship's draft in meters (the vertical distance from the waterline to the keel)

2. **Enter KG:** Input the vertical center of gravity in meters above the keel

3. **Click Calculate:** Press the "Calculate" button to generate results

4. **View Results:**
   - **Displacement:** Shows the calculated displacement in tonnes
   - **GZ Curve Graph:** Interactive chart showing the righting lever (GZ) vs heel angle
   - **Data Points Table:** Detailed table with GZ values at different heel angles

### Example Input

- **Draft:** 8.5 m
- **KG:** 7.2 m

This will calculate the displacement and generate a stability curve showing how the righting moment changes as the vessel heels.

## Understanding the Results

### Displacement
The total weight of water displaced by the vessel, calculated based on the draft and ship dimensions.

### GZ Curve
The GZ curve shows the righting lever (GZ) at various heel angles:
- **GZ (m):** The horizontal distance between the center of gravity (G) and the vertical line through the center of buoyancy (B)
- **Heel Angle:** The angle of inclination from vertical (0° to 60°)

A positive GZ indicates a righting moment that will tend to return the ship to upright. The curve helps assess:
- Initial stability (small angles)
- Overall stability characteristics
- Range of positive stability

### Ship Parameters

The calculator uses standard parameters for a typical cargo vessel:
- Length Between Perpendiculars: 150 m
- Breadth: 23 m
- Block Coefficient: 0.70
- Waterplane Area Coefficient: 0.85

These can be modified in `script.js` for specific vessel calculations.

## Technical Details

- **Built with:** HTML5, CSS3, JavaScript
- **Charting:** Native Canvas API for custom graph rendering
- **No server required:** Runs entirely in the browser
- **Mobile responsive:** Works on desktop, tablet, and mobile devices

## Files Structure

```
del-monte-loadicator/
├── index.html      # Main HTML structure
├── style.css       # Styling and layout
├── script.js       # Calculation logic and interactivity
└── README.md       # Documentation
```

## Stability Calculations

The tool implements standard naval architecture formulas:

1. **Displacement:** `Δ = L × B × T × Cb × ρ`
   - L: Length, B: Breadth, T: Draft (depth), Cb: Block coefficient, ρ: Water density

2. **KB (Center of Buoyancy):** `KB ≈ 0.53 × T`

3. **BM (Metacentric Radius):** `BM = I / ∇`
   - I: Moment of inertia of waterplane, ∇: Volume of displacement

4. **GM (Metacentric Height):** `GM = KM - KG = (KB + BM) - KG`

5. **GZ (Righting Lever):** `GZ = GM × sin(θ)` (for small angles)
   - More complex formulas for larger heel angles

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Any modern browser with JavaScript enabled

## License

This project is open source and available for educational and professional use.