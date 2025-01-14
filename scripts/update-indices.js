import { ESLint } from 'eslint';
import { writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const commandToRunThisScript = 'yarn update:indices';

// Generate index file for rules.
const rulesPath = join(__dirname, '..', 'lib', 'rules');
await exportDirectoryToIndex(rulesPath, commandToRunThisScript);

// Generate index file for configs.
const configPath = join(__dirname, '..', 'lib', 'config');
await exportDirectoryToIndex(configPath, commandToRunThisScript);

/**
 * Generate a JavaScript-safe variable name from a string.
 * Mostly targeted at filenames right now, doesn't yet handle all possible strings.
 * @param {string} fileName
 * @returns {string}
 */
function fileNameToVariableName(fileName) {
  const fileNameWithoutDashes = fileName.replaceAll('-', '');
  return /^\d/.test(fileNameWithoutDashes) ? `_${fileNameWithoutDashes}` : fileNameWithoutDashes;
}

/**
 * Generate an index file that imports and re-exports all the files in the given directory.
 * @param {string} dir
 */
async function exportDirectoryToIndex(dir, command) {
  const fileNames = readdirSync(dir)
    .filter(
      (fileName) => fileName.endsWith('.js') && fileName !== 'index.js' && !fileName.startsWith('_')
    )
    .map((fileName) => fileName.replace('.js', ''));

  let fileContents = `// STOP: This file is autogenerated by: ${command}\n\n`;

  // Create imports.
  for (const fileName of fileNames) {
    const fileNameWithoutDashes = fileNameToVariableName(fileName);
    fileContents += `import ${fileNameWithoutDashes} from './${fileName}.js';\n`;
  }

  // Create export.
  fileContents += '\nexport default {\n';
  for (const fileName of fileNames) {
    const fileNameWithoutDashes = fileNameToVariableName(fileName);
    const property = fileName.includes('-') ? `'${fileName}': ${fileNameWithoutDashes}` : fileName;
    fileContents += `  ${property},\n`;
  }
  fileContents += '};\n';

  // Write output.
  const outputFile = join(dir, 'index.js');
  writeFileSync(outputFile, fileContents);

  // Fix up any lint violations.
  const eslint = new ESLint({ fix: true });
  const results = await eslint.lintFiles([outputFile]);
  await ESLint.outputFixes(results);
}
