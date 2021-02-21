import * as t from 'io-ts'

export type TokenResponse = t.TypeOf<typeof TokenResponse>
export const TokenResponse = t.type(
  {
    access_token: t.string,
    expires_in: t.number,
    scope: t.string,
    token_type: t.string,
  },
  'TokenResponse'
)

const ExternalUrlObject = t.type({ spotify: t.string }, 'ExternalUrlObject')

const SimplifiedAlbumObject = t.type(
  { external_urls: ExternalUrlObject, release_date: t.string },
  'SimplifiedAlbumObject'
)

const PagingObject = <C extends t.Mixed>(item: C) =>
  t.type(
    {
      href: t.string,
      items: t.array(item),
      limit: t.Int,
      next: t.union([t.string, t.null]),
      offset: t.Int,
      previous: t.union([t.string, t.null]),
      total: t.Int,
    },
    'PagingObject'
  )

export type AlbumSearchObject = t.TypeOf<typeof AlbumSearchObject>
export const AlbumSearchObject = t.type(
  { albums: PagingObject(SimplifiedAlbumObject) },
  'AlbumSearchObject'
)

export type SimplifiedTrackObject = t.TypeOf<typeof SimplifiedTrackObject>
export const SimplifiedTrackObject = t.type(
  {
    disc_number: t.Int,
    duration_ms: t.Int,
    name: t.string,
    track_number: t.Int,
  },
  'SimplifiedTrackObject'
)

export type AlbumType = t.TypeOf<typeof AlbumType>
const AlbumType = t.union([
  t.literal('album'),
  t.literal('single'),
  t.literal('compilation'),
])

export type AlbumTracks = t.TypeOf<typeof AlbumTracks>
export const AlbumTracks = PagingObject(SimplifiedTrackObject)

export const AlbumObject = t.type(
  {
    album_type: AlbumType,
    external_urls: ExternalUrlObject,
    name: t.string,
    release_date: t.string,
    tracks: AlbumTracks,
  },
  'AlbumObject'
)

export const TrackObject = t.type(
  {
    album: SimplifiedAlbumObject,
    duration_ms: t.Int,
    external_urls: ExternalUrlObject,
    name: t.string,
  },
  'TrackObject'
)