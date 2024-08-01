const urlRegex =
  /https?:\/\/(www\.)?([-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b)([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

const allowedDomains: string[] = [
  'hypixel.net',
  '*.hypixel.net',
  'discord.com',
  '*.discord.com',
  'kath.lol',
  '*.kathund.wtf',
  'kathund.wtf',
  'hypixel-api-reborn.github.io'
];

function matchWildcard(domain: string, pattern: string): boolean {
  const regexPattern = pattern.replace(/[-\/\\^$+?.()|[\]{}]/g, '\\$&').replace(/\*/g, '.*');
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(domain);
}

function isUrlAllowed(url: string): boolean {
  const isValidUrl = urlRegex.test(url);
  if (!isValidUrl) {
    return false;
  }

  const match = url.match(urlRegex);
  const domain = match ? match[2] : null;
  if (!domain) {
    return false;
  }

  return allowedDomains.some((pattern) => matchWildcard(domain, pattern));
}

const testUrls = [
  'https://example.com',
  'https://sub.example.com',
  'https://blocked.com',
  'http://sub.allowed.com',
  'http://another-allowed-url.org',
  'https://not-allowed-url.net',
  'https://sub.allow.net',
  'https://another.sub.allow.net',
  'https://kathund.wtf',
  'https://test.kathund.wtf'
];

testUrls.forEach((url) => {
  const result = isUrlAllowed(url);
  console.log(`Is URL allowed: ${url} -> ${result}`);
});
