import { render } from 'preact'
import { useCallback } from 'preact/hooks'
import { waitForElement } from '~/common/utils/dom'
import { selectShortcut } from '../utils/page-functions'
import { clsx } from '~/common/utils/clsx'
import classes from '../styles/buttons.module.css'

export default async function injectFileUnderControls() {
  const fileUnder = await waitForElement('#filed_underlist')
  const unknownArtistDiv = document.createElement('div')
  fileUnder.after(unknownArtistDiv)
  render(<UnknownArtist target='filedunder' />, unknownArtistDiv)
}

function UnknownArtist({ target }: { target: string }) {
  const handleClick = useCallback(
    () => selectShortcut('a', 250714, '[unknown artist]', target),
    [target],
  )

  return (
    <input
      type='button'
      className={clsx('btn', classes.smallButton)}
      value='+ [unknown artist]'
      onClick={handleClick}
    />
  )
}