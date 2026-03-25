from __future__ import annotations

from typing import Any

from sqlalchemy import JSON, ForeignKey, Index, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base
from app.models.base import TimestampMixin
from app.models.types import ImportDraftType


class ImportCharacterDraft(Base, TimestampMixin):
    """import-from-extraction 提取的角色草稿（以 project_id + name 去重）。"""

    __tablename__ = "import_character_drafts"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, comment="草稿 ID（UUID）")
    project_id: Mapped[str] = mapped_column(
        String(64),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="项目 ID",
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True, comment="草稿名称")
    description: Mapped[str] = mapped_column(Text, nullable=False, default="", comment="提取到的角色描述")

    tags: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list, comment="提取标签（JSON）")
    raw_extra: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict, comment="提取扩展信息（JSON）")

    __table_args__ = (
        UniqueConstraint("project_id", "name", name="uq_import_character_drafts_project_name"),
    )


class ImportSceneDraft(Base, TimestampMixin):
    """import-from-extraction 提取的场景草稿（以 project_id + name 去重）。"""

    __tablename__ = "import_scene_drafts"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, comment="草稿 ID（UUID）")
    project_id: Mapped[str] = mapped_column(
        String(64),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="项目 ID",
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True, comment="草稿名称")
    description: Mapped[str] = mapped_column(Text, nullable=False, default="", comment="提取到的场景描述")

    tags: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list, comment="提取标签（JSON）")
    raw_extra: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict, comment="提取扩展信息（JSON）")

    __table_args__ = (
        UniqueConstraint("project_id", "name", name="uq_import_scene_drafts_project_name"),
    )


class ImportPropDraft(Base, TimestampMixin):
    """import-from-extraction 提取的道具草稿（以 project_id + name 去重）。"""

    __tablename__ = "import_prop_drafts"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, comment="草稿 ID（UUID）")
    project_id: Mapped[str] = mapped_column(
        String(64),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="项目 ID",
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True, comment="草稿名称")
    description: Mapped[str] = mapped_column(Text, nullable=False, default="", comment="提取到的道具描述")

    tags: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list, comment="提取标签（JSON）")
    raw_extra: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict, comment="提取扩展信息（JSON）")

    __table_args__ = (
        UniqueConstraint("project_id", "name", name="uq_import_prop_drafts_project_name"),
    )


class ImportCostumeDraft(Base, TimestampMixin):
    """import-from-extraction 提取的服装草稿（以 project_id + name 去重）。"""

    __tablename__ = "import_costume_drafts"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, comment="草稿 ID（UUID）")
    project_id: Mapped[str] = mapped_column(
        String(64),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="项目 ID",
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True, comment="草稿名称")
    description: Mapped[str] = mapped_column(Text, nullable=False, default="", comment="提取到的服装描述")

    tags: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list, comment="提取标签（JSON）")
    raw_extra: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict, comment="提取扩展信息（JSON）")

    __table_args__ = (
        UniqueConstraint("project_id", "name", name="uq_import_costume_drafts_project_name"),
    )


class ImportDraftShotOccurrence(Base, TimestampMixin):
    """import 草稿在某个 chapter/shot 中的出现位置（用于拍摄准备页筛选）。"""

    __tablename__ = "import_draft_shot_occurrences"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, comment="occurrence ID（UUID）")

    project_id: Mapped[str] = mapped_column(
        String(64),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="项目 ID",
    )
    chapter_id: Mapped[str] = mapped_column(
        String(64),
        ForeignKey("chapters.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="章节 ID",
    )
    shot_id: Mapped[str] = mapped_column(
        String(64),
        ForeignKey("shots.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="分镜（shot）ID",
    )

    draft_type: Mapped[ImportDraftType] = mapped_column(
        String(32), nullable=False, index=True, comment="草稿类型"
    )
    draft_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True, comment="草稿主表 ID")

    __table_args__ = (
        UniqueConstraint(
            "project_id",
            "draft_type",
            "draft_id",
            "chapter_id",
            "shot_id",
            name="uq_import_draft_shot_occurrences_scope",
        ),
        Index("ix_import_draft_shot_occurrences_proj_chapter_shot", "project_id", "chapter_id", "shot_id"),
    )


__all__ = [
    "ImportCharacterDraft",
    "ImportSceneDraft",
    "ImportPropDraft",
    "ImportCostumeDraft",
    "ImportDraftShotOccurrence",
]

