import { useEffect, useMemo, useRef, useState } from "react";

function normalize(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function regionType(name) {
  return name.trim().split(/\s+/)[0] ?? "";
}

export default function SearchBox({ regions, onPick, disabled }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const boxRef = useRef(null);

  const results = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return [];
    return regions
      .filter((r) => normalize(`${r.regency} ${r.name}`).includes(q))
      .slice(0, 12);
  }, [query, regions]);

  useEffect(() => {
    function onClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function pick(region) {
    onPick(region);
    setQuery("");
    setOpen(false);
    setHighlight(0);
  }

  function clear() {
    setQuery("");
    setOpen(false);
    setHighlight(0);
    boxRef.current?.querySelector("input")?.focus();
  }

  function onKeyDown(e) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      pick(results[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="search-box" ref={boxRef}>
      <input
        type="text"
        value={query}
        disabled={disabled}
        placeholder="Cari kabupaten/kota…"
        aria-label="Cari kabupaten/kota"
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setHighlight(0);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />
      {query ? (
        <button
          type="button"
          className="search-clear"
          aria-label="Bersihkan pencarian"
          onClick={clear}
        >
          ✕
        </button>
      ) : null}
      {open && query.trim() && (
        <ul className="search-results">
          {results.length === 0 ? (
            <li className="search-empty">Tidak ditemukan</li>
          ) : (
            results.map((r, i) => (
              <li key={r.adm2}>
                <button
                  type="button"
                  className={i === highlight ? "active" : ""}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => pick(r)}
                >
                  <span className="search-name">{r.regency}</span>
                  <span className="search-type">{regionType(r.name)}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
