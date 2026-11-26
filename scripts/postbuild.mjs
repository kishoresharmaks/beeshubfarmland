import fs from 'fs';
import path from 'path';

const standaloneDir = path.join(process.cwd(), '.next', 'standalone');

/**
 * Recursively copies directory contents while safely preserving symlinks
 * (avoiding Node 22 ERR_FS_CP_EINVAL when source and destination symlinks
 * point to the same shared directory on production VPS deployments).
 */
function copyDirSafe(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src)) {
    const srcPath = path.join(src, entry);
    const destPath = path.join(dest, entry);
    const stat = fs.lstatSync(srcPath);

    if (stat.isSymbolicLink()) {
      const linkTarget = fs.readlinkSync(srcPath);
      try {
        const destStat = fs.lstatSync(destPath);
        if (destStat.isSymbolicLink() || destStat.isFile()) {
          fs.unlinkSync(destPath);
        } else if (destStat.isDirectory()) {
          fs.rmSync(destPath, { recursive: true, force: true });
        }
      } catch {
        // Destination does not exist yet
      }
      let symlinkType;
      if (process.platform === 'win32') {
        try {
          if (fs.statSync(srcPath).isDirectory()) symlinkType = 'junction';
        } catch {
          // Ignore dangling symlink target stat
        }
      }
      fs.symlinkSync(linkTarget, destPath, symlinkType);
    } else if (stat.isDirectory()) {
      copyDirSafe(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (fs.existsSync(standaloneDir)) {
  copyDirSafe(path.join(process.cwd(), 'public'), path.join(standaloneDir, 'public'));
  copyDirSafe(
    path.join(process.cwd(), '.next', 'static'),
    path.join(standaloneDir, '.next', 'static')
  );

  for (const envFile of ['.env.production', '.env.local', '.env']) {
    const srcEnv = path.join(process.cwd(), envFile);
    const destEnv = path.join(standaloneDir, envFile);
    if (fs.existsSync(srcEnv) && !fs.existsSync(destEnv)) {
      fs.copyFileSync(srcEnv, destEnv);
    }
  }

  console.log('Static assets synced to standalone.');
}
