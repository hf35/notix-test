"use client";
import styles from "./page.module.css";
import { useEffect, useRef, useState } from "react";
import SearchResultLine from "./_components/searchResultLine/searchResultLine";
import { useSearchParams } from "next/navigation";

const DEBOUNCE_TIMEOUT = 200;
const MINIMUM_QUERY_LENGTH = 3;

export default function SearchPage() {
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [searchedQuery, setSearchedQuery] = useState("");

  const [persons, setPersons] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const controllerRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    window.history.replaceState({}, "", `?q=${encodeURIComponent(query)}`);
    setSearchedQuery("")
    if (query.length < MINIMUM_QUERY_LENGTH) {
      setPersons([]);
      return;
    }

    //debouncing - to avoid unnessery request while user doesn't finish his request
    if (debounceRef.current) { clearTimeout(debounceRef.current) }

    debounceRef.current = setTimeout(async () => {
      if (controllerRef.current) controllerRef.current.abort();

      const controller = new AbortController();
      controllerRef.current = controller;

      setLoading(true);
      try {
        const res = await fetch(`/api/persons?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });

        if (!res.ok) throw new Error("Request failed");
        const data = await res.json();
        setPersons(data);
        setSearchedQuery(query)
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_TIMEOUT);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.titlePage}>Поиск сотрудников</h1>
        <div className={styles.searchBox}>
          <input type="text" className={styles.searchInput} value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск..." />
        </div>
        <div className="persons-list">
          {loading ? (
            <p className={styles.loadingSearch}>Загрузка...</p>
          ) : query.length < MINIMUM_QUERY_LENGTH ?
            <p>Введите минимум 3 символа</p>
            : persons.length === 0 && searchedQuery.length >= MINIMUM_QUERY_LENGTH ? <p>Данных нет</p> : (
              <ul>
                {persons
                  .map((person, index) => (
                    <SearchResultLine key={index} query={searchedQuery} name={person} />
                  ))}
              </ul>
            )}
        </div>
      </main>
      <footer className={styles.footer}>
        <p>Тестовое задание для Notix. 07.10.25</p>
      </footer>
    </div>
  );
}
