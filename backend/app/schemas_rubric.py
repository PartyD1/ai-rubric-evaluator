"""Pydantic schema for rubric JSON — validated at every ingestion point
(file seeding, CLI script, and the /api/rubrics endpoint) so malformed
rubrics are rejected before they ever reach the scoring prompt."""

import re

from pydantic import BaseModel, ConfigDict, Field, PositiveInt, field_validator, model_validator

_TIER_KEY_RE = re.compile(r"^\d+(-\d+)?$")

APPEARANCE_SECTION_NAME = "appearance and word usage"


def _validate_outline_node(value: object, path: str) -> None:
    """Outline items nest arbitrarily deep (e.g. "III. Planning" -> "C. Schedule"
    -> "i. Milestone" -> description string). Pydantic 2.9 can't generate a schema
    for a recursive type alias here, so this walks the structure by hand — every
    leaf must be a string, every branch a dict keyed by string."""
    if isinstance(value, str):
        return
    if isinstance(value, dict):
        for k, v in value.items():
            if not isinstance(k, str):
                raise ValueError(f"{path}: outline keys must be strings, got {k!r}")
            _validate_outline_node(v, f"{path}.{k}")
        return
    raise ValueError(f"{path}: outline values must be a string or a nested object, got {type(value).__name__}")


class RubricSection(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1)
    max_points: PositiveInt
    description: str
    scoring_guide: dict[str, str] = Field(default_factory=dict)

    @field_validator("scoring_guide")
    @classmethod
    def _tiers_are_point_ranges(cls, v: dict[str, str]) -> dict[str, str]:
        for tier in v:
            if not _TIER_KEY_RE.match(tier):
                raise ValueError(
                    f"scoring_guide key {tier!r} must be a point value or range, e.g. '4' or '7-8'"
                )
        return v


class RubricSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")

    event: str = Field(min_length=1)
    total_points: PositiveInt
    required_outline: dict[str, object] | None = None
    sections: list[RubricSection] = Field(min_length=1)

    @field_validator("required_outline")
    @classmethod
    def _validate_outline(cls, v: dict[str, object] | None) -> dict[str, object] | None:
        if v is not None:
            _validate_outline_node(v, "required_outline")
        return v

    @model_validator(mode="after")
    def _sections_sum_to_total(self) -> "RubricSchema":
        section_sum = sum(s.max_points for s in self.sections)
        if section_sum != self.total_points:
            raise ValueError(
                f"section max_points sum to {section_sum}, but total_points is {self.total_points}"
            )
        return self
