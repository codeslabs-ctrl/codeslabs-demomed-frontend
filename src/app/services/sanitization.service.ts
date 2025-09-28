import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SanitizationService {

  constructor() { }

  /**
   * Sanitiza contenido HTML permitiendo solo tags seguros para contenido médico
   * @param htmlContent - Contenido HTML a sanitizar
   * @returns Contenido HTML sanitizado
   */
  sanitizeHtmlContent(htmlContent: string): string {
    if (!htmlContent || htmlContent.trim() === '') {
      return '';
    }

    // Tags permitidos para contenido médico
    const allowedTags = [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'div', 'span', 'blockquote', 'pre', 'code'
    ];

    // Crear un elemento temporal para sanitizar
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    // Función recursiva para sanitizar nodos
    const sanitizeNode = (node: Node): Node | null => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.cloneNode(true);
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const tagName = element.tagName.toLowerCase();

        // Si el tag no está permitido, solo mantener el contenido de texto
        if (!allowedTags.includes(tagName)) {
          const textContent = element.textContent || '';
          return document.createTextNode(textContent);
        }

        // Crear nuevo elemento con el mismo tag
        const newElement = document.createElement(tagName);

        // Copiar atributos permitidos
        const allowedAttributes = ['class', 'style', 'id'];
        for (const attr of allowedAttributes) {
          const value = element.getAttribute(attr);
          if (value) {
            // Sanitizar atributos de estilo
            if (attr === 'style') {
              const sanitizedStyle = this.sanitizeStyleAttribute(value);
              if (sanitizedStyle) {
                newElement.setAttribute(attr, sanitizedStyle);
              }
            } else {
              newElement.setAttribute(attr, value);
            }
          }
        }

        // Procesar nodos hijos
        for (let i = 0; i < element.childNodes.length; i++) {
          const sanitizedChild = sanitizeNode(element.childNodes[i]);
          if (sanitizedChild) {
            newElement.appendChild(sanitizedChild);
          }
        }

        return newElement;
      }

      return null;
    };

    // Sanitizar todos los nodos
    const sanitizedNodes: Node[] = [];
    for (let i = 0; i < tempDiv.childNodes.length; i++) {
      const sanitizedNode = sanitizeNode(tempDiv.childNodes[i]);
      if (sanitizedNode) {
        sanitizedNodes.push(sanitizedNode);
      }
    }

    // Crear nuevo contenedor con contenido sanitizado
    const resultDiv = document.createElement('div');
    sanitizedNodes.forEach(node => resultDiv.appendChild(node));

    return resultDiv.innerHTML;
  }

  /**
   * Sanitiza atributos de estilo CSS
   * @param styleValue - Valor del atributo style
   * @returns Estilo sanitizado o null si no es seguro
   */
  private sanitizeStyleAttribute(styleValue: string): string | null {
    // Propiedades CSS permitidas para contenido médico
    const allowedProperties = [
      'color', 'background-color', 'font-weight', 'font-style', 'text-decoration',
      'text-align', 'margin', 'padding', 'font-size', 'line-height'
    ];

    const sanitizedStyles: string[] = [];
    const styles = styleValue.split(';');

    for (const style of styles) {
      const [property, value] = style.split(':').map(s => s.trim());
      if (property && value && allowedProperties.includes(property)) {
        // Validar que el valor no contenga JavaScript
        if (!value.includes('javascript:') && !value.includes('expression(')) {
          sanitizedStyles.push(`${property}: ${value}`);
        }
      }
    }

    return sanitizedStyles.length > 0 ? sanitizedStyles.join('; ') : null;
  }

  /**
   * Sanitiza texto plano removiendo caracteres peligrosos
   * @param text - Texto a sanitizar
   * @returns Texto sanitizado
   */
  sanitizeText(text: string): string {
    if (!text || text.trim() === '') {
      return '';
    }

    return text
      .trim()
      .replace(/[<>]/g, '') // Remover < y >
      .replace(/javascript:/gi, '') // Remover javascript:
      .replace(/on\w+=/gi, '') // Remover event handlers
      .substring(0, 1000); // Limitar longitud
  }

  /**
   * Valida que el contenido HTML sea seguro
   * @param htmlContent - Contenido HTML a validar
   * @returns true si es seguro, false si no
   */
  isHtmlContentSafe(htmlContent: string): boolean {
    if (!htmlContent || htmlContent.trim() === '') {
      return true;
    }

    const sanitized = this.sanitizeHtmlContent(htmlContent);
    return sanitized === htmlContent;
  }

  /**
   * Limpia y formatea contenido HTML para almacenamiento
   * @param htmlContent - Contenido HTML a limpiar
   * @returns Contenido HTML limpio y formateado
   */
  cleanHtmlForStorage(htmlContent: string): string {
    if (!htmlContent || htmlContent.trim() === '') {
      return '';
    }

    let cleaned = this.sanitizeHtmlContent(htmlContent);
    
    // Remover espacios en blanco excesivos
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    // Remover párrafos vacíos
    cleaned = cleaned.replace(/<p>\s*<\/p>/g, '');
    
    // Asegurar que el contenido no esté vacío después de la limpieza
    const textContent = cleaned.replace(/<[^>]*>/g, '').trim();
    if (textContent === '') {
      return '';
    }

    return cleaned;
  }

  /**
   * Valida campos específicos del formulario de pacientes
   * @param patient - Objeto paciente a validar
   * @returns Objeto con errores de validación
   */
  validatePatientData(patient: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar campos requeridos
    if (!patient.nombres || patient.nombres.trim() === '') {
      errors.push('Los nombres son requeridos');
    }

    if (!patient.apellidos || patient.apellidos.trim() === '') {
      errors.push('Los apellidos son requeridos');
    }

    if (!patient.email || patient.email.trim() === '') {
      errors.push('El email es requerido');
    }

    if (!patient.motivo_consulta || patient.motivo_consulta.trim() === '') {
      errors.push('El motivo de consulta es requerido');
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (patient.email && !emailRegex.test(patient.email)) {
      errors.push('El formato del email no es válido');
    }

    // Validar edad
    if (patient.edad && (isNaN(patient.edad) || patient.edad < 0 || patient.edad > 150)) {
      errors.push('La edad debe ser un número entre 0 y 150');
    }

    // Validar teléfono
    if (patient.telefono && patient.telefono.length > 20) {
      errors.push('El teléfono no puede tener más de 20 caracteres');
    }

    // Validar contenido HTML
    if (patient.motivo_consulta && !this.isHtmlContentSafe(patient.motivo_consulta)) {
      errors.push('El motivo de consulta contiene contenido no permitido');
    }

    if (patient.diagnostico && !this.isHtmlContentSafe(patient.diagnostico)) {
      errors.push('El diagnóstico contiene contenido no permitido');
    }

    if (patient.conclusiones && !this.isHtmlContentSafe(patient.conclusiones)) {
      errors.push('Las conclusiones contienen contenido no permitido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
