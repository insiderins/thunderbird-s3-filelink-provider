# Copilot Instructions for AI Agents

## Project Overview

This is a Thunderbird Filelink provider extension for S3-compatible cloud storage. It enables users to upload email attachments to S3 and insert download links in their messages. The extension is designed for the Thunderbird mail client and uses the WebExtension API.

## Key Components

-   `background.js`: Implements the core logic for S3 file uploads, AWS V4 signing, account management, and event listeners for Thunderbird's cloudFile API.
-   `management.html` & `management.js`: UI and logic for configuring S3 account credentials and settings. Uses browser storage and i18n for localization.
-   `_locales/`: Contains localization files for supported languages (e.g., `en/messages.json`, `zh_CN/messages.json`).
-   `manifest.json`: Declares extension metadata, permissions, background scripts, and integration points with Thunderbird.

## Architecture & Data Flow

-   User configures S3 account via the management page.
-   Account info is stored in `browser.storage.local` keyed by accountId.
-   When a file is uploaded, `background.js` signs and uploads the file to S3, then returns the public link.
-   Uploads are managed via an in-memory queue (`uploadQueue`) to support aborting uploads.
-   All S3 requests use AWS V4 signing, implemented in `background.js`.

## Developer Workflows

-   **Build/Package**: Use `./build-xpi.sh` to create properly structured `.xpi` file for distribution
-   `./build-xpi.sh xpi` - Creates XPI file only
-   `./build-xpi.sh zip` - Creates ZIP file only
-   `./build-xpi.sh both` - Creates both XPI and ZIP files (default)
-   **Development**: Install directly from `manifest.json` using "Install Add-on From File" in Add-ons Manager
-   **Debugging**: Use Thunderbird's Add-ons Debugger to inspect background scripts and storage. Console logs are used for upload status and errors.
-   **Localization**: Add new languages by creating a folder in `_locales/` and providing a `messages.json` file.

## Installation Troubleshooting

-   **"File appears corrupted"**: Ensure XPI contains all required files (manifest.json, background.js, \_locales/, etc.)
-   **Manifest validation**: JSON syntax must be valid, all required fields present, proper file structure
-   **Development install**: Use "Install Add-on From File" and select `manifest.json` directly from project folder
-   **XPI packaging**: Use provided build script to create proper XPI structure with correct compression

## Project-Specific Patterns

-   All S3 credentials and settings are managed via the management page and stored locally per account.
-   File paths in S3 include a timestamp and SHA256 hash for uniqueness and traceability.
-   Errors are surfaced via thrown exceptions with specific error codes (e.g., `ERR_UPLOAD_FAILED_NETWORK_ERROR`).
-   Uses the `browser.cloudFile` API for integration with Thunderbird's filelink system.
-   **Modern UI**: Management page features responsive design with dark mode support, real-time validation, and user-friendly status messages.

## Common Issues & Solutions

-   **SignatureDoesNotMatch errors**: Ensure AWS V4 signing uses consistent timestamps across signing and headers. Headers must be in alphabetical order for canonical request.
-   **Large file uploads (>50MB)**: Include `Content-Length` header and ensure payload hash matches actual file content.
-   **Empty payload**: Verify file data is properly passed to fetch() body and Content-Length matches actual file size.

## Integration Points

-   Relies on S3-compatible endpoints; supports custom endpoints via the management UI.
-   Uses the WebExtension API (`browser.*`) for all extension logic and storage.
-   Localization is handled via the `_locales/` directory and `browser.i18n`.

## Example Patterns

-   **S3 Path Construction**: `getAccountPrefix(account) + '/' + awsDate + '-SHA256-' + fileSha256 + '/' + encodeURIRFC3986(name)`
-   **AWS V4 Signing**: See `signAwsV4(fields)` in `background.js` - requires alphabetical header order and consistent timestamps.
-   **Account Storage**: `browser.storage.local.set({ [accountId]: accountInfo })` in `management.js`.
-   **Error Debugging**: Check browser console for detailed upload logs including file size, SHA256, and S3 response errors.

## Conventions

-   All extension logic is in plain JavaScript (no frameworks).
-   Manifest version is 2; extension targets Thunderbird 91.0+.
-   No external build tools or dependencies required.

---

If any section is unclear or missing important details, please provide feedback so this guide can be improved for future AI agents.
