# Security Policy

## Known Dependencies with Advisories

### xlsx@0.18.5

This application uses `xlsx@0.18.5`, which is the latest free version available on npm. This version has known vulnerabilities:

1. **Regular Expression Denial of Service (ReDoS)** - Affects versions < 0.20.2
2. **Prototype Pollution** - Affects versions < 0.19.3

### Risk Assessment

The impact of these vulnerabilities is **minimal** in this application for the following reasons:

#### Mitigating Factors

1. **Trusted Data Sources Only**
   - The application only loads pre-validated Excel files (`Stability.xlsx` and `extracted_data 2 copy.xlsx`) from the public folder
   - These files are part of the application deployment and are trusted
   - No user-uploaded files are processed

2. **Client-Side Only**
   - The application runs entirely in the browser
   - No server-side processing occurs
   - No Excel files are processed on a backend server

3. **No External File Upload**
   - The application does not accept file uploads from users
   - Users cannot provide arbitrary Excel files for processing

4. **Limited Attack Surface**
   - An attacker would need to modify the source code or deployment to inject malicious Excel files
   - Such access would already constitute a complete compromise

### Why Not Upgrade?

SheetJS has moved to a commercial model where versions 0.19.x and 0.20.x (which contain the fixes) are only available through:
- Paid commercial licenses
- Private npm registry with subscription
- CDN with API key

The latest free version on public npm remains 0.18.5.

### Recommendations

For production deployments with enhanced security requirements, consider:

1. **Commercial License**: Purchase a SheetJS commercial license to access patched versions
2. **Alternative Libraries**: Evaluate alternative Excel parsing libraries (though most have trade-offs)
3. **Pre-processing**: Convert Excel files to JSON during build time to avoid runtime parsing
4. **CSP Headers**: Implement Content Security Policy headers when deploying

## Reporting a Vulnerability

If you discover a security vulnerability in this application, please report it by:

1. Creating a private security advisory on GitHub
2. Emailing the repository maintainer

Do not create public issues for security vulnerabilities.

## Security Best Practices

This application follows these security practices:

- ✅ No sensitive data is stored or transmitted
- ✅ All calculations are performed client-side
- ✅ Input validation is implemented for all user inputs
- ✅ No server-side code execution
- ✅ Content served over HTTPS (via GitHub Pages)
- ✅ No authentication or authorization (public tool)
- ✅ No user data persistence

## Last Updated

January 11, 2026
