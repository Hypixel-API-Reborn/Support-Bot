const urlRegex =
  /https?:\/\/(www\.)?([-a-zA-Z0-9]{1,63}\.)*([-a-zA-Z0-9]{1,63}\.[a-zA-Z]{2,6})([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)/;

const allowedDomains: string[] = [
  '*.hypixel.net',
  '*.discord.com',
  '*.kathund.wtf',
  'kath.lol',
  'hypixel-api-reborn.github.io'
];

function isUrlAllowed(url: string): boolean {
  const isValidUrl = urlRegex.test(url);
  if (!isValidUrl) return false;
  const match = url.match(urlRegex);
  if (!match) return false;
  const domain: string = match[3];

  if (allowedDomains.some((pattern) => pattern === domain) && !match[2]) {
    return true;
  } else if (!allowedDomains.some((pattern) => pattern === domain)) {
    return (
      allowedDomains.some((pattern) => pattern === `*.${domain}`) ||
      allowedDomains.some((pattern) => pattern === match[2] + domain)
    );
  } else {
    return false;
  }
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
