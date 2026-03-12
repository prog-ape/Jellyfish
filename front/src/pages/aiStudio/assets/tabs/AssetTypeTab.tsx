import React, { useEffect, useMemo, useState } from 'react'
import { Card, Input, Row, Col, Tag, Button, message, Modal, Space, Pagination } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import type { AssetCreate, AssetUpdate } from '../../../../services/generated'

function normalizeTags(input: string): string[] {
  return input
    .split(/[,，\n]/g)
    .map((t) => t.trim())
    .filter(Boolean)
}

export type StudioAssetLike = {
  id: string
  name: string
  description?: string
  thumbnail?: string
  tags?: string[]
}

export function AssetTypeTab({
  label,
  listAssets,
  createAsset,
  updateAsset,
  deleteAsset,
  generateImage,
}: {
  label: string
  listAssets: (params: { q?: string; page: number; pageSize: number }) => Promise<{ items: StudioAssetLike[]; total: number }>
  createAsset: (payload: AssetCreate) => Promise<StudioAssetLike>
  updateAsset: (id: string, payload: AssetUpdate) => Promise<StudioAssetLike>
  deleteAsset: (id: string) => Promise<void>
  generateImage: (assetId: string) => Promise<string>
}) {
  const [assets, setAssets] = useState<StudioAssetLike[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  const [total, setTotal] = useState(0)

  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState<Asset | null>(null)
  const [formName, setFormName] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formTags, setFormTags] = useState('')

  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const [previewTitle, setPreviewTitle] = useState('')

  const load = async (opts?: { page?: number; pageSize?: number; q?: string }) => {
    setLoading(true)
    try {
      const nextPage = opts?.page ?? page
      const nextPageSize = opts?.pageSize ?? pageSize
      const nextQ = typeof opts?.q === 'string' ? opts.q : search.trim() || undefined
      const res = await listAssets({ q: nextQ, page: nextPage, pageSize: nextPageSize })
      setAssets(Array.isArray(res.items) ? res.items : [])
      setTotal(typeof res.total === 'number' ? res.total : 0)
    } catch {
      message.error('加载资产失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize])

  const filtered = useMemo(() => {
    return Array.isArray(assets) ? assets : []
  }, [assets])

  const openCreate = () => {
    setEditing(null)
    setFormName('')
    setFormDesc('')
    setFormTags('')
    setEditOpen(true)
  }

  const openEdit = (asset: StudioAssetLike) => {
    setEditing(asset)
    setFormName(asset.name)
    setFormDesc(asset.description ?? '')
    setFormTags((asset.tags ?? []).join(', '))
    setEditOpen(true)
  }

  const handleSave = async () => {
    if (!formName.trim()) {
      message.warning('请输入资产名称')
      return
    }

    try {
      if (editing) {
        const next = await updateAsset(editing.id, {
          name: formName.trim(),
          description: formDesc.trim(),
          tags: normalizeTags(formTags),
        })
        setAssets((prev) => prev.map((a) => (a.id === editing.id ? next : a)))
        message.success('已保存')
      } else {
        const next = await createAsset({
          id: `asset_${Date.now()}`,
          name: formName.trim(),
          description: formDesc.trim(),
          tags: normalizeTags(formTags),
          thumbnail: '',
        })
        message.success('已创建')
        // 创建后回到第一页刷新，保证立刻可见（服务端可能按时间倒序）
        setPage(1)
        await load({ page: 1 })
      }
      setEditOpen(false)
      setEditing(null)
      if (editing) {
        await load()
      }
    } catch {
      message.error('保存失败')
    }
  }

  const handleDelete = (asset: StudioAssetLike) => {
    Modal.confirm({
      title: `删除${label}资产？`,
      content: `将删除「${asset.name}」。`,
      okText: '删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteAsset(asset.id)
          message.success('已删除')
          await load()
        } catch {
          message.error('删除失败')
        }
      },
    })
  }

  const handleGenerate = async (asset: StudioAssetLike) => {
    try {
      const url = await generateImage(asset.id)
      const next = await updateAsset(asset.id, { thumbnail: url })
      setAssets((prev) => prev.map((a) => (a.id === asset.id ? next : a)))
      message.success('已生成（Mock）')
    } catch {
      message.error('生成失败')
    }
  }

  const openPreview = (asset: StudioAssetLike) => {
    if (!asset.thumbnail) {
      message.info('未生成图片')
      return
    }
    setPreviewTitle(asset.name)
    setPreviewUrl(asset.thumbnail)
    setPreviewOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input.Search
          placeholder={`搜索${label}名称、描述或标签`}
          allowClear
          className="max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={() => {
            setPage(1)
            void load()
          }}
        />
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => void load()} loading={loading}>
            刷新
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建{label}
          </Button>
        </Space>
      </div>

      <Card loading={loading}>
        <Row gutter={[16, 16]}>
          {filtered.length === 0 ? (
            <Col span={24}>
              <div className="text-center text-gray-500 py-8">{search ? '无匹配资产' : '暂无该类资产'}</div>
            </Col>
          ) : (
            filtered.map((a) => (
              <Col xs={24} sm={12} md={8} lg={6} key={a.id}>
                <Card
                  hoverable
                  size="small"
                  title={<span className="truncate">{a.name}</span>}
                  extra={
                    <Space size="small">
                      <Button size="small" onClick={() => handleGenerate(a)}>
                        生成
                      </Button>
                      <Button size="small" type="link" icon={<EditOutlined />} onClick={() => openEdit(a)}>
                        编辑
                      </Button>
                    </Space>
                  }
                  actions={[
                    <Button
                      type="text"
                      key="del"
                      danger
                      icon={<DeleteOutlined />}
                      size="small"
                      onClick={() => handleDelete(a)}
                    />,
                  ]}
                >
                  <div className="text-xs text-gray-500 mb-2 line-clamp-2">{a.description || '暂无描述'}</div>
                  <div
                    className="h-32 rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-500 text-sm overflow-hidden cursor-pointer"
                    onClick={() => openPreview(a)}
                  >
                    {a.thumbnail ? (
                      <img src={a.thumbnail} alt={a.name} className="w-full h-full object-cover" />
                    ) : (
                      '未生成'
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(a.tags ?? []).slice(0, 3).map((t) => (
                      <Tag key={t}>{t}</Tag>
                    ))}
                  </div>
                </Card>
              </Col>
            ))
          )}
        </Row>

        <div className="flex justify-end pt-4">
          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
            showSizeChanger
            pageSizeOptions={[8, 12, 24, 48]}
            showTotal={(t) => `共 ${t} 条`}
            onChange={(p, ps) => {
              setPage(p)
              setPageSize(ps)
            }}
          />
        </div>
      </Card>

      <Modal
        title={editing ? `编辑${label}` : `新建${label}`}
        open={editOpen}
        onCancel={() => {
          setEditOpen(false)
          setEditing(null)
        }}
        onOk={handleSave}
        okText="保存"
        width={560}
      >
        <div className="space-y-3">
          <div>
            <span className="text-gray-600 text-sm">名称</span>
            <Input value={formName} onChange={(e) => setFormName(e.target.value)} className="mt-1" />
          </div>
          <div>
            <span className="text-gray-600 text-sm">描述</span>
            <Input.TextArea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} rows={4} className="mt-1" />
          </div>
          <div>
            <span className="text-gray-600 text-sm">标签（逗号分隔）</span>
            <Input value={formTags} onChange={(e) => setFormTags(e.target.value)} className="mt-1" />
          </div>
        </div>
      </Modal>

      <Modal
        title={previewTitle}
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        footer={null}
        width={880}
      >
        <div className="w-full flex justify-center bg-gray-50 rounded-md overflow-hidden">
          {/* 预览不做 image 组件依赖，直接 img */}
          <img src={previewUrl} alt={previewTitle} className="max-h-[70vh] object-contain" />
        </div>
      </Modal>
    </div>
  )
}

