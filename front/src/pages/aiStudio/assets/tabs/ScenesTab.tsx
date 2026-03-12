import React from 'react'
import { AssetTypeTab } from './AssetTypeTab'
import { StudioAssetsService } from '../../../../services/generated'
import type { SceneRead } from '../../../../services/generated'

export function ScenesTab() {
  return (
    <AssetTypeTab
      label="场景"
      listAssets={async ({ q, page, pageSize }) => {
        const res = await StudioAssetsService.listScenesApiV1StudioAssetsScenesGet({ q: q ?? null, page, pageSize })
        return { items: (res.data?.items ?? []) as SceneRead[], total: res.data?.pagination.total ?? 0 }
      }}
      createAsset={async (payload) => {
        const res = await StudioAssetsService.createSceneApiV1StudioAssetsScenesPost({ requestBody: payload })
        if (!res.data) throw new Error('empty scene')
        return res.data as SceneRead
      }}
      updateAsset={async (id, payload) => {
        const res = await StudioAssetsService.updateSceneApiV1StudioAssetsScenesSceneIdPatch({
          sceneId: id,
          requestBody: payload,
        })
        if (!res.data) throw new Error('empty scene')
        return res.data as SceneRead
      }}
      deleteAsset={async (id) => {
        await StudioAssetsService.deleteSceneApiV1StudioAssetsScenesSceneIdDelete({ sceneId: id })
      }}
      generateImage={async (assetId) => {
        const url = `https://picsum.photos/seed/scene_${assetId}_${Date.now()}/768/768`
        const res = await StudioAssetsService.createSceneImageApiV1StudioAssetsScenesSceneIdImagesPost({
          sceneId: assetId,
          requestBody: { url, is_primary: true },
        })
        if (!res.data) throw new Error('empty scene image')
        return res.data.url
      }}
    />
  )
}

