import { useState } from "react";
import { Shell, SectionHeader } from "@/components/Layout";
import { site } from "@/config/site";
import { Socials } from "@/components/socials";
import { LiveClock } from "@/components/live-clock";
import {
  Mail,
  Send,
  CheckCircle2,
  Copy,
  Check,
} from "lucide-react";

export function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formState.name ||
      !formState.email ||
      !formState.message
    ) {
      return;
    }

    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);

      setFormState({
        name: "",
        email: "",
        message: "",
      });
    }, 4000);
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(site.email);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy email:", error);
    }
  };

  return (
    <main id="contact" className="">
      <SectionHeader title="Contact" />

      <Shell>
        
 {/* =====================================================
              DIRECT INBOX
          ====================================================== */}

          <div className="border-t border-[var(--line)] p-6 md:p-8">
            <h3 className="mb-5 font-serif text-2xl text-[var(--fg)]">
              Direct Inbox
            </h3>

            <div className="flex flex-col gap-5">
              <div className="flex w-fit max-w-full items-center gap-3 rounded-md border border-[var(--line)] bg-[var(--chip)] p-2">
                <div className="grid size-9 shrink-0 place-items-center border border-[var(--line)] bg-[var(--chip)] text-[var(--muted)]">
                  <Mail className="size-4" />
                </div>

                <a
                  href={`mailto:${site.email}`}
                  className="min-w-0 truncate font-mono text-[12px] text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
                >
                  {site.email}
                </a>

                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="shrink-0 border border-[var(--line)] bg-[var(--chip)] p-2 text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
                  title="Copy email to clipboard"
                  aria-label="Copy email to clipboard"
                >
                  {copied ? (
                    <Check className="size-3.5 text-blue-400" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </button>
              </div>

              <Socials className="w-full" />
            </div>
          </div>

<div className="border border-[var(--line)]">
          {/* =====================================================
              SEND MESSAGE
          ====================================================== */}

          <div className="p-6 md:p-8">
            <h3 className="mb-6 font-serif text-2xl text-[var(--fg)]">
              Send a Message
            </h3>

            {submitted ? (
              <div className="flex min-h-[300px] items-center justify-center border border-blue-500/30 bg-blue-500/10 p-6 text-center text-blue-300">
                <div>
                  <CheckCircle2 className="mx-auto mb-3 size-8 text-blue-400" />

                  <h4 className="text-[15px] font-semibold">
                    Message Sent!
                  </h4>

                  <p className="mt-1 text-xs text-blue-200/80">
                    Thanks for reaching out, {formState.name}. I'll get back to you shortly.
                  </p>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                    {/* NAME */}

                    <div>
                      <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-[var(--soft)]">
                        Your Name
                      </label>

                      <input
                        type="text"
                        required
                        value={formState.name}
                        onChange={(e) =>
                          setFormState({
                            ...formState,
                            name: e.target.value,
                          })
                        }
                        placeholder="Your name"
                        className="w-full border border-[var(--line)] bg-[var(--chip)] px-3 py-3 text-[12px] text-[var(--fg)] outline-none transition-colors placeholder:text-[var(--soft)] focus:border-blue-500/60"
                      />
                    </div>

                    {/* EMAIL */}

                    <div>
                      <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-[var(--soft)]">
                        Email Address
                      </label>

                      <input
                        type="email"
                        required
                        value={formState.email}
                        onChange={(e) =>
                          setFormState({
                            ...formState,
                            email: e.target.value,
                          })
                        }
                        placeholder="you@example.com"
                        className="w-full border border-[var(--line)] bg-[var(--chip)] px-3 py-3 text-[12px] text-[var(--fg)] outline-none transition-colors placeholder:text-[var(--soft)] focus:border-blue-500/60"
                      />
                    </div>

                    {/* MESSAGE */}

                    <div>
                      <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-[var(--soft)]">
                        Message
                      </label>

                      <textarea
                        required
                        rows={6}
                        value={formState.message}
                        onChange={(e) =>
                          setFormState({
                            ...formState,
                            message: e.target.value,
                          })
                        }
                        placeholder="Tell me about your project, idea, or opportunity..."
                        className="w-full resize-none border border-[var(--line)] bg-[var(--chip)] px-3 py-3 text-[12px] text-[var(--fg)] outline-none transition-colors placeholder:text-[var(--soft)] focus:border-blue-500/60"
                      />
                    </div>

                    {/* SUBMIT */}

                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center gap-2 bg-[var(--fg)] px-6 py-3 text-[12px] font-semibold text-[var(--bg)] transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90"
                    >
                      Send Message

                      <Send className="size-3.5" />
                    </button>
              </form>
            )}
          </div>

         
        </div>
      </Shell>
    </main>
  );
}

export default ContactPage;