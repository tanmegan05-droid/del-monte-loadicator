# Del Monte Loadicator

A React.js web application that replaces traditional loadicators for vessel stability calculations. This tool calculates displacement from draft and generates GZ (righting arm) curves for ship stability analysis.

## Features

- **Input Form**: Enter draft (in meters or feet) and KG (Vertical Center of Gravity)
- **Input Validation**: Ensures values are within reasonable ranges
- **Draft to Displacement Calculation**: Interpolates displacement values from stability data
- **GZ Curve Calculation**: Computes GZ curves using the formula: GZ = KN - KG × sin(heel angle)
- **Visualization**: Interactive charts displaying the GZ curve
- **Data Export**: Download results as CSV or PDF files
- **Responsive Design**: Works on desktop and mobile devices

## Live Demo

Visit the application at: [https://tanmegan05-droid.github.io/del-monte-loadicator](https://tanmegan05-droid.github.io/del-monte-loadicator)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/tanmegan05-droid/del-monte-loadicator.git
cd del-monte-loadicator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open in your browser at `http://localhost:3000`.

## Building for Production

To create a production build:

```bash
npm run build
```

The optimized files will be in the `build` directory.

## Deployment

The application is configured for automatic deployment to GitHub Pages. When changes are pushed to the `main` branch, GitHub Actions will automatically build and deploy the application.

To manually deploy:

```bash
npm run deploy
```

## Data Files

The application uses two Excel files located in the `public` folder:

1. **Stability.xlsx**: Contains draft and displacement data
2. **extracted_data 2 copy.xlsx**: Contains KN curve data for different heel angles

## Technologies Used

- React.js
- Chart.js (for data visualization)
- SheetJS/xlsx (for reading Excel files)
- jsPDF (for PDF export)
- GitHub Pages (for hosting)

## How It Works

1. The application loads the Excel data files on startup
2. Users enter draft and KG values
3. The app interpolates displacement from the draft value using the stability data
4. GZ values are calculated for each heel angle using: GZ = KN - KG × sin(heel angle)
5. Results are displayed as a chart and data table
6. Users can export the data as CSV or PDF

## License

MIT
