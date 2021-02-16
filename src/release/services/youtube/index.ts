import { SearchFunction } from '..'
import { fetch } from '../../../common/utils/fetch'
import { decode } from '../../../common/utils/io-ts'
import { isDefined, isUndefined } from '../../../common/utils/types'
import { SearchObject } from './codecs'

export const search: SearchFunction = async ({ artist, title }) => {
  const response = await fetch({
    url: 'https://youtube.com/results',
    urlParams: {
      search_query: `${artist} ${title}`,
    },
  })

  const searchObjectString = [
    ...(/var ytInitialData = (.*);<\/script>/.exec(response) ?? []),
  ][1]
  if (isUndefined(searchObjectString))
    throw new Error('Could not find search metadata')

  const searchObject = decode(SearchObject)(searchObjectString)
  const videoData =
    searchObject.contents.twoColumnSearchResultsRenderer.primaryContents
      .sectionListRenderer.contents[0]?.itemSectionRenderer?.contents
  if (isUndefined(videoData)) throw new Error('Could not find video data')

  const videoId = videoData.map((video) => video.videoRenderer).find(isDefined)
    ?.videoId
  return videoId ? `https://www.youtube.com/watch?v=${videoId}` : undefined
}
