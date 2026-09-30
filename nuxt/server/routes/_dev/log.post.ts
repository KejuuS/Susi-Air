// prints browser logs in the terminal.
export default defineEventHandler(async (event) => {
  if (!import.meta.dev) {
    throw createError({ statusCode: 404 })
  }
  const { scope, message } = await readBody<{ scope: string; message: string }>(event)
  console.log(`[web:${scope}] ${message}`)
  return { ok: true }
})
