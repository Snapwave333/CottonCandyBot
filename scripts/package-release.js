const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

const VERSION = '2.1.0-beta';
const APP_NAME = 'cotton-candy-bot';
const RELEASE_NAME = `${APP_NAME}-v${VERSION}`;
const DIST_RELEASE = path.join(__dirname, '..', 'dist_release');
const ARCHIVE_NAME = `${RELEASE_NAME}.zip`;

async function packageRelease() {
    console.log(`Starting packaging for ${RELEASE_NAME}...`);

    // 1. Clean dist_release
    if (fs.existsSync(DIST_RELEASE)) {
        fs.rmSync(DIST_RELEASE, { recursive: true, force: true });
    }
    fs.mkdirSync(DIST_RELEASE);

    // 2. Build Frontend
    console.log('Building frontend...');
    execSync('npm run build', { stdio: 'inherit' });

    // 3. Define files to include
    const filesToInclude = [
        '.next',
        'public',
        'server',
        'scripts',
        'docs',
        '.env.example',
        'package.json',
        'package-lock.json',
        'install.bat',
        'uninstall.bat',
        'start.bat',
        'README.md',
        'CHANGELOG.md',
        'LICENSE.md',
        'assets/branding-kit/icon.ico'
    ];

    console.log('Copying files...');
    filesToInclude.forEach(file => {
        const src = path.join(__dirname, '..', file);
        const dest = path.join(DIST_RELEASE, file);
        
        if (fs.existsSync(src)) {
            // Ensure destination directory exists
            const destDir = path.dirname(dest);
            if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true });
            }

            if (fs.lstatSync(src).isDirectory()) {
                fs.mkdirSync(dest, { recursive: true });
                copyRecursiveSync(src, dest);
            } else {
                fs.copyFileSync(src, dest);
            }
        } else {
            console.warn(`Warning: ${file} not found, skipping...`);
        }
    });

    // 4. Generate VERSION.json
    const versionData = {
        version: VERSION,
        buildTimestamp: new Date().toISOString(),
        commitHash: getCommitHash()
    };
    fs.writeFileSync(path.join(DIST_RELEASE, 'VERSION.json'), JSON.stringify(versionData, null, 2));

    // 5. Create Zip (using PowerShell Compress-Archive for Windows compatibility)
    console.log(`Creating archive ${ARCHIVE_NAME}...`);
    const zipPath = path.join(__dirname, '..', ARCHIVE_NAME);
    if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
    
    // We use path.resolve for PowerShell compatibility
    const absoluteDistRelease = path.resolve(DIST_RELEASE);
    const absoluteZipPath = path.resolve(zipPath);
    
    execSync(`powershell -Command "Compress-Archive -Path '${absoluteDistRelease}\\*' -DestinationPath '${absoluteZipPath}' -Force"`);

    // 6. Generate SHA-256
    console.log('Generating SHA-256 checksum...');
    const fileBuffer = fs.readFileSync(zipPath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    const hex = hashSum.digest('hex');
    fs.writeFileSync(path.join(__dirname, '..', 'SHA256SUMS.txt'), `${hex}  ${ARCHIVE_NAME}\n`);

    console.log('Packaging complete!');
    console.log(`Archive: ${ARCHIVE_NAME}`);
    console.log(`Checksum: ${hex}`);
}

function copyRecursiveSync(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest);
        fs.readdirSync(src).forEach(function(childItemName) {
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

function getCommitHash() {
    try {
        // Since we are in cotton-candy-bot which is not a git repo,
        // we might need to look at the sibling repo if we can.
        // For now, let's return 'N/A' if it fails.
        return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    } catch (e) {
        return 'UNKNOWN';
    }
}

packageRelease().catch(console.error);
