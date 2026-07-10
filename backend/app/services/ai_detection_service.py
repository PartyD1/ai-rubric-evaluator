"""AI-generated-text likelihood check via Sapling's AI Detector API."""

import logging
import os
import re
import time

import httpx

logger = logging.getLogger(__name__)

SAPLING_API_URL = "https://api.sapling.ai/api/v1/aidetect"

# Sapling's cheaper tiers enforce a short burst rate limit that clears within
# seconds — retry a couple of times before giving up rather than dropping the
# score on a transient 429.
MAX_RETRIES = 2
RETRY_BACKOFF_SECONDS = [2, 5]

# Sapling accepts large documents, but cap the request to keep latency and
# cost predictable on very long reports (~20k chars covers a full written entry).
MAX_CHARS = 20000

# Fragments below this word count (list markers like "1.", headings, stray
# numerals) carry no linguistic signal and score unreliably — drop them from
# the per-sentence breakdown. The overall document score is unaffected.
MIN_SENTENCE_WORDS = 4

_WHITESPACE_RE = re.compile(r"\s+")


def _normalize_for_detection(text: str) -> str:
    """Collapse PDF line-wrap newlines into spaces.

    PyMuPDF's get_text() inserts a newline at every visually wrapped line, not
    just at paragraph breaks. Left as-is, Sapling's sentence tokenizer splits
    on those newlines and scores PDF line fragments instead of real sentences.
    Collapsing all whitespace runs to single spaces lets Sapling's own
    punctuation-based sentence segmentation do the job correctly.
    """
    return _WHITESPACE_RE.sub(" ", text).strip()


def check_ai_likelihood(text: str) -> dict:
    """Return Sapling's AI-generated-text likelihood for the given text.

    Returns {"score": float 0-1, "sentence_scores": [{"sentence": str, "score": float}]}.
    Raises on any request/API failure — callers should treat this as non-fatal
    and fall back to score=None.
    """
    api_key = os.getenv("SAPLING_API_KEY")
    if not api_key:
        raise RuntimeError("SAPLING_API_KEY is not set")

    normalized = _normalize_for_detection(text)
    payload = {"key": api_key, "text": normalized[:MAX_CHARS], "sent_scores": True}

    response = None
    for attempt in range(MAX_RETRIES + 1):
        response = httpx.post(SAPLING_API_URL, json=payload, timeout=60.0)
        if response.status_code != 429 or attempt == MAX_RETRIES:
            break
        delay = RETRY_BACKOFF_SECONDS[attempt]
        logger.warning("Sapling rate-limited (429), retrying in %ds", delay)
        time.sleep(delay)

    response.raise_for_status()
    data = response.json()

    logger.info("Sapling AI-detection score: %.3f", data["score"])
    return {
        "score": data["score"],
        "sentence_scores": [
            {"sentence": s["sentence"], "score": s["score"]}
            for s in data.get("sentence_scores") or []
            if len(s["sentence"].split()) >= MIN_SENTENCE_WORDS
        ],
    }
