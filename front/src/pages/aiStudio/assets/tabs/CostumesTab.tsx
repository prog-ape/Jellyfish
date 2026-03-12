import React from 'react'
import { AssetTypeTab } from './AssetTypeTab'
import { StudioAssetsService } from '../../../../services/generated'
import type { CostumeRead } from '../../../../services/generated'

export function CostumesTab() {
  return (
    <AssetTypeTab
      label="服装"
      listAssets={async ({ q, page, pageSize }) => {
        const res = await StudioAssetsService.listCostumesApiV1StudioAssetsCostumesGet({ q: q ?? null, page, pageSize })
        return { items: (res.data?.items ?? []) as CostumeRead[], total: res.data?.pagination.total ?? 0 }
      }}
      createAsset={async (payload) => {
        const res = await StudioAssetsService.createCostumeApiV1StudioAssetsCostumesPost({ requestBody: payload })
        if (!res.data) throw new Error('empty costume')
        return res.data as CostumeRead
      }}
      updateAsset={async (id, payload) => {
        const res = await StudioAssetsService.updateCostumeApiV1StudioAssetsCostumesCostumeIdPatch({
          costumeId: id,
          requestBody: payload,
        })
        if (!res.data) throw new Error('empty costume')
        return res.data as CostumeRead
      }}
      deleteAsset={async (id) => {
        await StudioAssetsService.deleteCostumeApiV1StudioAssetsCostumesCostumeIdDelete({ costumeId: id })
      }}
      generateImage={async (assetId) => {
        const url = `https://picsum.photos/seed/costume_${assetId}_${Date.now()}/768/768`
        const res = await StudioAssetsService.createCostumeImageApiV1StudioAssetsCostumesCostumeIdImagesPost({
          costumeId: assetId,
          requestBody: { url, is_primary: true },
        })
        if (!res.data) throw new Error('empty costume image')
        return res.data.url
      }}
    />
  )
}

