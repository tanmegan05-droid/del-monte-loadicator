# Security Policy

## Security Status

✅ **No Known Vulnerabilities in Production Dependencies**

This application has been designed with security as a priority and uses JSON data files instead of runtime Excel parsing to avoid known vulnerabilities in Excel parsing libraries.

## Data Files

The application uses pre-processed JSON files instead of Excel files:
- `stability-data.json` - Converted from `Stability.xlsx`
- `kn-curve-data.json` - Converted from `extracted_data 2 copy.xlsx`

This approach provides several security benefits:
1. **No Runtime Parsing**: Eliminates vulnerabilities associated with Excel file parsing
2. **Smaller Bundle**: Reduces application size by ~110KB
3. **Faster Loading**: JSON parsing is significantly faster than Excel parsing
4. **Trusted Data**: Data is validated and converted at build time

## Known Development Dependencies with Advisories

Some development dependencies (used only during development and building) have known advisories:
- `react-scripts`, `webpack-dev-server`, `@svgr/webpack`, etc.

**Impact**: These dependencies are NOT included in the production build and do not affect the deployed application.

## Security Best Practices

This application follows these security practices:

- ✅ No vulnerable runtime dependencies
- ✅ No sensitive data is stored or transmitted
- ✅ All calculations are performed client-side
- ✅ Input validation is implemented for all user inputs
- ✅ No server-side code execution
- ✅ Content served over HTTPS (via GitHub Pages)
- ✅ No authentication or authorization (public tool)
- ✅ No user data persistence
- ✅ Data pre-processing eliminates runtime parsing vulnerabilities

## Reporting a Vulnerability

If you discover a security vulnerability in this application, please report it by:

1. Creating a private security advisory on GitHub
2. Emailing the repository maintainer

Do not create public issues for security vulnerabilities.

## Data Integrity

The JSON data files are:
- Generated from trusted Excel files during development
- Validated during the conversion process
- Static and immutable once deployed
- Part of the application deployment package

## Last Updated

January 11, 2026
