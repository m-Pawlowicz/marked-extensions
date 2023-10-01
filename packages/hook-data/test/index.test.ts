/// <reference types="vitest/globals" />

import { Marked } from 'marked'
import markedSequentialHooks from 'marked-sequential-hooks'
import markedHookFrontmatter from 'marked-hook-frontmatter'
import markedHookData from '../src/index.js'
import posts from './fixtures/posts.json'

it('should return the original markdown when source is undefined', () => {
  const markdownHook = markedHookData()
  const result = markdownHook('foo', {}, false)
  expect(result).toEqual('foo')
})

it('should return the original markdown when source is an empty object', () => {
  const markdownHook = markedHookData({})
  const result = markdownHook('foo', {}, false)
  expect(result).toEqual('foo')
})

it('should load data from files and attach it to the context', () => {
  new Marked()
    .use(
      markedSequentialHooks({
        markdownHooks: [markedHookData('./test/fixtures/*.json')],
        htmlHooks: [
          (html, data) => {
            expect(data).toEqual({ posts })

            return html
          }
        ]
      })
    )
    .parse('foo')
})

it('should load data from files and attach it to the context asynchronously', async () => {
  await new Marked({ async: true })
    .use(
      markedSequentialHooks({
        markdownHooks: [markedHookData('./test/fixtures/*.json')],
        htmlHooks: [
          async (html, data) => {
            expect(await data.posts).toEqual(posts)

            return html
          }
        ]
      })
    )
    .parse('foo')
})

it('should load data from an object and attach it to the context', () => {
  new Marked()
    .use(
      markedSequentialHooks({
        markdownHooks: [markedHookData({ foo: 'bar', baz: true })],
        htmlHooks: [
          (html, data) => {
            expect(data).toEqual({ foo: 'bar', baz: true })

            return html
          }
        ]
      })
    )
    .parse('foo')
})

it('should handle array input types and attach them as "unknown" key', () => {
  new Marked()
    .use(
      markedSequentialHooks({
        markdownHooks: [markedHookData(['foo', 'bar'])],
        htmlHooks: [
          (html, data) => {
            expect(data).toEqual({ unknown: ['foo', 'bar'] })

            return html
          }
        ]
      })
    )
    .parse('foo')
})

it('should use datasource from matter data if provided', () => {
  new Marked()
    .use(
      markedSequentialHooks({
        markdownHooks: [markedHookFrontmatter(), markedHookData()],
        htmlHooks: [
          (html, data) => {
            ;(<Post[]>data.posts).forEach((post, i) => {
              expect(post).toEqual(posts[i])
            })

            return html
          }
        ]
      })
    )
    .parse('---\ndatasource: "./test/fixtures/posts.json"\n---\n')
})

it('should use datasource from matter data with prefix if provided', () => {
  new Marked()
    .use(
      markedSequentialHooks({
        markdownHooks: [
          markedHookFrontmatter({ dataPrefix: true }),
          markedHookData()
        ],
        htmlHooks: [
          (html, data) => {
            ;(<Post[]>data.posts).forEach((post, i) => {
              expect(post).toEqual(posts[i])
            })

            return html
          }
        ]
      })
    )
    .parse('---\ndatasource: "./test/fixtures/posts.json"\n---\n')
})

type Post = { title: string; body: string }