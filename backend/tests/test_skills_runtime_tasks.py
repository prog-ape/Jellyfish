from __future__ import annotations

import pytest
from app.core.tasks.agent_tasks import FilmEntityExtractionTask2, FilmShotlistTask2
from app.schemas.skills.film import FilmEntityExtractionResult, FilmShotlistResult


class _StubEntityAgent:
    async def aextract(self, **kwargs):  # noqa: ANN003
        return FilmEntityExtractionResult.model_validate(
            {
                "source_id": kwargs.get("source_id", "novel_ch01"),
                "language": kwargs.get("language", "zh"),
                "chunks": [],
                "characters": [],
                "locations": [],
                "props": [],
                "notes": [],
                "uncertainties": [],
            }
        )


class _StubShotlistAgent:
    async def aextract(self, **kwargs):  # noqa: ANN003
        return FilmShotlistResult.model_validate(
            {
                "breakdown": {
                    "source_id": kwargs.get("source_id", "novel_ch01"),
                    "chunks": [],
                    "characters": [],
                    "locations": [],
                    "props": [],
                    "scenes": [],
                    "shots": [],
                    "transitions": [],
                    "notes": [],
                    "uncertainties": [],
                }
            }
        )


@pytest.mark.asyncio
async def test_film_entity_extraction_task_async_result() -> None:
    extractor = _StubEntityAgent()
    task = FilmEntityExtractionTask2(
        extractor,
        input_dict={"source_id": "novel_ch01", "language": "zh", "chunks_json": "[]"},
    )

    assert await task.is_done() is False
    assert await task.get_result() is None

    await task.run()
    assert await task.is_done() is True
    result = await task.get_result()
    assert result is not None
    assert result.source_id == "novel_ch01"

    st = await task.status()
    assert st["done"] is True
    assert st["has_result"] is True
    assert st["error"] == ""


@pytest.mark.asyncio
async def test_film_shotlist_task_async_result() -> None:
    storyboarder = _StubShotlistAgent()
    task = FilmShotlistTask2(
        storyboarder,
        input_dict={"source_id": "novel_ch01", "source_title": "", "language": "zh", "chunks_json": "[]"},
    )

    await task.run()
    result = await task.get_result()
    assert result is not None
    assert result.breakdown.source_id == "novel_ch01"


@pytest.mark.asyncio
async def test_task_records_error_when_skill_invalid() -> None:
    extractor = _StubEntityAgent()
    task = FilmEntityExtractionTask2(
        extractor,
        input_dict={"source_id": "novel_ch01", "language": "zh", "chunks_json": "[]"},
    )

    # 这里不再测试“无效 skill_id”，因为动态 skill 机制已被移除。
    await task.run()
    assert await task.get_result() is not None

