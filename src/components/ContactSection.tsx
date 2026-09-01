/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, MessageSquare, Send, CheckCircle2, Copy, ExternalLink, Instagram, Lock } from 'lucide-react';

interface ContactSectionProps {
  onAdminClick?: () => void;
}

export default function ContactSection({ onAdminClick }: ContactSectionProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const getMailtoUrl = () => {
    const subject = encodeURIComponent(`Contacto web: ${name}`);
    const body = encodeURIComponent(
      `Hola Clara,\n\nHas recibido una nueva consulta desde el formulario de contacto de tu sitio web de Yoga y Shiatsu.\n\n` +
      `Detalles del remitente:\n` +
      `- Nombre: ${name}\n` +
      `- Correo Electrónico: ${email}\n\n` +
      `Mensaje:\n` +
      `${message}\n\n` +
      `---`
    );
    return `mailto:clara.ch.yoga@gmail.com?subject=${subject}&body=${body}`;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    // Open mail client with pre-filled content
    const url = getMailtoUrl();
    window.location.href = url;
    
    setIsSubmitted(true);
  };

  const handleCopyMessage = () => {
    const fullText = `Consulta de Contacto:\nNombre: ${name}\nMail: ${email}\nMensaje:\n${message}`;
    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const handleResetForm = () => {
    setName('');
    setEmail('');
    setMessage('');
    setIsSubmitted(false);
  };

  return (
    <section 
      id="contacto" 
      className="pt-8 sm:pt-10 md:pt-12 pb-3 bg-[#232323] text-stone-200 scroll-mt-[48px] md:scroll-mt-[52px] min-h-[calc(100dvh-48px)] md:min-h-[calc(100dvh-52px)] flex flex-col justify-between relative"
    >
      <div id="contact-section" className="sr-only" />
      <div className="mx-auto max-w-3xl px-6 sm:px-8 w-full my-auto">
        
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="font-serif text-3xl font-light text-stone-200 sm:text-4xl leading-tight italic">Contacto</h2>
          </div>

          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.form 
                id="contact-form"
                key="contact-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit} 
                className="space-y-6 rounded-none border border-stone-200 bg-white p-6 shadow-xs sm:p-8"
              >
                  {/* Name */}
                  <div className="space-y-1">
                    <label htmlFor="contact-name" className="text-[10px] font-bold uppercase tracking-widest text-[#000000] block font-mono">
                      Nombre *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                      <input
                        id="contact-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder=""
                        className="w-full rounded-none border border-[#867768] bg-white py-2.5 sm:py-3.5 pl-9 sm:pl-11 pr-3 sm:pr-4 text-xs text-stone-charcoal placeholder-stone-400 focus:border-stone-charcoal focus:outline-hidden transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label htmlFor="contact-email" className="text-[10px] font-bold uppercase tracking-widest text-[#000000] block font-mono">
                      Correo Electrónico *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                      <input
                        id="contact-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder=""
                        className="w-full rounded-none border border-[#867768] bg-white py-2.5 sm:py-3.5 pl-9 sm:pl-11 pr-3 sm:pr-4 text-xs text-stone-charcoal placeholder-stone-400 focus:border-stone-charcoal focus:outline-hidden transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-1">
                    <label htmlFor="contact-message" className="text-[10px] font-bold uppercase tracking-widest text-[#000000] block font-mono">
                      Mensaje *
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                      <textarea
                        id="contact-message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder=""
                        rows={5}
                        className="w-full rounded-none border border-[#867768] bg-white py-2.5 sm:py-3.5 pl-9 sm:pl-11 pr-3 sm:pr-4 text-xs text-stone-charcoal placeholder-stone-400 focus:border-stone-charcoal focus:outline-hidden transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Submit Action */}
                  <div className="pt-2 flex justify-end">
                    <button
                      id="btn-send-message"
                      type="submit"
                      className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-none bg-stone-charcoal border border-stone-charcoal px-6 py-3.5 sm:px-8 sm:py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#EDE8E0] hover:bg-[#867768] hover:border-[#867768] active:scale-98 transition-all duration-300 cursor-pointer"
                    >
                      <span>Enviar Mensaje</span>
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  id="contact-success-card"
                  key="contact-success"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-none border border-stone-200 bg-white p-6 sm:p-10 text-center space-y-6 text-stone-charcoal"
                >
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="h-10 w-10 animate-bounce" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-serif text-2xl text-stone-charcoal font-medium">¡Mensaje listo para enviar!</h3>
                    <p className="text-xs text-stone-500 font-light max-w-lg mx-auto leading-relaxed">
                      Hemos preparado tu consulta. Tu aplicación de correo predeterminada debería haberse abierto para enviar el mensaje a <strong className="font-semibold text-[#867768]">clara.ch.yoga@gmail.com</strong>.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-4">
                    <a
                      id="btn-mailto-action"
                      href={getMailtoUrl()}
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-none bg-[#867768] border border-[#867768] px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-stone-charcoal hover:border-stone-charcoal transition-all duration-300"
                    >
                      <span>Abrir correo de nuevo</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <button
                      id="btn-copy-clipboard"
                      type="button"
                      onClick={handleCopyMessage}
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-none border border-stone-200 bg-stone-50 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-stone-700 hover:border-stone-charcoal transition-all duration-300"
                    >
                      <Copy className="h-3.5 w-3.5 text-stone-400" />
                      <span>{copied ? '¡Copiado!' : 'Copiar mensaje'}</span>
                    </button>
                  </div>

                  <div className="pt-6 border-t border-stone-100">
                    <button
                      id="btn-write-another"
                      type="button"
                      onClick={handleResetForm}
                      className="text-[10px] font-bold uppercase tracking-widest text-[#867768] hover:text-stone-charcoal underline decoration-1 underline-offset-4"
                    >
                      Escribir otro mensaje
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      {/* Extreme bottom copyright and small icons */}
      <div className="w-full pt-4 pb-20 md:pb-4">
        <div className="mx-auto max-w-3xl px-6 sm:px-8 flex flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p>© 2026 Maria Clara . Yoga</p>
          <div className="flex items-center gap-4">
            {onAdminClick && (
              <button 
                onClick={onAdminClick}
                title="Panel de gestión"
                aria-label="Panel de gestión"
                className="hidden md:inline-flex text-stone-500 hover:text-stone-300 transition-colors cursor-pointer p-1"
              >
                <Lock className="h-3.5 w-3.5" />
              </button>
            )}
            <a 
              href="https://www.instagram.com/mariaclara.yoga/" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Instagram @mariaclara.yoga"
              className="text-stone-400 hover:text-stone-200 transition-colors inline-flex items-center p-1"
            >
              <Instagram className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
