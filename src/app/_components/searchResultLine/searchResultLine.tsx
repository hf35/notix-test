"use client";
import styles from "./searchResultLine.module.css";

export default function SearchResultLine({ query, name }: { query: string, name: string }) {
    if (!query) return null;
    const regex = new RegExp(`(${query})`, "gi");
    const parts = name.split(regex);
    return <li>{parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className={styles.marked}>
                {part}
            </mark>
        ) : (
            <span key={i}>{part}</span>
        )
    )}
    </li>
}