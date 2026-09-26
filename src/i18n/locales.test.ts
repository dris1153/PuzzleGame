import { expect, it } from 'vitest'
import { interpolate } from './interpolate'
import { en } from './locales/en'
import { vi } from './locales/vi'

it('has the same keys and placeholders in every locale, none empty', () => {
  expect(Object.keys(vi).sort()).toEqual(Object.keys(en).sort())
  const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort()
  for (const key of Object.keys(en) as (keyof typeof en)[]) {
    expect(vi[key].trim(), key).not.toBe('')
    expect(placeholders(vi[key]), key).toEqual(placeholders(en[key]))
  }
})

it('interpolates named placeholders and leaves unknown ones visible', () => {
  expect(interpolate('Level {n} · {n}', { n: 3 })).toBe('Level 3 · 3')
  expect(interpolate('Time {time} · Moves {moves}', { time: '1:45', moves: 0 })).toBe('Time 1:45 · Moves 0')
  expect(interpolate('{a} and {b}', { a: 'x' })).toBe('x and {b}')
  expect(interpolate('No params')).toBe('No params')
})

it('only uses own params, never inherited properties', () => {
  expect(interpolate('{constructor} {toString}', {})).toBe('{constructor} {toString}')
  expect(interpolate('{inherited}', Object.create({ inherited: 'x' }))).toBe('{inherited}')
})
