import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const requiredFiles = [
  'index.html',
  'manifest.json',
  'service-worker.js',
  'script.js',
  'style.css',
  'capacitor.config.json'
];

const errors = [];

for (const file of requiredFiles) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) {
    errors.push(`File mancante: ${file}`);
  }
}

const manifestPath = path.join(root, 'manifest.json');
if (fs.existsSync(manifestPath)) {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    const requiredManifestFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
    for (const field of requiredManifestFields) {
      if (!(field in manifest)) {
        errors.push(`manifest.json: campo mancante '${field}'`);
      }
    }

    if (!Array.isArray(manifest.icons) || manifest.icons.length < 2) {
      errors.push('manifest.json: servono almeno 2 icone');
    } else {
      for (const icon of manifest.icons) {
        if (!icon.src) {
          errors.push('manifest.json: icona senza src');
          continue;
        }

        const iconPath = path.join(root, icon.src);
        if (!fs.existsSync(iconPath)) {
          errors.push(`Icona mancante: ${icon.src}`);
        }
      }
    }
  } catch (error) {
    errors.push(`manifest.json non valido: ${error.message}`);
  }
}

if (errors.length > 0) {
  console.error('Check PWA fallito:\n');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('Check PWA OK: file critici e manifest validi.');
