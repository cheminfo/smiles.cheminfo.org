/**
 * Copy the OpenSMILES specification into this repository, so the site serves it
 * from an address that has a valid certificate.
 *
 * What is written is the body of the AsciiDoc page and the drawings it points
 * at — never its stylesheet, which the site replaces. Run it again when
 * upstream publishes a new revision:
 *
 *     node scripts/importSpecification.js
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const SOURCE = 'https://opensmiles.org/opensmiles.html';
const DESTINATION = join(import.meta.dirname, '../frontend/public/spec');

// opensmiles.org serves a certificate for another name, which is the whole
// reason this copy exists. The download is a public document read once by a
// developer, so the check is turned off for it rather than left to fail.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const page = await download(SOURCE).then((response) => response.text());
const content = extractContent(page);
const assets = [...content.matchAll(/src="(?<asset>[^"]+)"/g)].map(
  (match) => match.groups.asset,
);

await mkdir(DESTINATION, { recursive: true });
await writeFile(
  join(DESTINATION, 'opensmiles.html'),
  `<!-- Imported by scripts/importSpecification.js from ${SOURCE}
     Copyright 2007-2016, Craig A. James — GNU Free Documentation License 1.2
     Source: https://github.com/opensmiles/OpenSMILES -->\n${rewrite(content)}\n`,
);

/* eslint-disable no-await-in-loop -- one drawing at a time: this reads a
   volunteer-run site, and eighty-five parallel requests is not how to treat
   one. */
for (const asset of assets) {
  const target = join(DESTINATION, asset);
  await mkdir(dirname(target), { recursive: true });
  const response = await download(new URL(asset, SOURCE));
  await writeFile(target, new Uint8Array(await response.arrayBuffer()));
}

/* eslint-enable no-await-in-loop */

process.stdout.write(
  `${assets.length} drawings and the specification written to ${DESTINATION}\n`,
);

/**
 * Fetch one address, refusing anything but a plain success.
 * @param url - What to fetch.
 * @returns The response.
 */
async function download(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${url} answered ${response.status}`);
  }
  return response;
}

/**
 * Take the article out of the page: everything AsciiDoc put in `#content`,
 * without the wrapper itself, and without the generated footer.
 * @param page - The whole downloaded page.
 * @returns The inner HTML of the content division.
 */
function extractContent(page) {
  const start = page.indexOf('<div id="content">');
  const end = page.indexOf('<div id="footnotes">');
  if (start === -1 || end === -1) {
    throw new Error('the page no longer has a #content and a #footnotes');
  }
  const inner = page
    .slice(start + '<div id="content">'.length, end)
    .trimEnd()
    .replace(/<\/div>$/, '')
    .trim();
  const opened = inner.match(/<div\b/g)?.length ?? 0;
  const closed = inner.match(/<\/div>/g)?.length ?? 0;
  if (opened !== closed) {
    throw new Error(`unbalanced divisions: ${opened} opened, ${closed} closed`);
  }
  return inner;
}

/**
 * Point the drawings at this site, drop the presentation the 2007 markup
 * carries in attributes, and send every outside link to its own tab.
 * @param content - The extracted article.
 * @returns The article as this site serves it.
 */
function rewrite(content) {
  return content
    .replaceAll(/src="(?!\/)/g, 'src="/spec/')
    .replaceAll(
      /<table[^>]*>/g,
      (table) =>
        table.replaceAll(
          /\s+(?:rules|frame|cellspacing|cellpadding|width|border)="[^"]*"/g,
          '',
        ) || table,
    )
    .replaceAll(
      /<a href="(?<url>https?:[^"]*)"/g,
      '<a href="$1" target="_blank" rel="noreferrer"',
    );
}
