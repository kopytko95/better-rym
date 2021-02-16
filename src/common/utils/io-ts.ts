import { isLeft } from 'fp-ts/Either'
import { Decoder } from 'io-ts'
import { failure } from 'io-ts/PathReporter'

export const decode = <B>(decoder: Decoder<unknown, B>) => (
  data: string
): B => {
  const decoded = decoder.decode(JSON.parse(data))
  if (isLeft(decoded)) {
    const message = failure(decoded.left).join('\n')
    throw new Error(`Decoding error: ${message}`)
  } else {
    return decoded.right
  }
}
