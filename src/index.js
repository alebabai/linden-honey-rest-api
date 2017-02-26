const Koa = require('koa')
const logger = require('koa-logger')
const Router = require('koa-router')
const convert = require('koa-convert')
const docs = require('koa-docs')

const db = require('./utils/db')
const docsHelper = require('./utils/docs-helper')
const config = require('./utils/config')
const constants = require('./utils/constants/path-constants')
const rootController = require('./controllers/root-controller')
const quoteController = require('./controllers/quote-controller')
const verseController = require('./controllers/verse-controller')
const songController = require('./controllers/song-controller')

const server = module.exports = new Koa()
const rootRouter = Router()
const songsRouter = Router()
const versesRouter = Router()
const quotesRouter = Router()

rootRouter.get(constants.ROOT, rootController.getRootPageHandler(config.get('app:messages:welcome')))

songsRouter.get(constants.API_SONGS, songController.getAllSongs)
songsRouter.get(constants.API_SONGS_RANDOM, songController.getRandomSong)
songsRouter.get(`${constants.API_SONGS}/:songId`, songController.getSongById)
songsRouter.get(`${constants.API_SONGS}/:songId/quotes`, songController.getQuotesFromSong)
songsRouter.get(`${constants.API_SONGS}/:songId/quotes/random`, songController.getRandomQuoteFromSong)
songsRouter.get(`${constants.API_SONGS}/:songId/verses`, songController.getVersesFromSong)
songsRouter.get(`${constants.API_SONGS}/:songId/verses/random`, songController.getRandomVerseFromSong)
songsRouter.get(`${constants.API_SONGS}/:songId/verses/:verseId/quotes/random`, songController.getRandomQuoteFromSongByVerseId)

versesRouter.get(constants.API_VERSES_RANDOM, verseController.getRandomVerse)
versesRouter.get(`${constants.API_VERSES}/:verseId`, verseController.getVerseById)
versesRouter.get(`${constants.API_VERSES}/:verseId/quotes/random`, verseController.getRandomQuoteFromVerse)

quotesRouter.get(constants.API_QUOTES_RANDOM, quoteController.getRandomQuote)
quotesRouter.get(`${constants.API_QUOTES}/:quoteId`, quoteController.getQuoteById)

server.name = config.get('app:name')
server.use(logger())
server.use(rootRouter.routes())
server.use(songsRouter.routes())
server.use(versesRouter.routes())
server.use(quotesRouter.routes())

server.use(convert(docs.get('/docs', {
    title: config.get('docs:title'),
    version: config.get('app:version'),
    theme: config.get('docs:theme'),
    routeHandlers: config.get('docs:routeHandlers'),
    groups: [
        {
            groupName: config.get('docs:groups:songs:title'),
            routes: docsHelper.getRoutes(songsRouter.stack)
        },
        {
            groupName: config.get('docs:groups:verses:title'),
            routes: docsHelper.getRoutes(versesRouter.stack)
        },
        {
            groupName: config.get('docs:groups:quotes:title'),
            routes: docsHelper.getRoutes(quotesRouter.stack)
        }
    ]
})))

server.listen(process.env.PORT || config.get('app:port') || 8080, () => {
    db.connect(config.get('db:config'))
    console.log(`${server.name} application started!`)
})
