import React from 'react'
import { AssetTypeTab } from './AssetTypeTab'
import { StudioAssetsService } from '../../../../services/generated'
import type { PropRead } from '../../../../services/generated'

export function PropsTab() {
  return (
    <AssetTypeTab
      label="道具"
      listAssets={async ({ q, page, pageSize }) => {
        const res = await StudioAssetsService.listPropsApiV1StudioAssetsPropsGet({ q: q ?? null, page, pageSize })
        return { items: (res.data?.items ?? []) as PropRead[], total: res.data?.pagination.total ?? 0 }
      }}
      createAsset={async (payload) => {
        const res = await StudioAssetsService.createPropApiV1StudioAssetsPropsPost({ requestBody: payload })
        if (!res.data) throw new Error('empty prop')
        return res.data as PropRead
      }}
      updateAsset={async (id, payload) => {
        const res = await StudioAssetsService.updatePropApiV1StudioAssetsPropsPropIdPatch({
          propId: id,
          requestBody: payload,
        })
        if (!res.data) throw new Error('empty prop')
        return res.data as PropRead
      }}
      deleteAsset={async (id) => {
        await StudioAssetsService.deletePropApiV1StudioAssetsPropsPropIdDelete({ propId: id })
      }}
      generateImage={async (assetId) => {
        const url = `https://picsum.photos/seed/prop_${assetId}_${Date.now()}/768/768`
        const res = await StudioAssetsService.createPropImageApiV1StudioAssetsPropsPropIdImagesPost({
          propId: assetId,
          requestBody: { url, is_primary: true },
        })
        if (!res.data) throw new Error('empty prop image')
        return res.data.url
      }}
    />
  )
}

