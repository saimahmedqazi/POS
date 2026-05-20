import {
  setSetting,
  getSetting,
} from './settings.repository';

export async function createSession(
  userId: string,
) {
  await setSetting(
    'current_session_user',
    userId,
  );
}

export async function getCurrentSession() {
  return await getSetting(
    'current_session_user',
  );
}

export async function clearSession() {
  await setSetting(
    'current_session_user',
    '',
  );
}