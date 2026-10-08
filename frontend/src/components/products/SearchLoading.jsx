import { useEffect, useState } from "react";
import "./SearchLoading.css";

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const DEFAULT_PHRASES = [
  "SEARCHING CATALOGUE",
  "MATCHING SILHOUETTES",
  "RANKING RESULTS",
];

function randomChar() {
  return CHARSET[(Math.random() * CHARSET.length) | 0];
}

function scramble(text) {
  return text
    .split("")
    .map((char) => (char === " " ? " " : randomChar()))
    .join("");
}

function SearchLoading({
  phrases = DEFAULT_PHRASES,
  stagger = 60,
  cycles = 3,
  flipMs = 120,
  holdMs = 1000,
}) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [display, setDisplay] = useState(() => scramble(""));
  const [prevPhrase, setPrevPhrase] = useState("");

  const text = phrases[phraseIndex % phrases.length];
  const chars = text.split("");

  if (prevPhrase !== text) {
    setPrevPhrase(text);
    setDisplay(scramble(text));
  }

  useEffect(() => {
    const start = performance.now();
    const settleAt = chars.map((_, i) => i * stagger + cycles * flipMs);

    const id = setInterval(() => {
      const elapsed = performance.now() - start;
      const settled = elapsed >= settleAt[settleAt.length - 1];
      const next = chars
        .map((ch, i) => {
          if (ch === " ") return " ";
          return elapsed >= settleAt[i] ? ch : randomChar();
        })
        .join("");
      setDisplay(next);
      if (settled) clearInterval(id);
    }, 80);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, stagger, cycles, flipMs]);

  const settled = display === text;

  useEffect(() => {
    if (!settled) return;
    const timeout = setTimeout(
      () => setPhraseIndex((value) => value + 1),
      holdMs
    );
    return () => clearTimeout(timeout);
  }, [settled, holdMs]);

  return (
    <div
      className="search-loading"
      role="status"
      aria-label="Searching products"
    >
      <div className="search-loading__panel">
        <span className="search-loading__kicker">Search in progress</span>

        <div className="search-loading__tiles" aria-hidden="true">
          {chars.map((char, index) => {
            if (char === " ") {
              return (
                <span key={index} className="sf-tile sf-tile--space" />
              );
            }
            const glyph =
              display.length === text.length ? display[index] : char;
            return (
              <span key={index} className="sf-tile">
                <span className="sf-tile__char">{glyph}</span>
              </span>
            );
          })}
        </div>

        <div className="search-loading__bar">
          <span />
        </div>

        <p className="search-loading__note">
          Hold tight — this only takes a moment
        </p>
      </div>
    </div>
  );
}

export default SearchLoading;
