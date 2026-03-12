import React, { useEffect, useState } from 'react'
import { Card, Tabs } from 'antd'
import { useSearchParams } from 'react-router-dom'
import { ActorsTab } from './tabs/ActorsTab'
import { ScenesTab } from './tabs/ScenesTab'
import { PropsTab } from './tabs/PropsTab'
import { CostumesTab } from './tabs/CostumesTab'

const AssetManager: React.FC = () => {
  const TAB_PARAM = 'tab'
  const [searchParams, setSearchParams] = useSearchParams()
  const tabFromUrl = searchParams.get(TAB_PARAM)
  const isValidTab = (t: string | null) => t === 'actor' || t === 'scene' || t === 'prop' || t === 'costume'

  const [activeTab, setActiveTab] = useState<string>(() => (isValidTab(tabFromUrl) ? tabFromUrl : 'actor'))

  useEffect(() => {
    if (isValidTab(tabFromUrl)) {
      setActiveTab(tabFromUrl)
    } else if (tabFromUrl === null || tabFromUrl === '') {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set(TAB_PARAM, 'actor')
          return next
        },
        { replace: true },
      )
    }
  }, [tabFromUrl, setSearchParams])

  const setTabInUrl = (tab: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set(TAB_PARAM, tab)
        return next
      },
      { replace: true },
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={(k) => setTabInUrl(k)}
          items={[
            { key: 'actor', label: '演员', children: <ActorsTab /> },
            { key: 'scene', label: '场景', children: <ScenesTab /> },
            { key: 'prop', label: '道具', children: <PropsTab /> },
            { key: 'costume', label: '服装', children: <CostumesTab /> },
          ]}
        />
      </Card>
    </div>
  )
}

export default AssetManager
