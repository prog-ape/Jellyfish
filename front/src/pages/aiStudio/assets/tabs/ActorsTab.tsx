import React from 'react'
import { AssetTypeTab } from './AssetTypeTab'
import { StudioAssetsService } from '../../../../services/generated'
import type { ActorImageRead } from '../../../../services/generated'

export function ActorsTab() {
  return (
    <AssetTypeTab
      label="演员"
      listAssets={async ({ q, page, pageSize }) => {
        const res = await StudioAssetsService.listActorImagesApiV1StudioAssetsActorImagesGet({
          q: q ?? null,
          page,
          pageSize,
        })
        return { items: (res.data?.items ?? []) as ActorImageRead[], total: res.data?.pagination.total ?? 0 }
      }}
      createAsset={async (payload) => {
        const res = await StudioAssetsService.createActorImageApiV1StudioAssetsActorImagesPost({ requestBody: payload })
        if (!res.data) throw new Error('empty actor image')
        return res.data as ActorImageRead
      }}
      updateAsset={async (id, payload) => {
        const res = await StudioAssetsService.updateActorImageApiV1StudioAssetsActorImagesActorImageIdPatch({
          actorImageId: id,
          requestBody: payload,
        })
        if (!res.data) throw new Error('empty actor image')
        return res.data as ActorImageRead
      }}
      deleteAsset={async (id) => {
        await StudioAssetsService.deleteActorImageApiV1StudioAssetsActorImagesActorImageIdDelete({ actorImageId: id })
      }}
      generateImage={async (assetId) => {
        const url = `https://picsum.photos/seed/actor_${assetId}_${Date.now()}/768/768`
        const res = await StudioAssetsService.createActorImageImageApiV1StudioAssetsActorImagesActorImageIdImagesPost({
          actorImageId: assetId,
          requestBody: { url, is_primary: true },
        })
        if (!res.data) throw new Error('empty actor image image')
        return res.data.url
      }}
    />
  )
}

