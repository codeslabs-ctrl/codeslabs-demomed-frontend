import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import DOMPurify from 'dompurify';

/** Escapa HTML y aplica un subconjunto tipo Markdown (negritas, código, listas) para respuestas del asistente. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatInline(escaped: string): string {
  return escaped
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

function chatMarkdownToHtml(text: string): string {
  const raw = (text || '').trim();
  if (!raw) return '';

  const blocks = raw.split(/\n{2,}/);
  const out: string[] = [];

  for (const block of blocks) {
    const lines = block.split('\n');
    const nonEmpty = lines.map((l) => l.trim()).filter(Boolean);
    const allBullets =
      nonEmpty.length > 0 && nonEmpty.every((l) => /^[-*•]\s+/.test(l));

    if (allBullets) {
      const items = nonEmpty.map((l) => l.replace(/^[-*•]\s+/, ''));
      out.push(
        '<ul>' +
          items.map((i) => `<li>${formatInline(escapeHtml(i))}</li>`).join('') +
          '</ul>'
      );
      continue;
    }

    const escapedBlock = escapeHtml(block);
    const withBreaks = escapedBlock.split('\n').map((line) => formatInline(line)).join('<br>');
    out.push(`<p>${withBreaks}</p>`);
  }

  return out.join('');
}

@Pipe({
  name: 'chatMarkdown',
  standalone: true
})
export class ChatMarkdownPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string | null | undefined): SafeHtml {
    if (value == null || value === '') {
      return this.sanitizer.bypassSecurityTrustHtml('');
    }
    const html = chatMarkdownToHtml(value);
    const clean = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'code', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: []
    });
    return this.sanitizer.bypassSecurityTrustHtml(clean);
  }
}
