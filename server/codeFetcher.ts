/**
 * Code Fetcher utility to retrieve and extract source code from external code sharing URLs
 * (OnlineGDB, GitHub, Gist, Pastebin, or raw links).
 */

export interface FetchCodeResult {
  success: boolean;
  code: string;
  sourceUrl: string;
  detectedLanguage?: string;
  provider: 'onlinegdb' | 'github' | 'gist' | 'pastebin' | 'direct' | 'generic';
  error?: string;
}

export async function fetchCodeFromUrl(rawUrl: string): Promise<FetchCodeResult> {
  const trimmedUrl = rawUrl.trim();
  
  if (!trimmedUrl) {
    return {
      success: false,
      code: '',
      sourceUrl: '',
      provider: 'direct',
      error: 'URL cannot be empty'
    };
  }

  // Handle direct code if the user accidentally pasted raw code into the URL field
  if (trimmedUrl.includes('\n') || (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://'))) {
    return {
      success: true,
      code: trimmedUrl,
      sourceUrl: 'direct-input',
      provider: 'direct',
      detectedLanguage: detectLanguageFromCode(trimmedUrl)
    };
  }

  let targetUrl = trimmedUrl;
  let provider: FetchCodeResult['provider'] = 'generic';

  try {
    const urlObj = new URL(trimmedUrl);
    const host = urlObj.hostname.toLowerCase();

    // 1. GitHub Blob -> Raw
    if (host.includes('github.com') && !host.includes('gist.github.com')) {
      provider = 'github';
      if (urlObj.pathname.includes('/blob/')) {
        targetUrl = trimmedUrl
          .replace('github.com', 'raw.githubusercontent.com')
          .replace('/blob/', '/');
      }
    }

    // 2. GitHub Gist -> Raw
    else if (host.includes('gist.github.com')) {
      provider = 'gist';
      if (!targetUrl.endsWith('/raw')) {
        targetUrl = `${targetUrl}/raw`;
      }
    }

    // 3. Pastebin -> Raw
    else if (host.includes('pastebin.com')) {
      provider = 'pastebin';
      if (!urlObj.pathname.startsWith('/raw/')) {
        const id = urlObj.pathname.replace(/^\//, '');
        targetUrl = `https://pastebin.com/raw/${id}`;
      }
    }

    // 4. OnlineGDB
    else if (host.includes('onlinegdb.com')) {
      provider = 'onlinegdb';
      // OnlineGDB pages render HTML with embedded editor code
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SkillBridgePlacementBot/1.0',
        'Accept': 'text/plain, text/html, application/json, */*'
      }
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return {
        success: false,
        code: '',
        sourceUrl: targetUrl,
        provider,
        error: `HTTP Error ${res.status}: ${res.statusText}`
      };
    }

    const textContent = await res.text();

    // Provider specific extraction:
    if (provider === 'onlinegdb') {
      const extractedOnlineGdb = extractOnlineGdbCode(textContent);
      if (extractedOnlineGdb) {
        return {
          success: true,
          code: extractedOnlineGdb.code,
          sourceUrl: trimmedUrl,
          provider: 'onlinegdb',
          detectedLanguage: extractedOnlineGdb.language || detectLanguageFromCode(extractedOnlineGdb.code)
        };
      }
      // If regex extraction fails on OnlineGDB, fall back to cleaning html
      const cleaned = cleanHtmlToCode(textContent);
      return {
        success: true,
        code: cleaned,
        sourceUrl: trimmedUrl,
        provider: 'onlinegdb',
        detectedLanguage: detectLanguageFromCode(cleaned)
      };
    }

    // Generic raw or text code
    return {
      success: true,
      code: textContent.trim(),
      sourceUrl: targetUrl,
      provider,
      detectedLanguage: detectLanguageFromUrlOrCode(targetUrl, textContent)
    };

  } catch (err: any) {
    return {
      success: false,
      code: '',
      sourceUrl: trimmedUrl,
      provider,
      error: err.name === 'AbortError' 
        ? 'Request timed out while fetching the code URL (12s limit)' 
        : `Could not reach URL: ${err.message || String(err)}`
    };
  }
}

/**
 * Extracts code from OnlineGDB HTML page content
 */
function extractOnlineGdbCode(html: string): { code: string; language?: string } | null {
  // OnlineGDB often embeds initial code in editor_code or script blocks
  // e.g., editor.setValue("...") or Ace editor textarea or pre tag
  const scriptRegex = /editor\.setValue\s*\(\s*(['"`])([\s\S]*?)\1\s*\)/i;
  const match = html.match(scriptRegex);
  if (match && match[2]) {
    try {
      // Decode escaped newlines and slashes
      const unescaped = match[2]
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t')
        .replace(/\\r/g, '')
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'")
        .replace(/\\\\/g, '\\');
      return { code: unescaped.trim() };
    } catch {
      return { code: match[2].trim() };
    }
  }

  // Check for pre or code tags
  const codeTagMatch = html.match(/<pre[^>]*id=["']editor["'][^>]*>([\s\S]*?)<\/pre>/i) ||
                        html.match(/<pre[^>]*class=["']code["'][^>]*>([\s\S]*?)<\/pre>/i) ||
                        html.match(/<textarea[^>]*id=["']code["'][^>]*>([\s\S]*?)<\/textarea>/i);
  
  if (codeTagMatch && codeTagMatch[1]) {
    return { code: decodeHtmlEntities(codeTagMatch[1]).trim() };
  }

  return null;
}

function cleanHtmlToCode(html: string): string {
  // Remove scripts and style
  let stripped = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  stripped = stripped.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  // Extract visible text
  stripped = stripped.replace(/<[^>]+>/g, ' ');
  return decodeHtmlEntities(stripped).trim();
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

export function detectLanguageFromCode(code: string): string {
  if (code.includes('def ') || code.includes('import pandas') || (code.includes('import ') && code.includes(':') && !code.includes('{'))) {
    return 'python';
  }
  if (code.includes('#include <') || code.includes('std::') || code.includes('cout <<')) {
    return 'cpp';
  }
  if (code.includes('public class ') || code.includes('System.out.println')) {
    return 'java';
  }
  if (code.includes('interface ') || code.includes(': string') || code.includes(': number')) {
    return 'typescript';
  }
  if (code.includes('function ') || code.includes('const ') || code.includes('console.log') || code.includes('let ')) {
    return 'javascript';
  }
  if (code.toUpperCase().includes('SELECT ') && code.toUpperCase().includes(' FROM ')) {
    return 'sql';
  }
  return 'unknown';
}

function detectLanguageFromUrlOrCode(url: string, code: string): string {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.endsWith('.py')) return 'python';
  if (lowerUrl.endsWith('.cpp') || lowerUrl.endsWith('.cc') || lowerUrl.endsWith('.h')) return 'cpp';
  if (lowerUrl.endsWith('.java')) return 'java';
  if (lowerUrl.endsWith('.ts') || lowerUrl.endsWith('.tsx')) return 'typescript';
  if (lowerUrl.endsWith('.js') || lowerUrl.endsWith('.jsx')) return 'javascript';
  if (lowerUrl.endsWith('.sql')) return 'sql';
  return detectLanguageFromCode(code);
}
