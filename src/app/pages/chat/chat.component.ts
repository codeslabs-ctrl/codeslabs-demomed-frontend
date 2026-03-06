import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ChatService, ChatMessageResponse } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

export interface ChatBubble {
  role: 'user' | 'assistant';
  text: string;
  fromAudio?: boolean;
  date: Date;
  /** Si el asistente sugiere abrir una pantalla (antecedentes, historia médica, etc.). */
  navigateTo?: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef<HTMLDivElement>;

  messages: ChatBubble[] = [];
  inputText = '';
  conversationId: string | null = null;
  loading = false;
  error: string | null = null;
  ttsEnabled = false;
  recording = false;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private shouldScrollToBottom = false;

  constructor(
    public chatService: ChatService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.addWelcomeIfEmpty();
  }

  ngOnDestroy(): void {
    if (this.recording && this.mediaRecorder?.state === 'recording') {
      this.mediaRecorder.stop();
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom && this.messagesContainer?.nativeElement) {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
      this.shouldScrollToBottom = false;
    }
  }

  private addWelcomeIfEmpty(): void {
    if (this.messages.length === 0) {
      this.messages.push({
        role: 'assistant',
        text: 'Hola. Soy el asistente de DemoMed. Puedo ayudarte a crear pacientes, agendar consultas, generar informes, y abrir la historia médica o los antecedentes de un paciente. ¿En qué te ayudo?',
        date: new Date()
      });
      this.shouldScrollToBottom = true;
    }
  }

  sendText(): void {
    const text = (this.inputText || '').trim();
    if (!text || this.loading) return;
    this.inputText = '';
    this.messages.push({ role: 'user', text, date: new Date() });
    this.shouldScrollToBottom = true;
    this.error = null;
    this.loading = true;
    this.chatService.sendMessage(text, this.conversationId ?? undefined).subscribe({
      next: (res) => this.handleResponse(res),
      error: () => {
        this.loading = false;
        this.error = 'No se pudo enviar el mensaje. Inténtalo de nuevo.';
      }
    });
  }

  private handleResponse(res: ChatMessageResponse): void {
    this.loading = false;
    if (res.conversationId) this.conversationId = res.conversationId;
    const reply = (res.reply || '').trim();
    if (reply) {
      this.messages.push({
        role: 'assistant',
        text: reply,
        fromAudio: res.fromAudio,
        date: new Date(),
        navigateTo: res.navigateTo
      });
      this.shouldScrollToBottom = true;
      if (this.ttsEnabled) this.speak(reply);
    }
  }

  goTo(navigateTo: string): void {
    if (navigateTo) this.router.navigateByUrl(navigateTo);
  }

  closeChat(): void {
    this.router.navigate(['/dashboard']);
  }

  toggleTts(): void {
    this.ttsEnabled = !this.ttsEnabled;
  }

  speak(text: string): void {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'es-ES';
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  }

  startRecording(): void {
    if (this.loading || this.recording) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      this.error = 'Tu navegador no soporta grabación de audio.';
      return;
    }
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      this.mediaRecorder.ondataavailable = (e) => { if (e.data.size) this.audioChunks.push(e.data); };
      this.mediaRecorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(this.audioChunks, { type: mime });
        this.sendAudioBlob(blob, mime);
      };
      this.mediaRecorder.start();
      this.recording = true;
      this.error = null;
    }).catch(() => {
      this.error = 'No se pudo usar el micrófono. Escribe tu mensaje.';
    });
  }

  stopRecording(): void {
    if (!this.recording || !this.mediaRecorder || this.mediaRecorder.state !== 'recording') return;
    this.mediaRecorder.stop();
    this.recording = false;
  }

  private sendAudioBlob(blob: Blob, mimeType: string): void {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      if (!base64) return;
      this.loading = true;
      this.error = null;
      this.chatService.sendAudio(base64, mimeType, this.conversationId ?? undefined).subscribe({
        next: (res) => this.handleResponse(res),
        error: () => {
          this.loading = false;
          this.error = 'No se pudo enviar el audio. Inténtalo de nuevo.';
        }
      });
    };
    reader.readAsDataURL(blob);
  }

  clearChat(): void {
    this.messages = [];
    this.conversationId = null;
    this.addWelcomeIfEmpty();
    this.error = null;
  }
}
