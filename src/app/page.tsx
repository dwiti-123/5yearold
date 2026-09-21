"use client";

import { FormEvent, useEffect, useState } from "react";

const EXAMPLES = ["Why is the sky blue?", "How does money work?", "Paste an article link"];
const LOADING_MESSAGES = [
  "Putting on our thinking cap…",
  "Swapping big words for little ones…",
  "Finding a really good example…",
  "Almost ready to explain!",
];

export default function Home() {
  const [input, setInput] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (!loading) return;
    const timer = window.setInterval(
      () => setLoadingIndex((current) => (current + 1) % LOADING_MESSAGES.length),
      1800,
    );
    return () => window.clearInterval(timer);
  }, [loading]);

  async function requestExplanation(value: string) {
    if (!value || loading) return;

    setLoading(true);
    setLoadingIndex(0);
    setError("");
    setAnswer("");
    setCopied(false);
    setSuggestions([]);

    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: value }),
      });
      const data = (await response.json()) as { explanation?: string; error?: string; suggestions?: string[] };
      if (!response.ok) throw new Error(data.error || "Something went a little wonky. Please try again.");
      setAnswer(data.explanation || "I couldn't find an explanation this time. Please try again.");
      setSuggestions(data.suggestions || []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went a little wonky. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function explain(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void requestExplanation(input.trim());
  }

  function chooseSuggestion(suggestion: string) {
    const nextInput = `What is ${suggestion}?`;
    setInput(nextInput);
    void requestExplanation(nextInput);
  }

  async function copyAnswer() {
    await navigator.clipboard.writeText(answer);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  const answerLines = answer.split("\n").filter(Boolean);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FFF9F0] text-[#26215C]">
      <div className="blob blob-one" aria-hidden="true" />
      <div className="blob blob-two" aria-hidden="true" />
      <div className="blob blob-three" aria-hidden="true" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 pb-12 pt-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between">
          <a className="flex items-center gap-3" href="#top" aria-label="5yearr kid home">
            <span className="logo-mark">5</span>
            <span className="font-display text-xl font-black tracking-[-0.04em] sm:text-2xl">5yearr kid</span>
          </a>
          <span className="hidden rounded-full border-2 border-[#26215C] bg-white px-4 py-2 text-xs font-extrabold shadow-[3px_3px_0_#26215C] sm:inline-block">
            BIG IDEAS, TINY WORDS
          </span>
        </header>

        <section id="top" className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center py-14 text-center sm:py-20">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border-2 border-[#26215C] bg-[#DDF5D7] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] shadow-[3px_3px_0_#26215C]">
            <span aria-hidden="true">✦</span> No confusing words allowed
          </div>

          <h1 className="font-display max-w-3xl text-5xl font-black leading-[0.95] tracking-[-0.065em] sm:text-7xl lg:text-[5.6rem]">
            Make it make <span className="relative inline-block text-[#7F77DD]">sense.<span className="title-swoop" /></span>
          </h1>
          <p className="mt-6 max-w-2xl text-base font-semibold leading-7 text-[#575273] sm:text-lg">
            Drop in a tricky topic, some article text, or a link. We’ll turn it into a simple explanation you could tell a five-year-old.
          </p>

          <form onSubmit={explain} className="mt-9 w-full text-left sm:mt-11">
            <div className="input-card">
              <label htmlFor="idea" className="mb-3 block text-sm font-black">
                What should we make easier?
              </label>
              <textarea
                id="idea"
                value={input}
                maxLength={8000}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Try: How do airplanes stay in the sky?"
                className="min-h-32 w-full resize-none bg-transparent text-base font-semibold leading-7 text-[#26215C] outline-none placeholder:text-[#9B96B1] sm:min-h-36 sm:text-lg"
              />
              <div className="mt-3 flex flex-col gap-3 border-t-2 border-[#E9E4F2] pt-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs font-bold text-[#817B98]">Topic, text, or URL · {input.length.toLocaleString()}/8,000</span>
                <button className="explain-button" type="submit" disabled={!input.trim() || loading}>
                  {loading ? <span className="spinner" aria-hidden="true" /> : <span aria-hidden="true">✦</span>}
                  {loading ? "Thinking…" : "Explain it simply"}
                </button>
              </div>
            </div>
          </form>

          {!answer && !error && !loading && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="mr-1 font-bold text-[#817B98]">Try one:</span>
              {EXAMPLES.map((example) => (
                <button key={example} type="button" onClick={() => setInput(example)} className="example-chip">
                  {example}
                </button>
              ))}
            </div>
          )}

          {loading && (
            <div className="result-card mt-7 text-center" role="status" aria-live="polite">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#26215C] bg-[#FFE08A] text-2xl shadow-[3px_3px_0_#26215C]">💡</div>
              <p className="font-display text-xl font-black">{LOADING_MESSAGES[loadingIndex]}</p>
              <p className="mt-2 text-sm font-semibold text-[#77718E]">This usually takes just a few seconds.</p>
            </div>
          )}

          {error && (
            <div className="error-card mt-7" role="alert">
              <span className="text-2xl" aria-hidden="true">🌧️</span>
              <div>
                <p className="font-black">Tiny hiccup!</p>
                <p className="mt-1 text-sm font-semibold text-[#655F7C]">{error}</p>
              </div>
            </div>
          )}

          {answer && !loading && (
            <article className="result-card mt-7 text-left" aria-live="polite">
              <div className="mb-5 flex items-center justify-between gap-4 border-b-2 border-[#E9E4F2] pb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#26215C] bg-[#FFD2E1] text-lg">💡</span>
                  <h2 className="font-display text-xl font-black sm:text-2xl">Okay, here’s the simple version</h2>
                </div>
                <button type="button" onClick={copyAnswer} className="copy-button" aria-label="Copy explanation">
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="space-y-3">
                {answerLines.map((line, index) => {
                  const isBullet = /^[-•*]\s/.test(line);
                  return isBullet ? (
                    <div key={`${line}-${index}`} className="answer-bullet">
                      <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#7F77DD]" aria-hidden="true" />
                      <p>{line.replace(/^[-•*]\s*/, "")}</p>
                    </div>
                  ) : (
                    <p key={`${line}-${index}`} className={index === 0 ? "font-black text-[#26215C]" : "font-semibold text-[#575273]"}>{line}</p>
                  );
                })}
              </div>
              {suggestions.length > 0 && (
                <div className="mt-5 border-t-2 border-[#E9E4F2] pt-5">
                  <p className="mb-3 text-sm font-black">Pick what you meant:</p>
                  <div className="flex flex-wrap gap-3">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        className="clarify-button"
                        onClick={() => chooseSuggestion(suggestion)}
                      >
                        {suggestion}
                        <span aria-hidden="true">→</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </article>
          )}
        </section>

        <footer className="flex flex-col items-center justify-between gap-2 border-t-2 border-[#26215C]/10 pt-5 text-xs font-bold text-[#817B98] sm:flex-row">
          <span>Made for curious minds ✦</span>
          <span>AI can make mistakes — ask a grown-up when it matters.</span>
        </footer>
      </div>
    </main>
  );
}
