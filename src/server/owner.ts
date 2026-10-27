import { getChatGPTUser } from '@/app/chatgpt-auth';
// This allowlist is checked against identity headers supplied by Sites' trusted dispatcher.
// The value is the verified Site owner's account email, never a form or cookie value.
const OWNER_EMAIL = '2941005278@qq.com';
export async function getOwner() {
  const user = await getChatGPTUser();
  return user && user.email.toLowerCase() === OWNER_EMAIL ? user : null;
}
