import { expect, it } from 'vitest'
import { MAX_UPLOAD_BYTES, validateImageFile } from './prepare-uploaded-image'

it.each([
  [{ type: 'image/jpeg', size: 1000 }, 'ok'],
  [{ type: 'image/heic', size: MAX_UPLOAD_BYTES }, 'ok'],
  [{ type: 'image/png', size: MAX_UPLOAD_BYTES + 1 }, 'too-large'],
  [{ type: 'application/pdf', size: 10 }, 'not-image'],
  [{ type: 'video/mp4', size: 10 }, 'not-image'],
  [{ type: '', size: 10 }, 'not-image'],
])('validateImageFile(%o) = %s', (file, expected) => {
  expect(validateImageFile(file)).toBe(expected)
})
