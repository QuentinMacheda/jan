'use client'

import { useEffect, useState, useCallback, ChangeEvent } from 'react'

import { AppConfiguration } from '@janhq/core'

import { ScrollArea, Switch, Input } from '@janhq/joi'

import { useAtom, useAtomValue } from 'jotai'

import { toaster } from '@/containers/Toast'

import useModelStop from '@/hooks/useModelStop'
import { useSettings } from '@/hooks/useSettings'

import CopyOverInstructionItem from './components/CopyOverInstruction'

import DataMigration from './components/DataMigration'

import {
  experimentalFeatureEnabledAtom,
  ignoreSslAtom,
  proxyAtom,
  proxyEnabledAtom,
  vulkanEnabledAtom,
  quickAskEnabledAtom,
} from '@/helpers/atoms/AppConfig.atom'

import { activeModelsAtom } from '@/helpers/atoms/Model.atom'

const Advanced = () => {
  const [experimentalEnabled, setExperimentalEnabled] = useAtom(
    experimentalFeatureEnabledAtom
  )
  const [vulkanEnabled, setVulkanEnabled] = useAtom(vulkanEnabledAtom)
  const [proxyEnabled, setProxyEnabled] = useAtom(proxyEnabledAtom)
  const quickAskEnabled = useAtomValue(quickAskEnabledAtom)

  const [proxy, setProxy] = useAtom(proxyAtom)
  const [ignoreSSL, setIgnoreSSL] = useAtom(ignoreSslAtom)

  const [partialProxy, setPartialProxy] = useState<string>(proxy)
  // const [gpuEnabled, setGpuEnabled] = useState<boolean>(false)
  // const [gpuList, setGpuList] = useState<GPU[]>([])
  // const [gpusInUse, setGpusInUse] = useState<string[]>([])
  // const [dropdownOptions, setDropdownOptions] = useState<HTMLDivElement | null>(
  //   null
  // )

  // const [toggle, setToggle] = useState<HTMLDivElement | null>(null)

  const { readSettings, saveSettings } = useSettings()
  const activeModels = useAtomValue(activeModelsAtom)
  // const [open, setOpen] = useState(false)
  const stopModel = useModelStop()

  // const selectedGpu = gpuList
  //   .filter((x) => gpusInUse.includes(x.id))
  //   .map((y) => {
  //     return y['name']
  //   })

  const onProxyChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value || ''
      setPartialProxy(value)
      if (value.trim().startsWith('http')) {
        setProxy(value.trim())
      } else {
        setProxy('')
      }
    },
    [setPartialProxy, setProxy]
  )

  const updateQuickAskEnabled = async (
    e: boolean,
    relaunch: boolean = true
  ) => {
    const appConfiguration: AppConfiguration =
      await window.core?.api?.getAppConfigurations()
    appConfiguration.quick_ask = e
    await window.core?.api?.updateAppConfiguration(appConfiguration)
    if (relaunch) window.core?.api?.relaunch()
  }

  const updateVulkanEnabled = async (e: boolean, relaunch: boolean = true) => {
    toaster({
      title: 'Reload',
      description: 'Vulkan settings updated. Reload now to apply the changes.',
    })

    for (const model of activeModels) {
      await stopModel.mutateAsync(model.model)
    }

    setVulkanEnabled(e)
    await saveSettings({ vulkan: e, gpusInUse: [] })
    // Relaunch to apply settings
    if (relaunch) window.location.reload()
  }

  const updateExperimentalEnabled = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    setExperimentalEnabled(e.target.checked)
    if (e) return

    // It affects other settings, so we need to reset them
    const isRelaunch = quickAskEnabled || vulkanEnabled
    if (quickAskEnabled) await updateQuickAskEnabled(false, false)
    if (vulkanEnabled) await updateVulkanEnabled(false, false)
    if (isRelaunch) window.core?.api?.relaunch()
  }

  useEffect(() => {
    // const setUseGpuIfPossible = async () => {
    //   const settings = await readSettings()
    //   setGpuEnabled(settings.run_mode === 'gpu' && settings.gpus?.length > 0)
    //   setGpusInUse(settings.gpus_in_use || [])
    //   setVulkanEnabled(settings.vulkan || false)
    //   if (settings.gpus) {
    //     setGpuList(settings.gpus)
    //   }
    // }
    // setUseGpuIfPossible()
  }, [readSettings, setVulkanEnabled])

  // const clearLogs = async () => {
  //   // try {
  //   //   await fs.rm(`file://logs`)
  //   // } catch (err) {
  //   //   console.error('Error clearing logs: ', err)
  //   // }
  //   // toaster({
  //   //   title: 'Logs cleared',
  //   //   description: 'All logs have been cleared.',
  //   //   type: 'success',
  //   // })
  // }

  // const handleGPUChange = (gpuId: string) => {
  //   let updatedGpusInUse = [...gpusInUse]
  //   if (updatedGpusInUse.includes(gpuId)) {
  //     updatedGpusInUse = updatedGpusInUse.filter((id) => id !== gpuId)
  //     if (gpuEnabled && updatedGpusInUse.length === 0) {
  //       // Vulkan support only allow 1 active device at a time
  //       if (vulkanEnabled) {
  //         updatedGpusInUse = []
  //       }
  //       updatedGpusInUse.push(gpuId)
  //     }
  //   } else {
  //     // Vulkan support only allow 1 active device at a time
  //     if (vulkanEnabled) {
  //       updatedGpusInUse = []
  //     }
  //     updatedGpusInUse.push(gpuId)
  //   }
  //   setGpusInUse(updatedGpusInUse)
  //   saveSettings({ gpusInUse: updatedGpusInUse })
  // }

  // const gpuSelectionPlaceHolder =
  //   gpuList.length > 0 ? 'Select GPU' : "You don't have any compatible GPU"

  // useClickOutside(() => setOpen(false), null, [dropdownOptions, toggle])

  return (
    <ScrollArea className="h-full w-full px-4">
      <div className="block w-full py-4">
        {/* Experimental */}
        <div className="flex w-full flex-col items-start justify-between gap-4 border-b border-[hsla(var(--app-border))] py-4 first:pt-0 last:border-none sm:flex-row">
          <div className="flex-shrink-0 space-y-1">
            <div className="flex gap-x-2">
              <h6 className="font-semibold capitalize">Experimental Mode</h6>
            </div>
            <p className="font-medium leading-relaxed text-[hsla(var(--text-secondary))]">
              Enable new features that may be unstable.
            </p>
          </div>
          <Switch
            checked={experimentalEnabled}
            onChange={updateExperimentalEnabled}
          />
        </div>

        {/* CPU / GPU switching */}
        {/* {!isMac && ( */}
        {/*   <div className="flex w-full flex-col items-start justify-between border-b border-[hsla(var(--app-border))] py-4 first:pt-0 last:border-none"> */}
        {/*     <div className="flex w-full items-start justify-between"> */}
        {/*       <div className="space-y-1"> */}
        {/*         <div className="flex gap-x-2"> */}
        {/*           <h6 className="font-semibold capitalize">GPU Acceleration</h6> */}
        {/*         </div> */}
        {/*         <p className="pr-8 leading-relaxed"> */}
        {/*           Enable to enhance model performance by utilizing your GPU */}
        {/*           devices for acceleration. Read{' '} */}
        {/*           <span> */}
        {/*             {' '} */}
        {/*             <span */}
        {/*               className="cursor-pointer text-[var(--app-link)]" */}
        {/*               // onClick={() => */}
        {/*               //   openExternalUrl( */}
        {/*               //     'https://jan.ai/guides/troubleshooting/gpu-not-used/' */}
        {/*               //   ) */}
        {/*               // } */}
        {/*             > */}
        {/*               troubleshooting guide */}
        {/*             </span>{' '} */}
        {/*           </span>{' '} */}
        {/*           for further assistance. */}
        {/*         </p> */}
        {/*       </div> */}
        {/**/}
        {/*       <div className="flex items-center"> */}
        {/*         {gpuList.length > 0 && !gpuEnabled && ( */}
        {/*           <Tooltip */}
        {/*             trigger={ */}
        {/*               <AlertCircleIcon */}
        {/*                 size={16} */}
        {/*                 className="mr-2 text-[hsla(var(--warning-bg))]" */}
        {/*               /> */}
        {/*             } */}
        {/*             content="Disabling NVIDIA GPU Acceleration may result in reduced */}
        {/*             performance. It is recommended to keep this enabled for */}
        {/*             optimal user experience." */}
        {/*           /> */}
        {/*         )} */}
        {/*         <Tooltip */}
        {/*           trigger={ */}
        {/*             <Switch */}
        {/*               disabled={gpuList.length === 0 || vulkanEnabled} */}
        {/*               checked={gpuEnabled} */}
        {/*               onChange={(e) => { */}
        {/*                 if (e.target.checked === true) { */}
        {/*                   saveSettings({ runMode: 'gpu' }) */}
        {/*                   setGpuEnabled(true) */}
        {/*                   snackbar({ */}
        {/*                     description: */}
        {/*                       'Successfully turned on GPU Acceleration', */}
        {/*                     type: 'success', */}
        {/*                   }) */}
        {/*                 } else { */}
        {/*                   saveSettings({ runMode: 'cpu' }) */}
        {/*                   setGpuEnabled(false) */}
        {/*                   snackbar({ */}
        {/*                     description: */}
        {/*                       'Successfully turned off GPU Acceleration', */}
        {/*                     type: 'success', */}
        {/*                   }) */}
        {/*                 } */}
        {/*                 // Stop any running model to apply the changes */}
        {/*                 if (e.target.checked !== gpuEnabled) { */}
        {/*                   for (const activeModel of activeModels) { */}
        {/*                     stopModel(activeModel.model) */}
        {/*                   } */}
        {/*                 } */}
        {/*               }} */}
        {/*             /> */}
        {/*           } */}
        {/*           content="Your current device does not have a compatible GPU for */}
        {/*           monitoring. To enable GPU monitoring, please ensure your */}
        {/*           device has a supported Nvidia or AMD GPU with updated */}
        {/*           drivers." */}
        {/*           disabled={gpuList.length > 0} */}
        {/*         /> */}
        {/*       </div> */}
        {/*     </div> */}
        {/*     <div className="mt-2 flex w-full flex-col rounded-lg px-2 py-4"> */}
        {/*       <label className="mb-2 mr-2 inline-block font-medium"> */}
        {/*         Choose device(s) */}
        {/*       </label> */}
        {/*       <div className="relative flex w-full md:w-1/2" ref={setToggle}> */}
        {/*         <Input */}
        {/*           value={selectedGpu.join() || ''} */}
        {/*           className="w-full cursor-pointer" */}
        {/*           readOnly */}
        {/*           placeholder={gpuSelectionPlaceHolder} */}
        {/*           suffixIcon={ */}
        {/*             <ChevronDownIcon */}
        {/*               size={14} */}
        {/*               className={twMerge(open && 'rotate-180')} */}
        {/*             /> */}
        {/*           } */}
        {/*           onClick={() => setOpen(!open)} */}
        {/*         /> */}
        {/*         <div */}
        {/*           className={twMerge( */}
        {/*             'max-h-80 shadow-sm absolute right-0 z-20 mt-10 w-full overflow-hidden rounded-lg border border-[hsla(var(--app-border))] bg-[hsla(var(--app-bg))]', */}
        {/*             open ? 'flex' : 'hidden' */}
        {/*           )} */}
        {/*           ref={setDropdownOptions} */}
        {/*         > */}
        {/*           <div className="w-full p-4"> */}
        {/*             <p>{vulkanEnabled ? 'Vulkan Supported GPUs' : 'Nvidia'}</p> */}
        {/*             <div className="py-2"> */}
        {/*               <div className="rounded-lg"> */}
        {/*                 {gpuList */}
        {/*                   .filter((gpu) => */}
        {/*                     vulkanEnabled */}
        {/*                       ? gpu.name */}
        {/*                       : gpu.name?.toLowerCase().includes('nvidia') */}
        {/*                   ) */}
        {/*                   .map((gpu) => ( */}
        {/*                     <div */}
        {/*                       key={gpu.id} */}
        {/*                       className="mt-2 flex items-center space-x-2" */}
        {/*                     > */}
        {/*                       <Checkbox */}
        {/*                         id={`gpu-${gpu.id}`} */}
        {/*                         name="gpu-nvidia" */}
        {/*                         value={gpu.id} */}
        {/*                         checked={gpusInUse.includes(gpu.id)} */}
        {/*                         onChange={() => handleGPUChange(gpu.id)} */}
        {/*                         label={ */}
        {/*                           <span> */}
        {/*                             <span>{gpu.name}</span> */}
        {/*                             {!vulkanEnabled && ( */}
        {/*                               <span>{gpu.vram}MB VRAM</span> */}
        {/*                             )} */}
        {/*                           </span> */}
        {/*                         } */}
        {/*                       /> */}
        {/*                     </div> */}
        {/*                   ))} */}
        {/*               </div> */}
        {/*               {gpuEnabled && gpusInUse.length > 1 && ( */}
        {/*                 <div className="mt-2 flex items-start space-x-2 text-[hsla(var(--warning-bg))]"> */}
        {/*                   <AlertTriangleIcon */}
        {/*                     size={16} */}
        {/*                     className="flex-shrink-0" */}
        {/*                   /> */}
        {/*                   <p className="text-xs leading-relaxed"> */}
        {/*                     If multi-GPU is enabled with different GPU models or */}
        {/*                     without NVLink, it could impact token speed. */}
        {/*                   </p> */}
        {/*                 </div> */}
        {/*               )} */}
        {/*             </div> */}
        {/*           </div> */}
        {/*         </div> */}
        {/*       </div> */}
        {/*     </div> */}
        {/*   </div> */}
        {/* )} */}

        {/* Vulkan for AMD GPU/ APU and Intel Arc GPU */}
        {/* {!isMac && experimentalEnabled && ( */}
        {/*   <div className="flex w-full flex-col items-start justify-between gap-4 border-b border-[hsla(var(--app-border))] py-4 first:pt-0 last:border-none sm:flex-row"> */}
        {/*     <div className="flex-shrink-0 space-y-1"> */}
        {/*       <div className="flex gap-x-2"> */}
        {/*         <h6 className="font-semibold capitalize">Vulkan Support</h6> */}
        {/*       </div> */}
        {/*       <p className="font-medium leading-relaxed text-[hsla(var(--text-secondary))]"> */}
        {/*         Enable Vulkan with AMD GPU/APU and Intel Arc GPU for better */}
        {/*         model performance (reload needed). */}
        {/*       </p> */}
        {/*     </div> */}
        {/**/}
        {/*     <Switch */}
        {/*       checked={vulkanEnabled} */}
        {/*       onChange={(e) => updateVulkanEnabled(e.target.checked)} */}
        {/*     /> */}
        {/*   </div> */}
        {/* )} */}

        {/* <DataFolder /> */}

        {/* Proxy */}
        <div className="flex w-full flex-col items-start justify-between gap-4 border-b border-[hsla(var(--app-border))] py-4 first:pt-0 last:border-none sm:flex-row">
          <div className="w-full space-y-1">
            <div className="flex w-full justify-between gap-x-2">
              <h6 className="font-semibold capitalize">HTTPS Proxy</h6>
            </div>
            <p className="font-medium leading-relaxed text-[hsla(var(--text-secondary))]">
              Specify the HTTPS proxy or leave blank (proxy auto-configuration
              and SOCKS not supported).
            </p>
          </div>

          <div className="flex w-full flex-shrink-0 flex-col items-end gap-2 sm:w-1/2">
            <Switch
              checked={proxyEnabled}
              onChange={() => setProxyEnabled(!proxyEnabled)}
            />
            <div className="w-full">
              <Input
                placeholder={'http://<user>:<password>@<domain or IP>:<port>'}
                value={partialProxy}
                onChange={onProxyChange}
              />
            </div>
          </div>
        </div>

        {/* Ignore SSL certificates */}
        <div className="flex w-full flex-col items-start justify-between gap-4 border-b border-[hsla(var(--app-border))] py-4 first:pt-0 last:border-none sm:flex-row">
          <div className="flex-shrink-0 space-y-1">
            <div className="flex gap-x-2">
              <h6 className="font-semibold capitalize">
                Ignore SSL certificates
              </h6>
            </div>
            <p className="font-medium leading-relaxed text-[hsla(var(--text-secondary))]">
              Allow self-signed or unverified certificates - may be required for
              certain proxies.
            </p>
          </div>
          <Switch
            checked={ignoreSSL}
            onChange={(e) => setIgnoreSSL(e.target.checked)}
          />
        </div>

        {/* {experimentalEnabled && (
          <div className="flex w-full flex-col items-start justify-between gap-4 border-b border-[hsla(var(--app-border))] py-4 first:pt-0 last:border-none sm:flex-row">
            <div className="flex-shrink-0 space-y-1">
              <div className="flex gap-x-2">
                <h6 className="font-semibold capitalize">Jan Quick Ask</h6>
              </div>
              <p className="font-medium leading-relaxed text-[hsla(var(--text-secondary))]">
                Enable Quick Ask to be triggered via the default hotkey{' '}
                <span className="text-[hsla(var(--text-secondary)] bg-secondary inline-flex items-center justify-center rounded-full px-1 py-0.5 text-xs font-bold">
                  <span className="font-bold">{isMac ? '⌘' : 'Ctrl'} + J</span>
                </span>{' '}
                (reload needed).
              </p>
            </div>
            <Switch
              checked={quickAskEnabled}
              onChange={() => {
                toaster({
                  title: 'Reload',
                  description:
                    'Quick Ask settings updated. Reload now to apply the changes.',
                })
                updateQuickAskEnabled(!quickAskEnabled)
              }}
            />
          </div>
        )} */}

        {/* Clear log */}
        {/* <div className="flex w-full flex-col items-start justify-between gap-4 border-b border-[hsla(var(--app-border))] py-4 first:pt-0 last:border-none sm:flex-row">
          <div className="flex-shrink-0 space-y-1">
            <div className="flex gap-x-2">
              <h6 className="font-semibold capitalize">Clear logs</h6>
            </div>
            <p className="font-medium leading-relaxed text-[hsla(var(--text-secondary))]">
              Clear all logs from Jan app.
            </p>
          </div>
          <Button theme="destructive" onClick={clearLogs}>
            Clear
          </Button>
        </div> */}

        {/* Factory Reset */}
        {/* <FactoryReset /> */}
        {experimentalEnabled && <CopyOverInstructionItem />}
        {experimentalEnabled && <DataMigration />}
      </div>
    </ScrollArea>
  )
}

export default Advanced
