const fs = require('fs');
const path = require('path');
const https = require('https');

const TOKEN = process.argv[2];
const OWNER = 'Snapwave333';
const REPO = 'CottonCandyBot';
const TAG = 'v2.1.0-beta';
const RELEASE_NAME = 'Cotton Candy Bot v2.1.0-beta';
const RELEASE_BODY = `## Cotton Candy Bot v2.1.0-beta
This is the full-stack beta release featuring a robust Windows installer.

### SHA-256 Checksum
\`f4a6e7ce69eaf60d99e7a99e86e3259e2c02680496649c5eb1f2b900829c04a0\`

### Key Features
- Robust Windows Installer with Admin Elevation
- Program Files deployment and Registry integration
- Desktop shortcuts with branding icons
- Full-stack bundling (Next.js + Node.js)
- Rollback support on installation failure`;

const ASSETS = [
    { name: 'cotton-candy-bot-v2.1.0-beta.zip', path: path.join(__dirname, '..', 'cotton-candy-bot-v2.1.0-beta.zip') },
    { name: 'SHA256SUMS.txt', path: path.join(__dirname, '..', 'SHA256SUMS.txt') }
];

async function request(options, data) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(body || '{}'));
                } else {
                    reject(new Error(`Status ${res.statusCode}: ${body}`));
                }
            });
        });
        req.on('error', reject);
        if (data) {
            if (Buffer.isBuffer(data)) {
                req.write(data);
            } else {
                req.write(typeof data === 'string' ? data : JSON.stringify(data));
            }
        }
        req.end();
    });
}

async function publish() {
    if (!TOKEN) throw new Error('Token is required');

    console.log(`Creating release ${TAG}...`);
    const release = await request({
        hostname: 'api.github.com',
        path: `/repos/${OWNER}/${REPO}/releases`,
        method: 'POST',
        headers: {
            'Authorization': `token ${TOKEN}`,
            'User-Agent': 'CottonCandyBot-Publisher',
            'Content-Type': 'application/json'
        }
    }, {
        tag_name: TAG,
        name: RELEASE_NAME,
        body: RELEASE_BODY,
        draft: false,
        prerelease: true
    });

    const releaseId = release.id;
    const uploadUrlBase = release.upload_url.split('{')[0];
    console.log(`Release created (ID: ${releaseId}). Uploading assets...`);

    for (const asset of ASSETS) {
        console.log(`Uploading ${asset.name}...`);
        const stats = fs.statSync(asset.path);
        const fileContent = fs.readFileSync(asset.path);
        
        const host = new URL(uploadUrlBase).hostname;
        const uploadPath = `${new URL(uploadUrlBase).pathname}?name=${asset.name}`;

        await request({
            hostname: host,
            path: uploadPath,
            method: 'POST',
            headers: {
                'Authorization': `token ${TOKEN}`,
                'User-Agent': 'CottonCandyBot-Publisher',
                'Content-Type': asset.name.endsWith('.zip') ? 'application/zip' : 'text/plain',
                'Content-Length': stats.size
            }
        }, fileContent);
        console.log(`Uploaded ${asset.name} successfully.`);
    }

    console.log('Publishing complete!');
}

publish().catch(err => {
    console.error('Publishing failed:', err.message);
    process.exit(1);
});
