const fs = require('fs');
const path = require('path');

const directories = [
  './src',
  './src/components'
];

const replacements = {
  'bg-white': 'bg-white dark:bg-slate-900',
  'bg-slate-50': 'bg-slate-50 dark:bg-slate-950',
  'bg-slate-100': 'bg-slate-100 dark:bg-slate-800',
  'bg-slate-200': 'bg-slate-200 dark:bg-slate-700',
  'text-slate-900': 'text-slate-900 dark:text-white',
  'text-slate-800': 'text-slate-800 dark:text-slate-100',
  'text-slate-700': 'text-slate-700 dark:text-slate-200',
  'text-slate-600': 'text-slate-600 dark:text-slate-300',
  'text-slate-500': 'text-slate-500 dark:text-slate-400',
  'border-slate-200': 'border-slate-200 dark:border-slate-700',
  'border-slate-300': 'border-slate-300 dark:border-slate-600',
  'border-slate-100': 'border-slate-100 dark:border-slate-800',
  'shadow-xs': 'shadow-xs dark:shadow-none',
  'shadow-sm': 'shadow-sm dark:shadow-none',
  'hover:bg-slate-50': 'hover:bg-slate-50 dark:hover:bg-slate-800',
  'hover:bg-slate-100': 'hover:bg-slate-100 dark:hover:bg-slate-800',
  'hover:text-slate-900': 'hover:text-slate-900 dark:hover:text-white',
};

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isFile() && fullPath.endsWith('.tsx') && !fullPath.includes('Login.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      for (const [key, value] of Object.entries(replacements)) {
        // use regex to match the exact class name, ensuring it's not already prefixed with `dark:`
        const regex = new RegExp(`(?<!dark:)(?<=[\\s"'\\\`])${key}(?=[\\s"'\\\`])`, 'g');
        content = content.replace(regex, value);
      }
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

directories.forEach(processDirectory);
console.log('Done.');
