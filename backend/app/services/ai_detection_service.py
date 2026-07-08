"""AI-generated-text likelihood check via Sapling's AI Detector API."""

import logging
import os

import httpx

logger = logging.getLogger(__name__)

SAPLING_API_URL = "https://api.sapling.ai/api/v1/aidetect"


def check_ai_likelihood(text: str) -> dict:
    """Return Sapling's AI-generated-text likelihood score for the given text.

    Returns {"score": float 0.0-1.0}. Raises on any request/API failure —
    callers should treat this as non-fatal and fall back to score=None.
    """
    api_key = os.getenv("SAPLING_API_KEY")
    if not api_key:
        raise RuntimeError("SAPLING_API_KEY is not set")

    response = httpx.post(
        SAPLING_API_URL,
        json={"key": api_key, "text": text},
        timeout=30.0,
    )
    response.raise_for_status()
    data = response.json()

    logger.info("Sapling AI-detection score: %.3f", data["score"])
    return {"score": data["score"]}
