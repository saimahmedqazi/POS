import {
  platform,
  arch,
  version,
  hostname,
} from '@tauri-apps/plugin-os';

export async function getMachineFingerprint() {
  const [
    os,
    architecture,
    osVersion,
    host,
  ] = await Promise.all([
    platform(),

    arch(),

    version(),

    hostname(),
  ]);

  return btoa(
    JSON.stringify({
      os,

      architecture,

      osVersion,

      host,
    }),
  );
}