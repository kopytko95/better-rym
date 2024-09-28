import { h, VNode } from 'preact'
import { useEffect, useState } from 'preact/hooks'

import { ReleaseOptions } from '../../modules/release-submission/utils/types'
import { Service } from '../services/types'
import styles from '../styles/status-form.module.css'
import { fold, isFailed, OneShot } from '../utils/one-shot'
import { pipe } from '../utils/pipe'
import { Complete } from './complete'
import { Failed } from './failed'
import { Loader } from './loader'
import {
  CAPITALIZATION_TYPES,
  CapitalizationType,
} from '~/modules/release-submission/utils/capitalization'
import { getMatchingService } from '../services'
import { ServiceSelector } from './service-selector'

export function StatusForm<E extends Error, T, S extends Service>({
  data,
  services,
  onSubmit,
  submitText = 'Submit',
  showAutoCapitalize = false,
}: Properties<E, T, S>): VNode {
  useEffect(() => {
    if (isFailed(data)) {
      console.error(data.error)
    }
  }, [data])

  return (
    <div className={styles.container}>
      <Form
        services={services}
        submitText={submitText}
        onSubmit={(url, service, options) =>
          void onSubmit(url, service, options)
        }
        showAutoCapitalize={showAutoCapitalize}
      />
      {pipe(
        data,
        fold(
          () => null,
          () => <Loader />,
          (error) => <Failed error={error} />,
          () => <Complete />,
        ),
      )}
    </div>
  )
}

type Properties<E extends Error, T, S extends Service> = {
  data: OneShot<E, T>
  services: S[]
  onSubmit: (
    url: string,
    service: S,
    options: ReleaseOptions,
  ) => void | Promise<void>
  submitText?: string
  showAutoCapitalize?: boolean
}

function Form<S extends Service>({
  services,
  submitText,
  onSubmit,
  showAutoCapitalize = false,
}: FormProperties<S>): VNode {
  const _fillers: { [x: string]: boolean } = {}
  Object.keys(FIELDS_MAP).map((field) => (_fillers[field] = true))

  const [fillers, setFillers] = useState(_fillers)
  const [url, setUrl] = useState('')
  const [selectedService, setSelectedService] = useState<S | undefined>(
    undefined,
  )
  const [showMissingServiceError, setShowMissingServiceError] = useState(false)
  const [capitalization, setCapitalization] =
    useState<CapitalizationType>('title-case')
  const [downloadArt, setDownloadArt] = useState(false)

  useEffect(() => {
    const service = getMatchingService(services)(url)
    if (service !== undefined) {
      setSelectedService(service)
    }
  }, [services, url])

  useEffect(() => {
    if (selectedService !== undefined) setShowMissingServiceError(false)
  }, [selectedService])

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault()
        if (selectedService !== undefined) {
          onSubmit(url, selectedService, {
            capitalization: capitalization,
            fillFields: fillers,
            downloadArt: downloadArt,
          } as ReleaseOptions)
        } else {
          setShowMissingServiceError(true)
        }
      }}
    >
      <div className={styles.input}>
        <input
          type='url'
          value={url}
          required
          onInput={(event) => setUrl((event.target as HTMLInputElement).value)}
        />
        <ServiceSelector
          services={services}
          selected={selectedService}
          onSelect={setSelectedService}
        />
        {showMissingServiceError && (
          <div className={styles.error}>Select an import source</div>
        )}
        {showAutoCapitalize && (
          <>
            <label htmlFor='brym-capitalize'>
              Capitalization:&nbsp;
              <select
                value={capitalization}
                onChange={(event) =>
                  setCapitalization(
                    (event.target as HTMLSelectElement)
                      .value as CapitalizationType,
                  )
                }
              >
                {CAPITALIZATION_TYPES.map((capType) => (
                  <option value={capType} key={capType}>
                    {CAPITALIZATION_TYPE_MAP[capType]}
                  </option>
                ))}
              </select>
            </label>
            <details>
              <summary className={styles.advancedButton}>
                Advanced Options
              </summary>
              <div
                id='brym-release-options'
                style='margin-top:0.5em;'
                className={styles.input}
              >
                <hr style='width:100%;margin-bottom:0.5em' />
                <label htmlFor='brym-downloadart'>
                  Download Cover Art:&nbsp;
                  <input
                    type='checkbox'
                    checked={downloadArt}
                    onChange={(event) =>
                      setDownloadArt((event.target as HTMLInputElement).checked)
                    }
                  />
                </label>
                <hr style='width:100%;margin-bottom:0.5em' />
                {Object.keys(FIELDS_MAP).map((field) => (
                  <label key={field}>
                    {FIELDS_MAP[field]}:&nbsp;
                    <input
                      id={`brym-${field}`}
                      type='checkbox'
                      checked={fillers[field]}
                      onChange={(event) =>
                        setFillers((previousState) => {
                          const checkbox = event.target as HTMLInputElement
                          const newState = previousState
                          newState[checkbox.id.slice(5)] = checkbox.checked
                          return newState
                        })
                      }
                    />
                  </label>
                ))}
              </div>
            </details>
          </>
        )}
      </div>
      <input type='submit' value={submitText} className={styles.submit} />
    </form>
  )
}

type FormProperties<S extends Service> = {
  services: S[]
  submitText: string
  onSubmit: (url: string, service: S, options: ReleaseOptions) => void
  showAutoCapitalize?: boolean
}

const FIELDS_MAP: Record<string, string> = {
  artists: 'Artists',
  type: 'Release Type',
  date: 'Release Date',
  title: 'Title',
  format: 'Issued Format',
  discSize: 'Disc Size',
  label: 'Label',
  attributes: 'Issue Attributes',
  tracks: 'Tracklist',
}

const CAPITALIZATION_TYPE_MAP: Record<CapitalizationType, string> = {
  'title-case': 'Title Case',
  'sentence-case': 'Sentence case',
  'as-is': 'Keep as-is',
}
