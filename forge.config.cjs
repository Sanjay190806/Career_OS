const fs = require('node:fs');
const path = require('node:path');

const iconPath = path.join(__dirname, 'assets', 'icon');
const hasIcon = fs.existsSync(`${iconPath}.ico`);

module.exports = {
  packagerConfig: {
    name: 'SanzzCareerOS',
    executableName: 'SanzzCareerOS',
    appCopyright: 'Copyright (c) Sanjay K',
    asar: true,
    ...(hasIcon ? { icon: iconPath } : {}),
    ignore: [
      /^\/backend\/\.env/,
      /^\/frontend\/\.env/,
      /^\/\.env/,
      /^\/out/,
      /^\/release/,
      /^\/\.git/,
      /^\/\.codex/,
      /^\/\.agents/,
    ],
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'SanzzCareerOS',
        setupExe: 'Sanzz Career OS Setup.exe',
        setupIcon: hasIcon ? `${iconPath}.ico` : undefined,
        noMsi: true,
      },
    },
  ],
};

