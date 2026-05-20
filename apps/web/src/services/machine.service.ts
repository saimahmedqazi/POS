import {
  platform,
  arch,
  version,
} from '@tauri-apps/plugin-os';

export async function getMachineFingerprint() {
  const [
    os,
    architecture,
    osVersion,
  ] = await Promise.all([
    platform(),

    arch(),

    version(),
  ]);

  return btoa(
    JSON.stringify({
      os,

      architecture,

      osVersion,
    }),
  );
}