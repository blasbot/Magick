import { Switch } from '@magickml/client-core'
import { API_ROOT_URL, FILE_SERVER_URL } from '@magickml/core'
import axios from 'axios'
import { debounce } from 'lodash'
import { useSnackbar } from 'notistack'
import { FC, useEffect, useState } from 'react'
import VariableModal from './VariableModal'

type PluginProps = {
  selectedAgentData: any
  props
}

export const DiscordAgentWindow: FC<any> = props => {
  props = props.props
  const { selectedAgentData, update, setSelectedAgentData } = props
  const debouncedFunction = debounce((id, data) => update(id, data), 500)
  const [editMode, setEditMode] = useState<boolean>(false)
  const [checked, setChecked] = useState(
    selectedAgentData.data?.discord_enabled || false
  )
  const [disable, setDisable] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const [playingAudio, setPlayingAudio] = useState(false)

  const handleClose = () => {
    setEditMode(false)
  }
  useEffect(() => {
    if (props.enable['DiscordPlugin'] == false) {
      setChecked(false)
      setDisable(true)
    }
    if (props.enable['DiscordPlugin'] == true) {
      setChecked(selectedAgentData?.data?.discord_enabled)
      setDisable(false)
    }
  }, [props.enable, selectedAgentData])
  const testVoice = async () => {
    if (
      (selectedAgentData.data?.voice_provider &&
        selectedAgentData.data?.voice_character) ||
      playingAudio
    ) {
      if (
        selectedAgentData.data?.voice_provider === 'tiktalknet' &&
        selectedAgentData.data?.tiktalknet_url?.length <= 0
      ) {
        return
      }

      const resp = await axios.get(`${API_ROOT_URL}/text_to_speech`, {
        params: {
          text: 'Hello there! This section has not been written yet.',
          voice_provider: selectedAgentData.data?.voice_provider,
          voice_character: selectedAgentData.data?.voice_character,
          voice_language_code: selectedAgentData.data?.voice_language_code,
          tiktalknet_url: selectedAgentData.data?.tiktalknet_url,
        },
      })

      const url =
        selectedAgentData.data?.voice_provider === 'google' ||
        selectedAgentData.data?.voice_provider === 'tiktalknet'
          ? FILE_SERVER_URL + '/' + resp.data
          : resp.data
      if (url && url.length > 0) {
        setPlayingAudio(true)
        console.log('url:', url)
        const audio = new Audio(url)
        audio.onended = function () {
          setPlayingAudio(false)
        }
        audio.play()
      }
    } else {
      enqueueSnackbar(
        'You need to setup the voice variables to test the voice or already playing another test',
        {
          variant: 'error',
        }
      )
    }
  }

  return (
    <>
      <div
        style={{
          backgroundColor: '#222',
          padding: '2em',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: disable ? 'none' : 'auto',
          opacity: disable ? 0.2 : 1,
        }}
      >
        <h3>Discord</h3>
        <div
          style={{
            display: 'flex',
            paddingTop: '1em',
          }}
        >
          <button
            onClick={() => {
              setEditMode(true)
            }}
            style={{ marginRight: '10px', cursor: 'pointer' }}
          >
            Edit
          </button>
          <Switch
            label={null}
            checked={checked}
            onChange={e => {
              setChecked(!checked)
              debouncedFunction(selectedAgentData.id, {
                ...selectedAgentData,
                data: {
                  ...selectedAgentData.data,
                  discord_enabled: e.target.checked,
                },
              })
              setSelectedAgentData({
                ...selectedAgentData,
                data: {
                  ...selectedAgentData.data,
                  discord_enabled: e.target.checked,
                },
              })
            }}
            style={{ float: 'right' }}
          />
        </div>
      </div>
      {editMode && (
        <VariableModal
          selectedAgentData={selectedAgentData}
          testVoice={testVoice}
          editMode={editMode}
          setEditMode={handleClose}
          update={update}
        />
      )}
    </>
  )
}
