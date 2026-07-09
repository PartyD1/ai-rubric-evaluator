"""AI-generated-text likelihood check via Sapling's AI Detector API."""

import logging
import os

import httpx

logger = logging.getLogger(__name__)

SAPLING_API_URL = "https://api.sapling.ai/api/v1/aidetect"

# Sapling accepts large documents, but cap the request to keep latency and
# cost predictable on very long reports (~20k chars covers a full written entry).
MAX_CHARS = 20000

# Fragments below this word count (list markers like "1.", headings, stray
# numerals) carry no linguistic signal and score unreliably — drop them from
# the per-sentence breakdown. The overall document score is unaffected.
MIN_SENTENCE_WORDS = 4


def check_ai_likelihood(text: str) -> dict:
    """Return Sapling's AI-generated-text likelihood for the given text.

    Returns {"score": float 0-1, "sentence_scores": [{"sentence": str, "score": float}]}.
    Raises on any request/API failure — callers should treat this as non-fatal
    and fall back to score=None.
    """
    api_key = os.getenv("SAPLING_API_KEY")
    if not api_key:
        raise RuntimeError("SAPLING_API_KEY is not set")

    response = httpx.post(
        SAPLING_API_URL,
        json={"key": api_key, "text": text[:MAX_CHARS], "sent_scores": True},
        timeout=60.0,
    )
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
